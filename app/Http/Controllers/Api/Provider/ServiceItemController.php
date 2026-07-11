<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use Illuminate\Http\Request;

class ServiceItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'home_type_id' => 'nullable|exists:home_types,id',
        ]);
        
        if (!empty($validated['home_type_id'])) {
            $request->user()->homeTypes()->findOrFail($validated['home_type_id']);
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
            'home_type_id' => 'nullable|exists:home_types,id',
        ]);
        
        if (array_key_exists('home_type_id', $validated) && !empty($validated['home_type_id'])) {
            $request->user()->homeTypes()->findOrFail($validated['home_type_id']);
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
