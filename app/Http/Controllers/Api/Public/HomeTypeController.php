<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\HomeType;

class HomeTypeController extends Controller
{
    public function index()
    {
        return response()->json(HomeType::select('id', 'label')->get());
    }
}
