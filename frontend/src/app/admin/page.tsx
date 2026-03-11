'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User, AdminAlert, DepositRequest } from '@/types';
import {
    Shield,
    Users,
    AlertTriangle,
    CreditCard,
    Loader2,
    CheckCircle2,
    XCircle,
    Ban,
    UserCheck,
    BarChart3,
    TrendingUp,
    Car,
    Ticket,
    User as UserIcon,
} from 'lucide-react';

type Tab = 'overview' | 'alerts' | 'users' | 'deposits' | 'drivers' | 'trips';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [tab, setTab] = useState<Tab>('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Dashboard stats
    const [stats, setStats] = useState<any>(null);
    // Alerts
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [showResolved, setShowResolved] = useState(false);
    // Users
    const [users, setUsers] = useState<User[]>([]);
    const [userRole, setUserRole] = useState('');
    // Deposits
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    // Drivers
    const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
    // Trips
    const [allTrips, setAllTrips] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (tab === 'overview') {
                const res = await api.getAdminDashboard();
                setStats(res.data);
            } else if (tab === 'alerts') {
                const res = await api.getAdminAlerts(showResolved);
                setAlerts((res.data as AdminAlert[]) || []);
            } else if (tab === 'users') {
                const res = await api.getUsers(userRole || undefined);
                setUsers((res.data as User[]) || []);
            } else if (tab === 'deposits') {
                const res = await api.getPendingDeposits();
                setDeposits((res.data as DepositRequest[]) || []);
            } else if (tab === 'drivers') {
                const res = await api.getPendingDrivers();
                setPendingDrivers((res.data as any[]) || []);
            } else if (tab === 'trips') {
                const res = await api.getAllTripsAdmin();
                setAllTrips((res.data as any[]) || []);
            }
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    }, [tab, showResolved, userRole]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') loadData();
    }, [isAuthenticated, user?.role, loadData]);

    const handleBan = async (userId: string) => {
        const reason = prompt('Ban reason (optional):');
        setActionLoading(userId);
        try {
            await api.banUser(userId, reason || undefined);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleUnban = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.unbanUser(userId);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleApproveDeposit = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approveDeposit(id);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleRejectDeposit = async (id: string) => {
        const reason = prompt('Rejection reason (optional):');
        setActionLoading(id);
        try {
            await api.rejectDeposit(id, reason || undefined);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleApproveDriver = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approveDriver(id);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleDeclineDriver = async (id: string) => {
        if (!confirm('Are you sure you want to decline this driver application?')) return;
        setActionLoading(id);
        try {
            await api.declineDriver(id);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setActionLoading(userId);
        try {
            await api.changeUserRole(userId, newRole);
            loadData();
        } catch { }
        setActionLoading(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
        { key: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
        { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
        { key: 'deposits', label: 'Deposits', icon: <CreditCard className="h-4 w-4" /> },
        { key: 'drivers', label: 'Driver Apps', icon: <Car className="h-4 w-4" /> },
        { key: 'trips', label: 'Trips', icon: <Ticket className="h-4 w-4" /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage the platform</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.key
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            {t.icon}
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW */}
                        {tab === 'overview' && stats && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard icon={<Users className="h-5 w-5 text-teal-600" />} label="Total Users" value={stats.totalUsers ?? '—'} bg="bg-teal-100 dark:bg-teal-900/30" />
                                <StatCard icon={<Car className="h-5 w-5 text-emerald-600" />} label="Total Drivers" value={stats.totalDrivers ?? '—'} bg="bg-emerald-100 dark:bg-emerald-900/30" />
                                <StatCard icon={<Ticket className="h-5 w-5 text-indigo-600" />} label="Total Trips" value={stats.totalTrips ?? '—'} bg="bg-indigo-100 dark:bg-indigo-900/30" />
                                <StatCard icon={<AlertTriangle className="h-5 w-5 text-teal-600" />} label="Open Alerts" value={stats.openAlerts ?? '—'} bg="bg-teal-100 dark:bg-teal-900/30" />
                                <StatCard icon={<TrendingUp className="h-5 w-5 text-pink-600" />} label="Active Trips" value={stats.activeTrips ?? '—'} bg="bg-pink-100 dark:bg-pink-900/30" />
                                <StatCard icon={<CreditCard className="h-5 w-5 text-violet-600" />} label="Pending Deposits" value={stats.pendingDeposits ?? '—'} bg="bg-violet-100 dark:bg-violet-900/30" />
                                <StatCard icon={<Ticket className="h-5 w-5 text-teal-600" />} label="Total Bookings" value={stats.totalBookings ?? '—'} bg="bg-teal-100 dark:bg-teal-900/30" />
                                <StatCard icon={<Ban className="h-5 w-5 text-red-600" />} label="Banned Users" value={stats.bannedUsers ?? '—'} bg="bg-red-100 dark:bg-red-900/30" />
                            </div>
                        )}

                        {/* ALERTS */}
                        {tab === 'alerts' && (
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <label className="text-sm text-zinc-500">
                                        <input
                                            type="checkbox"
                                            checked={showResolved}
                                            onChange={(e) => setShowResolved(e.target.checked)}
                                            className="mr-2"
                                        />
                                        Show resolved
                                    </label>
                                </div>
                                {alerts.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No alerts</div>
                                ) : (
                                    <div className="space-y-3">
                                        {alerts.map((alert) => (
                                            <div key={alert.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className={`h-4 w-4 ${alert.isResolved ? 'text-zinc-400' : 'text-teal-500'}`} />
                                                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                                {alert.type.replace(/_/g, ' ')}
                                                            </span>
                                                            {alert.isResolved && (
                                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                    Resolved
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{alert.message}</p>
                                                        <p className="mt-1 text-xs text-zinc-400">
                                                            {new Date(alert.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* USERS */}
                        {tab === 'users' && (
                            <div>
                                <div className="mb-4">
                                    <select
                                        value={userRole}
                                        onChange={(e) => setUserRole(e.target.value)}
                                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="PASSENGER">Passengers</option>
                                        <option value="DRIVER">Drivers</option>
                                        <option value="ADMIN">Admins</option>
                                    </select>
                                </div>
                                {users.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No users found</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Email</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                                                    <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                                {users.map((u) => (
                                                    <tr key={u.id}>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                                            {u.firstName} {u.lastName}
                                                        </td>
                                                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={u.role}
                                                                onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                                disabled={actionLoading === u.id}
                                                                className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${u.role === 'ADMIN' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400' :
                                                                    u.role === 'DRIVER' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                                        'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/30 dark:bg-teal-900/20 dark:text-teal-400'
                                                                    }`}
                                                            >
                                                                <option value="PASSENGER">Passenger</option>
                                                                <option value="DRIVER">Driver</option>
                                                                <option value="ADMIN">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {u.isBanned ? (
                                                                <span className="text-red-600 dark:text-red-400">Banned</span>
                                                            ) : (
                                                                <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {u.isBanned ? (
                                                                <button
                                                                    onClick={() => handleUnban(u.id)}
                                                                    disabled={actionLoading === u.id}
                                                                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                >
                                                                    <UserCheck className="h-3 w-3" />
                                                                    Unban
                                                                </button>
                                                            ) : u.role !== 'ADMIN' ? (
                                                                <button
                                                                    onClick={() => handleBan(u.id)}
                                                                    disabled={actionLoading === u.id}
                                                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
                                                                >
                                                                    <Ban className="h-3 w-3" />
                                                                    Ban
                                                                </button>
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DEPOSITS */}
                        {tab === 'deposits' && (
                            <div>
                                {deposits.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No pending deposits</div>
                                ) : (
                                    <div className="space-y-3">
                                        {deposits.map((d) => (
                                            <div key={d.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                            {d.amount} EGP via {d.paymentMethod.replace('_', ' ')}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            User: {(d as any).user?.firstName ? `${(d as any).user.firstName} ${(d as any).user.lastName}` : d.userId.slice(0, 8) + '...'} • {new Date(d.createdAt).toLocaleString()}
                                                        </p>
                                                        {d.receiptUrl && (
                                                            <a
                                                                href={d.receiptUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-1 inline-block text-xs text-teal-600 hover:underline"
                                                            >
                                                                View Receipt
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApproveDeposit(d.id)}
                                                            disabled={actionLoading === d.id}
                                                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectDeposit(d.id)}
                                                            disabled={actionLoading === d.id}
                                                            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DRIVERS */}
                        {tab === 'drivers' && (
                            <div>
                                {pendingDrivers.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No pending driver applications</div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingDrivers.map((d) => (
                                            <div key={d.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                                <div className="p-5">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="flex items-start gap-4">
                                                            {d.personalPhotoUrl ? (
                                                                <img src={d.personalPhotoUrl} alt="Driver" className="h-16 w-16 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                                    <UserIcon className="h-6 w-6 text-zinc-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                                                    {d.user?.firstName} {d.user?.lastName}
                                                                </h3>
                                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                                                                    <p>Email: {d.user?.email}</p>
                                                                    <p>Phone: {d.user?.phone}</p>
                                                                    <p>Vehicle: {d.carModel} ({d.plateNumber})</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleApproveDriver(d.id)}
                                                                disabled={actionLoading === d.id}
                                                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeclineDriver(d.id)}
                                                                disabled={actionLoading === d.id}
                                                                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                                        <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Documents</h4>
                                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                            {d.identityPhotos && d.identityPhotos.length > 0 && (
                                                                <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                                                    <p className="mb-2 text-xs font-medium text-zinc-500">Identity</p>
                                                                    <div className="flex gap-2 overflow-x-auto">
                                                                        {d.identityPhotos.map((url: string, i: number) => (
                                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                                                                                <img src={url} alt="ID" className="h-16 w-24 rounded border object-cover" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {d.drivingLicensePhotos && d.drivingLicensePhotos.length > 0 && (
                                                                <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                                                    <p className="mb-2 text-xs font-medium text-zinc-500">Driving License</p>
                                                                    <div className="flex gap-2 overflow-x-auto">
                                                                        {d.drivingLicensePhotos.map((url: string, i: number) => (
                                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                                                                                <img src={url} alt="Driving License" className="h-16 w-24 rounded border object-cover" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {d.carLicensePhotos && d.carLicensePhotos.length > 0 && (
                                                                <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                                                    <p className="mb-2 text-xs font-medium text-zinc-500">Car License</p>
                                                                    <div className="flex gap-2 overflow-x-auto">
                                                                        {d.carLicensePhotos.map((url: string, i: number) => (
                                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                                                                                <img src={url} alt="Car License" className="h-16 w-24 rounded border object-cover" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TRIPS */}
                        {tab === 'trips' && (
                            <div>
                                {allTrips.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No trips found</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Route</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Driver</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Time</th>
                                                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                                                    <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                                {allTrips.map((t) => (
                                                    <tr key={t.id}>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                                            {t.fromCity} → {t.toCity}
                                                        </td>
                                                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                                            {t.driver?.firstName} {t.driver?.lastName}
                                                        </td>
                                                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                                            {new Date(t.departureTime).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                                                {t.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {(t.status === 'SCHEDULED' || t.status === 'DRIVER_CONFIRMED') && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Cancel this trip?')) return;
                                                                        setActionLoading(t.id);
                                                                        try {
                                                                            await api.cancelTripAdmin(t.id);
                                                                            loadData();
                                                                        } catch {}
                                                                        setActionLoading(null);
                                                                    }}
                                                                    disabled={actionLoading === t.id}
                                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-zinc-500">{label}</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}
