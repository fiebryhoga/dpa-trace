import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Dumbbell,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Sparkles,
    Activity,
    Layers,
    Clock,
    Flame,
    Zap,
    Target,
    BookOpen,
    Info,
    HelpCircle,
    ChevronDown,
    Search,
    Check,
    Play,
    X,
    GripVertical,
} from 'lucide-react';
import { TrainingProgram, Athlete, Exercise, PageProps } from '@/types';

interface TrainingProgramFormData {
    name: string;
    athlete_id: string | number;
    dpa_assessment_id?: string | number | null;
    status: 'draft' | 'active' | 'completed';
    start_date: string;
    end_date: string;
    frequency_per_week: number;
    duration_weeks: number;
    scheduled_days: string[];
    schedule_dates: string[];
    completed_dates: string[];
    session_notes: Record<string, string>;
    description: string;
    target_compensations: string[];
    target_muscles_overactive: string[];
    target_muscles_underactive: string[];
    items: any[];
}

interface TrainingProgramFormProps extends PageProps {
    program?: TrainingProgram | null;
    initialData: Partial<TrainingProgramFormData> & {
        id?: number;
    };
    athletes: Athlete[];
    exercises: Exercise[];
    isEdit: boolean;
}

interface SearchableExerciseSelectProps {
    valueId: number | null | undefined;
    valueName: string;
    exercises: Exercise[];
    onChange: (exercise: Exercise) => void;
    getImageUrl: (path?: string) => string | null;
}

function SearchableExerciseSelect({
    valueId,
    valueName,
    exercises,
    onChange,
    getImageUrl,
}: SearchableExerciseSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedExercise =
        exercises.find((ex) => ex.id === valueId) ||
        exercises.find((ex) => ex.name.toLowerCase() === (valueName || '').toLowerCase());

    const filtered = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1 min-w-[180px] max-w-sm" ref={containerRef}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearch('');
                }}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-left hover:border-slate-300 dark:hover:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all cursor-pointer shadow-2xs h-8"
            >
                <span className={`text-xs font-semibold truncate ${selectedExercise || valueName ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {selectedExercise ? selectedExercise.name : valueName || 'Pilih gerakan...'}
                </span>
                <ChevronDown size={12} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 w-full min-w-[260px] sm:min-w-[320px] mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg overflow-hidden">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        <Search size={12} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama gerakan..."
                            className="w-full bg-transparent border-0 p-0 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-0"
                            autoFocus
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                        {filtered.length > 0 ? (
                            filtered.map((ex) => {
                                const isSelected = selectedExercise?.id === ex.id;
                                const img = getImageUrl(ex.image_path);
                                return (
                                    <button
                                        key={ex.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(ex);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {img ? (
                                                <img src={img} alt="" className="w-5 h-4 object-cover rounded shrink-0 border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-5 h-4 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Dumbbell size={8} className="text-slate-400" />
                                                </div>
                                            )}
                                            <span className="truncate text-xs">{ex.name}</span>
                                        </div>
                                        {isSelected && <Check size={12} className="shrink-0 text-[#65a30d] dark:text-[#b4f031]" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-2.5 text-center text-[11px] text-slate-400">
                                Tidak ada gerakan ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrainingProgramForm({
    auth,
    program,
    initialData,
    athletes = [],
    exercises = [],
    isEdit = false,
}: TrainingProgramFormProps) {
    const { data, setData, post, put, processing, errors, transform } = useForm<TrainingProgramFormData>({
        name: initialData.name || '',
        athlete_id: initialData.athlete_id || '',
        dpa_assessment_id: initialData.dpa_assessment_id || null,
        status: (initialData.status as any) || 'active',
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData.end_date || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency_per_week: initialData.frequency_per_week || 3,
        duration_weeks: initialData.duration_weeks || 4,
        scheduled_days: initialData.scheduled_days || ['mon', 'wed', 'fri'],
        schedule_dates: initialData.schedule_dates || [],
        completed_dates: initialData.completed_dates || [],
        session_notes: initialData.session_notes || {},
        description: initialData.description || '',
        target_compensations: initialData.target_compensations || [],
        target_muscles_overactive: initialData.target_muscles_overactive || [],
        target_muscles_underactive: initialData.target_muscles_underactive || [],
        items: initialData.items || [],
    });

    const [activePhaseTab, setActivePhaseTab] = useState<'all' | 'inhibit' | 'lengthen' | 'activate' | 'integrate'>('all');
    const [exerciseLibraryModalOpen, setExerciseLibraryModalOpen] = useState(false);
    const [selectingPhaseForLibrary, setSelectingPhaseForLibrary] = useState<'inhibit' | 'lengthen' | 'activate' | 'integrate'>('inhibit');
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');

    const handleQuickDate = (offsetDays: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        setData('start_date', d.toISOString().split('T')[0]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedVideoUrl(null);
                setExerciseLibraryModalOpen(false);
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

        // youtu.be/VIDEO_ID
        const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch && shortMatch[1]) {
            return `https://www.youtube.com/embed/${shortMatch[1]}`;
        }

        // youtube.com/watch?v=VIDEO_ID or youtube.com/shorts/VIDEO_ID or /v/VIDEO_ID
        const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/) || trimmed.match(/youtube\.com\/(?:v|shorts)\/([a-zA-Z0-9_-]+)/);
        if (longMatch && longMatch[1]) {
            return `https://www.youtube.com/embed/${longMatch[1]}`;
        }

        return null;
    };

    const selectedAthlete = athletes.find((a) => a.id === Number(data.athlete_id));

    const handleAddItem = (phase: 'inhibit' | 'lengthen' | 'activate' | 'integrate', defaultName = '', exerciseId: number | null = null) => {
        const newItem = {
            id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            phase: phase,
            exercise_id: exerciseId,
            exercise_name: defaultName || '',
            target_muscle: '',
            sets: '',
            reps: '',
            duration_seconds: null,
            hold_seconds: null,
            tempo: '',
            rest_seconds: '',
            frequency: '',
            intensity: '',
            coaching_cues: '',
            sort_order: data.items.length,
        };

        setData('items', [...data.items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const next = [...data.items];
        next.splice(index, 1);
        setData('items', next);
    };

    const handleUpdateItem = (index: number, fieldOrUpdates: string | Record<string, any>, value?: any) => {
        setData((prev) => {
            const next = [...prev.items];
            if (typeof fieldOrUpdates === 'string') {
                next[index] = { ...next[index], [fieldOrUpdates]: value };
            } else {
                next[index] = { ...next[index], ...fieldOrUpdates };
            }
            return { ...prev, items: next };
        });
    };

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
            setDraggedItemIndex(null);
            setDragOverIndex(null);
            return;
        }

        const items = [...data.items];
        const [movedItem] = items.splice(draggedItemIndex, 1);

        const targetItem = data.items[targetIndex];
        if (targetItem && movedItem.phase !== targetItem.phase) {
            movedItem.phase = targetItem.phase;
        }

        items.splice(targetIndex, 0, movedItem);

        const updatedItems = items.map((item, idx) => ({
            ...item,
            sort_order: idx + 1,
        }));

        setData('items', updatedItems);
        setDraggedItemIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        setDragOverIndex(null);
    };

    const handleSelectFromLibrary = (ex: Exercise) => {
        handleAddItem(selectingPhaseForLibrary, ex.name, ex.id);
        setExerciseLibraryModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            alert('Mohon tambahkan minimal 1 gerakan latihan ke dalam program.');
            return;
        }

        // Validate that every item has sets and reps filled
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            if (!item.sets || Number(item.sets) < 1) {
                alert(`Gerakan "${item.exercise_name || 'Latihan'}" wajib mengisi kolom SET.`);
                return;
            }
            if (!item.reps || String(item.reps).trim() === '') {
                alert(`Gerakan "${item.exercise_name || 'Latihan'}" wajib mengisi kolom REPS.`);
                return;
            }
        }

        transform((currentData) => ({
            ...currentData,
            items: currentData.items.map((item, idx) => ({
                ...item,
                sets: Number(item.sets),
                reps: String(item.reps).trim(),
                rest_seconds: item.rest_seconds !== '' && item.rest_seconds !== null && item.rest_seconds !== undefined ? Number(item.rest_seconds) : null,
                sort_order: idx + 1,
            })),
        }));

        if (isEdit && program) {
            put(route('training-programs.update', program.slug));
        } else {
            post(route('training-programs.store'));
        }
    };

    const phases = [
        { key: 'inhibit', title: '1. Inhibit (SMR / Myofascial Release)', colorBar: 'bg-amber-500' },
        { key: 'lengthen', title: '2. Lengthen (Stretching / Peregangan)', colorBar: 'bg-sky-500' },
        { key: 'activate', title: '3. Activate (Penguatan Terisolasi)', colorBar: 'bg-emerald-500' },
        { key: 'integrate', title: '4. Integrate (Integrasi Gerak Fungsional)', colorBar: 'bg-purple-500' },
    ] as const;

    const filteredExercises = exercises.filter(
        (e) =>
            e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
            (e.instructions && e.instructions.toLowerCase().includes(exerciseSearch.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Program Latihan - ${data.name}` : 'Buat Program Latihan Korektif'} />

            <form onSubmit={handleSubmit} className="space-y-6 pb-16">
                {/* Header */}
                <PageHeader
                    backUrl={isEdit && program ? route('training-programs.show', program.slug) : route('training-programs.index')}
                    backLabel="Kembali"
                    title={isEdit ? `Edit Program: ${program?.name}` : 'Buat Program Latihan Korektif'}
                    description="Susun parameter peresepan latihan korektif (Set, Reps, Rest, Gambar, dan Video) berbasis 4 Fase NASM"
                    icon={
                        <div className="w-10 h-10 rounded-md bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#65a30d] dark:text-[#b4f031] flex items-center justify-center border border-[#84cc16]/30 shrink-0">
                            <Dumbbell size={20} />
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href={isEdit && program ? route('training-programs.show', program.slug) : route('training-programs.index')}
                                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 font-bold rounded-md text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Save size={14} className="stroke-[2.5]" />
                                <span>{processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Program Latihan'}</span>
                            </button>
                        </div>
                    }
                />

                {/* 2-Column Side-by-Side Layout: Kiri (Informasi Sesi - Compact) & Kanan (Rincian Latihan 4 Fase) */}
                <div className="flex flex-col lg:flex-row gap-5 items-start">
                    {/* LEFT COLUMN: Section 1 - General Info & Target Card (Compact Sticky Sidebar) */}
                    <div className="w-full lg:w-[290px] xl:w-[310px] shrink-0 space-y-4 lg:sticky lg:top-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3.5 sm:p-4 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Target size={16} className="text-[#65a30d] dark:text-[#b4f031]" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                        Informasi Sesi Latihan
                                    </h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/20">
                                    {data.items.length} Gerakan
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* Program Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Sesi / Program <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Korektif Postur Sesi 1"
                                        className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                                        required
                                    />
                                    {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                {/* Athlete Info (Read-only jika atlet sudah terpilih) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Member Atlet
                                    </label>
                                    {selectedAthlete ? (
                                        <div className="py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between shadow-2xs">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {selectedAthlete.athlete_code ? `${selectedAthlete.athlete_code} - ` : ''}{selectedAthlete.full_name}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031]">
                                                Atlet Terpilih
                                            </span>
                                        </div>
                                    ) : (
                                        <select
                                            value={data.athlete_id}
                                            onChange={(e) => setData('athlete_id', e.target.value)}
                                            className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                                            required
                                        >
                                            <option value="">-- Pilih Atlet --</option>
                                            {athletes.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.athlete_code ? `${a.athlete_code} - ` : ''}{a.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.athlete_id && <p className="text-[11px] text-red-500 mt-1">{errors.athlete_id}</p>}
                                </div>

                                {/* Single Training Date Picker with Quick Date Chips */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Tanggal Latihan <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-slate-400 font-medium">1 Tanggal Sesi</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => {
                                            setData('start_date', e.target.value);
                                            setData('end_date', e.target.value);
                                        }}
                                        className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                                        required
                                    />

                                    {/* Quick Date Presets */}
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickDate(0)}
                                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#84cc16]/20 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            Hari Ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickDate(1)}
                                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#84cc16]/20 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            Besok
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickDate(2)}
                                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#84cc16]/20 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            Lusa (+2)
                                        </button>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Status Sesi
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('status', 'active')}
                                            className={`py-1 px-2.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                                                data.status === 'active'
                                                    ? 'bg-[#84cc16]/15 border-[#84cc16] text-[#65a30d] dark:text-[#b4f031]'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            Terjadwal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('status', 'completed')}
                                            className={`py-1 px-2.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                                                data.status === 'completed'
                                                    ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            Selesai
                                        </button>
                                    </div>
                                </div>

                                {/* Target Kompensasi DPA (Clean Bulleted List - Tanpa Background Badge) */}
                                {data.target_compensations && data.target_compensations.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                            Target Kompensasi DPA:
                                        </span>
                                        <ul className="space-y-1 pl-1">
                                            {data.target_compensations.map((comp, idx) => (
                                                <li key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031] shrink-0" />
                                                    <span className="truncate">{comp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Section 2 - Exercise Items (4 Phases) */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Phase Filter Tabs */}
                        <div className="space-y-2">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-1.5 flex items-center gap-1 overflow-x-auto shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setActivePhaseTab('all')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        activePhaseTab === 'all'
                                            ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Semua Fase ({data.items.length})
                                </button>
                                {phases.map((p) => {
                                    const count = data.items.filter((i) => i.phase === p.key).length;
                                    return (
                                        <button
                                            key={p.key}
                                            type="button"
                                            onClick={() => setActivePhaseTab(p.key)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                                activePhaseTab === p.key
                                                    ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {p.title.split(' ')[1]} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
                                Keterangan: Kolom <span className="font-semibold text-slate-700 dark:text-slate-300">SET</span> dan <span className="font-semibold text-slate-700 dark:text-slate-300">REPS</span> <span className="text-red-500 font-bold">*wajib diisi</span> pada setiap gerakan. Kolom <span className="font-semibold text-slate-700 dark:text-slate-300">REST</span> opsional.
                            </p>
                        </div>

                        {/* Phase Cards */}
                        {phases.map((phaseInfo) => {
                            if (activePhaseTab !== 'all' && activePhaseTab !== phaseInfo.key) {
                                return null;
                            }

                            const phaseItems = data.items
                                .map((item, originalIndex) => ({ item, originalIndex }))
                                .filter(({ item }) => item.phase === phaseInfo.key);

                            return (
                                <div
                                    key={phaseInfo.key}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 space-y-4 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-3.5 rounded-xs ${phaseInfo.colorBar}`} />
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {phaseInfo.title}
                                            </h4>
                                            <span className="text-[11px] text-slate-400 font-normal">
                                                ({phaseItems.length} gerakan)
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectingPhaseForLibrary(phaseInfo.key);
                                                    setExerciseLibraryModalOpen(true);
                                                    setExerciseSearch('');
                                                }}
                                                className="px-2.5 py-1 rounded-md bg-[#84cc16]/15 hover:bg-[#84cc16]/25 dark:bg-[#b4f031]/15 dark:hover:bg-[#b4f031]/25 text-[#65a30d] dark:text-[#b4f031] text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                                <BookOpen size={12} />
                                                <span>Pilih dari Master Library</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items List in Phase */}
                                    {phaseItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {phaseItems.map(({ item, originalIndex }) => {
                                                const currentExercise =
                                                    exercises.find((ex) => ex.id === item.exercise_id) ||
                                                    exercises.find((ex) => ex.name.toLowerCase() === (item.exercise_name || '').toLowerCase());

                                                const isDragging = draggedItemIndex === originalIndex;
                                                const isDragOver = dragOverIndex === originalIndex;

                                                return (
                                                    <div
                                                        key={item.id || originalIndex}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, originalIndex)}
                                                        onDragOver={(e) => handleDragOver(e, originalIndex)}
                                                        onDrop={(e) => handleDrop(e, originalIndex)}
                                                        onDragEnd={handleDragEnd}
                                                        className={`bg-slate-50/60 dark:bg-slate-950/50 border rounded-md p-3 sm:p-3.5 transition-all space-y-3 ${
                                                            isDragging
                                                                ? 'opacity-30 border-dashed border-[#84cc16] scale-[0.99]'
                                                                : isDragOver
                                                                ? 'border-[#84cc16] bg-[#84cc16]/5 ring-1 ring-[#84cc16]'
                                                                : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                                                        }`}
                                                    >
                                                        {/* Top Row: Drag Handle + Exercise Selector + Delete Button */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <div
                                                                    className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 -ml-1 transition-colors shrink-0"
                                                                    title="Tahan & geser untuk mengubah urutan gerakan"
                                                                >
                                                                    <GripVertical size={15} />
                                                                </div>

                                                                <SearchableExerciseSelect
                                                                    valueId={item.exercise_id}
                                                                    valueName={item.exercise_name}
                                                                    exercises={exercises}
                                                                    onChange={(selectedEx) => {
                                                                        handleUpdateItem(originalIndex, {
                                                                            exercise_id: selectedEx.id,
                                                                            exercise_name: selectedEx.name,
                                                                        });
                                                                    }}
                                                                    getImageUrl={getImageUrl}
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(originalIndex)}
                                                                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                                                                title="Hapus Gerakan"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>

                                                        {/* Bottom Row: Parameters (Sets, Reps, Rest) + Photo & Video Previews */}
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                            {/* Parameters Box (Sets, Reps, Rest) */}
                                                            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2 sm:p-2.5 flex flex-wrap items-center gap-2 sm:gap-3 shadow-2xs">
                                                                {/* Sets */}
                                                                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                                        SET <span className="text-red-500 font-bold">*</span>
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        max={20}
                                                                        value={item.sets === 0 || item.sets === '' || item.sets === undefined || item.sets === null ? '' : item.sets}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value;
                                                                            handleUpdateItem(originalIndex, 'sets', raw === '' ? '' : Number(raw));
                                                                        }}
                                                                        placeholder="-"
                                                                        className="w-7 text-center p-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white border-0 focus:outline-hidden focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    />
                                                                </div>

                                                                <span className="text-slate-200 dark:text-slate-800 hidden sm:inline">|</span>

                                                                {/* Reps */}
                                                                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                                        REPS <span className="text-red-500 font-bold">*</span>
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.reps || ''}
                                                                        onChange={(e) => handleUpdateItem(originalIndex, 'reps', e.target.value)}
                                                                        placeholder="-"
                                                                        className="w-16 text-center p-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white border-0 focus:outline-hidden focus:ring-0"
                                                                    />
                                                                    <span className="text-[10px] text-slate-400 font-medium">r</span>
                                                                </div>

                                                                <span className="text-slate-200 dark:text-slate-800 hidden sm:inline">|</span>

                                                                {/* Rest */}
                                                                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">REST</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.rest_seconds === '' || item.rest_seconds === null || item.rest_seconds === undefined ? '' : String(item.rest_seconds).replace(/s$/, '')}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value.replace(/\D/g, '');
                                                                            handleUpdateItem(originalIndex, 'rest_seconds', raw);
                                                                        }}
                                                                        placeholder="-"
                                                                        className="w-10 text-center p-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white border-0 focus:outline-hidden focus:ring-0"
                                                                    />
                                                                    <span className="text-[10px] text-slate-400 font-medium">s</span>
                                                                </div>
                                                            </div>

                                                            {/* Media thumbnail photo (Only if exists) */}
                                                            {currentExercise?.image_path && (
                                                                <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-2xs">
                                                                    <img
                                                                        src={getImageUrl(currentExercise.image_path) || ''}
                                                                        alt={currentExercise.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Video Player Box (Only if exists) */}
                                                            {currentExercise?.video_url && (
                                                                <div
                                                                    onClick={() => {
                                                                        setSelectedVideoUrl(currentExercise.video_url || null);
                                                                        setSelectedVideoTitle(currentExercise.name);
                                                                    }}
                                                                    className="w-24 h-16 sm:w-28 sm:h-18 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-[#84cc16] dark:hover:border-[#b4f031] transition-all relative group shadow-2xs"
                                                                    title="Putar Video Panduan"
                                                                >
                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 transition-all group-hover:scale-110 group-hover:bg-[#84cc16] group-hover:text-slate-950 group-hover:border-[#84cc16]">
                                                                        <Play size={11} className="fill-current ml-0.5" />
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white mt-1">
                                                                        Video
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md space-y-1 bg-slate-50/40 dark:bg-slate-950/40">
                                            <p className="text-xs text-slate-400">Belum ada latihan pada fase ini.</p>
                                            <div className="flex items-center justify-center pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectingPhaseForLibrary(phaseInfo.key);
                                                        setExerciseLibraryModalOpen(true);
                                                        setExerciseSearch('');
                                                    }}
                                                    className="text-xs font-semibold text-[#65a30d] dark:text-[#b4f031] hover:underline cursor-pointer"
                                                >
                                                    + Pilih dari Master Library
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </form>

            {/* Exercise Library Modal Selector */}
            {exerciseLibraryModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 cursor-pointer"
                    onClick={() => setExerciseLibraryModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-lg w-full p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-[#65a30d] dark:text-[#b4f031]" />
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                                    Pilih Latihan dari Master Library
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setExerciseLibraryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={exerciseSearch}
                                onChange={(e) => setExerciseSearch(e.target.value)}
                                placeholder="Cari nama latihan di library..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                                autoFocus
                            />
                        </div>

                        {/* Exercise Items List */}
                        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map((ex) => (
                                    <div
                                        key={ex.id}
                                        onClick={() => handleSelectFromLibrary(ex)}
                                        className="p-2.5 rounded-md border border-slate-100 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] bg-slate-50/60 dark:bg-slate-950/60 hover:bg-[#84cc16]/5 dark:hover:bg-[#b4f031]/5 cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {ex.image_path ? (
                                                <img
                                                    src={getImageUrl(ex.image_path) || ''}
                                                    alt=""
                                                    className="w-9 h-6 object-cover rounded-md shrink-0 border border-slate-200 dark:border-slate-700"
                                                />
                                            ) : (
                                                <div className="w-9 h-6 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Dumbbell size={12} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#65a30d] dark:group-hover:text-[#b4f031] truncate">
                                                    {ex.name}
                                                </div>
                                                {ex.instructions && (
                                                    <div className="text-[11px] text-slate-400 line-clamp-1">
                                                        {ex.instructions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                            Pilih +
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-400">
                                    Tidak ditemukan latihan yang cocok.
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setExerciseLibraryModalOpen(false)}
                                className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Preview Modal */}
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
