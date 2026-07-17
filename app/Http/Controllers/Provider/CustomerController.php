<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $bookings = Booking::with('customer')
            ->where('provider_id', $request->user()->id)
            ->whereNotNull('customer_id')
            ->get();

        $customers = $bookings
            ->groupBy('customer_id')
            ->map(fn (Collection $group) => $this->summarize($group))
            ->filter(fn (array $customer) => isset($customer['id']))
            ->sortByDesc('last_booking_at')
            ->values();

        if (! empty($validated['search'])) {
            $needle = mb_strtolower($validated['search']);
            $customers = $customers
                ->filter(fn (array $customer) => str_contains(mb_strtolower($customer['name'] ?? ''), $needle)
                    || str_contains(mb_strtolower($customer['phone'] ?? ''), $needle)
                    || str_contains(mb_strtolower($customer['email'] ?? ''), $needle))
                ->values();
        }

        return Inertia::render('customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $validated['search'] ?? '',
            ],
        ]);
    }

    public function show(Request $request, Customer $customer): Response
    {
        $bookings = Booking::withCount('items')
            ->where('provider_id', $request->user()->id)
            ->where('customer_id', $customer->id)
            ->orderByDesc('scheduled_at')
            ->get();

        abort_if($bookings->isEmpty(), 404);

        $summary = $this->summarize($bookings);

        return Inertia::render('customer-detail', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'address' => $customer->address,
                'unit_number' => $customer->unit_number,
                'buzz_code' => $customer->buzz_code,
                'building_instructions' => $customer->building_instructions,
                'postal_code' => $customer->postal_code,
            ],
            'summary' => $summary,
            'bookings' => $bookings->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'reference_id' => $booking->reference_id,
                'scheduled_at' => $booking->scheduled_at,
                'status' => $booking->status,
                'is_paid' => $booking->is_paid,
                'payment_method' => $booking->payment_method,
                'total_quote' => (float) $booking->total_quote,
                'items_count' => $booking->items_count,
            ])->values(),
        ]);
    }

    /**
     * Aggregate one customer's bookings (already scoped to the signed-in
     * provider) into the summary the customer list and detail page share.
     * Customer contact fields are merged in only when the relation is
     * available (the index eager-loads it; the detail page already has the
     * model separately and only needs the aggregates).
     *
     * @param  Collection<int, Booking>  $bookings
     * @return array<string, mixed>
     */
    protected function summarize(Collection $bookings): array
    {
        $customer = $bookings->first()?->customer;

        $active = $bookings->where('status', '!=', Booking::STATUS_CANCELLED);

        $summary = [
            'avg_order_value' => round((float) $bookings->avg('total_quote'), 2),
            'bookings_count' => $bookings->count(),
            'total_spent' => (float) $bookings->where('is_paid', true)->sum('total_quote'),
            'outstanding_amount' => (float) $active->where('is_paid', false)->sum('total_quote'),
            'last_booking_at' => $bookings->max('scheduled_at'),
            'first_booking_at' => $bookings->min('created_at'),
        ];

        if ($customer) {
            $summary = array_merge([
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'address' => $customer->address,
            ], $summary);
        }

        return $summary;
    }
}
