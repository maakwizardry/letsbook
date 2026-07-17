<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StoryScene extends Model
{
    protected $fillable = [
        'uuid',
        'scene',
        'caption',
        'image_url',
        'is_processed',
        'is_posted',
    ];

    protected function casts(): array
    {
        return [
            'is_processed' => 'boolean',
            'is_posted' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (StoryScene $storyScene) {
            $storyScene->uuid ??= (string) Str::uuid();
        });
    }
}
