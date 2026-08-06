<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Models\ServiceItem;
use Illuminate\Http\Request;

class ServiceItemController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'service_category_id' => 'required|exists:service_categories,id',
        ]);

        $serviceCategory = ServiceCategory::findOrFail($request->service_category_id);

        $items = ServiceItem::select('id', 'name', 'description', 'price', 'category', 'service_category_id')
            ->where('provider_id', $serviceCategory->provider_id)
            ->where('is_active', true)
            ->where(function ($q) use ($request) {
                $q->where('service_category_id', $request->service_category_id)
                  ->orWhereNull('service_category_id');
            })
            ->get();

        return response()->json($items);
    }
}
