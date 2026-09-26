import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="relative flex w-full items-center">
                {leftIcon && (
                    <div className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-8.5 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs ring-offset-white file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] focus-visible:border-[#b4f031] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-offset-slate-950 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#b4f031] dark:focus-visible:border-[#b4f031] transition-all',
                        leftIcon && 'pl-8',
                        rightIcon && 'pr-8',
                        error && 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500',
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    },
);
Input.displayName = 'Input';

export { Input };
