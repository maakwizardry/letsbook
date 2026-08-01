<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CreateProviderController;
use App\Http\Controllers\Api\Public\ServiceCategoryController as PublicServiceCategoryController;
use App\Http\Controllers\Api\Public\ServiceItemController as PublicServiceItemController;
use App\Http\Controllers\Api\Public\QuoteController as PublicQuoteController;
use App\Http\Controllers\Api\Public\BookingController as PublicBookingController;
use App\Http\Controllers\Api\Public\AvailabilityController as PublicAvailabilityController;

use App\Http\Controllers\Api\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Api\Provider\ServiceCategoryController as ProviderServiceCategoryController;
use App\Http\Controllers\Api\Provider\ServiceItemController as ProviderServiceItemController;
use App\Http\Controllers\AIGirlController;
use App\Http\Controllers\Api\ImageGenerationController;
use App\Http\Controllers\Api\StoryScenePublishController;

// Public Endpoints
Route::get('/service-categories', [PublicServiceCategoryController::class, 'index']);
Route::get('/service-items', [PublicServiceItemController::class, 'index']);
Route::post('/quote', [PublicQuoteController::class, 'calculate']);
Route::post('/bookings', [PublicBookingController::class, 'store']);
Route::get('/booked-slots', [PublicAvailabilityController::class, 'index']);
Route::post('/providers', [CreateProviderController::class, 'store']);
Route::post('/providers/onboard', [CreateProviderController::class, 'onboard']);
Route::post('/generate-ai-girl', [AIGirlController::class, 'generate']);
Route::post('/ai/generate-image', [ImageGenerationController::class, 'generate']);
Route::post('/ai/generate-image/{provider}', [ImageGenerationController::class, 'generate'])
    ->whereIn('provider', ['openai', 'gemini']);
Route::get('/story-scenes/next', [StoryScenePublishController::class, 'next']);
Route::get('/story-scenes/{uuid}/posted', [StoryScenePublishController::class, 'markPosted'])
    ->name('story-scenes.mark-posted');

// Provider Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('provider');
    });

    Route::get('/provider/bookings', [ProviderBookingController::class, 'index']);
    Route::get('/provider/bookings/{id}', [ProviderBookingController::class, 'show']);
    Route::patch('/provider/bookings/{id}', [ProviderBookingController::class, 'update']);
    
    Route::post('/service-categories', [ProviderServiceCategoryController::class, 'store']);
    Route::patch('/service-categories/{id}', [ProviderServiceCategoryController::class, 'update']);
    Route::delete('/service-categories/{id}', [ProviderServiceCategoryController::class, 'destroy']);
    
    Route::post('/service-items', [ProviderServiceItemController::class, 'store']);
    Route::patch('/service-items/{id}', [ProviderServiceItemController::class, 'update']);
    Route::delete('/service-items/{id}', [ProviderServiceItemController::class, 'destroy']);
});
