<?php

use App\Http\Controllers\BookingWizardController;
use App\Http\Controllers\Provider\AvailabilityController;
use App\Http\Controllers\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Provider\CustomerController;
use App\Http\Controllers\Provider\DashboardController;
use App\Http\Controllers\Provider\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::get('customers', [CustomerController::class, 'index'])->name('customers');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::patch('bookings/{booking}', [ProviderBookingController::class, 'update'])->name('bookings.update');
    Route::get('availability', [AvailabilityController::class, 'index'])->name('availability');
    Route::put('availability', [AvailabilityController::class, 'update'])->name('availability.update');
});

Route::get('/business/{slug}', [BookingWizardController::class, 'show'])->name('provider.booking');

// Keep any already-shared /provider/{slug} links working after the move to /business/{slug}.
Route::permanentRedirect('/provider/{slug}', '/business/{slug}');

Route::get('/create-provider/secret', function () {
    return view('create-provider');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
