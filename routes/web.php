<?php

use App\Http\Controllers\BookingWizardController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\Provider\AvailabilityController;
use App\Http\Controllers\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Provider\BookingSeriesController;
use App\Http\Controllers\Provider\CustomerController;
use App\Http\Controllers\Provider\DashboardController;
use App\Http\Controllers\Provider\OrderController;
use App\Http\Controllers\Provider\ServiceController;
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
    Route::post('bookings', [ProviderBookingController::class, 'store'])->name('bookings.store');
    Route::patch('bookings/{booking}', [ProviderBookingController::class, 'update'])->name('bookings.update');
    Route::patch('booking-series/{bookingSeries}', [BookingSeriesController::class, 'stop'])->name('booking-series.stop');
    Route::get('availability', [AvailabilityController::class, 'index'])->name('availability');
    Route::put('availability', [AvailabilityController::class, 'update'])->name('availability.update');
    Route::get('services', [ServiceController::class, 'index'])->name('services');
    Route::patch('services/{service}', [ServiceController::class, 'update'])->name('services.update');
});

Route::get('/business/{slug}', [BookingWizardController::class, 'show'])->name('provider.booking');

Route::get('/help', [HelpController::class, 'index'])->name('help');

// Keep any already-shared /provider/{slug} links working after the move to /business/{slug}.
Route::permanentRedirect('/provider/{slug}', '/business/{slug}');

Route::get('/create-provider/secret', function () {
    return view('create-provider');
});

Route::get('/create-provider/onboard', function () {
    return view('create-provider-onboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
