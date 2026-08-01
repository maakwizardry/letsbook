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
            'service_category_id' => 'required|exists:service_categories,id',
            'service_item_ids' => 'required|array',
            'service_item_ids.*' => 'exists:service_items,id',
        ]);

        $items = ServiceItem::whereIn('id', $request->service_item_ids)->get();

        $total = $items->sum('price');

        // Mirrors the duration logic in Api/Public/BookingController@store —
        // the longest single selected item, not the sum of all of them.
        $durationHours = $items->max('duration_hours') ?? 1;

        return response()->json([
            'total' => $total,
            'duration_hours' => $durationHours,
            'items' => $items,
        ]);
    }
}
