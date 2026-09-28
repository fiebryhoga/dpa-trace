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
    Download,
    Calendar,
    Ruler,
    Weight,
    Printer,
    User,
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
    const [isExporting, setIsExporting] = useState(false);

    const { data, setData, post, put, processing, reset } = useForm<{
        assessment_date: string;
        notes: string;
        current_height_cm?: string | number;
        current_weight_kg?: string | number;
        compensations: number[];
        step_photos?: Record<string, File>;
    }>({
        assessment_date: new Date().toISOString().split('T')[0],
        notes: '',
        current_height_cm: athlete.height_cm || '',
        current_weight_kg: athlete.weight_kg || '',
        compensations: [],
        step_photos: {},
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
        });
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

    // PDF Export Trigger
    const handleExportPdf = () => {
        setIsExporting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('dpa.export-pdf', athlete.id);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const tableDataInput = document.createElement('input');
        tableDataInput.type = 'hidden';
        tableDataInput.name = 'table_data';
        tableDataInput.value = JSON.stringify({ latest });
        form.appendChild(tableDataInput);

        const noteInput = document.createElement('input');
        noteInput.type = 'hidden';
        noteInput.name = 'note';
        noteInput.value = latest?.notes || '';
        form.appendChild(noteInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Analisis DPA - ${athlete.full_name}`} />

            <div className="space-y-5 pb-12">
                <PageHeader
                    icon={User}
                    backUrl={route('dpa.index')}
                    backLabel="Daftar Atlet"
                    title={athlete.full_name}
                    badge={athlete.athlete_code}
                    description={
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-bold text-[#84cc16] dark:text-[#b4f031]">{athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            {athlete.age && <span>• {athlete.age} Tahun</span>}
                            {athlete.height_cm && <span>• {athlete.height_cm} cm</span>}
                            {athlete.weight_kg && <span>• {athlete.weight_kg} kg</span>}
                            {athlete.bmi && <span>• BMI {athlete.bmi} ({athlete.bmi_category})</span>}
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-2 flex-wrap">
                            {latest && (
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    disabled={isExporting}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                >
                                    <Printer size={14} className="text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>{isExporting ? 'Memproses PDF...' : 'Cetak Laporan PDF'}</span>
                                </button>
                            )}

                            {activeTab !== 'input' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('input');
                                        setIsEditMode(false);
                                        reset();
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 rounded-md text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Input Evaluasi Baru</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                >
                                    <Activity size={14} className="text-[#84cc16]" />
                                    <span>Kembali ke Analisis</span>
                                </button>
                            )}
                        </div>
                    }
                />

                {/* ─── 2. SUB-NAVIGATION TABS ─── */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('analysis')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                            activeTab === 'analysis'
                                ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                : 'bg-white dark:bg-[#0D1322] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <Target size={14} />
                        <span>Analisis Kompensasi &amp; Protokol</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('gallery')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                            activeTab === 'gallery'
                                ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                : 'bg-white dark:bg-[#0D1322] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <Camera size={14} />
                        <span>Galeri Postur DPA</span>
                        <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                activeTab === 'gallery'
                                    ? 'bg-slate-950/20 text-slate-950'
                                    : 'bg-[#b4f031]/20 text-slate-900 dark:text-[#b4f031]'
                            }`}
                        >
                            {galleries.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('input');
                            setIsEditMode(false);
                            reset();
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                            activeTab === 'input'
                                ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                : 'bg-white dark:bg-[#0D1322] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <Plus size={14} />
                        <span>Input Evaluasi</span>
                    </button>
                </div>

                {/* ─── TAB 1: ANALISIS KOMPENSASI & PROTOKOL ─── */}
                {activeTab === 'analysis' && (
                    <div>
                        {analysis ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                {/* ═══════════════════════════════════════
                                    KOLOM KIRI: Analisis Temuan Kompensasi & 4-Fase Koreksi
                                   ═══════════════════════════════════════ */}
                                <div className="order-1 lg:col-span-8 xl:col-span-9 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Target size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>Rincian Kompensasi Postur Terdeteksi</span>
                                        </h3>
                                        <span className="text-xs font-bold text-slate-400">
                                            {analysis.compensations.length} Temuan Gerakan
                                        </span>
                                    </div>

                                    {analysis.compensations.map((comp, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden hover:border-[#84cc16]/50 dark:hover:border-[#b4f031]/50 transition-all"
                                        >
                                            {/* Header Kartu Kompensasi */}
                                            <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="text-[11px] font-extrabold text-[#84cc16] dark:text-[#b4f031] uppercase tracking-wider">
                                                        {comp.category}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                                                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                                        {comp.name}
                                                    </h4>
                                                </div>
                                                {comp.checkpoint && (
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        {comp.checkpoint}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                                                {/* Kolom Kiri Dalam: Ilustrasi Visual & Ketidakseimbangan Otot */}
                                                <div className="lg:col-span-4 space-y-3 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-5">
                                                    {comp.image_path && (
                                                        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-lg p-2 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={
                                                                    comp.image_path.startsWith('/')
                                                                        ? comp.image_path
                                                                        : `/storage/${comp.image_path}`
                                                                }
                                                                alt={comp.name}
                                                                className="w-full h-36 object-contain rounded"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        {/* Overactive */}
                                                        <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-lg p-3 border border-rose-100 dark:border-rose-900/40 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                                                                <Flame size={13} className="shrink-0" />
                                                                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                                                    Otot Overactive (Tegang)
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.overactive_muscles).join(', ') || '-'}
                                                            </p>
                                                        </div>

                                                        {/* Underactive */}
                                                        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                                                <Dumbbell size={13} className="shrink-0" />
                                                                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                                                    Otot Underactive (Lemah)
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.underactive_muscles).join(', ') || '-'}
                                                            </p>
                                                        </div>

                                                        {/* Potensi Cedera */}
                                                        <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-100 dark:border-amber-900/40 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                                                <ShieldAlert size={13} className="shrink-0" />
                                                                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                                                    Potensi Risiko Cedera
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                                {splitItems(comp.possible_injuries).join(', ') || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Kolom Kanan Dalam: 4-Fase Protokol Latihan Korektif */}
                                                <div className="lg:col-span-8 space-y-3.5">
                                                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                                        <Zap size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                                            Protokol Latihan Korektif (4 Fase NASM)
                                                        </h5>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Phase 1: Inhibit */}
                                                        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                                        1
                                                                    </span>
                                                                    <div>
                                                                        <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Inhibit
                                                                        </h6>
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            Self-Myofascial Release (SMR)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-3">
                                                                    {splitItems(comp.exercises_smr).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-2 leading-snug">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] mt-1 shrink-0" />
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_smr && (
                                                                <img
                                                                    src={comp.image_smr.startsWith('/') ? comp.image_smr : `/storage/${comp.image_smr}`}
                                                                    alt="SMR"
                                                                    className="mt-3 w-full max-h-28 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 2: Lengthen */}
                                                        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                                        2
                                                                    </span>
                                                                    <div>
                                                                        <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Lengthen
                                                                        </h6>
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            Peregangan Statis/Dinamis
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-3">
                                                                    {splitItems(comp.exercises_stretching).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-2 leading-snug">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] mt-1 shrink-0" />
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_stretching && (
                                                                <img
                                                                    src={comp.image_stretching.startsWith('/') ? comp.image_stretching : `/storage/${comp.image_stretching}`}
                                                                    alt="Stretching"
                                                                    className="mt-3 w-full max-h-28 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 3: Activate */}
                                                        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                                        3
                                                                    </span>
                                                                    <div>
                                                                        <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Activate
                                                                        </h6>
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            Aktivasi Isometrik
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-3">
                                                                    {splitItems(comp.exercises_isometrics).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-2 leading-snug">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] mt-1 shrink-0" />
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_isometrics && (
                                                                <img
                                                                    src={comp.image_isometrics.startsWith('/') ? comp.image_isometrics : `/storage/${comp.image_isometrics}`}
                                                                    alt="Isometrics"
                                                                    className="mt-3 w-full max-h-28 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Phase 4: Integrate */}
                                                        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                                                    <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                                        4
                                                                    </span>
                                                                    <div>
                                                                        <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                            Integrate
                                                                        </h6>
                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            Integrasi Gerak Fungsional
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-3">
                                                                    {splitItems(comp.exercises_integrated).map((m, i) => (
                                                                        <li key={i} className="flex items-start gap-2 leading-snug">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] mt-1 shrink-0" />
                                                                            <span>{m}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            {comp.image_integrated && (
                                                                <img
                                                                    src={comp.image_integrated.startsWith('/') ? comp.image_integrated : `/storage/${comp.image_integrated}`}
                                                                    alt="Integrated"
                                                                    className="mt-3 w-full max-h-28 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {analysis.compensations.length === 0 && (
                                        <div className="p-8 text-center bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
                                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                Tidak Ada Kompensasi Gerakan Terdeteksi
                                            </p>
                                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                                Postur dan pola mekanika gerak atlet dinilai sangat optimal dalam pengujian ini.
                                            </p>
                                        </div>
                                    )}

                                    {/* ─── DOKUMENTASI POSTUR DI BAWAH ANALISIS ─── */}
                                    <div className="pt-3">
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
                                <div className="order-2 lg:col-span-4 xl:col-span-3 space-y-4">
                                    {/* 1. Overall Muscle Imbalance Profile */}
                                    <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Activity size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                                <span>Profil Ketidakseimbangan</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                Agregasi komprehensif temuan otot
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Overactive List */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                                        <Flame size={13} />
                                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                                            Otot Overactive
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        {analysis.overactive.length} otot
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
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
                                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                                            Otot Underactive
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        {analysis.underactive.length} otot
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
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

                                            {/* Injuries List */}
                                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                        <ShieldAlert size={13} />
                                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                                            Risiko Cedera
                                                        </h4>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        {analysis.injuries.length} risiko
                                                    </span>
                                                </div>
                                                <div className="pt-0.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
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
                                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs p-4 space-y-2">
                                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                                <FileText size={14} className="text-slate-400" />
                                                <h3 className="text-xs font-bold">Catatan Klinis &amp; Observasi</h3>
                                            </div>
                                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                                                {latest.notes}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Evaluation History Timeline */}
                                    <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <History size={14} className="text-slate-400" />
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Riwayat Sesi Evaluasi
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {assessments.length} Sesi
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto custom-scrollbar">
                                            {assessments.length > 0 ? (
                                                assessments.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                                                {new Date(item.assessment_date).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {(item.details || []).length} kompensasi tercatat
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(item)}
                                                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                                                title="Edit Sesi"
                                                            >
                                                                <Edit size={12} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
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
                            <div className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-[#b4f031]/10 text-slate-900 dark:text-[#b4f031] flex items-center justify-center mx-auto">
                                    <Activity size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                        Belum Ada Data Asesmen DPA
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Atlet ini belum memiliki data evaluasi postur dinamis. Mulai input temuan gerakan sekarang.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('input')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Input Evaluasi Pertama</span>
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
                            compensations={compensations}
                            galleryPhotos={galleries}
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
