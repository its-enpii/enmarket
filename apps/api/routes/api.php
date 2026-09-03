<?php

use App\Http\Controllers\Api\Admin\AccountProvisioningController;
use App\Http\Controllers\Api\Admin\ActivityController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\CouponController;
use App\Http\Controllers\Api\Admin\CustomRequestController as AdminCustomRequestController;
use App\Http\Controllers\Api\Admin\LicenseKeyController;
use App\Http\Controllers\Api\Admin\MaintenanceController;
use App\Http\Controllers\Api\Admin\NavMenuController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\OrderResendController;
use App\Http\Controllers\Api\Admin\PostController as AdminPostController;
use App\Http\Controllers\Api\Admin\PreorderController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\ProductImageController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\SponsorController as AdminSponsorController;

use App\Http\Controllers\Api\Customer\Auth\LoginController as CustomerLoginController;
use App\Http\Controllers\Api\Customer\Auth\LogoutController as CustomerLogoutController;
use App\Http\Controllers\Api\Customer\Auth\MeController as CustomerMeController;
use App\Http\Controllers\Api\Customer\Auth\ProfileController as CustomerProfileController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\Customer\WishlistController as CustomerWishlistController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Public\CartController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\CheckoutController;
use App\Http\Controllers\Api\Public\CustomRequestController;
use App\Http\Controllers\Api\Public\DigiflazzWebhookController;
use App\Http\Controllers\Api\Public\DownloadController;
use App\Http\Controllers\Api\Public\OrderController;
use App\Http\Controllers\Api\Public\PostController as PublicPostController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\ReviewController as PublicReviewController;
use App\Http\Controllers\Api\Public\SiteConfigController;
use App\Http\Controllers\Api\Public\TripayCallbackController;
use App\Http\Controllers\Api\Public\WishlistController;
use App\Http\Controllers\Api\Public\DuitkuCallbackController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\GameController as AdminGameController;
use App\Http\Controllers\Api\Admin\GameItemController as AdminGameItemController;
use App\Http\Controllers\Api\Customer\TopupHistoryController;
use App\Http\Controllers\Api\Public\TopupController;

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
    // HARUS sebelum products/{slug} — kalau tidak, 'homepage' ke-capture jadi slug.
    Route::get('products/homepage', [PublicProductController::class, 'homepage']);
    Route::get('products', [PublicProductController::class, 'index']);
    Route::get('products/slugs', [PublicProductController::class, 'slugs']);
    Route::get('products/{slug}', [PublicProductController::class, 'show']);
    Route::get('products/{slug}/reviews', [PublicReviewController::class, 'index']);

    // Kategori publik (untuk filter katalog & sitemap)
    Route::get('categories', [PublicCategoryController::class, 'index']);
    Route::get('categories/slugs', [PublicCategoryController::class, 'slugs']);

    // Blog post publik — published only
    Route::get('posts/latest', [PublicPostController::class, 'latest']);
    Route::get('posts', [PublicPostController::class, 'index']);
    Route::get('posts/slugs', [PublicPostController::class, 'slugs']);
    Route::get('posts/{slug}', [PublicPostController::class, 'show']);

    // Public site config (identity + social + footer). Payment secrets
    // TIDAK di-expose di sini — hanya SiteSettings::all() yg masuk public.
    Route::get('site-config', [SiteConfigController::class, 'show']);

    // Top-up game (Digiflazz)
    Route::get('topup/games', [TopupController::class, 'games']);
    Route::get('topup/games/{slug}', [TopupController::class, 'show']);
    Route::post('topup/preview', [TopupController::class, 'preview'])->middleware('throttle:cart');
    Route::post('topup/checkout', [TopupController::class, 'checkout'])->middleware('throttle:checkout');
});

// ───── Customer Auth & Account ─────
Route::prefix('customer')->group(function () {
    // Public OTP Auth
    Route::post('auth/request-otp', [CustomerLoginController::class, 'requestOtp']);
    Route::post('auth/verify-otp', [CustomerLoginController::class, 'verifyOtp']);

    // Protected Customer Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [CustomerLogoutController::class, 'logout']);
        Route::get('auth/me', [CustomerMeController::class, 'me']);
        Route::put('auth/profile', [CustomerProfileController::class, 'update']);

        Route::get('orders', [CustomerOrderController::class, 'index']);

        Route::get('wishlist', [CustomerWishlistController::class, 'index']);
        Route::post('wishlist/toggle', [CustomerWishlistController::class, 'toggle']);
        Route::delete('wishlist/{productId}', [CustomerWishlistController::class, 'destroy']);

        Route::get('topups', [TopupHistoryController::class, 'index']);
    });
});

// ───── Wishlist (public, no auth, pakai cookie) ─────
Route::get('/wishlist', [WishlistController::class, 'index']);
Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);

// ───── Custom Request (public, no auth) ─────
Route::post('/custom-requests', [CustomRequestController::class, 'store']);

// ????? Reviews (public / order-verified) ?????
Route::post('/reviews', [PublicReviewController::class, 'store']);
Route::get('/orders/{kodeOrder}/reviews', [PublicReviewController::class, 'byOrder']);

// ───── Cart + Checkout + Orders (public, no auth, pakai cookie) ─────
Route::middleware('throttle:cart')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'storeItem']);
    Route::patch('/cart/items/{productId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{productId}', [CartController::class, 'destroyItem']);
});

Route::get('/checkout', [CheckoutController::class, 'preview']); // preview low-risk, no throttle
Route::post('/checkout/apply-coupon', [CheckoutController::class, 'applyCoupon']);
Route::post('/checkout', [CheckoutController::class, 'store'])
    ->middleware('throttle:checkout');

Route::middleware('throttle:order-status')->group(function () {
    Route::get('/orders/{kodeOrder}/status', [OrderController::class, 'status']);
    Route::post('/orders/check', [OrderController::class, 'check']);
});

Route::get('/orders/{kodeOrder}/public', [OrderController::class, 'showPublic']);
Route::get('/orders/{kodeOrder}', [OrderController::class, 'show']);

// Tripay callback (public, signature-verified — no throttle; signature
// verification itself prevents abuse. Kalau production butuh, tambah IP allowlist.)
Route::post('/tripay/callback', [TripayCallbackController::class, 'handle']);

// Duitku callback (public, signature-verified)
Route::post('/duitku/callback', [DuitkuCallbackController::class, 'handle']);

// Digiflazz webhook (public, HMAC-SHA256 signature-verified via DIGIFLAZZ_WEBHOOK_SECRET).
// Digiflazz mengirim status update async (queue → success/gagal) setelah initial topup.
Route::post('/digiflazz/webhook', [DigiflazzWebhookController::class, 'handle']);

// Public download endpoint (token-based, no auth, throttled per token)
Route::get('/download/{token}', [DownloadController::class, 'show'])
    ->where('token', '[a-f0-9]+')
    ->middleware('throttle:download');

// ───── Admin area (protected via VerifyAdminToken) ─────
Route::prefix('admin')->group(function () {
    // Auth admin: login (publik), logout & me (auth)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('admin');
    Route::get('/me', [AuthController::class, 'me'])->middleware('admin');

    // Protected resource routes
    Route::middleware('admin')->group(function () {
        // Stats HARUS sebelum apiResource — kalau tidak, "stats" akan dicocokkan
        // sebagai {product} show endpoint.
        Route::get('products/stats', [ProductController::class, 'stats']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('nav-menus', NavMenuController::class)->only(['index', 'update']);
        Route::apiResource('products', ProductController::class);

        // Preview image sub-resource (append/remove)
        Route::post('products/{product}/preview-images', [ProductImageController::class, 'store']);
        Route::delete('products/{product}/preview-images', [ProductImageController::class, 'destroy']);

        // Coupons CRUD (stats HARUS sebelum coupons/{coupon})
        Route::get('coupons/stats', [CouponController::class, 'stats']);
        Route::apiResource('coupons', CouponController::class);

        // Custom Requests (stats HARUS sebelum {customRequest})
        Route::get('custom-requests/stats', [AdminCustomRequestController::class, 'stats']);
        Route::apiResource('custom-requests', AdminCustomRequestController::class)->only(['index', 'show', 'update']);

        // Order resend notification (manual retry email/WA)
        Route::post('orders/{kodeOrder}/resend', [OrderResendController::class, 'resend']);

        // Order regenerate token (issue token baru + extend 7 hari + re-email)
        Route::post('orders/{kodeOrder}/regenerate-token', [OrderResendController::class, 'regenerateToken']);

        // Order re-trigger delivery generation (untuk paid order yang belum ada delivery rows)
        Route::post('orders/{kodeOrder}/generate-deliveries', [OrderResendController::class, 'generateDeliveries']);

        // Blog post admin CRUD (stats HARUS sebelum {post})
        Route::get('posts/stats', [AdminPostController::class, 'stats']);
        Route::apiResource('posts', AdminPostController::class);

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

        // Account provisioning queue (manual activation flow)
        // stats HARUS sebelum {id} — kalau tidak, "stats" dicocokkan sebagai id.
        Route::get('account-provisionings/stats', [AccountProvisioningController::class, 'stats']);
        Route::post('account-provisionings/{id}/mark-ready', [AccountProvisioningController::class, 'markReady'])
            ->whereNumber('id');
        Route::post('account-provisionings/{id}/regenerate', [AccountProvisioningController::class, 'regenerate'])
            ->whereNumber('id');
        Route::post('account-provisionings/{id}/resend', [AccountProvisioningController::class, 'resend'])
            ->whereNumber('id');
        Route::get('account-provisionings/{id}', [AccountProvisioningController::class, 'show'])
            ->whereNumber('id');
        Route::get('account-provisionings', [AccountProvisioningController::class, 'index']);

        // Pre-order release queue (manual release trigger by admin).
        // Pakai {order} sebagai kode_order (string, format EPS-YYYYMMDD-XXXXX) supaya
        // bisa release langsung dari URL `/admin/orders/{kodeOrder}` pattern.
        // stats HARUS sebelum show route untuk konsistensi.
        Route::get('preorders/stats', [PreorderController::class, 'stats']);
        Route::post('preorders/{order}/release-now', [PreorderController::class, 'releaseNow']);
        Route::post('preorders/{order}/update-release-date', [PreorderController::class, 'updateReleaseDate']);
        Route::get('preorders/{order}', [PreorderController::class, 'show']);
        Route::get('preorders', [PreorderController::class, 'index']);

                // Sponsors management
        Route::post("sponsors/fetch-metadata", [AdminSponsorController::class, "fetchMetadata"]);
        Route::apiResource("sponsors", AdminSponsorController::class);

        // Customer Reviews Moderation (stats HARUS sebelum apiResource)
        Route::get('reviews/stats', [AdminReviewController::class, 'stats']);
        Route::apiResource('reviews', AdminReviewController::class)->only(['index', 'update', 'destroy']);

        // Site settings (identity, social, footer, payment, channels)
        Route::get('settings', [SettingsController::class, 'index']);
        Route::patch('settings', [SettingsController::class, 'update']);
        Route::post('settings/logo', [SettingsController::class, 'uploadLogo']);

        // Maintenance mode toggle
        Route::get('maintenance/status', [MaintenanceController::class, 'status']);
        Route::post('maintenance/toggle', [MaintenanceController::class, 'toggle']);

        // Recent activity log
        Route::get('activity', [ActivityController::class, 'index']);

        // Game top-up admin CRUD
        Route::apiResource('games', AdminGameController::class);
        Route::apiResource('games.items', AdminGameItemController::class)->shallow();
    });
});
