<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TrainingProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'athlete_id',
        'dpa_assessment_id',
        'user_id',
        'name',
        'slug',
        'status',
        'start_date',
        'end_date',
        'frequency_per_week',
        'duration_weeks',
        'scheduled_days',
        'schedule_dates',
        'completed_dates',
        'session_notes',
        'description',
        'target_compensations',
        'target_muscles_overactive',
        'target_muscles_underactive',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'frequency_per_week' => 'integer',
        'duration_weeks' => 'integer',
        'scheduled_days' => 'array',
        'schedule_dates' => 'array',
        'completed_dates' => 'array',
        'session_notes' => 'array',
        'target_compensations' => 'array',
        'target_muscles_overactive' => 'array',
        'target_muscles_underactive' => 'array',
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
                $baseSlug = Str::slug($model->name) ?: 'program-' . uniqid();
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
                $baseSlug = Str::slug($model->name) ?: 'program-' . $model->id;
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

    public function athlete()
    {
        return $this->belongsTo(Athlete::class);
    }

    public function assessment()
    {
        return $this->belongsTo(DpaAssessment::class, 'dpa_assessment_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(TrainingProgramItem::class)->orderBy('sort_order');
    }

    public function inhibitItems()
    {
        return $this->hasMany(TrainingProgramItem::class)->where('phase', 'inhibit')->orderBy('sort_order');
    }

    public function lengthenItems()
    {
        return $this->hasMany(TrainingProgramItem::class)->where('phase', 'lengthen')->orderBy('sort_order');
    }

    public function activateItems()
    {
        return $this->hasMany(TrainingProgramItem::class)->where('phase', 'activate')->orderBy('sort_order');
    }

    public function integrateItems()
    {
        return $this->hasMany(TrainingProgramItem::class)->where('phase', 'integrate')->orderBy('sort_order');
    }
}
