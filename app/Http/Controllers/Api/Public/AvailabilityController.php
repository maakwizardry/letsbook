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
        ]);

        $query = Booking::where('provider_id', $request->provider_id)
            ->where('status', '!=', Booking::STATUS_CANCELLED)
            ->whereNotNull('scheduled_at');

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
