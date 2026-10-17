import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { SiteSettings, CustomerReview, PartnerBank } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  RotateCcw, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Sparkles, 
  Sliders, 
  ShieldCheck,
  CheckCircle2,
  MessageSquareQuote,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
  Star,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { DirectImageUploadField } from '@/components/common/DirectImageUploadField';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useLoan();

  // Local form state initialized from current settings
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>(formData.customerReviews || []);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewAmount, setNewReviewAmount] = useState('৳২,৫০,০০০');
  const [newReviewAvatar, setNewReviewAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');

  // Partner banks state
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>(formData.partnerBanks || []);
  const [newBankName, setNewBankName] = useState('');
  const [newBankLogo, setNewBankLogo] = useState('');
  const [newBankUrl, setNewBankUrl] = useState('');
  const [newBankType, setNewBankType] = useState('বাণিজ্যিক ব্যাংক');

  const handleChange = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddReview = () => {
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      toast.error('নাম এবং মন্তব্য পূরণ করুন');
      return;
    }
    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      role: newReviewRole.trim() || 'ক্ষুদ্র উদ্যোক্তা, ঢাকা',
      comment: newReviewComment.trim(),
      loanAmount: newReviewAmount.trim() || '৳১,০০,০০০',
      rating: 5,
      avatarUrl: newReviewAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isVerified: true
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    setFormData((prev) => ({ ...prev, customerReviews: updated }));
    setNewReviewName('');
    setNewReviewRole('');
    setNewReviewComment('');
    toast.success('নতুন গ্রাহক রিভিউ যুক্ত করা হয়েছে!');
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    setFormData((prev) => ({ ...prev, customerReviews: updated }));
    toast.success('রিভিউ মুছে ফেলা হয়েছে');
  };

  const handleAddPartnerBank = () => {
    if (!newBankName.trim() || !newBankUrl.trim()) {
      toast.error('ব্যাংকের নাম এবং ওয়েবসাইট লিংক পূরণ করুন');
      return;
    }
    const newBank: PartnerBank = {
      id: `bank-${Date.now()}`,
      nameBn: newBankName.trim(),
      nameEn: newBankName.trim(),
      logoUrl: newBankLogo.trim() || 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&auto=format&fit=crop&q=80',
      websiteUrl: newBankUrl.trim(),
      type: newBankType.trim()
    };
    const updated = [...partnerBanks, newBank];
    setPartnerBanks(updated);
    setFormData((prev) => ({ ...prev, partnerBanks: updated }));
    setNewBankName('');
    setNewBankLogo('');
    setNewBankUrl('');
    toast.success('নতুন পার্টনার ব্যাংক যুক্ত করা হয়েছে!');
  };

  const handleDeletePartnerBank = (id: string) => {
    const updated = partnerBanks.filter((b) => b.id !== id);
    setPartnerBanks(updated);
    setFormData((prev) => ({ ...prev, partnerBanks: updated }));
    toast.success('পার্টনার ব্যাংক মুছে ফেলা হয়েছে');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const finalData: SiteSettings = {
      ...formData,
      customerReviews: reviews,
      partnerBanks: partnerBanks
    };
    updateSettings(finalData);
    toast.success('সাইটের কনটেন্ট ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', {
      description: 'কাস্টম ডোমেইন (bdloan.world) সহ সকল গ্রাহকদের জন্য রিয়েল-টাইমে ক্লাউডে আপডেট করা হয়েছে।'
    });
    setTimeout(() => setIsSaving(false), 600);
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি ডিফল্ট সেটিংস ফিরিয়ে আনতে চান?')) {
      resetAllData();
      toast.success('ডিফল্ট সেটিংস সফলভাবে ফিরিয়ে আনা হয়েছে!');
    }
  };

  return (
    <AdminLayout
      title="সাইট কনটেন্ট ও প্ল্যাটফর্ম সেটিংস এডিটর"
      subtitle="ওয়েবসাইটের নাম (DBS Bank SG বা আপনার পছন্দের নাম), গ্রাহক রিভিউ, পার্টনার ব্যাংক ও ব্যানার পরিবর্তন করুন"
      actions={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>রিয়েল-টাইম ক্লাউড সিঙ্ক সক্রিয়</span>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold gap-1.5"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Dynamic Project / System Name */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              <CardTitle className="text-lg font-serif">প্রজেক্ট / সিস্টেমের নাম ও ব্র্যান্ডিং</CardTitle>
            </div>
            <CardDescription className="text-xs">
              ডিফল্ট নাম "DBS Bank SG" থেকে পরিবর্তন করে আপনার পছন্দের যেকোনো প্ল্যাটফর্মের নাম নির্ধারণ করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="platformNameBn">সিস্টেম / প্ল্যাটফর্মের মূল নাম (বাংলা) *</Label>
              <Input
                id="platformNameBn"
                value={formData.platformNameBn || formData.companyNameBn}
                onChange={(e) => {
                  handleChange('platformNameBn', e.target.value);
                  handleChange('companyNameBn', e.target.value);
                }}
                placeholder="যেমন: DBS Bank SG"
                className="font-bold text-sm"
                required
              />
              <p className="text-[11px] text-muted-foreground">ওয়েবসাইটের সর্বত্র, হেডার, কার্ড এবং সনদে এই নামটি স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyNameEn">সিস্টেমের ইংরেজি নাম (English)</Label>
              <Input
                id="companyNameEn"
                value={formData.platformNameEn || formData.companyNameEn}
                onChange={(e) => {
                  handleChange('platformNameEn', e.target.value);
                  handleChange('companyNameEn', e.target.value);
                }}
                placeholder="যেমন: DBS Bank SG"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="companySloganBn">কোম্পানির মূল স্লোগান / ট্যাগলাইন</Label>
              <Input
                id="companySloganBn"
                value={formData.companySloganBn}
                onChange={(e) => handleChange('companySloganBn', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Brand Logos & Theme Customization (Images 1, 2, 3) */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold">লোগো ও থিম কাস্টমাইজেশন (Logos & Visual Theme)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              এডমিন প্যানেল সাইডবার লোগো, ইউজার লগইন কার্ড লোগো এবং এডমিন সিকিউরিটি প্যানেলের লোগো ও ব্যাকগ্রাউন্ড থিম রিয়েল-টাইমে পরিবর্তন করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-6 text-xs">
            {/* 1. Admin Sidebar & Header Logo (Image 1) */}
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  ১. এডমিন প্যানেল সাইডবার ও হেডার লোগো (Admin Sidebar Logo)
                </span>
                <Badge variant="outline" className="text-[10px]">Image 1</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                এডমিন প্যানেলে বাম পাশের সাইডবারে উপরে কোম্পানির নামের পাশে যে লোগো বা টেক্সট আইকন প্রদর্শিত হয়।
              </p>
              <div className="space-y-4">
                <DirectImageUploadField
                  id="adminSidebarLogoUrl"
                  label="সাইডবার লোগো সরাসরি আপলোড (Admin Sidebar Logo)"
                  description="কম্পিউটার বা মোবাইল থেকে সরাসরি লোগো ফাইল সিলেক্ট করুন অথবা ইমেজ লিঙ্ক পেস্ট করুন।"
                  value={formData.adminSidebarLogoUrl || ''}
                  onChange={(val) => handleChange('adminSidebarLogoUrl', val)}
                  placeholder="https://.../logo.png"
                  folder="admin_sidebar"
                  aspectHint="1:1 বা অনুভূমিক লোগো"
                />

                <div className="space-y-1.5">
                  <Label htmlFor="adminSidebarLogoText">লোগো সংক্ষিপ্ত টেক্সট / ব্যাজ (ডিফল্ট: সহজ)</Label>
                  <Input
                    id="adminSidebarLogoText"
                    value={formData.adminSidebarLogoText || ''}
                    onChange={(e) => handleChange('adminSidebarLogoText', e.target.value)}
                    placeholder="যেমন: সহজ বা DBS"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center p-1 shadow-xs overflow-hidden">
                  {formData.adminSidebarLogoUrl ? (
                    <img src={formData.adminSidebarLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                      {formData.adminSidebarLogoText || 'সহজ'}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-foreground">সাইডবার লোগো প্রিভিউ</span>
                  <p className="text-[10px] text-muted-foreground">এডমিন সাইডবারের শীর্ষে এই আকারে প্রদর্শিত হবে</p>
                </div>
              </div>
            </div>

            {/* 2. User Portal Login Page Logo (Image 2) */}
            <div className="p-4 rounded-xl border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ২. গ্রাহক পোর্টাল ও লগইন কার্ড লোগো (User Login Page Logo)
                </span>
                <Badge variant="outline" className="text-[10px]">Image 2</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                গ্রাহক যখন ওয়েবসাইটে লগইন বা রেজিস্ট্রেশন করতে প্রবেশ করবেন, তখন লগইন কার্ডের শীর্ষে এবং ব্যাকগ্রাউন্ড ওয়াটারমার্কে এই লোগো দৃশ্যমান থাকবে।
              </p>
              
              <div className="space-y-4">
                <DirectImageUploadField
                  id="userPortalLogoUrl"
                  label="ইউজার লগইন কার্ড লোগো সরাসরি আপলোড"
                  description="কম্পিউটার বা মোবাইল থেকে সরাসরি লোগো ফাইল সিলেক্ট করুন অথবা ইমেজ লিঙ্ক পেস্ট করুন।"
                  value={formData.userPortalLogoUrl || ''}
                  onChange={(val) => handleChange('userPortalLogoUrl', val)}
                  placeholder="https://.../user-logo.png"
                  folder="user_portal"
                />

                <DirectImageUploadField
                  id="loginBackgroundLogoUrl"
                  label="লগইন ব্যাকগ্রাউন্ড ওয়াটারমার্ক লোগো আপলোড"
                  description="লগইন পেজের ওয়াটারমার্ক ব্যাকগ্রাউন্ডের জন্য লোগো ছবি।"
                  value={formData.loginBackgroundLogoUrl || ''}
                  onChange={(val) => handleChange('loginBackgroundLogoUrl', val)}
                  placeholder="https://.../watermark.png"
                  folder="watermarks"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center p-1 shadow-xs overflow-hidden">
                  <img
                    src={formData.userPortalLogoUrl || "https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png"}
                    alt="User Logo Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-foreground">গ্রাহক লগইন কার্ড লোগো প্রিভিউ</span>
                  <p className="text-[10px] text-muted-foreground">লগইন পেজে কার্ডের কেন্দ্রে এই লোগোটি থাকবে</p>
                </div>
              </div>
            </div>

            {/* 3. Admin Security Panel Logo & Background Theme (Image 3) */}
            <div className="p-4 rounded-xl border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  ৩. এডমিন সিকিউরিটি প্যানেল লোগো ও ব্যাকগ্রাউন্ড থিম (Admin Security Theme)
                </span>
                <Badge variant="outline" className="text-[10px]">Image 3</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                এডমিন সিকিউরিটি লগইন কার্ডের লোগো এবং পুরো স্ক্রিনের ব্যাকগ্রাউন্ড থিম ও কাস্টম ওয়ালপেপার নির্ধারণ করুন।
              </p>

              <div className="space-y-4">
                <DirectImageUploadField
                  id="adminLoginLogoUrl"
                  label="এডমিন সিকিউরিটি কার্ড লোগো সরাসরি আপলোড"
                  description="কম্পিউটার বা মোবাইল থেকে এডমিন সিকিউরিটি লোগো ছবি সিলেক্ট করুন।"
                  value={formData.adminLoginLogoUrl || ''}
                  onChange={(val) => handleChange('adminLoginLogoUrl', val)}
                  placeholder="https://.../admin-security-logo.png"
                  folder="admin_security"
                />

                <div className="space-y-1.5">
                  <Label htmlFor="adminLoginTheme">ব্যাকগ্রাউন্ড থিম নির্বাচন করুন</Label>
                  <select
                    id="adminLoginTheme"
                    value={formData.adminLoginTheme || 'dark_navy'}
                    onChange={(e) => handleChange('adminLoginTheme', e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="dark_navy">১. ক্লাসিক ডার্ক নেভি ব্লু (Dark Navy - ডিফল্ট)</option>
                    <option value="deep_black">২. ডিপ ওলেড ব্ল্যাক (Deep OLED Black)</option>
                    <option value="midnight_blue">৩. রয়্যাল মিডনাইট স্যাফায়ার (Midnight Sapphire Blue)</option>
                    <option value="custom_wallpaper">৪. কাস্টম ব্যাকগ্রাউন্ড ওয়ালপেপার ছবি (Custom Wallpaper)</option>
                  </select>
                </div>

                {formData.adminLoginTheme === 'custom_wallpaper' && (
                  <DirectImageUploadField
                    id="adminLoginWallpaperUrl"
                    label="কাস্টম ব্যাকগ্রাউন্ড ওয়ালপেপার ছবি সরাসরি আপলোড"
                    description="কম্পিউটার বা মোবাইল থেকে পুরো স্ক্রিনের ওয়ালপেপার ছবি আপলোড করুন অথবা লিঙ্ক দিন।"
                    value={formData.adminLoginWallpaperUrl || ''}
                    onChange={(val) => handleChange('adminLoginWallpaperUrl', val)}
                    placeholder="https://images.unsplash.com/... বা যেকোনো ওয়ালপেপার ছবির লিঙ্ক"
                    folder="wallpapers"
                    aspectHint="16:9 ফুলস্ক্রিন"
                  />
                )}
              </div>

              {/* Admin Login Live Mini Preview */}
              <div className="mt-3 p-4 rounded-xl border bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                {formData.adminLoginTheme === 'custom_wallpaper' && formData.adminLoginWallpaperUrl && (
                  <div
                    className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url("${formData.adminLoginWallpaperUrl}")` }}
                  />
                )}
                <div className="relative z-10 w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 mx-auto mb-2 p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.adminLoginLogoUrl || "https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png"}
                      alt="Admin Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>এডমিন সিকিউরিটি প্যানেল</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    থিম প্রিভিউ: {formData.adminLoginTheme || 'dark_navy'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Customer Reviews / Happy Stories Management */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-accent" />
              <CardTitle className="text-lg font-serif">সম্মানিত গ্রাহকদের অভিজ্ঞতা ও হ্যাপি রিভিউ (Happy Stories)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              গ্রাহকদের ছবি, ঋণের পরিমাণ এবং প্রশংসামূলক রিভিউ যুক্ত বা মুছে ফেলুন
            </CardDescription>
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
              <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                <Image className="w-4 h-4 text-primary shrink-0" />
                সরাসরি গ্যালারি থেকে ছবি আপলোড, লোন প্রমোশন ব্যানার ও স্ক্রোলযোগ্য গ্যালারি পরিচালনার জন্য মিডিয়া ম্যানেজারে যান:
              </span>
              <Button asChild size="sm" variant="default" className="text-xs h-7 shrink-0 gap-1">
                <a href="/admin/media-gallery">
                  মিডিয়া ও বিজ্ঞাপন গ্যালারি খুলুন
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-6 text-xs">
            {/* Add New Review Box */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" /> নতুন গ্রাহক রিভিউ যোগ করুন
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>গ্রাহকের নাম</Label>
                  <Input
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>পেশা ও জেলা</Label>
                  <Input
                    placeholder="যেমন: ক্ষুদ্র উদ্যোক্তা, বগুড়া"
                    value={newReviewRole}
                    onChange={(e) => setNewReviewRole(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>গৃহীত লোন</Label>
                  <Input
                    placeholder="যেমন: ৳২,৫০,০০০"
                    value={newReviewAmount}
                    onChange={(e) => setNewReviewAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label>গ্রাহকের মন্তব্য</Label>
                  <Input
                    placeholder="যেমন: খুব দ্রুত এবং সহজে লোন পেয়ে ব্যবসার পরিধি বাড়াতে পেরেছি..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>ছবির লিংক (Avatar URL)</Label>
                  <Input
                    placeholder="https://..."
                    value={newReviewAvatar}
                    onChange={(e) => setNewReviewAvatar(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddReview}
                className="bg-primary text-primary-foreground font-bold text-xs gap-1 h-9"
              >
                <Plus className="w-3.5 h-3.5" /> রিভিউ যোগ করুন
              </Button>
            </div>

            {/* List of Existing Reviews */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase">
                বর্তমানে প্রদর্শিত রিভিউসমূহ ({reviews.length} টি):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border bg-card flex items-start justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <img
                        src={r.avatarUrl}
                        alt={r.name}
                        className="w-10 h-10 rounded-full object-cover border shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{r.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-50">
                            {r.loanAmount}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{r.role}</p>
                        <p className="text-xs text-foreground/90 italic">"{r.comment}"</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(r.id)}
                      className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Partner Banks Management */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <CardTitle className="text-lg font-serif">সহযোগী ও পার্টনার ব্যাংকসমূহ (Partner Banks)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              ব্যাংকের নাম, লোগো এবং অফিসিয়াল ওয়েবসাইট লিংক পরিচালনা করুন (ক্লিক করলে মূল ওয়েবসাইটে যাবে)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-6 text-xs">
            {/* Add Partner Bank */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" /> নতুন পার্টনার ব্যাংক যুক্ত করুন
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>ব্যাংকের নাম</Label>
                  <Input
                    placeholder="যেমন: স্ট্যান্ডার্ড চার্টার্ড বাংলাদেশ"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>ওয়েবসাইট লিংক (Website URL)</Label>
                  <Input
                    placeholder="https://www.sc.com/bd/"
                    value={newBankUrl}
                    onChange={(e) => setNewBankUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>লোগো লিংক (Logo URL)</Label>
                  <Input
                    placeholder="https://..."
                    value={newBankLogo}
                    onChange={(e) => setNewBankLogo(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddPartnerBank}
                className="bg-primary text-primary-foreground font-bold text-xs gap-1 h-9"
              >
                <Plus className="w-3.5 h-3.5" /> পার্টনার ব্যাংক সেভ করুন
              </Button>
            </div>

            {/* Existing Banks List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase">
                সংযুক্ত ব্যাংকসমূহ ({partnerBanks.length} টি):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {partnerBanks.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={b.logoUrl}
                        alt={b.nameBn}
                        className="w-8 h-8 rounded object-cover border shrink-0 bg-muted"
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-foreground text-xs truncate">{b.nameBn}</h5>
                        <a
                          href={b.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5 truncate"
                        >
                          ভিজিট সাইট <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePartnerBank(b.id)}
                      className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Announcement Notice Bar */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg font-serif">টপ নোটিশ ও জরুরি ঘোষণা বার</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.noticeActive}
                  onCheckedChange={(checked) => handleChange('noticeActive', checked)}
                  id="notice-active"
                />
                <Label htmlFor="notice-active" className="text-xs cursor-pointer font-medium">
                  {formData.noticeActive ? 'গ্রাহক সাইটে নোটিশ চালু' : 'নোটিশ বন্ধ'}
                </Label>
              </div>
            </div>
            <CardDescription className="text-xs">
              হোমপেজ ও প্রতিটি পৃষ্ঠার উপরে প্রদর্শিত জরুরি নোটিশ
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="noticeBannerBn">নোটিশ টেক্সট (বাংলা)</Label>
              <Textarea
                id="noticeBannerBn"
                rows={2}
                value={formData.noticeBannerBn}
                onChange={(e) => handleChange('noticeBannerBn', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 6. Contact & Support Information */}
        <Card className="ed-card border-border">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              <CardTitle className="text-lg font-serif">যোগাযোগ ও অফিস তথ্য</CardTitle>
            </div>
            <CardDescription className="text-xs">
              গ্রাহক সহায়তা হেল্পলাইন, অফিস ঠিকানা ও কার্যদিবস
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="supportPhone">প্রধান হেল্পলাইন মোবাইল নম্বর</Label>
              <Input
                id="supportPhone"
                value={formData.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supportEmail">অফিসিয়াল ইমেইল</Label>
              <Input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="officeTimeBn">অফিসের কার্যসময় বিবরণ</Label>
              <Input
                id="officeTimeBn"
                value={formData.officeTimeBn}
                onChange={(e) => handleChange('officeTimeBn', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="defaultInterestRateGlobal">ক্যালকুলেটরের গড় সুদের হার (%)</Label>
              <Input
                id="defaultInterestRateGlobal"
                type="number"
                step={0.1}
                value={formData.defaultInterestRateGlobal}
                onChange={(e) => handleChange('defaultInterestRateGlobal', Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="officeAddressBn">অফিসের ঠিকানা</Label>
              <Input
                id="officeAddressBn"
                value={formData.officeAddressBn}
                onChange={(e) => handleChange('officeAddressBn', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save & Reset Button Bar */}
        <div className="p-4 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট সেটিংসে ফিরুন</span>
          </Button>

          <Button
            type="submit"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold gap-1.5 px-6"
          >
            <Save className="w-3.5 h-3.5" />
            <span>সকল পরিবর্তন সেভ করুন</span>
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};
