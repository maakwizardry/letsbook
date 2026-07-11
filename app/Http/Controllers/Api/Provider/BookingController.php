<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $providerId = $request->user()->provider_id;
        $query = Booking::with('customer', 'homeType')->where('provider_id', $providerId)->orderByDesc('created_at');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $providerId = $request->user()->provider_id;
        $booking = Booking::with('customer', 'homeType', 'items.serviceItem')
            ->where('provider_id', $providerId)
            ->findOrFail($id);
            
        return response()->json($booking);
    }

    public function update(Request $request, $id)
    {
        $providerId = $request->user()->provider_id;
        $booking = Booking::where('provider_id', $providerId)->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|string|in:New,Contacted,Scheduled,Completed,Cancelled'
        ]);
        
        $booking->update(['status' => $validated['status']]);
        
        return response()->json($booking);
    }
}
