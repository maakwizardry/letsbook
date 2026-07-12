<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id', 
        'customer_id', 
        'home_type_id', 
        'reference_id',
        'total_quote',
        'payment_method',
        'status',
        'notes',
        'scheduled_at',
        'reminder_minutes_before',
        'remind_at',
        'reminder_sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'remind_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function homeType()
    {
        return $this->belongsTo(HomeType::class);
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }
}
