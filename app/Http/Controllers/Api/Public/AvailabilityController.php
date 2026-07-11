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
            ->where('status', '!=', 'Cancelled')
            ->whereNotNull('scheduled_at');

        if ($request->has('start_date')) {
            $query->where('scheduled_at', '>=', Carbon::parse($request->start_date)->startOfDay());
        }

        if ($request->has('end_date')) {
            $query->where('scheduled_at', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        $bookedSlots = $query->pluck('scheduled_at')->map(function ($date) {
            return $date->toIso8601String();
        });

        return response()->json([
            'booked_slots' => $bookedSlots
        ]);
    }
}
