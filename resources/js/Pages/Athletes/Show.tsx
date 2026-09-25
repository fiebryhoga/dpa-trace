import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    ArrowLeft,
    Edit3,
    PlusCircle,
    Activity,
    Shield,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

interface Compensation {
    id: number;
    name: string;
    category: string;
    checkpoint: string;
}

interface Detail {
    id: number;
    severity: 'Mild' | 'Moderate' | 'Severe';
    side: 'Left' | 'Right' | 'Bilateral';
    specific_note?: string;
    compensation: Compensation;
}

interface Assessment {
    id: number;
    assessment_date: string;
    current_height_cm?: number;
    current_weight_kg?: number;
    notes?: string;
    assessor?: {
        name: string;
    };
    details: Detail[];
}

interface Athlete {
    id: number;
    athlete_code: string;
    full_name: string;
    nickname?: string;
    gender: 'L' | 'P';
    birth_date?: string;
    calculated_age?: number;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    bmi_category?: string;
    sport_category: string;
    position_specialty?: string;
    club_institution?: string;
    dominant_side: 'R' | 'L' | 'Bilateral';
    injury_history?: string;
    phone_number?: string;
    is_active: boolean;
    dpa_assessments: Assessment[];
}

export default function AthleteShow({ athlete }: { athlete: Athlete }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Athlete Profile: ${athlete.full_name} - DPA Trace`} />

            <div className="space-y-6">
                {/* Top Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link href={route('athletes.index')}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {athlete.full_name}
                                </h1>
                                <Badge variant="brand" className="text-xs font-bold">
                                    {athlete.athlete_code}
                                </Badge>
                            </div>
                            <p className="text-xs text-[#84cc16] dark:text-[#b4f031] font-semibold mt-0.5">
                                {athlete.sport_category} {athlete.position_specialty && `• ${athlete.position_specialty}`} {athlete.club_institution && <span className="text-slate-500 dark:text-slate-400 font-normal">• {athlete.club_institution}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('athletes.edit', athlete.id)}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit Profile</span>
                            </Button>
                        </Link>
                        <Link href={route('dpa.create', { athlete_id: athlete.id })}>
                            <Button size="sm" className="gap-1.5 text-xs font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-brand">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>New DPA Assessment</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Profile Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Anthropometric & Medical Card */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Shield className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>Anthropometry & Biometrics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                                        <span className="text-[10px] text-slate-400 block font-medium">Gender</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {athlete.gender === 'L' ? 'Male' : 'Female'}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                                        <span className="text-[10px] text-slate-400 block font-medium">Age</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {athlete.calculated_age ? `${athlete.calculated_age} Yrs` : '-'}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                                        <span className="text-[10px] text-slate-400 block font-medium">Height</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {athlete.height_cm ? `${athlete.height_cm} cm` : '-'}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                                        <span className="text-[10px] text-slate-400 block font-medium">Weight</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {athlete.weight_kg ? `${athlete.weight_kg} kg` : '-'}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#b4f031]/10 dark:bg-[#b4f031]/10 border border-[#b4f031]/30">
                                        <span className="text-[10px] text-slate-700 dark:text-[#b4f031] block font-semibold">Body Mass Index</span>
                                        <span className="text-xs font-bold text-slate-950 dark:text-white">
                                            {athlete.bmi ? `${athlete.bmi} (${athlete.bmi_category})` : '-'}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                                        <span className="text-[10px] text-slate-400 block font-medium">Dominant Side</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {athlete.dominant_side === 'R' ? 'Right (R)' : athlete.dominant_side === 'L' ? 'Left (L)' : 'Bilateral'}
                                        </span>
                                    </div>
                                </div>

                                {athlete.injury_history && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            <span>Medical History / Past Injuries:</span>
                                        </span>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                                            {athlete.injury_history}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: DPA Assessment History */}
                    <div className="lg:col-span-8 space-y-4">
                        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                        Dynamic Posture Assessment History
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Recorded kinetic chain evaluations and corrective exercise regimens
                                    </CardDescription>
                                </div>
                                <Link href={route('dpa.create', { athlete_id: athlete.id })}>
                                    <Button size="sm" className="h-8 text-xs gap-1.5 font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-brand">
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        <span>New Assessment</span>
                                    </Button>
                                </Link>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-4">
                                {athlete.dpa_assessments.length === 0 ? (
                                    <div className="text-center py-10 space-y-2 border border-dashed border-[#b4f031]/30 rounded-lg bg-[#b4f031]/5">
                                        <Activity className="h-8 w-8 text-[#84cc16] dark:text-[#b4f031] mx-auto" />
                                        <p className="text-xs text-slate-500">
                                            No DPA assessment sessions recorded for this athlete yet.
                                        </p>
                                        <Link href={route('dpa.create', { athlete_id: athlete.id })}>
                                            <Button size="sm" variant="outline" className="text-xs">
                                                Perform Initial Assessment
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {athlete.dpa_assessments.map((session, index) => {
                                            const totalDeviations = session.details.length;
                                            let riskBadge = <Badge variant="brand" className="font-bold">Low Risk ({totalDeviations} Deviations)</Badge>;

                                            if (totalDeviations >= 5) {
                                                riskBadge = <Badge variant="destructive" className="font-bold">High Risk ({totalDeviations} Deviations)</Badge>;
                                            } else if (totalDeviations >= 3) {
                                                riskBadge = <Badge variant="warning" className="font-bold">Moderate Risk ({totalDeviations} Deviations)</Badge>;
                                            }

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-[#b4f031]/50 dark:hover:border-[#b4f031]/50 transition-all space-y-3 shadow-sm hover:shadow-brand"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-extrabold text-slate-900 dark:text-[#b4f031]">
                                                                    Session #{athlete.dpa_assessments.length - index}
                                                                </span>
                                                                <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                                                                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                                                    {new Date(session.assessment_date).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            {session.assessor && (
                                                                <p className="text-[11px] text-slate-400">
                                                                    Assessor: {session.assessor.name}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {riskBadge}
                                                            <Link href={route('dpa.show', session.id)}>
                                                                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                                                                    <span>View Report</span>
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Detected Compensations Pills */}
                                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                                                        {session.details.map((d) => (
                                                            <span
                                                                key={d.id}
                                                                className="inline-flex items-center gap-1 rounded-md bg-[#b4f031]/10 border border-[#b4f031]/20 px-2 py-0.5 text-[11px] text-slate-900 dark:text-[#b4f031] font-semibold"
                                                            >
                                                                <span>{d.compensation.name}</span>
                                                                <span className="text-[9px] text-slate-500 dark:text-slate-400">({d.side})</span>
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {session.notes && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            "{session.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
