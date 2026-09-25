<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DpaAssessmentDetail extends Model
{
    use HasFactory;

    protected $table = 'dpa_assessment_details';

    protected $fillable = [
        'dpa_assessment_id',
        'dpa_compensation_id',
        'severity',
        'side',
        'specific_note',
    ];

    public function assessment()
    {
        return $this->belongsTo(DpaAssessment::class, 'dpa_assessment_id');
    }

    public function compensation()
    {
        return $this->belongsTo(DpaCompensation::class, 'dpa_compensation_id');
    }
}
