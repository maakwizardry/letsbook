<?php

namespace App\Mail;

use App\Models\Provider;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ProviderWelcomeMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Provider $provider, public string $resetUrl) {}

    public function build()
    {
        return $this->mailer('outreach')
            ->subject('Welcome to LetsBook — set up your account')
            ->view('emails.provider-welcome')
            ->with([
                'provider' => $this->provider,
                'firstName' => Str::before($this->provider->name, ' '),
                'resetUrl' => $this->resetUrl,
                'bookingUrl' => route('provider.booking', $this->provider->slug),
            ]);
    }
}
