<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingPaymentConfirmedNotification;
use App\Notifications\BookingStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
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
            && in_array($booking->status, [Booking::STATUS_IN_PROGRESS, Booking::STATUS_COMPLETED])
            && $booking->customer?->email) {
            Notification::route('mail', $booking->customer->email)
                ->notify(new BookingStatusUpdatedNotification($booking));
        }

        return back();
    }
}
