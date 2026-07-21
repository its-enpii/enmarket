<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Services\NextRevalidator;
use App\Services\Storage\EnStorageClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PostAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    public array $revalidatedPaths = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);

        $this->app->bind(EnStorageClient::class, fn () => new class implements EnStorageClient
        {
            public function upload(UploadedFile $file, string $destinationPath): string
            {
                return 'enstorage/'.$destinationPath;
            }

            public function delete(string $path): bool
            {
                return true;
            }

            public function exists(string $path): bool
            {
                return true;
            }

            public function url(string $path): string
            {
                return '/storage/'.$path;
            }
        });

        $this->app->bind(NextRevalidator::class, fn () => new class($this->revalidatedPaths) extends NextRevalidator
        {
            public function __construct(public array &$paths) {}

            public function revalidateProduct(string $slug): void { $this->paths[] = "product:$slug"; }
            public function revalidateHome(): void { $this->paths[] = 'home'; }
            public function revalidateCategory(string $slug): void { $this->paths[] = "category:$slug"; }
            public function revalidatePost(string $slug): void { $this->paths[] = "post:$slug"; }
        });
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    public function test_index_filters_by_status(): void
    {
        Post::create(['title' => 'P', 'slug' => 'p', 'content' => '<p>x</p>', 'status' => 'published']);
        Post::create(['title' => 'D', 'slug' => 'd', 'content' => '<p>x</p>', 'status' => 'draft']);

        $response = $this->getJson('/api/admin/posts?status=published', $this->authHeaders());
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_index_search_by_title_or_slug(): void
    {
        Post::create(['title' => 'Laravel Tips', 'slug' => 'laravel-tips', 'content' => '<p>x</p>', 'status' => 'draft']);
        Post::create(['title' => 'Vue Tips', 'slug' => 'vue-tips', 'content' => '<p>x</p>', 'status' => 'draft']);

        $r1 = $this->getJson('/api/admin/posts?q=Laravel', $this->authHeaders());
        $this->assertEquals(1, $r1->json('meta.total'));

        $r2 = $this->getJson('/api/admin/posts?q=vue', $this->authHeaders());
        $this->assertEquals(1, $r2->json('meta.total'));
    }

    public function test_stats_returns_count_per_status(): void
    {
        Post::create(['title' => 'P1', 'slug' => 'p1', 'content' => 'x', 'status' => 'published']);
        Post::create(['title' => 'P2', 'slug' => 'p2', 'content' => 'x', 'status' => 'published']);
        Post::create(['title' => 'D1', 'slug' => 'd1', 'content' => 'x', 'status' => 'draft']);

        $response = $this->getJson('/api/admin/posts/stats', $this->authHeaders());

        $this->assertEquals(3, $response->json('data.total'));
        $this->assertEquals(2, $response->json('data.published'));
        $this->assertEquals(1, $response->json('data.draft'));
        $this->assertEquals(0, $response->json('data.archived'));
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->postJson('/api/admin/posts', [], $this->authHeaders());
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'content', 'status']);
    }

    public function test_store_creates_post_draft_without_revalidate(): void
    {
        $response = $this->postJson('/api/admin/posts', [
            'title' => 'My Post',
            'content' => '<p>body</p>',
            'status' => 'draft',
        ], $this->authHeaders());

        $response->assertStatus(201);
        $this->assertEquals('my-post', Post::find($response->json('data.id'))->slug);
        // Draft tidak boleh trigger revalidate
        $this->assertEmpty(array_filter($this->revalidatedPaths, fn ($p) => str_starts_with($p, 'post:')));
    }

    public function test_store_published_auto_sets_published_at_to_now(): void
    {
        $response = $this->postJson('/api/admin/posts', [
            'title' => 'Auto Publish',
            'content' => '<p>x</p>',
            'status' => 'published',
        ], $this->authHeaders());

        $response->assertStatus(201);
        $post = Post::find($response->json('data.id'));
        $this->assertNotNull($post->published_at);
        // Selisih max 5 detik dengan now (test env timing)
        $this->assertLessThanOrEqual(5, abs($post->published_at->diffInSeconds(now())));
        $this->assertContains('post:auto-publish', $this->revalidatedPaths);
    }

    public function test_store_with_thumbnail_upload(): void
    {
        // Pakai raw JPEG bytes minimal yang valid — GD library tidak ada di container.
        // JPEG signature: FF D8 FF E0 + minimal data + FF D9 EOF marker.
        $jpegBytes = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xD9";
        $tempPath = tempnam(sys_get_temp_dir(), 'jpg_');
        file_put_contents($tempPath, $jpegBytes);
        $file = new UploadedFile($tempPath, 'thumb.jpg', 'image/jpeg', null, true);

        $response = $this->postJson('/api/admin/posts', [
            'title' => 'With Thumb',
            'content' => '<p>x</p>',
            'status' => 'draft',
            'thumbnail' => $file,
        ], $this->authHeaders());

        @unlink($tempPath);
        $response->assertStatus(201);
        $post = Post::find($response->json('data.id'));
        $this->assertStringStartsWith('enstorage/posts/thumbnails/', $post->thumbnail);
    }

    public function test_update_with_remove_thumbnail_deletes(): void
    {
        $post = Post::create([
            'title' => 'Test', 'slug' => 'test-'.uniqid(), 'content' => 'x',
            'status' => 'draft', 'thumbnail' => 'enstorage/posts/old.jpg',
        ]);

        $response = $this->putJson('/api/admin/posts/'.$post->id, [
            'title' => 'Test',
            'content' => 'x',
            'status' => 'draft',
            'remove_thumbnail' => true,
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertNull($post->fresh()->thumbnail);
    }

    public function test_update_slug_change_triggers_revalidate_old_and_new_slug(): void
    {
        $post = Post::create([
            'title' => 'Old Title', 'slug' => 'old-slug', 'content' => 'x', 'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $response = $this->putJson('/api/admin/posts/'.$post->id, [
            'title' => 'New Title',
            'slug' => 'new-slug',
            'content' => 'x',
            'status' => 'published',
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertContains('post:new-slug', $this->revalidatedPaths);
        $this->assertContains('post:old-slug', $this->revalidatedPaths);
    }

    public function test_destroy_published_revalidates(): void
    {
        $post = Post::create([
            'title' => 'X', 'slug' => 'x-'.uniqid(), 'content' => 'x',
            'status' => 'published', 'published_at' => now()->subDay(),
        ]);

        $response = $this->deleteJson('/api/admin/posts/'.$post->id, [], $this->authHeaders());

        $response->assertOk();
        $this->assertNull(Post::find($post->id));
        $this->assertContains('post:'.$post->slug, $this->revalidatedPaths);
    }

    public function test_destroy_draft_skips_revalidate(): void
    {
        $post = Post::create([
            'title' => 'X', 'slug' => 'x-'.uniqid(), 'content' => 'x', 'status' => 'draft',
        ]);

        $response = $this->deleteJson('/api/admin/posts/'.$post->id, [], $this->authHeaders());

        $response->assertOk();
        $this->assertEmpty(array_filter($this->revalidatedPaths, fn ($p) => str_starts_with($p, 'post:')));
    }
}