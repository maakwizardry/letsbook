<?php

use App\Models\HomeType;
use App\Models\Provider;
use App\Models\ServiceItem;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->provider = Provider::factory()->create([
        'name' => 'Test Cleaning Service',
        'contact_info' => 'contact@test.com',
        'slug' => 'test-cleaning-service'
    ]);
});    


test('provider can create a home type', function () {
    $response = $this->actingAs($this->provider)->postJson('/api/home-types', [
        'label' => 'Studio Apartment'
    ]);
    
    $response->assertStatus(201)
             ->assertJsonFragment(['label' => 'Studio Apartment']);
             
    $this->assertDatabaseHas('home_types', ['label' => 'Studio Apartment', 'provider_id' => $this->provider->id]);
});

test('provider can update a home type', function () {
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => 'Old Label']);
    
    $response = $this->actingAs($this->provider)->patchJson("/api/home-types/{$homeType->id}", [
        'label' => 'New Label'
    ]);
    
    $response->assertStatus(200)
             ->assertJsonFragment(['label' => 'New Label']);
             
    $this->assertDatabaseHas('home_types', ['id' => $homeType->id, 'label' => 'New Label']);
});

test('provider can delete a home type', function () {
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => 'To Delete']);
    
    $response = $this->actingAs($this->provider)->deleteJson("/api/home-types/{$homeType->id}");
    
    $response->assertStatus(204);
    $this->assertDatabaseMissing('home_types', ['id' => $homeType->id]);
});

test('provider can create a service item', function () {
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => '1BHK']);
    
    $response = $this->actingAs($this->provider)->postJson('/api/service-items', [
        'home_type_id' => $homeType->id,
        'name' => 'Window Cleaning',
        'price' => 50,
        'category' => 'Add-ons'
    ]);
    
    $response->assertStatus(201)
             ->assertJsonFragment(['name' => 'Window Cleaning']);
             
    $this->assertDatabaseHas('service_items', ['name' => 'Window Cleaning']);
});

test('provider can update a service item', function () {
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => '1BHK']);
    $serviceItem = ServiceItem::create([
        'provider_id' => $this->provider->id,
        'home_type_id' => $homeType->id,
        'name' => 'Old Service',
        'price' => 10,
        'category' => 'Base'
    ]);
    
    $response = $this->actingAs($this->provider)->patchJson("/api/service-items/{$serviceItem->id}", [
        'price' => 20
    ]);
    
    $response->assertStatus(200);
    $this->assertDatabaseHas('service_items', ['id' => $serviceItem->id, 'price' => 20]);
});

test('provider can delete a service item', function () {
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => '1BHK']);
    $serviceItem = ServiceItem::create([
        'provider_id' => $this->provider->id,
        'home_type_id' => $homeType->id,
        'name' => 'To Delete',
        'price' => 10,
        'category' => 'Base'
    ]);
    
    $response = $this->actingAs($this->provider)->deleteJson("/api/service-items/{$serviceItem->id}");
    
    $response->assertStatus(204);
    $this->assertDatabaseMissing('service_items', ['id' => $serviceItem->id]);
});

test('provider can view a single booking', function () {
    $customer = \App\Models\Customer::create(['name' => 'Test', 'email' => 'test@test.com']);
    $homeType = HomeType::create(['provider_id' => $this->provider->id, 'label' => '1BHK']);
    $booking = Booking::create([
        'provider_id' => $this->provider->id,
        'customer_id' => $customer->id,
        'home_type_id' => $homeType->id,
        'total_quote' => 100,
        'scheduled_at' => '2026-08-01 10:00:00'
    ]);
    
    $response = $this->actingAs($this->provider)->getJson("/api/provider/bookings/{$booking->id}");
    
    $response->assertStatus(200)
             ->assertJsonPath('id', $booking->id);
});
