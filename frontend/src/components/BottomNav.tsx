'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { MapPin, HelpCircle, Wallet, Ticket } from 'lucide-react';

const BOTTOM_ITEMS = [
    { href: '/trips', label: 'Trips', icon: MapPin },
    { href: '/bookings', label: 'Bookings', icon: Ticket },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
    { href: '/help', label: 'Help', icon: HelpCircle },
];

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    // Only show for passengers (not drivers/admins) or unauthenticated users
    if (user?.role === 'ADMIN') return null;

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
                {BOTTOM_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 ${
                                active
                                    ? 'text-mint'
                                    : 'text-slate hover:text-navy dark:text-zinc-500 dark:hover:text-zinc-300'
                            }`}
                        >
                            <item.icon
                                className={`h-5 w-5 transition-transform duration-200 ${
                                    active ? 'scale-110' : ''
                                }`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-mint" />
                            )}
                        </Link>
                    );
                })}
            </div>
            {/* Safe area for iOS */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}
