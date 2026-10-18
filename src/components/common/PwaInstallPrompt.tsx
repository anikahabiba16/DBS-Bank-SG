import { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck,
  Share, 
  PlusSquare, 
  MoreVertical,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Keep deferredPrompt accessible across all components globally
let globalDeferredPrompt: any = null;

export function PwaInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already running inside standalone installed PWA
    const isApp = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isApp);

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    // Capture beforeinstallprompt event cleanly without unprompted console warnings
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        // Fallback
      }
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom trigger event (e.g. user manually taps Install App in header or banner)
    // ALWAYS open regardless of prior dismissals
    const handleCustomOpen = () => {
      setOpen(true);
    };
    window.addEventListener('open-pwa-install', handleCustomOpen);

    // When app is successfully installed
    const handleAppInstalled = () => {
      toast.success('অভিনন্দন! DBS Bank SG অ্যাপ সফলভাবে আপনার মোবাইলের হোম স্ক্রিনে যুক্ত হয়েছে।');
      setOpen(false);
      setShowAndroidGuide(false);
      setShowIosGuide(false);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleCustomOpen);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;

    if (promptEvent) {
      try {
        setInstalling(true);
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          toast.success('অভিনন্দন! অ্যাপটি সফলভাবে আপনার মোবাইলের হোম স্ক্রিনে ইনস্টল করা হয়েছে।');
          setOpen(false);
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
        } else {
          toast.info('ইনস্টলেশন বাতিল করা হয়েছে। আপনি পরবর্তীতে আবার চেষ্টা করতে পারেন।');
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        // If native prompt had an issue, fallback directly to clean visual guide
        if (isIOS) {
          setShowIosGuide(true);
        } else {
          setShowAndroidGuide(true);
        }
      } finally {
        setInstalling(false);
      }
    } else {
      // If browser has not fired beforeinstallprompt or on iOS:
      // DO NOT download any file! Show exact 1-tap guide on screen.
      setOpen(false);
      if (isIOS) {
        setShowIosGuide(true);
      } else {
        setShowAndroidGuide(true);
      }
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('dbs_pwa_install_dismissed_permanently', 'true');
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch {}
    setOpen(false);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* 1. Main Welcome App Install Modal */}
      <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); else setOpen(val); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 sm:p-6 rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 p-2 flex items-center justify-center shadow-xs">
                  <img 
                    src="/favicon.png" 
                    alt="DBS Bank SG" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                    <span>DBS Bank SG অ্যাপ</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                      অফিসিয়াল
                    </span>
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground font-medium">
                    সরাসরি মোবাইলের হোম স্ক্রিনে যুক্ত করুন
                  </p>
                </div>
              </div>
            </div>

            <DialogDescription className="text-xs text-foreground/80 leading-relaxed pt-1">
              ব্রাউজারে বারবার ওয়েবসাইট খোঁজার ঝামেলা ছাড়াই মাত্র ১ ক্লিকে আপনার ফোনের হোম স্ক্রিনে অ্যাপটি ইনস্টল করে নিন। কোনো ফাইল ডাউনলোডের প্রয়োজন নেই।
            </DialogDescription>
          </DialogHeader>

          {/* Benefits Grid */}
          <div className="space-y-2.5 py-3">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-xs">
              <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-bold">সরাসরি মোবাইলের হোম স্ক্রিনে ইনস্টল</strong>
                <span className="text-muted-foreground text-[11px]">অন্য কোনো সফটওয়্যার বা ফাইল ডাউনলোডের ঝামেলা নেই।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 dark:text-emerald-200 block font-bold">নিরাপদ ও দ্রুততম ব্যাংকিং সেবা</strong>
                <span className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px]">লোন আবেদন, ওয়ালেট ও সার্বক্ষণিক লাইভ চ্যাট সাপোর্ট।</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{installing ? 'অ্যাপ ইনস্টল হচ্ছে...' : '📲 অ্যাপ ইনস্টল করুন (Install App)'}</span>
            </Button>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-4 py-1.5 transition-colors underline-offset-4 hover:underline"
              >
                স্কিপ করুন (আর দেখাবেন না)
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Android 1-Tap Home Screen Guide Dialog */}
      <Dialog open={showAndroidGuide} onOpenChange={setShowAndroidGuide}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 sm:p-6 rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-primary" />
              সরাসরি মোবাইলের হোম স্ক্রিনে অ্যাপ নিন
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              কোনো ফাইল ডাউনলোড ছাড়া সহজে হোম স্ক্রিনে অ্যাপ যুক্ত করার সহজ ৩টি ধাপ:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs text-foreground">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                ১
              </div>
              <div className="flex-1">
                <span>ব্রাউজারের উপরে ডান কোণায় থাকা <strong>থ্রি-ডট (⋮) মেনু</strong> আইকনে চাপ দিন।</span>
              </div>
              <MoreVertical className="w-5 h-5 text-primary shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                ২
              </div>
              <div className="flex-1">
                <span>মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।</span>
              </div>
              <PlusSquare className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                ৩
              </div>
              <div className="flex-1">
                <span>পপ-আপ আসলে <strong>"Install"</strong> বাটনে ট্যাপ করলেই অ্যাপটি সরাসরি আপনার হোম স্ক্রিনে চলে আসবে!</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              type="button"
              onClick={() => {
                if (globalDeferredPrompt) {
                  globalDeferredPrompt.prompt();
                } else {
                  setShowAndroidGuide(false);
                  toast.success('ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে "Install app" চাপুন।');
                }
              }}
              className="w-full h-10 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
            >
              ঠিক আছে, বুঝেছি
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. iOS Visual Install Guide Modal (For iPhone/iPad users) */}
      <Dialog open={showIosGuide} onOpenChange={setShowIosGuide}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 sm:p-6 rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-primary" />
              আইফোনের হোম স্ক্রিনে যুক্ত করার সহজ নিয়ম
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Safari ব্রাউজারে নিচের ধাপগুলো অনুসরণ করলেই অ্যাপটি সরাসরি হোম স্ক্রিনে চলে আসবে:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs text-foreground">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                ১
              </div>
              <div className="flex-1">
                <span>সাফারি ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> আইকনে ট্যাপ করুন।</span>
              </div>
              <Share className="w-5 h-5 text-primary shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                ২
              </div>
              <div className="flex-1">
                <span>মেনু থেকে <strong>"Add to Home Screen"</strong> (হোম স্ক্রিনে যোগ করুন) অপশনটি চাপুন।</span>
              </div>
              <PlusSquare className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                ৩
              </div>
              <div className="flex-1">
                <span>উপরের ডান কোণায় <strong>"Add"</strong> বাটনে ক্লিক করলেই কাজ সম্পন্ন!</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              setShowIosGuide(false);
              setOpen(false);
            }}
            className="w-full h-10 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
          >
            বুঝেছি, সম্পন্ন করেছি
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact Draggable Floating Install Pill
const PWA_POS_KEY = 'dbs_pwa_btn_pos';

const getInitialPwaPos = () => {
  try {
    const saved = localStorage.getItem(PWA_POS_KEY);
    if (saved) return JSON.parse(saved) as { x: number; y: number };
  } catch {}
  return null;
};

export function PwaFloatingInstallButton() {
  const [isApp, setIsApp] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posRef = useRef<{ x: number; y: number } | null>(getInitialPwaPos());
  const [pos, setPos] = useState<{ x: number; y: number } | null>(posRef.current);
  const rafIdRef = useRef<number | null>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsApp(standalone);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
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

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    const el = btnRef.current;
    if (!el) return;

    const deltaX = Math.abs(e.clientX - (posRef.current?.x ?? 0) - dragStartRef.current.x);
    const deltaY = Math.abs(e.clientY - (posRef.current?.y ?? 0) - dragStartRef.current.y);
    if (deltaX > 2 || deltaY > 2) {
      hasDraggedRef.current = true;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;

    let nx = e.clientX - dragStartRef.current.x;
    let ny = e.clientY - dragStartRef.current.y;

    // Clamp inside viewport
    nx = Math.max(8, Math.min(nx, Math.max(8, vw - bw - 8)));
    ny = Math.max(8, Math.min(ny, Math.max(8, vh - bh - 8)));

    targetPosRef.current = { x: nx, y: ny };
    posRef.current = { x: nx, y: ny };

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

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const el = btnRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      el.style.willChange = 'auto';
      el.style.transition = 'transform 0.15s ease-out';
    }

    if (posRef.current) {
      setPos(posRef.current);
      try {
        localStorage.setItem(PWA_POS_KEY, JSON.stringify(posRef.current));
      } catch {}
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  if (isApp) return null;

  const style: React.CSSProperties = pos
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        right: 'auto',
        bottom: 'auto',
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        zIndex: 9990,
        touchAction: 'none',
      }
    : {
        zIndex: 9990,
        touchAction: 'none',
      };

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={handleClick}
      style={style}
      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-primary/95 hover:bg-primary text-primary-foreground font-semibold text-[11px] sm:text-xs shadow-lg hover:shadow-xl active:scale-95 transition-shadow border border-white/25 backdrop-blur-xs select-none cursor-grab active:cursor-grabbing ${
        !pos ? 'fixed bottom-[4.5rem] sm:bottom-6 left-2 sm:left-4' : ''
      }`}
      title="DBS Bank SG অ্যাপ ইনস্টল করুন (ড্র্যাগ করে সরানো যায়)"
    >
      <Download className="w-3.5 h-3.5 animate-bounce shrink-0 pointer-events-none" />
      <span className="whitespace-nowrap pointer-events-none font-bold">অ্যাপ ইনস্টল</span>
    </button>
  );
}
