<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Provider extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Controls one thing: does the wizard collect a customer address.
     * 'regular' = yes (the provider travels to the customer — cleaning,
     * and any other mobile service). 'appointment' = no (the customer
     * comes to the provider — barber, dentist, etc.). Deliberately not an
     * exhaustive per-niche list — a barber and a dentist need the same
     * *behavior*, just different copy, which is business_niche's job. New
     * niches should map onto one of these two, not add a third value,
     * unless a future niche genuinely needs different booking *behavior*.
     */
    public const BUSINESS_TYPE_REGULAR = 'regular';

    public const BUSINESS_TYPE_APPOINTMENT = 'appointment';

    public const BUSINESS_TYPES = [
        self::BUSINESS_TYPE_REGULAR,
        self::BUSINESS_TYPE_APPOINTMENT,
    ];

    /**
     * business_niche controls wizard *wording*, full stop — business_type
     * has no say in it. Freeform (not a DB enum); these constants are just
     * named references for niches that have their own tailored wizard copy
     * (see resources/js/pages/Booking/Index.tsx). Setting business_niche to
     * a value not listed here is fine; it falls back to generic copy until
     * it's given its own entry. Defaults to 'cleaning' at the DB level
     * since that's every existing provider's actual business today.
     */
    public const NICHE_CLEANING = 'cleaning';

    public const NICHE_BARBER = 'barber';

    public const NICHE_DENTIST = 'dentist';

    public const KNOWN_NICHES = [
        self::NICHE_CLEANING,
        self::NICHE_BARBER,
        self::NICHE_DENTIST,
    ];

    protected $fillable = [
        'name',
        'contact_info',
        'etransfer_email',
        'slug',
        'external_url',
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
        'notifications_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'invitation_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'invitation_token' => 'hashed',
            'notifications_enabled' => 'boolean',
            'uses_staff_scheduling' => 'boolean',
        ];
    }

    public function serviceCategories()
    {
        return $this->hasMany(ServiceCategory::class);
    }

    public function serviceItems()
    {
        return $this->hasMany(ServiceItem::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingSeries()
    {
        return $this->hasMany(BookingSeries::class);
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    public function blockedDates()
    {
        return $this->hasMany(BlockedDate::class);
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    /**
     * Give a freshly registered provider a starter catalog so their booking
     * page isn't empty before they've had a chance to configure it.
     *
     * $niche picks the catalog independently of whatever this provider's
     * own business_niche column currently holds — so a pilot can be seeded
     * correctly regardless of when its niche gets saved to the database.
     * null (every real signup today — the field isn't mass-assignable, so
     * a fresh registration never has one to pass) or any niche without its
     * own catalog below seeds the same catalog every real provider gets
     * today.
     */
    public function seedDefaultCatalog(?string $niche = null): void
    {
        match ($niche) {
            self::NICHE_BARBER => $this->seedBarberCatalog(),
            self::NICHE_DENTIST => $this->seedDentistCatalog(),
            default => $this->seedCleaningCatalog(),
        };

        $this->seedDefaultAvailability();
    }

    private function seedCleaningCatalog(): void
    {
        $serviceCategories = [
            '1 Bedroom Apartment' => ['standard' => 100, 'deep' => 150],
            '2 Bedroom Apartment' => ['standard' => 140, 'deep' => 200],
            '3+ Bedroom / House' => ['standard' => 180, 'deep' => 260],
        ];

        foreach ($serviceCategories as $label => $prices) {
            $serviceCategory = $this->serviceCategories()->create(['label' => $label]);

            $this->serviceItems()->create([
                'name' => "Standard Cleaning ({$label})",
                'price' => $prices['standard'],
                'category' => 'Standard Cleaning',
                'service_category_id' => $serviceCategory->id,
            ]);

            $this->serviceItems()->create([
                'name' => "Deep Cleaning ({$label})",
                'price' => $prices['deep'],
                'category' => 'Deep Cleaning',
                'service_category_id' => $serviceCategory->id,
            ]);
        }

        $this->serviceItems()->create([
            'name' => 'Fridge Cleaning Add-on',
            'price' => 30,
            'category' => 'Add-ons',
            'service_category_id' => null,
        ]);

        $this->serviceItems()->create([
            'name' => 'Oven Cleaning Add-on',
            'price' => 40,
            'category' => 'Add-ons',
            'service_category_id' => null,
        ]);
    }

    private function seedBarberCatalog(): void
    {
        $category = $this->serviceCategories()->create(['label' => 'Barber Services']);

        $items = [
            'Haircut' => 30,
            'Beard Trim' => 15,
            'Haircut + Beard' => 40,
            'Kids Haircut' => 20,
        ];

        foreach ($items as $name => $price) {
            $this->serviceItems()->create([
                'name' => $name,
                'price' => $price,
                'category' => 'Services',
                'service_category_id' => $category->id,
            ]);
        }
    }

    private function seedDentistCatalog(): void
    {
        $category = $this->serviceCategories()->create(['label' => 'Dental Services']);

        $items = [
            'Check-up & Cleaning' => 120,
            'Consultation' => 50,
            'Filling' => 180,
            'Teeth Whitening' => 250,
        ];

        foreach ($items as $name => $price) {
            $this->serviceItems()->create([
                'name' => $name,
                'price' => $price,
                'category' => 'Services',
                'service_category_id' => $category->id,
            ]);
        }
    }

    /**
     * Default working days (Mon/Wed/Fri, 9am-5pm) given to providers who
     * haven't configured their own schedule yet. Each day has a midday gap
     * (12-1pm) so at least one slot shows as unavailable rather than the
     * whole day being wide open.
     */
    public function seedDefaultAvailability(): void
    {
        foreach ([1, 3, 5] as $dayOfWeek) {
            $this->availabilities()->create([
                'day_of_week' => $dayOfWeek,
                'start_time' => '09:00',
                'end_time' => '12:00',
            ]);

            $this->availabilities()->create([
                'day_of_week' => $dayOfWeek,
                'start_time' => '13:00',
                'end_time' => '17:00',
            ]);
        }
    }
}
