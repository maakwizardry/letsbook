<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\HomeType;
use App\Models\ServiceItem;
use Illuminate\Http\Request;

class ServiceItemController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'home_type_id' => 'required|exists:home_types,id',
        ]);

        $homeType = HomeType::findOrFail($request->home_type_id);

        $items = ServiceItem::select('id', 'name', 'price', 'category', 'home_type_id')
            ->where('provider_id', $homeType->provider_id)
            ->where(function ($q) use ($request) {
                $q->where('home_type_id', $request->home_type_id)
                  ->orWhereNull('home_type_id');
            })
            ->get();

        return response()->json($items);
    }
}
