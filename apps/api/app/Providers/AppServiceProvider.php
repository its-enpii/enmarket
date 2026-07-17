<?php

namespace App\Providers;

use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Observers\ActivityLogger;
use App\Services\Cart\CartService;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Delivery\OrderDeliveryService;
use App\Services\NextRevalidator;
use App\Services\SiteSettings;
use App\Services\Storage\EnStorageClient;
use App\Services\Storage\LocalMockEnStorage;
use App\Services\Storage\RemoteEnStorage;
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
        // Bind EnStorageClient — auto-select berdasarkan ENSTORAGE_BASE_URL
        $this->app->singleton(EnStorageClient::class, function ($app) {
            $baseUrl = (string) config('services.enstorage.base_url', '');
            $apiKey = (string) config('services.enstorage.api_key', '');

            if ($baseUrl !== '') {
                return new RemoteEnStorage($baseUrl, $apiKey);
            }

            return new LocalMockEnStorage;
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
        $this->app->singleton(CartService::class, fn () => new CartService);

        // Bind NotificationDispatcher — null webhook kalau belum dikonfigurasi = dev log mode
        $this->app->singleton(NotificationDispatcher::class, function () {
            return new NotificationDispatcher(
                n8nWebhookUrl: config('services.n8n.webhook_kirim_produk') ?: null,
            );
        });

        // Bind OrderDeliveryService (orchestrator)
        $this->app->singleton(OrderDeliveryService::class);

        // Bind SiteSettings service (cached key/value accessor)
        $this->app->singleton(SiteSettings::class, fn () => new SiteSettings);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();

        // Register ActivityLogger observer untuk audit trail.
        // Append-only — semua created/updated/deleted masuk activity_logs table.
        $observer = new ActivityLogger;
        Product::observe($observer);
        Post::observe($observer);
        Order::observe($observer);
        LicenseKey::observe($observer);
        SiteSetting::observe($observer);
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
            return Limit::perMinute(60)->by('cart:'.$request->ip());
        });

        // Order status polling: moderate, per-IP
        RateLimiter::for('order-status', function (Request $request) {
            return Limit::perMinute(10)->by('order:'.$request->ip());
        });
    }
}
