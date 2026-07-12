<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AvailabilityController extends Controller
{
    public function index(Request $request): Response
    {
        $schedule = $request->user()->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($availability) => [
                'id' => $availability->id,
                'day_of_week' => $availability->day_of_week,
                'start_time' => substr($availability->start_time, 0, 5),
                'end_time' => substr($availability->end_time, 0, 5),
            ]);

        return Inertia::render('availability', [
            'schedule' => $schedule,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'schedule' => 'present|array',
            'schedule.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedule.*.start_time' => 'required|date_format:H:i',
            'schedule.*.end_time' => 'required|date_format:H:i|after:schedule.*.start_time',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $request->user()->availabilities()->delete();

            $rows = collect($validated['schedule'])->map(fn ($range) => [
                'provider_id' => $request->user()->id,
                'day_of_week' => $range['day_of_week'],
                'start_time' => $range['start_time'],
                'end_time' => $range['end_time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($rows->isNotEmpty()) {
                DB::table('availabilities')->insert($rows->all());
            }
        });

        return back();
    }
}
