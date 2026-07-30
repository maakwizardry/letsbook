<?php

use App\Http\Controllers\Settings\BusinessController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/business', [BusinessController::class, 'edit'])->name('business.edit');
    Route::patch('settings/business/name', [BusinessController::class, 'updateName'])->name('business.name.update');
    Route::post('settings/business/photo', [BusinessController::class, 'updatePhoto'])->name('business.photo.update');
    Route::patch('settings/business/notifications', [BusinessController::class, 'updateNotifications'])->name('business.notifications.update');
});
