<?php

namespace App\Notifications;

use App\Mail\BookingReminderMail;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
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
        return (new BookingReminderMail($this->booking))->to($notifiable->routeNotificationFor('mail', $this));
    }
}
