<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\LicenseKeyController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\OrderResendController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ProductImageController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Public\CartController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\CheckoutController;
use App\Http\Controllers\Api\Public\DownloadController;
use App\Http\Controllers\Api\Public\OrderController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\TripayCallbackController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua endpoint API berada di sini. Prefix otomatis `/api` dari
| konfigurasi bootstrap/app.php. Response selalu JSON.
|
*/

// ───── Public (read-only) ─────
Route::get('/health', [HealthController::class, 'index']);

Route::prefix('public')->group(function () {
    // Catalog publik
    Route::get('products/featured', [PublicProductController::class, 'featured']);
    Route::get('products/latest', [PublicProductController::class, 'latest']);
    Route::get('products', [PublicProductController::class, 'index']);
    Route::get('products/slugs', [PublicProductController::class, 'slugs']);
    Route::get('products/{slug}', [PublicProductController::class, 'show']);

    // Kategori publik (untuk filter katalog & sitemap)
    Route::get('categories', [PublicCategoryController::class, 'index']);
    Route::get('categories/slugs', [PublicCategoryController::class, 'slugs']);
});

// ───── Cart + Checkout + Orders (public, no auth, pakai cookie) ─────
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/items', [CartController::class, 'storeItem']);
Route::patch('/cart/items/{productId}', [CartController::class, 'updateItem']);
Route::delete('/cart/items/{productId}', [CartController::class, 'destroyItem']);

Route::get('/checkout', [CheckoutController::class, 'preview']);
Route::post('/checkout', [CheckoutController::class, 'store']);

Route::get('/orders/{kodeOrder}/status', [OrderController::class, 'status']);
Route::get('/orders/{kodeOrder}/public', [OrderController::class, 'showPublic']);
Route::get('/orders/{kodeOrder}', [OrderController::class, 'show']);
Route::post('/orders/check', [OrderController::class, 'check']);

// Tripay callback (public, signature-verified)
Route::post('/tripay/callback', [TripayCallbackController::class, 'handle']);

// Public download endpoint (token-based, no auth)
Route::get('/download/{token}', [DownloadController::class, 'show'])
    ->where('token', '[a-f0-9]+');

// ───── Admin auth (login/logout publik; me butuh token) ─────
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('admin');
    Route::get('/me', [AuthController::class, 'me'])->middleware('admin');

    // Protected resource routes
    Route::middleware('admin')->group(function () {
        // Stats HARUS sebelum apiResource — kalau tidak, "stats" akan dicocokkan
        // sebagai {product} show endpoint.
        Route::get('products/stats', [ProductController::class, 'stats']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('products', ProductController::class);

        // Preview image sub-resource (append/remove)
        Route::post('products/{product}/preview-images', [ProductImageController::class, 'store']);
        Route::delete('products/{product}/preview-images', [ProductImageController::class, 'destroy']);

        // Order resend notification (manual retry email/WA)
        Route::post('orders/{kodeOrder}/resend', [OrderResendController::class, 'resend']);

        // Order regenerate token (issue token baru + extend 7 hari + re-email)
        Route::post('orders/{kodeOrder}/regenerate-token', [OrderResendController::class, 'regenerateToken']);

        // Order re-trigger delivery generation (untuk paid order yang belum ada delivery rows)
        Route::post('orders/{kodeOrder}/generate-deliveries', [OrderResendController::class, 'generateDeliveries']);

        // Order list + detail + stats — stats HARUS sebelum orders/{kodeOrder}
        // kalau tidak, "stats" akan dicocokkan sebagai kode_order.
        Route::get('orders/stats', [AdminOrderController::class, 'stats']);
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{kodeOrder}', [AdminOrderController::class, 'show']);

        // License key pool management
        Route::post('license-keys/{id}/revoke', [LicenseKeyController::class, 'revoke']);
        Route::post('license-keys/{id}/extend', [LicenseKeyController::class, 'extend']);
        Route::post('license-keys', [LicenseKeyController::class, 'store']);
        Route::get('license-keys/{id}', [LicenseKeyController::class, 'show']);
        Route::get('license-keys', [LicenseKeyController::class, 'index']);
    });
});