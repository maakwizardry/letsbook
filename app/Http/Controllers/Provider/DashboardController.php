<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $bookings = Booking::where('provider_id', $request->user()->id)
            ->get(['status', 'is_paid', 'total_quote', 'payment_method', 'scheduled_at', 'created_at']);

        $totalOrders = $bookings->count();
        $paidBookings = $bookings->where('is_paid', true);

        $now = now();
        $startOfToday = $now->copy()->startOfDay();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();

        $statusCounts = collect(Booking::STATUSES)->mapWithKeys(fn ($status) => [
            $status => $bookings->where('status', $status)->count(),
        ]);

        $needsAttention = $bookings
            ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_IN_PROGRESS])
            ->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'ordersToday' => $bookings->where('created_at', '>=', $startOfToday)->count(),
                'ordersThisWeek' => $bookings->where('created_at', '>=', $startOfWeek)->count(),
                'ordersThisMonth' => $bookings->where('created_at', '>=', $startOfMonth)->count(),

                'totalRevenue' => (float) $paidBookings->sum('total_quote'),
                'revenueThisMonth' => (float) $paidBookings->where('created_at', '>=', $startOfMonth)->sum('total_quote'),
                'outstandingAmount' => (float) $bookings->where('is_paid', false)->sum('total_quote'),
                'outstandingCount' => $bookings->where('is_paid', false)->count(),
                'avgOrderValue' => $totalOrders > 0 ? round((float) $bookings->avg('total_quote'), 2) : 0,

                'completionRate' => $totalOrders > 0 ? round(($statusCounts[Booking::STATUS_COMPLETED] / $totalOrders) * 100) : 0,
                'cancellationRate' => $totalOrders > 0 ? round(($statusCounts[Booking::STATUS_CANCELLED] / $totalOrders) * 100) : 0,
                'needsAttention' => $needsAttention,

                'statusCounts' => $statusCounts,
                'paymentMethodCounts' => [
                    'cash' => $bookings->where('payment_method', 'cash')->count(),
                    'etransfer' => $bookings->where('payment_method', 'etransfer')->count(),
                ],
            ],
        ]);
    }
}
