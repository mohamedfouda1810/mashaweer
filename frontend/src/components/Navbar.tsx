'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { useSocket } from '@/providers/SocketProvider';
import { useTranslation } from '@/hooks/useTranslation';

import {
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
    MessageCircle,
    CheckCircle
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { t, locale } = useTranslation();
    const localeLabel = locale === 'ar' ? 'اللغة' : 'Language';
    const previousPathname = useRef(pathname);

    const NAV_ITEMS = [
        { href: '/trips', label: t('nav.trips'), icon: MapPin },
        { href: '/bookings', label: t('nav.bookings'), icon: Ticket },
        { href: '/wallet', label: t('nav.wallet'), icon: Wallet },
        { href: '/chat', label: t('nav.chat'), icon: MessageCircle },
    ];

    const DRIVER_ITEMS = [
        { href: '/driver', label: t('nav.dashboard'), icon: Gauge },
        { href: '/trips/create', label: t('nav.newTrip'), icon: Plus },
    ];

    const ADMIN_ITEMS = [
        { href: '/admin', label: t('nav.admin'), icon: Shield },
    ];

    const closeMobileMenu = useCallback(() => {
        if (mobileOpen) {
            setClosing(true);
            setTimeout(() => {
                setMobileOpen(false);
                setClosing(false);
            }, 250);
        }
    }, [mobileOpen]);

    // A route change closes the drawer. Keep this effect independent of the
    // drawer callback so opening the drawer cannot immediately close it.
    useEffect(() => {
        if (previousPathname.current !== pathname) {
            previousPathname.current = pathname;
            const timer = window.setTimeout(() => {
                setMobileOpen(false);
                setClosing(false);
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeMobileMenu();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileOpen, closeMobileMenu]);

    useEffect(() => {
        if (isAuthenticated) {
            api.getUnreadCount().then((res) => {
                const data = res.data as { count: number } | undefined;
                setUnreadCount(data?.count ?? 0);
            }).catch(() => { });
        }
    }, [isAuthenticated, pathname]);

    // Polling fallback — keep badge updated whenever realtime is unavailable.
    useEffect(() => {
        if (isConnected || !isAuthenticated) return;
        const interval = setInterval(() => {
            api.getUnreadCount().then((res) => {
                const data = res.data as { count: number } | undefined;
                setUnreadCount(data?.count ?? 0);
            }).catch(() => { });
        }, 30000);
        return () => clearInterval(interval);
    }, [isConnected, isAuthenticated]);

    useEffect(() => {
        if (socket && isConnected) {
            const handleNewNotification = () => setUnreadCount((prev) => prev + 1);
            socket.on('newNotification', handleNewNotification);
            
            return () => {
                socket.off('newNotification', handleNewNotification);
            };
        }
    }, [socket, isConnected]);

    const toggleMobile = () => {
        if (mobileOpen) {
            closeMobileMenu();
        } else {
            setMobileOpen(true);
        }
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const linkClasses = (href: string, mobile = false) =>
        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${mobile ? 'w-full' : ''} ${isActive(href)
            ? 'bg-emerald-50/80 text-emerald-600 shadow-[inset_0_-2px_0_0_#00C97B] dark:bg-emerald-500/10 dark:text-emerald-400 dark:shadow-[inset_0_-2px_0_0_#00C97B]'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
        }`;

    const allNavItems = [
        ...NAV_ITEMS,
        ...(user?.role === 'DRIVER' || user?.role === 'ADMIN' ? DRIVER_ITEMS : []),
        ...(user?.role === 'ADMIN' ? ADMIN_ITEMS : []),
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 glass-nav border-b border-slate-200/70 shadow-[0_8px_30px_rgba(10,46,82,0.06)] dark:border-white/10">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Logo & Trust Badge */}
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <Link href="/" className="group flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5">
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                                <Image
                                    src="/mashaweer-logo.png"
                                    alt={t('common.mashaweer')}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-contain"
                                    priority
                                />
                            </div>
                            <span className="truncate text-base font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-navy dark:text-white dark:group-hover:text-emerald-400 sm:text-lg">
                                {t('common.mashaweer')}
                            </span>
                        </Link>
                        {/* Trust Badge - Desktop Only */}
                        <div className="hidden md:flex items-center gap-1 rounded-full bg-emerald-50/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            Verified Platform
                        </div>
                    </div>

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
                                {t('nav.browseTrips')}
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <Link
                                    href="/notifications"
                                    className="relative hidden rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 md:inline-flex"
                                    aria-label={t('nav.notifications')}
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Desktop user info */}
                                <div className="hidden items-center gap-2 border-l border-zinc-200 pl-2 md:flex dark:border-zinc-800">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-xs font-bold text-white shadow-sm">
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
                                        title={t('common.logout')}
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
                                    {t('common.login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-lg bg-gradient-to-r from-navy to-emerald px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#0f3c6a] hover:to-[#00df88] hover:shadow-md"
                                >
                                    {t('common.register')}
                                </Link>
                            </div>
                        )}

                        {/* Hamburger toggle — ALWAYS visible on mobile */}
                        <button
                            type="button"
                            onClick={toggleMobile}
                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
                            aria-label={t('nav.toggleMenu')}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-navigation"
                        >
                            {mobileOpen && !closing ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Slide-from-Right Overlay */}
            {(mobileOpen) && (
                <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label={t('nav.toggleMenu')}>
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label={t('nav.toggleMenu')}
                        className={`absolute inset-0 w-full border-0 bg-black/50 backdrop-blur-sm ${closing ? 'opacity-0' : 'animate-backdrop-fade-in'}`}
                        onClick={closeMobileMenu}
                    />
                    {/* Panel */}
                    <div
                        id="mobile-navigation"
                        className={`absolute inset-y-0 right-0 flex h-full w-[min(21rem,88vw)] flex-col bg-white shadow-2xl dark:bg-zinc-950 ${closing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
                    >
                        {/* Panel Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200/50 px-5 py-4 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/mashaweer-logo.png"
                                    alt={t('common.mashaweer')}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 rounded-full bg-white object-contain ring-1 ring-slate-200"
                                />
                                <span className="text-base font-bold text-zinc-900 dark:text-white">
                                    {t('common.mashaweer')}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={closeMobileMenu}
                                aria-label={t('nav.toggleMenu')}
                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                            <div className="flex-1 px-4 py-4 space-y-1">
                                {isAuthenticated ? (
                                    <>
                                        {allNavItems.map((item, i) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={linkClasses(item.href, true)}
                                                style={{ animationDelay: `${i * 0.05}s` }}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.label}
                                            </Link>
                                        ))}
                                        <Link
                                            href="/notifications"
                                            className={linkClasses('/notifications', true)}
                                        >
                                            <Bell className="h-4 w-4" />
                                            {t('nav.notifications')}
                                            {unreadCount > 0 && (
                                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/trips" className={linkClasses('/trips', true)}>
                                            <MapPin className="h-4 w-4" />
                                            {t('nav.browseTrips')}
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Bottom section */}
                            <div className="space-y-3 border-t border-zinc-200/70 px-4 py-4 dark:border-zinc-800/70">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-zinc-500">{localeLabel}</span>
                                    <LanguageToggle />
                                </div>
                                {isAuthenticated ? (
                                    <>
                                        {/* User info */}
                                        <div className="flex items-center gap-3 rounded-xl bg-zinc-50/80 px-3 py-3 mb-3 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-sm font-bold text-white shadow-sm">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
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
                                            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-950/30"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('common.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            href="/login"
                                            className="flex w-full items-center justify-center rounded-xl border border-zinc-200/80 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50/80 dark:border-zinc-700/80 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                                        >
                                            {t('common.login')}
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-navy to-emerald px-4 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all"
                                        >
                                            {t('common.register')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
