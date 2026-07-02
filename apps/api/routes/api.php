<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ProductImageController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
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
    });
});