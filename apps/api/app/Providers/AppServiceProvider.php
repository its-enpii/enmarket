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
                nextBaseUrl: (string) config('services.next.base_url', ''),
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
        //
    }
}