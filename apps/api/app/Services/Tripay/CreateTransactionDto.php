<?php

namespace App\Services\Tripay;

/**
 * Input DTO untuk Tripay /transaction/create.
 * Dokumentasi: https://tripay.co.id/developer (sandbox & production).
 */
class CreateTransactionDto
{
    /**
     * @param  string  $method  Payment method code (QRIS untuk QRIS Direct)
     * @param  string  $merchantRef  Unique reference dari merchant (kita pakai kode_order)
     * @param  int  $amount  Total dalam Rupiah (integer, no decimal)
     * @param  array<int, array{sku:string,name:string,price:int,quantity:int}>  $orderItems
     * @param  int  $expiredTime  Detik dari sekarang sampai QR expired
     * @param  string|null  $callbackUrl  URL untuk receive callback Tripay
     */
    public function __construct(
        public readonly string $method,
        public readonly string $merchantRef,
        public readonly int $amount,
        public readonly string $customerName,
        public readonly string $customerEmail,
        public readonly string $customerPhone,
        public readonly array $orderItems,
        public readonly int $expiredTime = 0,
        public readonly ?string $callbackUrl = null,
    ) {}

    /**
     * Serialize ke body JSON yang akan dikirim ke Tripay.
     * expiredTime: Unix timestamp (now + duration seconds).
     */
    public function toArray(): array
    {
        $expired = $this->expiredTime > 0 ? $this->expiredTime : (time() + 24 * 60 * 60);

        $body = [
            'method' => $this->method,
            'merchant_ref' => $this->merchantRef,
            'amount' => $this->amount,
            'customer_name' => $this->customerName,
            'customer_email' => $this->customerEmail,
            'customer_phone' => $this->customerPhone,
            'order_items' => array_map(
                fn ($i) => [
                    'sku' => $i['sku'],
                    'name' => $i['name'],
                    'price' => $i['price'],
                    'quantity' => $i['quantity'],
                ],
                $this->orderItems,
            ),
            'expired_time' => $expired,
        ];
        if ($this->callbackUrl) {
            $body['callback_url'] = $this->callbackUrl;
        }

        return $body;
    }
}
