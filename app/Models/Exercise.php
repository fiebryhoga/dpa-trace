<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'instructions',
        'image_path',
        'video_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function compensations()
    {
        return $this->belongsToMany(DpaCompensation::class, 'dpa_compensation_exercises')
                    ->withPivot('phase', 'sort_order')
                    ->withTimestamps();
    }
}
