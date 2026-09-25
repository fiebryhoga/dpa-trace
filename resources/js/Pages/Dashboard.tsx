import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import {
    Users,
    Activity,
    PlusCircle,
    UserPlus,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    Sparkles,
} from 'lucide-react';

interface AssessmentItem {
    id: number;
    assessment_date: string;
    details_count: number;
    athlete: {
        id: number;
        athlete_code: string;
        full_name: string;
        sport_category: string;
        gender: string;
    };
    assessor?: {
        name: string;
    };
}

interface TopCompensation {
    dpa_compensation_id: number;
    count: number;
    compensation: {
        id: number;
        name: string;
        category: string;
        checkpoint: string;
    };
}

interface SportStat {
    sport_category: string;
    count: number;
}

interface DashboardProps {
    stats: {
        totalAthletes: number;
        activeAthletes: number;
        totalAssessments: number;
    };
    recentAssessments: AssessmentItem[];
    topCompensations: TopCompensation[];
    sportsDistribution: SportStat[];
}

export default function Dashboard({
    stats,
    recentAssessments,
    topCompensations,
    sportsDistribution,
}: DashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - Dynamic Posture Assessment" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#b4f031]/20 text-slate-900 dark:text-[#b4f031] border border-[#b4f031]/40">
                                <Sparkles className="h-3 w-3 text-[#84cc16] dark:text-[#b4f031]" />
                                <span>Sports Science & Biomechanics</span>
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Dynamic Posture{' '}
                            <span className="text-[#84cc16] dark:text-[#b4f031]">
                                Assessment
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kinetic chain deviation monitoring & corrective exercise programming • DPA Trace
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('athletes.create')}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Add Athlete</span>
                            </Button>
                        </Link>
                        <Link href={route('dpa.create')}>
                            <Button size="sm" className="gap-1.5 text-xs shadow-brand">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Start DPA Assessment</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Metrics Cards with #b4f031 Electric Green Accents */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm hover:border-[#b4f031]/80 transition-all hover:shadow-brand">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Total Registered Athletes
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-[#b4f031]/15 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/30">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {stats.totalAthletes}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#b4f031]" />
                                <span>{stats.activeAthletes} active roster athletes</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm hover:border-[#b4f031]/80 transition-all hover:shadow-brand">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Total DPA Sessions
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-[#b4f031]/15 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/30">
                                <Activity className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {stats.totalAssessments}
                            </div>
                            <p className="text-[11px] text-slate-700 dark:text-[#b4f031] mt-1 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="h-3 w-3 text-[#84cc16] dark:text-[#b4f031]" />
                                <span>Evaluations logged</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm hover:border-[#b4f031]/80 transition-all hover:shadow-brand">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Tracked Sport Categories
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-[#b4f031]/15 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/30">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {sportsDistribution.length}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {sportsDistribution.slice(0, 3).map((s) => (
                                    <span
                                        key={s.sport_category}
                                        className="inline-flex items-center rounded-md bg-[#b4f031]/15 border border-[#b4f031]/30 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 dark:text-[#b4f031]"
                                    >
                                        {s.sport_category} ({s.count})
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recent Assessments Table */}
                    <div className="lg:col-span-8 space-y-4">
                        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                        Recent Assessment Sessions
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Latest kinetic posture evaluations recorded
                                    </CardDescription>
                                </div>
                                <Link href={route('dpa.index')}>
                                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-slate-900 dark:text-[#b4f031]">
                                        View All
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </CardHeader>

                            <CardContent className="p-0">
                                {recentAssessments.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-slate-500">
                                        No assessment sessions recorded yet.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="px-4 py-3">Athlete</th>
                                                    <th className="px-4 py-3">Sport</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Risk Severity</th>
                                                    <th className="px-4 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                                {recentAssessments.map((a) => {
                                                    const count = a.details_count;
                                                    let riskBadge = (
                                                        <Badge variant="brand" className="text-[10px] py-0.5 px-2">
                                                            Low ({count} Deviations)
                                                        </Badge>
                                                    );
                                                    if (count >= 5) {
                                                        riskBadge = (
                                                            <Badge variant="destructive" className="text-[10px] py-0.5 px-2">
                                                                High ({count} Deviations)
                                                            </Badge>
                                                        );
                                                    } else if (count >= 3) {
                                                        riskBadge = (
                                                            <Badge variant="warning" className="text-[10px] py-0.5 px-2">
                                                                Moderate ({count} Deviations)
                                                            </Badge>
                                                        );
                                                    }

                                                    return (
                                                        <tr
                                                            key={a.id}
                                                            className="hover:bg-[#b4f031]/10 dark:hover:bg-[#b4f031]/10 transition-colors"
                                                        >
                                                            <td className="px-4 py-3.5">
                                                                <div className="font-bold text-slate-900 dark:text-white">
                                                                    {a.athlete.full_name}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 font-medium">
                                                                    {a.athlete.athlete_code}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                                                                    {a.athlete.sport_category}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                                                                {new Date(a.assessment_date).toLocaleDateString('en-US', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                {riskBadge}
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right">
                                                                <Link href={route('dpa.show', a.id)}>
                                                                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px]">
                                                                        Report
                                                                    </Button>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Postural Compensations Breakdown */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                    Frequent Compensations
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Most prevalent kinetic chain deviations detected
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                {topCompensations.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-4 text-center">
                                        No compensation records available.
                                    </p>
                                ) : (
                                    topCompensations.map((item, idx) => (
                                        <div
                                            key={item.dpa_compensation_id}
                                            className="p-3 rounded-lg border border-[#b4f031]/30 bg-[#b4f031]/5 dark:bg-[#b4f031]/5 flex items-start justify-between gap-2 hover:border-[#b4f031]/80 transition-all"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-5 w-5 rounded-full bg-[#b4f031] text-slate-950 text-[10px] font-black flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        {item.compensation?.name}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block pl-6">
                                                    {item.compensation?.category} • {item.compensation?.checkpoint}
                                                </span>
                                            </div>
                                            <Badge variant="brand" className="text-[10px] shrink-0">
                                                {item.count} cases
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
