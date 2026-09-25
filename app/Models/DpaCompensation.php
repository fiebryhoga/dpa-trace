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

    public function assessmentDetails()
    {
        return $this->hasMany(DpaAssessmentDetail::class);
    }
}
