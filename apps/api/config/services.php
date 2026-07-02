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
    | - mock=true: pakai LocalMockEnStorage (simpan di storage/app/private/)
    | - mock=false: pakai GoogleDriveEnStorage (Fase 4, butuh ENSTORAGE_BASE_URL+API_KEY)
    |
    */

    'enstorage' => [
        'mock' => (bool) env('ENSTORAGE_MOCK', true),
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
        'base_url' => env('NEXT_PUBLIC_SITE_URL', 'http://web:3000'),
        'webhook_secret' => env('REVALIDATE_SECRET'),
    ],

];
