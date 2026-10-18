import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Headphones } from 'lucide-react';
import {
  subscribeToMessages,
  triggerCustomerPushNotification,
  requestPushNotificationPermission,
  type CustomerMessage
} from '@/services/customerMessagingService';
import { toast } from 'sonner';

const STORAGE_KEY = 'dbs_chat_btn_pos';

const getInitialPos = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as { x: number; y: number };
  } catch {}
  return null;
};

export const FloatingChatButton: React.FC = () => {
  const { currentUser } = useLoan();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Drag state
  const btnRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posRef = useRef<{ x: number; y: number } | null>(getInitialPos());
  const [pos, setPos] = useState<{ x: number; y: number } | null>(posRef.current);

  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;

  // Sound effect
  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy
    }
  };

  useEffect(() => {
    requestPushNotificationPermission();
    if (!currentUser?.phone) return;
    const unsubscribe = subscribeToMessages(currentUser.phone, (newMsg: CustomerMessage) => {
      if (newMsg.sender === 'admin' && locationRef.current !== '/messages') {
        setUnreadCount((c) => c + 1);
        playSound();
        const notificationBody = newMsg.message_type === 'voice'
          ? '🎙️ এডমিন আপনাকে একটি ভয়েস বার্তা পাঠিয়েছেন'
          : (newMsg.content || 'নতুন বার্তা এসেছে');
        triggerCustomerPushNotification('DBS Bank SG সাপোর্ট: নতুন বার্তা', {
          body: notificationBody,
          url: '/messages',
          tag: 'customer-chat-alert'
        });
        toast.info(language === 'bn' ? 'সাপোর্ট থেকে নতুন বার্তা এসেছে!' : 'New message from Support!', {
          description: notificationBody,
          action: {
            label: language === 'bn' ? 'দেখুন' : 'View',
            onClick: () => navigate('/messages')
          }
        });
      }
    });
    return () => { unsubscribe(); };
  }, [currentUser?.phone]);

  useEffect(() => {
    if (location.pathname === '/messages') setUnreadCount(0);
  }, [location.pathname]);

  // ── Drag logic (mouse + touch) ──────────────────────────────────
  const rafIdRef = useRef<number | null>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    isDraggingRef.current = true;
    hasDraggedRef.current = false;

    const el = btnRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (!posRef.current) {
        posRef.current = { x: rect.left, y: rect.top };
        setPos({ x: rect.left, y: rect.top });
      }
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      targetPosRef.current = { x: rect.left, y: rect.top };
      el.style.transition = 'none';
      el.style.willChange = 'transform';
      el.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const el = btnRef.current;
    if (!el) return;

    const deltaX = Math.abs(e.clientX - (posRef.current?.x ?? 0) - dragStartRef.current.x);
    const deltaY = Math.abs(e.clientY - (posRef.current?.y ?? 0) - dragStartRef.current.y);
    if (deltaX > 8 || deltaY > 8) {
      hasDraggedRef.current = true;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;

    let nx = e.clientX - dragStartRef.current.x;
    let ny = e.clientY - dragStartRef.current.y;

    // Clamp inside viewport with small safe margin
    nx = Math.max(8, Math.min(nx, Math.max(8, vw - bw - 8)));
    ny = Math.max(8, Math.min(ny, Math.max(8, vh - bh - 8)));

    targetPosRef.current = { x: nx, y: ny };
    posRef.current = { x: nx, y: ny };

    // Use requestAnimationFrame for hardware-accelerated 120fps GPU rendering
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (btnRef.current) {
          const { x, y } = targetPosRef.current;
          btnRef.current.style.position = 'fixed';
          btnRef.current.style.left = '0px';
          btnRef.current.style.top = '0px';
          btnRef.current.style.right = 'auto';
          btnRef.current.style.bottom = 'auto';
          btnRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        rafIdRef.current = null;
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    const el = btnRef.current;
    if (el) {
      if (el.hasPointerCapture(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}
      }
      el.style.willChange = 'auto';
      if (posRef.current) {
        el.style.left = `${posRef.current.x}px`;
        el.style.top = `${posRef.current.y}px`;
        el.style.transform = 'none';
      }
    }

    if (posRef.current) {
      setPos(posRef.current);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current));
      } catch {}
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const el = btnRef.current;
    if (el) {
      if (el.hasPointerCapture(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}
      }
      el.style.willChange = 'auto';
      if (posRef.current) {
        el.style.left = `${posRef.current.x}px`;
        el.style.top = `${posRef.current.y}px`;
        el.style.transform = 'none';
      }
    }
  };

  // ──────────────────────────────────────────────────────────────

  // Do not render inside admin pages or when already on the messages page
  if (location.pathname.startsWith('/admin') || location.pathname === '/messages') return null;

  return (
    <div
      className="hidden md:block fixed md:bottom-6 right-6 z-50 select-none pointer-events-auto"
    >
      <button
        type="button"
        onClick={() => {
          navigate('/messages');
        }}
        className="flex items-center gap-2 bg-gradient-to-r from-sky-500 via-primary to-blue-600 text-white px-3.5 sm:px-4 py-2.5 rounded-xl shadow-[0_8px_25px_rgba(2,132,199,0.38)] hover:scale-105 active:scale-95 transition-all group border border-white/40 cursor-pointer"
        title={language === 'bn' ? 'সাপোর্ট' : 'Support'}
      >
        <div className="relative flex items-center justify-center">
          <Headphones className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse shrink-0" />
          {unreadCount > 0 ? (
            <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          ) : (
            <>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </>
          )}
        </div>
        <span className="text-xs sm:text-sm font-extrabold tracking-wide whitespace-nowrap">
          {language === 'bn' ? 'সাপোর্ট' : 'Support'}
        </span>
      </button>
    </div>
  );
};

export default FloatingChatButton;
