<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification
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
                    ->subject('New Booking Received!')
                    ->greeting('Hello ' . $this->booking->provider->name . ',')
                    ->line('You got a new booking from ' . $this->booking->customer->name . '.')
                    ->line('Reference ID: ' . $this->booking->reference_id)
                    ->line('Scheduled Date: ' . $this->booking->scheduled_at->format('l, F j, Y \a\t g:i A'))
                    ->line('Total Quote: $' . number_format($this->booking->total_quote, 2))
                    ->action('View Booking', url('/provider/bookings/' . $this->booking->id));
    }
}
