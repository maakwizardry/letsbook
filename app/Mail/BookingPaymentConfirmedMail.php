<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingPaymentConfirmedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build()
    {
        return $this->subject('Payment recorded — '.$this->booking->reference_id)
            ->view('emails.booking-payment-confirmed')
            ->with(['booking' => $this->booking]);
    }
}
