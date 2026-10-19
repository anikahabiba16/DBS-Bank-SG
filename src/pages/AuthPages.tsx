import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Phone,
  Lock,
  User,
  LogIn,
  UserPlus,
  Globe,
  Smartphone,
  Info,
  Eye,
  EyeOff,
  Headphones,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { InternationalPhoneInput } from '@/components/common/InternationalPhoneInput';
import { useLanguage } from '@/contexts/LanguageContext';
import PageMeta from '@/components/common/PageMeta';

export const LoginPage: React.FC = () => {
  const { loginUser, registerUser, currentUser, settings } = useLoan();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Mandatory: Login & Register MUST land on /dashboard on entry, never home page
  const redirectPath = '/dashboard';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(() => {
    if (location.pathname === '/register' || searchParams.get('tab') === 'register') {
      return 'register';
    }
    return 'login';
  });

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // If already logged in, automatically redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // App Install Notification (shows once, persists skip permanently)
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const isApp =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isApp) return false;
      const dismissed = sessionStorage.getItem('dbs_pwa_install_dismissed_permanently') === 'true';
      return !dismissed;
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    try {
      sessionStorage.setItem('dbs_pwa_install_dismissed_permanently', 'true');
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch {}
    setShowInstallBanner(false);
  };

  const handleOpenInstall = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginPhone.trim()) {
      toast.error('অনুগ্রহ করে মোবাইল নম্বর দিন');
      return;
    }

    if (!loginPassword.trim()) {
      toast.error('অনুগ্রহ করে পাসওয়ার্ড দিন');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await loginUser(loginPhone.trim(), loginPassword.trim());
      if (res.success) {
        toast.success(res.message);
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('লগইন করার সময় একটি ত্রুটি দেখা দিয়েছে');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim()) {
      toast.error('অনুগ্রহ করে পুরো নাম লিখুন');
      return;
    }

    const cleanDigits = regPhone.trim().replace(/\D/g, '');

    if (!regPhone.trim() || cleanDigits.length < 7) {
      toast.error('অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 6) {
      toast.error('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }

    setRegLoading(true);

    const res = registerUser({
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim()
    });

    setRegLoading(false);

    if (res.success) {
      toast.success('অ্যাকাউন্ট সফলভাবে খোলা হয়েছে এবং লগইন সম্পন্ন হয়েছে!');
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(res.message);
    }
  };

  // প্ল্যাটফর্মের নাম ও লোগো
  const platformTitle = settings.companyNameBn || settings.platformName || 'DBS Bank SG';
  const rawPortalLogo = settings.userPortalLogoUrl || "/images/logo/logo-128.png";
  const userPortalLogo = rawPortalLogo.includes('medo.dev') ? '/images/logo/logo-128.png' : rawPortalLogo;
  const bgLogo = settings.loginBackgroundLogoUrl || userPortalLogo;

  return (
    <CustomerLayout>
      <PageMeta
        title={activeTab === 'login' ? `লগইন | ${platformTitle}` : `নতুন নিবন্ধন | ${platformTitle}`}
        description="DBS Bank SG ডিজিটাল ব্যাংকিং ও লোন সার্ভিস পোর্টালে লগইন বা নতুন অ্যাকাউন্ট নিবন্ধন করুন।"
        canonical="https://dbs-bank-sg.vercel.app/login"
      />
      <div className="relative py-10 md:py-20 px-4 min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-50">
        {/* Full-screen DBS Bank & Modern Financial District Ultra-High Resolution Crisp 4K Identity */}
        <div 
          className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=45&w=960&auto=format&fm=webp&fit=crop"
            srcSet="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=45&w=640&auto=format&fm=webp&fit=crop 640w, https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=45&w=960&auto=format&fm=webp&fit=crop 960w, https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=45&w=1080&auto=format&fm=webp&fit=crop 1080w"
            sizes="(max-width: 768px) 100vw, 960px"
            alt="DBS Bank Singapore Financial District"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width="960"
            height="640"
            className="w-full h-full object-cover object-center filter brightness-[0.97] contrast-[1.05] scale-100 transform"
          />
          {/* Crystal Clear Light Overlay with Soft Cool Slate & Ocean Glass Tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 via-sky-50/65 to-sky-100/30 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/25 via-primary/5 to-transparent" />
          {/* Subtle Ambient Glowing Orbs matching primary color */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-card/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.8)_inset] p-6 sm:p-8 md:p-9 transition-all">
          {/* Header */}
          <div className="text-center mb-6">
            {/* Custom User Portal Logo (Image 2) */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 shadow-lg shadow-primary/25 bg-white p-1 border border-slate-200">
              <img
                src={userPortalLogo}
                alt={`${platformTitle} Logo`}
                width="64"
                height="64"
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {platformTitle}
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              নিরাপদ, আধুনিক ও সহজ শর্তে ডিজিটাল ব্যাংকিং ও লোন সেবা
            </p>
          </div>

          {/* App Install Notification Banner (Shown once, permanently hidden when skipped) */}
          {showInstallBanner && !currentUser && (
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between gap-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    📲 DBS Bank SG অ্যাপ ইনস্টল করুন
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    সহজে ব্যবহার ও নোটিফিকেশন পেতে হোম স্ক্রিনে নিন
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenInstall}
                  className="h-7 text-xs font-bold bg-primary text-primary-foreground px-2.5 rounded-lg shadow-xs"
                >
                  ইনস্টল
                </Button>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                  title="আর দেখাবেন না"
                  aria-label="আর দেখাবেন না"
                >
                  স্কিপ
                </button>
              </div>
            </div>
          )}

          {/* Login and registration tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as 'login' | 'register')
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6 h-11 p-1 bg-muted/80 rounded-xl border border-border/60">
              <TabsTrigger
                value="login"
                className="font-bangla font-bold text-xs md:text-sm flex items-center justify-center gap-2 py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <LogIn className="w-4 h-4 shrink-0" /> <span>{isEn ? 'Login' : 'লগইন করুন'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="register"
                className="font-bangla font-bold text-xs md:text-sm flex items-center justify-center gap-2 py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <UserPlus className="w-4 h-4 shrink-0" /> <span>{isEn ? 'Register' : 'নতুন নিবন্ধন'}</span>
              </TabsTrigger>
            </TabsList>

            {/* Login tab */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="on">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {isEn ? 'Mobile Number (Select Country)' : 'মোবাইল নম্বর (দেশ নির্বাচন করুন)'}
                    </Label>

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      {isEn ? 'International' : 'আন্তর্জাতিক'}
                    </span>
                  </div>

                  <InternationalPhoneInput
                    id="login-phone"
                    value={loginPhone}
                    onChange={(phone) => setLoginPhone(phone)}
                    placeholder={isEn ? 'Enter mobile number' : 'মোবাইল নম্বর দিন'}
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      {isEn ? 'Password' : 'পাসওয়ার্ড'}
                    </Label>

                    <span className="text-[11px] text-muted-foreground">
                      {isEn ? 'Default: 123456' : 'ডিফল্ট: 123456'}
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={isEn ? 'Enter your password' : 'আপনার গোপন পাসওয়ার্ড দিন'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 text-sm rounded-xl pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                      title={showLoginPassword ? (isEn ? 'Hide password' : 'পাসওয়ার্ড লুকান') : (isEn ? 'Show password' : 'পাসওয়ার্ড দেখুন')}
                      aria-label={showLoginPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-11 font-bold bg-primary text-primary-foreground text-sm rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] transition-transform"
                >
                  {loginLoading ? (isEn ? 'Verifying...' : 'যাচাই করা হচ্ছে...') : (isEn ? 'Login' : 'লগইন করুন')}
                </Button>
              </form>
            </TabsContent>

            {/* Registration tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" autoComplete="on">
                <div className="space-y-1">
                  <Label htmlFor="reg-name" className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {isEn ? 'Full Name (As per NID/Passport)' : 'পূর্ণ নাম (NID অনুযায়ী)'}
                  </Label>

                  <Input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder={isEn ? 'Enter your full name' : 'আপনার পূর্ণ নাম লিখুন'}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="h-10 text-sm rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {isEn ? 'Active Mobile Number (Any country)' : 'সক্রিয় মোবাইল নম্বর (যেকোনো দেশ)'}
                    </Label>

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      {isEn ? 'International' : 'আন্তর্জাতিক সমর্থিত'}
                    </span>
                  </div>

                  <InternationalPhoneInput
                    id="reg-phone"
                    value={regPhone}
                    onChange={(phone) => setRegPhone(phone)}
                    placeholder={isEn ? 'Enter mobile number' : 'মোবাইল নম্বর দিন'}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Helpful note */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-xs leading-relaxed flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {isEn
                      ? 'After logging in, you can link your bKash, Nagad or bank account anytime from the dashboard.'
                      : 'লগইন করার পর ড্যাশবোর্ড থেকে যেকোনো সময় আপনার বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্ট যুক্ত করতে পারবেন।'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-password" className="text-xs font-semibold">
                      {isEn ? 'Password' : 'পাসওয়ার্ড'}
                    </Label>

                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={isEn ? 'At least 6 characters' : 'কমপক্ষে ৬ অক্ষর'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-10 text-sm rounded-xl pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        title={showRegPassword ? (isEn ? 'Hide password' : 'পাসওয়ার্ড লুকান') : (isEn ? 'Show password' : 'পাসওয়ার্ড দেখুন')}
                        aria-label={showRegPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showRegPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-confirm-password" className="text-xs font-semibold">
                      {isEn ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
                    </Label>

                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={isEn ? 'Re-enter password' : 'পুনরায় পাসওয়ার্ড দিন'}
                        value={regConfirmPassword}
                        onChange={(e) =>
                          setRegConfirmPassword(e.target.value)
                        }
                        className="h-10 text-sm rounded-xl pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        title={showRegConfirmPassword ? (isEn ? 'Hide password' : 'পাসওয়ার্ড লুকান') : (isEn ? 'Show password' : 'পাসওয়ার্ড দেখুন')}
                        aria-label={showRegConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showRegConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full h-11 font-bold bg-primary text-primary-foreground text-sm rounded-xl shadow-md shadow-primary/20 mt-2 hover:scale-[1.01] transition-transform"
                >
                  {regLoading
                    ? (isEn ? 'Creating account...' : 'অ্যাকাউন্ট তৈরি হচ্ছে...')
                    : (isEn ? 'Complete Registration' : 'নিবন্ধন সম্পন্ন করুন')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Quick 24/7 Customer Support & Helpdesk for visitors/guests */}
          <div className="mt-6 pt-5 border-t border-border/60 text-center">
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="w-full py-2.5 px-4 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Headphones className="w-4 h-4 text-primary shrink-0 animate-pulse" />
              <span>লগইনে সমস্যা? ২৪/৭ লাইভ সাপোর্ট ও মেসেজ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export const RegisterPage: React.FC = () => {
  return <LoginPage />;
};
