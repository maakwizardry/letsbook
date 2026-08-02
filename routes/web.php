<?php

use App\Http\Controllers\Admin\PageVisitController;
use App\Http\Controllers\BookingWizardController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\Provider\AvailabilityController;
use App\Http\Controllers\Provider\BlockedDateController;
use App\Http\Controllers\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Provider\BookingSeriesController;
use App\Http\Controllers\Provider\CustomerController;
use App\Http\Controllers\Provider\DashboardController;
use App\Http\Controllers\Provider\OrderController;
use App\Http\Controllers\Provider\ServiceController;
use App\Http\Controllers\Provider\StaffController;
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
    Route::post('blocked-dates', [BlockedDateController::class, 'store'])->name('blocked-dates.store');
    Route::delete('blocked-dates/{blockedDate}', [BlockedDateController::class, 'destroy'])->name('blocked-dates.destroy');
    Route::get('services', [ServiceController::class, 'index'])->name('services');
    Route::post('services', [ServiceController::class, 'store'])->name('services.store');
    Route::patch('services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::get('staff', [StaffController::class, 'index'])->name('staff');
    Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
    Route::patch('staff/{id}', [StaffController::class, 'update'])->name('staff.update');
    Route::delete('staff/{id}', [StaffController::class, 'destroy'])->name('staff.destroy');
    Route::put('staff/{id}/availability', [StaffController::class, 'updateAvailability'])->name('staff.availability.update');
});

Route::get('/business/{slug}', [BookingWizardController::class, 'show'])->name('provider.booking');

Route::get('/admin/visits', [PageVisitController::class, 'index'])
    ->middleware(['auth', 'can:viewPageVisits'])
    ->name('admin.visits');

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
