<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingProgramItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_program_id',
        'exercise_id',
        'phase',
        'exercise_name',
        'target_muscle',
        'sets',
        'reps',
        'duration_seconds',
        'hold_seconds',
        'tempo',
        'rest_seconds',
        'frequency',
        'intensity',
        'coaching_cues',
        'sort_order',
    ];

    protected $casts = [
        'sets' => 'integer',
        'duration_seconds' => 'integer',
        'hold_seconds' => 'integer',
        'rest_seconds' => 'integer',
        'sort_order' => 'integer',
    ];

    public function program()
    {
        return $this->belongsTo(TrainingProgram::class, 'training_program_id');
    }

    public function exercise()
    {
        return $this->belongsTo(Exercise::class, 'exercise_id');
    }
}
