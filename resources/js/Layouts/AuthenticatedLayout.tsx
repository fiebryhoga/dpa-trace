import { PropsWithChildren, ReactNode } from 'react';
import Navbar from '@/Components/Navbar';
import { ShieldCheck } from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-black dark:text-zinc-100 transition-colors duration-200">
            {/* Modular Top Navigation Bar */}
            <Navbar />

            {/* Optional Header Banner */}
            {header && (
                <header className="border-b border-slate-200/80 bg-white/50 dark:border-zinc-800/80 dark:bg-zinc-950/70">
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Institutional Footer */}
            <footer className="w-full border-t border-slate-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-black/90 py-4 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-slate-700 dark:text-zinc-300">Athlete PMA</span>
                        <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
                        <span className="hidden sm:inline">PKO Unesa x Olympus Training Surabaya</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>© {new Date().getFullYear()} PKO Unesa x Olympus Training Surabaya</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
