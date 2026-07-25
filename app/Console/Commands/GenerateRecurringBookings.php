<?php

namespace App\Console\Commands;

use App\Models\BookingSeries;
use App\Services\RecurringBookingGenerator;
use Illuminate\Console\Command;

class GenerateRecurringBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-recurring-bookings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Top up upcoming Booking rows for every active recurring booking series';

    public function handle(RecurringBookingGenerator $generator)
    {
        $series = BookingSeries::where('is_active', true)->get();

        $total = 0;
        foreach ($series as $s) {
            $total += $generator->extend($s);
        }

        $this->info("Generated {$total} booking(s) across {$series->count()} active series.");
    }
}
