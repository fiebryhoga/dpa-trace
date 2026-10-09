import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import AthleteTrainingCalendar from '@/Components/AthleteTrainingCalendar';
import {
    Dumbbell,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Clock,
    Flame,
    Zap,
    Layers,
    Target,
    Activity,
    CheckCircle2,
    Play,
    FileDown,
    X,
    ExternalLink,
    MapPin,
    User as UserIcon,
    ChevronLeft,
    Eye,
    Printer,
    Loader2,
} from 'lucide-react';
import { TrainingProgram, PageProps, TrainingProgramItem } from '@/types';
import { generateTrainingProgramPdf } from './Partials/TrainingProgramPrintSheet';

interface TrainingProgramShowProps extends PageProps {
    program: TrainingProgram;
}

export default function TrainingProgramShow({ auth, program }: TrainingProgramShowProps) {
    const athlete = program.athlete;
    const [activeTab, setActiveTab] = useState<'routine' | 'calendar'>('routine');
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);


    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus program "${program.name}"?`)) {
            router.delete(route('training-programs.destroy', program.slug));
        }
    };

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            const blob = await generateTrainingProgramPdf(program, getImageUrl);

            const athleteName = athlete ? athlete.full_name : 'Atlet';
            const programTitle = program.name || 'Program-Latihan';
            const cleanFileName = `${programTitle.replace(/[\/\?<>\\:\*\|":]/g, '')} - ${athleteName}.pdf`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = cleanFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedVideoUrl(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getImageUrl = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }
        return `/storage/${path}`;
    };

    const getEmbedVideoUrl = (url: string | null) => {
        if (!url) return null;
        const trimmed = url.trim();

        if (trimmed.includes('youtube.com/embed/')) {
            return trimmed;
        }

        const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch && shortMatch[1]) {
            return `https://www.youtube.com/embed/${shortMatch[1]}`;
        }

        const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/) || trimmed.match(/youtube\.com\/(?:v|shorts)\/([a-zA-Z0-9_-]+)/);
        if (longMatch && longMatch[1]) {
            return `https://www.youtube.com/embed/${longMatch[1]}`;
        }

        return null;
    };

    // 4 Phase grouping
    const phases = [
        {
            key: 'inhibit',
            title: '1. Inhibit (SMR / Myofascial Release)',
            colorBar: 'bg-amber-500',
            items: (program.items || []).filter((i) => i.phase === 'inhibit'),
        },
        {
            key: 'lengthen',
            title: '2. Lengthen (Stretching / Peregangan)',
            colorBar: 'bg-sky-500',
            items: (program.items || []).filter((i) => i.phase === 'lengthen'),
        },
        {
            key: 'activate',
            title: '3. Activate (Penguatan Terisolasi)',
            colorBar: 'bg-emerald-500',
            items: (program.items || []).filter((i) => i.phase === 'activate'),
        },
        {
            key: 'integrate',
            title: '4. Integrate (Integrasi Gerak Fungsional)',
            colorBar: 'bg-purple-500',
            items: (program.items || []).filter((i) => i.phase === 'integrate'),
        },
    ];

    const formattedDate = program.start_date
        ? program.start_date.substring(0, 10)
        : new Date().toISOString().substring(0, 10);

    const isCompleted = program.status === 'completed';

    return (
        <AuthenticatedLayout>
            <Head title={`${program.name} - Sesi Latihan Atlet`} />

            {/* Print Media Styling */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 8mm 10mm;
                    }
                    *, *:before, *:after {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    html, body, #app, main {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                    }
                    nav, header, footer, aside, .screen-only, .no-print {
                        display: none !important;
                    }
                    .print-sheet-wrapper {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>





            {/* Screen UI View */}
            <div className="screen-only space-y-5 pb-16 no-print">
                {/* Back to Calendar Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href={athlete ? route('dpa.athletes.show', athlete.id) : route('training-programs.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#65a30d] dark:hover:text-[#b4f031] transition-colors"
                    >
                        <ChevronLeft size={15} />
                        <span>Kembali ke Kalender Latihan</span>
                    </Link>

                    {/* View Switcher Tabs (Routine vs Calendar View) */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('routine')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'routine'
                                    ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Detail Sesi &amp; Latihan
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('calendar')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'calendar'
                                    ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Kalender Atlet
                        </button>
                    </div>
                </div>

                {/* Top Title & Header Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {program.name}
                            </h1>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/20">
                                {isCompleted ? 'Selesai' : 'Terjadwal'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Sesi 1 • {formattedDate}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Unduh Lembar Latihan (PDF)"
                        >
                            {isDownloadingPdf ? (
                                <Loader2 size={14} className="text-[#84cc16] animate-spin" />
                            ) : (
                                <FileDown size={14} className="text-slate-400" />
                            )}
                            <span>{isDownloadingPdf ? 'Mengunduh PDF...' : 'Download PDF'}</span>
                        </button>

                        <Link
                            href={route('training-programs.edit', program.slug)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 rounded-md text-xs font-bold shadow-xs transition-colors"
                        >
                            <Edit size={14} />
                            <span>Edit Sesi</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                            title="Hapus Sesi"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>

                {/* Body Area */}
                {activeTab === 'calendar' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-2xs">
                        <AthleteTrainingCalendar program={program} interactive={true} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* LEFT SIDEBAR: Session Information (Matched 1:1 with Form structure) */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 space-y-4 shadow-2xs">
                                {/* Header with Icon & Total Gerakan Badge */}
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                        <Target size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                        <span className="uppercase tracking-wider text-[11px]">Informasi Sesi Latihan</span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/20">
                                        {(program.items || []).length} Gerakan
                                    </span>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    {/* Nama Sesi / Program */}
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                            Nama Sesi / Program
                                        </span>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                                                {program.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Member Atlet */}
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                            Member Atlet
                                        </span>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {athlete?.photo_url ? (
                                                    <img
                                                        src={athlete.photo_url}
                                                        alt={athlete.full_name}
                                                        className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] font-bold text-xs flex items-center justify-center shrink-0">
                                                        {athlete?.full_name ? athlete.full_name.charAt(0).toUpperCase() : 'A'}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {athlete?.full_name || 'Member Atlet'}
                                                    </h4>
                                                    {athlete?.athlete_code && (
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            ID: {athlete.athlete_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/20 shrink-0">
                                                Atlet Terpilih
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tanggal Latihan */}
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                            Tanggal Latihan
                                        </span>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between">
                                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                                                {formattedDate}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">1 Tanggal Sesi</span>
                                        </div>
                                    </div>

                                    {/* Status Sesi */}
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                            Status Sesi
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div
                                                className={`py-1.5 px-2.5 rounded-md text-xs font-bold text-center border ${
                                                    !isCompleted
                                                        ? 'bg-[#84cc16]/15 border-[#84cc16] text-[#65a30d] dark:text-[#b4f031]'
                                                        : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                                                }`}
                                            >
                                                Terjadwal
                                            </div>
                                            <div
                                                className={`py-1.5 px-2.5 rounded-md text-xs font-bold text-center border ${
                                                    isCompleted
                                                        ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400'
                                                        : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                                                }`}
                                            >
                                                Selesai
                                            </div>
                                        </div>
                                    </div>

                                    {/* Target Kompensasi DPA (Clean List) */}
                                    {program.target_compensations && program.target_compensations.length > 0 && (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                                Target Kompensasi DPA:
                                            </span>
                                            <ul className="space-y-1.5 pl-1">
                                                {program.target_compensations.map((comp, idx) => (
                                                    <li key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031] shrink-0" />
                                                        <span>{comp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Catatan Sesi / Pelatih (if exists) */}
                                    {program.description && (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Catatan Pelatih
                                            </span>
                                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-md border border-slate-200 dark:border-slate-800">
                                                {program.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT MAIN COLUMN: Skema & Program Latihan */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Top Banner Box */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Skema &amp; Program Latihan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        4 fase latihan tersusun sesuai kaidah NASM
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                    {program.items?.length || 0} Total Gerakan
                                </span>
                            </div>

                            {/* Phases List */}
                            <div className="space-y-4">
                                {phases.map((phase) => (
                                    <div
                                        key={phase.key}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 space-y-3.5 shadow-2xs"
                                    >
                                        {/* Phase Header */}
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-3.5 rounded-xs ${phase.colorBar}`} />
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {phase.title}
                                                </h4>
                                            </div>
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {phase.items.length} gerakan
                                            </span>
                                        </div>

                                        {/* Exercise Cards */}
                                        {phase.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {phase.items.map((item, idx) => {
                                                    const exerciseImage = getImageUrl(item.exercise?.image_path);
                                                    const videoUrl = item.exercise?.video_url;

                                                    return (
                                                        <div
                                                            key={item.id || idx}
                                                            className="border border-slate-200 dark:border-slate-800 rounded-md p-3.5 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
                                                        >
                                                            {/* Exercise Name & Muscle Header */}
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                                    {item.exercise_name}
                                                                </h5>
                                                                {item.target_muscle && (
                                                                    <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                                                        {item.target_muscle}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Parameters & Media Previews */}
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                {/* Parameter Pills Row */}
                                                                <div className="space-y-2 flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        {/* SET */}
                                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                SET
                                                                            </span>
                                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                                {item.sets ? item.sets : '-'}
                                                                            </span>
                                                                        </div>

                                                                        <span className="text-slate-300 dark:text-slate-700 font-light select-none">
                                                                            |
                                                                        </span>

                                                                        {/* REPS */}
                                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                REPS
                                                                            </span>
                                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                                {item.reps || (item.duration_seconds ? `${item.duration_seconds}s` : '-')}
                                                                            </span>
                                                                            {item.reps && (
                                                                                <span className="text-[10px] text-slate-400 font-medium">
                                                                                    r
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <span className="text-slate-300 dark:text-slate-700 font-light select-none">
                                                                            |
                                                                        </span>

                                                                        {/* REST */}
                                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xs">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                REST
                                                                            </span>
                                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                                {item.rest_seconds ? `${String(item.rest_seconds).replace(/s$/, '')}s` : '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Side cue / Coaching Notes */}
                                                                    {item.coaching_cues && (
                                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-start gap-1.5">
                                                                            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                                                                                Catatan:
                                                                            </span>
                                                                            <span className="italic">{item.coaching_cues}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Media Previews (Thumbnail & Video) */}
                                                                {(exerciseImage || videoUrl) && (
                                                                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                                                        {exerciseImage && (
                                                                            <div className="w-24 h-16 sm:w-28 sm:h-18 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                                                                                <img
                                                                                    src={exerciseImage}
                                                                                    alt={item.exercise_name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        )}

                                                                        {videoUrl && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedVideoUrl(videoUrl);
                                                                                    setSelectedVideoTitle(item.exercise_name);
                                                                                }}
                                                                                className="w-24 h-16 sm:w-28 sm:h-18 bg-white dark:bg-slate-950 rounded-md shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] transition-all group relative cursor-pointer shadow-2xs"
                                                                                title="Putar Video Latihan"
                                                                            >
                                                                                <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 group-hover:border-[#84cc16] group-hover:bg-[#84cc16] group-hover:scale-105 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:text-slate-950 transition-all">
                                                                                    <Play size={11} className="ml-0.5 fill-current" />
                                                                                </div>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-3 px-4 text-center text-xs text-slate-400">
                                                Tidak ada gerakan yang dijadwalkan pada fase ini.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Video Modal Preview */}
            {selectedVideoUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
                    onClick={() => setSelectedVideoUrl(null)}
                >
                    <div
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-2xl space-y-3 p-4 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                <Play size={13} className="text-[#84cc16] dark:text-[#b4f031] fill-current shrink-0" />
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {selectedVideoTitle || 'Video Panduan Gerakan'}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedVideoUrl(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md cursor-pointer transition-colors shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="aspect-video w-full rounded-md overflow-hidden bg-black flex items-center justify-center shadow-inner">
                            {getEmbedVideoUrl(selectedVideoUrl) ? (
                                <iframe
                                    src={getEmbedVideoUrl(selectedVideoUrl)!}
                                    title={selectedVideoTitle || 'Video Panduan'}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={selectedVideoUrl.startsWith('http') || selectedVideoUrl.startsWith('/') ? selectedVideoUrl : `/storage/${selectedVideoUrl}`}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
