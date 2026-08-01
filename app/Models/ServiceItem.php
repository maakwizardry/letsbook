<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceItem extends Model
{
    use HasFactory;

    protected $fillable = ['provider_id', 'name', 'price', 'category', 'service_category_id', 'is_active', 'duration_hours'];

    protected $casts = [
        'is_active' => 'boolean',
        'duration_hours' => 'integer',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class);
    }
}
