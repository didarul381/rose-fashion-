<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $alertType, public array $payload)
    {
    }

    public function envelope(): Envelope
    {
        $storeName = $this->payload['store_name'] ?? config('app.name');
        $subject = match ($this->alertType) {
            'register' => 'New customer registered - ' . $storeName,
            'orders', 'order' => 'New order received - #' . ($this->payload['order_number'] ?? ''),
            default => 'Store alert - ' . $storeName,
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-alert',
            with: ['alertType' => $this->alertType, 'payload' => $this->payload],
        );
    }
}
