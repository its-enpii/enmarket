<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ProductImageController;
use App\Http\Controllers\Api\HealthController;
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

// ───── Public ─────
Route::get('/health', [HealthController::class, 'index']);

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