<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Provider;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'staff_id' => 'nullable|integer',
        ]);

        $query = Booking::where('provider_id', $request->provider_id)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->whereNotNull('scheduled_at');

        // Same gate as booking creation: staff_id only narrows the result
        // for a provider deliberately flagged into staff scheduling, so an
        // un-flagged provider's booked-slots response is unaffected by
        // this parameter's mere presence.
        $provider = Provider::find($request->provider_id);
        if ($provider->uses_staff_scheduling && $request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        if ($request->has('start_date')) {
            $query->where('scheduled_at', '>=', Carbon::parse($request->start_date)->startOfDay());
        }

        if ($request->has('end_date')) {
            $query->where('scheduled_at', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        $bookedSlots = $query->get(['scheduled_at', 'duration_hours'])->map(function (Booking $booking) {
            return [
                'start' => $booking->scheduled_at->toIso8601String(),
                'duration_hours' => $booking->duration_hours,
            ];
        });

        return response()->json([
            'booked_slots' => $bookedSlots
        ]);
    }
}
