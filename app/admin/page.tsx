'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Loader2,
  ArrowLeft,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface AdminStats {
  totalUsers: number;
  signupsToday: number;
  signups7d: number;
  activeUsers24h: number;
  totalConversations: number;
  totalMessages: number;
  totalPrompts: number;
  totalTasks: number;
  totalMemories: number;
  guestSessions: number;
  totalAiRequests: number;
  totalWebSearches: number;
  totalImageRequests: number;
  totalPdfRequests: number;
}

interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string;
  status: 'active' | 'invited' | 'disabled';
  onboardingCompleted: boolean;
  conversationsCount: number;
  messagesCount: number;
  promptsCount: number;
  tasksCount: number;
}

interface ActivityEvent {
  id: string;
  user_id?: string;
  email?: string;
  event_type: string;
  provider?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface DisplayUserRow {
  id: string;
  email: string;
  displayName: string;
  type: 'Registered' | 'Guest';
  role?: string;
  createdAt: string;
  lastActive?: string;
  conversationsCount?: number;
  messagesCount?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AdminUserRecord[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'registered' | 'guest'>('all');

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<DisplayUserRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState<{
    conversations: number;
    messages: number;
  } | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);
    setAccessDenied(false);

    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403 || usersRes.status === 401 || usersRes.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (!statsRes.ok || !usersRes.ok) {
        const errData = await statsRes.json().catch(() => ({ error: 'Failed to load dashboard' }));
        setErrorMessage(errData.error || 'Failed to load administrative data');
        setLoading(false);
        return;
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData.stats || null);
      setActivities(statsData.recentActivity || []);
      setRegisteredUsers(usersData.users || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router]);

  // Format date helper
  const formatDate = (dateStr?: string | number) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string | number) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatRelativeTime = (dateStr?: string | number) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Build unified user rows (Registered + Guest)
  const allUsersList = useMemo(() => {
    const list: DisplayUserRow[] = [];

    // 1. Registered users
    registeredUsers.forEach((u) => {
      list.push({
        id: u.id,
        email: u.email,
        displayName: u.displayName || u.email.split('@')[0],
        type: 'Registered',
        role: u.role,
        createdAt: u.createdAt,
        lastActive: u.lastSignInAt || u.createdAt,
        conversationsCount: u.conversationsCount,
        messagesCount: u.messagesCount,
      });
    });

    // 2. Guests from activity sessions
    const guestMap = new Map<string, ActivityEvent>();
    activities.forEach((act) => {
      if (
        !act.user_id &&
        (act.event_type === 'guest_started' || act.event_type === 'guest_limit_reached' || (!act.email && act.ip_address))
      ) {
        const key = act.ip_address || act.id;
        if (!guestMap.has(key)) {
          guestMap.set(key, act);
        }
      }
    });

    guestMap.forEach((act, key) => {
      list.push({
        id: `guest-${act.id}`,
        email: 'Guest',
        displayName: 'Guest User',
        type: 'Guest',
        createdAt: act.created_at,
        lastActive: act.created_at,
        conversationsCount: 0,
        messagesCount: 0,
      });
    });

    return list;
  }, [registeredUsers, activities]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsersList.filter((u) => {
      // Type filter
      if (userTypeFilter === 'registered' && u.type !== 'Registered') return false;
      if (userTypeFilter === 'guest' && u.type !== 'Guest') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchName = u.displayName.toLowerCase().includes(q);
        const matchType = u.type.toLowerCase().includes(q);
        return matchEmail || matchName || matchType;
      }

      return true;
    });
  }, [allUsersList, userTypeFilter, searchQuery]);

  // Open user details
  const handleInspectUser = async (u: DisplayUserRow) => {
    setSelectedUser(u);
    if (u.type === 'Registered') {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedUserStats({
            conversations: data.user?.counts?.conversations || 0,
            messages: data.user?.counts?.messages || 0,
          });
        } else {
          setSelectedUserStats({
            conversations: u.conversationsCount || 0,
            messages: u.messagesCount || 0,
          });
        }
      } catch {
        setSelectedUserStats({
          conversations: u.conversationsCount || 0,
          messages: u.messagesCount || 0,
        });
      } finally {
        setLoadingDetail(false);
      }
    } else {
      setSelectedUserStats(null);
    }
  };

  // Activity description helper
  const formatActivityText = (event: ActivityEvent) => {
    const actor = event.email || 'Guest';
    const time = formatRelativeTime(event.created_at);

    switch (event.event_type) {
      case 'signup':
        return {
          actor,
          action: 'Signed up',
          time,
        };
      case 'login':
        return {
          actor,
          action: 'Logged in',
          time,
        };
      case 'google_login':
        return {
          actor,
          action: 'Logged in via Google',
          time,
        };
      case 'logout':
        return {
          actor,
          action: 'Logged out',
          time,
        };
      case 'failed_login':
        return {
          actor,
          action: 'Failed login attempt',
          time,
        };
      case 'guest_started':
        return {
          actor: 'Guest',
          action: 'Started session',
          time,
        };
      case 'guest_limit_reached':
        return {
          actor: 'Guest',
          action: 'Reached trial limit (5 msgs)',
          time,
        };
      default:
        return {
          actor,
          action: event.event_type.replace(/_/g, ' '),
          time,
        };
    }
  };

  // Loading Screen
  if (authLoading || (loading && !accessDenied && !errorMessage)) {
    return (
      <main className="min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B6FC9] mb-3" />
        <p className="text-xs dark:text-white/50 text-[#686477]">Loading Admin...</p>
      </main>
    );
  }

  // Access Denied Screen
  if (accessDenied) {
    return (
      <main className="min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633] flex items-center justify-center p-6">
        <div className="w-full max-w-sm dark:bg-[#0B0E17] bg-white border dark:border-white/10 border-[#E8E4EF] rounded-2xl p-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-xl font-bold dark:text-white text-[#292633] mb-2">Access Denied</h1>
          <p className="text-xs dark:text-white/50 text-[#686477] mb-6">
            You do not have administrative privileges to view this page.
          </p>
          <Link
            href="/chat-ui"
            className="w-full h-10 rounded-xl dark:bg-white bg-[#292633] dark:hover:bg-white/90 hover:bg-[#1f1c27] dark:text-[#07090E] text-white font-medium text-xs transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            Return to Workspace
          </Link>
        </div>
      </main>
    );
  }

  const registeredCount = stats?.totalUsers || registeredUsers.length;
  const guestCount = stats?.guestSessions || 0;
  const totalCount = registeredCount + guestCount;
  const activeTodayCount = stats?.activeUsers24h || 0;

  return (
    <main className="min-h-screen dark:bg-[#07090E] bg-[#F8F7FB] dark:text-white text-[#292633] flex flex-col transition-colors">
      {/* HEADER */}
      <header className="border-b dark:border-white/10 border-[#E8E4EF] dark:bg-[#0A0C14] bg-white px-6 py-4 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/chat-ui"
              className="p-1.5 rounded-lg border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] dark:text-white/70 text-[#686477] dark:hover:text-white hover:text-[#292633] transition"
              title="Return to Workspace"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-base font-bold dark:text-white text-[#292633] tracking-tight">Nyra Admin</h1>
              <p className="text-xs dark:text-white/40 text-[#686477]">Monitor users, logins and activity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg dark:bg-white/5 bg-[#F5F3F9] border dark:border-white/10 border-[#E8E4EF] text-xs">
              <span className="dark:text-white/80 text-[#292633] font-medium">{user?.email}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded dark:bg-purple-500/20 bg-purple-100 dark:text-purple-300 text-purple-700">
                Admin
              </span>
            </div>

            <button
              type="button"
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] text-xs font-medium dark:text-white text-[#292633] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-[#8B6FC9]' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8">

        {/* 1. SIMPLE SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] shadow-sm">
            <span className="text-[11px] font-semibold dark:text-white/40 text-[#686477] uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-2xl sm:text-3xl font-bold dark:text-white text-[#292633] mt-1 block">
              {totalCount}
            </span>
          </div>

          <div className="p-4 rounded-xl dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] shadow-sm">
            <span className="text-[11px] font-semibold dark:text-white/40 text-[#686477] uppercase tracking-wider block">
              Registered
            </span>
            <span className="text-2xl sm:text-3xl font-bold dark:text-purple-300 text-purple-600 mt-1 block">
              {registeredCount}
            </span>
          </div>

          <div className="p-4 rounded-xl dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] shadow-sm">
            <span className="text-[11px] font-semibold dark:text-white/40 text-[#686477] uppercase tracking-wider block">
              Guests
            </span>
            <span className="text-2xl sm:text-3xl font-bold dark:text-amber-300 text-amber-600 mt-1 block">
              {guestCount}
            </span>
          </div>

          <div className="p-4 rounded-xl dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] shadow-sm">
            <span className="text-[11px] font-semibold dark:text-white/40 text-[#686477] uppercase tracking-wider block">
              Active Today
            </span>
            <span className="text-2xl sm:text-3xl font-bold dark:text-emerald-400 text-emerald-600 mt-1 block">
              {activeTodayCount}
            </span>
          </div>
        </div>

        {/* 2. USERS TABLE — MAIN SECTION */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold dark:text-white text-[#292633]">Users</h2>

            <div className="flex items-center gap-2">
              {/* Search Field */}
              <div className="relative flex-1 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white/40 text-[#686477]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full h-9 pl-8 pr-3 rounded-lg border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-white text-xs dark:text-white text-[#292633] dark:placeholder:text-white/30 placeholder:text-[#686477]/60 focus:border-[#8B6FC9] focus:outline-none transition-colors"
                />
              </div>

              {/* Simple Filter Pills */}
              <div className="flex items-center dark:bg-white/5 bg-[#F5F3F9] border dark:border-white/10 border-[#E8E4EF] rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUserTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    userTypeFilter === 'all'
                      ? 'dark:bg-white/15 bg-white dark:text-white text-[#292633] shadow-xs'
                      : 'dark:text-white/50 text-[#686477] dark:hover:text-white hover:text-[#292633]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setUserTypeFilter('registered')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    userTypeFilter === 'registered'
                      ? 'dark:bg-white/15 bg-white dark:text-white text-[#292633] shadow-xs'
                      : 'dark:text-white/50 text-[#686477] dark:hover:text-white hover:text-[#292633]'
                  }`}
                >
                  Registered
                </button>
                <button
                  type="button"
                  onClick={() => setUserTypeFilter('guest')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    userTypeFilter === 'guest'
                      ? 'dark:bg-white/15 bg-white dark:text-white text-[#292633] shadow-xs'
                      : 'dark:text-white/50 text-[#686477] dark:hover:text-white hover:text-[#292633]'
                  }`}
                >
                  Guest
                </button>
              </div>
            </div>
          </div>

          {/* Simple Users Table */}
          <div className="rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-[#0A0C14] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.02] bg-[#F8F7FB] dark:text-white/50 text-[#686477] text-[11px]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5 divide-[#E8E4EF]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center dark:text-white/40 text-[#686477]">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => handleInspectUser(u)}
                        className="dark:hover:bg-white/[0.04] hover:bg-[#F5F3F9] transition cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg dark:bg-white/10 bg-[#E8E4EF] dark:text-white text-[#292633] flex items-center justify-center font-bold text-xs shrink-0">
                              {u.type === 'Registered' ? (u.displayName.charAt(0).toUpperCase() || 'U') : 'G'}
                            </div>
                            <div>
                              <div className="font-medium dark:text-white text-[#292633]">
                                {u.type === 'Registered' ? u.email : 'Guest'}
                              </div>
                              {u.type === 'Registered' && u.displayName !== u.email.split('@')[0] && (
                                <div className="text-[11px] dark:text-white/40 text-[#686477]">{u.displayName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.type === 'Registered'
                                ? 'dark:bg-purple-500/20 bg-purple-100 dark:text-purple-300 text-purple-700 dark:border-purple-500/30 border-purple-200 border'
                                : 'dark:bg-amber-500/10 bg-amber-100 dark:text-amber-300 text-amber-700 dark:border-amber-500/20 border-amber-200 border'
                            }`}
                          >
                            {u.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 dark:text-white/60 text-[#686477]">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3 dark:text-white/60 text-[#686477]">
                          {formatRelativeTime(u.lastActive)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. RECENT ACTIVITY */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold dark:text-white text-[#292633]">Recent Activity</h2>

          <div className="p-4 rounded-xl dark:bg-[#0A0C14] bg-white border dark:border-white/10 border-[#E8E4EF] shadow-sm">
            {activities.length === 0 ? (
              <p className="text-xs dark:text-white/40 text-[#686477] py-4 text-center">No recent activity logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {activities.slice(0, 15).map((act) => {
                  const info = formatActivityText(act);
                  return (
                    <div key={act.id} className="flex items-center justify-between text-xs py-1 border-b dark:border-white/5 border-[#E8E4EF] last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#8B6FC9] font-bold">●</span>
                        <span className="font-medium dark:text-white text-[#292633] truncate">{info.actor}</span>
                        <span className="dark:text-white/60 text-[#686477] truncate">{info.action}</span>
                      </div>
                      <span className="text-[11px] dark:text-white/40 text-[#686477] shrink-0 ml-2 font-mono">
                        {info.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. SIMPLE USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md dark:bg-[#0C0E17] bg-white border dark:border-white/15 border-[#E8E4EF] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-[#E8E4EF]">
              <h3 className="text-base font-bold dark:text-white text-[#292633]">User Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg dark:text-white/40 text-[#686477] dark:hover:text-white hover:text-[#292633] dark:hover:bg-white/10 hover:bg-[#F5F3F9] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {selectedUser.type === 'Registered' ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Email</span>
                  <span className="dark:text-white text-[#292633] font-medium">{selectedUser.email}</span>
                </div>
                {selectedUser.displayName && selectedUser.displayName !== selectedUser.email.split('@')[0] && (
                  <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                    <span className="dark:text-white/40 text-[#686477]">Name</span>
                    <span className="dark:text-white text-[#292633] font-medium">{selectedUser.displayName}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Type</span>
                  <span className="dark:text-purple-300 text-purple-700 font-semibold">Registered</span>
                </div>
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Joined</span>
                  <span className="dark:text-white text-[#292633]">{formatDateTime(selectedUser.createdAt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Last Sign-in</span>
                  <span className="dark:text-white text-[#292633]">{formatDateTime(selectedUser.lastActive)}</span>
                </div>
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Conversations</span>
                  <span className="dark:text-white text-[#292633] font-bold">
                    {loadingDetail ? '...' : (selectedUserStats?.conversations ?? selectedUser.conversationsCount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="dark:text-white/40 text-[#686477]">Messages</span>
                  <span className="dark:text-white text-[#292633] font-bold">
                    {loadingDetail ? '...' : (selectedUserStats?.messages ?? selectedUser.messagesCount ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Type</span>
                  <span className="dark:text-amber-300 text-amber-700 font-semibold">Guest</span>
                </div>
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Joined</span>
                  <span className="dark:text-white text-[#292633]">{formatDateTime(selectedUser.createdAt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b dark:border-white/5 border-[#E8E4EF]">
                  <span className="dark:text-white/40 text-[#686477]">Last Active</span>
                  <span className="dark:text-white text-[#292633]">{formatDateTime(selectedUser.lastActive)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="dark:text-white/40 text-[#686477]">Trial Limit</span>
                  <span className="dark:text-white text-[#292633] font-medium">5 messages max</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full h-9 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/5 bg-[#F5F3F9] dark:hover:bg-white/10 hover:bg-[#EAE7F2] dark:text-white text-[#292633] text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
