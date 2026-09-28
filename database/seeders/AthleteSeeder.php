<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaCompensation;
use App\Models\DpaAssessmentDetail;
use App\Models\User;

class AthleteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::first();

        $athletes = [
            [
                'athlete_code' => 'DPA-2026-001',
                'full_name' => 'Dimas Arya Pratama',
                'gender' => 'L',
                'age' => 22,
                'height_cm' => 184.0,
                'weight_kg' => 76.5,
                'dominant_side' => 'R',
                'injury_history' => 'Pernah sprain pergelangan kaki kanan tahun 2024 (sudah pulih)',
                'phone_number' => '081234567890',
                'is_active' => true,
            ],
            [
                'athlete_code' => 'DPA-2026-002',
                'full_name' => 'Siti Rahmawati',
                'gender' => 'P',
                'age' => 21,
                'height_cm' => 168.0,
                'weight_kg' => 58.0,
                'dominant_side' => 'R',
                'injury_history' => 'Tightness hamstring bilateral pasca kejuaraan',
                'phone_number' => '081298765432',
                'is_active' => true,
            ],
            [
                'athlete_code' => 'DPA-2026-003',
                'full_name' => 'Rizky Fajar Nugraha',
                'gender' => 'L',
                'age' => 22,
                'height_cm' => 175.0,
                'weight_kg' => 70.0,
                'dominant_side' => 'L',
                'injury_history' => 'Keluhan lower back pain ringan saat beban latihan tinggi',
                'phone_number' => '082155667788',
                'is_active' => true,
            ],
        ];

        foreach ($athletes as $data) {
            $athlete = Athlete::updateOrCreate(
                ['athlete_code' => $data['athlete_code']],
                $data
            );

            // Create initial DPA Assessment for Dimas
            if ($athlete->athlete_code === 'DPA-2026-001') {
                $assessment = DpaAssessment::create([
                    'athlete_id' => $athlete->id,
                    'assessor_id' => $admin ? $admin->id : null,
                    'assessment_date' => now()->subDays(3)->format('Y-m-d'),
                    'current_height_cm' => $athlete->height_cm,
                    'current_weight_kg' => $athlete->weight_kg,
                    'notes' => 'Asesmen awal pra-kompetisi. Terlihat knee valgus pada saat landing dan deep squat.',
                ]);

                // Attach compensations
                $valgus = DpaCompensation::where('name', 'like', '%Valgus%')->first();
                $armsForward = DpaCompensation::where('name', 'like', '%Arms Fall Forward%')->first();
                $feetTurnOut = DpaCompensation::where('name', 'like', '%Feet Turn Out%')->first();

                if ($valgus) {
                    DpaAssessmentDetail::create([
                        'dpa_assessment_id' => $assessment->id,
                        'dpa_compensation_id' => $valgus->id,
                        'severity' => 'Moderate',
                        'side' => 'Bilateral',
                        'specific_note' => 'Lutut cenderung masuk 3-5 derajat saat fase descending',
                    ]);
                }

                if ($armsForward) {
                    DpaAssessmentDetail::create([
                        'dpa_assessment_id' => $assessment->id,
                        'dpa_compensation_id' => $armsForward->id,
                        'severity' => 'Mild',
                        'side' => 'Bilateral',
                        'specific_note' => 'Keterbatasan mobilitas thoracolumbar & tight latissimus',
                    ]);
                }

                if ($feetTurnOut) {
                    DpaAssessmentDetail::create([
                        'dpa_assessment_id' => $assessment->id,
                        'dpa_compensation_id' => $feetTurnOut->id,
                        'severity' => 'Mild',
                        'side' => 'Right',
                        'specific_note' => 'Kompensasi ankle sprain lama sisi kanan',
                    ]);
                }
            }
        }
    }
}
