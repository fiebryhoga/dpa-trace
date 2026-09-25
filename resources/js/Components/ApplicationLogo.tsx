import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function ApplicationLogo({
    className,
    alt = 'DPA Trace Logo',
    src = '/assets/images/logo-dpa.png',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={src}
            alt={alt}
            className={cn('h-9 w-9 object-contain select-none shrink-0', className)}
            {...props}
        />
    );
}
