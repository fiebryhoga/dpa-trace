import { PropsWithChildren } from 'react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 dark:bg-[#09090B] dark:text-zinc-100 transition-colors duration-200 relative selection:bg-indigo-500 selection:text-white">
            {/* Subtle Top Ambient Gradient Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

            {/* Top Right Theme Toggle */}
            <div className="absolute top-5 right-5 z-30">
                <ThemeToggle />
            </div>

            {/* Main Centered Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-[400px]">
                    {children}
                </div>
            </main>

            {/* Minimal Subdued Footer */}
            <footer className="w-full px-4 py-5 text-center text-xs text-zinc-400 dark:text-zinc-600 relative z-10">
                <p>© {new Date().getFullYear()} Athlete DPA • Dynamic Posture Assessment</p>
            </footer>
        </div>
    );
}
