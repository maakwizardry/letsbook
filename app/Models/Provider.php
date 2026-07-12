<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Provider extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'contact_info',
        'etransfer_email',
        'slug',
        'email',
        'password',
        'logo_path',
        'cover_image_path',
        'tagline',
        'rating',
        'years_in_business',
        'brand_color',
        'is_insured',
        'is_background_checked',
        'has_satisfaction_guarantee',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function homeTypes()
    {
        return $this->hasMany(HomeType::class);
    }

    public function serviceItems()
    {
        return $this->hasMany(ServiceItem::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    /**
     * Give a freshly registered provider a starter catalog so their booking
     * page isn't empty before they've had a chance to configure it.
     */
    public function seedDefaultCatalog(): void
    {
        $homeTypes = [
            '1 Bedroom Apartment' => ['standard' => 100, 'deep' => 150],
            '2 Bedroom Apartment' => ['standard' => 140, 'deep' => 200],
            '3+ Bedroom / House' => ['standard' => 180, 'deep' => 260],
        ];

        foreach ($homeTypes as $label => $prices) {
            $homeType = $this->homeTypes()->create(['label' => $label]);

            $this->serviceItems()->create([
                'name' => "Standard Cleaning ({$label})",
                'price' => $prices['standard'],
                'category' => 'Standard Cleaning',
                'home_type_id' => $homeType->id,
            ]);

            $this->serviceItems()->create([
                'name' => "Deep Cleaning ({$label})",
                'price' => $prices['deep'],
                'category' => 'Deep Cleaning',
                'home_type_id' => $homeType->id,
            ]);
        }

        $this->serviceItems()->create([
            'name' => 'Fridge Cleaning Add-on',
            'price' => 30,
            'category' => 'Add-ons',
            'home_type_id' => null,
        ]);

        $this->serviceItems()->create([
            'name' => 'Oven Cleaning Add-on',
            'price' => 40,
            'category' => 'Add-ons',
            'home_type_id' => null,
        ]);
    }
}
