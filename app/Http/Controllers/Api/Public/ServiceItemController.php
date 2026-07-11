<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use Illuminate\Http\Request;

class ServiceItemController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceItem::select('id', 'name', 'price', 'category', 'home_type_id');
        
        if ($request->has('home_type_id')) {
            $query->where(function($q) use ($request) {
                $q->where('home_type_id', $request->home_type_id)
                  ->orWhereNull('home_type_id');
            });
        }

        return response()->json($query->get());
    }
}
