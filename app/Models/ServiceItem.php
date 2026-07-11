<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceItem extends Model
{
    use HasFactory;

    protected $fillable = ['provider_id', 'name', 'price', 'category', 'home_type_id'];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function homeType()
    {
        return $this->belongsTo(HomeType::class);
    }
}
