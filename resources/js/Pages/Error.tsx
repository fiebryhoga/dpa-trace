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
} from 'lucide-react';

interface ErrorPageProps {
    status?: number;
    message?: string;
}

export default function Error({ status = 404, message }: ErrorPageProps) {
    const errorConfigs: Record<
        number,
        {
            title: string;
            description: string;
            icon: typeof FileQuestion;
            badgeColor: string;
        }
    > = {
        404: {
            title: 'Page Not Found',
            description:
                message ||
                'The athlete profile, assessment record, or page you are looking for does not exist or has been moved.',
            icon: FileQuestion,
            badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
        },
        403: {
            title: 'Access Restricted',
            description:
                message ||
                'You do not have the required permissions to view this biomechanical data or perform this action.',
            icon: ShieldAlert,
            badgeColor: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
        },
        419: {
            title: 'Session Expired',
            description:
                message ||
                'Your security session has timed out due to inactivity. Please refresh the page and sign in again.',
            icon: Clock,
            badgeColor: 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800',
        },
        500: {
            title: 'Internal System Error',
            description:
                message ||
                'An unexpected error occurred while processing biomechanical records. Our technical team has been notified.',
            icon: AlertTriangle,
            badgeColor: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
        },
            503: {
                title: 'Service Temporarily Unavailable',
                description:
                    message ||
                    'Athlete DPA is currently undergoing scheduled maintenance or system upgrade. Please check back shortly.',
                icon: ServerCrash,
                badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
            },
        };

        const config = errorConfigs[status] || errorConfigs[404];
        const IconComponent = config.icon;

        return (
            <div className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 dark:bg-[#09090B] dark:text-zinc-100 transition-colors duration-200 relative selection:bg-[#b4f031] selection:text-black">
                {/* Subtle Top Ambient Gradient */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 bg-gradient-to-b from-[#b4f031]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

                {/* Top Bar */}
                <header className="w-full px-5 sm:px-8 py-5 flex items-center justify-between relative z-20">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <ApplicationLogo className="h-8 w-8 transition-transform group-hover:scale-105" />
                        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                            Athlete <span className="text-[#84cc16] dark:text-[#b4f031]">DPA</span>
                        </span>
                    </Link>

                    <ThemeToggle />
                </header>

                {/* Centered Error Box */}
                <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                    <div className="w-full max-w-md text-center space-y-6">
                        {/* Status Code & Icon Indicator */}
                        <div className="inline-flex flex-col items-center gap-3">
                            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <IconComponent className="h-10 w-10 text-[#84cc16] dark:text-[#b4f031]" />
                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badgeColor}`}
                            >
                                Error {status}
                            </span>
                        </div>

                        {/* Titles */}
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                {config.title}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                {config.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto h-9 text-xs gap-1.5"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Go Back</span>
                            </Button>

                            {status === 419 ? (
                                <Button
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                    className="w-full sm:w-auto h-9 text-xs font-bold gap-1.5 bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26]"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reload Page</span>
                                </Button>
                            ) : (
                                <Link href="/" className="w-full sm:w-auto">
                                    <Button
                                        size="sm"
                                        className="w-full h-9 text-xs font-bold gap-1.5 bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-md shadow-[#b4f031]/25"
                                    >
                                        <Home className="h-3.5 w-3.5" />
                                        <span>Return to Dashboard</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* Minimal Subdued Footer */}
                <footer className="w-full px-4 py-5 text-center text-xs text-zinc-400 dark:text-zinc-600 relative z-10">
                    <p>© {new Date().getFullYear()} PKO Unesa x Olympus Training Surabaya</p>
                </footer>
        </div>
    );
}
