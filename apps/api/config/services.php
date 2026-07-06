<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | EnStorage (orchestrator Google Drive enpiistudio)
    |--------------------------------------------------------------------------
    |
    | Selection otomatis oleh AppServiceProvider:
    |   - ENSTORAGE_BASE_URL kosong → LocalMockEnStorage (simpan ke storage/app/private/)
    |   - ENSTORAGE_BASE_URL terisi  → RemoteEnStorage (HTTP API call ke EnStorage)
    |
    */

    'enstorage' => [
        'base_url' => env('ENSTORAGE_BASE_URL'),
        'api_key' => env('ENSTORAGE_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Next.js (on-demand revalidation webhook)
    |--------------------------------------------------------------------------
    |
    | Laravel panggil endpoint /api/revalidate di Next.js container setelah
    | admin CRUD produk/kategori. Secret diverifikasi di route handler Next.
    |
    */

    'next' => [
        // URL publik Next.js (dipakai Next.js sendiri untuk sitemap/robots/metadata)
        'public_url' => env('NEXT_PUBLIC_SITE_URL'),
        // URL internal yang dipakai Laravel untuk call webhook /api/revalidate
        // dari dalam Docker network ke container Next.js
        'internal_url' => env('APP_NEXT_INTERNAL_URL') ?: env('NEXT_PUBLIC_SITE_URL', 'http://web:3000'),
        'webhook_secret' => env('REVALIDATE_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tripay payment gateway (Fase 3)
    |--------------------------------------------------------------------------
    |
    | - mode=sandbox: pakai staging API untuk testing
    | - mode=production: pakai API live
    | - HMAC-SHA256 signature via private_key (sama untuk create + callback)
    |
    */

    'tripay' => [
        'mode' => env('TRIPAY_MODE', 'sandbox'),
        'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
        'callback_url' => env('TRIPAY_CALLBACK_URL'),
        'base_url' => env('TRIPAY_MODE') === 'production'
            ? 'https://api.tripay.co.id/api/v2'
            : 'https://tripay.co.id/api-sandbox',
    ],

    /*
    |--------------------------------------------------------------------------
    | n8n orchestrator (Fase 4)
    |--------------------------------------------------------------------------
    |
    | Laravel POST ke webhook ini setelah order paid; n8n workflow yang
    | mengirim email + WhatsApp ke pembeli. Kalau kosong, Notifier jalan di
    | dev log mode (payload di-log, sent_at timestamp auto-diisi).
    |
    */

    'n8n' => [
        'webhook_kirim_produk' => env('N8N_WEBHOOK_KIRIM_PRODUK'),
    ],

];
