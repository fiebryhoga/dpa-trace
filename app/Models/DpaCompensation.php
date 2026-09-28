<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DpaCompensation extends Model
{
    use HasFactory;

    protected $table = 'dpa_compensations';

    protected $fillable = [
        'category',
        'name',
        'slug',
        'checkpoint',
        'image_path',
        'overactive_muscles',
        'underactive_muscles',
        'possible_injuries',
        'exercises_smr',
        'image_smr',
        'exercises_stretching',
        'image_stretching',
        'exercises_isometrics',
        'image_isometrics',
        'exercises_integrated',
        'image_integrated',
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
                $baseSlug = \Illuminate\Support\Str::slug($model->name) ?: 'comp-' . uniqid();
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
                $baseSlug = \Illuminate\Support\Str::slug($model->name) ?: 'comp-' . $model->id;
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

    public function assessmentDetails()
    {
        return $this->hasMany(DpaAssessmentDetail::class);
    }

    public function exercises()
    {
        return $this->belongsToMany(Exercise::class, 'dpa_compensation_exercises')
                    ->withPivot('phase', 'sort_order')
                    ->withTimestamps();
    }
}
