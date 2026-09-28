<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Athlete extends Model
{
    use HasFactory;

    protected $fillable = [
        'athlete_code',
        'full_name',
        'gender',
        'age',
        'height_cm',
        'weight_kg',
        'dominant_side',
        'injury_history',
        'phone_number',
        'photo_path',
        'is_active',
    ];

    public function getRouteKeyName(): string
    {
        return 'athlete_code';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('athlete_code', $value)
            ->orWhere('id', $value)
            ->firstOrFail();
    }

    protected $casts = [
        'age' => 'integer',
        'is_active' => 'boolean',
        'height_cm' => 'float',
        'weight_kg' => 'float',
    ];

    protected $appends = ['calculated_age', 'bmi', 'bmi_category', 'photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo_path) {
            return asset('storage/' . $this->photo_path);
        }
        return null;
    }

    public function getCalculatedAgeAttribute(): ?int
    {
        return $this->age;
    }

    public function getBmiAttribute(): ?float
    {
        if ($this->height_cm > 0 && $this->weight_kg > 0) {
            $heightM = $this->height_cm / 100;
            return round($this->weight_kg / ($heightM * $heightM), 1);
        }
        return null;
    }

    public function getBmiCategoryAttribute(): ?string
    {
        $bmi = $this->bmi;
        if (!$bmi) return null;
        if ($bmi < 18.5) return 'Underweight';
        if ($bmi < 24.9) return 'Normal';
        if ($bmi < 29.9) return 'Overweight';
        return 'Obese';
    }

    public function dpaAssessments()
    {
        return $this->hasMany(DpaAssessment::class)->orderBy('assessment_date', 'desc');
    }

    public function galleries()
    {
        return $this->hasMany(AthleteGallery::class)->latest();
    }
}
