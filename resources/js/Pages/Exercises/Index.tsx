import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Dumbbell,
    Search,
    X,
    Eye,
    Video,
    RotateCcw,
    Save,
    Camera,
    Upload,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import { Exercise, PageProps } from '@/types';

interface ExercisesIndexProps extends PageProps {
    exercises: Exercise[];
    filters: {
        search: string;
    };
}

export default function ExerciseIndex({
    exercises = [],
    filters,
}: ExercisesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedModalExercise, setSelectedModalExercise] = useState<Exercise | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formTopRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        _method?: string;
        name: string;
        instructions: string;
        video_url: string;
        is_active: boolean;
        image: File | null;
        remove_image?: boolean;
    }>({
        _method: 'POST',
        name: '',
        instructions: '',
        video_url: '',
        is_active: true,
        image: null,
    });

    const handleEditClick = (ex: Exercise) => {
        setEditingExercise(ex);
        setData({
            _method: 'PUT',
            name: ex.name || '',
            instructions: ex.instructions || '',
            video_url: ex.video_url || '',
            is_active: ex.is_active ?? true,
            image: null,
        });

        if (ex.image_path) {
            setPreviewImage(
                ex.image_path.startsWith('/')
                    ? ex.image_path
                    : `/storage/${ex.image_path}`
            );
        } else {
            setPreviewImage(null);
        }

        formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingExercise(null);
        reset();
        setData({
            _method: 'POST',
            name: '',
            instructions: '',
            video_url: '',
            is_active: true,
            image: null,
        });
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const convertToWebP = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            if (file.type === 'image/webp') {
                resolve(file);
                return;
            }
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                                const webpFile = new File([blob], newFileName, { type: 'image/webp' });
                                resolve(webpFile);
                            } else {
                                resolve(file);
                            }
                            URL.revokeObjectURL(objectUrl);
                        },
                        'image/webp',
                        0.85
                    );
                } else {
                    resolve(file);
                }
            };
            img.onerror = () => resolve(file);
            img.src = objectUrl;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const webpFile = await convertToWebP(file);
            setData('image', webpFile);
            setPreviewImage(URL.createObjectURL(webpFile));
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setData((prev) => ({ ...prev, image: null, remove_image: true }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetUrl = editingExercise
            ? route('exercises.update', editingExercise.id)
            : route('exercises.store');

        post(targetUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                handleCancelEdit();
            },
        });
    };

    const handleDelete = (item: Exercise) => {
        if (confirm(`Hapus latihan "${item.name}" secara permanen?`)) {
            router.delete(route('exercises.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredExercises = exercises.filter((ex) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            ex.name?.toLowerCase().includes(q) ||
            ex.instructions?.toLowerCase().includes(q)
        );
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Latihan - DPA Trace" />

            <div className="space-y-4 pb-12" ref={formTopRef}>
                {/* ─── PAGE HEADER WITH SEARCH BAR IN ACTIONS ─── */}
                <PageHeader
                    icon={Dumbbell}
                    title={
                        <>
                            Master Data Latihan{' '}
                            <span className="text-[#84cc16] dark:text-[#b4f031]">Korektif</span>
                        </>
                    }
                    description="Daftar basis data latihan gerak korektif, instruksi pelaksanaan, dan media peraga."
                    actions={
                        <div className="relative w-full sm:w-72">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama latihan, instruksi..."
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
                    }
                />

                {/* ─── SPLIT 2-COLUMN WORKSPACE (KIRI: FORMULIR, KANAN: DAFTAR LATIHAN) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-4 xl:col-span-3): FORMULIR TAMBAH / EDIT LATIHAN
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {editingExercise ? 'Edit Latihan Korektif' : 'Tambah Latihan Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {editingExercise
                                        ? `Mengubah data ${editingExercise.name}`
                                        : 'Registrasi gerakan & instruksi latihan'}
                                </p>
                            </div>

                            {editingExercise && (
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

                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            {/* Foto / Ilustrasi Gerakan */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Foto / Ilustrasi Gerakan
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon size={20} className="text-slate-400" />
                                        )}
                                    </div>

                                    <div className="space-y-1 min-w-0">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="exercise-image-upload"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <label
                                                htmlFor="exercise-image-upload"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10.5px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                                            >
                                                <Camera size={11} />
                                                <span>Pilih Gambar</span>
                                            </label>
                                            {previewImage && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10.5px] font-semibold cursor-pointer"
                                                    title="Hapus gambar"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[9.5px] text-slate-400">
                                            Otomatis dikonversi ke WebP
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nama Latihan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Latihan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Foam Roll Calf, Static Gastrocnemius..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-rose-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Link Video Panduan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Video size={12} className="text-slate-400" />
                                    <span>Link Video Panduan (URL)</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                            </div>

                            {/* Instruksi Pelaksanaan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Instruksi Pelaksanaan
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Jelaskan teknik gerakan, durasi (hold 30 detik), repetisi, dan fokus kontraksi..."
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                            </div>

                            {/* Status Aktif */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="exercise-is-active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-[#84cc16] focus:ring-[#84cc16]"
                                />
                                <label
                                    htmlFor="exercise-is-active"
                                    className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    Latihan aktif (dapat dihubungkan ke DPA)
                                </label>
                            </div>

                            {/* Submit & Cancel Actions */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                {editingExercise && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                                    <span>{editingExercise ? 'Perbarui Latihan' : 'Simpan Latihan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-8 xl:col-span-9): DAFTAR KARTU LATIHAN
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-3">
                        <div className="flex items-center justify-between pb-0.5">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                Daftar Latihan Korektif ({filteredExercises.length})
                            </span>
                            {searchTerm && (
                                <span className="text-[11px] text-slate-400">
                                    Hasil pencarian:{' '}
                                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                                        "{searchTerm}"
                                    </strong>
                                </span>
                            )}
                        </div>

                        {/* Exercise Cards Grid */}
                        {filteredExercises.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md text-center py-10 px-4 shadow-xs space-y-2">
                                <Dumbbell className="h-8 w-8 text-slate-400 mx-auto" />
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    Tidak Ada Data Latihan
                                </h4>
                                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                    Gunakan formulir di sebelah kiri untuk menambahkan gerakan latihan baru.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {filteredExercises.map((item) => {
                                    const isBeingEdited = editingExercise?.id === item.id;
                                    const image = item.image_path
                                        ? item.image_path.startsWith('/')
                                            ? item.image_path
                                            : `/storage/${item.image_path}`
                                        : null;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-md border p-3.5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-2.5 ${
                                                isBeingEdited
                                                    ? 'bg-[#84cc16]/10 dark:bg-[#b4f031]/10 border-[#84cc16] dark:border-[#b4f031] ring-1 ring-[#84cc16] dark:ring-[#b4f031]'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60'
                                            }`}
                                        >
                                            <div className="space-y-2">
                                                {/* Header: Thumbnail + Name + Actions */}
                                                <div className="flex items-start justify-between gap-2.5">
                                                    <div className="flex items-start gap-2.5 min-w-0">
                                                        <div
                                                            onClick={() => setSelectedModalExercise(item)}
                                                            className="w-12 h-12 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-[#84cc16] transition-colors"
                                                        >
                                                            {image ? (
                                                                <img
                                                                    src={image}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-contain p-0.5"
                                                                />
                                                            ) : (
                                                                <Dumbbell size={16} className="text-slate-400" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                                                                {item.name}
                                                            </h4>
                                                            {item.video_url && (
                                                                <a
                                                                    href={item.video_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                                                                >
                                                                    <Video size={10} />
                                                                    <span>Video Panduan</span>
                                                                    <ExternalLink size={9} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditClick(item)}
                                                            className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                                                                isBeingEdited
                                                                    ? 'bg-[#84cc16] text-slate-950 font-bold'
                                                                    : 'text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10'
                                                            }`}
                                                            title="Edit Latihan"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                                                            title="Hapus Latihan"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Instructions snippet */}
                                                {item.instructions ? (
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50/70 dark:bg-slate-950/50 p-2 rounded border border-slate-100 dark:border-slate-800/80">
                                                        {item.instructions}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-400 italic">
                                                        Belum ada instruksi tertulis.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                                    <span>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedModalExercise(item)}
                                                    className="text-[#84cc16] dark:text-[#b4f031] font-bold hover:underline cursor-pointer flex items-center gap-1"
                                                >
                                                    <Eye size={10} />
                                                    <span>Lihat Detail</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── MODAL DETAIL LATIHAN ─── */}
                {selectedModalExercise && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50 duration-150">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-lg w-full p-4 space-y-3 shadow-2xl relative">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Dumbbell size={15} className="text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>{selectedModalExercise.name}</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedModalExercise(null)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {selectedModalExercise.image_path && (
                                <div className="w-full h-48 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                                    <img
                                        src={
                                            selectedModalExercise.image_path.startsWith('/')
                                                ? selectedModalExercise.image_path
                                                : `/storage/${selectedModalExercise.image_path}`
                                        }
                                        alt={selectedModalExercise.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    Instruksi Pelaksanaan:
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                                    {selectedModalExercise.instructions || 'Belum ada instruksi tertulis.'}
                                </p>
                            </div>

                            {selectedModalExercise.video_url && (
                                <div className="pt-1">
                                    <a
                                        href={selectedModalExercise.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <Video size={13} />
                                        <span>Buka Video Peragaan</span>
                                        <ExternalLink size={11} />
                                    </a>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ex = selectedModalExercise;
                                        setSelectedModalExercise(null);
                                        handleEditClick(ex);
                                    }}
                                    className="px-3 py-1.5 rounded-md bg-[#84cc16] dark:bg-[#b4f031] text-white dark:text-slate-950 text-xs font-bold transition-all"
                                >
                                    Edit Latihan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedModalExercise(null)}
                                    className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
