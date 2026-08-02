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
            // Same non-cancelled scope, split by how it's actually paid.
            ->withSum(['bookings as cash_sum' => fn ($query) => $query->where('status', '!=', Booking::STATUS_CANCELLED)->where('payment_method', 'cash')], 'total_quote')
            ->withSum(['bookings as etransfer_sum' => fn ($query) => $query->where('status', '!=', Booking::STATUS_CANCELLED)->where('payment_method', 'etransfer')], 'total_quote')
            // Same non-cancelled scope, split by whether it's been collected
            // yet — these two always add up to revenue_sum.
            ->withSum(['bookings as paid_sum' => fn ($query) => $query->where('status', '!=', Booking::STATUS_CANCELLED)->where('is_paid', true)], 'total_quote')
            ->withSum(['bookings as upcoming_sum' => fn ($query) => $query->where('status', '!=', Booking::STATUS_CANCELLED)->where('is_paid', false)], 'total_quote')
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
                'total_cash' => (float) ($provider->cash_sum ?? 0),
                'total_etransfer' => (float) ($provider->etransfer_sum ?? 0),
                'total_paid' => (float) ($provider->paid_sum ?? 0),
                'total_upcoming' => (float) ($provider->upcoming_sum ?? 0),
                'last_activity' => $provider->bookings_max_created_at,
            ]);

        return Inertia::render('admin/clients', [
            'clients' => $clients,
        ]);
    }
}
