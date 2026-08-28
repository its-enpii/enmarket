<?php

namespace App\Services\Duitku;

/**
 * Input DTO untuk Duitku /v2/inquiry.
 * Dokumentasi: https://docs.duitku.com
 */
class CreateTransactionDto
{
    /**
     * @param  string  $paymentMethod  Payment method code (e.g. VC, QR, OVO, etc.)
     * @param  string  $merchantOrderId  Unique order ID (kode_order)
     * @param  int  $amount  Total dalam Rupiah (integer)
     * @param  string  $productDetails  Deskripsi produk
     * @param  string  $customerEmail  Email buyer
     * @param  string  $customerName  Nama buyer
     * @param  string|null  $callbackUrl  URL callback Duitku
     * @param  string|null  $returnUrl  URL redirect setelah bayar
     * @param  int  $expiryPeriod  Menit sampai transaksi expired
     */
    public function __construct(
        public readonly string $paymentMethod,
        public readonly string $merchantOrderId,
        public readonly int $amount,
        public readonly string $productDetails,
        public readonly string $customerEmail,
        public readonly string $customerName,
        public readonly ?string $callbackUrl = null,
        public readonly ?string $returnUrl = null,
        public readonly int $expiryPeriod = 60,
    ) {}

    public function toArray(): array
    {
        $body = [
            'paymentMethod' => $this->paymentMethod,
            'merchantOrderId' => $this->merchantOrderId,
            'paymentAmount' => $this->amount,
            'productDetails' => $this->productDetails,
            'email' => $this->customerEmail,
            'customerVaName' => $this->customerName,
            'expiryPeriod' => $this->expiryPeriod,
        ];

        if ($this->callbackUrl) {
            $body['callbackUrl'] = $this->callbackUrl;
        }
        if ($this->returnUrl) {
            $body['returnUrl'] = $this->returnUrl;
        }

        return $body;
    }
}
