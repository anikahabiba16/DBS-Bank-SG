import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Lock, User, CheckCircle2, Globe, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { InternationalPhoneInput } from '@/components/common/InternationalPhoneInput';

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  open,
  onOpenChange,
  defaultTab = 'login',
  onSuccess
}) => {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useLoan();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      toast.error('অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!loginPassword.trim()) {
      toast.error('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);
    const res = loginUser(loginPhone.trim(), loginPassword.trim());
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      onOpenChange(false);
      navigate('/dashboard');
      onSuccess?.();
    } else {
      toast.error(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error('অনুগ্রহ করে আপনার পুরো নাম লিখুন');
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
      toast.error('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }

    setLoading(true);
    const res = registerUser({
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim()
    });
    setLoading(false);

    if (res.success) {
      toast.success('রেজিস্ট্রেশন সফল হয়েছে এবং আপনি লগইন হয়েছেন!');
      onOpenChange(false);
      navigate('/dashboard');
      onSuccess?.();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 bg-card max-h-[88dvh] overflow-y-auto rounded-2xl shadow-2xl">
        <DialogHeader className="text-left pb-2 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              সহজ
            </span>
            গ্রাহক অ্যাকাউন্ট সেবা
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'register')} className="mt-3">
          <TabsList className="grid grid-cols-2 w-full h-11 p-1 bg-muted/70 rounded-xl border border-border/60">
            <TabsTrigger
              value="login"
              className="font-bangla font-bold text-sm flex items-center justify-center gap-2 py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>লগইন করুন</span>
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="font-bangla font-bold text-sm flex items-center justify-center gap-2 py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>নতুন নিবন্ধন</span>
            </TabsTrigger>
          </TabsList>

          {/* LOGIN tab */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> মোবাইল নম্বর
                  </Label>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" /> আন্তর্জাতিক
                  </span>
                </div>
                <InternationalPhoneInput
                  value={loginPhone}
                  onChange={(phone) => setLoginPhone(phone)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-10 text-sm pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title={showLoginPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-10 font-bold bg-primary text-primary-foreground">
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="space-y-4 pt-3">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> পুরো নাম
                </Label>
                <Input
                  type="text"
                  placeholder="এনআইডি অনুযায়ী নাম লিখুন"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> মোবাইল নম্বর
                  </Label>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" /> আন্তর্জাতিক সমর্থিত
                  </span>
                </div>
                <InternationalPhoneInput
                  value={regPhone}
                  onChange={(phone) => setRegPhone(phone)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                </Label>
                <div className="relative">
                  <Input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="গোপন পাসওয়ার্ড তৈরি করুন"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-10 text-sm pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title={showRegPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> পাসওয়ার্ড নিশ্চিত করুন
                </Label>
                <div className="relative">
                  <Input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    placeholder="পুনরায় একই পাসওয়ার্ড লিখুন"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="h-10 text-sm pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title={showRegConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-10 font-bold bg-primary text-primary-foreground">
                {loading ? 'নিবন্ধন তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি ও লগইন করুন'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
