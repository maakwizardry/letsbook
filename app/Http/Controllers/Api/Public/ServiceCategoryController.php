<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:providers,id',
        ]);

        return response()->json(
            ServiceCategory::where('provider_id', $request->provider_id)
                ->select('id', 'label', 'provider_id')
                ->get()
        );
    }
}
