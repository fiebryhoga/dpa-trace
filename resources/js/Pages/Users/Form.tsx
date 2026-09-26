import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Save,
    Shield,
    User as UserIcon,
    Mail,
    Lock,
    KeyRound,
    AtSign,
    ShieldCheck,
} from 'lucide-react';
import { PageProps, User } from '@/types';

interface UserFormProps extends PageProps {
    user?: User | null;
    isEdit?: boolean;
}

export default function UserForm({
    auth,
    user,
    isEdit = false,
}: UserFormProps) {
    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
    }>({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && user) {
            put(route('users.update', user.id));
        } else {
            post(route('users.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Admin - ${data.name}` : 'Tambah Admin Baru'} />

            <div className="space-y-6 pb-12 max-w-3xl">
                <PageHeader
                    icon={ShieldCheck}
                    backUrl={route('users.index')}
                    backLabel="Kembali ke Daftar Admin"
                    title={isEdit ? 'Edit Akun Administrator' : 'Tambah Administrator Baru'}
                    description={
                        isEdit
                            ? 'Perbarui kredensial dan detail akun administrator DPA Trace.'
                            : 'Buat akun login baru untuk administrator atau penguji biomekanika.'
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('users.index')}
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
                                <span>{isEdit ? 'Perbarui Akun' : 'Simpan Akun'}</span>
                            </button>
                        </div>
                    }
                />

                {/* ─── FORM CARD ─── */}
                <form onSubmit={submit} className="bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Shield size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                            Informasi Kredensial Administrator
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Nama Lengkap */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <UserIcon size={12} className="text-slate-400" />
                                <span>Nama Lengkap <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dr. Budi Santoso, M.Kes"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <AtSign size={12} className="text-slate-400" />
                                <span>Username Login <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: budi_admin"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                required
                            />
                            {errors.username && <p className="text-xs text-rose-500">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Mail size={12} className="text-slate-400" />
                                <span>Alamat Email (Opsional)</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Contoh: budi@olympus.unesa.ac.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                            />
                            {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Lock size={12} className="text-slate-400" />
                                    <span>
                                        Password {isEdit ? '(Kosongkan jika tidak diubah)' : <span className="text-rose-500">*</span>}
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                    required={!isEdit}
                                />
                                {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <KeyRound size={12} className="text-slate-400" />
                                    <span>Konfirmasi Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder={isEdit ? '••••••••' : 'Ulangi password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#b4f031] placeholder:text-slate-400 transition-all"
                                    required={!isEdit && !!data.password}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={route('users.index')}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save size={15} />
                            <span>{isEdit ? 'Perbarui Akun Admin' : 'Simpan Akun Admin'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
