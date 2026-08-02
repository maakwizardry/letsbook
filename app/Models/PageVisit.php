<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    public $timestamps = false;

    protected $fillable = ['provider_id', 'ip_address', 'user_agent', 'referrer', 'visited_at'];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
