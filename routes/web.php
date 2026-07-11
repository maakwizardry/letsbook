<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BookingWizardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/provider/{slug}', [BookingWizardController::class, 'show'])->name('provider.booking');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
