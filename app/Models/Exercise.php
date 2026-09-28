<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'instructions',
        'image_path',
        'video_url',
        'is_active',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('slug', $value)
            ->orWhere('id', $value)
            ->firstOrFail();
    }

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $baseSlug = \Illuminate\Support\Str::slug($model->name) ?: 'exercise-' . uniqid();
                $slug = $baseSlug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                $model->slug = $slug;
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && empty($model->slug)) {
                $baseSlug = \Illuminate\Support\Str::slug($model->name) ?: 'exercise-' . $model->id;
                $slug = $baseSlug;
                $count = 1;
                while (static::where('slug', $slug)->where('id', '!=', $model->id)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                $model->slug = $slug;
            }
        });
    }

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
