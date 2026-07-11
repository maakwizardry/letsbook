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
                    ->subject('New Booking Received')
                    ->line('A new booking has been received from ' . $this->booking->customer->name)
                    ->line('Total Quote: $' . $this->booking->total_quote)
                    ->action('View Booking', url('/'));
    }
}
