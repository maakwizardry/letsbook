<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSeries;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class RecurringBookingGenerator
{
    public function __construct(private BookingCreator $bookingCreator) {}

    /**
     * Materialize real Booking rows for a series up to a rolling horizon,
     * resuming from wherever generated_through last left off so re-running
     * this (daily, via the scheduler) never rescans already-checked dates.
     * A date that matches the pattern but conflicts with an existing
     * booking is skipped and logged rather than blocking the whole series —
     * see the recurring-bookings plan for why that's an acceptable
     * simplification here.
     */
    public function extend(BookingSeries $series, int $horizonDays = 90): int
    {
        if (! $series->is_active) {
            return 0;
        }

        $horizon = now()->addDays($horizonDays)->startOfDay();
        $cursor = $series->generated_through
            ? $series->generated_through->copy()->addDay()
            : $series->starts_at->copy()->startOfDay();

        $serviceItems = $series->serviceItems;
        $occurrencesCreated = $series->occurrences_created;
        $created = 0;
        $lastScanned = null;
        $stillActive = true;

        $blockedDates = $series->provider->blockedDates()->pluck('date')->map->toDateString()->flip();

        while ($cursor->lte($horizon)) {
            if ($series->max_occurrences && $occurrencesCreated >= $series->max_occurrences) {
                $stillActive = false;
                break;
            }

            if ($series->ends_on && $cursor->gt($series->ends_on)) {
                $stillActive = false;
                break;
            }

            if ($this->matches($series, $cursor)) {
                $scheduledAt = $cursor->copy()->setTime(
                    $series->starts_at->hour,
                    $series->starts_at->minute,
                    $series->starts_at->second,
                );

                $isBlocked = $blockedDates->has($cursor->toDateString());
                $overlap = ! $isBlocked && $this->bookingCreator->hasOverlap($series->provider_id, $scheduledAt, $series->duration_hours);

                if ($isBlocked) {
                    Log::warning('Skipped recurring booking occurrence — date is blocked', [
                        'booking_series_id' => $series->id,
                        'scheduled_at' => $scheduledAt->toDateTimeString(),
                    ]);
                } elseif ($overlap) {
                    Log::warning('Skipped recurring booking occurrence due to a scheduling conflict', [
                        'booking_series_id' => $series->id,
                        'scheduled_at' => $scheduledAt->toDateTimeString(),
                    ]);
                } else {
                    $this->bookingCreator->create([
                        'provider_id' => $series->provider_id,
                        'booking_series_id' => $series->id,
                        'customer_id' => $series->customer_id,
                        'service_category_id' => $series->service_category_id,
                        'scheduled_at' => $scheduledAt,
                        'duration_hours' => $series->duration_hours,
                        'payment_method' => $series->payment_method,
                        'notes' => $series->notes,
                        'reminder_minutes_before' => $series->reminder_minutes_before,
                        'customer_email' => $series->customer->email,
                    ], $serviceItems);

                    $occurrencesCreated++;
                    $created++;
                }
            }

            $lastScanned = $cursor->copy();
            $cursor->addDay();
        }

        $updates = ['occurrences_created' => $occurrencesCreated, 'is_active' => $stillActive];
        if ($lastScanned) {
            $updates['generated_through'] = $lastScanned->toDateString();
        }
        $series->update($updates);

        return $created;
    }

    private function matches(BookingSeries $series, Carbon $date): bool
    {
        if ($date->lt($series->starts_at->copy()->startOfDay())) {
            return false;
        }

        return match ($series->frequency) {
            'weekly' => in_array($date->dayOfWeek, $series->days_of_week ?? [], true),
            'biweekly' => in_array($date->dayOfWeek, $series->days_of_week ?? [], true)
                && intdiv(
                    $series->starts_at->copy()->startOfWeek(Carbon::SUNDAY)->diffInDays($date->copy()->startOfWeek(Carbon::SUNDAY)),
                    7
                ) % 2 === 0,
            'monthly' => $date->day === min($series->starts_at->day, $date->daysInMonth),
            default => false,
        };
    }
}
