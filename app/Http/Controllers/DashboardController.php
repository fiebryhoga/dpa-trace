<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaAssessmentDetail;
use App\Models\DpaCompensation;
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

        $recentAssessments = DpaAssessment::with(['athlete', 'assessor', 'details'])
            ->withCount('details')
            ->orderBy('assessment_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // Top Most Frequent Posture Compensations in OTS
        $topCompensations = DpaAssessmentDetail::select('dpa_compensation_id', DB::raw('count(*) as count'))
            ->groupBy('dpa_compensation_id')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->with('compensation')
            ->get();

        // Sport Distribution
        $sportsDistribution = Athlete::select('sport_category', DB::raw('count(*) as count'))
            ->groupBy('sport_category')
            ->orderBy('count', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalAthletes' => $totalAthletes,
                'activeAthletes' => $activeAthletes,
                'totalAssessments' => $totalAssessments,
            ],
            'recentAssessments' => $recentAssessments,
            'topCompensations' => $topCompensations,
            'sportsDistribution' => $sportsDistribution,
        ]);
    }
}
