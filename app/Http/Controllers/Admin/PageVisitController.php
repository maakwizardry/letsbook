<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageVisit;
use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageVisitController extends Controller
{
    public function index(Request $request): Response
    {
        $visits = PageVisit::with('provider:id,name,slug')
            ->when($request->filled('provider'), fn ($query) => $query->whereHas(
                'provider',
                fn ($q) => $q->where('slug', $request->string('provider'))
            ))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('visited_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('visited_at', '<=', $request->date('to')))
            ->orderByDesc('visited_at')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (PageVisit $visit) => [
                'id' => $visit->id,
                'provider_name' => $visit->provider->name,
                'provider_slug' => $visit->provider->slug,
                'ip_address' => $visit->ip_address,
                'user_agent' => $visit->user_agent,
                'referrer' => $visit->referrer,
                'visited_at' => $visit->visited_at->toIso8601String(),
            ]);

        $topProviders = PageVisit::selectRaw('provider_id, COUNT(*) as visits')
            ->with('provider:id,name,slug')
            ->groupBy('provider_id')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn (PageVisit $row) => [
                'name' => $row->provider->name,
                'slug' => $row->provider->slug,
                'visits' => (int) $row->visits,
            ]);

        return Inertia::render('admin/visits', [
            'visits' => $visits,
            'topProviders' => $topProviders,
            'filters' => $request->only(['provider', 'from', 'to']),
            'totalVisits' => PageVisit::count(),
            'providerCount' => Provider::whereHas('pageVisits')->count(),
        ]);
    }
}
