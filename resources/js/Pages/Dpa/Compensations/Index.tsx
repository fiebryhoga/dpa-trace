import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Activity,
    Search,
    X,
    Flame,
    Dumbbell,
    Layers,
    Target,
} from 'lucide-react';
import { DpaCompensation, PageProps } from '@/types';

interface CompensationsIndexProps extends PageProps {
    compensations: DpaCompensation[];
}

export default function CompensationsIndex({
    compensations = [],
}: CompensationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = [
        'Posterior View',
        'Lateral View',
        'Anterior View',
        'Single Leg',
    ];

    const handleDelete = (item: DpaCompensation) => {
        if (confirm(`Hapus kompensasi "${item.name}" secara permanen?`)) {
            router.delete(route('dpa-compensations.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredCompensations = compensations.filter((c) => {
        const matchesCategory =
            selectedCategory === 'All' || c.category === selectedCategory;
        if (!matchesCategory) return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.checkpoint?.toLowerCase().includes(q) ||
            c.overactive_muscles?.toLowerCase().includes(q) ||
            c.underactive_muscles?.toLowerCase().includes(q) ||
            c.possible_injuries?.toLowerCase().includes(q)
        );
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Kompensasi Postur - DPA Trace" />

            <div className="space-y-4 pb-12">
                <PageHeader
                    icon={Activity}
                    title={
                        <>
                            Master Data Kompensasi{' '}
                            <span className="text-[#84cc16] dark:text-[#b4f031]">Postur (DPA)</span>
                        </>
                    }
                    description="Basis data deviasi kinetik tubuh, pemetaan ketidakseimbangan otot (overactive & underactive), serta protokol 4 fase latihan korektif NASM."
                    actions={
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-64">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari kompensasi, checkpoint..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] transition-all shadow-2xs"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            <Link
                                href={route('dpa-compensations.create')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-white dark:text-slate-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                                <Plus size={13} />
                                <span>Tambah Kompensasi</span>
                            </Link>
                        </div>
                    }
                />

                {/* ─── FILTER CATEGORY PILLS ─── */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('All')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                selectedCategory === 'All'
                                    ? 'bg-[#84cc16] dark:bg-[#b4f031] text-white dark:text-slate-950 font-bold shadow-2xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            Semua ({compensations.length})
                        </button>
                        {categories.map((cat) => {
                            const count = compensations.filter((c) => c.category === cat).length;
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? 'bg-[#84cc16] dark:bg-[#b4f031] text-white dark:text-slate-950 font-bold shadow-2xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    {cat} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {filteredCompensations.length} Pola Deviasi
                    </span>
                </div>

                {/* ─── COMPENSATIONS CARD GRID ─── */}
                {filteredCompensations.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md text-center py-12 px-4 shadow-xs space-y-2">
                        <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Tidak Ada Data Kompensasi
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Tidak ditemukan data pola kompensasi untuk kriteria pencarian ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {filteredCompensations.map((item) => {
                            const image = item.image_path
                                ? item.image_path.startsWith('/')
                                    ? item.image_path
                                    : `/storage/${item.image_path}`
                                : null;

                            const overactiveList = item.overactive_muscles
                                ? item.overactive_muscles
                                      .split(/\r?\n|,/)
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                : [];

                            const underactiveList = item.underactive_muscles
                                ? item.underactive_muscles
                                      .split(/\r?\n|,/)
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                : [];

                            const exerciseCount = item.exercises?.length || 0;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <div>
                                        {/* Image Banner if Available */}
                                        {image && (
                                            <div className="w-full h-32 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}

                                        <div className="p-3.5 space-y-2.5">
                                            {/* Header: Badges & Name */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {item.category}
                                                        </span>
                                                        {item.checkpoint && (
                                                            <span className="text-[9.5px] font-semibold text-[#84cc16] dark:text-[#b4f031]">
                                                                {item.checkpoint}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={route('dpa-compensations.edit', item.id)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10 transition-colors cursor-pointer shrink-0"
                                                            title="Edit Kompensasi"
                                                        >
                                                            <Edit2 size={12} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                                                            title="Hapus Kompensasi"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                                    {item.name}
                                                </h4>
                                            </div>

                                            {/* Overactive & Underactive Badges */}
                                            <div className="space-y-1.5 text-[10px]">
                                                {/* Overactive */}
                                                {overactiveList.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 text-[9.5px]">
                                                            <Flame size={10} /> Overactive ({overactiveList.length}):
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {overactiveList.slice(0, 3).map((m, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[9.5px] truncate max-w-[140px]"
                                                                >
                                                                    {m}
                                                                </span>
                                                            ))}
                                                            {overactiveList.length > 3 && (
                                                                <span className="text-[9px] font-bold text-rose-500 self-center">
                                                                    +{overactiveList.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Underactive */}
                                                {underactiveList.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[9.5px]">
                                                            <Dumbbell size={10} /> Underactive ({underactiveList.length}):
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {underactiveList.slice(0, 3).map((m, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[9.5px] truncate max-w-[140px]"
                                                                >
                                                                    {m}
                                                                </span>
                                                            ))}
                                                            {underactiveList.length > 3 && (
                                                                <span className="text-[9px] font-bold text-emerald-500 self-center">
                                                                    +{underactiveList.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Protocol count & Edit */}
                                    <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px]">
                                        <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Layers size={11} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>{exerciseCount} Latihan Terhubung</span>
                                        </span>
                                        <Link
                                            href={route('dpa-compensations.edit', item.id)}
                                            className="text-[10px] font-bold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer"
                                        >
                                            Edit Detail →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
