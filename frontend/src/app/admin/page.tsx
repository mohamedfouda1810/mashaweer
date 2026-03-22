'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api, getImageUrl } from '@/lib/api';
import { User, AdminAlert, DepositRequest } from '@/types';
import toast from 'react-hot-toast';
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
    Plus,
    Trash2,
    Clock,
    DollarSign,
    X,
    ChevronRight,
    Settings,
    Phone,
    Percent,
    Save,
    Download,
    FileText,
    Eye,
    ArrowUpDown,
} from 'lucide-react';

type Tab = 'overview' | 'alerts' | 'users' | 'deposits' | 'drivers' | 'trips' | 'financials' | 'transactions' | 'commissionPayments' | 'cancellations' | 'settings';

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
    // Financials
    const [financials, setFinancials] = useState<any>(null);
    // Platform Settings
    const [platformSettings, setPlatformSettings] = useState({ instapayNumber: '', vodafoneCashNumber: '', commissionRate: 0.15 });
    const [settingsSaving, setSettingsSaving] = useState(false);
    // Create user modal
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'PASSENGER' });
    
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    // Commission Payments
    const [commissionPayments, setCommissionPayments] = useState<any[]>([]);
    // All Transactions
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    // User Detail Modal
    const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    // Cancellation Requests
    const [cancellationRequests, setCancellationRequests] = useState<any[]>([]);

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
            } else if (tab === 'financials') {
                const res = await api.getFinancials();
                setFinancials(res.data);
            } else if (tab === 'settings') {
                const res = await api.getPlatformSettings();
                if (res.data) {
                    setPlatformSettings({
                        instapayNumber: (res.data as any).instapayNumber || '',
                        vodafoneCashNumber: (res.data as any).vodafoneCashNumber || '',
                        commissionRate: (res.data as any).commissionRate ?? 0.15,
                    });
                }
            } else if (tab === 'commissionPayments') {
                const res = await api.getAdminPaymentRequests();
                setCommissionPayments((res.data as any[]) || []);
            } else if (tab === 'transactions') {
                const res = await api.getAllTransactionsAdmin();
                setAllTransactions((res.data as any[]) || []);
            } else if (tab === 'cancellations') {
                const res = await api.getPendingCancellations();
                setCancellationRequests((res.data as any[]) || []);
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
            toast.success('User banned');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleUnban = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.unbanUser(userId);
            toast.success('User unbanned');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleTempBan = async (userId: string) => {
        const daysStr = prompt('Ban duration in days (default 15):');
        const days = parseInt(daysStr || '15', 10) || 15;
        const reason = prompt('Ban reason (optional):');
        setActionLoading(userId);
        try {
            await api.tempBanUser(userId, days, reason || undefined);
            toast.success(`User banned for ${days} days`);
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('⚠️ This will permanently delete this user and all their data. Are you sure?')) return;
        setActionLoading(userId);
        try {
            await api.deleteUser(userId);
            toast.success('User deleted');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleCreateUser = async () => {
        if (!newUser.firstName || !newUser.email || !newUser.password || !newUser.phone) {
            toast.error('Please fill all required fields');
            return;
        }
        setActionLoading('create');
        try {
            await api.createUser(newUser);
            toast.success('User created successfully');
            setShowCreateUser(false);
            setNewUser({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'PASSENGER' });
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleApproveDeposit = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approveDeposit(id);
            toast.success('Deposit approved');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleRejectDeposit = async (id: string) => {
        const reason = prompt('Rejection reason (optional):');
        setActionLoading(id);
        try {
            await api.rejectDeposit(id, reason || undefined);
            toast.success('Deposit rejected');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleApproveDriver = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approveDriver(id);
            toast.success('Driver approved');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleDeclineDriver = async (id: string) => {
        if (!confirm('Are you sure you want to decline this driver application?')) return;
        setActionLoading(id);
        try {
            await api.declineDriver(id);
            toast.success('Driver declined');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setActionLoading(userId);
        try {
            await api.changeUserRole(userId, newRole);
            toast.success('Role updated');
            loadData();
        } catch (err: any) { toast.error(err.message); }
        setActionLoading(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
        { key: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
        { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
        { key: 'deposits', label: 'Deposits', icon: <CreditCard className="h-4 w-4" /> },
        { key: 'drivers', label: 'Drivers', icon: <Car className="h-4 w-4" /> },
        { key: 'trips', label: 'Trips', icon: <Ticket className="h-4 w-4" /> },
        { key: 'financials', label: 'Financials', icon: <DollarSign className="h-4 w-4" /> },
        { key: 'transactions', label: 'Transactions', icon: <ArrowUpDown className="h-4 w-4" /> },
        { key: 'commissionPayments', label: 'Commissions', icon: <Percent className="h-4 w-4" /> },
        { key: 'cancellations', label: 'Cancellations', icon: <AlertTriangle className="h-4 w-4" /> },
        { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage the platform</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateUser(true)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-teal-600 hover:to-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        Create User
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.key
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
                                <div className="mb-4 flex items-center gap-3">
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
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {u.isBanned ? (
                                                                    <button
                                                                        onClick={() => handleUnban(u.id)}
                                                                        disabled={actionLoading === u.id}
                                                                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                    >
                                                                        <UserCheck className="h-3 w-3" />
                                                                        Unban
                                                                    </button>
                                                                ) : u.role !== 'ADMIN' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleBan(u.id)}
                                                                            disabled={actionLoading === u.id}
                                                                            className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
                                                                        >
                                                                            <Ban className="h-3 w-3" />
                                                                            Ban
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleTempBan(u.id)}
                                                                            disabled={actionLoading === u.id}
                                                                            className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-900/30 dark:text-orange-400"
                                                                            title="Temporary ban for N days"
                                                                        >
                                                                            <Clock className="h-3 w-3" />
                                                                            Temp
                                                                        </button>
                                                                    </>
                                                                ) : null}
                                                                {u.role !== 'ADMIN' && (
                                                                    <button
                                                                        onClick={() => handleDeleteUser(u.id)}
                                                                        disabled={actionLoading === u.id}
                                                                        className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                                                        title="Delete user permanently"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={async () => {
                                                                        setDetailLoading(true);
                                                                        try {
                                                                            const res = await api.getUserDetailAdmin(u.id);
                                                                            setSelectedUserDetail(res.data);
                                                                        } catch (err: any) { toast.error(err.message || 'Failed to load user detail'); }
                                                                        setDetailLoading(false);
                                                                    }}
                                                                    className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                                    title="View user profile detail"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                    Detail
                                                                </button>
                                                            </div>
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
                                                            User: {(d as any).user?.firstName ? `${(d as any).user.firstName} ${(d as any).user.lastName}` : d.userId.slice(0, 8) + '...'} &bull; {new Date(d.createdAt).toLocaleString()}
                                                        </p>
                                                        {d.receiptUrl && (
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <a
                                                                    href={getImageUrl(d.receiptUrl) || d.receiptUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-block text-xs text-teal-600 hover:underline"
                                                                >
                                                                    View Receipt
                                                                </a>
                                                                <a
                                                                    href={getImageUrl(d.receiptUrl) || d.receiptUrl}
                                                                    download
                                                                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                                                                >
                                                                    <Download className="h-3 w-3" /> Download
                                                                </a>
                                                            </div>
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
                                                                            <div key={i} className="shrink-0 flex flex-col gap-1">
                                                                                <a href={getImageUrl(url) || url} target="_blank" rel="noreferrer">
                                                                                    <img src={getImageUrl(url) || url} alt="ID" className="h-16 w-24 rounded border object-cover" />
                                                                                </a>
                                                                                <a href={getImageUrl(url) || url} download className="flex items-center justify-center gap-1 text-[10px] text-indigo-600 hover:underline">
                                                                                    <Download className="h-2.5 w-2.5" /> Download
                                                                                </a>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {d.drivingLicensePhotos && d.drivingLicensePhotos.length > 0 && (
                                                                <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                                                    <p className="mb-2 text-xs font-medium text-zinc-500">Driving License</p>
                                                                    <div className="flex gap-2 overflow-x-auto">
                                                                        {d.drivingLicensePhotos.map((url: string, i: number) => (
                                                                            <div key={i} className="shrink-0 flex flex-col gap-1">
                                                                                <a href={getImageUrl(url) || url} target="_blank" rel="noreferrer">
                                                                                    <img src={getImageUrl(url) || url} alt="Driving License" className="h-16 w-24 rounded border object-cover" />
                                                                                </a>
                                                                                <a href={getImageUrl(url) || url} download className="flex items-center justify-center gap-1 text-[10px] text-indigo-600 hover:underline">
                                                                                    <Download className="h-2.5 w-2.5" /> Download
                                                                                </a>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {d.carLicensePhotos && d.carLicensePhotos.length > 0 && (
                                                                <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                                                    <p className="mb-2 text-xs font-medium text-zinc-500">Car License</p>
                                                                    <div className="flex gap-2 overflow-x-auto">
                                                                        {d.carLicensePhotos.map((url: string, i: number) => (
                                                                            <div key={i} className="shrink-0 flex flex-col gap-1">
                                                                                <a href={getImageUrl(url) || url} target="_blank" rel="noreferrer">
                                                                                    <img src={getImageUrl(url) || url} alt="Car License" className="h-16 w-24 rounded border object-cover" />
                                                                                </a>
                                                                                <a href={getImageUrl(url) || url} download className="flex items-center justify-center gap-1 text-[10px] text-indigo-600 hover:underline">
                                                                                    <Download className="h-2.5 w-2.5" /> Download
                                                                                </a>
                                                                            </div>
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
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                t.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                                t.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                            }`}>
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
                                                                            toast.success('Trip cancelled');
                                                                            loadData();
                                                                        } catch (err: any) { toast.error(err.message); }
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

                        {/* FINANCIALS */}
                        {tab === 'financials' && financials && (
                            <div className="space-y-6">
                                {/* Generate Invoice Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            const lines: string[] = [];
                                            lines.push('Mashaweer Weekly Financial Invoice');
                                            lines.push(`Generated: ${new Date().toLocaleDateString()}`);
                                            lines.push('');
                                            lines.push('--- Summary ---');
                                            lines.push(`Total Revenue,${Math.round(financials.summary?.totalRevenue || 0)} EGP`);
                                            lines.push(`Platform Commission,${Math.round(financials.summary?.totalCommission || 0)} EGP`);
                                            lines.push(`Driver Earnings,${Math.round(financials.summary?.totalDriverEarnings || 0)} EGP`);
                                            lines.push(`Completed Trips,${financials.summary?.totalCompletedTrips || 0}`);
                                            lines.push(`Commission Rate,${((financials.summary?.commissionRate || 0) * 100).toFixed(0)}%`);
                                            lines.push(`Total Deposits,${Math.round(financials.summary?.totalDeposits || 0)} EGP`);
                                            lines.push(`Total Refunds,${Math.round(financials.summary?.totalRefunds || 0)} EGP`);
                                            lines.push('');
                                            if (financials.driverBreakdown?.length) {
                                                lines.push('--- Driver Breakdown ---');
                                                lines.push('Driver,Trips,Earnings (EGP),Commission (EGP)');
                                                financials.driverBreakdown.forEach((d: any) => {
                                                    lines.push(`${d.name},${d.totalTrips},${Math.round(d.totalEarnings)},${Math.round(d.totalCommission)}`);
                                                });
                                                lines.push('');
                                            }
                                            if (financials.recentTrips?.length) {
                                                lines.push('--- Recent Trips ---');
                                                lines.push('Route,Driver,Booked Seats,Revenue (EGP),Commission (EGP)');
                                                financials.recentTrips.forEach((t: any) => {
                                                    lines.push(`${t.route},${t.driver},${t.bookedSeats},${Math.round(t.tripRevenue)},${Math.round(t.commission)}`);
                                                });
                                            }
                                            const csv = lines.join('\n');
                                            const blob = new Blob([csv], { type: 'text/csv' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `mashaweer-invoice-${new Date().toISOString().slice(0, 10)}.csv`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            toast.success('Invoice CSV downloaded!');
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Generate Weekly Invoice (CSV)
                                    </button>
                                </div>
                                {/* Summary Cards */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard
                                        icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
                                        label="Total Revenue"
                                        value={`${Math.round(financials.summary?.totalRevenue || 0)} EGP`}
                                        bg="bg-emerald-100 dark:bg-emerald-900/30"
                                    />
                                    <StatCard
                                        icon={<TrendingUp className="h-5 w-5 text-teal-600" />}
                                        label="Platform Commission"
                                        value={`${Math.round(financials.summary?.totalCommission || 0)} EGP`}
                                        bg="bg-teal-100 dark:bg-teal-900/30"
                                    />
                                    <StatCard
                                        icon={<Car className="h-5 w-5 text-indigo-600" />}
                                        label="Driver Earnings"
                                        value={`${Math.round(financials.summary?.totalDriverEarnings || 0)} EGP`}
                                        bg="bg-indigo-100 dark:bg-indigo-900/30"
                                    />
                                    <StatCard
                                        icon={<Ticket className="h-5 w-5 text-violet-600" />}
                                        label="Completed Trips"
                                        value={financials.summary?.totalCompletedTrips || 0}
                                        bg="bg-violet-100 dark:bg-violet-900/30"
                                    />
                                </div>

                                {/* Commission Rate */}
                                <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-teal-50 to-indigo-50 p-4 dark:border-zinc-800 dark:from-teal-900/10 dark:to-indigo-900/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Commission Rate</span>
                                        <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                                            {((financials.summary?.commissionRate || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-zinc-500">Total Deposits: {Math.round(financials.summary?.totalDeposits || 0)} EGP</span>
                                        <span className="text-zinc-500">Total Refunds: {Math.round(financials.summary?.totalRefunds || 0)} EGP</span>
                                    </div>
                                </div>

                                {/* Driver Breakdown */}
                                {financials.driverBreakdown && financials.driverBreakdown.length > 0 && (
                                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Driver Earnings Breakdown</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Driver</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Trips</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Earnings</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Commission</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                    {financials.driverBreakdown.map((driver: any) => (
                                                        <tr key={driver.driverId}>
                                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{driver.name}</td>
                                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{driver.totalTrips}</td>
                                                            <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{Math.round(driver.totalEarnings)} EGP</td>
                                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{Math.round(driver.totalCommission)} EGP</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Trip Revenue */}
                                {financials.recentTrips && financials.recentTrips.length > 0 && (
                                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Trip Revenue</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Route</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Driver</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Seats</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Revenue</th>
                                                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Commission</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                    {financials.recentTrips.map((trip: any) => (
                                                        <tr key={trip.tripId}>
                                                            <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{trip.route}</td>
                                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{trip.driver}</td>
                                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{trip.bookedSeats}</td>
                                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{Math.round(trip.tripRevenue)} EGP</td>
                                                            <td className="px-4 py-3 text-teal-600 dark:text-teal-400">{Math.round(trip.commission)} EGP</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Create User Modal */}
                {showCreateUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Create New User</h2>
                                <button onClick={() => setShowCreateUser(false)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="First Name *"
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone *"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                <input
                                    type="password"
                                    placeholder="Password *"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                >
                                    <option value="PASSENGER">Passenger</option>
                                    <option value="DRIVER">Driver</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <button
                                    onClick={handleCreateUser}
                                    disabled={actionLoading === 'create'}
                                    className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {actionLoading === 'create' ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Settings Tab ───────────────────────────────────────── */}
                {tab === 'settings' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                <Settings className="h-5 w-5 text-teal-500" />
                                Platform Payment Settings
                            </h2>
                            <p className="mb-4 text-sm text-zinc-500">Configure payment numbers that drivers will see on their wallet page to pay their commission.</p>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <Phone className="h-4 w-4 text-teal-500" />
                                        InstaPay Number
                                    </label>
                                    <input
                                        type="text"
                                        value={platformSettings.instapayNumber}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, instapayNumber: e.target.value })}
                                        placeholder="e.g. 01012345678"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <Phone className="h-4 w-4 text-red-500" />
                                        Vodafone Cash Number
                                    </label>
                                    <input
                                        type="text"
                                        value={platformSettings.vodafoneCashNumber}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, vodafoneCashNumber: e.target.value })}
                                        placeholder="e.g. 01098765432"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <Percent className="h-4 w-4 text-indigo-500" />
                                        Commission Rate
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={platformSettings.commissionRate}
                                            onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: parseFloat(e.target.value) || 0 })}
                                            className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        />
                                        <span className="text-sm text-zinc-500">({Math.round(platformSettings.commissionRate * 100)}%)</span>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        setSettingsSaving(true);
                                        try {
                                            await api.updatePlatformSettings(platformSettings);
                                            toast.success('Platform settings saved!');
                                        } catch (err: any) {
                                            toast.error(err.message || 'Failed to save settings');
                                        }
                                        setSettingsSaving(false);
                                    }}
                                    disabled={settingsSaving}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                        {/* COMMISSION PAYMENTS */}
                        {tab === 'commissionPayments' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Commission Payment Requests</h2>
                                {commissionPayments.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No pending commission payment requests</div>
                                ) : (
                                    <div className="space-y-3">
                                        {commissionPayments.map((p: any) => (
                                            <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                            p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                                            p.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        } dark:bg-opacity-20`}>
                                                            <DollarSign className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                                {p.driver?.firstName} {p.driver?.lastName}
                                                            </h3>
                                                            <p className="text-xs text-zinc-500">
                                                                {p.driver?.email} &bull; {p.driver?.phone}
                                                            </p>
                                                            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                                {Number(p.amount).toFixed(0)} EGP
                                                            </p>
                                                            <p className="text-xs text-zinc-500">
                                                                InstaPay Ref: <span className="font-mono font-semibold">{p.instapayReferenceNumber}</span>
                                                            </p>
                                                            <p className="text-xs text-zinc-500">
                                                                {new Date(p.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${
                                                            p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            p.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                        {p.status === 'PENDING' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Approve this commission payment?')) return;
                                                                        setActionLoading(p.id);
                                                                        try {
                                                                            await api.approveCommissionPayment(p.id);
                                                                            toast.success('Payment approved!');
                                                                            loadData();
                                                                        } catch (err: any) { toast.error(err.message); }
                                                                        setActionLoading(null);
                                                                    }}
                                                                    disabled={actionLoading === p.id}
                                                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const reason = prompt('Rejection reason (optional):');
                                                                        setActionLoading(p.id);
                                                                        try {
                                                                            await api.rejectCommissionPayment(p.id, reason || undefined);
                                                                            toast.success('Payment rejected');
                                                                            loadData();
                                                                        } catch (err: any) { toast.error(err.message); }
                                                                        setActionLoading(null);
                                                                    }}
                                                                    disabled={actionLoading === p.id}
                                                                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {p.screenshotUrl && (
                                                    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                                                        <p className="mb-2 text-xs font-medium text-zinc-500">Payment Screenshot</p>
                                                        <a href={getImageUrl(p.screenshotUrl) || p.screenshotUrl} target="_blank" rel="noreferrer">
                                                            <img
                                                                src={getImageUrl(p.screenshotUrl) || p.screenshotUrl}
                                                                alt="Payment Receipt"
                                                                className="h-32 rounded-lg border object-cover hover:opacity-80 transition-opacity"
                                                            />
                                                        </a>
                                                        <a
                                                            href={getImageUrl(p.screenshotUrl) || p.screenshotUrl}
                                                            download
                                                            className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                                                        >
                                                            <Download className="h-3 w-3" /> Download Receipt
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TRANSACTIONS */}
                        {tab === 'transactions' && (
                            <div>
                                <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">All Platform Transactions</h2>
                                {allTransactions.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No transactions found</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                    <th className="px-4 py-3 font-medium text-zinc-500">User</th>
                                                    <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
                                                    <th className="px-4 py-3 font-medium text-zinc-500">Amount</th>
                                                    <th className="px-4 py-3 font-medium text-zinc-500">Reference</th>
                                                    <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {allTransactions.map((t: any) => (
                                                    <tr key={t.id} className="bg-white dark:bg-zinc-900">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                                {t.wallet?.user?.firstName} {t.wallet?.user?.lastName}
                                                            </div>
                                                            <div className="text-xs text-zinc-500">{t.wallet?.user?.email}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                t.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : t.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                            }`}>
                                                                {(t.metadata as any)?.type === 'TRIP_EARNING' ? '🚗 Earning' : t.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                                            {Number(t.amount).toFixed(0)} EGP
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{t.reference || '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-zinc-500">
                                                            {new Date(t.createdAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CANCELLATIONS */}
                        {tab === 'cancellations' && (
                            <div>
                                <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">Pending Cancellation Requests</h2>
                                {cancellationRequests.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-zinc-500">No pending cancellation requests</div>
                                ) : (
                                    <div className="space-y-3">
                                        {cancellationRequests.map((req: any) => (
                                            <div key={req.id} className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            🚗 {req.trip?.fromCity} → {req.trip?.toCity}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            Departure: {new Date(req.trip?.departureTime).toLocaleDateString()} — {req.trip?.totalSeats - req.trip?.availableSeats} seats booked
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                        PENDING
                                                    </span>
                                                </div>

                                                <div className="mb-2 rounded-lg bg-white/80 p-2 dark:bg-zinc-800/50">
                                                    <p className="text-xs text-zinc-500">Driver:</p>
                                                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                                        {req.driver?.firstName} {req.driver?.lastName} ({req.driver?.email})
                                                    </p>
                                                </div>

                                                <div className="mb-3 rounded-lg bg-white/80 p-2 dark:bg-zinc-800/50">
                                                    <p className="text-xs text-zinc-500">Reason:</p>
                                                    <p className="text-sm text-zinc-800 dark:text-zinc-200">{req.reason}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.approveCancellation(req.id);
                                                                toast.success('Cancellation approved. Trip has been cancelled.');
                                                                loadData();
                                                            } catch (err: any) { toast.error(err.message); }
                                                        }}
                                                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const reason = prompt('Reason for rejection (optional):');
                                                            try {
                                                                await api.rejectCancellation(req.id, reason || undefined);
                                                                toast.success('Cancellation rejected.');
                                                                loadData();
                                                            } catch (err: any) { toast.error(err.message); }
                                                        }}
                                                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                {/* USER DETAIL MODAL */}
                {selectedUserDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedUserDetail(null)}>
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    👤 {selectedUserDetail.firstName} {selectedUserDetail.lastName}
                                </h2>
                                <button onClick={() => setSelectedUserDetail(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                                <div><span className="text-xs text-zinc-500">Email:</span><p className="text-sm font-medium">{selectedUserDetail.email}</p></div>
                                <div><span className="text-xs text-zinc-500">Phone:</span><p className="text-sm font-medium">{selectedUserDetail.phone}</p></div>
                                <div><span className="text-xs text-zinc-500">Role:</span><p className="text-sm font-medium">{selectedUserDetail.role}</p></div>
                                <div><span className="text-xs text-zinc-500">Status:</span><p className={`text-sm font-medium ${selectedUserDetail.isBanned ? 'text-red-500' : 'text-emerald-500'}`}>{selectedUserDetail.isBanned ? 'Banned' : 'Active'}</p></div>
                            </div>

                            {/* Wallet */}
                            {selectedUserDetail.wallet && (
                                <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                    <h3 className="mb-2 text-sm font-bold text-teal-800 dark:text-teal-300">💰 Wallet Balance: {Number(selectedUserDetail.wallet.balance).toFixed(0)} EGP</h3>
                                    {selectedUserDetail.wallet.transactions?.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-zinc-500">Recent Transactions:</p>
                                            {selectedUserDetail.wallet.transactions.slice(0, 5).map((t: any) => (
                                                <div key={t.id} className="flex justify-between text-xs">
                                                    <span className="text-zinc-600 dark:text-zinc-400">{t.reference || t.type} — {new Date(t.createdAt).toLocaleDateString()}</span>
                                                    <span className="font-mono font-semibold">{Number(t.amount).toFixed(0)} EGP</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bookings (Passenger) */}
                            {selectedUserDetail.bookings?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">🎫 Bookings ({selectedUserDetail.bookings.length})</h3>
                                    <div className="space-y-1">
                                        {selectedUserDetail.bookings.slice(0, 8).map((b: any) => (
                                            <div key={b.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                                                <span>{b.trip?.fromCity} → {b.trip?.toCity}</span>
                                                <span className={`rounded-full px-2 py-0.5 font-semibold ${b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trips as Driver */}
                            {selectedUserDetail.tripsAsDriver?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">🚗 Trips as Driver ({selectedUserDetail.tripsAsDriver.length})</h3>
                                    <div className="space-y-1">
                                        {selectedUserDetail.tripsAsDriver.slice(0, 8).map((t: any) => (
                                            <div key={t.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                                                <span>{t.fromCity} → {t.toCity} ({t._count?.bookings || 0} bookings)</span>
                                                <span className={`rounded-full px-2 py-0.5 font-semibold ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : t.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Commissions */}
                            {selectedUserDetail.commissions?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">📊 Commissions ({selectedUserDetail.commissions.length})</h3>
                                    <div className="space-y-1">
                                        {selectedUserDetail.commissions.slice(0, 8).map((c: any) => (
                                            <div key={c.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                                                <span>{c.trip?.fromCity} → {c.trip?.toCity}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-semibold">{Number(c.amount).toFixed(0)} EGP</span>
                                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${c.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {c.isPaid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Commission Payments */}
                            {selectedUserDetail.commissionPayments?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">💳 Payment Requests ({selectedUserDetail.commissionPayments.length})</h3>
                                    <div className="space-y-1">
                                        {selectedUserDetail.commissionPayments.slice(0, 5).map((p: any) => (
                                            <div key={p.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                                                <span>Ref: {p.instapayReferenceNumber} — {new Date(p.createdAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-semibold">{Number(p.amount).toFixed(0)} EGP</span>
                                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : p.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
