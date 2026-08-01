<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate(['label' => 'required|string|max:255']);
        $validated['provider_id'] = $request->user()->id;
        
        $serviceCategory = ServiceCategory::create($validated);
        return response()->json($serviceCategory, 201);
    }

    public function update(Request $request, $id)
    {
        $serviceCategory = ServiceCategory::where('provider_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate(['label' => 'required|string|max:255']);
        $serviceCategory->update($validated);
        return response()->json($serviceCategory);
    }

    public function destroy(Request $request, $id)
    {
        $serviceCategory = ServiceCategory::where('provider_id', $request->user()->id)->findOrFail($id);
        $serviceCategory->delete();
        return response()->json(null, 204);
    }
}
