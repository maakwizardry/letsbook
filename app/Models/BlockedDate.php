<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockedDate extends Model
{
    use HasFactory;

    protected $fillable = ['provider_id', 'staff_id', 'date', 'reason'];

    protected $casts = [
        'date' => 'date',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
