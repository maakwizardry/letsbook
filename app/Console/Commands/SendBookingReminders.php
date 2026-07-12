<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\BookingReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendBookingReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-booking-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder emails for bookings whose requested reminder time has arrived';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $bookings = Booking::whereNotNull('remind_at')
            ->whereNull('reminder_sent_at')
            ->where('remind_at', '<=', now())
            ->where('status', '!=', 'Cancelled')
            ->with('customer', 'provider')
            ->get();

        foreach ($bookings as $booking) {
            if ($booking->customer && $booking->customer->email) {
                Notification::route('mail', $booking->customer->email)
                    ->notify(new BookingReminderNotification($booking));
            }

            $booking->update(['reminder_sent_at' => now()]);
        }

        $this->info("Sent {$bookings->count()} booking reminder(s).");
    }
}
