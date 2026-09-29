<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaAssessmentDetail;
use App\Models\DpaCompensation;
use App\Models\Exercise;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalAthletes = Athlete::count();
        $activeAthletes = Athlete::where('is_active', true)->count();
        $totalAssessments = DpaAssessment::count();
        $totalCompensations = DpaCompensation::count();
        $totalExercises = Exercise::count();

        // Assessments with details count
        $allAssessments = DpaAssessment::withCount('details')->get();
        $totalDeviationsDetected = $allAssessments->sum('details_count');
        $avgDeviations = $totalAssessments > 0 ? round($totalDeviationsDetected / $totalAssessments, 1) : 0;

        // Risk Category distribution
        $highRiskCount = 0;
        $moderateRiskCount = 0;
        $lowRiskCount = 0;

        foreach ($allAssessments as $a) {
            if ($a->details_count >= 5) {
                $highRiskCount++;
            } elseif ($a->details_count >= 3) {
                $moderateRiskCount++;
            } else {
                $lowRiskCount++;
            }
        }

        $riskDistribution = [
            ['name' => 'Tinggi (≥5 Deviasi)', 'count' => $highRiskCount, 'color' => '#f43f5e'],
            ['name' => 'Sedang (3-4 Deviasi)', 'count' => $moderateRiskCount, 'color' => '#f59e0b'],
            ['name' => 'Rendah / Optimal (0-2)', 'count' => $lowRiskCount, 'color' => '#84cc16'],
        ];

        // Chronological Assessment Timeline & Trend (per actual session & date)
        $timelineAssessments = DpaAssessment::with('athlete')
            ->withCount('details')
            ->orderBy('assessment_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $assessmentTimeline = $timelineAssessments->map(function ($a, $index) {
            $date = Carbon::parse($a->assessment_date);
            $count = $a->details_count;
            $risk = 'Rendah';
            $riskColor = '#84cc16';
            if ($count >= 5) {
                $risk = 'Tinggi';
                $riskColor = '#f43f5e';
            } elseif ($count >= 3) {
                $risk = 'Sedang';
                $riskColor = '#f59e0b';
            }

            return [
                'sessionNumber' => 'Sesi #' . ($index + 1),
                'sessionLabel' => ($date->translatedFormat('d M') ?: $date->format('d M')) . ' (' . ($a->athlete ? explode(' ', $a->athlete->full_name)[0] : 'Sesi') . ')',
                'shortDate' => $date->translatedFormat('d M') ?: $date->format('d M'),
                'fullDate' => $date->translatedFormat('d M Y') ?: $date->format('d M Y'),
                'athleteName' => $a->athlete ? $a->athlete->full_name : 'Atlet #' . $a->athlete_id,
                'athleteCode' => $a->athlete ? $a->athlete->athlete_code : '',
                'deviations' => $count,
                'risk' => $risk,
                'riskColor' => $riskColor,
                'id' => $a->id,
            ];
        });

        // Monthly Trends (Past 6 Months)
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $yearMonth = $monthDate->format('Y-m');
            $monthLabel = $monthDate->translatedFormat('M Y') ?: $monthDate->format('M Y');

            $monthAssessments = DpaAssessment::whereYear('assessment_date', $monthDate->year)
                ->whereMonth('assessment_date', $monthDate->month)
                ->withCount('details')
                ->get();

            $monthlyTrends[] = [
                'month' => $monthLabel,
                'yearMonth' => $yearMonth,
                'assessments' => $monthAssessments->count(),
                'deviations' => $monthAssessments->sum('details_count'),
            ];
        }

        // Kinetic Chain Checkpoint Breakdown
        $checkpointCounts = DpaAssessmentDetail::join('dpa_compensations', 'dpa_assessment_details.dpa_compensation_id', '=', 'dpa_compensations.id')
            ->select('dpa_compensations.checkpoint', DB::raw('count(*) as total'))
            ->groupBy('dpa_compensations.checkpoint')
            ->orderBy('total', 'desc')
            ->get();

        $checkpointDistribution = [];
        $knownCheckpoints = [
            'Foot & Ankle' => 'Kaki & Pergelangan',
            'Knee' => 'Lutut (Knees)',
            'LPHC' => 'LPHC (Pinggul & Punggung Bawah)',
            'Shoulders' => 'Bahu & Lengan',
            'Head / Cervical' => 'Leher & Kepala',
        ];

        foreach ($knownCheckpoints as $cpKey => $cpLabel) {
            $found = $checkpointCounts->first(function ($item) use ($cpKey) {
                return stripos($item->checkpoint, $cpKey) !== false || stripos($item->checkpoint, explode(' ', $cpKey)[0]) !== false;
            });
            $checkpointDistribution[] = [
                'checkpoint' => $cpKey,
                'label' => $cpLabel,
                'count' => $found ? (int) $found->total : 0,
            ];
        }

        // If other checkpoints exist in DB
        foreach ($checkpointCounts as $cc) {
            $alreadyIncluded = false;
            foreach ($knownCheckpoints as $cpKey => $cpLabel) {
                if (stripos($cc->checkpoint, $cpKey) !== false || stripos($cc->checkpoint, explode(' ', $cpKey)[0]) !== false) {
                    $alreadyIncluded = true;
                    break;
                }
            }
            if (!$alreadyIncluded && $cc->checkpoint) {
                $checkpointDistribution[] = [
                    'checkpoint' => $cc->checkpoint,
                    'label' => $cc->checkpoint,
                    'count' => (int) $cc->total,
                ];
            }
        }

        // Top Compensations with category & checkpoint
        $topCompensations = DpaAssessmentDetail::select('dpa_compensation_id', DB::raw('count(*) as count'))
            ->groupBy('dpa_compensation_id')
            ->orderBy('count', 'desc')
            ->limit(6)
            ->with('compensation')
            ->get()
            ->map(function ($item) use ($totalDeviationsDetected) {
                $pct = $totalDeviationsDetected > 0 ? round(($item->count / $totalDeviationsDetected) * 100, 1) : 0;
                return [
                    'dpa_compensation_id' => $item->dpa_compensation_id,
                    'count' => $item->count,
                    'percentage' => $pct,
                    'compensation' => $item->compensation,
                ];
            });

        // Top Overactive & Underactive Muscle Aggregations
        $overactiveMap = [];
        $underactiveMap = [];

        $allDetails = DpaAssessmentDetail::with('compensation')->get();
        foreach ($allDetails as $detail) {
            if ($detail->compensation) {
                $over = preg_split('/[\r\n,]+/', (string) $detail->compensation->overactive_muscles);
                foreach ($over as $m) {
                    $m = trim($m);
                    if ($m && strlen($m) > 2) {
                        $overactiveMap[$m] = ($overactiveMap[$m] ?? 0) + 1;
                    }
                }

                $under = preg_split('/[\r\n,]+/', (string) $detail->compensation->underactive_muscles);
                foreach ($under as $m) {
                    $m = trim($m);
                    if ($m && strlen($m) > 2) {
                        $underactiveMap[$m] = ($underactiveMap[$m] ?? 0) + 1;
                    }
                }
            }
        }

        arsort($overactiveMap);
        arsort($underactiveMap);

        $topOveractiveMuscles = [];
        foreach (array_slice($overactiveMap, 0, 5, true) as $muscle => $count) {
            $topOveractiveMuscles[] = ['muscle' => $muscle, 'count' => $count];
        }

        $topUnderactiveMuscles = [];
        foreach (array_slice($underactiveMap, 0, 5, true) as $muscle => $count) {
            $topUnderactiveMuscles[] = ['muscle' => $muscle, 'count' => $count];
        }

        // Recent Assessments
        $recentAssessments = DpaAssessment::with(['athlete', 'assessor', 'details.compensation'])
            ->withCount('details')
            ->orderBy('assessment_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(6)
            ->get();

        // Gender Distribution
        $genderCounts = Athlete::select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->get();

        $genderDistribution = [
            [
                'gender' => 'Laki-laki (Male)',
                'count' => (int) ($genderCounts->firstWhere('gender', 'Male')->count ?? $genderCounts->firstWhere('gender', 'L')->count ?? 0),
                'color' => '#3b82f6',
            ],
            [
                'gender' => 'Perempuan (Female)',
                'count' => (int) ($genderCounts->firstWhere('gender', 'Female')->count ?? $genderCounts->firstWhere('gender', 'P')->count ?? 0),
                'color' => '#ec4899',
            ],
        ];

        // Assessment Completion / Readiness Rate
        $athletesWithAssessment = Athlete::has('dpaAssessments')->count();
        $screeningCoverageRate = $totalAthletes > 0 ? round(($athletesWithAssessment / $totalAthletes) * 100, 1) : 0;

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalAthletes' => $totalAthletes,
                'activeAthletes' => $activeAthletes,
                'totalAssessments' => $totalAssessments,
                'totalCompensations' => $totalCompensations,
                'totalExercises' => $totalExercises,
                'totalDeviationsDetected' => $totalDeviationsDetected,
                'avgDeviations' => $avgDeviations,
                'screeningCoverageRate' => $screeningCoverageRate,
            ],
            'assessmentTimeline' => $assessmentTimeline,
            'monthlyTrends' => $monthlyTrends,
            'checkpointDistribution' => $checkpointDistribution,
            'riskDistribution' => $riskDistribution,
            'topCompensations' => $topCompensations,
            'topOveractiveMuscles' => $topOveractiveMuscles,
            'topUnderactiveMuscles' => $topUnderactiveMuscles,
            'genderDistribution' => $genderDistribution,
            'recentAssessments' => $recentAssessments,
        ]);
    }
}

