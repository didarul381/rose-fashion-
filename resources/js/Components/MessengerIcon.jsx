import React from 'react';

export default function MessengerIcon({ className = 'h-5 w-5', ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.913 1.455 5.518 3.735 7.195V22l3.418-1.876c.904.25 1.862.385 2.847.385 5.523 0 10-4.145 10-9.251C22 6.145 17.523 2 12 2zm1.066 12.441-2.734-2.915-5.333 2.915 5.867-6.226 2.8 2.915 5.267-2.915-5.867 6.226z" />
        </svg>
    );
}
