<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ServiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in([...Booking::STATUSES, 'all'])],
            'paid' => ['nullable', 'string', Rule::in(['all', 'paid', 'unpaid'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $query = Booking::with(['customer', 'serviceCategory', 'bookingSeries:id,frequency', 'items.serviceItem'])
            ->withCount('items')
            ->where('provider_id', $request->user()->id);

        if (! empty($validated['status']) && $validated['status'] !== 'all') {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['paid']) && $validated['paid'] !== 'all') {
            $query->where('is_paid', $validated['paid'] === 'paid');
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('scheduled_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('scheduled_at', '<=', $validated['date_to']);
        }

        $bookings = $query->orderByDesc('scheduled_at')->get();

        $serviceCategories = $request->user()->serviceCategories()->get(['id', 'label']);

        $serviceItems = $request->user()->serviceItems()
            ->get()
            ->sortBy([
                fn (ServiceItem $item) => $item->service_category_id === null ? 1 : 0,
                fn (ServiceItem $item) => $item->id,
            ])
            ->groupBy(fn (ServiceItem $item) => $item->category ?: 'Other')
            ->map(fn (Collection $group, string $category) => [
                'category' => $category,
                'items' => $group->map(fn (ServiceItem $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                    'service_category_id' => $item->service_category_id,
                ])->values(),
            ])
            ->values();

        return Inertia::render('orders', [
            'bookings' => $bookings,
            'statuses' => Booking::STATUSES,
            'filters' => [
                'status' => $validated['status'] ?? 'all',
                'paid' => $validated['paid'] ?? 'all',
                'date_from' => $validated['date_from'] ?? null,
                'date_to' => $validated['date_to'] ?? null,
            ],
            'serviceCategories' => $serviceCategories,
            'serviceItemCategories' => $serviceItems,
        ]);
    }
}
