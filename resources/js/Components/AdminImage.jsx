import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * AdminImage - A reusable image component that gracefully falls back to a
 * placeholder when an image is missing, null, or fails to load.
 *
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes for the <img> element
 * @param {string} wrapperClassName - Additional CSS classes for the wrapper <div>
 * @param {'sm'|'md'|'lg'} size - Size of the fallback placeholder icon (default: 'md')
 */
export default function AdminImage({ src, alt = '', className = '', wrapperClassName = '', size = 'md' }) {
    const [hasError, setHasError] = useState(!src);

    const iconSizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-slate-100 text-slate-300 ${wrapperClassName || className}`}
                title={alt || 'No image'}
            >
                <ImageOff className={iconSizeMap[size] || iconSizeMap.md} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
