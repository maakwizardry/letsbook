<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingUpdatedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build()
    {
        $address = trim($this->booking->customer->address
            .($this->booking->customer->unit_number ? ', Unit '.$this->booking->customer->unit_number : ''));

        $mail = $this->mailer('outreach')
            ->subject('Your booking has been updated')
            ->view('emails.booking-updated')
            ->with([
                'booking' => $this->booking,
                'address' => $address,
            ]);

        if ($this->booking->provider->email) {
            $mail->replyTo($this->booking->provider->email, $this->booking->provider->name);
        }

        return $mail;
    }
}
