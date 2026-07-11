<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function calculate(Request $request)
    {
        $request->validate([
            'home_type_id' => 'required|exists:home_types,id',
            'service_item_ids' => 'required|array',
            'service_item_ids.*' => 'exists:service_items,id',
        ]);

        $items = ServiceItem::whereIn('id', $request->service_item_ids)->get();
        
        $total = $items->sum('price');
        
        return response()->json([
            'total' => $total,
            'items' => $items,
        ]);
    }
}
