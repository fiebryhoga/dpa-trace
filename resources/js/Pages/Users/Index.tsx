import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Shield,
    User as UserIcon,
    Mail,
    Calendar,
    CheckCircle2,
    ShieldCheck,
    Save,
    RotateCcw,
    Lock,
    KeyRound,
    AtSign,
    Camera,
    Upload,
    ImageIcon,
} from 'lucide-react';
import { PageProps, User } from '@/types';

interface UsersIndexProps extends PageProps {
    users: User[];
    filters: {
        search: string;
    };
}

export default function UsersIndex({
    auth,
    users = [],
    filters,
}: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        username: string;
        email: string;
        avatar: File | null;
        remove_avatar: boolean;
        password: string;
        password_confirmation: string;
    }>({
        name: '',
        username: '',
        email: '',
        avatar: null,
        remove_avatar: false,
        password: '',
        password_confirmation: '',
    });

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        clearErrors();
        setAvatarPreview(user.avatar_url || null);
        setData({
            name: user.name,
            username: user.username || '',
            email: user.email || '',
            avatar: null,
            remove_avatar: false,
            password: '',
            password_confirmation: '',
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        clearErrors();
        setAvatarPreview(null);
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({ ...prev, avatar: file, remove_avatar: false }));
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({ ...prev, avatar: null, remove_avatar: true }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            router.post(route('users.update', editingUser.id), {
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
            post(route('users.store'), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    handleCancelEdit();
                },
            });
        }
    };

    const handleDelete = (user: User) => {
        if (user.id === auth.user.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        if (confirm(`Hapus akun admin "${user.name}" (@${user.username}) secara permanen?`)) {
            router.delete(route('users.destroy', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingUser?.id === user.id) {
                        handleCancelEdit();
                    }
                },
            });
        }
    };

    const filteredUsers = users.filter((u) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    });

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
            <Head title="Kelola Admin - DPA Trace" />

            <div className="space-y-5 pb-12 w-full">
                <PageHeader
                    icon={ShieldCheck}
                    title={
                        <>
                            Kelola Akun <span className="text-[#84cc16] dark:text-[#b4f031]">Admin & Penguji</span>
                        </>
                    }
                    description="Manajemen hak akses, kredensial pengguna, dan administrator sistem DPA Trace."
                    actions={
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama, username, email..."
                                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] shadow-2xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    }
                />

                {/* ─── SPLIT 2-COLUMN WORKSPACE (KIRI: FORMULIR, KANAN: DAFTAR) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                    {/* ═══════════════════════════════════════════
                        KOLOM KIRI (lg:col-span-4 xl:col-span-3): FORMULIR TAMBAH / EDIT ADMIN (RINGKAS)
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {editingUser ? 'Edit Akun Admin' : 'Tambah Admin Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    {editingUser
                                        ? `Mengubah data @${editingUser.username}`
                                        : 'Buat kredensial admin baru'}
                                </p>
                            </div>

                            {editingUser && (
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
                            {/* Foto Profil dengan Konversi WebP */}
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-md">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                    Foto profil
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group shrink-0">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
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
                                            title="Ganti foto"
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
                                                <span>{avatarPreview ? 'Ganti foto' : 'Pilih foto'}</span>
                                            </button>
                                            {avatarPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAvatar}
                                                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10.5px] font-semibold transition-colors cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            Format JPG, PNG, WebP (maks. 5MB). Otomatis dikonversi ke WebP.
                                        </p>
                                    </div>
                                </div>
                                {errors.avatar && <p className="text-[10.5px] text-rose-500 mt-1">{errors.avatar}</p>}
                            </div>

                            {/* Nama Lengkap */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Nama lengkap <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Dimas Fiebry, S.Or., M.Kes."
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>
                                {errors.name && <p className="text-[10.5px] text-rose-500">{errors.name}</p>}
                            </div>

                            {/* Username */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Username <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <AtSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="admin_dpa"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>
                                {errors.username && <p className="text-[10.5px] text-rose-500">{errors.username}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="admin@unesa.ac.id"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>
                                {errors.email && <p className="text-[10.5px] text-rose-500">{errors.email}</p>}
                            </div>

                            {/* Password & Password Confirmation */}
                            <div className="space-y-1 pt-0.5">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    {editingUser ? 'Password baru' : 'Password'}{' '}
                                    {!editingUser && <span className="text-rose-500">*</span>}
                                </label>
                                <div className="relative">
                                    <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        placeholder={editingUser ? 'Kosongkan jika tetap' : 'Min. 6 karakter'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>
                                {errors.password && <p className="text-[10.5px] text-rose-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Konfirmasi password
                                </label>
                                <div className="relative">
                                    <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="password"
                                        placeholder="Ulangi password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031]"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                {editingUser && (
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
                                    <span>{editingUser ? 'Perbarui Akun' : 'Simpan Akun Admin'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ═══════════════════════════════════════════
                        KOLOM KANAN (lg:col-span-8 xl:col-span-9): DAFTAR AKUN ADMIN
                       ═══════════════════════════════════════════ */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-3">
                        <div className="flex items-center justify-between pb-0.5">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                Daftar Administrator ({users.length})
                            </span>
                            {searchTerm && (
                                <span className="text-[11px] text-slate-400">
                                    Hasil pencarian: <strong className="text-slate-700 dark:text-slate-300 font-semibold">"{searchTerm}"</strong>
                                </span>
                            )}
                        </div>

                        {/* Admin Table Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-2.5 px-3.5">Administrator</th>
                                            <th className="py-2.5 px-3.5">Username</th>
                                            <th className="py-2.5 px-3.5">Email</th>
                                            <th className="py-2.5 px-3.5">Terdaftar</th>
                                            <th className="py-2.5 px-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                                                    Tidak ada akun admin yang cocok.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => {
                                                const isCurrentUser = u.id === auth.user.id;
                                                const isBeingEdited = editingUser?.id === u.id;

                                                return (
                                                    <tr
                                                        key={u.id}
                                                        className={`transition-colors ${
                                                            isBeingEdited
                                                                ? 'bg-[#84cc16]/10 dark:bg-[#b4f031]/10'
                                                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                                                        }`}
                                                    >
                                                        {/* Name & Avatar */}
                                                        <td className="py-2.5 px-3.5">
                                                            <div className="flex items-center gap-2">
                                                                {u.avatar_url ? (
                                                                    <img
                                                                        src={u.avatar_url}
                                                                        alt={u.name}
                                                                        className="h-6 w-6 min-w-[24px] min-h-[24px] aspect-square rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 min-w-[24px] min-h-[24px] aspect-square rounded-full bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0 leading-none">
                                                                        {u.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                                                                            {u.name}
                                                                        </span>
                                                                        {isCurrentUser && (
                                                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#84cc16]/20 text-[#84cc16] dark:text-[#b4f031] border border-[#84cc16]/30">
                                                                                Anda
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Username */}
                                                        <td className="py-2.5 px-3.5">
                                                            <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10.5px]">
                                                                @{u.username || '-'}
                                                            </span>
                                                        </td>

                                                        {/* Email */}
                                                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                                                            {u.email ? (
                                                                <span className="flex items-center gap-1 text-[11px]">
                                                                    <Mail size={11} className="text-slate-400" />
                                                                    <span>{u.email}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                                            )}
                                                        </td>

                                                        {/* Registered Date */}
                                                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">
                                                            <span className="flex items-center gap-1 text-[10.5px]">
                                                                <Calendar size={11} className="text-slate-400" />
                                                                <span>{formatDate(u.created_at)}</span>
                                                            </span>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-2.5 px-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditClick(u)}
                                                                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                                                        isBeingEdited
                                                                            ? 'bg-[#84cc16] text-slate-950 font-bold'
                                                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#84cc16]'
                                                                    }`}
                                                                    title="Edit admin"
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>

                                                                {!isCurrentUser && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(u)}
                                                                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                                        title="Hapus admin"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
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
