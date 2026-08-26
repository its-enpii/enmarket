<?php

namespace App\Mail;

use App\Models\CustomRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomBuildRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CustomRequest $customRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[Custom Request #{$this->customRequest->id}] Permintaan Proyek dari {$this->customRequest->nama}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "<h2>Permintaan Custom Software Baru</h2>"
                ."<p><strong>Nama:</strong> ".e($this->customRequest->nama)."</p>"
                ."<p><strong>Email:</strong> ".e($this->customRequest->email)."</p>"
                ."<p><strong>WhatsApp:</strong> ".e($this->customRequest->wa)."</p>"
                ."<p><strong>Jenis Proyek:</strong> ".e($this->customRequest->jenis_proyek)."</p>"
                ."<p><strong>Budget:</strong> ".e($this->customRequest->budget_range)."</p>"
                ."<p><strong>Timeline:</strong> ".e($this->customRequest->timeline)."</p>"
                ."<p><strong>Deskripsi:</strong><br/>".nl2br(e($this->customRequest->deskripsi))."</p>",
        );
    }
}
