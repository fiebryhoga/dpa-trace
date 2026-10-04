import { Head, Link } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import { Button } from '@/Components/ui/Button';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    FileQuestion,
    ShieldAlert,
    AlertTriangle,
    ServerCrash,
    Clock,
    ArrowLeft,
    Home,
    RotateCcw,
    Ban,
    Lock,
    ZapOff,
    WifiOff,
    Wrench,
    AlertCircle,
    Compass,
} from 'lucide-react';

interface ErrorPageProps {
    status?: number;
    message?: string;
    description?: string;
}

interface ErrorConfig {
    title: string;
    subtitle: string;
    description: string;
    icon: typeof FileQuestion;
    badgeText: string;
    badgeStyle: string;
    suggestedAction?: 'back' | 'reload' | 'home';
}

const ERROR_CONFIGS: Record<number, ErrorConfig> = {
    400: {
        title: 'Permintaan Tidak Valid',
        subtitle: 'Bad Request (400)',
        description: 'Format data permintaan dari peramban tidak dapat diproses oleh server sistem informasi biomekanika.',
        icon: AlertCircle,
        badgeText: 'HTTP 400 • Bad Request',
        badgeStyle: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        suggestedAction: 'back',
    },
    401: {
        title: 'Autentikasi Diperlukan',
        subtitle: 'Unauthorized Access (401)',
        description: 'Anda perlu masuk ke akun terlebih dahulu untuk dapat mengakses lembar evaluasi dan data atlet ini.',
        icon: Lock,
        badgeText: 'HTTP 401 • Unauthorized',
        badgeStyle: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
        suggestedAction: 'home',
    },
    403: {
        title: 'Akses Terbatas',
        subtitle: 'Forbidden Action (403)',
        description: 'Akun Anda tidak memiliki izin atau wewenang asesor untuk membuka atau mengubah data biomekanika ini.',
        icon: ShieldAlert,
        badgeText: 'HTTP 403 • Forbidden',
        badgeStyle: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        suggestedAction: 'back',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        subtitle: 'Page Not Found (404)',
        description: 'Data atlet, lembar evaluasi PMA, atau tautan yang Anda cari tidak tersedia, telah dipindahkan, atau dihapus.',
        icon: Compass,
        badgeText: 'HTTP 404 • Not Found',
        badgeStyle: 'text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        suggestedAction: 'home',
    },
    405: {
        title: 'Metode Tidak Diizinkan',
        subtitle: 'Method Not Allowed (405)',
        description: 'Metode pengiriman request (seperti GET, POST, atau PUT) tidak didukung untuk alamat tujuan yang diakses.',
        icon: Ban,
        badgeText: 'HTTP 405 • Method Not Allowed',
        badgeStyle: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60',
        suggestedAction: 'back',
    },
    419: {
        title: 'Sesi Telah Kedaluwarsa',
        subtitle: 'Page Expired (419)',
        description: 'Masa berlaku sesi keamanan token form telah berakhir karena tidak ada aktivitas. Silakan muat ulang halaman ini.',
        icon: Clock,
        badgeText: 'HTTP 419 • Page Expired',
        badgeStyle: 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60',
        suggestedAction: 'reload',
    },
    429: {
        title: 'Terlalu Banyak Permintaan',
        subtitle: 'Too Many Requests (429)',
        description: 'Server menerima terlalu banyak aktivitas dalam waktu singkat. Mohon tunggu beberapa saat sebelum mencoba lagi.',
        icon: ZapOff,
        badgeText: 'HTTP 429 • Rate Limit Exceeded',
        badgeStyle: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60',
        suggestedAction: 'reload',
    },
    500: {
        title: 'Kesalahan Server Internal',
        subtitle: 'Internal Server Error (500)',
        description: 'Terjadi gangguan internal saat memproses instruksi atau kalkulasi data. Tim teknis kami telah mencatat peristiwa ini.',
        icon: AlertTriangle,
        badgeText: 'HTTP 500 • Server Error',
        badgeStyle: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        suggestedAction: 'reload',
    },
    502: {
        title: 'Gerbang Server Bermasalah',
        subtitle: 'Bad Gateway (502)',
        description: 'Server menerima respons yang tidak valid dari layanan pendukung peramban saat memproses permintaan Anda.',
        icon: WifiOff,
        badgeText: 'HTTP 502 • Bad Gateway',
        badgeStyle: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60',
        suggestedAction: 'reload',
    },
    503: {
        title: 'Layanan Sedang Pemeliharaan',
        subtitle: 'Service Unavailable (503)',
        description: 'Sistem Informasi PMA sedang dalam proses pembaruan berkala atau pemeliharaan sistem. Silakan kembali dalam beberapa menit.',
        icon: Wrench,
        badgeText: 'HTTP 503 • Under Maintenance',
        badgeStyle: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        suggestedAction: 'reload',
    },
    504: {
        title: 'Batas Waktu Server Habis',
        subtitle: 'Gateway Timeout (504)',
        description: 'Proses kalkulasi atau koneksi jaringan melampaui batas waktu tunggu yang ditentukan oleh server gateway.',
        icon: ServerCrash,
        badgeText: 'HTTP 504 • Gateway Timeout',
        badgeStyle: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        suggestedAction: 'reload',
    },
};

export default function Error({ status = 404, message, description }: ErrorPageProps) {
    const config = ERROR_CONFIGS[status] || {
        title: 'Terjadi Kendala Sistem',
        subtitle: `Error ${status}`,
        description: message || 'Sistem menemukan status respon yang tidak dapat diproses secara normal.',
        icon: FileQuestion,
        badgeText: `HTTP ${status}`,
        badgeStyle: 'text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        suggestedAction: 'home',
    };

    const IconComponent = config.icon;
    const customDesc = description || message || config.description;

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200 relative selection:bg-[#84cc16] selection:text-black font-sans">
            <Head title={`${status} - ${config.title}`} />

            {/* Subtle Ambient Glow and Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-gradient-to-b from-[#84cc16]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

            {/* Header Navigation */}
            <header className="w-full px-5 sm:px-8 py-5 flex items-center justify-between relative z-20 border-b border-slate-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <ApplicationLogo className="h-8 w-8 transition-transform group-hover:scale-105" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                            Sistem PMA <span className="text-[#65a30d] dark:text-[#b4f031]">Olympus</span>
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                            PKO Unesa x Olympus Training
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Error Body */}
            <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
                <div className="w-full max-w-lg mx-auto">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 sm:p-8 shadow-xs text-center space-y-6">
                        {/* Status Badge & Icon */}
                        <div className="inline-flex flex-col items-center gap-3.5">
                            <div className="w-16 h-16 rounded-md bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-center shadow-2xs">
                                <IconComponent className="h-8 w-8 text-[#65a30d] dark:text-[#b4f031]" />
                            </div>

                            <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold border ${config.badgeStyle}`}>
                                {config.badgeText}
                            </span>
                        </div>

                        {/* Title and Explanation */}
                        <div className="space-y-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {config.title}
                            </h1>
                            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                                {config.subtitle}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed pt-1">
                                {customDesc}
                            </p>
                        </div>

                        {/* Diagnostic Box for Technical Clarity */}
                        <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-md border border-slate-200/80 dark:border-zinc-800 text-left flex items-start gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#84cc16] mt-1.5 shrink-0" />
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <p className="font-semibold text-slate-700 dark:text-zinc-300">
                                    Petunjuk Pemecahan Masalah
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                    {status === 404
                                        ? 'Periksa kembali URL tautan atau gunakan menu pencarian atlet pada dasbor utama.'
                                        : status === 405
                                        ? 'Formulir atau permintaan data dikirimkan dengan metode yang tidak sesuai rute sistem.'
                                        : status === 419
                                        ? 'Token keamanan kedaluwarsa. Klik tombol Muat Ulang di bawah untuk memperbarui sesi.'
                                        : status === 403
                                        ? 'Hubungi administrator fisioterapi untuk verifikasi hak akses modul ini.'
                                        : 'Jika kendala berlanjut, hubungi tim pengelola sistem informasi biomekanika.'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto h-9 text-xs gap-1.5 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Kembali</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto h-9 text-xs gap-1.5 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Muat Ulang</span>
                            </Button>

                            <Link href="/" className="w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    className="w-full h-9 text-xs font-bold gap-1.5 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#84cc16] text-slate-950 shadow-xs cursor-pointer"
                                >
                                    <Home className="h-3.5 w-3.5" />
                                    <span>Dasbor Utama</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Subdued Footer */}
            <footer className="w-full px-4 py-4 text-center text-xs text-slate-400 dark:text-zinc-500 border-t border-slate-200/50 dark:border-zinc-900 relative z-10 bg-white/40 dark:bg-zinc-950/40">
                <p>© {new Date().getFullYear()} PKO Unesa x Olympus Training Surabaya • Sistem Informasi Biomekanika</p>
            </footer>
        </div>
    );
}
