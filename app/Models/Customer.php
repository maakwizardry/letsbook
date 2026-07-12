<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'phone', 'email', 'address', 'unit_number', 'postal_code', 'latitude', 'longitude'];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
