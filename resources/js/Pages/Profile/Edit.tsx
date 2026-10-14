import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { User } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Profil Akun - Athlete PMA" />

            <div className="space-y-6 pb-12">
                <PageHeader
                    icon={User}
                    title={
                        <>
                            Profil <span className="text-emerald-600 dark:text-emerald-400">Pengguna</span>
                        </>
                    }
                    description="Perbarui informasi profil akun administrator, email, dan kata sandi keamanan."
                />

                <div className="max-w-4xl space-y-6">
                    <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 rounded-lg shadow-xs">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 rounded-lg shadow-xs">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 rounded-lg shadow-xs">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
