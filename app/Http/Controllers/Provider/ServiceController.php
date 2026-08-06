<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use App\Services\BookingCreator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    private const CATEGORY_ORDER = [
        'Standard Cleaning',
        'Deep Cleaning',
        'Move-In / Move-Out Cleaning',
    ];

    public function index(Request $request): Response
    {
        $items = $request->user()->serviceItems()
            ->with('serviceCategory')
            ->get()
            ->sortBy(fn (ServiceItem $item) => [
                self::categoryRank($item->category),
                $item->service_category_id ?? PHP_INT_MAX,
                $item->id,
            ]);

        $categories = $items
            ->groupBy(fn (ServiceItem $item) => $item->category ?: 'Other')
            ->map(fn (Collection $group, string $category) => [
                'category' => $category,
                'items' => $group->map(fn (ServiceItem $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => (float) $item->price,
                    'service_category_label' => $item->serviceCategory?->label,
                    'service_category_id' => $item->service_category_id,
                    'is_active' => $item->is_active,
                ])->values(),
            ])
            ->values();

        return Inertia::render('services', [
            'categories' => $categories,
            'total_count' => $items->count(),
            'serviceCategories' => $request->user()->serviceCategories()->get(['id', 'label']),
        ]);
    }

    /**
     * Mirrors the same-purpose categoryRank() in Booking/Index.tsx so the
     * provider's Services page and the customer-facing booking wizard order
     * categories identically.
     */
    private static function categoryRank(?string $category): int
    {
        $index = array_search($category, self::CATEGORY_ORDER, true);

        if ($index !== false) {
            return $index;
        }

        return $category === 'Add-ons' ? count(self::CATEGORY_ORDER) + 1 : count(self::CATEGORY_ORDER);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:255'],
            'service_category_id' => ['nullable', Rule::exists('service_categories', 'id')->where('provider_id', $request->user()->id)],
            'duration_hours' => ['nullable', 'integer', 'min:1', 'max:'.BookingCreator::MAX_DURATION_HOURS],
        ]);

        $request->user()->serviceItems()->create($validated);

        return back();
    }

    public function update(Request $request, ServiceItem $service): RedirectResponse
    {
        abort_if($service->provider_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'required', 'boolean'],
            'duration_hours' => ['sometimes', 'required', 'integer', 'min:1', 'max:'.BookingCreator::MAX_DURATION_HOURS],
        ]);

        $service->update($validated);

        return back();
    }
}
