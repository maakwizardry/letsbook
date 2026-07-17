<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'Pending';

    public const STATUS_IN_PROGRESS = 'In Progress';

    public const STATUS_COMPLETED = 'Completed';

    public const STATUS_CANCELLED = 'Cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'provider_id',
        'customer_id',
        'home_type_id',
        'reference_id',
        'total_quote',
        'payment_method',
        'status',
        'is_paid',
        'paid_at',
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
        'paid_at' => 'datetime',
        'is_paid' => 'boolean',
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

    /**
     * Google Calendar "add event" link for this booking. Assumes a 2-hour
     * job duration (not tracked anywhere in the schema) and treats
     * scheduled_at as a floating local time (no schema-tracked timezone),
     * so it deliberately omits the "Z" UTC suffix Google would otherwise
     * use to convert the displayed time to the viewer's timezone.
     */
    public function googleCalendarUrl(): string
    {
        $start = $this->scheduled_at;
        $end = $start->clone()->addHours(2);

        $details = $this->items->map(fn (BookingItem $item) => $item->serviceItem->name)->implode(', ');
        $location = trim($this->customer->address.($this->customer->unit_number ? ', Unit '.$this->customer->unit_number : ''));

        return 'https://calendar.google.com/calendar/render?'.http_build_query([
            'action' => 'TEMPLATE',
            'text' => 'Cleaning — '.$this->provider->name,
            'dates' => $start->format('Ymd\THis').'/'.$end->format('Ymd\THis'),
            'details' => $details,
            'location' => $location,
        ]);
    }
}
