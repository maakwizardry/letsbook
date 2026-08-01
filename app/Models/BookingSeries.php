<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingSeries extends Model
{
    use HasFactory;

    protected $table = 'booking_series';

    protected $fillable = [
        'provider_id',
        'customer_id',
        'staff_id',
        'service_category_id',
        'frequency',
        'days_of_week',
        'starts_at',
        'duration_hours',
        'ends_on',
        'max_occurrences',
        'occurrences_created',
        'generated_through',
        'payment_method',
        'reminder_minutes_before',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'days_of_week' => 'array',
        'starts_at' => 'datetime',
        'duration_hours' => 'integer',
        'ends_on' => 'date',
        'generated_through' => 'date',
        'is_active' => 'boolean',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function serviceItems()
    {
        return $this->belongsToMany(ServiceItem::class, 'booking_series_items');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
