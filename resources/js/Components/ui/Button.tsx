import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-emerald-600 text-white font-bold hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500 shadow-xs',
                brand:
                    'bg-emerald-600 text-white font-bold hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500',
                emerald:
                    'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500',
                destructive:
                    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-900',
                outline:
                    'border border-slate-200 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/60 hover:text-emerald-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400',
                secondary:
                    'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/60',
                ghost:
                    'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white',
                link: 'text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400',
            },
            size: {
                default: 'h-8 px-3 py-1.5 text-xs',
                sm: 'h-7 rounded-md px-2.5 text-[11px]',
                lg: 'h-9 rounded-md px-4 text-xs font-bold',
                icon: 'h-8 w-8 p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
                {children}
            </button>
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
