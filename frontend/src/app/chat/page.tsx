'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocket } from '@/providers/SocketProvider';
import { api } from '@/lib/api';
import { ChatMessage } from '@/types';
import toast from 'react-hot-toast';
import { Send, Loader2, Trash2, Ban, Shield, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface AdminMenuProps {
  message: ChatMessage;
  onDelete: (id: string) => void;
  onBlock: (userId: string, name: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

function AdminMenu({ message, onDelete, onBlock, onClose, position }: AdminMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const name = message.user ? `${message.user.firstName} ${message.user.lastName}` : 'Unknown';

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      style={{ top: Math.min(position.y, window.innerHeight - 120), left: Math.min(position.x, window.innerWidth - 200) }}
    >
      <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Admin Actions</p>
      </div>
      <button
        onClick={() => { onDelete(message.id); onClose(); }}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
        Delete message
      </button>
      {message.user?.role !== 'ADMIN' && (
        <button
          onClick={() => { onBlock(message.userId, name); onClose(); }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <Ban className="h-4 w-4" />
          Block from chat
        </button>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isAdmin: boolean;
  onAdminClick: (message: ChatMessage, e: React.MouseEvent) => void;
}

function MessageBubble({ message, isOwn, isAdmin, onAdminClick }: MessageBubbleProps) {
  const initials = message.user ? `${message.user.firstName[0]}${message.user.lastName[0]}` : '?';
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });

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

  return (
    <div className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
        message.user?.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-rose-600'
        : message.user?.role === 'DRIVER' ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
        : 'bg-gradient-to-br from-teal-500 to-emerald-600'
      }`}>
        {initials}
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isOwn && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {message.user?.firstName} {message.user?.lastName}
            </span>
            {message.user?.role && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[message.user.role] || ''}`}>
                {ROLE_LABEL[message.user.role] || message.user.role}
              </span>
            )}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwn ? 'rounded-br-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
            : 'rounded-bl-md bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
          }`}>
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>
          {isAdmin && !message.isDeleted && (
            <button
              onClick={(e) => onAdminClick(message, e)}
              className="opacity-0 group-hover:opacity-100 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all hover:bg-red-100 hover:text-red-600 dark:bg-zinc-700 dark:text-zinc-400"
              title="Admin actions"
            >
              <Shield className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className={`px-1 text-[10px] text-zinc-400 ${isOwn ? 'self-end' : ''}`}>{formattedTime}</span>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, confirmLabel, confirmClass = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [adminMenu, setAdminMenu] = useState<{ message: ChatMessage; position: { x: number; y: number } } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; confirmLabel: string; confirmClass?: string; action: () => void;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = user?.role === 'ADMIN';
  const LIMIT = 50;

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [msgRes, statusRes] = await Promise.all([api.getChatMessages(undefined, LIMIT), api.getChatStatus()]);
        const msgs = ((msgRes.data as ChatMessage[]) || []);
        setMessages(msgs.reverse());
        setHasMore(msgs.length >= LIMIT);
        if (msgs.length > 0) setCursor(msgs[0]?.id);
        setIsBlocked((statusRes.data as any)?.blocked ?? false);
      } catch {
        toast.error('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);
    const handleDeleted = ({ messageId }: { messageId: string }) =>
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, user: null } : m));
    const handleBlocked = ({ userId }: { userId: string }) => {
      if (userId === user?.id) { setIsBlocked(true); toast.error('You have been blocked from the group chat.', { duration: 6000 }); }
    };
    const handleUnblocked = ({ userId }: { userId: string }) => {
      if (userId === user?.id) { setIsBlocked(false); toast.success('You have been unblocked. You can chat again!'); }
    };
    socket.on('newChatMessage', handleNew);
    socket.on('chatMessageDeleted', handleDeleted);
    socket.on('chatUserBlocked', handleBlocked);
    socket.on('chatUserUnblocked', handleUnblocked);
    return () => {
      socket.off('newChatMessage', handleNew);
      socket.off('chatMessageDeleted', handleDeleted);
      socket.off('chatUserBlocked', handleBlocked);
      socket.off('chatUserUnblocked', handleUnblocked);
    };
  }, [socket, user?.id]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await api.getChatMessages(cursor, LIMIT);
      const older = ((res.data as ChatMessage[]) || []);
      setHasMore(older.length >= LIMIT);
      setMessages((prev) => [...older.reverse(), ...prev]);
      if (older.length > 0) setCursor(older[0]?.id);
    } catch { toast.error('Failed to load older messages'); }
    finally { setLoadingMore(false); }
  }, [cursor, hasMore, loadingMore]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    if (messagesContainerRef.current.scrollTop < 60) loadMore();
  }, [loadMore]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending || isBlocked) return;
    const content = inputText.trim();
    if (content.length > 500) { toast.error('Message too long. Max 500 characters.'); return; }
    setIsSending(true);
    setInputText('');
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId, userId: user!.id, content, isDeleted: false,
      createdAt: new Date().toISOString(),
      user: { id: user!.id, firstName: user!.firstName, lastName: user!.lastName, role: user!.role, avatarUrl: user?.avatarUrl },
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      if (socket) {
        socket.emit('sendChatMessage', { content });
        setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== tempId)), 1000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleDeleteMessage = (messageId: string) => {
    setConfirmState({
      open: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This cannot be undone.',
      confirmLabel: 'Delete',
      action: async () => {
        setConfirmState(null);
        try {
          await api.deleteChatMessage(messageId);
          setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, user: null } : m));
          toast.success('Message deleted');
        } catch (err: any) { toast.error(err.message || 'Failed to delete message'); }
      },
    });
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setConfirmState({
      open: true,
      title: 'Block User from Chat',
      message: `Block ${userName} from the group chat? They will not be able to send messages until unblocked.`,
      confirmLabel: 'Block',
      confirmClass: 'bg-amber-600 hover:bg-amber-700',
      action: async () => {
        setConfirmState(null);
        try {
          await api.blockChatUser(userId);
          toast.success(`${userName} has been blocked from chat`);
        } catch (err: any) { toast.error(err.message || 'Failed to block user'); }
      },
    });
  };

  const handleAdminMenuClick = (message: ChatMessage, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAdminMenu({ message, position: { x: rect.left, y: rect.bottom + 4 } });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-950" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Header */}
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
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
              Admin Mode
            </span>
          )}
        </div>
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Ban className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              You have been blocked from this chat by an admin. You can read messages but cannot send any.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-4 pb-2">
          {loadingMore && (
            <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
          )}
          {hasMore && !loadingMore && messages.length >= LIMIT && (
            <div className="flex justify-center">
              <button onClick={loadMore} className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
                Load older messages
              </button>
            </div>
          )}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse dark:bg-zinc-700" />
                  <div className={`h-12 rounded-2xl bg-zinc-200 animate-pulse dark:bg-zinc-700 ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">No messages yet</h3>
              <p className="mt-1 text-sm text-zinc-500">Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.userId === user?.id} isAdmin={isAdmin} onAdminClick={handleAdminMenuClick} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-3xl p-3">
          {isBlocked ? (
            <div className="flex items-center justify-center rounded-2xl bg-zinc-100 py-3 dark:bg-zinc-800">
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
                  placeholder="Type a message... (Enter to send)"
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>

      {adminMenu && (
        <AdminMenu message={adminMenu.message} onDelete={handleDeleteMessage} onBlock={handleBlockUser} onClose={() => setAdminMenu(null)} position={adminMenu.position} />
      )}
      {confirmState && (
        <ConfirmDialog isOpen={confirmState.open} title={confirmState.title} message={confirmState.message} confirmLabel={confirmState.confirmLabel} confirmClass={confirmState.confirmClass} onConfirm={confirmState.action} onCancel={() => setConfirmState(null)} />
      )}
    </div>
  );
}
