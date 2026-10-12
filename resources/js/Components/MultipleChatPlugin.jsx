import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Phone, X, MessageCircle } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import MessengerIcon from './MessengerIcon';

export default function MultipleChatPlugin({ hideOnMobile = false }) {
    const { global_settings = {} } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Settings
    const status = (global_settings.chat_plugin_status || '').toLowerCase();
    const isEnabled = status === 'enabled' || status === '1' || status === 'true';
    
    const whatsapp = (global_settings.chat_plugin_whatsapp || '').trim();
    const messenger = (global_settings.chat_plugin_messenger || '').trim();
    const phone = (global_settings.chat_plugin_phone || '').trim();

    // If disabled or no channels configured, do not render
    if (!isEnabled || (!whatsapp && !messenger && !phone)) {
        return null;
    }

    // Color logic: if Color Code is empty, get site primary color
    const customColor = (global_settings.chat_plugin_color || '').trim();
    const sitePrimary = global_settings.primary_color || global_settings.theme_primary || '#02BCEF';
    const mainButtonColor = customColor || sitePrimary;

    // Mobile bottom navigation spacing
    const mobileBottomNavEnabled = String(global_settings.mobile_bottom_nav_status || 'enabled') !== 'disabled';
    const bottomClass = (!hideOnMobile && mobileBottomNavEnabled) ? 'bottom-20 md:bottom-6' : 'bottom-6';

    // Format URLs
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;

    const cleanWa = whatsapp.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanWa}`;

    const cleanMessenger = messenger.replace(/^https?:\/\/(www\.)?(m\.)?me\//i, '').replace(/^@/, '').trim();
    const messengerUrl = `https://m.me/${encodeURIComponent(cleanMessenger)}`;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const channels = [
        phone && {
            id: 'phone',
            label: 'Call Us',
            href: phoneUrl,
            icon: Phone,
            bgClass: 'bg-[#FFB800] hover:bg-[#F5A600]',
            iconColor: 'text-white',
            isExternal: false,
        },
        messenger && {
            id: 'messenger',
            label: 'Messenger',
            href: messengerUrl,
            icon: MessengerIcon,
            bgClass: 'bg-[#0084FF] hover:bg-[#0074E0]',
            iconColor: 'text-white',
            isExternal: true,
        },
        whatsapp && {
            id: 'whatsapp',
            label: 'WhatsApp',
            href: waUrl,
            icon: WhatsAppIcon,
            bgClass: 'bg-[#25D366] hover:bg-[#20BD5A]',
            iconColor: 'text-white',
            isExternal: true,
        },
    ].filter(Boolean);

    return (
        <aside
            ref={containerRef}
            aria-label="Contact and Chat Support"
            className={`fixed ${bottomClass} right-4 sm:right-6 z-50 flex flex-col items-end gap-3 select-none`}
        >
            {/* Expanded Action Buttons Stack */}
            <div
                className={`flex flex-col items-end gap-3 transition-all duration-300 ease-out origin-bottom ${
                    isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                        : 'opacity-0 translate-y-6 pointer-events-none scale-90 invisible'
                }`}
            >
                {channels.map((channel) => {
                    const IconComponent = channel.icon;
                    return (
                        <div key={channel.id} className="flex items-center gap-2.5 group">
                            {/* Hover Badge / Tooltip */}
                            <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold text-slate-700 bg-white/95 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                {channel.label}
                            </span>

                            {/* Channel Action Button */}
                            <a
                                href={channel.href}
                                target={channel.isExternal ? '_blank' : undefined}
                                rel={channel.isExternal ? 'noopener noreferrer' : undefined}
                                aria-label={channel.label}
                                className={`grid h-12 w-12 sm:h-13 sm:w-13 place-items-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 ${channel.bgClass} ${channel.iconColor}`}
                            >
                                <IconComponent className="h-6 w-6 sm:h-6 sm:w-6" />
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* Main Floating Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat options' : 'Open chat support'}
                aria-expanded={isOpen}
                className="relative grid h-14 w-14 sm:h-14 sm:w-14 place-items-center rounded-full text-white shadow-[0_8px_25px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black/10"
                style={{ backgroundColor: mainButtonColor }}
            >
                {isOpen ? (
                    <X className="h-7 w-7 transition-transform duration-300 rotate-0 hover:rotate-90" strokeWidth={2.6} />
                ) : (
                    <>
                        {/* Ping / Attention pulse ring when closed */}
                        <span
                            className="absolute -inset-0.5 rounded-full opacity-30 animate-ping pointer-events-none"
                            style={{ backgroundColor: mainButtonColor }}
                        />
                        {/* Chat Speech Bubble Icon */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-7 w-7 transition-transform duration-300"
                            aria-hidden="true"
                        >
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                        </svg>
                    </>
                )}
            </button>
        </aside>
    );
}
