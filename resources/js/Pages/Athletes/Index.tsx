import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Users,
    Search,
    Activity,
    ChevronRight,
    X,
    Calendar,
    Ruler,
    Weight,
    Flame,
    Edit2,
    Save,
    RotateCcw,
    Camera,
    Upload,
    ShieldAlert,
    Dumbbell,
    Award,
    Eye,
} from 'lucide-react';

interface AthleteItem {
    id: number;
    athlete_code: string;
    full_name: string;
    nickname?: string;
    gender: 'L' | 'P';
    age?: number;
    calculated_age?: number;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    bmi_category?: string;
    dominant_side?: string;
    injury_history?: string;
    phone_number?: string;
    photo_path?: string;
    photo_url?: string;
    is_active: boolean;
    dpa_assessments_count: number;
    dpa_assessments: Array<{
        id: number;
        assessment_date: string;
    }>;
}

interface IndexProps {
    athletes: {
        data: AthleteItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
    filters: {
        search: string;
    };
    totalCount: number;
    activeCount: number;
}

export default function AthleteIndex({
    athletes,
    filters,
    totalCount,
    activeCount,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingAthlete, setEditingAthlete] = useState<AthleteItem | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Hook for Create / Update Athlete
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        athlete_code: string;
        full_name: string;
        nickname: string;
        gender: 'L' | 'P';
        age: string;
        height_cm: string;
        weight_kg: string;
        dominant_side: 'R' | 'L' | 'Bilateral';
        injury_history: string;
        phone_number: string;
        photo: File | null;
        remove_photo: boolean;
        is_active: boolean;
    }>({
        athlete_code: `DPA-${new Date().getFullYear()}-${String(totalCount + 1).padStart(3, '0')}`,
        full_name: '',
        nickname: '',
        gender: 'L',
        age: '20',
        height_cm: '',
        weight_kg: '',
        dominant_side: 'R',
        injury_history: '',
        phone_number: '',
        photo: null,
        remove_photo: false,
        is_active: true,
    });

    const handleEditClick = (ath: AthleteItem) => {
        setEditingAthlete(ath);
        clearErrors();
        setPhotoPreview(ath.photo_url || null);
        setData({
            athlete_code: ath.athlete_code,
            full_name: ath.full_name,
            nickname: ath.nickname || '',
            gender: ath.gender,
            age: ath.age ? String(ath.age) : '',
            height_cm: ath.height_cm ? String(ath.height_cm) : '',
            weight_kg: ath.weight_kg ? String(ath.weight_kg) : '',
            dominant_side: (ath.dominant_side as 'R' | 'L' | 'Bilateral') || 'R',
            injury_history: ath.injury_history || '',
            phone_number: ath.phone_number || '',
            photo: null,
            remove_photo: false,
            is_active: ath.is_active ?? true,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingAthlete(null);
        clearErrors();
        setPhotoPreview(null);
        reset();
        setData('athlete_code', `DPA-${new Date().getFullYear()}-${String(totalCount + 1).padStart(3, '0')}`);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
            const objectUrl = URL.createObjectURL(file);
            setPhotoPreview(objectUrl);
        }
    };

    const handleRemovePhoto = () => {
        setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAthlete) {
            router.post(route('athletes.update', editingAthlete.id), {
                _method: 'put',
                ...data,
            }, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    handleCancelEdit();
                },
            });
        } else {
            post(route('athletes.store'), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    handleCancelEdit();
                },
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('athletes.index'),
            { search },
            { preserveState: true, replace: true },
        );
    };

    // Live BMI calculation preview
    const calculatedBmi = () => {
        const h = parseFloat(data.height_cm);
        const w = parseFloat(data.weight_kg);
        if (h > 0 && w > 0) {
            const hMeter = h / 100;
            return (w / (hMeter * hMeter)).toFixed(1);
        }
        return null;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Atlet - DPA Trace" />

            <div className="space-y-5 pb-12 w-full">
                <PageHeader
                    icon={Users}
                    title={
                        <>
                            Kelola Data <span className="text-[#84cc16] dark:text-[#b4f031]">Atlet</span>
                        </>
                    }
                    description="Manajemen profil atlet terpadu, data antropometri, dan riwayat Dynamic Posture Assessment."
                    actions={
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama atlet, kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] shadow-2xs"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('athletes.index'), { search: '' }, { preserveState: true });
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </form>
                    }
                />

                {/* ─── SPLIT 2-COLUMN WORKSPACE (KIRI: FORMULIR, KANAN: DAFTAR KARTU ATLET) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-4 xl:col-span-3): FORMULIR TAMBAH / EDIT ATLET (RINGKAS)
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {editingAthlete ? 'Edit Biodata Atlet' : 'Tambah Atlet Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {editingAthlete
                                        ? `Mengubah data ${editingAthlete.full_name}`
                                        : 'Registrasi atlet & antropometri'}
                                </p>
                            </div>

                            {editingAthlete && (
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
                            {/* Foto Profil Atlet dengan Konversi WebP */}
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-md">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                    Foto profil atlet
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group shrink-0">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="h-12 w-12 rounded-full object-cover aspect-square border-2 border-[#84cc16] dark:border-[#b4f031] shadow-2xs"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm aspect-square border border-slate-300 dark:border-slate-700">
                                                <Camera size={18} />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                            title="Pilih foto"
                                        >
                                            <Camera size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2 py-1 rounded bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10.5px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Upload size={10} />
                                                <span>{photoPreview ? 'Ganti foto' : 'Pilih foto'}</span>
                                            </button>
                                            {photoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10.5px] font-semibold transition-colors cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            JPG, PNG, WebP (maks. 5MB). Otomatis dikonversi ke WebP.
                                        </p>
                                    </div>
                                </div>
                                {errors.photo && <p className="text-[10.5px] text-rose-500 mt-1">{errors.photo}</p>}
                            </div>

                            {/* Kode Atlet & Jenis Kelamin */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Kode atlet <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="DPA-2026-001"
                                        value={data.athlete_code}
                                        onChange={(e) => setData('athlete_code', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                    {errors.athlete_code && <p className="text-[10.5px] text-rose-500">{errors.athlete_code}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Gender <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 h-[31px]">
                                        <button
                                            type="button"
                                            onClick={() => setData('gender', 'L')}
                                            className={`rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                                data.gender === 'L'
                                                    ? 'bg-blue-600 text-white shadow-2xs'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            Laki-laki
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('gender', 'P')}
                                            className={`rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                                data.gender === 'P'
                                                    ? 'bg-rose-600 text-white shadow-2xs'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            Perempuan
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Nama Lengkap & Nama Panggilan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Dimas Arya Pratama"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                />
                                {errors.full_name && <p className="text-[10.5px] text-rose-500">{errors.full_name}</p>}
                            </div>

                            {/* Usia & Sisi Dominan */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Usia (tahun) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        required
                                        placeholder="20"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                    {errors.age && <p className="text-[10.5px] text-rose-500">{errors.age}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        Sisi dominan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.dominant_side}
                                        onChange={(e) => setData('dominant_side', e.target.value as any)}
                                        className="w-full px-2 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    >
                                        <option value="R">Kanan (Right)</option>
                                        <option value="L">Kiri (Left)</option>
                                        <option value="Bilateral">Bilateral (Keduanya)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Antropometri: Tinggi & Berat Badan */}
                            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-md">
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                        Tinggi (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="180"
                                        value={data.height_cm}
                                        onChange={(e) => setData('height_cm', e.target.value)}
                                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>

                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                        Berat (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="75"
                                        value={data.weight_kg}
                                        onChange={(e) => setData('weight_kg', e.target.value)}
                                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>

                                <div className="space-y-0.5 text-center flex flex-col justify-center">
                                    <span className="text-[10px] font-semibold text-slate-500">
                                        BMI Est.
                                    </span>
                                    <span className="text-xs font-bold text-[#84cc16] dark:text-[#b4f031]">
                                        {calculatedBmi() || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Riwayat cedera (opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Contoh: ACL sprain lutut kanan 2024..."
                                    value={data.injury_history}
                                    onChange={(e) => setData('injury_history', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                {editingAthlete && (
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
                                    <span>{editingAthlete ? 'Perbarui Data Atlet' : 'Simpan Data Atlet'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-8 xl:col-span-9): DAFTAR ATLET
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-3">
                        <div className="flex items-center justify-between pb-0.5">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                Daftar Atlet ({athletes.total})
                            </span>
                            {search && (
                                <span className="text-[11px] text-slate-400">
                                    Hasil pencarian: <strong className="text-slate-700 dark:text-slate-300 font-semibold">"{search}"</strong>
                                </span>
                            )}
                        </div>

                        {/* Athletes Grid List */}
                        {athletes.data.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md text-center py-10 px-4 shadow-xs space-y-2">
                                <Users className="h-8 w-8 text-slate-400 mx-auto" />
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    Tidak Ada Data Atlet
                                </h4>
                                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                    Gunakan formulir di sebelah kiri untuk menambahkan atlet baru ke sistem DPA.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                {athletes.data.map((ath) => {
                                    const lastAssessment = ath.dpa_assessments?.[0];
                                    const isBeingEdited = editingAthlete?.id === ath.id;

                                    return (
                                        <div
                                            key={ath.id}
                                            className={`rounded-md border p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-3 ${
                                                isBeingEdited
                                                    ? 'bg-[#84cc16]/10 dark:bg-[#b4f031]/10 border-[#84cc16] dark:border-[#b4f031] ring-1 ring-[#84cc16] dark:ring-[#b4f031]'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#84cc16]/60 dark:hover:border-[#b4f031]/60'
                                            }`}
                                        >
                                            {/* Header: Foto, Nama, Info Dasar & Quick Edit */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {ath.photo_url ? (
                                                        <img
                                                            src={ath.photo_url}
                                                            alt={ath.full_name}
                                                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                                            {ath.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <Link
                                                            href={route('athletes.show', ath.id)}
                                                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#84cc16] dark:hover:text-[#b4f031] transition-colors truncate block"
                                                        >
                                                            {ath.full_name}
                                                        </Link>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">
                                                            <span>{ath.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                            {ath.age && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{ath.age} thn</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(ath)}
                                                    className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                                                        isBeingEdited
                                                            ? 'bg-[#84cc16] text-slate-950 font-bold'
                                                            : 'text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:bg-[#84cc16]/10 dark:hover:bg-[#b4f031]/10'
                                                    }`}
                                                    title="Edit Data Atlet"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                            </div>

                                            {/* Anthropometry & Dominance Metric Box */}
                                            <div className="grid grid-cols-4 gap-1 py-2 px-2.5 rounded-md bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-center">
                                                <div>
                                                    <span className="block text-[9.5px] text-slate-400 font-medium">Tinggi</span>
                                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                        {ath.height_cm ? `${ath.height_cm} cm` : '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9.5px] text-slate-400 font-medium">Berat</span>
                                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                        {ath.weight_kg ? `${ath.weight_kg} kg` : '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9.5px] text-slate-400 font-medium">BMI</span>
                                                    <span className="text-[11px] font-bold text-[#84cc16] dark:text-[#b4f031]">
                                                        {ath.bmi ?? '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9.5px] text-slate-400 font-medium">Dominan</span>
                                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                        {ath.dominant_side === 'R' ? 'Kanan' : ath.dominant_side === 'L' ? 'Kiri' : 'Bilateral'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer: Sesi DPA & Action Buttons */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                    <Activity size={12} className={ath.dpa_assessments_count > 0 ? 'text-[#84cc16] dark:text-[#b4f031]' : 'text-slate-400'} />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10.5px]">
                                                        {ath.dpa_assessments_count} Sesi DPA
                                                    </span>
                                                    {lastAssessment && (
                                                        <span className="text-[9.5px] text-slate-400">
                                                            ({formatDate(lastAssessment.assessment_date)})
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={route('athletes.show', ath.id)}
                                                        className="px-2.5 py-1 rounded text-[10.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
                                                    >
                                                        Detail
                                                    </Link>
                                                    <Link
                                                        href={route('dpa.athletes.show', ath.id)}
                                                        className="px-2.5 py-1 rounded text-[10.5px] font-bold text-white dark:text-slate-950 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] transition-colors shadow-2xs"
                                                    >
                                                        + Uji DPA
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {athletes.links && athletes.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 pt-3">
                                {athletes.links.map((link, idx) => (
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                                link.active
                                                    ? 'bg-[#84cc16] dark:bg-[#b4f031] text-white dark:text-slate-950 font-bold'
                                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#84cc16]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 text-xs text-slate-400"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
