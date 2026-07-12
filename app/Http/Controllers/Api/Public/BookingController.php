<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Customer;
use App\Models\HomeType;
use App\Models\ServiceItem;
use App\Notifications\BookingConfirmationNotification;
use App\Notifications\NewBookingNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'home_type_id' => 'required|exists:home_types,id',
            'service_item_ids' => 'required|array',
            'service_item_ids.*' => 'exists:service_items,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_address' => 'required|string',
            'unit_number' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'notes' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'payment_method' => 'required|in:cash,etransfer',
            'reminder_minutes_before' => 'nullable|integer|in:30,60,180,1440',
        ]);

        if (!empty($validated['reminder_minutes_before']) && empty($validated['customer_email'])) {
            return response()->json([
                'message' => 'An email address is required to receive a booking reminder.',
                'errors' => ['customer_email' => ['An email address is required to receive a booking reminder.']]
            ], 422);
        }

        $homeType = HomeType::findOrFail($validated['home_type_id']);
        $providerId = $homeType->provider_id;

        $items = ServiceItem::whereIn('id', $validated['service_item_ids'])->get();
        $total = $items->sum('price');

        $scheduledAt = \Carbon\Carbon::parse($validated['scheduled_at']);

        // Assuming 1 hour blocks. Check if any active booking overlaps with this time.
        // Overlap occurs if an existing booking's time is within 1 hour before or after the new time.
        $overlap = Booking::where('provider_id', $providerId)
            ->where('status', '!=', 'Cancelled')
            ->where('scheduled_at', '>', $scheduledAt->copy()->subHour())
            ->where('scheduled_at', '<', $scheduledAt->copy()->addHour())
            ->exists();

        if ($overlap) {
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
            'address' => $validated['customer_address'],
            'unit_number' => $validated['unit_number'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
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

        $remindAt = null;
        if (!empty($validated['reminder_minutes_before'])) {
            $candidate = $scheduledAt->copy()->subMinutes($validated['reminder_minutes_before']);
            if ($candidate->isFuture()) {
                $remindAt = $candidate;
            }
        }

        $booking = Booking::create([
            'provider_id' => $providerId,
            'customer_id' => $customer->id,
            'home_type_id' => $validated['home_type_id'],
            'reference_id' => 'BKG-' . strtoupper(Str::random(6)),
            'total_quote' => $total,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'scheduled_at' => $scheduledAt,
            'reminder_minutes_before' => $remindAt ? $validated['reminder_minutes_before'] : null,
            'remind_at' => $remindAt,
        ]);

        foreach ($items as $item) {
            BookingItem::create([
                'booking_id' => $booking->id,
                'service_item_id' => $item->id,
                'price_at_booking' => $item->price,
            ]);
        }

        $booking->load('items.serviceItem', 'customer', 'homeType', 'provider');

        // Notifying provider and customer
        if ($booking->provider && $booking->provider->email) {
            $booking->provider->notify(new NewBookingNotification($booking));
        }

        if ($customer->email) {
            \Illuminate\Support\Facades\Notification::route('mail', $customer->email)->notify(new BookingConfirmationNotification($booking));
        }

        return response()->json([
            'status' => 'success',
            'booking' => $booking,
        ], 201);
    }
}
