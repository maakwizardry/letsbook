<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'contact_info', 'slug'];

    public function users()
    {
        return $this->hasMany(User::class);
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
}
