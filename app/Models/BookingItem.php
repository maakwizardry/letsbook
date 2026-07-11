<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'service_item_id', 'price_at_booking'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function serviceItem()
    {
        return $this->belongsTo(ServiceItem::class);
    }
}
