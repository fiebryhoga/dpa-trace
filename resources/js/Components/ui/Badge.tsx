import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none select-none',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-[#b4f031] text-slate-950 font-bold shadow-sm',
                brand:
                    'border-[#b4f031]/40 bg-[#b4f031]/15 text-slate-950 font-bold dark:border-[#b4f031]/30 dark:bg-[#b4f031]/10 dark:text-[#b4f031]',
                emerald:
                    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300',
                teal:
                    'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/60 dark:text-teal-300',
                indigo:
                    'border-[#b4f031]/40 bg-[#b4f031]/15 text-slate-950 font-bold dark:border-[#b4f031]/30 dark:bg-[#b4f031]/10 dark:text-[#b4f031]',
                purple:
                    'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/60 dark:text-teal-300',
                violet:
                    'border-[#b4f031]/40 bg-[#b4f031]/15 text-slate-950 font-bold dark:border-[#b4f031]/30 dark:bg-[#b4f031]/10 dark:text-[#b4f031]',
                sky:
                    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300',
                secondary:
                    'border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200',
                destructive:
                    'border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-300',
                outline:
                    'text-slate-900 border-slate-200 dark:text-slate-100 dark:border-slate-800',
                success:
                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300',
                warning:
                    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300',
                muted:
                    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
