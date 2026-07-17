<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImageGeneration extends Model
{
    protected $fillable = [
        'prompt',
        'provider',
        'response',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'response' => 'array',
        ];
    }
}
