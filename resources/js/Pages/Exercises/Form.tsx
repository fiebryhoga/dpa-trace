import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    ChevronLeft,
    Save,
    Upload,
    Image as ImageIcon,
    X,
    Layers,
    Video,
    Dumbbell,
} from 'lucide-react';
import { Exercise, PageProps } from '@/types';

interface ExerciseFormProps extends PageProps {
    exercise?: Exercise | null;
    isEdit?: boolean;
}

export default function ExerciseForm({
    auth,
    exercise,
    isEdit = false,
}: ExerciseFormProps) {
    const { data, setData, post, processing, errors } = useForm<{
        _method?: string;
        name: string;
        instructions: string;
        video_url: string;
        is_active: boolean;
        image: File | null;
        remove_image?: boolean;
    }>({
        _method: isEdit ? 'PUT' : 'POST',
        name: exercise?.name || '',
        instructions: exercise?.instructions || '',
        video_url: exercise?.video_url || '',
        is_active: exercise?.is_active ?? true,
        image: null,
    });

    const [previewImage, setPreviewImage] = useState<string | null>(
        exercise?.image_path
            ? exercise.image_path.startsWith('/')
                ? exercise.image_path
                : `/storage/${exercise.image_path}`
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
        const targetUrl = isEdit && exercise
            ? route('exercises.update', exercise.id)
            : route('exercises.store');

        post(targetUrl, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Latihan - ${data.name}` : 'Tambah Latihan Korektif'} />

            <div className="space-y-6 pb-12">
                <PageHeader
                    icon={Dumbbell}
                    backUrl={route('exercises.index')}
                    backLabel="Kembali ke Master Latihan"
                    title={
                        isEdit ? (
                            <>
                                Edit Latihan <span className="text-[#84cc16] dark:text-[#b4f031]">Korektif</span>
                            </>
                        ) : (
                            <>
                                Tambah Latihan <span className="text-[#84cc16] dark:text-[#b4f031]">Baru</span>
                            </>
                        )
                    }
                    description="Masukkan nama latihan, instruksi pelaksanaan, tautan video, dan foto peraga."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('exercises.index')}
                                className="px-3.5 py-2 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Save size={14} />
                                <span>{isEdit ? 'Perbarui Latihan' : 'Simpan Latihan'}</span>
                            </button>
                        </div>
                    }
                />

                {/* ─── TWO-COLUMN RESPONSIVE FORM (KANAN KIRI) ─── */}
                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-6): Identitas & Instruksi
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* CARD 1: INFORMASI UTAMA LATIHAN */}
                        <div className="bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <Layers size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                    1. Informasi Latihan
                                </h2>
                            </div>

                            <div className="space-y-3.5">
                                {/* Nama Latihan */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Latihan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Foam Roll Calf, Static Standing Gastroc Stretch..."
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                    />
                                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                {/* Instruksi Gerak */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Instruksi / Penjelasan Gerakan
                                    </label>
                                    <textarea
                                        rows={6}
                                        placeholder="Tuliskan urutan posisi awal, gerakan, dan pernapasan..."
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all resize-y"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-6): Media Ilustrasi & Video
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* CARD 2: MEDIA ILUSTRASI & VIDEO */}
                        <div className="bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <ImageIcon size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                    2. Foto Ilustrasi & Video Peraga
                                </h2>
                            </div>

                            <div className="space-y-3.5">
                                {/* Upload Foto */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Foto / Gambar Peraga Latihan
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {previewImage ? (
                                                <>
                                                    <img
                                                        src={previewImage}
                                                        className="w-full h-full object-contain p-1"
                                                        alt="Preview Latihan"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileChange(null)}
                                                        className="absolute top-1 right-1 p-1 rounded bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        title="Hapus gambar"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon className="w-7 h-7 text-slate-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#b4f031]/20 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer border border-slate-200 dark:border-slate-700 transition-all">
                                                <Upload size={13} />
                                                <span>Pilih File Gambar</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            <p className="text-[10px] text-slate-400">
                                                Format: JPG, PNG, WEBP. Maksimal 5MB.
                                            </p>
                                        </div>
                                    </div>
                                    {errors.image && <p className="text-xs text-rose-500">{errors.image}</p>}
                                </div>

                                {/* Video URL */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Video size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                        <span>Link Video Demonstrasi (YouTube / URL)</span>
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={data.video_url}
                                        onChange={(e) => setData('video_url', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS BOTTOM */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('exercises.index')}
                                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Save size={15} />
                                <span>{isEdit ? 'Perbarui Latihan' : 'Simpan Latihan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
