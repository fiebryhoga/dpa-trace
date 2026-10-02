import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    ChevronLeft,
    Plus,
    History,
    Activity,
    Edit,
    Trash2,
    ShieldAlert,
    Dumbbell,
    Zap,
    Target,
    FileText,
    Flame,
    CheckCircle2,
    Camera,
    User,
    Calendar,
    ArrowLeft,
    Check,
} from 'lucide-react';
import {
    Athlete,
    DpaAssessment,
    DpaCompensation,
    AthleteGallery as AthleteGalleryType,
    PageProps,
} from '@/types';
import AssessmentForm from './Partials/AssessmentForm';
import AthleteGallery from './Partials/AthleteGallery';
import BodyMuscleVisualizer from '@/Components/BodyMuscleVisualizer';

interface DpaShowProps extends PageProps {
    athlete: Athlete;
    assessments?: DpaAssessment[];
    compensations?: DpaCompensation[];
    galleries?: AthleteGalleryType[];
}

export default function DpaShow({
    auth,
    athlete,
    assessments = [],
    compensations = [],
    galleries = [],
}: DpaShowProps) {
    const [activeTab, setActiveTab] = useState<'analysis' | 'gallery' | 'input'>('analysis');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [initialStepData, setInitialStepData] = useState<Record<string, any>>({});
    const [expandedCompVisualId, setExpandedCompVisualId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset } = useForm<{
        assessment_date: string;
        notes: string;
        current_height_cm?: string | number;
        current_weight_kg?: string | number;
        compensations: number[];
        step_photos?: Record<string, File>;
        step_annotated_photos?: Record<string, File>;
        step_metadata?: Record<string, any>;
    }>({
        assessment_date: new Date().toISOString().split('T')[0],
        notes: '',
        current_height_cm: athlete.height_cm || '',
        current_weight_kg: athlete.weight_kg || '',
        compensations: [],
        step_photos: {},
        step_annotated_photos: {},
        step_metadata: {},
    });

    const handleEdit = (item: DpaAssessment) => {
        setIsEditMode(true);
        setEditId(item.id);
        setData({
            assessment_date: item.assessment_date ? item.assessment_date.split('T')[0] : '',
            notes: item.notes || '',
            current_height_cm: item.current_height_cm || athlete.height_cm || '',
            current_weight_kg: item.current_weight_kg || athlete.weight_kg || '',
            compensations: (item.details || []).map((d) => d.dpa_compensation_id),
            step_photos: {},
            step_annotated_photos: {},
            step_metadata: {},
        });

        // Extract posture photos and saved landmarks linked to this assessment
        const linkedGalleries = galleries.filter((g) => g.meta?.assessment_id === item.id);
        const stepDataMap: Record<string, any> = {};

        linkedGalleries.forEach((g) => {
            const viewCat = g.meta?.view_category;
            if (viewCat) {
                stepDataMap[viewCat] = {
                    imagePath: g.original_image_path || g.image_path,
                    originalImagePath: g.original_image_path || g.image_path,
                    landmarks: g.annotations || g.meta?.landmarks || [],
                    showGoniometer: g.meta?.show_goniometer ?? true,
                    scanResults: g.meta?.detected_compensations
                        ? { detected_compensations: g.meta.detected_compensations }
                        : null,
                };
            }
        });

        setInitialStepData(stepDataMap);
        setActiveTab('input');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data evaluasi DPA ini?')) {
            router.delete(route('dpa.destroy', id), { preserveScroll: true });
        }
    };

    const cancelEdit = () => {
        setIsEditMode(false);
        setEditId(null);
        setInitialStepData({});
        reset();
        setActiveTab('analysis');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && editId) {
            put(route('dpa.update', editId), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route('dpa.store', athlete.id), {
                onSuccess: () => cancelEdit(),
            });
        }
    };

    const latest = assessments[0] || null;

    // Derived analysis
    const analysis = useMemo(() => {
        if (!latest || !latest.details) return null;
        const comps = latest.details
            .map((d) => d.compensation)
            .filter((c): c is DpaCompensation => Boolean(c))
            .sort((a, b) => a.name.localeCompare(b.name));

        const result = {
            compensations: comps,
            overactive: [] as string[],
            underactive: [] as string[],
            injuries: [] as string[],
        };

        const addItems = (source?: string, target: string[] = []) => {
            if (!source) return;
            const items = source
                .split(/[\n,]/)
                .map((s) => s.trim().replace(/^-\s*/, ''))
                .filter(Boolean);
            items.forEach((item) => {
                if (!target.includes(item)) target.push(item);
            });
        };

        comps.forEach((c) => {
            addItems(c.overactive_muscles, result.overactive);
            addItems(c.underactive_muscles, result.underactive);
            addItems(c.possible_injuries, result.injuries);
        });

        return result;
    }, [latest]);

    const splitItems = (str?: string) => {
        if (!str) return [];
        return str
            .split(/[\n,]/)
            .map((s) => s.trim().replace(/^-\s*/, ''))
            .filter(Boolean);
    };



    const initials = athlete.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title={`Analisis DPA - ${athlete.full_name}`} />

            <div className="space-y-5 pb-12">
                {/* ─── 1. INTEGRATED PAGE HEADER & NAVIGATION TABS ─── */}
                <PageHeader
                    backUrl={route('dpa.index')}
                    backLabel="Daftar Atlet"
                    icon={
                        athlete.photo_url ? (
                            <img
                                src={athlete.photo_url}
                                alt={athlete.full_name}
                                className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-md bg-lime-500/10 dark:bg-lime-500/20 text-[#65a30d] dark:text-[#b4f031] font-bold text-xs flex items-center justify-center border border-lime-500/30 shrink-0">
                                {initials}
                            </div>
                        )
                    }
                    title={athlete.full_name}
                    description={
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-bold text-[#65a30d] dark:text-[#b4f031]">
                                {athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                            {athlete.age && <span>• {athlete.age} th</span>}
                            {athlete.height_cm && <span>• {athlete.height_cm} cm</span>}
                            {athlete.weight_kg && <span>• {athlete.weight_kg} kg</span>}
                            {athlete.bmi && (
                                <span>
                                    • BMI {athlete.bmi}{' '}
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                                        ({athlete.bmi_category})
                                    </span>
                                </span>
                            )}
                            {athlete.dominant_side && (
                                <span>• Sisi Dominan {athlete.dominant_side}</span>
                            )}
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-2 flex-wrap">

                            {activeTab !== 'input' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('input');
                                        setIsEditMode(false);
                                        reset();
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 font-bold rounded-md text-xs shadow-2xs transition-all cursor-pointer"
                                >
                                    <Plus size={14} className="stroke-[3]" />
                                    <span>Input Asesmen Baru</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={14} className="text-[#65a30d] dark:text-[#b4f031]" />
                                    <span>Kembali ke Analisis</span>
                                </button>
                            )}
                        </div>
                    }
                >
                    {/* Integrated Underline Tabs */}
                    <div className="flex items-center justify-between pt-2 -mb-3">
                        <div className="flex items-center gap-6 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === 'input') cancelEdit();
                                    setActiveTab('analysis');
                                }}
                                className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
                                    activeTab === 'analysis'
                                        ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#84cc16] dark:after:bg-[#b4f031]'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
                                }`}
                            >
                                <Target size={14} className={activeTab === 'analysis' ? 'text-[#65a30d] dark:text-[#b4f031]' : ''} />
                                <span>Hasil Analisis &amp; Protokol</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === 'input') cancelEdit();
                                    setActiveTab('gallery');
                                }}
                                className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
                                    activeTab === 'gallery'
                                        ? 'text-slate-900 dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#84cc16] dark:after:bg-[#b4f031]'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
                                }`}
                            >
                                <Camera size={14} className={activeTab === 'gallery' ? 'text-[#65a30d] dark:text-[#b4f031]' : ''} />
                                <span>Galeri Postur DPA</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-lime-500/15 text-lime-800 dark:text-[#b4f031] font-bold">
                                    {galleries.length}
                                </span>
                            </button>

                            {activeTab === 'input' && (
                                <div className="pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#84cc16] dark:after:bg-[#b4f031]">
                                    <Plus size={14} className="text-[#65a30d] dark:text-[#b4f031]" />
                                    <span>{isEditMode ? 'Edit Asesmen' : 'Form Asesmen Baru'}</span>
                                </div>
                            )}
                        </div>

                        {activeTab === 'input' && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pb-3"
                            >
                                ← Batalkan &amp; Kembali
                            </button>
                        )}
                    </div>
                </PageHeader>

                {/* ─── TAB 1: ANALISIS KOMPENSASI & PROTOKOL ─── */}
                {activeTab === 'analysis' && (
                    <div>
                        {analysis ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* ═══════════════════════════════════════
                                    KOLOM KIRI: Analisis Temuan Kompensasi & 4-Fase Koreksi
                                   ═══════════════════════════════════════ */}
                                <div className="order-1 lg:col-span-8 space-y-4">
                                    {analysis.compensations.map((comp, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs overflow-hidden"
                                        >
                                            {/* Header Kartu Kompensasi */}
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[11px] font-mono font-bold text-[#65a30d] dark:text-[#b4f031] uppercase">
                                                        {comp.category}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                        {comp.name}
                                                    </h3>
                                                </div>
                                                {comp.checkpoint && (
                                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        {comp.checkpoint}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                                                {/* Kolom Kiri Dalam: Ilustrasi Visual & Ketidakseimbangan Otot */}
                                                <div className="lg:col-span-4 space-y-3 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-5">
                                                    {comp.image_path && (
                                                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-2 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={
                                                                    comp.image_path.startsWith('/')
                                                                        ? comp.image_path
                                                                        : `/storage/${comp.image_path}`
                                                                }
                                                                alt={comp.name}
                                                                className="w-full h-36 object-contain rounded-sm"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2 text-xs">
                                                        {/* Overactive */}
                                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-md p-3 border border-slate-200/80 dark:border-slate-800 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                                                                <Flame size={13} className="shrink-0" />
                                                                <span>Otot Overactive (Tegang)</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.overactive_muscles).join(', ') || '-'}
                                                            </p>
                                                        </div>

                                                        {/* Underactive */}
                                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-md p-3 border border-slate-200/80 dark:border-slate-800 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                                                <Dumbbell size={13} className="shrink-0" />
                                                                <span>Otot Underactive (Lemah)</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.underactive_muscles).join(', ') || '-'}
                                                            </p>
                                                        </div>

                                                        {/* Potensi Cedera */}
                                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-md p-3 border border-slate-200/80 dark:border-slate-800 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                                                                <ShieldAlert size={13} className="shrink-0" />
                                                                <span>Potensi Cedera</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.possible_injuries).join(', ') || '-'}
                                                            </p>
                                                        </div>

                                                        {/* Visual Body Toggle for this compensation */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedCompVisualId(expandedCompVisualId === comp.id ? null : comp.id)}
                                                            className="w-full py-1.5 px-2.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                                        >
                                                            <Activity size={12} className="text-[#65a30d] dark:text-[#b4f031]" />
                                                            <span>{expandedCompVisualId === comp.id ? 'Sembunyikan Peta Visual' : 'Lihat Peta Visual Temuan Ini'}</span>
                                                        </button>

                                                        {expandedCompVisualId === comp.id && (
                                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 animate-in fade-in">
                                                                <BodyMuscleVisualizer
                                                                    overactiveMuscles={comp.overactive_muscles}
                                                                    underactiveMuscles={comp.underactive_muscles}
                                                                    possibleInjuries={comp.possible_injuries}
                                                                    category={comp.category}
                                                                    checkpoint={comp.checkpoint}
                                                                    compact={true}
                                                                    gender={athlete.gender}
                                                                    showModeSwitcher={true}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Kolom Kanan Dalam: 4-Fase Protokol Latihan Korektif */}
                                                <div className="lg:col-span-8 space-y-3">
                                                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                                        <Zap size={14} className="text-[#65a30d] dark:text-[#b4f031]" />
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                            Protokol Korektif (4 Fase NASM)
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Phase 1: Inhibit */}
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-md p-3 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-lime-500/15 text-lime-900 dark:text-[#b4f031] border border-lime-500/30 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                        1
                                                                    </span>
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Inhibit
                                                                        </h5>
                                                                        <span className="text-[10px] text-slate-500">
                                                                            Self-Myofascial Release (SMR)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 mt-2.5">
                                                                    {splitItems(comp.exercises_smr).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                                            <span className="text-[#84cc16] mt-0.5">•</span>
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_smr && (
                                                                <img
                                                                    src={comp.image_smr.startsWith('/') ? comp.image_smr : `/storage/${comp.image_smr}`}
                                                                    alt="SMR"
                                                                    className="mt-3 w-full max-h-24 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 2: Lengthen */}
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-md p-3 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-lime-500/15 text-lime-900 dark:text-[#b4f031] border border-lime-500/30 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                        2
                                                                    </span>
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Lengthen
                                                                        </h5>
                                                                        <span className="text-[10px] text-slate-500">
                                                                            Peregangan Statis / Dinamis
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 mt-2.5">
                                                                    {splitItems(comp.exercises_stretching).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                                            <span className="text-[#84cc16] mt-0.5">•</span>
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_stretching && (
                                                                <img
                                                                    src={comp.image_stretching.startsWith('/') ? comp.image_stretching : `/storage/${comp.image_stretching}`}
                                                                    alt="Stretching"
                                                                    className="mt-3 w-full max-h-24 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 3: Activate */}
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-md p-3 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-lime-500/15 text-lime-900 dark:text-[#b4f031] border border-lime-500/30 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                        3
                                                                    </span>
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Activate
                                                                        </h5>
                                                                        <span className="text-[10px] text-slate-500">
                                                                            Aktivasi Isometrik
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 mt-2.5">
                                                                    {splitItems(comp.exercises_isometrics).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                                            <span className="text-[#84cc16] mt-0.5">•</span>
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_isometrics && (
                                                                <img
                                                                    src={comp.image_isometrics.startsWith('/') ? comp.image_isometrics : `/storage/${comp.image_isometrics}`}
                                                                    alt="Isometrics"
                                                                    className="mt-3 w-full max-h-24 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 4: Integrate */}
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-md p-3 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-lime-500/15 text-lime-900 dark:text-[#b4f031] border border-lime-500/30 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                        4
                                                                    </span>
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Integrate
                                                                        </h5>
                                                                        <span className="text-[10px] text-slate-500">
                                                                            Integrasi Fungsional
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 mt-2.5">
                                                                    {splitItems(comp.exercises_integrated).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                                            <span className="text-[#84cc16] mt-0.5">•</span>
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_integrated && (
                                                                <img
                                                                    src={comp.image_integrated.startsWith('/') ? comp.image_integrated : `/storage/${comp.image_integrated}`}
                                                                    alt="Integrated"
                                                                    className="mt-3 w-full max-h-24 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {analysis.compensations.length === 0 && (
                                        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs space-y-2">
                                            <CheckCircle2 size={28} className="text-emerald-500 mx-auto" />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                Tidak Ada Kompensasi Gerakan Terdeteksi
                                            </p>
                                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                                Pola postur dan mekanika gerak atlet dinilai optimal tanpa deviasi biomekanik yang signifikan.
                                            </p>
                                        </div>
                                    )}

                                    {/* ─── DOKUMENTASI POSTUR DI BAWAH ANALISIS ─── */}
                                    <div className="pt-2">
                                        <AthleteGallery
                                            athlete={athlete}
                                            galleries={galleries}
                                            title="Dokumentasi &amp; Galeri Postur DPA"
                                            subtitle="Foto pengujian postur (Overhead Squat, Single Leg Squat, dll), analisis sudut derajat dan observasi visual."
                                            canManage={true}
                                        />
                                    </div>
                                </div>

                                {/* ═══════════════════════════════════════
                                    KOLOM KANAN (SIDEBAR): Profil Ketidakseimbangan, Catatan & Riwayat
                                   ═══════════════════════════════════════ */}
                                <div className="order-2 lg:col-span-4 space-y-4">
                                    {/* 1. Overall Muscle Imbalance Profile */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 rounded-t-md">
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Activity size={14} className="text-[#65a30d] dark:text-[#b4f031]" />
                                                <span>Profil Ketidakseimbangan Otot</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Visualisasi anatomi biomekanik &amp; temuan otot
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Interactive Visual Body Canvas for Muscles */}
                                            <BodyMuscleVisualizer
                                                overactiveMuscles={analysis.overactive}
                                                underactiveMuscles={analysis.underactive}
                                                title="Peta Ketidakseimbangan Otot"
                                                gender={athlete.gender}
                                                hideLegend={true}
                                            />

                                            {/* Overactive List */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                                        <Flame size={13} />
                                                        <h4 className="text-xs font-bold">
                                                            Otot Overactive
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        {analysis.overactive.length} otot
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-40 overflow-y-auto pr-1">
                                                    {analysis.overactive.length > 0 ? (
                                                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                                            {analysis.overactive.map((m, i) => (
                                                                <li key={i} className="flex items-baseline gap-2 py-0.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                                    <span>{m}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">
                                                            Tidak ada otot overactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Underactive List */}
                                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                        <Dumbbell size={13} />
                                                        <h4 className="text-xs font-bold">
                                                            Otot Underactive
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        {analysis.underactive.length} otot
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-40 overflow-y-auto pr-1">
                                                    {analysis.underactive.length > 0 ? (
                                                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                                            {analysis.underactive.map((m, i) => (
                                                                <li key={i} className="flex items-baseline gap-2 py-0.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                                    <span>{m}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">
                                                            Tidak ada otot underactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Injury Risk Profile (DITEMPATKAN DI ATAS DAFTAR RISIKO CEDERA) */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 rounded-t-md">
                                            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                                <ShieldAlert size={14} className="text-amber-500" />
                                                <span>Potensi Risiko Cedera</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Peta hotspot dan area rentan cedera
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Interactive Visual Body Canvas for Injury Hotspots */}
                                            <BodyMuscleVisualizer
                                                possibleInjuries={analysis.injuries}
                                                title="Peta Hotspot Risiko Cedera"
                                                gender={athlete.gender}
                                                hideLegend={true}
                                            />

                                            {/* Injuries List */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                        <ShieldAlert size={13} />
                                                        <h4 className="text-xs font-bold">
                                                            Risiko Cedera
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        {analysis.injuries.length} risiko
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-48 overflow-y-auto pr-1">
                                                    {analysis.injuries.length > 0 ? (
                                                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                                            {analysis.injuries.map((m, i) => (
                                                                <li key={i} className="flex items-baseline gap-2 py-0.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                                    <span>{m}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">
                                                            Tidak ada risiko cedera
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Clinical Notes */}
                                    {latest.notes && (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs p-4 space-y-2">
                                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                                <FileText size={14} className="text-slate-400" />
                                                <h3 className="text-xs font-bold">Catatan Klinis &amp; Observasi</h3>
                                            </div>
                                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                                                {latest.notes}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Evaluation History Timeline */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <History size={14} className="text-slate-400" />
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Riwayat Sesi Evaluasi
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-lime-500/15 text-lime-800 dark:text-[#b4f031] border border-lime-500/30">
                                                {assessments.length} Sesi
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                                            {assessments.length > 0 ? (
                                                assessments.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                                                {new Date(item.assessment_date).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {(item.details || []).length} kompensasi terdeteksi
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(item)}
                                                                className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                                                title="Edit Sesi"
                                                            >
                                                                <Edit size={12} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                                title="Hapus Sesi"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-slate-400 text-xs">
                                                    Belum ada riwayat asesmen.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ─── CLEAN UNBOXED EMPTY STATE ─── */
                            <div className="text-center max-w-md mx-auto py-12 sm:py-16 space-y-4">
                                <div className="w-12 h-12 rounded-md bg-lime-500/10 dark:bg-lime-500/20 text-[#65a30d] dark:text-[#b4f031] flex items-center justify-center mx-auto border border-lime-500/30">
                                    <Activity size={24} />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                        Belum Ada Data Asesmen DPA
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                                        Atlet ini belum memiliki data evaluasi postur dinamis. Mulai input temuan kompensasi gerakan sekarang.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('input')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 font-bold rounded-md text-xs shadow-2xs transition-all cursor-pointer"
                                >
                                    <Plus size={14} className="stroke-[3]" />
                                    <span>Mulai Input Asesmen</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 2: GALERI POSTUR DPA ─── */}
                {activeTab === 'gallery' && (
                    <div className="space-y-4">
                        <AthleteGallery
                            athlete={athlete}
                            galleries={galleries}
                            title="Dokumentasi &amp; Galeri Postur DPA"
                            subtitle="Unggah foto postur atlet, lakukan pengukuran sudut derajat (goniometri digital), dan simpan hasil observasi klinis."
                            canManage={true}
                        />
                    </div>
                )}

                {/* ─── TAB 3: INPUT / EDIT EVALUASI ─── */}
                {activeTab === 'input' && (
                    <div className="space-y-4">
                        <AssessmentForm
                            athleteId={athlete.id}
                            athleteGender={athlete.gender}
                            compensations={compensations}
                            galleryPhotos={galleries}
                            initialStepData={initialStepData}
                            data={data}
                            setData={setData}
                            submit={submit}
                            processing={processing}
                            isEditMode={isEditMode}
                            cancelEdit={cancelEdit}
                        />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
