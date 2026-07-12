<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingReminderNotification extends Notification
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
                    ->subject('Reminder: Your Booking is Coming Up')
                    ->greeting('Hello ' . $this->booking->customer->name . ',')
                    ->line('This is a friendly reminder about your upcoming booking with ' . $this->booking->provider->name . '.')
                    ->line('Reference ID: ' . $this->booking->reference_id)
                    ->line('Scheduled Date: ' . $this->booking->scheduled_at->format('l, F j, Y \a\t g:i A'))
                    ->line('Total Quote: $' . number_format($this->booking->total_quote, 2))
                    ->line('We look forward to serving you!');
    }
}
