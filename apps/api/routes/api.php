<?php

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

// ───── Health check (Fase 0) ─────
Route::get('/health', [HealthController::class, 'index']);
