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
                    ->subject('Your Booking Confirmation')
                    ->line('Thank you for your booking, ' . $this->booking->customer->name . '!')
                    ->line('Your estimated quote is $' . $this->booking->total_quote)
                    ->line('We will contact you shortly to schedule your cleaning.');
    }
}
