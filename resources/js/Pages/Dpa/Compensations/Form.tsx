import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    ChevronLeft,
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
} from 'lucide-react';
import { DpaCompensation, PageProps } from '@/types';

interface CompensationFormProps extends PageProps {
    compensation?: DpaCompensation | null;
    isEdit?: boolean;
}

export default function CompensationForm({
    auth,
    compensation,
    isEdit = false,
}: CompensationFormProps) {
    const { data, setData, post, processing, errors } = useForm<{
        _method?: string;
        category: string;
        name: string;
        checkpoint: string;
        overactive_muscles: string;
        underactive_muscles: string;
        possible_injuries: string;
        exercises_smr: string;
        exercises_stretching: string;
        exercises_isometrics: string;
        exercises_integrated: string;
        image: File | null;
        image_smr: File | null;
        image_stretching: File | null;
        image_isometrics: File | null;
        image_integrated: File | null;
        remove_image?: boolean;
        remove_image_smr?: boolean;
        remove_image_stretching?: boolean;
        remove_image_isometrics?: boolean;
        remove_image_integrated?: boolean;
    }>({
        _method: isEdit ? 'PUT' : 'POST',
        category: compensation?.category || 'Anterior View',
        name: compensation?.name || '',
        checkpoint: compensation?.checkpoint || '',
        overactive_muscles: compensation?.overactive_muscles || '',
        underactive_muscles: compensation?.underactive_muscles || '',
        possible_injuries: compensation?.possible_injuries || '',
        exercises_smr: compensation?.exercises_smr || '',
        exercises_stretching: compensation?.exercises_stretching || '',
        exercises_isometrics: compensation?.exercises_isometrics || '',
        exercises_integrated: compensation?.exercises_integrated || '',
        image: null,
        image_smr: null,
        image_stretching: null,
        image_isometrics: null,
        image_integrated: null,
    });

    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
        image: compensation?.image_path ? (compensation.image_path.startsWith('/') ? compensation.image_path : `/storage/${compensation.image_path}`) : null,
        image_smr: compensation?.image_smr ? (compensation.image_smr.startsWith('/') ? compensation.image_smr : `/storage/${compensation.image_smr}`) : null,
        image_stretching: compensation?.image_stretching ? (compensation.image_stretching.startsWith('/') ? compensation.image_stretching : `/storage/${compensation.image_stretching}`) : null,
        image_isometrics: compensation?.image_isometrics ? (compensation.image_isometrics.startsWith('/') ? compensation.image_isometrics : `/storage/${compensation.image_isometrics}`) : null,
        image_integrated: compensation?.image_integrated ? (compensation.image_integrated.startsWith('/') ? compensation.image_integrated : `/storage/${compensation.image_integrated}`) : null,
    });

    const handleFileChange = (field: string, file: File | null) => {
        setData(field as any, file);
        if (file) {
            setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
        } else {
            setPreviews((prev) => ({ ...prev, [field]: null }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetUrl = isEdit && compensation
            ? route('dpa-compensations.update', compensation.id)
            : route('dpa-compensations.store');

        post(targetUrl, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Kompensasi - ${data.name}` : 'Tambah Kompensasi DPA'} />

            <div className="space-y-6 pb-12">
                {/* ─── HEADER BAR ─── */}
                <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <Link
                            href={route('dpa-compensations.index')}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#b4f031]/15 hover:text-slate-950 dark:hover:text-[#b4f031] transition-colors shrink-0"
                            title="Kembali ke Master Data"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#b4f031]/15 text-slate-950 dark:text-[#b4f031] text-[10px] font-bold border border-[#b4f031]/30 uppercase tracking-wider">
                                <Activity size={12} />
                                <span>Master Kompensasi DPA</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isEdit ? 'Edit Kompensasi Postur' : 'Tambah Master Kompensasi DPA'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Konfigurasikan biomekanika deviasi gerakan dan 4 fase protokol latihan korektif.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                            href={route('dpa-compensations.index')}
                            className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-extrabold shadow-sm shadow-[#b4f031]/25 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save size={14} />
                            <span>{isEdit ? 'Perbarui Data' : 'Simpan Data'}</span>
                        </button>
                    </div>
                </div>

                {/* ─── TWO-COLUMN SPLIT FORM (KANAN KIRI) ─── */}
                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-5): Identitas & Ketidakseimbangan Otot
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* CARD 1: IDENTITAS POLA GERAK */}
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <Layers size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                    1. Identitas Pola Gerak
                                </h2>
                            </div>

                            <div className="space-y-3.5">
                                {/* Sudut Pandang */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Sudut Pandang (Category) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] transition-all cursor-pointer"
                                    >
                                        <option value="Posterior View">Posterior View</option>
                                        <option value="Lateral View">Lateral View</option>
                                        <option value="Anterior View">Anterior View</option>
                                        <option value="Single Leg">Single Leg</option>
                                    </select>
                                    {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
                                </div>

                                {/* Checkpoint Anatomi */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Checkpoint Anatomi (Sendi / Segmen)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Foot & Ankle, Knee, LPHC, Shoulders..."
                                        value={data.checkpoint}
                                        onChange={(e) => setData('checkpoint', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                    />
                                </div>

                                {/* Nama Kompensasi */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Kompensasi Gerakan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Knee - Move Inward (Knee Valgus)"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                {/* Gambar Ilustrasi Utama */}
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                        Gambar Ilustrasi Kompensasi
                                    </label>
                                    
                                    <div className="flex items-start gap-3">
                                        {previews.image ? (
                                            <div className="w-24 h-24 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/70 flex items-center justify-center relative group shrink-0">
                                                <img
                                                    src={previews.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFileChange('image', null);
                                                        setData('remove_image', true);
                                                    }}
                                                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    title="Hapus foto"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
                                                <ImageIcon size={22} className="opacity-50" />
                                                <span className="text-[10px] mt-1 font-medium">No Image</span>
                                            </div>
                                        )}

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b4f031]/15 hover:bg-[#b4f031]/25 text-slate-950 dark:text-[#b4f031] text-xs font-bold border border-[#b4f031]/30 cursor-pointer transition-colors">
                                                <Upload size={13} />
                                                <span>Pilih File Gambar</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange('image', e.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-[11px] text-slate-400 leading-tight">
                                                Format PNG, JPG, atau WebP (Maks 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: PEMETAAN OTOT & RISIKO CEDERA */}
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <Activity size={16} className="text-rose-500" />
                                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                    2. Pemetaan Ketidakseimbangan Otot
                                </h2>
                            </div>

                            <div className="space-y-3.5">
                                {/* Overactive */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                        <Flame size={13} />
                                        <span>Otot Overactive (Tegang / Dominan)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tulis satu per baris atau pisahkan dengan koma (cth: Soleus, Gastrocnemius, TFL)..."
                                        value={data.overactive_muscles}
                                        onChange={(e) => setData('overactive_muscles', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                    />
                                </div>

                                {/* Underactive */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Dumbbell size={13} />
                                        <span>Otot Underactive (Lemah / Terhambat)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tulis satu per baris atau pisahkan dengan koma (cth: Anterior Tibialis, Gluteus Medius)..."
                                        value={data.underactive_muscles}
                                        onChange={(e) => setData('underactive_muscles', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                    />
                                </div>

                                {/* Potensi Cedera */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <ShieldAlert size={13} />
                                        <span>Potensi Risiko Cedera</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Contoh: Plantar fasciitis, ACL strain, Patellofemoral pain, Shin splints..."
                                        value={data.possible_injuries}
                                        onChange={(e) => setData('possible_injuries', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-7): Protokol 4 Fase Latihan Korektif
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                    <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                        3. Protokol Latihan Korektif (4 Fase NASM)
                                    </h2>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">
                                    4-Phase Continuum
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* ─── Phase 1: Inhibit ─── */}
                                <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                            <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                1
                                            </span>
                                            <div>
                                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    Inhibit
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    SMR / Foam Roll (Hold 30-60s)
                                                </p>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Contoh: Gastrocnemius / Soleus roll, TFL / IT-Band roll..."
                                            value={data.exercises_smr}
                                            onChange={(e) => setData('exercises_smr', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                        />
                                    </div>

                                    {/* Upload Foto Fase 1 */}
                                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        {previews.image_smr && (
                                            <div className="relative group max-h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
                                                <img src={previews.image_smr} alt="SMR" className="max-h-24 object-contain p-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFileChange('image_smr', null);
                                                        setData('remove_image_smr', true);
                                                    }}
                                                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    title="Hapus foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors w-full justify-center">
                                            <Upload size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>{previews.image_smr ? 'Ganti Foto SMR' : 'Upload Foto SMR'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('image_smr', e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* ─── Phase 2: Lengthen ─── */}
                                <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                            <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                2
                                            </span>
                                            <div>
                                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    Lengthen
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    Static / Dynamic Stretch (20-30s)
                                                </p>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Contoh: Static Gastrocnemius stretch, Standing TFL stretch..."
                                            value={data.exercises_stretching}
                                            onChange={(e) => setData('exercises_stretching', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                        />
                                    </div>

                                    {/* Upload Foto Fase 2 */}
                                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        {previews.image_stretching && (
                                            <div className="relative group max-h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
                                                <img src={previews.image_stretching} alt="Stretch" className="max-h-24 object-contain p-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFileChange('image_stretching', null);
                                                        setData('remove_image_stretching', true);
                                                    }}
                                                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    title="Hapus foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors w-full justify-center">
                                            <Upload size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>{previews.image_stretching ? 'Ganti Foto Stretch' : 'Upload Foto Stretch'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('image_stretching', e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* ─── Phase 3: Activate ─── */}
                                <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                            <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                3
                                            </span>
                                            <div>
                                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    Activate
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    Isolated Strength (10-15 Reps)
                                                </p>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Contoh: Anterior Tibialis strengthening, Posterior Tibialis activation..."
                                            value={data.exercises_isometrics}
                                            onChange={(e) => setData('exercises_isometrics', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                        />
                                    </div>

                                    {/* Upload Foto Fase 3 */}
                                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        {previews.image_isometrics && (
                                            <div className="relative group max-h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
                                                <img src={previews.image_isometrics} alt="Isometrics" className="max-h-24 object-contain p-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFileChange('image_isometrics', null);
                                                        setData('remove_image_isometrics', true);
                                                    }}
                                                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    title="Hapus foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors w-full justify-center">
                                            <Upload size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>{previews.image_isometrics ? 'Ganti Foto Aktivasi' : 'Upload Foto Aktivasi'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('image_isometrics', e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* ─── Phase 4: Integrate ─── */}
                                <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                            <span className="w-5 h-5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#b4f031]/40">
                                                4
                                            </span>
                                            <div>
                                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    Integrate
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    Functional Movement (10-15 Reps)
                                                </p>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Contoh: Step-up to balance with mini band, Single-leg balance reach..."
                                            value={data.exercises_integrated}
                                            onChange={(e) => setData('exercises_integrated', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all leading-relaxed"
                                        />
                                    </div>

                                    {/* Upload Foto Fase 4 */}
                                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        {previews.image_integrated && (
                                            <div className="relative group max-h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
                                                <img src={previews.image_integrated} alt="Integrated" className="max-h-24 object-contain p-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFileChange('image_integrated', null);
                                                        setData('remove_image_integrated', true);
                                                    }}
                                                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    title="Hapus foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors w-full justify-center">
                                            <Upload size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>{previews.image_integrated ? 'Ganti Foto Integrasi' : 'Upload Foto Integrasi'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('image_integrated', e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-400 font-medium">
                                Pastikan seluruh data kompensasi dan latihan korektif terisi dengan lengkap.
                            </span>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('dpa-compensations.index')}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-extrabold shadow-sm shadow-[#b4f031]/25 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <Save size={14} />
                                    <span>{isEdit ? 'Perbarui Kompensasi' : 'Simpan Kompensasi'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
