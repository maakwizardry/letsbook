<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use App\Models\Customer;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\ServiceItem;
use App\Models\Staff;
use App\Notifications\BookingConfirmationNotification;
use App\Notifications\NewBookingNotification;
use App\Services\BookingCreator;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private BookingCreator $bookingCreator) {}

    public function store(Request $request)
    {
        $request->validate(['service_category_id' => 'required|exists:service_categories,id']);

        $serviceCategory = ServiceCategory::findOrFail($request->service_category_id);
        $providerId = $serviceCategory->provider_id;
        $provider = $serviceCategory->provider;

        // A cleaning job happens at the customer's home, so the address is
        // required; an appointment-type business (barber, dentist, etc.) is
        // visited at the business itself, so it isn't. Every provider today
        // defaults to 'cleaning', so this is required for 100% of current
        // traffic — identical to before this check existed.
        $requiresAddress = $provider->business_type !== Provider::BUSINESS_TYPE_APPOINTMENT;

        $validated = $request->validate([
            'service_category_id' => 'required|exists:service_categories,id',
            'service_item_ids' => 'required|array',
            'service_item_ids.*' => 'exists:service_items,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_address' => $requiresAddress ? 'required|string' : 'nullable|string',
            'unit_number' => 'nullable|string|max:255',
            'buzz_code' => 'nullable|string|max:255',
            'building_instructions' => 'nullable|string',
            'postal_code' => 'nullable|string|max:255',
            'latitude' => $requiresAddress ? 'required|numeric|between:-90,90' : 'nullable|numeric|between:-90,90',
            'longitude' => $requiresAddress ? 'required|numeric|between:-180,180' : 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'payment_method' => 'required|in:cash,etransfer',
            'reminder_minutes_before' => 'nullable|integer|in:30,60,180,1440',
            'staff_id' => 'nullable|integer',
        ]);

        if (!empty($validated['reminder_minutes_before']) && empty($validated['customer_email'])) {
            return response()->json([
                'message' => 'An email address is required to receive a booking reminder.',
                'errors' => ['customer_email' => ['An email address is required to receive a booking reminder.']]
            ], 422);
        }

        // staff_id only ever takes effect for a provider that's been
        // deliberately flagged into staff scheduling — sending it for any
        // other provider is silently ignored, not an error, since a
        // customer/client shouldn't be able to opt a provider into this by
        // simply including the field.
        $staffId = null;
        if ($provider->uses_staff_scheduling && !empty($validated['staff_id'])) {
            if (! Staff::where('id', $validated['staff_id'])->where('provider_id', $providerId)->exists()) {
                return response()->json([
                    'message' => 'Invalid staff selection.',
                    'errors' => ['staff_id' => ['Invalid staff selection.']]
                ], 422);
            }
            $staffId = $validated['staff_id'];
        }

        $items = ServiceItem::whereIn('id', $validated['service_item_ids'])->get();

        if ($items->contains(fn (ServiceItem $item) => ! $item->is_active)) {
            return response()->json([
                'message' => 'One of the selected services is no longer available.',
                'errors' => ['service_item_ids' => ['One of the selected services is no longer available.']]
            ], 422);
        }

        $scheduledAt = \Carbon\Carbon::parse($validated['scheduled_at']);

        // The job takes as long as its most time-consuming selected item —
        // not the sum of all of them — since every existing service item
        // defaults to 1 hour, this guarantees today's flat 1-hour bookings
        // stay exactly 1 hour regardless of how many items are picked. Only
        // once individual items get real, differentiated durations (a
        // provider-facing control that doesn't exist yet) does this start
        // producing anything other than 1.
        $durationHours = $items->max('duration_hours') ?? 1;

        if (BlockedDate::where('provider_id', $providerId)->whereDate('date', $scheduledAt->toDateString())->exists()) {
            return response()->json([
                'message' => 'This date is not available.',
                'errors' => ['scheduled_at' => ['This date is not available.']]
            ], 422);
        }

        if ($this->bookingCreator->hasOverlap($providerId, $scheduledAt, $durationHours, staffId: $staffId)) {
            return response()->json([
                'message' => 'This time slot is already booked.',
                'errors' => ['scheduled_at' => ['This time slot is already booked.']]
            ], 422);
        }

        $customer = null;
        if (!empty($validated['customer_email'])) {
            $customer = Customer::where('email', $validated['customer_email'])->first();
        }
            
        if (!$customer && !empty($validated['customer_phone'])) {
             $customer = Customer::where('phone', $validated['customer_phone'])->first();
        }

        $addressAttributes = [
            'address' => $validated['customer_address'] ?? null,
            'unit_number' => $validated['unit_number'] ?? null,
            'buzz_code' => $validated['buzz_code'] ?? null,
            'building_instructions' => $validated['building_instructions'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ];

        if (!$customer) {
            $customer = Customer::create(array_merge([
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
                'email' => $validated['customer_email'] ?? null,
            ], $addressAttributes));
        } else {
            // Keep the address current since the job site may differ from a previous booking.
            $customer->update($addressAttributes);
        }

        $booking = $this->bookingCreator->create([
            'provider_id' => $providerId,
            'customer_id' => $customer->id,
            'staff_id' => $staffId,
            'service_category_id' => $validated['service_category_id'],
            'scheduled_at' => $scheduledAt,
            'duration_hours' => $durationHours,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'reminder_minutes_before' => $validated['reminder_minutes_before'] ?? null,
            'customer_email' => $validated['customer_email'] ?? null,
        ], $items);

        $booking->load('items.serviceItem', 'customer', 'serviceCategory', 'provider', 'staff');

        // Notifying provider and customer
        if ($booking->provider && $booking->provider->email) {
            $booking->provider->notify(new NewBookingNotification($booking));
        }

        if ($customer->email && $booking->provider->notifications_enabled) {
            \Illuminate\Support\Facades\Notification::route('mail', $customer->email)->notify(new BookingConfirmationNotification($booking));
        }

        return response()->json([
            'status' => 'success',
            'booking' => $booking,
        ], 201);
    }
}
