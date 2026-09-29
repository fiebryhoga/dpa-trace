import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
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
    ShieldAlert,
    Flame,
    Dumbbell,
    BarChart3,
    PieChart as PieChartIcon,
    Layers,
    Target,
    Zap,
    ChevronRight,
    Compass,
    Sparkles,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';

interface AssessmentItem {
    id: number;
    assessment_date: string;
    details_count: number;
    athlete: {
        id: number;
        athlete_code: string;
        full_name: string;
        gender: string;
        age?: number;
    };
    assessor?: {
        name: string;
    };
}

interface TopCompensation {
    dpa_compensation_id: number;
    count: number;
    percentage: number;
    compensation: {
        id: number;
        name: string;
        category: string;
        checkpoint: string;
    };
}

interface MonthlyTrendItem {
    month: string;
    yearMonth: string;
    assessments: number;
    deviations: number;
}

interface AssessmentTimelineItem {
    sessionNumber: string;
    sessionLabel: string;
    shortDate: string;
    fullDate: string;
    athleteName: string;
    athleteCode: string;
    deviations: number;
    risk: string;
    riskColor: string;
    id: number;
}

interface CheckpointItem {
    checkpoint: string;
    label: string;
    count: number;
}

interface RiskItem {
    name: string;
    count: number;
    color: string;
}

interface MuscleItem {
    muscle: string;
    count: number;
}

interface GenderItem {
    gender: string;
    count: number;
    color: string;
}

interface DashboardProps {
    stats: {
        totalAthletes: number;
        activeAthletes: number;
        totalAssessments: number;
        totalCompensations: number;
        totalExercises: number;
        totalDeviationsDetected: number;
        avgDeviations: number;
        screeningCoverageRate: number;
    };
    monthlyTrends?: MonthlyTrendItem[];
    assessmentTimeline?: AssessmentTimelineItem[];
    checkpointDistribution: CheckpointItem[];
    riskDistribution: RiskItem[];
    topCompensations: TopCompensation[];
    topOveractiveMuscles: MuscleItem[];
    topUnderactiveMuscles: MuscleItem[];
    genderDistribution: GenderItem[];
    recentAssessments: AssessmentItem[];
}

export default function Dashboard({
    stats,
    monthlyTrends = [],
    assessmentTimeline = [],
    checkpointDistribution = [],
    riskDistribution = [],
    topCompensations = [],
    topOveractiveMuscles = [],
    topUnderactiveMuscles = [],
    genderDistribution = [],
    recentAssessments = [],
}: DashboardProps) {
    const [trendMode, setTrendMode] = useState<'monthly' | 'sessions'>('monthly');
    const [monthlyMetric, setMonthlyMetric] = useState<'both' | 'assessments' | 'deviations'>('both');

    // Custom Glassmorphism Tooltip for Recharts that adapts to Dark/Light Mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-2 rounded-lg shadow-xl border border-slate-700/80 text-[10px] space-y-0.5 backdrop-blur-xs min-w-[120px]">
                    <p className="font-bold text-slate-200 border-b border-slate-700 pb-0.5 text-[10px]">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-2.5 pt-0.5">
                            <span className="text-[10px] flex items-center gap-1" style={{ color: entry.color }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                            </span>
                            <span className="font-bold text-slate-100">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Specialized Tooltip for Session Timeline
    const TimelineTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0]?.payload as AssessmentTimelineItem;
            if (trendMode === 'sessions' && data) {
                return (
                    <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-2.5 rounded-lg shadow-xl border border-slate-700/80 text-[10px] space-y-1 backdrop-blur-xs min-w-[160px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-0.5">
                            <span className="font-bold text-[#b4f031] text-[10px]">{data.sessionNumber}</span>
                            <span className="text-[9px] text-slate-400">{data.fullDate}</span>
                        </div>
                        <div className="pt-0.5">
                            <p className="font-bold text-slate-100 text-[11px]">{data.athleteName}</p>
                            {data.athleteCode && <p className="text-[9px] text-slate-400">{data.athleteCode}</p>}
                        </div>
                        <div className="flex items-center justify-between pt-0.5 border-t border-slate-800 text-[10px]">
                            <span className="text-slate-400">Temuan Deviasi:</span>
                            <span className="font-bold text-white">{data.deviations} Kasus</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Tingkat Risiko:</span>
                            <span className="font-bold flex items-center gap-1" style={{ color: data.riskColor }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: data.riskColor }} />
                                {data.risk}
                            </span>
                        </div>
                    </div>
                );
            }
            return <CustomTooltip active={active} payload={payload} label={payload[0]?.payload?.date || payload[0]?.name} />;
        }
        return null;
    };

    const totalRisksCount = riskDistribution.reduce((acc, curr) => acc + curr.count, 0);

    // Prepare combined Muscle Comparison data for Dual Bar Chart
    const combinedMuscleData = (() => {
        const list: Array<{ name: string; overactive: number; underactive: number }> = [];
        const seen = new Set<string>();

        topOveractiveMuscles.forEach((m) => {
            seen.add(m.muscle);
            const underMatch = topUnderactiveMuscles.find((u) => u.muscle === m.muscle);
            list.push({
                name: m.muscle.length > 18 ? m.muscle.substring(0, 16) + '...' : m.muscle,
                overactive: m.count,
                underactive: underMatch ? underMatch.count : 0,
            });
        });

        topUnderactiveMuscles.forEach((u) => {
            if (!seen.has(u.muscle)) {
                seen.add(u.muscle);
                list.push({
                    name: u.muscle.length > 18 ? u.muscle.substring(0, 16) + '...' : u.muscle,
                    overactive: 0,
                    underactive: u.count,
                });
            }
        });

        return list.slice(0, 6);
    })();

    // Prepare Top Compensations Chart data
    const topCompChartData = topCompensations.map((c) => ({
        name: c.compensation?.name
            ? (c.compensation.name.length > 20 ? c.compensation.name.substring(0, 18) + '...' : c.compensation.name)
            : `Pola #${c.dpa_compensation_id}`,
        fullName: c.compensation?.name || `Pola #${c.dpa_compensation_id}`,
        kasus: c.count,
        persentase: c.percentage,
        category: c.compensation?.category || '',
    }));

    // Athlete Screening Status Donut Data
    const screeningStatusData = [
        {
            name: 'Sudah Ter-skrining',
            count: Math.round((stats.totalAthletes * stats.screeningCoverageRate) / 100),
            color: '#84cc16',
        },
        {
            name: 'Belum Ter-skrining',
            count: Math.max(0, stats.totalAthletes - Math.round((stats.totalAthletes * stats.screeningCoverageRate) / 100)),
            color: '#94a3b8',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Analitik - Dynamic Posture Assessment" />

            <div className="space-y-5 pb-8">
                {/* Header with Quick Actions */}
                <PageHeader
                    title={
                        <>
                            Dynamic Posture <span className="text-[#84cc16] dark:text-[#b4f031]">Assessment Analytics</span>
                        </>
                    }
                    description="Pusat pemantauan biomekanik atlet, evaluasi rantai kinetik & program latihan korektif • PKO Unesa x Olympus Training Surabaya"
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href={route('athletes.create')}>
                                <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] rounded-md px-2.5">
                                    <UserPlus className="h-3 w-3" />
                                    <span>Tambah Atlet</span>
                                </Button>
                            </Link>
                            <Link href={route('dpa.index')}>
                                <Button size="sm" className="h-7 gap-1 text-[11px] font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] rounded-md px-2.5 shadow-xs">
                                    <PlusCircle className="h-3 w-3" />
                                    <span>Analisis DPA Baru</span>
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* ─── 1. TOP STATS OVERVIEW CARDS (4 METRICS) ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Total Athletes */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Total Atlet Terdaftar
                            </span>
                            <div className="p-1 rounded-md bg-[#84cc16]/10 text-lime-700 dark:text-[#b4f031] border border-[#84cc16]/20">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.totalAthletes}
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#84cc16]" />
                                    {stats.activeAthletes} Aktif di Roster
                                </span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {stats.screeningCoverageRate}% Ter-skrining
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total DPA Sessions */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Total Sesi Evaluasi DPA
                            </span>
                            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Activity className="h-3.5 w-3.5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.totalAssessments}
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Sesi Selesai
                                </span>
                                <span className="font-medium text-slate-500">
                                    Rata-rata {stats.avgDeviations} deviasi/sesi
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Deviations Detected */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Temuan Deviasi Gerak
                            </span>
                            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <ShieldAlert className="h-3.5 w-3.5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.totalDeviationsDetected}
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                                <span>Dari {stats.totalCompensations} Master Pola</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                    Rantai Kinetik
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Corrective Exercise Library */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Bank Latihan Korektif
                            </span>
                            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <Zap className="h-3.5 w-3.5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.totalExercises}
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                                <span>4 Fase Kontinu</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    Inhibit • Lengthen • Active • Integrate
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── 2. CHARTS ROW 1: MONTHLY AREA CHART (LEFT) & SESSION TIMELINE LINE CHART (RIGHT) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Chart 1: Monthly Trend Activity (6 cols) - Area Chart with Gradient */}
                    <Card className="lg:col-span-6 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 pt-3.5 px-4 gap-2 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-[#84cc16]" />
                                    <span>Tren Aktivitas Evaluasi (6 Bulan Terakhir)</span>
                                </CardTitle>
                                <CardDescription className="text-[10.5px] mt-0.5 text-slate-500">
                                    Grafik area volume asesmen &amp; total deviasi berkala
                                </CardDescription>
                            </div>

                            {/* Metric Filter */}
                            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9.5px] font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setMonthlyMetric('both')}
                                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                        monthlyMetric === 'both'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Gabungan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMonthlyMetric('assessments')}
                                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                        monthlyMetric === 'assessments'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Sesi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMonthlyMetric('deviations')}
                                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                        monthlyMetric === 'deviations'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Deviasi
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-3 px-4 pb-3">
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAssessmentsMonthly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#84cc16" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="colorDeviationsMonthly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 9, fill: '#64748b' }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 9, fill: '#64748b' }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3', strokeOpacity: 0.3 }} />
                                        {(monthlyMetric === 'both' || monthlyMetric === 'assessments') && (
                                             <Area
                                                type="monotone"
                                                dataKey="assessments"
                                                name="Sesi Asesmen"
                                                stroke="#84cc16"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorAssessmentsMonthly)"
                                            />
                                        )}
                                        {(monthlyMetric === 'both' || monthlyMetric === 'deviations') && (
                                            <Area
                                                type="monotone"
                                                dataKey="deviations"
                                                name="Temuan Deviasi"
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorDeviationsMonthly)"
                                            />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart 2: Session Timeline (6 cols) - Dedicated Point & Line Chart with Risk Reference Lines */}
                    <Card className="lg:col-span-6 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Timeline Skor Deviasi Per Sesi Atlet</span>
                                </CardTitle>
                                <CardDescription className="text-[10.5px] mt-0.5 text-slate-500">
                                    Grafik garis &amp; titik riwayat skor deviasi dengan batas risiko
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[9.5px] font-semibold py-0 px-1.5">
                                {assessmentTimeline.length} Sesi Terdata
                            </Badge>
                        </CardHeader>

                        <CardContent className="pt-3 px-4 pb-3">
                            <div className="h-56 w-full">
                                {assessmentTimeline.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada riwayat sesi asesmen yang tercatat.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={assessmentTimeline}
                                            margin={{ top: 15, right: 30, left: -25, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                            <XAxis
                                                dataKey="sessionLabel"
                                                tick={{ fontSize: 9, fill: '#64748b' }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 9, fill: '#64748b' }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                domain={[0, (dataMax: number) => Math.max(dataMax + 2, 7)]}
                                            />
                                            <Tooltip content={<TimelineTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3', strokeOpacity: 0.3 }} />
                                            <ReferenceLine
                                                y={5}
                                                stroke="#f43f5e"
                                                strokeDasharray="3 3"
                                                label={{ value: 'Tinggi (≥5)', fill: '#f43f5e', fontSize: 8.5, position: 'right' }}
                                            />
                                            <ReferenceLine
                                                y={3}
                                                stroke="#f59e0b"
                                                strokeDasharray="3 3"
                                                label={{ value: 'Sedang (3)', fill: '#f59e0b', fontSize: 8.5, position: 'right' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="deviations"
                                                name="Temuan Deviasi"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 1.5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── 3. CHARTS ROW 2: RISK SEVERITY DONUT (4 COLS) & MUSCLE IMBALANCES SPECTRUM (8 COLS) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Risk Severity Donut Chart (4 cols) */}
                    <Card className="lg:col-span-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80">
                            <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <PieChartIcon className="h-3.5 w-3.5 text-amber-500" />
                                <span>Distribusi Tingkat Risiko Atlet</span>
                            </CardTitle>
                            <CardDescription className="text-[10.5px] text-slate-500">
                                Klasifikasi keparahan kompensasi biomekanik
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-3 px-4 pb-3">
                            <div className="h-40 w-full flex items-center justify-center relative">
                                {totalRisksCount === 0 ? (
                                    <div className="text-[11px] text-slate-400 italic">Belum ada data evaluasi.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={riskDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={42}
                                                outerRadius={62}
                                                paddingAngle={4}
                                                dataKey="count"
                                            >
                                                {riskDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Custom Legend Cards */}
                            <div className="space-y-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px]">
                                {riskDistribution.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-0.5 px-2 rounded bg-slate-50 dark:bg-slate-800/40"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {item.count} Sesi
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Dual Comparative Bar Chart: Overactive (Rose) vs Underactive (Emerald) (8 cols) */}
                    <Card className="lg:col-span-8 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Spektrum Ketidakseimbangan Otot (Grafik Komparatif)</span>
                                </CardTitle>
                                <CardDescription className="text-[10.5px] mt-0.5 text-slate-500">
                                    Frekuensi temuan otot Overactive (Tegang) vs Underactive (Lemah) pada seluruh asesmen
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-4 pb-3">
                            <div className="h-56 sm:h-60 w-full">
                                {combinedMuscleData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada temuan ketidakseimbangan otot.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={combinedMuscleData}
                                            margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 9, fill: '#64748b' }}
                                                interval={0}
                                                angle={-15}
                                                textAnchor="end"
                                            />
                                            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                                            <Legend
                                                wrapperStyle={{ fontSize: '9.5px', paddingTop: '6px' }}
                                                formatter={(value) => (
                                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{value}</span>
                                                )}
                                            />
                                            <Bar dataKey="overactive" name="Overactive (Tegang)" fill="#f43f5e" radius={[2.5, 2.5, 0, 0]} />
                                            <Bar dataKey="underactive" name="Underactive (Lemah)" fill="#10b981" radius={[2.5, 2.5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── 4. CHARTS ROW 3: TOP COMPENSATIONS BAR CHART & DEMOGRAPHICS DONUT ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Top Compensations Ranking Bar Chart (8 cols) */}
                    <Card className="lg:col-span-8 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-[#84cc16]" />
                                    <span>Grafik Pola Kompensasi Gerak Terbanyak</span>
                                </CardTitle>
                                <CardDescription className="text-[10.5px] mt-0.5 text-slate-500">
                                    Prevalensi deviasi postur dan dampaknya pada performa atlet
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-4 pb-3">
                            <div className="h-56 sm:h-60 w-full">
                                {topCompChartData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada data kompensasi yang tercatat.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topCompChartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 25, left: 5, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                            <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{ fontSize: 9, fill: '#64748b' }}
                                                width={110}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                                            <Bar dataKey="kasus" name="Jumlah Kasus" fill="#84cc16" radius={[0, 3, 3, 0]}>
                                                {topCompChartData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-top-${index}`}
                                                        fill={
                                                             index === 0
                                                                ? '#84cc16'
                                                                : index === 1
                                                                ? '#a3e635'
                                                                : index === 2
                                                                ? '#bef264'
                                                                : index === 3
                                                                ? '#f59e0b'
                                                                : '#fbbf24'
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Athlete Screening & Gender Demographics (4 cols) */}
                    <Card className="lg:col-span-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80">
                            <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Compass className="h-3.5 w-3.5 text-blue-500" />
                                <span>Cakupan Skrining &amp; Gender</span>
                            </CardTitle>
                            <CardDescription className="text-[10.5px] text-slate-500">
                                Kesiapan evaluasi postur atlet di seluruh roster
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-3 px-4 pb-3 space-y-2.5">
                            {/* Screening Donut */}
                            <div className="h-28 w-full flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={screeningStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={48}
                                            paddingAngle={4}
                                            dataKey="count"
                                        >
                                            {screeningStatusData.map((entry, index) => (
                                                <Cell key={`cell-sc-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gender & Readiness Breakdown */}
                            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10.5px]">
                                <div className="flex items-center justify-between py-0.5 px-2 rounded bg-slate-50 dark:bg-slate-800/40">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                                        Cakupan Skrining
                                    </span>
                                    <span className="font-bold text-[#84cc16] dark:text-[#b4f031]">
                                        {stats.screeningCoverageRate}% Selesai
                                    </span>
                                </div>

                                {genderDistribution.map((g, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-0.5 px-2 rounded bg-slate-50 dark:bg-slate-800/40"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{g.gender}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">{g.count} Atlet</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── 5. CHECKPOINTS BREAKDOWN HORIZONTAL CARD ─── */}
                <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg">
                    <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100 dark:border-slate-800/80">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[#84cc16]" />
                            <span>Sebaran Deviasi per Checkpoint Kinetik (NASM)</span>
                        </CardTitle>
                        <CardDescription className="text-[10.5px] text-slate-500">
                            5 area rantai kinetik utama pengamatan postur dinamis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 px-4 pb-3">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={checkpointDistribution}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                    <YAxis
                                        dataKey="checkpoint"
                                        type="category"
                                        tick={{ fontSize: 9, fill: '#64748b' }}
                                        width={90}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                                    <Bar
                                        dataKey="count"
                                        name="Kasus Deviasi"
                                        fill="#84cc16"
                                        radius={[0, 3, 3, 0]}
                                    >
                                        {checkpointDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-cp-${index}`}
                                                fill={
                                                    index === 0
                                                        ? '#84cc16'
                                                        : index === 1
                                                        ? '#a3e635'
                                                        : index === 2
                                                        ? '#bef264'
                                                        : index === 3
                                                        ? '#d9f99d'
                                                        : '#65a30d'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* ─── 6. BOTTOM SECTION: RECENT ASSESSMENTS TABLE ─── */}
                <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between py-2 px-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 rounded-t-lg">
                        <div>
                            <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-[#84cc16]" />
                                <span>Sesi Asesmen DPA Terkini</span>
                            </CardTitle>
                            <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                Log hasil evaluasi postur terbaru atlet di PKO Unesa x Olympus Training Surabaya
                            </CardDescription>
                        </div>
                        <Link href={route('dpa.index')}>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-slate-900 dark:text-[#b4f031] px-2">
                                <span>Lihat Semua Sesi</span>
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent className="p-0">
                        {recentAssessments.length === 0 ? (
                            <div className="text-center py-6 text-[10px] text-slate-500">
                                Belum ada riwayat sesi asesmen yang tercatat.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px] text-left">
                                    <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[9px]">
                                        <tr>
                                            <th className="px-3 py-2">Atlet</th>
                                            <th className="px-3 py-2">Gender / Usia</th>
                                            <th className="px-3 py-2">Tanggal</th>
                                            <th className="px-3 py-2">Tingkat Risiko</th>
                                            <th className="px-3 py-2 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {recentAssessments.map((a) => {
                                            const count = a.details_count;
                                            let riskBadge = (
                                                <Badge variant="brand" className="text-[9px] py-0 px-1.5 font-semibold">
                                                    Rendah ({count} Deviasi)
                                                </Badge>
                                            );
                                            if (count >= 5) {
                                                riskBadge = (
                                                    <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-semibold">
                                                        Tinggi ({count} Deviasi)
                                                    </Badge>
                                                );
                                            } else if (count >= 3) {
                                                riskBadge = (
                                                    <Badge variant="warning" className="text-[9px] py-0 px-1.5 font-semibold">
                                                        Sedang ({count} Deviasi)
                                                    </Badge>
                                                );
                                            }

                                            return (
                                                <tr
                                                    key={a.id}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    <td className="px-3 py-2">
                                                        <div className="font-bold text-slate-900 dark:text-white text-[10.5px]">
                                                            {a.athlete.full_name}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-medium">
                                                            {a.athlete.athlete_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[9.5px]">
                                                            {a.athlete.gender === 'Male' || a.athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            {a.athlete.age ? `, ${a.athlete.age} th` : ''}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium text-[9.5px]">
                                                        {new Date(a.assessment_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {riskBadge}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Link href={route('dpa.athletes.show', a.athlete.athlete_code || a.athlete.id)}>
                                                            <Button variant="outline" size="sm" className="h-5.5 px-2 text-[9.5px] gap-1">
                                                                <span>Laporan</span>
                                                                <ChevronRight className="h-2.5 w-2.5" />
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
        </AuthenticatedLayout>
    );
}

