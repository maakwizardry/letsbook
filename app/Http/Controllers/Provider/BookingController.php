<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return back();
    }
}
