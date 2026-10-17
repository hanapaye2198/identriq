import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className = 'size-6',
    alt = 'IDENTRIQ Logo',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/identriq-mark.png"
            alt={alt}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
