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
    */

    'enstorage' => [
        'base_url' => env('ENSTORAGE_BASE_URL'),
        'api_key' => env('ENSTORAGE_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Next.js (on-demand revalidation webhook)
    |--------------------------------------------------------------------------
    */

    'next' => [
        'public_url' => env('NEXT_PUBLIC_SITE_URL'),
        'internal_url' => env('APP_NEXT_INTERNAL_URL') ?: env('NEXT_PUBLIC_SITE_URL', 'http://web:3000'),
        'webhook_secret' => env('REVALIDATE_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tripay payment gateway (Fase 3)
    |--------------------------------------------------------------------------
    */

    'tripay' => [
        'mode' => env('TRIPAY_MODE', 'sandbox'),
        'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
        'callback_url' => env('TRIPAY_CALLBACK_URL'),
        'base_url' => env('TRIPAY_MODE') === 'production'
            ? 'https://api.tripay.co.id/api'
            : 'https://tripay.co.id/api-sandbox',
    ],

    /*
    |--------------------------------------------------------------------------
    | Duitku payment gateway
    |--------------------------------------------------------------------------
    */

    'duitku' => [
        'mode' => env('DUITKU_MODE', 'sandbox'),
        'merchant_code' => env('DUITKU_MERCHANT_CODE'),
        'api_key' => env('DUITKU_API_KEY'),
        'default_method' => env('DUITKU_DEFAULT_METHOD', 'SP'),
        'expiry_period' => (int) env('DUITKU_EXPIRY_PERIOD', 1440),
        'callback_url' => env('DUITKU_CALLBACK_URL'),
        'return_url' => env('DUITKU_RETURN_URL'),
        'base_url' => env('DUITKU_MODE') === 'production'
            ? 'https://api-prod.duitku.com/api/merchant'
            : 'https://api-sandbox.duitku.com/api/merchant',
    ],

    /*
    |--------------------------------------------------------------------------
    | n8n orchestrator (Fase 4)
    |--------------------------------------------------------------------------
    */

    'duitku' => [
        'mode' => env('DUITKU_MODE', 'sandbox'),
        'merchant_code' => env('DUITKU_MERCHANT_CODE'),
        'api_key' => env('DUITKU_API_KEY'),
        'default_method' => env('DUITKU_DEFAULT_METHOD', 'SP'),
        'expiry_period' => (int) env('DUITKU_EXPIRY_PERIOD', 1440),
        'callback_url' => env('DUITKU_CALLBACK_URL'),
        'return_url' => env('DUITKU_RETURN_URL'),
        'base_url' => env('DUITKU_MODE') === 'production'
            ? 'https://api-prod.duitku.com/api/merchant'
            : 'https://api-sandbox.duitku.com/api/merchant',
    ],

    /*
    |--------------------------------------------------------------------------
    | n8n orchestrator (Fase 4)
    |--------------------------------------------------------------------------
    */

    'n8n' => [
        'webhook_kirim_produk' => env('N8N_WEBHOOK_KIRIM_PRODUK'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Evolution API (WhatsApp OTP)
    |--------------------------------------------------------------------------
    */

    'evolution' => [
        'url' => env('EVOLUTION_API_URL'),
        'api_key' => env('EVOLUTION_API_KEY'),
        'instance' => env('EVOLUTION_INSTANCE', 'enpiistudio'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Digiflazz (Game Top-up)
    |--------------------------------------------------------------------------
    */

    'digiflazz' => [
        'username' => env('DIGIFLAZZ_USERNAME', ''),
        'api_key' => env('DIGIFLAZZ_API_KEY', ''),
        'base_url' => env('DIGIFLAZZ_BASE_URL', 'https://api.digiflazz.com/v1'),
        'webhook_secret' => env('DIGIFLAZZ_WEBHOOK_SECRET', ''),
        'mode' => env('DIGIFLAZZ_MODE', 'dev'),
    ],

];
