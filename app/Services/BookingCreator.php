<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class BookingCreator
{
    /**
     * Longest duration a booking can be given (validated at the call sites
     * that accept a provider-chosen duration). hasOverlap()'s lower bound is
     * derived from this same constant so the two can never silently drift
     * apart the way the old, separately-hardcoded ±1-hour checks did.
     */
    public const MAX_DURATION_HOURS = 12;

    /**
     * Create a Booking + its BookingItems, snapshotting each item's current
     * price. remind_at is only set when a reminder was requested, an email
     * exists to send it to, and the resulting time is still in the future —
     * shared by the manual provider-booking flow and the recurring-series
     * generator so both compute it identically. duration_hours defaults to
     * 1 (a single public-wizard-style slot) when the caller doesn't pass
     * one, so the public booking flow needs no changes to keep producing
     * 1-hour bookings.
     *
     * @param  array{provider_id: int, booking_series_id?: int|null, customer_id: int, staff_id?: int|null, service_category_id: int, scheduled_at: \Illuminate\Support\Carbon, duration_hours?: int, payment_method: string, notes?: string|null, reminder_minutes_before?: int|null, customer_email?: string|null}  $attributes
     */
    public function create(array $attributes, Collection $serviceItems): Booking
    {
        $scheduledAt = $attributes['scheduled_at'];

        $remindAt = null;
        if (! empty($attributes['reminder_minutes_before']) && ! empty($attributes['customer_email'])) {
            $candidate = $scheduledAt->copy()->subMinutes($attributes['reminder_minutes_before']);
            if ($candidate->isFuture()) {
                $remindAt = $candidate;
            }
        }

        $booking = Booking::create([
            'provider_id' => $attributes['provider_id'],
            'booking_series_id' => $attributes['booking_series_id'] ?? null,
            'customer_id' => $attributes['customer_id'],
            'staff_id' => $attributes['staff_id'] ?? null,
            'service_category_id' => $attributes['service_category_id'],
            'reference_id' => 'BKG-'.strtoupper(Str::random(6)),
            'total_quote' => $serviceItems->sum('price'),
            'payment_method' => $attributes['payment_method'],
            'status' => Booking::STATUS_PENDING,
            'notes' => $attributes['notes'] ?? null,
            'scheduled_at' => $scheduledAt,
            'duration_hours' => $attributes['duration_hours'] ?? 1,
            'reminder_minutes_before' => $remindAt ? $attributes['reminder_minutes_before'] : null,
            'remind_at' => $remindAt,
        ]);

        foreach ($serviceItems as $item) {
            BookingItem::create([
                'booking_id' => $booking->id,
                'service_item_id' => $item->id,
                'price_at_booking' => $item->price,
            ]);
        }

        return $booking;
    }

    /**
     * Apply an edit to an existing Booking — updates the schedule/details
     * and replaces its BookingItems wholesale (simpler and safer than
     * diffing old vs new items, and matches how infrequently bookings are
     * edited). remind_at is recomputed the same way create() computes it,
     * since a reschedule can move the reminder from past to future or vice
     * versa.
     *
     * @param  array{service_category_id: int, staff_id?: int|null, scheduled_at: \Illuminate\Support\Carbon, duration_hours: int, payment_method: string, notes?: string|null, reminder_minutes_before?: int|null, customer_email?: string|null}  $attributes
     */
    public function update(Booking $booking, array $attributes, Collection $serviceItems): Booking
    {
        $scheduledAt = $attributes['scheduled_at'];

        $remindAt = null;
        if (! empty($attributes['reminder_minutes_before']) && ! empty($attributes['customer_email'])) {
            $candidate = $scheduledAt->copy()->subMinutes($attributes['reminder_minutes_before']);
            if ($candidate->isFuture()) {
                $remindAt = $candidate;
            }
        }

        $booking->update([
            'service_category_id' => $attributes['service_category_id'],
            // Preserve whatever staff_id the booking already had unless the
            // caller explicitly passes one — call sites that don't know
            // about staff assignment yet (today, all of them) shouldn't
            // silently wipe it on every edit.
            'staff_id' => array_key_exists('staff_id', $attributes) ? $attributes['staff_id'] : $booking->staff_id,
            'total_quote' => $serviceItems->sum('price'),
            'payment_method' => $attributes['payment_method'],
            'notes' => $attributes['notes'] ?? null,
            'scheduled_at' => $scheduledAt,
            'duration_hours' => $attributes['duration_hours'],
            'reminder_minutes_before' => $remindAt ? $attributes['reminder_minutes_before'] : null,
            'remind_at' => $remindAt,
        ]);

        $booking->items()->delete();

        foreach ($serviceItems as $item) {
            BookingItem::create([
                'booking_id' => $booking->id,
                'service_item_id' => $item->id,
                'price_at_booking' => $item->price,
            ]);
        }

        return $booking;
    }

    /**
     * Whether a booking of the given duration starting at $start would
     * overlap any existing active booking for this provider. Replaces three
     * previously-duplicated, disagreeing hardcoded ±1-hour checks with real
     * interval math (existing.start < new.end && existing.end > new.start).
     * The query's lower-bound prefilter uses MAX_DURATION_HOURS rather than
     * an arbitrary window, since that's the only guarantee we have on how
     * far back an existing booking's own end time could still reach.
     * $excludeBookingId lets an edit check for overlaps against every other
     * booking without perpetually colliding with itself.
     *
     * $staffId, when passed, narrows the conflict check to that one staff
     * member's own bookings instead of every booking the provider has —
     * two different staff can legitimately be booked at the same time.
     * Every existing call site omits it (null), which keeps the query
     * byte-for-byte identical to before this parameter existed: a
     * provider with no staff concept still gets a single shared calendar.
     */
    public function hasOverlap(int $providerId, Carbon $start, int $durationHours, ?int $excludeBookingId = null, ?int $staffId = null): bool
    {
        $end = $start->copy()->addHours($durationHours);

        return Booking::where('provider_id', $providerId)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->when($excludeBookingId, fn ($query) => $query->where('id', '!=', $excludeBookingId))
            ->when($staffId, fn ($query) => $query->where('staff_id', $staffId))
            ->where('scheduled_at', '>', $start->copy()->subHours(self::MAX_DURATION_HOURS))
            ->where('scheduled_at', '<', $end)
            ->get(['scheduled_at', 'duration_hours'])
            ->contains(fn (Booking $existing) => $existing->scheduled_at->copy()->addHours($existing->duration_hours)->gt($start));
    }
}
