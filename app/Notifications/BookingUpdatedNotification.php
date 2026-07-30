<?php

namespace App\Notifications;

use App\Mail\BookingUpdatedMail;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingUpdatedNotification extends Notification
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
        return (new BookingUpdatedMail($this->booking))->to($notifiable->routeNotificationFor('mail', $this));
    }
}
