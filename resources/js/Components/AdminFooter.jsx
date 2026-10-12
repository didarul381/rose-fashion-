import React from 'react';

/**
 * Reusable Admin Footer Component
 */
export default function AdminFooter({ theme, storeName = 'Online Store' }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">{storeName} Admin Suite</span>
                <span>© {currentYear} All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
                <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">v1.0.0</span>
                <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-600 transition-colors">System Health</a>
            </div>
        </footer>
    );
}
