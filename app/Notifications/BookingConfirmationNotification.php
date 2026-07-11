<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmationNotification extends Notification
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Your Booking is Confirmed!')
                    ->greeting('Hello ' . $this->booking->customer->name . ',')
                    ->line('Your booking has been successfully confirmed.')
                    ->line('Reference ID: ' . $this->booking->reference_id)
                    ->line('Scheduled Date: ' . $this->booking->scheduled_at->format('l, F j, Y \a\t g:i A'))
                    ->line('Total Quote: $' . number_format($this->booking->total_quote, 2))
                    ->line('We look forward to serving you!');
    }
}
