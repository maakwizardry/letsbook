<?php

namespace App\Notifications;

use App\Mail\BookingStatusUpdatedMail;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingStatusUpdatedNotification extends Notification
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
        return (new BookingStatusUpdatedMail($this->booking))->to($notifiable->routeNotificationFor('mail', $this));
    }
}
