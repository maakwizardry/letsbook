<?php

namespace App\Notifications;

use App\Mail\ProviderWelcomeMail;
use App\Models\Provider;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProviderWelcomeNotification extends Notification
{
    use Queueable;

    public function __construct(public Provider $provider, public string $resetUrl) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new ProviderWelcomeMail($this->provider, $this->resetUrl))->to($notifiable->routeNotificationFor('mail', $this));
    }
}
