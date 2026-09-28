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
    ShieldAlert,
    Compass,
} from 'lucide-react';
import { DpaCompensation, PageProps } from '@/types';

interface CompensationsIndexProps extends PageProps {
    compensations: DpaCompensation[];
}

const CATEGORY_ORDER = [
    'Anterior View',
    'Lateral View',
    'Posterior View',
    'Single Leg',
];

const CATEGORY_INFO: Record<string, { label: string; description: string; badgeClass: string }> = {
    'Anterior View': {
        label: 'Tampak Depan (Anterior View)',
        description: 'Observasi kinetik kaki, pergelangan kaki, dan lutut dari sudut pandang depan.',
        badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    },
    'Lateral View': {
        label: 'Tampak Samping (Lateral View)',
        description: 'Observasi kinetik LPHC (pinggang/panggul), bahu, dan kepala dari sudut pandang samping.',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    },
    'Posterior View': {
        label: 'Tampak Belakang (Posterior View)',
        description: 'Observasi kinetik tumit, arkus kaki, skapula, dan panggul dari sudut pandang belakang.',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    },
    'Single Leg': {
        label: 'Keseimbangan Satu Kaki (Single Leg)',
        description: 'Penilaian transisi dinamis penopang tunggal tubuh dan stabilitas panggul.',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    },
};

function CompensationCard({
    item,
    onDelete,
}: {
    item: DpaCompensation;
    onDelete: (item: DpaCompensation) => void;
}) {
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

    const possibleInjuriesList = item.possible_injuries
        ? item.possible_injuries
              .split(/\r?\n|,/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const exerciseCount = item.exercises?.length || 0;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
                {/* ── Visual Media / Image Banner ── */}
                {image ? (
                    <div className="w-full h-36 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-center relative overflow-hidden group/img">
                        <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-105"
                        />
                        {item.checkpoint && (
                            <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
                                    {item.checkpoint}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-4 pt-3.5 pb-0 flex items-center justify-between gap-2">
                        {item.checkpoint ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50">
                                {item.checkpoint}
                            </span>
                        ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-slate-400">
                                Umum
                            </span>
                        )}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link
                                href={route('dpa-compensations.edit', item.slug || item.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10 transition-colors cursor-pointer"
                                title="Edit Kompensasi"
                            >
                                <Edit2 size={12} />
                            </Link>
                            <button
                                type="button"
                                onClick={() => onDelete(item)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Hapus Kompensasi"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Content Body ── */}
                <div className="p-4 space-y-3">
                    {/* Header Row if image was present */}
                    {image && (
                        <div className="flex items-center justify-between gap-2 -mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                {item.category}
                            </span>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={route('dpa-compensations.edit', item.slug || item.id)}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10 transition-colors cursor-pointer"
                                    title="Edit Kompensasi"
                                >
                                    <Edit2 size={12} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Hapus Kompensasi"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                        {item.name}
                    </h4>

                    {/* Muscle Imbalance Breakdown */}
                    <div className="space-y-2 pt-0.5">
                        {/* Overactive */}
                        {overactiveList.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <Flame size={11} className="shrink-0" />
                                        <span>Overactive</span>
                                    </span>
                                    <span className="text-[9px] font-bold text-rose-500/80">
                                        {overactiveList.length} otot
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {overactiveList.slice(0, 3).map((m, idx) => (
                                        <span
                                            key={idx}
                                            className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 truncate max-w-[130px]"
                                            title={m}
                                        >
                                            {m}
                                        </span>
                                    ))}
                                    {overactiveList.length > 3 && (
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100/70 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                                            title={overactiveList.slice(3).join(', ')}
                                        >
                                            +{overactiveList.length - 3} lainnya
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Underactive */}
                        {underactiveList.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <Dumbbell size={11} className="shrink-0" />
                                        <span>Underactive</span>
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-500/80">
                                        {underactiveList.length} otot
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {underactiveList.slice(0, 3).map((m, idx) => (
                                        <span
                                            key={idx}
                                            className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 truncate max-w-[130px]"
                                            title={m}
                                        >
                                            {m}
                                        </span>
                                    ))}
                                    {underactiveList.length > 3 && (
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                            title={underactiveList.slice(3).join(', ')}
                                        >
                                            +{underactiveList.length - 3} lainnya
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Possible Injuries */}
                        {possibleInjuriesList.length > 0 && (
                            <div className="pt-1">
                                <div className="flex items-start gap-1.5 p-1.5 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-[10px] text-amber-800 dark:text-amber-300">
                                    <ShieldAlert size={11} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1 leading-tight" title={possibleInjuriesList.join(', ')}>
                                        <span className="font-semibold">Risiko:</span> {possibleInjuriesList.join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                    <span>{exerciseCount} Latihan</span>
                </span>
                <Link
                    href={route('dpa-compensations.edit', item.slug || item.id)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                >
                    <span>Edit Detail</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}

export default function CompensationsIndex({
    compensations = [],
}: CompensationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Extract all distinct categories
    const allCategories = Array.from(
        new Set([
            ...CATEGORY_ORDER,
            ...compensations.map((c) => c.category).filter(Boolean),
        ])
    );

    const handleDelete = (item: DpaCompensation) => {
        if (confirm(`Hapus kompensasi "${item.name}" secara permanen?`)) {
            router.delete(route('dpa-compensations.destroy', item.slug || item.id), {
                preserveScroll: true,
            });
        }
    };

    // Filter by search
    const matchesSearch = (c: DpaCompensation) => {
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
    };

    const filteredCompensations = compensations.filter((c) => {
        const matchesCategory =
            selectedCategory === 'All' || c.category === selectedCategory;
        return matchesCategory && matchesSearch(c);
    });

    // Categories to render
    const displayCategories = selectedCategory === 'All'
        ? allCategories.filter((cat) => {
              // Only display categories that have items matching search
              return compensations.some((c) => c.category === cat && matchesSearch(c));
          })
        : [selectedCategory];

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Kompensasi Postur - Athlete DPA" />

            <div className="space-y-6 pb-16">
                {/* ─── PAGE HEADER WITH SEARCH BAR & ADD BUTTON ─── */}
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
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
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
                            Semua Kategori ({compensations.length})
                        </button>
                        {allCategories.map((cat) => {
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

                {/* ─── CATEGORY-GROUPED OR FILTERED SECTIONS ─── */}
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
                    <div className="space-y-8">
                        {displayCategories.map((category) => {
                            const categoryItems = filteredCompensations.filter(
                                (c) => c.category === category
                            );

                            if (categoryItems.length === 0) return null;

                            const info = CATEGORY_INFO[category] || {
                                label: category,
                                description: `Kompensasi pada kategori ${category}`,
                                badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                            };

                            return (
                                <section key={category} className="space-y-3.5">
                                    {/* Category Section Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#84cc16] dark:bg-[#b4f031]" />
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {info.label}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {categoryItems.length} kompensasi
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:block">
                                            {info.description}
                                        </p>
                                    </div>

                                    {/* Cards Grid for this category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                                        {categoryItems.map((item) => (
                                            <CompensationCard
                                                key={item.id}
                                                item={item}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
