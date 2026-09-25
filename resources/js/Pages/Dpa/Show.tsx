import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    ArrowLeft,
    Printer,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Dumbbell,
    Layers,
} from 'lucide-react';

interface Compensation {
    id: number;
    category: string;
    name: string;
    checkpoint: string;
    overactive_muscles?: string;
    underactive_muscles?: string;
    possible_injuries?: string;
    exercises_smr?: string;
    exercises_stretching?: string;
    exercises_isometrics?: string;
    exercises_integrated?: string;
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
    athlete: {
        id: number;
        athlete_code: string;
        full_name: string;
        gender: string;
        sport_category: string;
        position_specialty?: string;
        club_institution?: string;
        bmi?: number;
        bmi_category?: string;
    };
    assessor?: {
        name: string;
    };
    details: Detail[];
}

interface Analytics {
    totalDeviations: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    overactiveMuscles: string[];
    underactiveMuscles: string[];
    possibleInjuries: string[];
    correctiveProtocol: {
        smr: string[];
        stretching: string[];
        isometrics: string[];
        integrated: string[];
    };
}

interface ShowProps {
    assessment: Assessment;
    analytics: Analytics;
}

export default function DpaShow({ assessment, analytics }: ShowProps) {
    const handlePrint = () => {
        window.print();
    };

    const groupedDetails = assessment.details.reduce((acc, curr) => {
        const cat = curr.compensation.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {} as Record<string, Detail[]>);

    return (
        <AuthenticatedLayout>
            <Head title={`DPA Report - ${assessment.athlete.full_name}`} />

            <div className="space-y-6 max-w-5xl mx-auto print:max-w-full print:p-0">
                {/* Top Action Bar (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link href={route('athletes.show', assessment.athlete.id)}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Dynamic Posture Assessment Clinical Report
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Kinetic Chain Analysis & Corrective Exercise Prescription • DPA Trace
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="gap-1.5 text-xs shadow-sm"
                        >
                            <Printer className="h-3.5 w-3.5 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Print Report / PDF</span>
                        </Button>
                        <Link href={route('dpa.create', { athlete_id: assessment.athlete.id })}>
                            <Button size="sm" className="text-xs font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-brand">
                                + Re-assess
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Printable Report Header */}
                <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0E1526] print:shadow-none print:border-slate-300">
                    <CardHeader className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800/80 bg-[#b4f031]/5 dark:bg-[#b4f031]/5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2.5">
                                    <ApplicationLogo className="h-8 w-8" />
                                    <span className="text-xs font-bold text-slate-900 dark:text-[#b4f031] tracking-wide">
                                        DPA TRACE • POSTURE ASSESSMENT SYSTEM
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {assessment.athlete.full_name}
                                </h2>
                                <p className="text-xs font-semibold text-slate-700 dark:text-[#b4f031]">
                                    {assessment.athlete.athlete_code} • {assessment.athlete.sport_category} {assessment.athlete.position_specialty && `(${assessment.athlete.position_specialty})`}
                                </p>
                            </div>

                            <div className="flex flex-col sm:items-end gap-1.5">
                                <Badge
                                    variant={
                                        analytics.riskLevel === 'High'
                                            ? 'destructive'
                                            : analytics.riskLevel === 'Moderate'
                                            ? 'warning'
                                            : 'brand'
                                    }
                                    className="text-xs py-1 px-3 shadow-sm font-bold"
                                >
                                    Risk Level: {analytics.riskLevel} ({analytics.totalDeviations} Deviations)
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Assessment Date: {new Date(assessment.assessment_date).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                                {assessment.assessor && (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Assessor: {assessment.assessor.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* Section 1: Detected Deviations Matrix */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#b4f031] flex items-center gap-1.5">
                                <Activity className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                                <span>1. Observed Postural Compensations</span>
                            </h3>

                            {assessment.details.length === 0 ? (
                                <div className="p-4 rounded-lg bg-[#b4f031]/10 border border-[#b4f031]/30 text-xs text-slate-900 dark:text-[#b4f031] flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>Optimal dynamic posture. No kinetic chain compensation or deviation detected.</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {Object.entries(groupedDetails).map(([category, items]) => (
                                        <div
                                            key={category}
                                            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 shadow-sm"
                                        >
                                            <span className="text-xs font-bold text-slate-900 dark:text-[#b4f031] block border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                                {category}
                                            </span>
                                            <div className="space-y-2">
                                                {items.map((it) => (
                                                    <div key={it.id} className="text-xs space-y-0.5">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                • {it.compensation.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#b4f031]/10 text-slate-900 dark:text-[#b4f031] border border-[#b4f031]/30">
                                                                {it.severity} ({it.side})
                                                            </span>
                                                        </div>
                                                        {it.specific_note && (
                                                            <p className="text-[11px] text-slate-500 pl-3">
                                                                Note: {it.specific_note}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Biomechanical Muscle Imbalance Analysis */}
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#b4f031] flex items-center gap-1.5">
                                <Layers className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                                <span>2. Muscle Balance & Biomechanical Mapping</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Overactive */}
                                <div className="p-4 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-800/50 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300">
                                        <span>🔴 Overactive / Shortened Muscles</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Inhibit (SMR) and lengthen (static/dynamic stretching) prior to high-load training.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {analytics.overactiveMuscles.map((m) => (
                                            <span
                                                key={m}
                                                className="inline-block rounded-md bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-2 py-0.5 text-xs font-semibold"
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Underactive */}
                                <div className="p-4 rounded-lg bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/50 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                                        <span>🔵 Underactive / Lengthened Muscles</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Activate and strengthen with isolated resistance to restore joint stability.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {analytics.underactiveMuscles.map((m) => (
                                            <span
                                                key={m}
                                                className="inline-block rounded-md bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 px-2 py-0.5 text-xs font-semibold"
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {analytics.possibleInjuries.length > 0 && (
                                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-xs space-y-1">
                                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>Potential Injury Risks If Uncorrected:</span>
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 pl-4 font-medium">
                                        {analytics.possibleInjuries.join(' • ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Section 3: 4-Phase Corrective Exercise Prescription */}
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#b4f031] flex items-center gap-1.5">
                                <Dumbbell className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                                <span>3. 4-Phase Corrective Exercise Continuum</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phase 1: Inhibit */}
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Phase 1: Inhibit (SMR Foam Roll)
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#b4f031]/15 font-bold text-slate-900 dark:text-[#b4f031]">
                                            Hold 30-60s
                                        </span>
                                    </div>
                                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                                        {analytics.correctiveProtocol.smr.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Phase 2: Lengthen */}
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Phase 2: Lengthen (Static Stretch)
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#b4f031]/15 font-bold text-slate-900 dark:text-[#b4f031]">
                                            Hold 20-30s
                                        </span>
                                    </div>
                                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                                        {analytics.correctiveProtocol.stretching.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Phase 3: Activate */}
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Phase 3: Activate (Isolated Strength)
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#b4f031]/15 font-bold text-slate-900 dark:text-[#b4f031]">
                                            10-15 Reps
                                        </span>
                                    </div>
                                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                                        {analytics.correctiveProtocol.isometrics.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Phase 4: Integrate */}
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Phase 4: Integrate (Functional Movement)
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#b4f031]/15 font-bold text-slate-900 dark:text-[#b4f031]">
                                            10-15 Reps
                                        </span>
                                    </div>
                                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                                        {analytics.correctiveProtocol.integrated.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* General Notes */}
                        {assessment.notes && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                                    Assessor Remarks:
                                </span>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {assessment.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
