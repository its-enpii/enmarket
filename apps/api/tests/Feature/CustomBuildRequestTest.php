<?php

namespace Tests\Feature;

use App\Mail\CustomBuildRequestNotification;
use App\Models\CustomRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomBuildRequestTest extends TestCase
{
    use RefreshDatabase;

    private string $adminToken = 'test-admin-token-secret';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => $this->adminToken]);
    }

    public function test_public_can_submit_custom_request_and_email_is_sent(): void
    {
        Mail::fake();

        $payload = [
            'nama' => 'Ahmad Dani',
            'email' => 'ahmad@example.com',
            'wa' => '081298765432',
            'jenis_proyek' => 'webapp',
            'deskripsi' => 'Saya butuh aplikasi dashboard analytics untuk manajemen inventori multi-gudang.',
            'budget_range' => '15-50jt',
            'timeline' => '1-3bulan',
        ];

        $response = $this->postJson('/api/custom-requests', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure(['success', 'request_id']);

        $this->assertDatabaseHas('custom_requests', [
            'email' => 'ahmad@example.com',
            'jenis_proyek' => 'webapp',
            'status' => 'baru',
        ]);

        Mail::assertSent(CustomBuildRequestNotification::class, function ($mail) {
            return $mail->customRequest->email === 'ahmad@example.com';
        });
    }

    public function test_validation_rejects_invalid_custom_request(): void
    {
        $response = $this->postJson('/api/custom-requests', [
            'nama' => '',
            'email' => 'bukan-email',
            'wa' => 'abc',
            'jenis_proyek' => 'invalid-type',
            'deskripsi' => 'pendek',
            'budget_range' => 'invalid-budget',
            'timeline' => 'invalid-timeline',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nama', 'email', 'wa', 'jenis_proyek', 'deskripsi', 'budget_range', 'timeline']);
    }

    public function test_admin_can_list_filter_detail_and_update_custom_request(): void
    {
        $req1 = CustomRequest::create([
            'nama' => 'Buyer Satu',
            'email' => 'buyer1@example.com',
            'wa' => '0811111111',
            'jenis_proyek' => 'website',
            'deskripsi' => 'Website portofolio company profile dengan CMS.',
            'budget_range' => '5-15jt',
            'timeline' => '2-4minggu',
            'status' => 'baru',
        ]);

        $req2 = CustomRequest::create([
            'nama' => 'Buyer Dua',
            'email' => 'buyer2@example.com',
            'wa' => '0822222222',
            'jenis_proyek' => 'mobile-app',
            'deskripsi' => 'Aplikasi Flutter Android dan iOS untuk booking jasa.',
            'budget_range' => '50jt+',
            'timeline' => '3-6bulan',
            'status' => 'diproses',
        ]);

        // 1. Stats
        $statsRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/admin/custom-requests/stats');

        $statsRes->assertStatus(200)
            ->assertJsonPath('data.total', 2)
            ->assertJsonPath('data.baru', 1)
            ->assertJsonPath('data.diproses', 1);

        // 2. Filter list
        $listRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/admin/custom-requests?status=diproses');

        $listRes->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $req2->id);

        // 3. Detail
        $detailRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson("/api/admin/custom-requests/{$req1->id}");

        $detailRes->assertStatus(200)
            ->assertJsonPath('data.nama', 'Buyer Satu')
            ->assertJsonPath('data.status_label', 'Baru');

        // 4. Update status & notes
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->patchJson("/api/admin/custom-requests/{$req1->id}", [
                'status' => 'diproses',
                'notes' => 'Sudah dikontak via WA pada tanggal 26 Agustus.',
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.status', 'diproses')
            ->assertJsonPath('data.notes', 'Sudah dikontak via WA pada tanggal 26 Agustus.');
    }
}
