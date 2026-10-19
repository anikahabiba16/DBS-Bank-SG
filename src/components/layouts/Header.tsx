
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Phone,
  Search,
  User,
  LogOut,
  Wallet,
  Smartphone,
  Bell,
  ChevronDown,
  Headphones
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BDLoanLogo } from '@/components/common/BDLoanLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { formatTaka } from '@/services/storage';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { settings, currentUser, logout } = useLoan();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackSearchId, setTrackSearchId] = useState('');

  // Dynamic header branding text
  const { language, t } = useLanguage();
  const headerName = language === 'en' 
    ? (settings.companyNameEn || 'DBS Bank SG')
    : (settings.companyNameBn || settings.platformName || 'DBS Bank SG');

  const navLinks = [
    { name: t('nav.home', 'হোম'), path: '/' },
    { name: t('nav.packages', 'লোন প্যাকেজসমূহ'), path: '/packages' },
    { name: t('nav.apply', 'আবেদন করুন'), path: '/apply' },
    { name: t('nav.track', 'স্ট্যাটাস ট্র্যাকিং'), path: '/track' }
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackSearchId.trim()) {
      toast.error('অনুগ্রহ করে সঠিক আবেদন আইডি বা মোবাইল নম্বর দিন');
      return;
    }

    setTrackDialogOpen(false);
    navigate(`/track?query=${encodeURIComponent(trackSearchId.trim())}`);
  };

  const handleInstallApp = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
      {/* Top Notice Bar */}
      {settings.noticeActive && settings.noticeBannerBn && (
        <div className="bg-primary text-primary-foreground text-xs px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-1.5 max-w-full overflow-hidden h-[30px] min-h-[30px] max-h-[30px] leading-[30px]">
          <Bell className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-300" />
          <span className="truncate max-w-[calc(100%-120px)] inline-block leading-[30px]">{settings.noticeBannerBn}</span>
          <Link to="/packages" className="underline font-bold text-[11px] ml-1 shrink-0 hover:text-white whitespace-nowrap leading-[30px]">
            বিস্তারিত দেখুন →
          </Link>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink min-w-0 group hover:opacity-95 transition-opacity">
          <BDLoanLogo size="md" customText={headerName} />
        </Link>

        {/* Desktop & Tablet Navigation Links - All 5 Links visible */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            // Short compact title for medium tablet screens
            const shortName = link.path === '/dashboard' 
              ? (language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড') 
              : link.path === '/packages' 
              ? (language === 'en' ? 'Packages' : 'প্যাকেজ') 
              : link.path === '/track'
              ? (language === 'en' ? 'Track' : 'ট্র্যাকিং')
              : link.name;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-1.5 lg:px-2.5 xl:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span className="inline lg:hidden">{shortName}</span>
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 min-h-[36px]">
          {/* Language Switcher */}
          <LanguageSwitcher className="hidden sm:inline-flex text-xs h-8" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTrackDialogOpen(true)}
            className="hidden sm:flex text-muted-foreground hover:text-foreground h-8 w-8 md:h-9 md:w-9"
            title="আবেদন খুঁজুন"
            aria-label="আবেদন খুঁজুন"
          >
            <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>


          {/* Fixed App Install Button in Navbar */}
          <button
            type="button"
            onClick={handleInstallApp}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
            title="DBS Bank SG মোবাইল অ্যাপ ইনস্টল করুন"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">অ্যাপ ইনস্টল</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all group shrink-0"
                title="ওয়ালেট ব্যালেন্স (ক্লিক করে ড্যাশবোর্ডে প্রবেশ করুন)"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] text-emerald-100 font-semibold uppercase tracking-wider">ওয়ালেট</span>
                  <span className="text-xs sm:text-sm font-black whitespace-nowrap text-white font-mono drop-shadow-xs">
                    {formatTaka(currentUser.walletBalance || 0)}
                  </span>
                </div>
              </Link>

              {/* Interactive Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 py-1 px-2 md:px-2.5 rounded-full hover:bg-muted/80 border border-transparent hover:border-border transition-all cursor-pointer group outline-none"
                    title="প্রোফাইল মেনু"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/25 overflow-hidden flex items-center justify-center shrink-0">
                      {currentUser.profileImage || currentUser.avatarUrl || currentUser.photoUrl ? (
                        <img
                          src={currentUser.profileImage || currentUser.avatarUrl || currentUser.photoUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <span
                      className="text-xs font-bold text-foreground max-w-[85px] md:max-w-[110px] truncate"
                      title={currentUser.name}
                    >
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl border bg-card">
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-bold text-foreground leading-none">{currentUser.name}</p>
                      <p className="text-[11px] leading-none text-muted-foreground font-mono">{currentUser.phone}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/dashboard"
                      className="group flex items-center gap-2 px-2.5 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-muted focus:bg-muted transition-colors text-foreground"
                    >
                      <Wallet className="w-3.5 h-3.5 text-primary shrink-0 transition-colors" />
                      <span className="transition-colors group-hover:text-primary">ড্যাশবোর্ড ও ওয়ালেট</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 border border-emerald-400/40 hover:scale-105 active:scale-95 shrink-0"
                title="ড্যাশবোর্ড ও ওয়ালেটে প্রবেশ করুন"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-2.5 h-2.5 text-white" />
                </div>
                <span>ড্যাশবোর্ড</span>
              </Link>
            </div>
          )}

          {/* Mobile Navigation Drawer */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="মেনু খুলুন">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 bg-card p-0 flex flex-col">
              <div className="p-3.5 border-b flex items-center justify-between">
                <BDLoanLogo size="sm" customText={headerName} />
                <LanguageSwitcher className="scale-90 origin-right" />
              </div>

              {currentUser ? (
                <div className="m-4 p-3 rounded-xl bg-muted/60 border space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group"
                    >
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{currentUser.name}</p>
                      <p className="text-[11px] text-muted-foreground">{currentUser.phone}</p>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="h-7 text-xs text-destructive"
                    >
                      লগআউট
                    </Button>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pt-2 border-t flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-primary" /> ওয়ালেট ব্যালেন্স:
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatTaka(currentUser.walletBalance || 0)}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="m-4 p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    আপনার {headerName} অ্যাকাউন্ট
                  </p>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                  </Link>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      location.pathname === link.path
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                ))}

                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleInstallApp();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>মোবাইল অ্যাপ ইনস্টল করুন</span>
                  </button>
                </div>
              </div>

            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Quick Track Application Modal */}
      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 bg-card max-h-[88dvh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              আবেদনের অবস্থা অনুসন্ধান করুন
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">
              আপনার ঋণের ট্র্যাকিং আইডি অথবা আবেদনকালে ব্যবহৃত মোবাইল নম্বর দিন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTrackSubmit} className="space-y-4 mt-2">
            <div>
              <Input
                placeholder="যেমন: LN-2026-1001 অথবা 01712345678"
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                className="h-11 text-sm"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTrackDialogOpen(false)}
              >
                বাতিল
              </Button>

              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                অনুসন্ধান করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};
