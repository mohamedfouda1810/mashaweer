'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocket } from '@/providers/SocketProvider';
import { api } from '@/lib/api';
import { ChatBlock, ChatMessage } from '@/types';
import toast from 'react-hot-toast';
import { Send, Loader2, Trash2, Ban, Shield, MessageCircle, UsersRound, UserCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Role styling ──────────────────────────────────────────────────
const ROLE_STYLE: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  DRIVER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PASSENGER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};
const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  DRIVER: 'Driver',
  PASSENGER: 'Passenger',
};

// ── Admin context menu ────────────────────────────────────────────
interface AdminMenuProps {
  message: ChatMessage;
  onDelete: (id: string) => void;
  onBlock: (userId: string, name: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

function AdminMenu({ message, onDelete, onBlock, onClose, position }: AdminMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const name = message.user ? `${message.user.firstName} ${message.user.lastName}` : 'Unknown';

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      style={{
        top: Math.min(position.y, window.innerHeight - 130),
        left: Math.min(position.x, window.innerWidth - 200),
      }}
    >
      <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin Actions</p>
      </div>
      <button
        onClick={() => { onDelete(message.id); onClose(); }}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" /> Delete message
      </button>
      {message.user?.role !== 'ADMIN' && (
        <button
          onClick={() => { onBlock(message.userId, name); onClose(); }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <Ban className="h-4 w-4" /> Block from chat
        </button>
      )}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
interface BubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isAdmin: boolean;
  onAdminClick: (m: ChatMessage, e: React.MouseEvent) => void;
}

function MessageBubble({ message, isOwn, isAdmin, onAdminClick }: BubbleProps) {
  const initials = message.user
    ? `${message.user.firstName[0] ?? ''}${message.user.lastName[0] ?? ''}`
    : '?';
  const time = new Date(message.createdAt).toLocaleTimeString('en-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.isDeleted) {
    return (
      <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-400 dark:bg-zinc-700">?</div>
        <div className="max-w-[70%] rounded-2xl bg-zinc-100 px-4 py-2.5 dark:bg-zinc-800">
          <p className="text-xs italic text-zinc-400 dark:text-zinc-500">[Message deleted]</p>
        </div>
      </div>
    );
  }

  const avatarGradient =
    message.user?.role === 'ADMIN'
      ? 'bg-gradient-to-br from-red-500 to-rose-600'
      : message.user?.role === 'DRIVER'
      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
      : 'bg-gradient-to-br from-teal-500 to-emerald-600';

  return (
    <div className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarGradient}`}>
        {initials}
      </div>

      {/* Content */}
      <div className={`flex max-w-[70%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {message.user?.firstName} {message.user?.lastName}
            </span>
            {message.user?.role && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[message.user.role] ?? ''}`}>
                {ROLE_LABEL[message.user.role] ?? message.user.role}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwn
                ? 'rounded-br-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
                : 'rounded-bl-md bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
            }`}
          >
            <p className="break-words text-sm leading-relaxed">{message.content}</p>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => onAdminClick(message, e)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:bg-zinc-700 dark:text-zinc-400"
              title="Admin actions"
            >
              <Shield className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className={`px-1 text-[10px] text-zinc-400 ${isOwn ? 'self-end' : ''}`}>{time}</span>
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────
interface ConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, confirmLabel, confirmClass = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel }: ConfirmProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page skeleton (shown while Zustand hydrates) ──────────────────
function ChatSkeleton() {
  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-950" style={{ height: 'calc(100dvh - 56px)' }}>
      <div className="border-b border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2.5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex items-end gap-2 ${i % 2 ? 'flex-row-reverse' : ''}`}>
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className={`h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-700 ${i % 2 ? 'w-48' : 'w-64'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main chat page ────────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<ChatBlock[]>([]);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [isLoadingBlockedUsers, setIsLoadingBlockedUsers] = useState(false);
  const [adminMenu, setAdminMenu] = useState<{ message: ChatMessage; position: { x: number; y: number } } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; confirmLabel: string; confirmClass?: string; action: () => void;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true); // track if user is scrolled to bottom
  const isAdmin = user?.role === 'ADMIN';
  const LIMIT = 50;

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login?redirect=/chat');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [msgRes, statusRes] = await Promise.all([
          api.getChatMessages(undefined, LIMIT),
          api.getChatStatus(),
        ]);

        if (cancelled) return;

        // Server returns newest-first; we reverse to show oldest at top
        const msgs = (Array.isArray(msgRes.data) ? msgRes.data : []) as ChatMessage[];
        const ordered = [...msgs].reverse();
        setMessages(ordered);
        setHasMore(msgs.length >= LIMIT);
        // cursor = the oldest message id (now first after reverse = ordered[0])
        if (ordered.length > 0) setCursor(ordered[0].id);
        setIsBlocked(Boolean((statusRes.data as any)?.blocked));
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message ?? 'Failed to load chat messages');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [hasHydrated, isAuthenticated]);

  // ── Scroll to bottom after initial load & new messages ───────
  useEffect(() => {
    if (atBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ── Track whether user is near the bottom ────────────────────
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // User is "at bottom" if within 150px of bottom
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    // Load older messages when scrolled to very top
    if (el.scrollTop < 60) loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load older messages ───────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    const prevScrollHeight = messagesContainerRef.current?.scrollHeight ?? 0;

    try {
      const res = await api.getChatMessages(cursor, LIMIT);
      const older = (Array.isArray(res.data) ? res.data : []) as ChatMessage[];
      setHasMore(older.length >= LIMIT);

      // older[] comes back newest-first; reverse → oldest first
      const reversed = [...older].reverse();
      setMessages((prev) => [...reversed, ...prev]);
      if (reversed.length > 0) setCursor(reversed[0].id);

      // Preserve scroll position after prepending older messages
      requestAnimationFrame(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight - prevScrollHeight;
      });
    } catch {
      toast.error('Failed to load older messages');
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  // ── Poll every 10 s (fallback when socket unavailable) ───────
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    const timer = setInterval(async () => {
      try {
        const res = await api.getChatMessages(undefined, LIMIT);
        const latest = (Array.isArray(res.data) ? res.data : []) as ChatMessage[];
        const ordered = [...latest].reverse();
        setMessages((prev) => {
          const byId = new Map(prev.map((m) => [m.id, m]));
          ordered.forEach((m) => byId.set(m.id, m));
          return Array.from(byId.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        });
      } catch { /* silent */ }
    }, 10_000);
    return () => clearInterval(timer);
  }, [hasHydrated, isAuthenticated]);

  // ── Socket real-time events ───────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onNew = (msg: ChatMessage) =>
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );

    const onDeleted = ({ messageId }: { messageId: string }) =>
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, user: null } : m,
        ),
      );

    const onBlocked = ({ userId }: { userId: string }) => {
      if (userId === user?.id) {
        setIsBlocked(true);
        toast.error('You have been blocked from the group chat.', { duration: 6000 });
      }
    };

    const onUnblocked = ({ userId }: { userId: string }) => {
      if (userId === user?.id) {
        setIsBlocked(false);
        toast.success('You can now send messages again!');
      }
    };

    socket.on('newChatMessage', onNew);
    socket.on('chatMessageDeleted', onDeleted);
    socket.on('chatUserBlocked', onBlocked);
    socket.on('chatUserUnblocked', onUnblocked);

    return () => {
      socket.off('newChatMessage', onNew);
      socket.off('chatMessageDeleted', onDeleted);
      socket.off('chatUserBlocked', onBlocked);
      socket.off('chatUserUnblocked', onUnblocked);
    };
  }, [socket, user?.id]);

  // ── Send message ──────────────────────────────────────────────
  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || isSending || isBlocked) return;
    if (content.length > 500) { toast.error('Message too long (max 500 characters).'); return; }

    setIsSending(true);
    setInputText('');

    // If socket is connected, send via WebSocket; server will broadcast back
    if (socket?.connected) {
      socket.emit('sendChatMessage', { content });
    } else {
      // HTTP fallback — server broadcasts via socket after persisting
      try {
        const res = await api.sendChatMessage(content);
        if (res.data) {
          setMessages((prev) => {
            const msg = res.data as ChatMessage;
            return prev.some((m) => m.id === msg.id) ? prev : [...prev, msg];
          });
        }
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to send message');
        setInputText(content); // restore on error
      }
    }

    setIsSending(false);
    atBottomRef.current = true;
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Admin: manage blocked users ───────────────────────────────
  const openBlockedUsers = async () => {
    setShowBlockedUsers(true);
    setIsLoadingBlockedUsers(true);
    try {
      const res = await api.getBlockedChatUsers();
      setBlockedUsers((Array.isArray(res.data) ? res.data : []) as ChatBlock[]);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load blocked users');
    } finally {
      setIsLoadingBlockedUsers(false);
    }
  };

  const handleUnblockUser = async (block: ChatBlock) => {
    try {
      await api.unblockChatUser(block.userId);
      setBlockedUsers((list) => list.filter((b) => b.userId !== block.userId));
      toast.success(`${block.user.firstName} ${block.user.lastName} can chat again`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to unblock user');
    }
  };

  // ── Admin: delete / block ─────────────────────────────────────
  const handleDeleteMessage = (messageId: string) => {
    setConfirmState({
      open: true,
      title: 'Delete Message',
      message: 'Delete this message permanently?',
      confirmLabel: 'Delete',
      action: async () => {
        setConfirmState(null);
        try {
          await api.deleteChatMessage(messageId);
          setMessages((prev) =>
            prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, user: null } : m),
          );
          toast.success('Message deleted');
        } catch (err: any) { toast.error(err?.message ?? 'Failed to delete'); }
      },
    });
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setConfirmState({
      open: true,
      title: 'Block User from Chat',
      message: `Block ${userName}? They cannot send messages until unblocked.`,
      confirmLabel: 'Block',
      confirmClass: 'bg-amber-600 hover:bg-amber-700',
      action: async () => {
        setConfirmState(null);
        try {
          await api.blockChatUser(userId);
          toast.success(`${userName} blocked from chat`);
        } catch (err: any) { toast.error(err?.message ?? 'Failed to block'); }
      },
    });
  };

  const handleAdminMenuClick = (message: ChatMessage, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAdminMenu({ message, position: { x: rect.left, y: rect.bottom + 4 } });
  };

  // ── Hydration guard ───────────────────────────────────────────
  // Show skeleton while Zustand rehydrates from localStorage
  if (!hasHydrated) return <ChatSkeleton />;
  // While redirecting unauthenticated users, render nothing
  if (!isAuthenticated) return null;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-950" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* ── Header ── */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white">Group Chat</h1>
              <p className="text-xs text-zinc-500">Drivers, Passengers &amp; Admins</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={openBlockedUsers}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                title="Manage blocked users"
              >
                <UsersRound className="h-3.5 w-3.5" />
                Manage
              </button>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                Admin Mode
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Blocked banner ── */}
      {isBlocked && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Ban className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              You have been blocked from this chat by an admin. You can read but not send messages.
            </p>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl space-y-4 p-4 pb-2">
          {/* Load-more indicator / button */}
          {loadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          )}
          {hasMore && !loadingMore && messages.length >= LIMIT && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                Load older messages
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex items-end gap-2 ${i % 2 ? 'flex-row-reverse' : ''}`}>
                  <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className={`h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-700 ${i % 2 ? 'w-48' : 'w-64'}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">No messages yet</h3>
              <p className="mt-1 text-sm text-zinc-500">Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.userId === user?.id}
                isAdmin={isAdmin}
                onAdminClick={handleAdminMenuClick}
              />
            ))
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="border-t border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-3xl p-3">
          {isBlocked ? (
            <div className="flex items-center justify-center rounded-2xl bg-zinc-100 py-3.5 dark:bg-zinc-800">
              <Ban className="mr-2 h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-500">You are blocked from sending messages</span>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  maxLength={500}
                  disabled={isSending}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
                  style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
                {inputText.length > 400 && (
                  <span className={`absolute bottom-2 right-3 text-[10px] font-medium ${inputText.length > 490 ? 'text-red-500' : 'text-zinc-400'}`}>
                    {inputText.length}/500
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>

      {/* ── Admin context menu ── */}
      {adminMenu && (
        <AdminMenu
          message={adminMenu.message}
          onDelete={handleDeleteMessage}
          onBlock={handleBlockUser}
          onClose={() => setAdminMenu(null)}
          position={adminMenu.position}
        />
      )}

      {/* ── Confirm dialog ── */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          confirmClass={confirmState.confirmClass}
          onConfirm={confirmState.action}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* ── Blocked users panel (admin) ── */}
      {showBlockedUsers && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setShowBlockedUsers(false)}>
          <aside className="h-full w-full max-w-sm bg-white p-5 shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-zinc-900 dark:text-white">Blocked users</h2>
                <p className="text-xs text-zinc-500">Restore group-chat access anytime.</p>
              </div>
              <button onClick={() => setShowBlockedUsers(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {isLoadingBlockedUsers ? (
                <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
              ) : blockedUsers.length === 0 ? (
                <p className="rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-800">No users are currently blocked.</p>
              ) : blockedUsers.map((block) => (
                <div key={block.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {block.user.firstName[0]}{block.user.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{block.user.firstName} {block.user.lastName}</p>
                    <p className="text-xs text-zinc-500">{ROLE_LABEL[block.user.role] ?? block.user.role}</p>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(block)}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Unblock
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
