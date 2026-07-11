<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeType extends Model
{
    use HasFactory;

    protected $fillable = ['provider_id', 'label'];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function serviceItems()
    {
        return $this->hasMany(ServiceItem::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
