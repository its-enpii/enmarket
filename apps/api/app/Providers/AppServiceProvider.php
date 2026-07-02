<?php

namespace App\Providers;

use App\Services\Storage\EnStorageClient;
use App\Services\Storage\GoogleDriveEnStorage;
use App\Services\Storage\LocalMockEnStorage;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}