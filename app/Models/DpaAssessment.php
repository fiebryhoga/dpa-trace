<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DpaAssessment extends Model
{
    use HasFactory;

    protected $table = 'dpa_assessments';

    protected $fillable = [
        'athlete_id',
        'assessor_id',
        'assessment_date',
        'current_height_cm',
        'current_weight_kg',
        'notes',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'current_height_cm' => 'float',
        'current_weight_kg' => 'float',
    ];

    public function athlete()
    {
        return $this->belongsTo(Athlete::class);
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    public function details()
    {
        return $this->hasMany(DpaAssessmentDetail::class);
    }

    public function compensations()
    {
        return $this->belongsToMany(DpaCompensation::class, 'dpa_assessment_details')
                    ->withPivot('severity', 'side', 'specific_note')
                    ->withTimestamps();
    }
}
