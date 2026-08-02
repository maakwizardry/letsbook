<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Provider;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Provider::where('is_client', true)
            ->withCount(['bookings', 'bookingSeries'])
            ->withMax('bookings', 'created_at')
            // Total value earned across all their bookings — everything
            // except a cancelled booking, which was never actually done.
            ->withSum(['bookings as revenue_sum' => fn ($query) => $query->where('status', '!=', Booking::STATUS_CANCELLED)], 'total_quote')
            ->orderByRaw('bookings_max_created_at IS NULL, bookings_max_created_at DESC')
            ->get()
            ->map(fn (Provider $provider) => [
                'id' => $provider->id,
                'name' => $provider->name,
                'slug' => $provider->slug,
                'email' => $provider->email,
                'bookings_count' => $provider->bookings_count,
                'recurring_bookings_count' => $provider->booking_series_count,
                'total_revenue' => (float) ($provider->revenue_sum ?? 0),
                'last_activity' => $provider->bookings_max_created_at,
            ]);

        return Inertia::render('admin/clients', [
            'clients' => $clients,
        ]);
    }
}
