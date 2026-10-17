<?php

namespace Tests\Feature;

use App\Services\NextRevalidator;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Lane E — path revalidation Next.js wajib berprefiks locale.
 *
 * Rute app Next berbentuk `/{locale}/...` (next-intl, localePrefix 'always'),
 * jadi mengirim '/katalog' tanpa prefiks adalah no-op di `revalidatePath`.
 */
class NextRevalidatorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        Http::fake(['*' => Http::response(['revalidated' => []], 200)]);
    }

    private function sentPaths(): array
    {
        $paths = [];

        Http::assertSent(function (Request $request) use (&$paths) {
            $paths[] = json_decode($request->body(), true)['paths'] ?? [];

            return true;
        });

        return $paths;
    }

    private function assertEveryPathHasLocalePrefix(array $paths, array $locales = ['id', 'en']): void
    {
        $this->assertNotEmpty($paths, 'Tidak ada path yang dikirim ke webhook');

        foreach ($paths as $path) {
            $this->assertMatchesRegularExpression(
                '#^/('.implode('|', array_map('preg_quote', $locales)).')(/|$)#',
                $path,
                "Path '{$path}' tidak berprefiks locale — Next.js akan mengabaikannya"
            );
        }
    }

    public function test_product_paths_are_sent_with_both_locale_prefixes_in_one_post(): void
    {
        (new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']))
            ->revalidateProduct('adobe-photoshop');

        Http::assertSentCount(1);

        $bodies = $this->sentPaths();
        $this->assertCount(1, $bodies, 'Harus satu POST berisi semua path');

        $paths = $bodies[0];

        foreach (['', '/katalog', '/develop', '/develop/adobe-photoshop'] as $suffix) {
            foreach (['id', 'en'] as $locale) {
                $expected = "/{$locale}".$suffix;
                $this->assertContains($expected, $paths, "Path {$expected} hilang dari body webhook");
            }
        }

        $this->assertCount(8, $paths);
        $this->assertEveryPathHasLocalePrefix($paths);
    }

    public function test_category_paths_use_exact_locale_prefixed_routes(): void
    {
        (new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']))
            ->revalidateCategory('tutorial');

        $paths = $this->sentPaths()[0];

        $this->assertEqualsCanonicalizing([
            '/id',
            '/en',
            '/id/katalog',
            '/en/katalog',
            '/id/c/tutorial',
            '/en/c/tutorial',
        ], $paths);
        $this->assertEveryPathHasLocalePrefix($paths);
    }

    public function test_post_paths_use_exact_locale_prefixed_routes(): void
    {
        (new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']))
            ->revalidatePost('belajar-laravel');

        $paths = $this->sentPaths()[0];

        $this->assertEqualsCanonicalizing([
            '/id',
            '/en',
            '/id/display',
            '/en/display',
            '/id/display/belajar-laravel',
            '/en/display/belajar-laravel',
        ], $paths);
        $this->assertEveryPathHasLocalePrefix($paths);
    }

    public function test_home_paths_use_exact_locale_prefixed_routes(): void
    {
        (new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']))
            ->revalidateHome();

        Http::assertSentCount(1);

        $paths = $this->sentPaths()[0];

        $this->assertEqualsCanonicalizing(['/id', '/en', '/id/katalog', '/en/katalog'], $paths);
        $this->assertEveryPathHasLocalePrefix($paths);
    }

    public function test_no_path_is_sent_without_locale_prefix(): void
    {
        $revalidator = new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']);
        $revalidator->revalidateProduct('x');
        $revalidator->revalidateCategory('y');
        $revalidator->revalidatePost('z');
        $revalidator->revalidateHome();

        $paths = array_merge(...$this->sentPaths());
        $this->assertEveryPathHasLocalePrefix($paths);

        // Regresi lama: path tanpa prefiks TIDAK BOLEH ada di body.
        foreach (['/', '/katalog', '/develop', '/display', '/c/y'] as $legacy) {
            $this->assertNotContains($legacy, $paths, "Path legacy '{$legacy}' tanpa locale terkirim");
        }
    }

    public function test_locales_come_from_config(): void
    {
        config(['services.next.locales' => ['id', 'en', 'ms']]);

        (new NextRevalidator('secret', 'https://next.example.com'))->revalidateHome();

        $paths = $this->sentPaths()[0];
        $this->assertContains('/ms', $paths);
        $this->assertContains('/ms/katalog', $paths);
        $this->assertEveryPathHasLocalePrefix($paths, ['id', 'en', 'ms']);
    }

    public function test_webhook_failure_does_not_throw(): void
    {
        Http::fake(['*' => Http::response('Error', 500)]);

        (new NextRevalidator('secret', 'https://next.example.com', ['id', 'en']))
            ->revalidateHome();

        $this->assertTrue(true, 'Kegagalan webhook tidak boleh membatalkan mutasi admin');
    }
}
