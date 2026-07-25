<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSeries;
use App\Models\Customer;
use App\Models\ServiceItem;
use App\Notifications\BookingPaymentConfirmedNotification;
use App\Notifications\BookingStatusUpdatedNotification;
use App\Services\BookingCreator;
use App\Services\RecurringBookingGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function __construct(
        private BookingCreator $bookingCreator,
        private RecurringBookingGenerator $recurringBookingGenerator,
    ) {}

    /**
     * Let a provider add a booking for a client themselves — for clients
     * they already had before joining LetsBook, or ones who booked by
     * phone/text. No confirmation email is sent to the customer (unlike the
     * public wizard's store()) since this is a backfill of an appointment
     * the provider already arranged directly, not a fresh online order —
     * an automated "your booking is confirmed" email would be confusing.
     * Reminder emails still work if requested, since those are a separate
     * opt-in the customer would expect regardless of how the booking was
     * created.
     */
    public function store(Request $request): RedirectResponse
    {
        $providerId = $request->user()->id;

        $validated = $request->validate([
            'home_type_id' => ['required', Rule::exists('home_types', 'id')->where('provider_id', $providerId)],
            'service_item_ids' => ['required', 'array', 'min:1'],
            'service_item_ids.*' => [Rule::exists('service_items', 'id')->where('provider_id', $providerId)],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'required_without:customer_email', 'string', 'max:255'],
            'customer_email' => ['nullable', 'required_without:customer_phone', 'email', 'max:255'],
            'customer_address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'unit_number' => ['nullable', 'string', 'max:255'],
            'buzz_code' => ['nullable', 'string', 'max:255'],
            'building_instructions' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'scheduled_at' => ['required', 'date'],
            'duration_hours' => ['required', 'integer', 'min:1', 'max:'.BookingCreator::MAX_DURATION_HOURS],
            'payment_method' => ['required', 'in:cash,etransfer'],
            'reminder_minutes_before' => ['nullable', 'integer', 'in:30,60,180,1440'],
            'is_recurring' => ['nullable', 'boolean'],
            'frequency' => ['required_if:is_recurring,1,true', 'nullable', 'in:weekly,biweekly,monthly'],
            'days_of_week' => ['required_if:frequency,weekly,biweekly', 'nullable', 'array', 'min:1'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'ends_type' => ['required_if:is_recurring,1,true', 'nullable', 'in:never,count,date'],
            'ends_count' => ['required_if:ends_type,count', 'nullable', 'integer', 'min:2'],
            'ends_on' => ['required_if:ends_type,date', 'nullable', 'date', 'after:scheduled_at'],
        ]);

        $items = ServiceItem::whereIn('id', $validated['service_item_ids'])->get();

        $scheduledAt = \Carbon\Carbon::parse($validated['scheduled_at']);

        if ($this->bookingCreator->hasOverlap($providerId, $scheduledAt, $validated['duration_hours'])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'scheduled_at' => ['This time slot is already booked.'],
            ]);
        }

        DB::transaction(function () use ($request, $validated, $items, $scheduledAt, $providerId) {
            $customer = null;
            if (! empty($validated['customer_email'])) {
                $customer = Customer::where('email', $validated['customer_email'])->first();
            }

            if (! $customer && ! empty($validated['customer_phone'])) {
                $customer = Customer::where('phone', $validated['customer_phone'])->first();
            }

            $addressAttributes = [
                'address' => $validated['customer_address'],
                'unit_number' => $validated['unit_number'] ?? null,
                'buzz_code' => $validated['buzz_code'] ?? null,
                'building_instructions' => $validated['building_instructions'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ];

            if (! $customer) {
                $customer = Customer::create(array_merge([
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'] ?? null,
                    'email' => $validated['customer_email'] ?? null,
                ], $addressAttributes));
            } else {
                $customer->update($addressAttributes);
            }

            $booking = $this->bookingCreator->create([
                'provider_id' => $providerId,
                'customer_id' => $customer->id,
                'home_type_id' => $validated['home_type_id'],
                'scheduled_at' => $scheduledAt,
                'duration_hours' => $validated['duration_hours'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'reminder_minutes_before' => $validated['reminder_minutes_before'] ?? null,
                'customer_email' => $validated['customer_email'] ?? null,
            ], $items);

            if ($request->boolean('is_recurring')) {
                $series = BookingSeries::create([
                    'provider_id' => $providerId,
                    'customer_id' => $customer->id,
                    'home_type_id' => $validated['home_type_id'],
                    'frequency' => $validated['frequency'],
                    'days_of_week' => in_array($validated['frequency'], ['weekly', 'biweekly'], true) ? $validated['days_of_week'] : null,
                    'starts_at' => $scheduledAt,
                    'duration_hours' => $validated['duration_hours'],
                    'ends_on' => $validated['ends_type'] === 'date' ? $validated['ends_on'] : null,
                    'max_occurrences' => $validated['ends_type'] === 'count' ? $validated['ends_count'] : null,
                    'occurrences_created' => 1,
                    'generated_through' => $scheduledAt->toDateString(),
                    'payment_method' => $validated['payment_method'],
                    'reminder_minutes_before' => $validated['reminder_minutes_before'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'is_active' => true,
                ]);

                $series->serviceItems()->attach($items->pluck('id'));
                $booking->update(['booking_series_id' => $series->id]);

                $this->recurringBookingGenerator->extend($series);
            }
        });

        return back();
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        abort_if($booking->provider_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'string', Rule::in(Booking::STATUSES)],
            'is_paid' => ['sometimes', 'required', 'boolean'],
        ]);

        if (array_key_exists('is_paid', $validated)) {
            $validated['paid_at'] = $validated['is_paid'] ? now() : null;
        }

        $booking->update($validated);
        $booking->load('items.serviceItem', 'customer', 'provider');

        if ($booking->wasChanged('is_paid') && $booking->is_paid && $booking->provider?->email) {
            $booking->provider->notify(new BookingPaymentConfirmedNotification($booking));
        }

        if ($booking->wasChanged('status')
            && in_array($booking->status, [Booking::STATUS_IN_PROGRESS, Booking::STATUS_COMPLETED, Booking::STATUS_CANCELLED])
            && $booking->customer?->email) {
            Notification::route('mail', $booking->customer->email)
                ->notify(new BookingStatusUpdatedNotification($booking));
        }

        return back();
    }
}
