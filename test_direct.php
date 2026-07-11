<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Authenticate as provider
$user = \App\Models\User::first();
\Illuminate\Support\Facades\Auth::login($user);

// Get bookings
$request = \Illuminate\Http\Request::create('/api/provider/bookings', 'GET');
$response = $httpKernel->handle($request);
echo "GET /api/provider/bookings Response: " . $response->status() . "\n";
if ($response->status() === 200) {
    $bookings = json_decode($response->getContent(), true);
    if (count($bookings) > 0) {
        $bookingId = $bookings[0]['id'];
        echo "Updating booking $bookingId...\n";
        
        $request = \Illuminate\Http\Request::create("/api/provider/bookings/$bookingId", 'PATCH', ['status' => 'Scheduled']);
        $request->headers->set('Accept', 'application/json');
        $response = $httpKernel->handle($request);
        echo "PATCH Response: " . $response->status() . "\n";
        echo $response->getContent() . "\n";
    }
} else {
    echo $response->getContent() . "\n";
}
