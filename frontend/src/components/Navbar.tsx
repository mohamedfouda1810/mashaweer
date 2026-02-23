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
    User,
    Plus,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/trips', label: 'Trips', icon: MapPin },
    { href: '/bookings', label: 'My Bookings', icon: Ticket },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
];

const DRIVER_ITEMS = [
    { href: '/driver', label: 'Dashboard', icon: Gauge },
    { href: '/trips/create', label: 'Create Trip', icon: Plus },
];

const ADMIN_ITEMS = [
    { href: '/admin', label: 'Admin Panel', icon: Shield },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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

    const linkClasses = (href: string) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive(href)
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
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                        <Car className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Mashaweer
                    </span>
                </Link>

                {/* Desktop Nav */}
                {isAuthenticated && (
                    <div className="hidden items-center gap-1 md:flex">
                        {allNavItems.map((item) => (
                            <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}

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
                                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* User menu */}
                            <div className="hidden items-center gap-3 border-l border-zinc-200 pl-3 md:flex dark:border-zinc-800">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {user?.role}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="rounded-lg p-2 text-zinc-500 md:hidden"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-md"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && isAuthenticated && (
                <div className="border-t border-zinc-200 bg-white p-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="space-y-1">
                        {allNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={linkClasses(item.href)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
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
                    </div>
                    {/* User info */}
                    <div className="mt-3 flex items-center gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-zinc-500">{user?.role}</p>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
