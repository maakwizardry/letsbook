<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdatedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build()
    {
        $subject = $this->booking->status === Booking::STATUS_COMPLETED
            ? 'Your cleaning is complete — thank you!'
            : 'Your cleaning has started';

        $address = trim($this->booking->customer->address
            .($this->booking->customer->unit_number ? ', Unit '.$this->booking->customer->unit_number : ''));

        $mail = $this->subject($subject)
            ->view('emails.booking-status-updated')
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
