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
    const [distributionTab, setDistributionTab] = useState<'risk' | 'screening'>('risk');

    // Custom Glassmorphism Tooltip for Recharts that adapts to Dark/Light Mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-2 rounded-md shadow-xl border border-slate-700/80 text-[10px] space-y-0.5 backdrop-blur-xs min-w-[120px]">
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
            if (data && data.sessionNumber) {
                return (
                    <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-2.5 rounded-md shadow-xl border border-slate-700/80 text-[10px] space-y-1 backdrop-blur-xs min-w-[150px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-0.5">
                            <span className="font-bold text-[#b4f031] text-[10px]">{data.sessionNumber}</span>
                            <span className="text-[9px] text-slate-400">{data.fullDate}</span>
                        </div>
                        <div className="pt-0.5">
                            <p className="font-bold text-slate-100 text-[11px] truncate max-w-[140px]">{data.athleteName}</p>
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
            <Head title="Dashboard Analitik - Postural & Movement Assessment" />

            <div className="space-y-5 pb-8">
                {/* Header with Quick Actions */}
                <PageHeader
                    title={
                        <>
                            Postural & Movement <span className="text-[#84cc16] dark:text-[#b4f031]">Assessment Analytics (PMA)</span>
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
                                    <span>Analisis PMA Baru</span>
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* ─── 1. TOP STATS OVERVIEW CARDS (4 METRICS) ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Total Athletes */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-md">
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

                    {/* Total PMA Sessions */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Total Sesi Evaluasi PMA
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
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-md">
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
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 transition-all rounded-md">
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

                {/* ─── 2. CHARTS ANALYTICS GRID (3-COLUMN RESPONSIVE GRID) ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Card 1: Tren Aktivitas Evaluasi (Area Chart) */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-[#84cc16]" />
                                    <span>Tren Aktivitas Evaluasi</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                    Volume sesi &amp; deviasi 6 bln terakhir
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[9.5px] font-semibold py-0 px-1.5 border-[#84cc16]/40 text-[#84cc16]">
                                6 Bulan
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col justify-end">
                            <div className="h-48 w-full">
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
                                        <Area
                                            type="monotone"
                                            dataKey="assessments"
                                            name="Sesi Asesmen"
                                            stroke="#84cc16"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAssessmentsMonthly)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="deviations"
                                            name="Temuan Deviasi"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorDeviationsMonthly)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Timeline Skor Sesi Atlet (Line Chart) */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Timeline Skor Sesi Atlet</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                    Riwayat deviasi &amp; batas risiko
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[9.5px] font-semibold py-0 px-1.5">
                                {assessmentTimeline.length} Sesi
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col justify-end">
                            <div className="h-48 w-full">
                                {assessmentTimeline.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada riwayat sesi asesmen.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={assessmentTimeline}
                                            margin={{ top: 15, right: 25, left: -25, bottom: 0 }}
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
                                                label={{ value: 'Tinggi (≥5)', fill: '#f43f5e', fontSize: 8, position: 'right' }}
                                            />
                                            <ReferenceLine
                                                y={3}
                                                stroke="#f59e0b"
                                                strokeDasharray="3 3"
                                                label={{ value: 'Sedang (3)', fill: '#f59e0b', fontSize: 8, position: 'right' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="deviations"
                                                name="Temuan Deviasi"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                                                activeDot={{ r: 5.5, stroke: '#10b981', strokeWidth: 1.5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Distribusi Risiko & Skrining (Interactive Donut) */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <PieChartIcon className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{distributionTab === 'risk' ? 'Distribusi Tingkat Risiko' : 'Cakupan Skrining & Gender'}</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] text-slate-500">
                                    {distributionTab === 'risk' ? 'Tingkat keparahan kompensasi atlet' : 'Kesiapan skrining di roster'}
                                </CardDescription>
                            </div>
                            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9.5px] font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setDistributionTab('risk')}
                                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                        distributionTab === 'risk'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Risiko
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDistributionTab('screening')}
                                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                        distributionTab === 'screening'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Skrining
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 px-3 pb-3 flex-1 flex flex-col justify-between">
                            {distributionTab === 'risk' ? (
                                <>
                                    <div className="h-28 w-full flex items-center justify-center relative">
                                        {totalRisksCount === 0 ? (
                                            <div className="text-[10.5px] text-slate-400 italic">Belum ada data evaluasi.</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={riskDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={28}
                                                        outerRadius={46}
                                                        paddingAngle={4}
                                                        dataKey="count"
                                                    >
                                                        {riskDistribution.map((entry, index) => (
                                                            <Cell key={`cell-risk-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                    <div className="space-y-1 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
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
                                </>
                            ) : (
                                <>
                                    <div className="h-28 w-full flex items-center justify-center relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={screeningStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={28}
                                                    outerRadius={46}
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
                                    <div className="space-y-1 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
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
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card 4: Top Compensations Ranking Bar Chart */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-[#84cc16]" />
                                    <span>Pola Kompensasi Terbanyak</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                    Prevalensi deviasi postur atlet teratas
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col justify-end">
                            <div className="h-48 w-full">
                                {topCompChartData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada data kompensasi.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topCompChartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                            <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{ fontSize: 8.5, fill: '#64748b' }}
                                                width={90}
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

                    {/* Card 5: Dual Comparative Bar Chart: Overactive vs Underactive */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Ketidakseimbangan Otot</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                    Overactive (Tegang) vs Underactive (Lemah)
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col justify-end">
                            <div className="h-48 w-full">
                                {combinedMuscleData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                                        Belum ada data otot.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={combinedMuscleData}
                                            margin={{ top: 10, right: 10, left: -25, bottom: 15 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 8, fill: '#64748b' }}
                                                interval={0}
                                                angle={-15}
                                                textAnchor="end"
                                            />
                                            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                                            <Legend
                                                wrapperStyle={{ fontSize: '8.5px', paddingTop: '4px' }}
                                                formatter={(value) => (
                                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{value}</span>
                                                )}
                                            />
                                            <Bar dataKey="overactive" name="Overactive" fill="#f43f5e" radius={[2.5, 2.5, 0, 0]} />
                                            <Bar dataKey="underactive" name="Underactive" fill="#10b981" radius={[2.5, 2.5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 6: Checkpoints Breakdown Bar Chart */}
                    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-md flex flex-col justify-between">
                        <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-[#84cc16]" />
                                    <span>Sebaran Checkpoint Kinetik</span>
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5 text-slate-500">
                                    5 area rantai kinetik utama (NASM)
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col justify-end">
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={checkpointDistribution}
                                        layout="vertical"
                                        margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="stroke-slate-200/50 dark:stroke-slate-800/35" />
                                        <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                                        <YAxis
                                            dataKey="checkpoint"
                                            type="category"
                                            tick={{ fontSize: 8.5, fill: '#64748b' }}
                                            width={85}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

