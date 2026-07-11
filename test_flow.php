<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Cookie\CookieJar;

echo "--- Testing Complete Booking Flow ---\n";

$baseUrl = 'http://localhost:8087';

// 1. Get Home Types
echo "\n1. Fetching Home Types...\n";
$homeTypes = Http::get("$baseUrl/api/home-types")->json();
echo "Found " . count($homeTypes) . " home types.\n";
if (empty($homeTypes)) die("No home types found.\n");
$homeTypeId = $homeTypes[0]['id'];

// 2. Get Service Items
echo "\n2. Fetching Service Items...\n";
$serviceItems = Http::get("$baseUrl/api/service-items", ['home_type_id' => $homeTypeId])->json();
echo "Found " . count($serviceItems) . " service items for home type $homeTypeId.\n";
$serviceItemIds = array_column(array_slice($serviceItems, 0, 2), 'id');

// 3. Create Bookings
echo "\n3. Creating 3 Bookings...\n";
$customers = [
    ['name' => 'Alice Smith', 'email' => 'alice@example.com', 'phone' => '555-0101'],
    ['name' => 'Bob Jones', 'email' => 'bob@example.com', 'phone' => '555-0102'],
    ['name' => 'Charlie Brown', 'email' => 'charlie@example.com', 'phone' => '555-0103']
];

foreach ($customers as $c) {
    $response = Http::post("$baseUrl/api/bookings", [
        'home_type_id' => $homeTypeId,
        'service_item_ids' => $serviceItemIds,
        'customer_name' => $c['name'],
        'customer_email' => $c['email'],
        'customer_phone' => $c['phone'],
        'notes' => 'Please bring extra supplies.'
    ]);
    if ($response->successful()) {
        echo " - Successfully created booking for {$c['name']} (Quote: $" . $response->json('booking.total_quote') . ")\n";
    } else {
        echo " - Failed to create booking for {$c['name']}: " . $response->body() . "\n";
    }
}

// 4. Provider Flow - Authenticate and Fetch Bookings
echo "\n4. Provider Flow: Authenticate and Manage Bookings\n";
$cookieJar = new CookieJar();

// Get CSRF Cookie
$response = Http::withOptions(['cookies' => $cookieJar])->get("$baseUrl/sanctum/csrf-cookie");

$xsrfToken = '';
foreach ($cookieJar->toArray() as $cookie) {
    if ($cookie['Name'] === 'XSRF-TOKEN') {
        $xsrfToken = urldecode($cookie['Value']);
        break;
    }
}

// Login
$loginResponse = Http::withOptions(['cookies' => $cookieJar])
    ->withHeaders([
        'X-XSRF-TOKEN' => $xsrfToken,
        'Referer' => $baseUrl,
        'Accept' => 'application/json'
    ])
    ->post("$baseUrl/login", [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

if ($loginResponse->successful() || $loginResponse->status() === 204) {
    echo " - Provider logged in successfully.\n";
    
    // Fetch bookings
    $bookingsResponse = Http::withOptions(['cookies' => $cookieJar])
        ->withHeaders([
            'X-XSRF-TOKEN' => $xsrfToken,
            'Referer' => $baseUrl,
            'Accept' => 'application/json'
        ])
        ->get("$baseUrl/api/provider/bookings");
        
    if ($bookingsResponse->successful()) {
        $bookings = $bookingsResponse->json();
        echo " - Provider found " . count($bookings) . " total bookings.\n";
        
        if (count($bookings) > 0) {
            $bookingId = $bookings[0]['id'];
            echo " - Updating status of booking #$bookingId to 'Scheduled'...\n";
            
            $updateResponse = Http::withOptions(['cookies' => $cookieJar])
                ->withHeaders([
                    'X-XSRF-TOKEN' => $xsrfToken,
                    'Referer' => $baseUrl,
                    'Accept' => 'application/json'
                ])
                ->patch("$baseUrl/api/provider/bookings/$bookingId", [
                    'status' => 'Scheduled'
                ]);
                
            if ($updateResponse->successful()) {
                echo " - Successfully updated booking status to: " . $updateResponse->json('status') . "\n";
            } else {
                echo " - Failed to update status: " . $updateResponse->body() . "\n";
            }
        }
    } else {
        echo " - Failed to fetch bookings: " . $bookingsResponse->body() . "\n";
    }
} else {
    echo " - Provider login failed: " . $loginResponse->status() . " " . $loginResponse->body() . "\n";
}

echo "\n--- Flow Test Complete ---\n";
