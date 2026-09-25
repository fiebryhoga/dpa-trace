<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AthleteGallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'athlete_id',
        'image_path',
        'original_image_path',
        'annotations',
        'meta',
        'notes',
    ];

    protected $casts = [
        'annotations' => 'array',
        'meta' => 'array',
    ];

    public function athlete()
    {
        return $this->belongsTo(Athlete::class);
    }
}
