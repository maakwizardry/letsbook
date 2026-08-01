<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = ['provider_id', 'name', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    public function blockedDates()
    {
        return $this->hasMany(BlockedDate::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingSeries()
    {
        return $this->hasMany(BookingSeries::class);
    }
}
