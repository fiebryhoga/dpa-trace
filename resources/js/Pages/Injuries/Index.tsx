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
} from 'lucide-react';
import { Injury, PageProps } from '@/types';

interface InjuryIndexProps extends PageProps {
    injuries: {
        data: Injury[];
        links: any[];
        total: number;
    };
    regions: string[];
    filters: {
        search?: string;
        region?: string;
    };
}

export default function InjuryIndex({
    injuries,
    regions = [],
    filters = {},
}: InjuryIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
    const [editingInjury, setEditingInjury] = useState<Injury | null>(null);
    const formTopRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        body_region: 'Foot & Ankle',
        description: '',
    });

    const handleEditClick = (injury: Injury) => {
        setEditingInjury(injury);
        setData({
            name: injury.name || '',
            body_region: injury.body_region || 'Foot & Ankle',
            description: injury.description || '',
        });
        formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingInjury(null);
        reset();
        setData({
            name: '',
            body_region: 'Foot & Ankle',
            description: '',
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInjury) {
            put(route('injuries.update', editingInjury.id), {
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
            router.delete(route('injuries.destroy', injury.id), {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (region: string, search: string) => {
        router.get(
            route('injuries.index'),
            {
                search: search || undefined,
                region: region || undefined,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange(selectedRegion, searchTerm);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Potensi Risiko Cedera - DPA Trace" />

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
                                        handleFilterChange(selectedRegion, '');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </form>
                    }
                />

                {/* ─── SPLIT WORKSPACE (KOLOM KIRI FORM RAMPING, KANAN TABEL LEBAR) ─── */}
                <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (LEBAR RAMPING ~290px - 310px): FORMULIR CEDERA
                       ═══════════════════════════════════════════ */}
                    <div className="w-full lg:w-[290px] xl:w-[310px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3 shadow-xs space-y-2.5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {editingInjury ? 'Edit Data Cedera' : 'Tambah Cedera Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {editingInjury
                                        ? `Mengubah ${editingInjury.name}`
                                        : 'Input master patologi cedera'}
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

                        <form onSubmit={handleFormSubmit} className="space-y-2.5">
                            {/* Nama Potensi Cedera */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Potensi Cedera <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Plantar fasciitis..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-rose-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Region Anatomi Terkait */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    Region Anatomi
                                </label>
                                <select
                                    value={data.body_region}
                                    onChange={(e) => setData('body_region', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                >
                                    <option value="Foot & Ankle">Foot & Ankle</option>
                                    <option value="Knee">Knee</option>
                                    <option value="LPHC">LPHC (Pelvis / Hip / Lumbal)</option>
                                    <option value="Shoulder & Arm">Shoulder & Arm</option>
                                    <option value="Head & Neck">Head & Neck</option>
                                    <option value="Spine & Trunk">Spine & Trunk</option>
                                </select>
                            </div>

                            {/* Deskripsi Patologi */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Patologi / Dampak
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Gejala patologis, beban mekanis..."
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
                        KOLOM KANAN (flex-1 min-w-0): TABEL DAFTAR CEDERA LEBAR
                       ═══════════════════════════════════════════ */}
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Header & Quick Filter Dropdown */}
                        <div className="flex items-center justify-between pb-0.5">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                Daftar Master Cedera ({injuries.total})
                            </span>

                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => {
                                        setSelectedRegion(e.target.value);
                                        handleFilterChange(e.target.value, searchTerm);
                                    }}
                                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
                                >
                                    <option value="">Semua Region Sendi</option>
                                    {regions.map((reg) => (
                                        <option key={reg} value={reg}>
                                            {reg}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Table Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-2.5 px-3.5 w-1/4">Nama Potensi Cedera</th>
                                            <th className="py-2.5 px-3.5 w-1/4">Region Anatomi Terkait</th>
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
                                                        <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300 font-medium align-top">
                                                            {injury.body_region || <span className="text-slate-400">-</span>}
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
                                                                title="Edit Data Cedera"
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
