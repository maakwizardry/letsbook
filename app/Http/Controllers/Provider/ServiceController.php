<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $items = $request->user()->serviceItems()
            ->with('homeType')
            ->get()
            ->sortBy([
                fn (ServiceItem $item) => $item->home_type_id === null ? 1 : 0,
                fn (ServiceItem $item) => $item->id,
            ]);

        $categories = $items
            ->groupBy(fn (ServiceItem $item) => $item->category ?: 'Other')
            ->map(fn (Collection $group, string $category) => [
                'category' => $category,
                'items' => $group->map(fn (ServiceItem $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                    'home_type_label' => $item->homeType?->label,
                ])->values(),
            ])
            ->values();

        return Inertia::render('services', [
            'categories' => $categories,
            'total_count' => $items->count(),
        ]);
    }

    public function update(Request $request, ServiceItem $service): RedirectResponse
    {
        abort_if($service->provider_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $service->update($validated);

        return back();
    }
}
