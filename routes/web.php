<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BookingWizardController;
use App\Http\Controllers\Provider\DashboardController;
use App\Http\Controllers\Provider\OrderController;
use App\Http\Controllers\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Provider\AvailabilityController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::patch('bookings/{booking}', [ProviderBookingController::class, 'update'])->name('bookings.update');
    Route::get('availability', [AvailabilityController::class, 'index'])->name('availability');
    Route::put('availability', [AvailabilityController::class, 'update'])->name('availability.update');
});

Route::get('/provider/{slug}', [BookingWizardController::class, 'show'])->name('provider.booking');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
