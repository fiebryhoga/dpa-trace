import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Save,
    Upload,
    Image as ImageIcon,
    Flame,
    Dumbbell,
    ShieldAlert,
    Zap,
    X,
    Layers,
    Activity,
    Plus,
    ExternalLink,
    Search,
    ChevronDown,
    Trash2,
    Check,
    RotateCcw,
    BookOpen,
} from 'lucide-react';
import { DpaCompensation, Exercise, Muscle, Injury, PageProps } from '@/types';
import BodyMuscleVisualizer from '@/Components/BodyMuscleVisualizer';

interface CompensationFormProps extends PageProps {
    compensation?: DpaCompensation | null;
    allExercises?: Exercise[];
    allMuscles?: Muscle[];
    allInjuries?: Injury[];
    isEdit?: boolean;
}

// ─── SEARCHABLE EXERCISE DROPDOWN ───
interface SearchableDropdownProps {
    availableExercises: Exercise[];
    onSelect: (exerciseId: number) => void;
}

function SearchableExerciseDropdown({
    availableExercises,
    onSelect,
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
            setSearchQuery('');
        }
    }, [isOpen]);

    const filtered = availableExercises.filter((ex) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            ex.name?.toLowerCase().includes(q) ||
            ex.instructions?.toLowerCase().includes(q)
        );
    });

    return (
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all cursor-pointer truncate ${
                    isOpen
                        ? 'border-[#84cc16] dark:border-[#b4f031] ring-1 ring-[#84cc16]/30 dark:ring-[#b4f031]/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
                <span className="truncate flex items-center gap-1.5">
                    <Plus size={11} className="text-[#84cc16] dark:text-[#b4f031] shrink-0" />
                    <span className="truncate">Hubungkan latihan...</span>
                </span>
                <ChevronDown
                    size={11}
                    className={`text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[240px]">
                    <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 sticky top-0 z-10">
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama latihan..."
                                className="w-full pl-7 pr-6 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X size={11} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                        {filtered.length === 0 ? (
                            <div className="py-3 px-2 text-center text-[11px] text-slate-400">
                                {searchQuery ? 'Latihan tidak ditemukan' : 'Semua latihan telah terhubung'}
                            </div>
                        ) : (
                            filtered.map((ex) => (
                                <button
                                    key={ex.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(ex.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between p-1.5 rounded text-left text-xs hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10 transition-colors group cursor-pointer"
                                >
                                    <div className="min-w-0 flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                                            <Dumbbell size={10} className="text-slate-500 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031]" />
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-950 dark:group-hover:text-white text-[11.5px]">
                                            {ex.name}
                                        </span>
                                    </div>
                                    <Plus size={11} className="text-slate-400 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] shrink-0" />
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                            {availableExercises.length} tersedia
                        </span>
                        <Link
                            href={route('exercises.create')}
                            target="_blank"
                            className="font-bold text-[#84cc16] dark:text-[#b4f031] hover:underline flex items-center gap-1"
                        >
                            <Plus size={10} />
                            <span>Buat Baru</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MASTER SEARCHABLE CATALOG TAG INPUT ───
interface TagInputProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    icon: React.ReactNode;
    colorVariant: 'rose' | 'emerald' | 'amber';
    masterItems?: Array<{ id: number; name: string; slug?: string; description?: string }>;
    manageUrl?: string;
    manageLabel?: string;
}

function TagInput({
    value,
    onChange,
    label,
    placeholder = 'Ketik atau pilih dari katalog...',
    icon,
    colorVariant,
    masterItems = [],
    manageUrl,
    manageLabel = 'Master Data',
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const tags = value
        ? value
              .split(/\r?\n/)
              .map((t) => t.trim())
              .filter(Boolean)
        : [];

    const updateTags = (newTags: string[]) => {
        onChange(newTags.join('\n'));
    };

    const addTag = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const itemsToAdd = trimmed
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !tags.includes(s));

        if (itemsToAdd.length > 0) {
            updateTags([...tags, ...itemsToAdd]);
        }
        setInputValue('');
    };

    const removeTag = (indexToRemove: number) => {
        updateTags(tags.filter((_, idx) => idx !== indexToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        const newItems = pasteData
            .split(/[\r\n,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !tags.includes(s));
        if (newItems.length > 0) {
            updateTags([...tags, ...newItems]);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const colorStyles = {
        rose: {
            container: 'border-slate-200 dark:border-slate-700 focus-within:border-rose-500/80 focus-within:ring-1 focus-within:ring-rose-500/20',
            tag: 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60',
            tagRemove: 'text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-500/20',
            pill: 'hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800',
            countBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
            btnAccent: 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10',
        },
        emerald: {
            container: 'border-slate-200 dark:border-slate-700 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/20',
            tag: 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60',
            tagRemove: 'text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-500/20',
            pill: 'hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800',
            countBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
            btnAccent: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
        },
        amber: {
            container: 'border-slate-200 dark:border-slate-700 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/20',
            tag: 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60',
            tagRemove: 'text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-500/20',
            pill: 'hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-800',
            countBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
            btnAccent: 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
        },
    }[colorVariant];

    const availableMaster = masterItems.filter((item) => !tags.includes(item.name));
    const filteredMaster = availableMaster.filter((item) => {
        if (!pickerSearch.trim()) return true;
        const q = pickerSearch.toLowerCase();
        return (
            item.name.toLowerCase().includes(q) ||
            item.slug?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-1 relative" ref={pickerRef}>
            <div className="flex items-center justify-between text-[11px]">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    {icon}
                    <span>{label}</span>
                </label>

                <div className="flex items-center gap-2">
                    {manageUrl && (
                        <Link
                            href={manageUrl}
                            target="_blank"
                            className="font-medium text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] transition-colors flex items-center gap-0.5 text-[10px]"
                            title={`Buka ${manageLabel} di tab baru`}
                        >
                            <span>{manageLabel}</span>
                            <ExternalLink size={9} />
                        </Link>
                    )}
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${colorStyles.countBadge}`}>
                        {tags.length} terpetakan
                    </span>
                </div>
            </div>

            {/* Input & Tags Area */}
            <div
                onClick={() => inputRef.current?.focus()}
                className={`min-h-[38px] p-1.5 rounded-md bg-white dark:bg-slate-950 border transition-all flex flex-wrap items-center gap-1 cursor-text ${colorStyles.container}`}
            >
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium border transition-all ${colorStyles.tag}`}
                    >
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(idx);
                            }}
                            className={`rounded-full p-0.5 transition-colors cursor-pointer ${colorStyles.tagRemove}`}
                        >
                            <X size={9} />
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={tags.length === 0 ? placeholder : '+ ketik...'}
                    className="flex-1 min-w-[100px] border-0 bg-transparent p-0.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                />

                {masterItems.length > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPickerOpen(!isPickerOpen);
                        }}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors ml-auto cursor-pointer flex items-center gap-1 ${colorStyles.btnAccent}`}
                    >
                        <BookOpen size={10} />
                        <span>Katalog ({availableMaster.length})</span>
                    </button>
                )}
            </div>

            {/* Popover Catalog Picker */}
            {isPickerOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={pickerSearch}
                                onChange={(e) => setPickerSearch(e.target.value)}
                                placeholder="Cari dalam katalog..."
                                autoFocus
                                className="w-full pl-6 pr-5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPickerOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                            <X size={12} />
                        </button>
                    </div>

                    <div className="max-h-44 overflow-y-auto p-1.5 flex flex-wrap gap-1">
                        {filteredMaster.length === 0 ? (
                            <div className="py-3 px-2 w-full text-center text-[11px] text-slate-400">
                                {pickerSearch ? 'Tidak ada item yang cocok' : 'Semua item master sudah terpilih'}
                            </div>
                        ) : (
                            filteredMaster.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        addTag(item.name);
                                    }}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer ${colorStyles.pill}`}
                                >
                                    <Plus size={10} className="text-slate-400" />
                                    <span>{item.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CompensationForm({
    compensation,
    allExercises = [],
    allMuscles = [],
    allInjuries = [],
    isEdit = false,
}: CompensationFormProps) {
    const initialInhibit = compensation?.exercises?.filter(e => e.pivot?.phase === 'Inhibit').map(e => e.id) || [];
    const initialLengthen = compensation?.exercises?.filter(e => e.pivot?.phase === 'Lengthen').map(e => e.id) || [];
    const initialActivate = compensation?.exercises?.filter(e => e.pivot?.phase === 'Activate').map(e => e.id) || [];
    const initialIntegrate = compensation?.exercises?.filter(e => e.pivot?.phase === 'Integrate').map(e => e.id) || [];

    const { data, setData, post, processing, errors } = useForm<{
        _method?: string;
        category: string;
        name: string;
        checkpoint: string;
        overactive_muscles: string;
        underactive_muscles: string;
        possible_injuries: string;
        exercise_ids_inhibit: number[];
        exercise_ids_lengthen: number[];
        exercise_ids_activate: number[];
        exercise_ids_integrate: number[];
        image: File | null;
        remove_image?: boolean;
    }>({
        _method: isEdit ? 'PUT' : 'POST',
        category: compensation?.category || 'Anterior View',
        name: compensation?.name || '',
        checkpoint: compensation?.checkpoint || '',
        overactive_muscles: compensation?.overactive_muscles || '',
        underactive_muscles: compensation?.underactive_muscles || '',
        possible_injuries: compensation?.possible_injuries || '',
        exercise_ids_inhibit: initialInhibit,
        exercise_ids_lengthen: initialLengthen,
        exercise_ids_activate: initialActivate,
        exercise_ids_integrate: initialIntegrate,
        image: null,
    });

    const [previewImage, setPreviewImage] = useState<string | null>(
        compensation?.image_path
            ? compensation.image_path.startsWith('/')
                ? compensation.image_path
                : `/storage/${compensation.image_path}`
            : null,
    );

    const handleFileChange = (file: File | null) => {
        setData('image', file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
            setData('remove_image', true);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetUrl = isEdit && compensation
            ? route('dpa-compensations.update', compensation.slug || compensation.id)
            : route('dpa-compensations.store');

        post(targetUrl, {
            forceFormData: true,
        });
    };

    const toggleExercise = (
        field: 'exercise_ids_inhibit' | 'exercise_ids_lengthen' | 'exercise_ids_activate' | 'exercise_ids_integrate',
        exerciseId: number
    ) => {
        const current = data[field];
        if (!current.includes(exerciseId)) {
            setData(field, [...current, exerciseId]);
        }
    };

    const removeExercise = (
        field: 'exercise_ids_inhibit' | 'exercise_ids_lengthen' | 'exercise_ids_activate' | 'exercise_ids_integrate',
        exerciseId: number
    ) => {
        setData(field, data[field].filter(id => id !== exerciseId));
    };

    const renderPhaseCard = (
        phaseNum: number,
        title: string,
        subtitle: string,
        theme: {
            borderTop: string;
            badgeBg: string;
            badgeText: string;
            titleColor: string;
        },
        field: 'exercise_ids_inhibit' | 'exercise_ids_lengthen' | 'exercise_ids_activate' | 'exercise_ids_integrate'
    ) => {
        const selectedIds = data[field];
        const selectedExercises = allExercises.filter(ex => selectedIds.includes(ex.id));
        const availableExercises = allExercises.filter(ex => !selectedIds.includes(ex.id));

        return (
            <div className={`bg-slate-50/70 dark:bg-slate-950/40 rounded-md p-2.5 border border-slate-200/90 dark:border-slate-800 ${theme.borderTop} flex flex-col justify-between min-w-0 w-full`}>
                <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${theme.badgeBg} ${theme.badgeText}`}>
                                {phaseNum}
                            </span>
                            <div className="min-w-0">
                                <h4 className={`text-xs font-bold truncate ${theme.titleColor}`}>
                                    {title}
                                </h4>
                                <p className="text-[9.5px] text-slate-400 truncate leading-none">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {selectedExercises.length}
                        </span>
                    </div>

                    {/* Exercise Items List */}
                    <div className="space-y-1 min-h-[44px] max-h-36 overflow-y-auto pr-0.5">
                        {selectedExercises.length === 0 ? (
                            <div className="py-2.5 px-2 rounded bg-white/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <p className="text-[10px] text-slate-400">
                                    Belum ada latihan dihubungkan.
                                </p>
                            </div>
                        ) : (
                            selectedExercises.map((ex) => {
                                const img = ex.image_path
                                    ? ex.image_path.startsWith('/')
                                        ? ex.image_path
                                        : `/storage/${ex.image_path}`
                                    : null;

                                return (
                                    <div
                                        key={ex.id}
                                        className="flex items-center justify-between p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 gap-1.5 min-w-0 hover:border-slate-300 dark:hover:border-slate-700 transition-all group shadow-2xs"
                                    >
                                        <Link
                                            href={route('exercises.edit', ex.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 min-w-0 flex-1 hover:text-[#84cc16] dark:hover:text-[#b4f031] transition-colors"
                                            title="Buka detail latihan di tab baru"
                                        >
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={ex.name}
                                                    className="w-5 h-5 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                                    <Dumbbell size={9} />
                                                </div>
                                            )}
                                            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-950 dark:group-hover:text-white">
                                                {ex.name}
                                            </span>
                                            <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 text-slate-400 shrink-0" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => removeExercise(field, ex.id)}
                                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                                            title="Lepas latihan ini"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Exercise Dropdown Selector */}
                    <div className="pt-1">
                        <SearchableExerciseDropdown
                            availableExercises={availableExercises}
                            onSelect={(exId) => toggleExercise(field, exId)}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Kompensasi - ${data.name} - Athlete PMA` : 'Tambah Kompensasi PMA - Athlete PMA'} />

            <div className="space-y-4 pb-12 w-full">
                {/* ─── PAGE HEADER ─── */}
                <PageHeader
                    icon={Activity}
                    backUrl={route('dpa-compensations.index')}
                    backLabel="Kembali ke Master Kompensasi"
                    title={
                        isEdit ? (
                            <>
                                Edit Kompensasi <span className="text-[#84cc16] dark:text-[#b4f031]">Postur</span>
                            </>
                        ) : (
                            <>
                                Tambah Master <span className="text-[#84cc16] dark:text-[#b4f031]">Kompensasi PMA</span>
                            </>
                        )
                    }
                    description="Konfigurasikan biomekanika deviasi gerakan, ketidakseimbangan otot dari master data, dan hubungkan dengan 4 fase latihan korektif NASM."
                />

                {/* ─── MAIN 2-COLUMN WORKSPACE (KIRI: FORM COMPACT, KANAN: LIVE VISUALIZER & PROTOKOL) ─── */}
                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-5 xl:col-span-4): FORMULIR DATA TERPADU (COMPACT CARD)
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3.5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {isEdit ? 'Edit Data Kompensasi' : 'Tambah Kompensasi Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {isEdit
                                        ? `Mengubah deviasi ${data.name || 'kompensasi'}`
                                        : 'Registrasi deviasi postur dan pola gerak'}
                                </p>
                            </div>

                            {isEdit && (
                                <Link
                                    href={route('dpa-compensations.index')}
                                    className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw size={10} />
                                    <span>Batal</span>
                                </Link>
                            )}
                        </div>

                        {/* SECTION 1: POLA GERAK & IDENTITAS */}
                        <div className="space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Sudut Pandang <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] transition-all cursor-pointer"
                                    >
                                        <option value="Posterior View">Posterior View</option>
                                        <option value="Lateral View">Lateral View</option>
                                        <option value="Anterior View">Anterior View</option>
                                        <option value="Single Leg">Single Leg</option>
                                    </select>
                                    {errors.category && <p className="text-[10px] text-rose-500">{errors.category}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Checkpoint Sendi
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Foot & Ankle, Knee..."
                                        value={data.checkpoint}
                                        onChange={(e) => setData('checkpoint', e.target.value)}
                                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Kompensasi Gerakan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Foot - Feet Turn Out, Knee Valgus..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] placeholder:text-slate-400 transition-all"
                                />
                                {errors.name && <p className="text-[10px] text-rose-500">{errors.name}</p>}
                            </div>

                            {/* Upload Gambar Ilustrasi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Foto / Ilustrasi Gerakan
                                </label>
                                
                                {previewImage ? (
                                    <div className="flex items-center gap-2.5 p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                                        <div className="w-12 h-12 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                                            <img
                                                src={previewImage}
                                                className="w-full h-full object-contain p-0.5"
                                                alt="Ilustrasi Kompensasi"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                Gambar terunggah
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <label className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer">
                                                    <Upload size={10} />
                                                    <span>Ganti</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileChange(null)}
                                                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-500 hover:underline cursor-pointer"
                                                >
                                                    <Trash2 size={10} />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors cursor-pointer text-center group">
                                        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors">
                                            <ImageIcon size={12} />
                                        </div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="font-bold text-[#84cc16] dark:text-[#b4f031]">Pilih Gambar</span> (WebP, PNG, JPG)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                )}
                                {errors.image && <p className="text-[10px] text-rose-500">{errors.image}</p>}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2.5">
                            {/* SECTION 2: KETIDAKSEIMBANGAN OTOT & CEDERA */}
                            <TagInput
                                label="Otot Overactive (Tegang)"
                                icon={<Flame size={12} className="text-rose-500" />}
                                colorVariant="rose"
                                value={data.overactive_muscles}
                                onChange={(val) => setData('overactive_muscles', val)}
                                placeholder="Soleus, Gastrocnemius..."
                                masterItems={allMuscles}
                                manageUrl={route('muscles.index')}
                                manageLabel="Master Otot"
                            />

                            <TagInput
                                label="Otot Underactive (Lemah)"
                                icon={<Dumbbell size={12} className="text-emerald-500" />}
                                colorVariant="emerald"
                                value={data.underactive_muscles}
                                onChange={(val) => setData('underactive_muscles', val)}
                                placeholder="Medial Hamstring, Gracilis..."
                                masterItems={allMuscles}
                                manageUrl={route('muscles.index')}
                                manageLabel="Master Otot"
                            />

                            <TagInput
                                label="Potensi Risiko Cedera"
                                icon={<ShieldAlert size={12} className="text-amber-500" />}
                                colorVariant="amber"
                                value={data.possible_injuries}
                                onChange={(val) => setData('possible_injuries', val)}
                                placeholder="Plantar Fasciitis, Ankle Sprains..."
                                masterItems={allInjuries}
                                manageUrl={route('injuries.index')}
                                manageLabel="Master Cedera"
                            />
                        </div>

                        {/* SUBMIT BUTTON DI BAWAH KARTU FORM (PERSIS MASTER OTOT / MASTER LATIHAN) */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-white dark:text-slate-950 rounded-md text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <Save size={13} />
                                <span>{isEdit ? 'Perbarui Data Kompensasi' : 'Simpan Data Kompensasi'}</span>
                            </button>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-7 xl:col-span-8): LIVE BODY VISUALIZER & 4 FASE NASM
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                        {/* KARTU 1: PETA ANATOMI BIOMEKANIK (REALTIME VISUALIZER) */}
                        <BodyMuscleVisualizer
                            overactiveMuscles={data.overactive_muscles}
                            underactiveMuscles={data.underactive_muscles}
                            category={data.category}
                            checkpoint={data.checkpoint}
                        />

                        {/* KARTU 2: PROTOKOL LATIHAN KOREKTIF (4 FASE CONTINUUM) */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-[#84cc16]/10 dark:bg-[#b4f031]/10 flex items-center justify-center">
                                        <Zap size={13} className="text-[#84cc16] dark:text-[#b4f031]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                            Protokol Latihan Korektif (4 Fase NASM)
                                        </h3>
                                        <p className="text-[10px] text-slate-400">
                                            Hubungkan gerakan latihan spesifik untuk setiap fase koreksi biomekanika
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {data.exercise_ids_inhibit.length +
                                            data.exercise_ids_lengthen.length +
                                            data.exercise_ids_activate.length +
                                            data.exercise_ids_integrate.length}{' '}
                                        Latihan Terhubung
                                    </span>
                                    <Link
                                        href={route('exercises.index')}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#84cc16] dark:text-[#b4f031] hover:underline"
                                    >
                                        <span>Master Latihan</span>
                                        <ExternalLink size={10} />
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* FASE 1: INHIBIT */}
                                {renderPhaseCard(
                                    1,
                                    'Inhibit',
                                    'SMR / Foam Roll',
                                    {
                                        borderTop: 'border-t-2 border-t-rose-500',
                                        badgeBg: 'bg-rose-500/15',
                                        badgeText: 'text-rose-600 dark:text-rose-400',
                                        titleColor: 'text-rose-700 dark:text-rose-300',
                                    },
                                    'exercise_ids_inhibit'
                                )}

                                {/* FASE 2: LENGTHEN */}
                                {renderPhaseCard(
                                    2,
                                    'Lengthen',
                                    'Static Stretching',
                                    {
                                        borderTop: 'border-t-2 border-t-sky-500',
                                        badgeBg: 'bg-sky-500/15',
                                        badgeText: 'text-sky-600 dark:text-sky-400',
                                        titleColor: 'text-sky-700 dark:text-sky-300',
                                    },
                                    'exercise_ids_lengthen'
                                )}

                                {/* FASE 3: ACTIVATE */}
                                {renderPhaseCard(
                                    3,
                                    'Activate',
                                    'Isolated Strengthening',
                                    {
                                        borderTop: 'border-t-2 border-t-emerald-500',
                                        badgeBg: 'bg-emerald-500/15',
                                        badgeText: 'text-emerald-600 dark:text-emerald-400',
                                        titleColor: 'text-emerald-700 dark:text-emerald-300',
                                    },
                                    'exercise_ids_activate'
                                )}

                                {/* FASE 4: INTEGRATE */}
                                {renderPhaseCard(
                                    4,
                                    'Integrate',
                                    'Dynamic Movement',
                                    {
                                        borderTop: 'border-t-2 border-t-purple-500',
                                        badgeBg: 'bg-purple-500/15',
                                        badgeText: 'text-purple-600 dark:text-purple-400',
                                        titleColor: 'text-purple-700 dark:text-purple-300',
                                    },
                                    'exercise_ids_integrate'
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
