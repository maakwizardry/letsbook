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
            'customer_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'scheduled_at' => 'required|date',
        ]);

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

        if (!$customer) {
            $customer = Customer::create([
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
                'email' => $validated['customer_email'] ?? null,
                'address' => $validated['customer_address'] ?? null,
            ]);
        }

        $booking = Booking::create([
            'provider_id' => $providerId,
            'customer_id' => $customer->id,
            'home_type_id' => $validated['home_type_id'],
            'total_quote' => $total,
            'notes' => $validated['notes'] ?? null,
            'scheduled_at' => $scheduledAt,
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
        if ($booking->provider && $booking->provider->contact_info) {
            foreach ($booking->provider->users as $user) {
                $user->notify(new NewBookingNotification($booking));
            }
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
