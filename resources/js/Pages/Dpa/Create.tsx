import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Badge } from '@/Components/ui/Badge';
import {
    ArrowLeft,
    Save,
    CheckSquare,
    Square,
    User,
    Zap,
    Activity,
} from 'lucide-react';

interface Compensation {
    id: number;
    category: string;
    name: string;
    checkpoint: string;
    overactive_muscles?: string;
    underactive_muscles?: string;
    possible_injuries?: string;
}

interface Athlete {
    id: number;
    athlete_code: string;
    full_name: string;
    sport_category: string;
    gender: string;
    height_cm?: number;
    weight_kg?: number;
}

interface CreateProps {
    athletes: Athlete[];
    selectedAthlete?: Athlete | null;
    compensationsGrouped: Record<string, Compensation[]>;
}

interface SelectedItem {
    id: number;
    severity: 'Mild' | 'Moderate' | 'Severe';
    side: 'Left' | 'Right' | 'Bilateral';
    specific_note?: string;
}

export default function DpaCreate({
    athletes,
    selectedAthlete,
    compensationsGrouped,
}: CreateProps) {
    const [activeTab, setActiveTab] = useState<string>('Anterior View');

    const { data, setData, post, processing, errors } = useForm({
        athlete_id: selectedAthlete ? selectedAthlete.id : (athletes[0]?.id || ''),
        assessment_date: new Date().toISOString().split('T')[0],
        current_height_cm: selectedAthlete?.height_cm || '',
        current_weight_kg: selectedAthlete?.weight_kg || '',
        notes: '',
        selected_compensations: [] as SelectedItem[],
    });

    const isSelected = (id: number) => {
        return data.selected_compensations.some((c) => c.id === id);
    };

    const toggleCompensation = (comp: Compensation) => {
        if (isSelected(comp.id)) {
            setData(
                'selected_compensations',
                data.selected_compensations.filter((c) => c.id !== comp.id),
            );
        } else {
            setData('selected_compensations', [
                ...data.selected_compensations,
                {
                    id: comp.id,
                    severity: 'Moderate',
                    side: 'Bilateral',
                    specific_note: '',
                },
            ]);
        }
    };

    const updateCompensationDetail = (
        id: number,
        field: keyof SelectedItem,
        val: any,
    ) => {
        setData(
            'selected_compensations',
            data.selected_compensations.map((c) => {
                if (c.id === id) {
                    return { ...c, [field]: val };
                }
                return c;
            }),
        );
    };

    // Live Biomechanical Analytics Calculation
    const liveAnalytics = useMemo(() => {
        const allComps: Compensation[] = Object.values(compensationsGrouped).flat();
        const activeCompObjs = allComps.filter((c) => isSelected(c.id));

        const overactive: string[] = [];
        const underactive: string[] = [];
        const injuries: string[] = [];

        activeCompObjs.forEach((c) => {
            if (c.overactive_muscles) {
                c.overactive_muscles.split('\n').forEach((m) => {
                    const t = m.trim();
                    if (t && !overactive.includes(t)) overactive.push(t);
                });
            }
            if (c.underactive_muscles) {
                c.underactive_muscles.split('\n').forEach((m) => {
                    const t = m.trim();
                    if (t && !underactive.includes(t)) underactive.push(t);
                });
            }
            if (c.possible_injuries) {
                c.possible_injuries.split('\n').forEach((inj) => {
                    const t = inj.trim();
                    if (t && !injuries.includes(t)) injuries.push(t);
                });
            }
        });

        const total = data.selected_compensations.length;
        let risk = 'Low';
        if (total >= 5) risk = 'High';
        else if (total >= 3) risk = 'Moderate';

        return {
            total,
            risk,
            overactive,
            underactive,
            injuries,
        };
    }, [data.selected_compensations, compensationsGrouped]);

    const categories = Object.keys(compensationsGrouped);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dpa.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New DPA Assessment - Athlete DPA" />

            <form onSubmit={submit} className="space-y-6">
                <PageHeader
                    icon={Activity}
                    backUrl={route('dpa.index')}
                    backLabel="Kembali ke Analisis DPA"
                    title={
                        <>
                            Lembar Penilaian <span className="text-[#84cc16] dark:text-[#b4f031]">DPA</span>
                        </>
                    }
                    description="Protokol Standar Athlete DPA • 4-View Kinetic Checkpoints & Overactive/Underactive Muscle Mapping."
                    actions={
                        <Button type="submit" size="sm" className="gap-1.5 font-bold rounded-md" isLoading={processing}>
                            <Save className="h-4 w-4" />
                            <span>Simpan Penilaian</span>
                        </Button>
                    }
                />

                {/* Athlete & Session Metadata */}
                <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-sm">
                    <CardHeader className="py-3 px-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                        <CardTitle className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>1. Athlete & Session Metadata</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="athlete_id" required>
                                    Select Athlete
                                </Label>
                                <select
                                    id="athlete_id"
                                    value={data.athlete_id}
                                    onChange={(e) => {
                                        const selected = athletes.find((a) => a.id === Number(e.target.value));
                                        setData((prev) => ({
                                            ...prev,
                                            athlete_id: e.target.value,
                                            current_height_cm: selected?.height_cm || prev.current_height_cm,
                                            current_weight_kg: selected?.weight_kg || prev.current_weight_kg,
                                        }));
                                    }}
                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                    required
                                >
                                    {athletes.map((ath) => (
                                        <option key={ath.id} value={ath.id}>
                                            {ath.full_name} ({ath.athlete_code} - {ath.sport_category})
                                        </option>
                                    ))}
                                </select>
                                {errors.athlete_id && (
                                    <p className="text-xs text-red-600">{errors.athlete_id}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="assessment_date" required>
                                    Assessment Date
                                </Label>
                                <Input
                                    id="assessment_date"
                                    type="date"
                                    value={data.assessment_date}
                                    onChange={(e) => setData('assessment_date', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="current_height_cm">Height (cm)</Label>
                                    <Input
                                        id="current_height_cm"
                                        type="number"
                                        step="0.1"
                                        value={data.current_height_cm}
                                        onChange={(e) => setData('current_height_cm', e.target.value)}
                                        placeholder="180"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="current_weight_kg">Weight (kg)</Label>
                                    <Input
                                        id="current_weight_kg"
                                        type="number"
                                        step="0.1"
                                        value={data.current_weight_kg}
                                        onChange={(e) => setData('current_weight_kg', e.target.value)}
                                        placeholder="75"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Assessment Body: Tabs + Live Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Checklist Column */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* View Tabs with #b4f031 Active Indicator */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
                            {categories.map((cat) => {
                                const countInCat = (compensationsGrouped[cat] || []).filter((c) => isSelected(c.id)).length;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveTab(cat)}
                                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
                                            activeTab === cat
                                                ? 'bg-[#b4f031] text-slate-950 font-bold'
                                                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-[#b4f031]'
                                        }`}
                                    >
                                        <span>{cat}</span>
                                        {countInCat > 0 && (
                                            <span className={`h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                                                activeTab === cat ? 'bg-slate-950 text-[#b4f031]' : 'bg-[#b4f031] text-slate-950'
                                            }`}>
                                                {countInCat}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Compensations List in Active Tab */}
                        <div className="space-y-3">
                            {(compensationsGrouped[activeTab] || []).map((comp) => {
                                const selected = isSelected(comp.id);
                                const selectedData = data.selected_compensations.find((c) => c.id === comp.id);

                                return (
                                    <div
                                        key={comp.id}
                                        className={`rounded-lg border p-4 transition-all ${
                                            selected
                                                ? 'border-[#b4f031] bg-[#b4f031]/10 dark:border-[#b4f031]/70 dark:bg-[#b4f031]/10 ring-1 ring-[#b4f031]/30'
                                                : 'border-slate-200/90 bg-white hover:border-[#b4f031]/60 dark:border-slate-800 dark:bg-[#0E1526]/80'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleCompensation(comp)}
                                                className="mt-0.5 focus:outline-none"
                                            >
                                                {selected ? (
                                                    <CheckSquare className="h-5 w-5 text-[#84cc16] dark:text-[#b4f031]" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-slate-300 hover:text-[#84cc16] dark:text-slate-600" />
                                                )}
                                            </button>

                                            <div className="flex-1 space-y-2.5">
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={() => toggleCompensation(comp)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {comp.name}
                                                        </span>
                                                        <Badge variant="brand" className="text-[10px] py-0">
                                                            {comp.checkpoint}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* If Selected, Show Severity & Side Selectors */}
                                                {selected && selectedData && (
                                                    <div className="pt-2.5 border-t border-[#b4f031]/20 dark:border-[#b4f031]/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in-0 duration-150">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-900 dark:text-[#b4f031] block mb-1">
                                                                Severity Level
                                                            </label>
                                                            <select
                                                                value={selectedData.severity}
                                                                onChange={(e) =>
                                                                    updateCompensationDetail(
                                                                        comp.id,
                                                                        'severity',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-8 w-full rounded-md border border-[#b4f031]/40 bg-white px-2 text-[11px] font-medium text-slate-900 focus:outline-none dark:border-[#b4f031]/30 dark:bg-slate-950 dark:text-slate-100"
                                                            >
                                                                <option value="Mild">Mild</option>
                                                                <option value="Moderate">Moderate</option>
                                                                <option value="Severe">Severe</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-900 dark:text-[#b4f031] block mb-1">
                                                                Deviation Side
                                                            </label>
                                                            <select
                                                                value={selectedData.side}
                                                                onChange={(e) =>
                                                                    updateCompensationDetail(
                                                                        comp.id,
                                                                        'side',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-8 w-full rounded-md border border-[#b4f031]/40 bg-white px-2 text-[11px] font-medium text-slate-900 focus:outline-none dark:border-[#b4f031]/30 dark:bg-slate-950 dark:text-slate-100"
                                                            >
                                                                <option value="Bilateral">Bilateral</option>
                                                                <option value="Right">Right Side</option>
                                                                <option value="Left">Left Side</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-900 dark:text-[#b4f031] block mb-1">
                                                                Specific Notes (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. 5° valgus deviation..."
                                                                value={selectedData.specific_note || ''}
                                                                onChange={(e) =>
                                                                    updateCompensationDetail(
                                                                        comp.id,
                                                                        'specific_note',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-8 w-full rounded-md border border-[#b4f031]/40 bg-white px-2 text-[11px] font-medium text-slate-900 focus:outline-none dark:border-[#b4f031]/30 dark:bg-slate-950 dark:text-slate-100"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* General Notes */}
                        <div className="space-y-1.5 pt-2">
                            <Label htmlFor="notes">Assessor Clinical Observations & Notes</Label>
                            <textarea
                                id="notes"
                                rows={3}
                                placeholder="Enter general remarks on core stability, mobility constraints, or movement dynamics..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-600 dark:focus-visible:ring-[#b4f031]"
                            />
                        </div>
                    </div>

                    {/* Right Live Biomechanical Analytics Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="border-slate-200/90 dark:border-slate-800 sticky top-20 shadow-xs bg-white dark:bg-[#0E1526]">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-slate-900 dark:text-[#b4f031] uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap className="h-3.5 w-3.5 text-[#84cc16] dark:text-[#b4f031]" />
                                        <span>Live Biomechanics</span>
                                    </CardTitle>
                                    <Badge
                                        variant={
                                            liveAnalytics.risk === 'High'
                                                ? 'destructive'
                                                : liveAnalytics.risk === 'Moderate'
                                                ? 'warning'
                                                : 'success'
                                        }
                                        className="text-[10px]"
                                    >
                                        {liveAnalytics.risk} Risk
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {liveAnalytics.total} Deviations Detected
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                                {/* Overactive Muscles */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 block flex items-center gap-1">
                                        <span>🔴 Overactive Muscles (Tight)</span>
                                    </span>
                                    {liveAnalytics.overactive.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">No flags yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {liveAnalytics.overactive.map((m) => (
                                                <span
                                                    key={m}
                                                    className="inline-block rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-800/50 px-1.5 py-0.5 text-[10px] text-red-700 dark:text-red-300 font-semibold"
                                                >
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Underactive Muscles */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                                        <span>🔵 Underactive Muscles (Weak)</span>
                                    </span>
                                    {liveAnalytics.underactive.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">No flags yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {liveAnalytics.underactive.map((m) => (
                                                <span
                                                    key={m}
                                                    className="inline-block rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 px-1.5 py-0.5 text-[10px] text-blue-700 dark:text-blue-300 font-semibold"
                                                >
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Potential Injuries */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                                        <span>⚠️ Potential Injury Risks:</span>
                                    </span>
                                    {liveAnalytics.injuries.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">Minimal risk identified.</p>
                                    ) : (
                                        <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                                            {liveAnalytics.injuries.slice(0, 5).map((inj) => (
                                                <li key={inj}>{inj}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="submit"
                                        className="w-full h-9 text-xs gap-1.5 rounded-md font-bold"
                                        isLoading={processing}
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Save & Generate Prescription</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
