<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\WhatsappOtp;
use App\Models\Wishlist;
use App\Services\Auth\WhatsappOtpService;
use App\Services\Auth\WhatsappSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    private string $testPhone = '08123456789';

    protected function setUp(): void
    {
        parent::setUp();

        // Fake WhatsApp sender agar tidak melakukan network call saat testing
        $this->app->bind(WhatsappSender::class, function () {
            return new class extends WhatsappSender {
                public array $sent = [];

                public function sendOtp(string $phone, string $code): bool
                {
                    $this->sent[] = ['phone' => $phone, 'code' => $code];
                    return true;
                }
            };
        });
    }

    public function test_request_otp_validates_phone_format(): void
    {
        // 1. Phone kosong
        $res = $this->postJson('/api/customer/auth/request-otp', []);
        $res->assertStatus(422);
        $res->assertJsonValidationErrors(['phone']);

        // 2. Phone terlalu pendek / bukan angka
        $res = $this->postJson('/api/customer/auth/request-otp', ['phone' => '123']);
        $res->assertStatus(422);
        $res->assertJsonValidationErrors(['phone']);

        $res = $this->postJson('/api/customer/auth/request-otp', ['phone' => 'abcde123']);
        $res->assertStatus(422);
        $res->assertJsonValidationErrors(['phone']);

        // 3. Valid phone
        $res = $this->postJson('/api/customer/auth/request-otp', ['phone' => $this->testPhone]);
        $res->assertOk();
        $res->assertJson(['success' => true]);
        $res->assertJsonStructure(['success', 'cooldown_seconds', 'message']);
    }

    public function test_request_otp_throttles_per_phone(): void
    {
        // Request 3x berturut-turut sukses
        for ($i = 1; $i <= 3; $i++) {
            $res = $this->postJson('/api/customer/auth/request-otp', ['phone' => $this->testPhone]);
            $res->assertOk();
            $res->assertJson(['success' => true]);
        }

        // Request ke-4 dalam window 10 menit harus 429
        $res = $this->postJson('/api/customer/auth/request-otp', ['phone' => $this->testPhone]);
        $res->assertStatus(429);
        $res->assertJson(['success' => false]);
        $this->assertGreaterThan(0, $res->json('cooldown_seconds'));
    }

    public function test_verify_otp_creates_user_if_not_exists(): void
    {
        // Setup OTP
        $code = '123456';
        WhatsappOtp::create([
            'phone' => WhatsappOtpService::normalizePhone($this->testPhone),
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $res = $this->postJson('/api/customer/auth/verify-otp', [
            'phone' => $this->testPhone,
            'code' => $code,
            'name' => 'Budi Santoso',
        ]);

        $res->assertOk();
        $res->assertJson(['success' => true]);
        $res->assertJsonStructure([
            'success',
            'message',
            'token',
            'user' => ['id', 'name', 'phone', 'is_admin', 'phone_verified_at'],
        ]);

        $this->assertEquals('Budi Santoso', $res->json('user.name'));
        $this->assertFalse($res->json('user.is_admin'));
        $this->assertNotNull($res->json('token'));

        $this->assertDatabaseHas('users', [
            'phone' => WhatsappOtpService::normalizePhone($this->testPhone),
            'name' => 'Budi Santoso',
            'is_admin' => false,
        ]);
    }

    public function test_verify_otp_returns_existing_user(): void
    {
        $normalized = WhatsappOtpService::normalizePhone($this->testPhone);
        $existingUser = User::create([
            'name' => 'Pelanggan Lama',
            'phone' => $normalized,
            'phone_verified_at' => now()->subDays(10),
        ]);

        $code = '654321';
        WhatsappOtp::create([
            'phone' => $normalized,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $res = $this->postJson('/api/customer/auth/verify-otp', [
            'phone' => $this->testPhone,
            'code' => $code,
        ]);

        $res->assertOk();
        $this->assertEquals($existingUser->id, $res->json('user.id'));
        $this->assertEquals('Pelanggan Lama', $res->json('user.name'));

        // Pastikan tidak ada duplikasi record user
        $this->assertEquals(1, User::where('phone', $normalized)->count());
    }

    public function test_verify_otp_rejects_wrong_code(): void
    {
        $normalized = WhatsappOtpService::normalizePhone($this->testPhone);
        $code = '112233';
        $otp = WhatsappOtp::create([
            'phone' => $normalized,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $res = $this->postJson('/api/customer/auth/verify-otp', [
            'phone' => $this->testPhone,
            'code' => '999999', // wrong code
        ]);

        $res->assertStatus(422);
        $res->assertJson(['success' => false]);
        $this->assertEquals(1, $otp->fresh()->attempts);
    }

    public function test_verify_otp_rejects_expired_code(): void
    {
        $normalized = WhatsappOtpService::normalizePhone($this->testPhone);
        $code = '112233';
        WhatsappOtp::create([
            'phone' => $normalized,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->subMinutes(10), // expired
            'attempts' => 0,
        ]);

        $res = $this->postJson('/api/customer/auth/verify-otp', [
            'phone' => $this->testPhone,
            'code' => $code,
        ]);

        $res->assertStatus(422);
        $res->assertJson(['success' => false]);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'phone' => '08123456789',
        ]);

        $token = $user->createToken('customer_auth')->plainTextToken;

        $res = $this->postJson('/api/customer/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJson(['success' => true]);

        // Token harus sudah dihapus dari personal_access_tokens
        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_me_returns_current_user(): void
    {
        $user = User::create([
            'name' => 'Budi Customer',
            'phone' => '08123456789',
            'phone_verified_at' => now(),
        ]);

        $token = $user->createToken('customer_auth')->plainTextToken;

        $res = $this->getJson('/api/customer/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJson([
            'user' => [
                'id' => $user->id,
                'name' => 'Budi Customer',
                'phone' => '08123456789',
            ],
        ]);
    }

    public function test_update_profile_changes_name_phone(): void
    {
        $user = User::create([
            'name' => 'Old Name',
            'phone' => '08123456789',
            'email' => 'old@example.com',
        ]);

        $token = $user->createToken('customer_auth')->plainTextToken;

        $res = $this->putJson('/api/customer/auth/profile', [
            'name' => 'New Name',
            'email' => 'new@example.com',
            'phone' => '08987654321',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $res->assertJson(['success' => true]);
        $this->assertEquals('New Name', $res->json('user.name'));
        $this->assertEquals('new@example.com', $res->json('user.email'));
        $this->assertEquals('08987654321', $res->json('user.phone'));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'phone' => '08987654321',
            'email' => 'new@example.com',
        ]);
    }

    public function test_guest_order_then_login_links_to_user(): void
    {
        $category = Category::create(['nama' => 'Tools', 'slug' => 'tools']);
        $product = Product::create([
            'category_id' => $category->id,
            'nama' => 'Template Kit', 'deskripsi' => 'Deskripsi template',
            'slug' => 'template-kit',
            'harga' => 150000,
            'tipe' => 'download',
            'status' => 'aktif',
        ]);

        $sessionId = 'session-guest-xyz123';
        $wishlistSessionId = 'wishlist-guest-xyz123';

        // 1. Guest creates cart item
        $cart = Cart::create(['session_id' => $sessionId, 'expires_at' => now()->addDay()]);
        $cart->items()->create(['product_id' => $product->id, 'qty' => 2]);

        // 2. Guest adds to wishlist
        $wishlist = Wishlist::create([
            'session_id' => $wishlistSessionId,
            'product_id' => $product->id,
        ]);

        // 3. Guest creates order with phone
        $order = Order::create([
            'kode_order' => 'EPS-20260826-ABC12',
            'nama_pembeli' => 'Guest Pembeli',
            'email_pembeli' => 'guest@example.com',
            'wa_pembeli' => $this->testPhone,
            'total_harga' => 300000,
            'status' => 'pending',
            'user_id' => null,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'nama_produk' => $product->nama,
            'harga_saat_beli' => $product->harga,
            'tipe_produk' => $product->tipe,
        ]);

        // 4. Request OTP and verify OTP with session IDs
        $code = '888999';
        WhatsappOtp::create([
            'phone' => WhatsappOtpService::normalizePhone($this->testPhone),
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $res = $this->postJson('/api/customer/auth/verify-otp', [
            'phone' => $this->testPhone,
            'code' => $code,
            'session_id' => $sessionId,
            'wishlist_session' => $wishlistSessionId,
        ]);

        $res->assertOk();
        $userId = $res->json('user.id');

        // Verifikasi Order ter-link ke user_id
        $this->assertEquals($userId, $order->fresh()->user_id);

        // Verifikasi Wishlist ter-link ke user_id
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $userId,
            'product_id' => $product->id,
        ]);

        // Verifikasi Cart ter-link ke user_id
        $this->assertDatabaseHas('carts', [
            'user_id' => $userId,
        ]);
    }

    public function test_code_hash_is_stored_not_plain_code(): void
    {
        $this->postJson('/api/customer/auth/request-otp', ['phone' => $this->testPhone]);

        $otp = WhatsappOtp::where('phone', WhatsappOtpService::normalizePhone($this->testPhone))->first();
        $this->assertNotNull($otp);
        $this->assertNotEquals(6, strlen($otp->code_hash));
        $this->assertTrue(str_starts_with($otp->code_hash, '$2y$'));
    }

    public function test_customer_orders_endpoint_returns_user_orders(): void
    {
        $user = User::create([
            'name' => 'Order Tester',
            'phone' => '08123456789',
        ]);

        $category = Category::create(['nama' => 'Tools', 'slug' => 'tools-2']);
        $product = Product::create([
            'category_id' => $category->id,
            'nama' => 'Icon Pack', 'deskripsi' => 'Deskripsi icon pack',
            'slug' => 'icon-pack',
            'harga' => 50000,
            'tipe' => 'download',
            'status' => 'aktif',
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'kode_order' => 'EPS-20260826-ORDR1',
            'nama_pembeli' => 'Order Tester',
            'email_pembeli' => 'tester@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 50000,
            'status' => 'paid',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'nama_produk' => $product->nama,
            'harga_saat_beli' => $product->harga,
            'tipe_produk' => $product->tipe,
        ]);

        $token = $user->createToken('customer_auth')->plainTextToken;

        $res = $this->getJson('/api/customer/orders', [
            'Authorization' => "Bearer {$token}",
        ]);

        $res->assertOk();
        $this->assertCount(1, $res->json('data'));
        $this->assertEquals('EPS-20260826-ORDR1', $res->json('data.0.kode_order'));
    }
}
