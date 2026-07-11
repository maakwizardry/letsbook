<?php

namespace Database\Seeders;

use App\Models\HomeType;
use App\Models\Provider;
use App\Models\ServiceItem;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a Provider
        $provider = Provider::create([
            'name' => 'Demo Cleaning Service',
            'contact_info' => 'contact@democleaning.com',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'slug' => 'demo-cleaning-service',
        ]);

        // Create Home Types
        $homeType1 = HomeType::create([
            'provider_id' => $provider->id,
            'label' => '1BHK Apartment',
        ]);

        $homeType2 = HomeType::create([
            'provider_id' => $provider->id,
            'label' => '2BHK Apartment',
        ]);

        $homeType3 = HomeType::create([
            'provider_id' => $provider->id,
            'label' => '3BHK+ / Villa',
        ]);

        // Create Service Items
        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Deep Cleaning (1BHK)',
            'price' => 150.00,
            'category' => 'Deep Cleaning',
            'home_type_id' => $homeType1->id,
        ]);

        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Standard Cleaning (1BHK)',
            'price' => 100.00,
            'category' => 'Standard Cleaning',
            'home_type_id' => $homeType1->id,
        ]);

        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Deep Cleaning (2BHK)',
            'price' => 200.00,
            'category' => 'Deep Cleaning',
            'home_type_id' => $homeType2->id,
        ]);

        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Standard Cleaning (2BHK)',
            'price' => 140.00,
            'category' => 'Standard Cleaning',
            'home_type_id' => $homeType2->id,
        ]);

        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Fridge Cleaning Add-on',
            'price' => 30.00,
            'category' => 'Add-ons',
            'home_type_id' => null, // applies to any
        ]);

        ServiceItem::create([
            'provider_id' => $provider->id,
            'name' => 'Oven Cleaning Add-on',
            'price' => 40.00,
            'category' => 'Add-ons',
            'home_type_id' => null, // applies to any
        ]);
    }
}
