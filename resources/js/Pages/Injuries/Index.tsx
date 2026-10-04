import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    ShieldAlert,
    Search,
    Edit2,
    Trash2,
    X,
    RotateCcw,
    Save,
    Sparkles,
} from 'lucide-react';
import { Injury, PageProps } from '@/types';
import Body, { Slug } from 'react-muscle-highlighter';

interface InjuryIndexProps extends PageProps {
    injuries: {
        data: Injury[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

const SLUG_LABELS: Record<string, string> = {
    calves: 'Betis (Calves)',
    tibialis: 'Tulang Kering (Tibialis)',
    hamstring: 'Paha Belakang (Hamstrings)',
    quadriceps: 'Paha Depan (Quadriceps)',
    adductors: 'Paha Dalam (Adductors)',
    gluteal: 'Bokong / Pinggul (Gluteal)',
    abs: 'Perut / Core (Abs)',
    obliques: 'Otot Samping (Obliques)',
    'lower-back': 'Punggung Bawah (Lower Back)',
    'upper-back': 'Punggung Atas (Upper Back)',
    trapezius: 'Leher Belakang / Trapezius',
    neck: 'Leher (Neck)',
    chest: 'Dada (Chest)',
    deltoids: 'Bahu (Deltoids)',
    biceps: 'Lengan Depan (Biceps)',
    triceps: 'Lengan Belakang (Triceps)',
    forearm: 'Lengan Bawah (Forearm)',
    knees: 'Lutut (Knees)',
    ankles: 'Pergelangan Kaki (Ankles)',
};

export default function InjuryIndex({
    injuries,
    filters = {},
}: InjuryIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [editingInjury, setEditingInjury] = useState<Injury | null>(null);
    const formTopRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: 'knees',
        description: '',
    });

    const selectedSlugs = data.slug
        ? data.slug.split(',').map((s) => s.trim() as Slug).filter(Boolean)
        : [];

    const handleBodyPartToggle = (part: any) => {
        if (!part?.slug) return;
        const clickedSlug = part.slug as Slug;

        let newSlugs: Slug[];
        if (selectedSlugs.includes(clickedSlug)) {
            newSlugs = selectedSlugs.filter((s) => s !== clickedSlug);
        } else {
            newSlugs = [...selectedSlugs, clickedSlug];
        }

        setData('slug', newSlugs.join(','));
    };

    const handleRemoveSlug = (slugToRemove: string) => {
        const newSlugs = selectedSlugs.filter((s) => s !== slugToRemove);
        setData('slug', newSlugs.join(','));
    };

    const handleClearSlugs = () => {
        setData('slug', '');
    };

    const handleEditClick = (injury: Injury) => {
        setEditingInjury(injury);
        setData({
            name: injury.name || '',
            slug: injury.slug || 'knees',
            description: injury.description || '',
        });
        formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingInjury(null);
        reset();
        setData({
            name: '',
            slug: 'knees',
            description: '',
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInjury) {
            put(route('injuries.update', editingInjury.slug || editingInjury.id), {
                preserveScroll: true,
                onSuccess: () => handleCancelEdit(),
            });
        } else {
            post(route('injuries.store'), {
                preserveScroll: true,
                onSuccess: () => handleCancelEdit(),
            });
        }
    };

    const handleDelete = (injury: Injury) => {
        if (confirm(`Hapus master risiko cedera "${injury.name}" secara permanen?`)) {
            router.delete(route('injuries.destroy', injury.slug || injury.id), {
                preserveScroll: true,
            });
        }
    };

    const handleSearchChange = (search: string) => {
        router.get(
            route('injuries.index'),
            {
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearchChange(searchTerm);
    };

    const bodyHighlightData = selectedSlugs.map((s) => ({ slug: s, intensity: 2 }));

    return (
        <AuthenticatedLayout>
            <Head title="Master Potensi Risiko Cedera - Athlete PMA" />

            <div className="space-y-4 pb-12" ref={formTopRef}>
                {/* ─── PAGE HEADER WITH SEARCH BAR IN ACTIONS ─── */}
                <PageHeader
                    icon={ShieldAlert}
                    title={
                        <>
                            Master Potensi{' '}
                            <span className="text-[#84cc16] dark:text-[#b4f031]">Risiko Cedera</span>
                        </>
                    }
                    description="Katalog kondisi patologis dan risiko cedera muskuloskeletal yang diakibatkan oleh kompensasi postur."
                    actions={
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama cedera, patologi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] transition-all shadow-2xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        handleSearchChange('');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </form>
                    }
                />

                {/* ─── SPLIT 2-COLUMN WORKSPACE (KIRI: FORMULIR, KANAN: DAFTAR CEDERA) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-4 xl:col-span-3): FORMULIR CEDERA + LIVE BODY SILUET
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {editingInjury ? 'Edit Data Cedera' : 'Tambah Cedera Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {editingInjury
                                        ? `Mengubah ${editingInjury.name}`
                                        : 'Klik tubuh untuk memilih lokasi cedera'}
                                </p>
                            </div>

                            {editingInjury && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw size={10} />
                                    <span>Batal</span>
                                </button>
                            )}
                        </div>

                        {/* LIVE BODY VISUALIZER STRIP (RAMPING, KOMPAK, BRAND GREEN HIGHLIGHT) */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-md p-2 flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center justify-between w-full text-[10px] font-semibold text-slate-400 pb-1 border-b border-slate-200/50 dark:border-slate-800/60">
                                <span className="flex items-center gap-1 text-[#84cc16] dark:text-[#b4f031]">
                                    <Sparkles size={11} />
                                    <span>Klik Bagian Terkena</span>
                                </span>
                                <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                    {selectedSlugs.length} dipilih
                                </span>
                            </div>

                            <div className="flex items-center justify-around gap-1 py-0.5 w-full">
                                <div className="flex flex-col items-center flex-1 cursor-pointer group">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors">
                                        Depan
                                    </span>
                                    <div className="w-20 h-36 flex items-center justify-center [&_svg]:cursor-pointer [&_path]:cursor-pointer [&_path]:hover:opacity-75 transition-all">
                                        <Body
                                            data={bodyHighlightData}
                                            side="front"
                                            scale={0.46}
                                            gender="male"
                                            colors={['#84cc16', '#a3e635']}
                                            onBodyPartPress={handleBodyPartToggle}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center flex-1 cursor-pointer group">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors">
                                        Belakang
                                    </span>
                                    <div className="w-20 h-36 flex items-center justify-center [&_svg]:cursor-pointer [&_path]:cursor-pointer [&_path]:hover:opacity-75 transition-all">
                                        <Body
                                            data={bodyHighlightData}
                                            side="back"
                                            scale={0.46}
                                            gender="male"
                                            colors={['#84cc16', '#a3e635']}
                                            onBodyPartPress={handleBodyPartToggle}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-2.5">
                            {/* Lokasi Cedera Terpilih dari Siluet Tubuh */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <span>Lokasi Tubuh Terkait</span>
                                        {selectedSlugs.length > 0 && (
                                            <span className="px-1.5 py-0.2 bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#84cc16] dark:text-[#b4f031] rounded text-[9.5px] font-bold">
                                                {selectedSlugs.length}
                                            </span>
                                        )}
                                    </span>
                                    {selectedSlugs.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearSlugs}
                                            className="text-[9.5px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                {selectedSlugs.length === 0 ? (
                                    <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-[10.5px] text-slate-400 text-center">
                                        Klik siluet tubuh di atas untuk memilih lokasi cedera
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1 p-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
                                        {selectedSlugs.map((s) => (
                                            <span
                                                key={s}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10.5px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031] shrink-0" />
                                                <span className="truncate max-w-[120px]">
                                                    {SLUG_LABELS[s] || s}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSlug(s)}
                                                    className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                                                    title={`Hapus ${s}`}
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nama Potensi Cedera */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Potensi Cedera <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Plantar fasciitis, ACL strain..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-rose-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Deskripsi Patologi */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Patologi / Dampak
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Gejala patologis, beban mekanis kompensasi..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                            </div>

                            {/* Submit & Cancel Actions */}
                            <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                                {editingInjury && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-2 py-1.5 rounded-md text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                                >
                                    <Save size={12} />
                                    <span>{editingInjury ? 'Perbarui Cedera' : 'Simpan Cedera'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-8 xl:col-span-9): TABEL DAFTAR CEDERA
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-3">
                        {/* Header Total */}
                        <div className="flex items-center justify-between pb-0.5">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                Daftar Master Cedera ({injuries.total})
                            </span>
                        </div>

                        {/* Table Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-2.5 px-3.5 w-1/4">Nama Potensi Cedera</th>
                                            <th className="py-2.5 px-3.5 w-1/3">Pemetaan Bagian Visual Tubuh</th>
                                            <th className="py-2.5 px-3.5">Deskripsi / Patologi</th>
                                            <th className="py-2.5 px-3.5 text-right w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                        {injuries.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                                                    Tidak ada data risiko cedera yang cocok.
                                                </td>
                                            </tr>
                                        ) : (
                                            injuries.data.map((injury) => {
                                                const isBeingEdited = editingInjury?.id === injury.id;
                                                return (
                                                    <tr
                                                        key={injury.id}
                                                        className={`transition-colors ${
                                                            isBeingEdited
                                                                ? 'bg-[#84cc16]/10 dark:bg-[#b4f031]/10'
                                                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                                                        }`}
                                                    >
                                                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white align-top">
                                                            {injury.name}
                                                        </td>
                                                        <td className="py-2.5 px-3.5 align-top">
                                                            {injury.slug ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {injury.slug
                                                                        .split(',')
                                                                        .map((s) => s.trim())
                                                                        .filter(Boolean)
                                                                        .map((s) => (
                                                                            <span
                                                                                key={s}
                                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-medium"
                                                                            >
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031]" />
                                                                                <span>{SLUG_LABELS[s] || s}</span>
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 text-xs align-top">
                                                            {injury.description || <span className="text-slate-400">-</span>}
                                                        </td>
                                                        <td className="py-2.5 px-3.5 text-right space-x-1 align-top">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditClick(injury)}
                                                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                                                    isBeingEdited
                                                                        ? 'bg-[#84cc16] text-slate-950 font-bold'
                                                                        : 'text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10'
                                                                }`}
                                                                title="Edit Data Cedera & Visualisasi"
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(injury)}
                                                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                                title="Hapus Cedera"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
