'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';

import {
    Car,
    MapPin,
    Ticket,
    Wallet,
    Bell,
    Shield,
    Gauge,
    LogOut,
    Menu,
    X,
    Plus,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/trips', label: 'Trips', icon: MapPin },
    { href: '/bookings', label: 'Bookings', icon: Ticket },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
];

const DRIVER_ITEMS = [
    { href: '/driver', label: 'Dashboard', icon: Gauge },
    { href: '/trips/create', label: 'New Trip', icon: Plus },
];

const ADMIN_ITEMS = [
    { href: '/admin', label: 'Admin', icon: Shield },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            api.getUnreadCount().then((res) => {
                const data = res.data as { count: number } | undefined;
                setUnreadCount(data?.count ?? 0);
            }).catch(() => { });
        }
    }, [isAuthenticated, pathname]);

    // Restore token on mount
    useEffect(() => {
        const state = useAuthStore.getState();
        if (state.token) {
            api.setToken(state.token);
        }
    }, []);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const linkClasses = (href: string, mobile = false) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${mobile ? 'w-full' : ''} ${isActive(href)
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
        }`;

    const allNavItems = [
        ...NAV_ITEMS,
        ...(user?.role === 'DRIVER' || user?.role === 'ADMIN' ? DRIVER_ITEMS : []),
        ...(user?.role === 'ADMIN' ? ADMIN_ITEMS : []),
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
                        <Car className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                        Mashaweer
                    </span>
                </Link>

                {/* Desktop Nav Links (hidden on mobile) */}
                <div className="hidden items-center gap-1 md:flex">
                    {isAuthenticated ? (
                        <>
                            {allNavItems.map((item) => (
                                <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </>
                    ) : (
                        <Link href="/trips" className={linkClasses('/trips')}>
                            <MapPin className="h-4 w-4" />
                            Browse Trips
                        </Link>
                    )}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            {/* Notifications */}
                            <Link
                                href="/notifications"
                                className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* Desktop user info */}
                            <div className="hidden items-center gap-2 border-l border-zinc-200 pl-2 md:flex dark:border-zinc-800">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                        {user?.firstName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Guest: show Login + Register on desktop, hidden on mobile */
                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                href="/login"
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-md"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Hamburger toggle — ALWAYS visible on mobile */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="space-y-1">
                        {isAuthenticated ? (
                            <>
                                {allNavItems.map((item) => (
                                    <Link key={item.href} href={item.href} className={linkClasses(item.href, true)}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                                <hr className="my-2 border-zinc-100 dark:border-zinc-800" />
                                {/* User info row */}
                                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-zinc-500">{user?.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/trips" className={linkClasses('/trips', true)}>
                                    <MapPin className="h-4 w-4" />
                                    Browse Trips
                                </Link>
                                <hr className="my-2 border-zinc-100 dark:border-zinc-800" />
                                <Link
                                    href="/login"
                                    className="flex w-full items-center justify-center rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
