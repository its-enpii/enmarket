<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice {{ $order->kode_order }}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; padding: 32px 24px; text-align: center; }
.header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; }
.header p { margin: 0; opacity: .85; font-size: 14px; }
.content { padding: 24px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.badge-paid { background: #dcfce7; color: #166534; }
.badge-preorder { background: #dbeafe; color: #1e40af; }
.badge-account { background: #fef3c7; color: #92400e; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
.info-label { color: #71717a; }
.section-title { font-size: 16px; font-weight: 600; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #ede9fe; }
.product-card { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.product-name { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
.product-detail { font-size: 13px; color: #52525b; margin: 4px 0; }
.product-detail code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.btn { display: inline-block; background: #7c3aed; color: #fff !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 8px; }
.credential-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
.credential-table td { padding: 6px 8px; font-size: 13px; border-bottom: 1px solid #f4f4f5; }
.credential-table td:first-child { color: #71717a; width: 40%; }
.credential-table td:last-child { font-weight: 500; }
.footer { background: #f4f4f5; padding: 20px 24px; text-align: center; font-size: 12px; color: #a1a1aa; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        @if($eventType === 'order_paid')
            <h1>Pembayaran Dikonfirmasi ✅</h1>
            <p>Terima kasih! Produk Anda siap diunduh.</p>
        @elseif($eventType === 'preorder_ready')
            <h1>Pre-order Sudah Rilis! 🎉</h1>
            <p>Produk pre-order Anda sudah tersedia untuk diunduh.</p>
        @elseif($eventType === 'account_ready')
            <h1>Akun Anda Siap! 🔐</h1>
            <p>Akun telah diaktifkan dan siap digunakan.</p>
        @endif
    </div>

    <div class="content">
        <div style="margin-bottom: 20px;">
            @if($eventType === 'order_paid')
                <span class="badge badge-paid">Lunas</span>
            @elseif($eventType === 'preorder_ready')
                <span class="badge badge-preorder">Pre-order Rilis</span>
            @elseif($eventType === 'account_ready')
                <span class="badge badge-account">Akun Siap</span>
            @endif
        </div>

        <div class="info-row">
            <span class="info-label">Nomor Pesanan</span>
            <strong>{{ $order->kode_order }}</strong>
        </div>
        <div class="info-row">
            <span class="info-label">Nama</span>
            <span>{{ $order->nama_pembeli }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email</span>
            <span>{{ $order->email_pembeli }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total</span>
            <strong>Rp {{ number_format((int)$order->total_harga, 0, ',', '.') }}</strong>
        </div>
        @if($order->paid_at)
        <div class="info-row" style="border-bottom:none;">
            <span class="info-label">Tanggal Bayar</span>
            <span>{{ $order->paid_at->format('d M Y, H:i') }} WIB</span>
        </div>
        @endif

        @if(in_array($eventType, ['order_paid', 'preorder_ready']) && count($deliveries) > 0)
            <div class="section-title">Produk</div>

            @foreach($deliveries as $delivery)
                <div class="product-card">
                    <div class="product-name">{{ $delivery->orderItem->nama_produk }}</div>

                    @if($delivery->licenseKey?->key)
                        <div class="product-detail">
                            🔑 License Key: <code>{{ $delivery->licenseKey->key }}</code>
                        </div>
                    @endif

                    @if($delivery->download_url && $delivery->download_token)
                        <div class="product-detail">
                            ⏰ Berlaku sampai: {{ $delivery->token_expired_at?->format('d M Y, H:i') }} WIB
                        </div>
                        <a href="{{ rtrim($siteUrl, '/') }}/download/{{ $delivery->download_token }}" class="btn">
                            📥 Download Sekarang
                        </a>
                    @endif
                </div>
            @endforeach
        @endif

        @if($eventType === 'account_ready' && $provisioning)
            <div class="section-title">Kredensial Akun</div>

            <div class="product-card">
                <div class="product-name">{{ $provisioning->orderItem?->nama_produk }}</div>

                @if(is_array($provisioning->credentials) && count($provisioning->credentials) > 0)
                    <table class="credential-table">
                        @foreach($provisioning->credentials as $key => $value)
                            <tr>
                                <td>{{ ucfirst(str_replace('_', ' ', $key)) }}</td>
                                <td><code>{{ $value }}</code></td>
                            </tr>
                        @endforeach
                    </table>
                @endif

                @if($provisioning->catatan_admin)
                    <div class="product-detail" style="margin-top:8px;">
                        📝 Catatan: {{ $provisioning->catatan_admin }}
                    </div>
                @endif
            </div>
        @endif
    </div>

    <div class="footer">
        <p>&copy; {{ date('Y') }} {{ config('app.name', 'Enmarket') }}. All rights reserved.</p>
        <p>Email ini dikirim otomatis. Jika ada pertanyaan, hubungi kami.</p>
    </div>
</div>
</body>
</html>
