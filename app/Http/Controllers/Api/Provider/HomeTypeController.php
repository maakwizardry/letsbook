<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\HomeType;
use Illuminate\Http\Request;

class HomeTypeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate(['label' => 'required|string|max:255']);
        $validated['provider_id'] = $request->user()->id;
        
        $homeType = HomeType::create($validated);
        return response()->json($homeType, 201);
    }

    public function update(Request $request, $id)
    {
        $homeType = HomeType::where('provider_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate(['label' => 'required|string|max:255']);
        $homeType->update($validated);
        return response()->json($homeType);
    }

    public function destroy(Request $request, $id)
    {
        $homeType = HomeType::where('provider_id', $request->user()->id)->findOrFail($id);
        $homeType->delete();
        return response()->json(null, 204);
    }
}
