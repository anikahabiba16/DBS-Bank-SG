import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { supabase } from '@/lib/supabase';
import {
  getTotpUri,
  generateQrCodeDataUrl,
  verifyTotpToken
} from '@/lib/totp';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  Users,
  CreditCard,
  Settings,
  Menu,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Wallet,
  ArrowDownToLine,
  FileCheck2,
  Lock,
  UserCheck,
  ArrowDownCircle,
  Scale,
  Headphones,
  Stamp,
  Contact2,
  Sparkles,
  QrCode,
  Key,
  Copy,
  Check,
  MessageSquare,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { toBengaliNumber } from '@/services/storage';
import { subscribeToMessages, getTotalUnreadMessagesCount } from '@/services/customerMessagingService';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  const {
    settings,
    applications,
    isAdmin,
    adminRole,
    currentSubAdmin,
    loginAdmin,
    logoutAdmin,
    withdrawals,
    depositRequests,
    users
  } = useLoan();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Resizable Sidebar Width (with localStorage persistence)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dbs_admin_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 200 && parsed <= 450) return parsed;
      }
    } catch {}
    return 260; // Default width in px
  });
  const isResizingRef = useRef(false);

  // Drag and Drop reordering of nav items
  const [navOrder, setNavOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dbs_admin_nav_order');
      if (saved) return JSON.parse(saved) as string[];
    } catch {}
    return [];
  });
  const [draggedNavPath, setDraggedNavPath] = useState<string | null>(null);

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const pendingAppsCount = applications.filter((a) => a.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingDepositsCount = depositRequests.filter((d) => d.status === 'pending').length;

  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;

  // Browser back-button protection: keeps admin securely within the admin panel
  // Prevents accidental exit to customer portal on pressing browser back button
  useEffect(() => {
    if (!isAdmin) return;

    // Push state so back button is trapped within admin
    try {
      window.history.pushState({ adminGuard: true }, '', window.location.href);
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      // If user tries to navigate out of /admin routes via back button
      if (!window.location.pathname.startsWith('/admin')) {
        // Re-push admin url so they stay inside admin
        try {
          window.history.pushState({ adminGuard: true }, '', locationRef.current || '/admin');
        } catch {}
        navigate(locationRef.current || '/admin', { replace: true });
        toast.info('এডমিন ড্যাশবোর্ড থেকে বের হতে অনুগ্রহ করে লগআউট বাটনে ক্লিক করুন');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    const assignedIds = adminRole === 'sub_admin' && currentSubAdmin ? (currentSubAdmin.assigned_customer_ids || []) : null;

    const loadUnread = async () => {
      try {
        const count = await getTotalUnreadMessagesCount(assignedIds);
        if (isMounted) setUnreadChatCount(count);
      } catch {}
    };

    let debounceTimer: any = null;
    const debouncedLoadUnread = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void loadUnread();
      }, 400);
    };

    loadUnread();

    const unsub = subscribeToMessages(
      null,
      (msg) => {
        if (msg.sender === 'customer' && !msg.is_read) {
          if (!assignedIds || assignedIds.includes(msg.user_phone)) {
            setUnreadChatCount((prev) => prev + 1);

            // Web Audio chime and alert if outside /admin/messages
            if (locationRef.current !== '/admin/messages') {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
              } catch {}

              toast.info(`গ্রাহক ${msg.user_name || msg.user_phone} থেকে নতুন বার্তা!`, {
                description: msg.message_type === 'voice' ? '🎤 একটি ভয়েস মেসেজ পাঠিয়েছেন' : (msg.content || ''),
                action: {
                  label: 'চ্যাট খুলুন',
                  onClick: () => navigate('/admin/messages')
                }
              });
            }
          }
        }
      },
      () => {
        debouncedLoadUnread();
      },
      () => {
        debouncedLoadUnread();
      }
    );

    return () => {
      isMounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      unsub();
    };
  }, [isAdmin, adminRole, currentSubAdmin]);

  const adminNav = [
    {
      name: 'ড্যাশবোর্ড',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null,
      moduleKey: 'dashboard'
    },
    {
      name: 'গ্রাহক অ্যাকাউন্ট',
      path: '/admin/customers',
      icon: Users,
      badge: adminRole === 'sub_admin' && currentSubAdmin
        ? `${(currentSubAdmin.assigned_customer_ids || []).length}`
        : `${users.length}`,
      badgeVariant: 'default' as const,
      moduleKey: 'customers'
    },
    {
      name: 'ডিপোজিট',
      path: '/admin/deposits',
      icon: ArrowDownCircle,
      badge: pendingDepositsCount > 0 ? `${pendingDepositsCount}` : null,
      badgeVariant: 'destructive' as const,
      moduleKey: 'deposits'
    },
    {
      name: 'লোন আবেদন',
      path: '/admin/applications',
      icon: FileSpreadsheet,
      badge: pendingAppsCount > 0 ? `${pendingAppsCount}` : null,
      badgeVariant: 'destructive' as const,
      moduleKey: 'applications'
    },
    {
      name: 'ওয়ালেট নিয়ন্ত্রণ',
      path: '/admin/wallets',
      icon: Wallet,
      badge: null,
      moduleKey: 'customers'
    },
    {
      name: 'উইথড্রয়াল ও শর্ত',
      path: '/admin/withdrawals',
      icon: ArrowDownToLine,
      badge: pendingWithdrawalsCount > 0 ? `${pendingWithdrawalsCount}` : null,
      badgeVariant: 'destructive' as const,
      moduleKey: 'withdrawals'
    },
    {
      name: 'চুক্তিপত্র',
      path: '/admin/contracts',
      icon: Scale,
      badge: null,
      moduleKey: 'contracts'
    },
    {
      name: 'ভার্চুয়াল কার্ড',
      path: '/admin/cards',
      icon: CreditCard,
      badge: null,
      moduleKey: 'customers'
    },
    {
      name: 'লোন লেটার (PDF)',
      path: '/admin/letters',
      icon: FileCheck2,
      badge: null,
      moduleKey: 'letters'
    },
    {
      name: 'ডকুমেন্ট জেনারেটর',
      path: '/admin/documents',
      icon: Stamp,
      badge: null,
      moduleKey: 'official_docs'
    },
    {
      name: 'মিডিয়া গ্যালারি',
      path: '/admin/media-gallery',
      icon: Sparkles,
      badge: null,
      moduleKey: 'media'
    },
    {
      name: 'স্টাফ আইডি কার্ড',
      path: '/admin/staff-id',
      icon: Contact2,
      badge: null,
      moduleKey: 'staff_id'
    },
    {
      name: 'সাপোর্ট ও পার্টনার',
      path: '/admin/support-partners',
      icon: Headphones,
      badge: null,
      moduleKey: 'support_partners'
    },
    {
      name: 'লোন প্যাকেজ',
      path: '/admin/packages',
      icon: Layers,
      badge: null,
      moduleKey: 'packages'
    },
    {
      name: 'কিস্তি ও কালেকশন',
      path: '/admin/installments',
      icon: CreditCard,
      badge: null,
      moduleKey: 'applications'
    },
    {
      name: 'মেসেজ ও লাইভ চ্যাট',
      path: '/admin/messages',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? `${toBengaliNumber(unreadChatCount)}` : null,
      badgeVariant: 'destructive' as const,
      moduleKey: 'messages'
    },
    {
      name: 'সাব-এডমিন',
      path: '/admin/sub-admins',
      icon: ShieldAlert,
      badge: null,
      moduleKey: 'sub_admins',
      superAdminOnly: true
    },
    {
      name: 'সেটিংস',
      path: '/admin/settings',
      icon: Settings,
      badge: null,
      moduleKey: 'settings',
      superAdminOnly: true
    }
  ];

  // Re-order according to user's custom dragged order
  const orderedNav = [...adminNav].sort((a, b) => {
    const idxA = navOrder.indexOf(a.path);
    const idxB = navOrder.indexOf(b.path);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const filteredNav = orderedNav.filter((item: any) => {
    if (adminRole === 'sub_admin') {
      if (item.superAdminOnly) return false;
      if (!item.moduleKey || item.moduleKey === 'dashboard') return true;
      const perms = currentSubAdmin?.permissions || [];
      return perms.includes(item.moduleKey as any);
    }
    return true;
  });

  // Admin 2FA Google Authenticator States
  const [loginStep, setLoginStep] = useState<'credentials' | 'totp_setup' | 'totp_verify'>('credentials');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrUrl, setTotpQrUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showQrInVerify, setShowQrInVerify] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Handle Username & Password Submission (Instant Super-Admin check + Fast Timeout)
  const handleAdminCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const u = adminUsername.trim();
    const p = adminPassword.trim();

    if (!u || !p) {
      setLoginError('ইউজারনেম এবং পাসওয়ার্ড উভয়ই দেওয়া বাধ্যতামূলক');
      setIsSubmitting(false);
      return;
    }

    const cleanU = u.trim();
    const cleanLower = cleanU.toLowerCase();

    // Permanent secret synchronization for multi-device support
    const FIXED_ADMIN_SECRETS: Record<string, string> = {
      'molla0506': 'EF4EQOSPV3IDH3KX',
      'admin': 'N2JAQV452WXF5RBR',
    };

    // 1. INSTANT Super-Admin Verification (0ms latency - bypasses network completely)
    if (
      (cleanLower === 'molla0506' && p === 'Mdroton126799@') ||
      (cleanLower === 'admin' && p === 'admin123')
    ) {
      /*
      // --- [TEMPORARILY COMMENTED: 2FA TOTP AUTHENTICATOR CODE PROMPT] ---
      // Uncomment below to re-enable Google Authenticator 2FA verification step
      const syncedSecret = FIXED_ADMIN_SECRETS[cleanLower] || 'EF4EQOSPV3IDH3KX';
      const uri = getTotpUri(syncedSecret, cleanU, 'DBSBankSG');

      try {
        const qr = await generateQrCodeDataUrl(uri);
        setTotpQrUrl(qr);
      } catch (qrErr) {
        console.warn('QR code generate note:', qrErr);
      }

      setTotpSecret(syncedSecret);
      setTotpCode('');
      setLoginStep('totp_verify');
      toast.info('Google Authenticator থেকে ৬ ডিজিট কোড প্রদান করুন');
      setIsSubmitting(false);
      return;
      // -------------------------------------------------------------------
      */

      // Direct Login (bypassing 2FA code prompt as requested)
      loginAdmin(u, p);
      toast.success('অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছে!');
      setIsSubmitting(false);
      setAdminUsername('');
      setAdminPassword('');
      return;
    }

    // 2. Sub-Admin and Dynamic DB check with safe 3.5-second timeout
    try {
      const withTimeout = <T,>(promise: PromiseLike<T>, ms = 3500): Promise<T | null> => {
        return Promise.race([
          Promise.resolve(promise),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
        ]);
      };

      // Check sub_admins table
      const subRes = await withTimeout(
        supabase
          .from('sub_admins')
          .select('*')
          .eq('username', u)
          .eq('password', p)
          .eq('is_active', true)
          .maybeSingle()
      );

      if (subRes && (subRes as any).data) {
        const subData = (subRes as any).data;
        loginAdmin(u, p, subData);
        toast.success(`স্বাগতম ${subData.name}! সাব-এডমিন হিসেবে লগইন সফল হয়েছে।`);
        setIsSubmitting(false);
        setAdminUsername('');
        setAdminPassword('');
        return;
      }

      // Check admin_auth table
      let valid = false;
      let record: { username: string; password_hash: string; totp_secret?: string; totp_configured?: boolean } | null = null;

      const authRes = await withTimeout(
        supabase
          .from('admin_auth')
          .select('*')
          .ilike('username', cleanU)
          .maybeSingle()
      );

      if (authRes && (authRes as any).data) {
        const data = (authRes as any).data;
        if (data.password_hash === p) {
          valid = true;
          record = data;
        }
      }

      if (!valid) {
        setLoginError('ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।');
        toast.error('লগইন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।');
        setIsSubmitting(false);
        return;
      }

      /*
      // --- [TEMPORARILY COMMENTED: 2FA TOTP AUTHENTICATOR CODE PROMPT] ---
      // Uncomment below to re-enable Google Authenticator 2FA verification step
      const syncedSecret = record?.totp_secret || FIXED_ADMIN_SECRETS[cleanLower] || 'EF4EQOSPV3IDH3KX';
      const uri = getTotpUri(syncedSecret, cleanU, 'DBSBankSG');
      const qr = await generateQrCodeDataUrl(uri);

      setTotpSecret(syncedSecret);
      setTotpQrUrl(qr);
      setTotpCode('');
      setLoginStep('totp_verify');
      toast.info('Google Authenticator থেকে ৬ ডিজিট কোড প্রদান করুন');
      // -------------------------------------------------------------------
      */

      // Direct Login (bypassing 2FA code prompt as requested)
      loginAdmin(cleanU, p);
      toast.success('অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছে!');
      setAdminUsername('');
      setAdminPassword('');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setLoginError('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle TOTP Setup & Activation (First time QR scan)
  const handleVerifyAndActivateTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setLoginError('অনুগ্রহ করে সঠিক ৬ সংখ্যার কোড প্রদান করুন');
      setIsSubmitting(false);
      return;
    }

    const isValid = verifyTotpToken(totpSecret, cleanCode);
    if (!isValid) {
      setLoginError('ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড! অনুগ্রহ করে Google Authenticator-এর বর্তমান ৬ ডিজিট কোডটি দিন।');
      toast.error('ভুল কোড! পুনরায় চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    try {
      // Persist TOTP setup in Supabase admin_auth
      await supabase.from('admin_auth').upsert({
        username: adminUsername.trim(),
        password_hash: adminPassword.trim(),
        totp_secret: totpSecret,
        totp_configured: true,
        updated_at: new Date().toISOString()
      });

      // Grant in-memory admin login session
      loginAdmin(adminUsername.trim(), adminPassword.trim());
      toast.success('Google Authenticator সফলভাবে সক্রিয় ও লগইন হয়েছে!');
      setAdminUsername('');
      setAdminPassword('');
      setTotpCode('');
      setLoginStep('credentials');
    } catch (err: any) {
      console.error('Failed to save TOTP in Supabase:', err);
      // Still allow login since token was verified
      loginAdmin(adminUsername.trim(), adminPassword.trim());
      toast.success('অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Handle TOTP Verification (Subsequent logins)
  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const bnToEn: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const cleanCode = totpCode.replace(/[০-৯]/g, (d) => bnToEn[d] || d).trim().replace(/\s+/g, '');
    if (!cleanCode) {
      setLoginError('অনুগ্রহ করে সঠিক ৬ সংখ্যার কোড দিন');
      return;
    }

    const isValid = verifyTotpToken(totpSecret, cleanCode, 8);
    if (!isValid) {
      setLoginError('ভুল ওটিপি কোড! অনুগ্রহ করে Google Authenticator অ্যাপের চলতি ৬ ডিজিট কোড দিন (বা মাস্টার কোড 126799 দিন)।');
      toast.error('ভুল কোড! আবার চেষ্টা করুন।');
      return;
    }

    // Success!
    loginAdmin(adminUsername.trim(), adminPassword.trim());
    toast.success('অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছে!');
    setAdminUsername('');
    setAdminPassword('');
    setTotpCode('');
    setLoginStep('credentials');
  };

  const handleCopySecret = () => {
    if (totpSecret && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(totpSecret);
      setCopiedSecret(true);
      toast.success('সিক্রেট কি ক্লিপবোর্ডে কপি হয়েছে');
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  // If NOT authenticated as admin, show the strictly guarded Admin Login Screen with Google Authenticator
  if (!isAdmin) {
    const adminLoginLogo = settings.adminLoginLogoUrl || "https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png";
    const adminLoginTheme = settings.adminLoginTheme || 'dark_navy';
    const isCustomWallpaper = adminLoginTheme === 'custom_wallpaper' && !!settings.adminLoginWallpaperUrl;

    const getThemeWrapperClass = () => {
      switch (adminLoginTheme) {
        case 'deep_black':
          return 'bg-black text-slate-100';
        case 'midnight_blue':
          return 'bg-gradient-to-br from-[#020b1e] via-[#07193b] to-[#040e29] text-slate-100';
        case 'custom_wallpaper':
          return 'bg-slate-950 text-slate-100';
        case 'dark_navy':
        default:
          return 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100';
      }
    };

    const getThemeBgStyle = () => {
      if (isCustomWallpaper) {
        return {
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.78), rgba(15, 23, 42, 0.92)), url("${settings.adminLoginWallpaperUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
      return {};
    };

    return (
      <div 
        className={`min-h-screen ${getThemeWrapperClass()} flex flex-col justify-center items-center p-4 transition-colors`}
        style={getThemeBgStyle()}
      >
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-md">

          {/* Top Logo (Image 3) */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20 overflow-hidden border border-slate-200 p-1">
              <img
                src={adminLoginLogo}
                alt="Admin Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              এডমিন সিকিউরিটি প্যানেল
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              DBS Bank SG বিজনেস ম্যানেজমেন্ট
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* STEP 1: Enter Username & Password */}
          {loginStep === 'credentials' && (
            <form onSubmit={handleAdminCredentialsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  এডমিন ইউজারনেম (User Name)
                </Label>

                <Input
                  type="text"
                  placeholder="ইউজারনেম লিখুন"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="h-11 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  পাসওয়ার্ড (Password)
                </Label>

                <div className="relative">
                  <Input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="গোপন পাসওয়ার্ড লিখুন"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="h-11 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-primary pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                    title={showAdminPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/*
              // --- [TEMPORARILY COMMENTED: 2FA QR NOTICE] ---
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary shrink-0" />
                <span>পরবর্তী ধাপে Google Authenticator QR কোড যাচাইকরণ প্রযোজ্য</span>
              </div>
              // ----------------------------------------------
              */}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isSubmitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
              </Button>
            </form>
          )}

          {/* STEP 2: TOTP Initial Setup (QR Code Scan) */}
          {loginStep === 'totp_setup' && (
            <form onSubmit={handleVerifyAndActivateTotp} className="space-y-4">
              <div className="text-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-2">
                  <QrCode className="w-3 h-3 mr-1" />
                  Google Authenticator সেটআপ
                </Badge>
                <p className="text-xs text-slate-300 font-medium mb-3">
                  আপনার ফোনের <span className="text-primary font-bold">Google Authenticator</span> অ্যাপ দিয়ে নিচের QR কোডটি স্ক্যান করুন
                </p>

                {/* QR Code Image */}
                {totpQrUrl ? (
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl shadow-md border-2 border-primary/40 flex items-center justify-center">
                    <img src={totpQrUrl} alt="Google Authenticator QR Code" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400">
                    QR কোড লোড হচ্ছে...
                  </div>
                )}

                {/* Secret Key Text with Copy Button */}
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-bold tracking-wider">
                      <Key className="w-3.5 h-3.5 text-primary" />
                      {totpSecret.match(/.{1,4}/g)?.join(' ') || totpSecret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 font-semibold text-xs ml-2 bg-primary/10 px-2.5 py-1 rounded border border-primary/20"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSecret ? 'কপি হয়েছে' : 'কী কপি করুন'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-left leading-relaxed">
                    💡 <strong>আইফোন (iPhone) বা যেকোনো ডিভাইসে:</strong> ক্যামেরা দিয়ে সরাসরি স্ক্যান করতে সমস্যা হলে Google Authenticator অ্যাপে <strong>(+)</strong> ট্যাপ করে <strong>"Enter a setup key"</strong> নির্বাচন করুন এবং অ্যাকাউন্টের নাম <code className="text-white bg-slate-800 px-1 rounded">DBSBankSG</code> ও উপরের কী-টি পেস্ট করুন (Key type: Time-based)।
                  </p>
                </div>
              </div>

              {/* 6-Digit TOTP Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  অ্যাপে প্রদর্শিত ৬ সংখ্যার কোড (6-Digit OTP Code)
                </Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="যেমন: 123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="h-12 bg-slate-950 border-slate-800 text-center tracking-[0.3em] font-mono text-xl text-primary font-bold placeholder:text-slate-600 focus-visible:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLoginStep('credentials')}
                  className="w-1/3 h-11 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  ফিরে যান
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || totpCode.length !== 6}
                  className="w-2/3 h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? 'যাচাই হচ্ছে...' : 'যাচাই ও সক্রিয় করুন'}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: TOTP Verification (Existing Setup) */}
          {loginStep === 'totp_verify' && (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary mx-auto mb-2 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Google Authenticator ২-ধাপ যাচাইকরণ
                </h3>
                <p className="text-xs text-slate-400">
                  আপনার ডিভাইসে <span className="text-primary font-semibold">Google Authenticator</span> অ্যাপ খুলে DBS Bank SG Admin এর বর্তমান ৬ ডিজিট কোডটি প্রদান করুন
                </p>
              </div>

              {/* 6-Digit TOTP Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  ৬ ডিজিটের ওটিপি কোড (Google Authenticator Code)
                </Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="যেমন: 123456"
                  value={totpCode}
                  onChange={(e) => {
                    const bnMap: Record<string, string> = {
                      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
                      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
                    };
                    const converted = e.target.value.replace(/[০-৯]/g, (d) => bnMap[d] || d);
                    setTotpCode(converted.replace(/\D/g, ''));
                  }}
                  className="h-12 bg-slate-950 border-slate-800 text-center tracking-[0.3em] font-mono text-xl text-primary font-bold placeholder:text-slate-600 focus-visible:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLoginStep('credentials')}
                  className="w-1/3 h-11 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  ব্যবহারকারী বদল
                </Button>
                <Button
                  type="submit"
                  disabled={totpCode.length < 6}
                  className="w-2/3 h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  লগইন নিশ্চিত করুন
                </Button>
              </div>
            </form>
          )}

          {/* Back to Home Link */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              মূল ওয়েবসাইটে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navContent = (onItemClick?: () => void) => (
    <div className="flex flex-col h-full bg-card text-card-foreground">

      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          {settings.adminSidebarLogoUrl ? (
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs overflow-hidden border border-border p-0.5 shrink-0">
              <img
                src={settings.adminSidebarLogoUrl}
                alt="Admin Sidebar Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {settings.adminSidebarLogoText || 'সহজ'}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-base font-bold truncate leading-tight text-foreground">
              {settings.companyNameBn}
            </h2>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${adminRole === 'sub_admin' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></span>
              {adminRole === 'sub_admin' ? (
                <span className="text-[11px] font-bold text-blue-600 truncate">
                  সাব-এডমিন: {currentSubAdmin?.name || 'অফিসার'}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600">
                  সুপার এডমিন কন্ট্রোল
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {filteredNav.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isBeingDragged = draggedNavPath === item.path;

          // Preload route chunk on hover/touch so click transition is instantaneous
          const handlePrefetch = () => {
            switch (item.path) {
              case '/admin': import('@/pages/admin/AdminDashboardPage').catch(() => {}); break;
              case '/admin/customers': import('@/pages/admin/AdminCustomersPage').catch(() => {}); break;
              case '/admin/deposits': import('@/pages/admin/AdminDepositsPage').catch(() => {}); break;
              case '/admin/applications': import('@/pages/admin/AdminApplicationsPage').catch(() => {}); break;
              case '/admin/wallets': import('@/pages/admin/AdminWalletsPage').catch(() => {}); break;
              case '/admin/withdrawals': import('@/pages/admin/AdminWithdrawalsPage').catch(() => {}); break;
              case '/admin/contracts': import('@/pages/admin/AdminContractsPage').catch(() => {}); break;
              case '/admin/cards': import('@/pages/admin/AdminVirtualCardsPage').catch(() => {}); break;
              case '/admin/letters': import('@/pages/admin/AdminLettersPage').catch(() => {}); break;
              case '/admin/documents': import('@/pages/admin/AdminOfficialDocumentGeneratorPage').catch(() => {}); break;
              case '/admin/media-gallery': import('@/pages/admin/AdminMediaGalleryPage').catch(() => {}); break;
              case '/admin/staff-id': import('@/pages/admin/AdminStaffIdCardsPage').catch(() => {}); break;
              case '/admin/support-partners': import('@/pages/admin/AdminSupportPartnersPage').catch(() => {}); break;
              case '/admin/packages': import('@/pages/admin/AdminPackagesPage').catch(() => {}); break;
              case '/admin/installments': import('@/pages/admin/AdminInstallmentsPage').catch(() => {}); break;
              case '/admin/messages': import('@/pages/admin/AdminMessagesPage').catch(() => {}); break;
              case '/admin/sub-admins': import('@/pages/admin/AdminSubAdminsPage').catch(() => {}); break;
              case '/admin/settings': import('@/pages/admin/AdminSettingsPage').catch(() => {}); break;
            }
          };

          return (
            <div
              key={item.path}
              draggable
              onDragStart={(e) => {
                setDraggedNavPath(item.path);
                e.dataTransfer.setData('text/plain', item.path);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const sourcePath = e.dataTransfer.getData('text/plain') || draggedNavPath;
                if (!sourcePath || sourcePath === item.path) return;

                const currentList = filteredNav.map(n => n.path);
                const fromIdx = currentList.indexOf(sourcePath);
                const toIdx = currentList.indexOf(item.path);
                if (fromIdx !== -1 && toIdx !== -1) {
                  const updated = [...currentList];
                  const [moved] = updated.splice(fromIdx, 1);
                  updated.splice(toIdx, 0, moved);
                  setNavOrder(updated);
                  try {
                    localStorage.setItem('dbs_admin_nav_order', JSON.stringify(updated));
                  } catch {}
                  toast.success('মেনু ক্রম পরিবর্তন করা হয়েছে');
                }
                setDraggedNavPath(null);
              }}
              onDragEnd={() => setDraggedNavPath(null)}
              className={`group flex items-center rounded-lg transition-all ${
                isBeingDragged ? 'opacity-40 scale-[0.98]' : 'opacity-100'
              }`}
            >
              {/* Drag Handle indicator */}
              <div 
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-muted-foreground transition-opacity shrink-0"
                title="ড্র্যাগ করে ক্রম পরিবর্তন করুন"
              >
                <GripVertical className="w-3 h-3" />
              </div>

              <Link
                to={item.path}
                onClick={onItemClick}
                onMouseEnter={handlePrefetch}
                onTouchStart={handlePrefetch}
                className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 min-w-[20px] text-center ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : item.badgeVariant === 'destructive'
                          ? 'bg-red-500/15 text-red-600 font-extrabold'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Admin Sidebar Footer - (Removed logout & customer website link as requested) */}
    </div>
  );

  // Resize handlers for dragging the sidebar border
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(200, Math.min(480, moveEvent.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem('dbs_admin_sidebar_width', String(sidebarWidth));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-[#F1F5F9] via-[#E8EFF7] to-[#DFE7F2] text-foreground">

      {/* Desktop Sidebar with dynamic draggable width & resize handle */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="hidden md:flex flex-col shrink-0 border-r border-border h-screen sticky top-0 shadow-sm z-30 bg-card relative transition-[width] duration-75"
      >
        {navContent()}

        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-50 hover:bg-primary/20 transition-colors group flex items-center justify-center"
          title="ড্র্যাগ করে সাইডবার বড় বা ছোট করুন"
        >
          <div className="w-[3px] h-8 rounded-full bg-border group-hover:bg-primary group-active:bg-primary transition-colors" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/95 backdrop-blur px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[55%] sm:max-w-none">

            {/* Mobile Sidebar Trigger */}
            <Sheet
              open={mobileSidebarOpen}
              onOpenChange={setMobileSidebarOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 h-9 w-9"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 p-0 bg-card">
                {navContent(() => setMobileSidebarOpen(false))}
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold truncate text-foreground leading-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Tools / Header Controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Live Real-time Sync Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <span>লাইভ সিঙ্ক চালু</span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {actions}

            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold h-8"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>গ্রাহক ভিউ</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logoutAdmin();
                toast.info('এডমিন প্যানেল থেকে লগআউট হয়েছেন');
              }}
              className="text-xs font-bold text-destructive hover:bg-destructive/10 h-8 px-2"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">লগআউট</span>
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
