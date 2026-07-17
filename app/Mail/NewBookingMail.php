<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewBookingMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build()
    {
        $address = trim($this->booking->customer->address
            .($this->booking->customer->unit_number ? ', Unit '.$this->booking->customer->unit_number : ''));

        return $this->mailer('outreach')
            ->subject('New booking received — '.$this->booking->reference_id)
            ->view('emails.new-booking')
            ->with([
                'booking' => $this->booking,
                'address' => $address,
            ]);
    }
}
