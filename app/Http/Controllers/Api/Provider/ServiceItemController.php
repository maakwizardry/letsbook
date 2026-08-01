<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use App\Services\BookingCreator;
use Illuminate\Http\Request;

class ServiceItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'service_category_id' => 'nullable|exists:service_categories,id',
            'duration_hours' => 'nullable|integer|min:1|max:'.BookingCreator::MAX_DURATION_HOURS,
        ]);
        
        if (!empty($validated['service_category_id'])) {
            $request->user()->serviceCategories()->findOrFail($validated['service_category_id']);
        }
        
        $validated['provider_id'] = $request->user()->id;
        
        $serviceItem = ServiceItem::create($validated);
        return response()->json($serviceItem, 201);
    }

    public function update(Request $request, $id)
    {
        $serviceItem = ServiceItem::where('provider_id', $request->user()->id)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'service_category_id' => 'nullable|exists:service_categories,id',
            'duration_hours' => 'sometimes|required|integer|min:1|max:'.BookingCreator::MAX_DURATION_HOURS,
        ]);

        if (array_key_exists('service_category_id', $validated) && !empty($validated['service_category_id'])) {
            $request->user()->serviceCategories()->findOrFail($validated['service_category_id']);
        }

        $serviceItem->update($validated);
        return response()->json($serviceItem);
    }

    public function destroy(Request $request, $id)
    {
        $serviceItem = ServiceItem::where('provider_id', $request->user()->id)->findOrFail($id);
        $serviceItem->delete();
        return response()->json(null, 204);
    }
}
