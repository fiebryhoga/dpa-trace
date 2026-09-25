import React, { useMemo } from 'react';
import {
    Calendar,
    FileText,
    ListChecks,
    Save,
    X,
    Edit,
    Check,
    Ruler,
    Weight,
    CheckCircle2,
    Eye,
} from 'lucide-react';
import { DpaCompensation } from '@/types';

interface AssessmentFormProps {
    compensations: DpaCompensation[];
    data: {
        assessment_date: string;
        notes: string;
        current_height_cm?: string | number;
        current_weight_kg?: string | number;
        compensations: number[];
    };
    setData: (key: any, value: any) => void;
    submit: (e: React.FormEvent) => void;
    processing: boolean;
    isEditMode: boolean;
    cancelEdit: () => void;
}

export default function AssessmentForm({
    compensations = [],
    data,
    setData,
    submit,
    processing,
    isEditMode,
    cancelEdit,
}: AssessmentFormProps) {
    const categories = [
        'Posterior View',
        'Lateral View',
        'Anterior View',
        'Single Leg',
    ];

    const handleCheckboxChange = (compensationId: number) => {
        const selected = data.compensations || [];
        if (selected.includes(compensationId)) {
            setData(
                'compensations',
                selected.filter((id) => id !== compensationId)
            );
        } else {
            setData('compensations', [...selected, compensationId]);
        }
    };

    const selectedItems = useMemo(() => {
        return compensations.filter((c) => data.compensations?.includes(c.id));
    }, [compensations, data.compensations]);

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* ═══════════════════════════════════════
                    KOLOM KIRI: Grid Pemilihan Kompensasi per Kategori
                   ═══════════════════════════════════════ */}
                <div className="order-1 lg:col-span-8 xl:col-span-9 space-y-4">
                    {categories.map((category) => {
                        const categoryItems = compensations.filter(
                            (c) => c.category === category
                        );
                        if (categoryItems.length === 0) return null;

                        const categorySelectedCount = categoryItems.filter((c) =>
                            data.compensations?.includes(c.id)
                        ).length;

                        return (
                            <div
                                key={category}
                                className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden"
                            >
                                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031]" />
                                        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                                            {category}
                                        </h5>
                                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                            ({categoryItems.length} gerakan)
                                        </span>
                                    </div>
                                    {categorySelectedCount > 0 && (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#b4f031]/20 text-slate-900 dark:text-[#b4f031] border border-[#b4f031]/40">
                                            {categorySelectedCount} Terpilih
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {categoryItems.map((comp) => {
                                        const isChecked = data.compensations?.includes(comp.id);
                                        return (
                                            <label
                                                key={comp.id}
                                                className={`flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-all ${
                                                    isChecked
                                                        ? 'border-[#84cc16] dark:border-[#b4f031] ring-2 ring-[#b4f031]/30 bg-[#b4f031]/10 dark:bg-[#b4f031]/10 shadow-sm'
                                                        : 'border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0F172A]/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                                                }`}
                                            >
                                                {comp.image_path ? (
                                                    <div className="w-full h-28 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                                                        <img
                                                            src={comp.image_path.startsWith('/') ? comp.image_path : `/storage/${comp.image_path}`}
                                                            alt={comp.name}
                                                            className="w-full h-full object-contain rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-24 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                                        <Eye size={18} className="mb-1 opacity-40" />
                                                        <span className="text-[9.5px] uppercase font-bold tracking-wider">
                                                            Visual Checklist
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-3 flex items-start gap-2.5 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-0.5 rounded text-[#84cc16] focus:ring-[#84cc16] w-4 h-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(comp.id)}
                                                    />
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug block">
                                                            {comp.name}
                                                        </span>
                                                        {comp.checkpoint && (
                                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                                                {comp.checkpoint}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ═══════════════════════════════════════
                    KOLOM KANAN (SIDEBAR): Form Input, Ringkasan Pilihan & Submit
                   ═══════════════════════════════════════ */}
                <div className="order-2 lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-20">
                    <div className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {isEditMode ? (
                                    <Edit size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                ) : (
                                    <Calendar size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                )}
                                <span>{isEditMode ? 'Perbarui Evaluasi DPA' : 'Form Evaluasi Baru'}</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {isEditMode ? 'Edit temuan asesmen postur' : 'Simpan catatan evaluasi postur dinamis'}
                            </p>
                        </div>

                        <div className="p-4 space-y-3.5">
                            {/* Tanggal Evaluasi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Calendar size={12} className="text-slate-400" />
                                    <span>Tanggal Evaluasi</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.assessment_date}
                                    onChange={(e) => setData('assessment_date', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-[#84cc16] outline-none transition-all cursor-pointer"
                                    required
                                />
                            </div>

                            {/* Tinggi & Berat Badan Saat Asesmen */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Ruler size={11} className="text-slate-400" />
                                        <span>Tinggi (cm)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="175"
                                        value={data.current_height_cm || ''}
                                        onChange={(e) => setData('current_height_cm', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-[#84cc16] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Weight size={11} className="text-slate-400" />
                                        <span>Berat (kg)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="68"
                                        value={data.current_weight_kg || ''}
                                        onChange={(e) => setData('current_weight_kg', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-[#84cc16] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Catatan Observasi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <FileText size={12} className="text-slate-400" />
                                    <span>Catatan Klinis &amp; Observasi</span>
                                </label>
                                <textarea
                                    value={data.notes || ''}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-[#84cc16] outline-none resize-y"
                                    placeholder="Catatan temuan khusus gerak, rasa nyeri, atau keluhan atlet..."
                                />
                            </div>

                            {/* Live Selection Summary */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <ListChecks size={13} className="text-slate-500 dark:text-slate-400" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            Kompensasi Dipilih
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#84cc16] dark:text-[#b4f031]">
                                        {selectedItems.length} terpilih
                                    </span>
                                </div>

                                <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {selectedItems.length > 0 ? (
                                        <ul className="space-y-1 text-xs">
                                            {selectedItems.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                                >
                                                    <span className="font-medium truncate pr-2 text-[11px]">
                                                        {item.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCheckboxChange(item.id)}
                                                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                                        title="Batal pilih"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-3 text-center rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                                            Centang temuan kompensasi pada daftar sebelah kiri
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-xs font-extrabold bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 shadow-md h-9 px-4 gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                                >
                                    <Save size={14} />
                                    <span>{isEditMode ? 'Perbarui Evaluasi' : 'Simpan Evaluasi DPA'}</span>
                                </button>

                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="w-full inline-flex items-center justify-center rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 h-8 px-3.5 gap-1.5 shadow-2xs cursor-pointer transition-colors"
                                    >
                                        <X size={13} />
                                        <span>Batal Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
