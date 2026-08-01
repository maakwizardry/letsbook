<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    use HasFactory;

    protected $fillable = ['provider_id', 'staff_id', 'day_of_week', 'start_time', 'end_time'];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
