<?php

namespace App\Providers;

use App\Services\Cart\CartService;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Delivery\OrderDeliveryService;
use App\Services\NextRevalidator;
use App\Services\Storage\EnStorageClient;
use App\Services\Storage\GoogleDriveEnStorage;
use App\Services\Storage\LocalMockEnStorage;
use App\Services\Tripay\TripayClient;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind EnStorageClient — pilih mock atau Google Drive sesuai env
        $this->app->singleton(EnStorageClient::class, function ($app) {
            $useMock = (bool) config('services.enstorage.mock', true);

            if ($useMock) {
                return new LocalMockEnStorage();
            }

            return new GoogleDriveEnStorage();
        });

        // Bind NextRevalidator untuk on-demand ISR revalidation webhook
        $this->app->singleton(NextRevalidator::class, function () {
            return new NextRevalidator(
                webhookSecret: (string) config('services.next.webhook_secret', ''),
                nextBaseUrl: (string) config('services.next.internal_url', ''),
            );
        });

        // Bind Tripay client (singleton — koneksi ringan, immutable config)
        $this->app->singleton(TripayClient::class, function () {
            return new TripayClient(
                apiKey: (string) config('services.tripay.api_key', ''),
                privateKey: (string) config('services.tripay.private_key', ''),
                merchantCode: (string) config('services.tripay.merchant_code', ''),
                baseUrl: (string) config('services.tripay.base_url', ''),
            );
        });

        // Bind CartService (stateless, bisa singleton)
        $this->app->singleton(CartService::class, fn () => new CartService());

        // Bind NotificationDispatcher — null webhook kalau belum dikonfigurasi = dev log mode
        $this->app->singleton(NotificationDispatcher::class, function () {
            return new NotificationDispatcher(
                n8nWebhookUrl: config('services.n8n.webhook_kirim_produk') ?: null,
            );
        });

        // Bind OrderDeliveryService (orchestrator)
        $this->app->singleton(OrderDeliveryService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();
    }

    /**
     * Define named rate limiters untuk throttle middleware.
     * Counter disimpan di cache (default file driver, OK single-container).
     */
    private function configureRateLimiters(): void
    {
        // Checkout: strict, per-IP, custom JSON response
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'message' => 'Terlalu banyak percobaan checkout. Coba lagi dalam 1 menit.',
                    'code' => 'rate_limited',
                ], 429);
            });
        });

        // Download: per-token (biar browser normal gak ke-throttle kalau IP shared)
        RateLimiter::for('download', function (Request $request) {
            $token = (string) $request->route('token');
            return Limit::perMinute(30)->by("download:{$token}");
        });

        // Cart: lenient, per-IP
        RateLimiter::for('cart', function (Request $request) {
            return Limit::perMinute(60)->by('cart:' . $request->ip());
        });

        // Order status polling: moderate, per-IP
        RateLimiter::for('order-status', function (Request $request) {
            return Limit::perMinute(10)->by('order:' . $request->ip());
        });
    }
}