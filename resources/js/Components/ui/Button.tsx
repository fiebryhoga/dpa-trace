import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-[#b4f031] text-slate-950 font-bold hover:bg-[#a2dd26] dark:bg-[#b4f031] dark:text-slate-950 dark:hover:bg-[#a2dd26]',
                brand:
                    'bg-[#b4f031] text-slate-950 font-bold hover:bg-[#a2dd26] dark:bg-[#b4f031] dark:text-slate-950',
                emerald:
                    'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400',
                destructive:
                    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-900',
                outline:
                    'border border-slate-200 bg-white text-slate-800 hover:border-[#b4f031] hover:bg-[#b4f031]/10 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#b4f031]/60 dark:hover:bg-[#b4f031]/10 dark:hover:text-[#b4f031]',
                secondary:
                    'bg-[#b4f031]/15 text-slate-900 border border-[#b4f031]/30 hover:bg-[#b4f031]/25 dark:bg-[#b4f031]/15 dark:text-[#b4f031] dark:border-[#b4f031]/30 dark:hover:bg-[#b4f031]/25',
                ghost:
                    'text-slate-700 hover:bg-[#b4f031]/15 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#b4f031]/15 dark:hover:text-[#b4f031]',
                link: 'text-slate-900 underline-offset-4 hover:underline dark:text-[#b4f031]',
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
