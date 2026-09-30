'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import { MapPin, HelpCircle, Wallet, Ticket, MessageCircle } from 'lucide-react';

const BOTTOM_ITEMS = [
    { href: '/trips', labelKey: 'nav.trips' as const, icon: MapPin },
    { href: '/bookings', labelKey: 'nav.bookings' as const, icon: Ticket },
    { href: '/chat', labelKey: 'nav.chat' as const, icon: MessageCircle },
    { href: '/wallet', labelKey: 'nav.wallet' as const, icon: Wallet },
    { href: '/help', labelKey: 'nav.help' as const, icon: HelpCircle },
];

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    // Only show for passengers (not drivers/admins) or unauthenticated users
    if (user?.role === 'ADMIN') return null;

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/70 backdrop-blur-xl md:hidden dark:border-zinc-800/50 dark:bg-zinc-950/70">
            <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
                {BOTTOM_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition-all duration-300 ${
                                active
                                    ? 'text-[#00C97B]'
                                    : 'text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300'
                            }`}
                        >
                            {active && (
                                <div className="absolute -top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C97B] shadow-[0_0_8px_0_#00C97B]" />
                            )}
                            <item.icon
                                className={`h-5 w-5 transition-transform duration-300 ${
                                    active ? 'scale-110' : 'scale-100'
                                }`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span
                                className={`text-[10px] font-medium transition-all duration-300 ${
                                    active ? 'font-semibold' : ''
                                }`}
                            >
                                {t(item.labelKey)}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area for iOS */}
            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </nav>
    );
}
