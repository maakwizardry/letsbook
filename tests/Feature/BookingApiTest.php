<?php

use App\Models\HomeType;
use App\Models\Provider;
use App\Models\ServiceItem;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->provider = Provider::create([
        'name' => 'Test Cleaning Service',
        'contact_info' => 'contact@test.com',
        'slug' => 'test-cleaning-service'
    ]);
    
    $this->user = User::factory()->create([
        'provider_id' => $this->provider->id,
    ]);
    
    $this->homeType = HomeType::create([
        'provider_id' => $this->provider->id,
        'label' => '1BHK Apartment'
    ]);
    
    $this->serviceItem1 = ServiceItem::create([
        'provider_id' => $this->provider->id,
        'home_type_id' => $this->homeType->id,
        'name' => 'Deep Cleaning',
        'price' => 150,
        'category' => 'Cleaning'
    ]);
    
    $this->serviceItem2 = ServiceItem::create([
        'provider_id' => $this->provider->id,
        'home_type_id' => $this->homeType->id,
        'name' => 'Standard Cleaning',
        'price' => 100,
        'category' => 'Cleaning'
    ]);
});

test('can fetch public home types', function () {
    $response = $this->getJson('/api/home-types');
    $response->assertStatus(200)
             ->assertJsonFragment(['label' => '1BHK Apartment']);
});

test('can fetch public service items for home type', function () {
    $response = $this->getJson('/api/service-items?home_type_id=' . $this->homeType->id);
    $response->assertStatus(200)
             ->assertJsonCount(2)
             ->assertJsonFragment(['name' => 'Deep Cleaning']);
});

test('can calculate a quote', function () {
    $response = $this->postJson('/api/quote', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id, $this->serviceItem2->id]
    ]);
    
    $response->assertStatus(200)
             ->assertJson(['total' => 250]);
});

test('can submit a booking', function () {
    $response = $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id, $this->serviceItem2->id],
        'customer_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'scheduled_at' => '2026-08-01 10:00:00'
    ]);
    
    $response->assertStatus(201)
             ->assertJsonFragment(['status' => 'success']);
             
    // Since the total_quote might be returned as a string "250.00" depending on decimal casting, let's just assert the fragment or status.
    $this->assertDatabaseHas('bookings', [
        'customer_id' => \App\Models\Customer::where('email', 'john@example.com')->first()->id,
        'total_quote' => 250
    ]);
});

test('provider can fetch their bookings', function () {
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'scheduled_at' => '2026-08-01 14:00:00'
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/provider/bookings');
    $response->assertStatus(200)
             ->assertJsonCount(1);
});

test('provider can update a booking status', function () {
    $response = $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'scheduled_at' => '2026-08-01 16:00:00'
    ]);
    
    $bookingId = $response->json('booking.id');
    
    $updateResponse = $this->actingAs($this->user)->patchJson("/api/provider/bookings/{$bookingId}", [
        'status' => 'Scheduled'
    ]);
    
    $updateResponse->assertStatus(200)
                   ->assertJsonFragment(['status' => 'Scheduled']);
});

test('prevents double booking within 1 hour', function () {
    // First booking at 10:00
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Alice',
        'scheduled_at' => '2026-08-01 10:00:00'
    ])->assertStatus(201);

    // Second booking at 10:30 should fail
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Bob',
        'scheduled_at' => '2026-08-01 10:30:00'
    ])->assertStatus(422);
    
    // Second booking at 11:00 should succeed (exactly 1 hour apart)
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Charlie',
        'scheduled_at' => '2026-08-01 11:00:00'
    ])->assertStatus(201);
});

test('cancelled bookings free up the slot', function () {
    // First booking at 10:00
    $bookingResponse = $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Alice',
        'scheduled_at' => '2026-08-01 10:00:00'
    ]);
    
    $bookingId = $bookingResponse->json('booking.id');
    
    // Cancel the booking
    $this->actingAs($this->user)->patchJson("/api/provider/bookings/{$bookingId}", [
        'status' => 'Cancelled'
    ]);
    
    // Booking same slot should now succeed
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Bob',
        'scheduled_at' => '2026-08-01 10:00:00'
    ])->assertStatus(201);
});

test('public endpoint returns booked slots and ignores cancelled ones', function () {
    $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Alice',
        'scheduled_at' => '2026-08-01 10:00:00'
    ]);
    
    $cancelledResponse = $this->postJson('/api/bookings', [
        'home_type_id' => $this->homeType->id,
        'service_item_ids' => [$this->serviceItem1->id],
        'customer_name' => 'Bob',
        'scheduled_at' => '2026-08-01 15:00:00'
    ]);
    $cancelledId = $cancelledResponse->json('booking.id');
    
    $this->actingAs($this->user)->patchJson("/api/provider/bookings/{$cancelledId}", [
        'status' => 'Cancelled'
    ]);
    
    $response = $this->getJson('/api/booked-slots?provider_id=' . $this->provider->id);
    
    $response->assertStatus(200)
             ->assertJsonCount(1, 'booked_slots');
             
    $this->assertStringContainsString('2026-08-01T10:00:00', $response->json('booked_slots.0'));
});
