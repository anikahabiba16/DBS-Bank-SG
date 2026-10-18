import React, { useState, useRef } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PromotionMediaItem } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Image as ImageIcon, 
  Megaphone, 
  Users, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  Coins, 
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminMediaGalleryPage: React.FC = () => {
  const { 
    promotionMedia, 
    savePromotionMedia, 
    deletePromotionMedia, 
    resetPromotionMedia 
  } = useLoan();

  const [activeTab, setActiveTab] = useState<'all' | 'happy_customer' | 'loan_ad'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromotionMediaItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<'happy_customer' | 'loan_ad'>('happy_customer');
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLoanAmount, setFormLoanAmount] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerLocation, setFormCustomerLocation] = useState('');
  const [formCustomerProfession, setFormCustomerProfession] = useState('');
  const [formBadge, setFormBadge] = useState('সফল ঋণগ্রহীতা');
  const [formStory, setFormStory] = useState('');
  const [formCtaText, setFormCtaText] = useState('আবেদন করুন');
  const [formCtaLink, setFormCtaLink] = useState('/apply');
  const [formActive, setFormActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEditingItem(null);
    setFormCategory('happy_customer');
    setFormTitle('');
    setFormCaption('');
    setFormImageUrl('');
    setFormLoanAmount('৳ ৩,৫০,০০০');
    setFormCustomerName('');
    setFormCustomerLocation('');
    setFormCustomerProfession('');
    setFormBadge('সফল ঋণগ্রহীতা');
    setFormStory('');
    setFormCtaText('আবেদন করুন');
    setFormCtaLink('/apply');
    setFormActive(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: PromotionMediaItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTitle(item.titleBn);
    setFormCaption(item.captionBn || '');
    setFormImageUrl(item.imageUrl);
    setFormLoanAmount(String(item.loanAmount || ''));
    setFormCustomerName(item.customerName || '');
    setFormCustomerLocation(item.customerLocation || '');
    setFormCustomerProfession(item.customerProfession || '');
    setFormBadge(item.badgeBn || '');
    setFormStory(item.storyBn || '');
    setFormCtaText(item.ctaTextBn || 'আবেদন করুন');
    setFormCtaLink(item.ctaLink || '/apply');
    setFormActive(item.active !== false);
    setDialogOpen(true);
  };

  // Image Upload from Gallery/Device
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, .webp) নির্বাচন করুন');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormImageUrl(base64);
        toast.success('ডিভাইস বা গ্যালারি থেকে ছবি সফলভাবে আপলোড হয়েছে!');
      }
    };
    reader.onerror = () => {
      toast.error('ছবি আপলোডে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error('অনুগ্রহ করে শিরোনাম প্রদান করুন');
      return;
    }

    if (!formImageUrl.trim()) {
      toast.error('অনুগ্রহ করে একটি ছবি নির্বাচন বা আপলোড করুন');
      return;
    }

    const itemToSave: PromotionMediaItem = {
      id: editingItem ? editingItem.id : `pm-${Date.now()}`,
      titleBn: formTitle.trim(),
      captionBn: formCaption.trim() || undefined,
      category: formCategory,
      imageUrl: formImageUrl.trim(),
      loanAmount: formLoanAmount.trim() || undefined,
      customerName: formCategory === 'happy_customer' ? formCustomerName.trim() || undefined : undefined,
      customerLocation: formCategory === 'happy_customer' ? formCustomerLocation.trim() || undefined : undefined,
      customerProfession: formCategory === 'happy_customer' ? formCustomerProfession.trim() || undefined : undefined,
      badgeBn: formBadge.trim() || (formCategory === 'happy_customer' ? 'সফল ঋণগ্রহীতা' : 'বিশেষ অফার'),
      storyBn: formStory.trim() || undefined,
      ctaTextBn: formCtaText.trim() || 'আবেদন করুন',
      ctaLink: formCtaLink.trim() || '/apply',
      date: editingItem?.date || new Date().toISOString().split('T')[0],
      active: formActive
    };

    savePromotionMedia(itemToSave);
    toast.success(editingItem ? 'মিডিয়া আইটেম সফলভাবে আপডেট হয়েছে!' : 'নতুন মিডিয়া আইটেম যুক্ত হয়েছে!');
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" আইটেমটি নিশ্চিতভাবে মুছে ফেলতে চান?`)) {
      deletePromotionMedia(id);
      toast.success('আইটেমটি সফলভাবে মুছে ফেলা হয়েছে');
    }
  };

  const handleToggleActive = (item: PromotionMediaItem) => {
    const updated = { ...item, active: !item.active };
    savePromotionMedia(updated);
    toast.info(`স্ট্যাটাস ${updated.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি পূর্বনির্ধারিত (Default) সকল হ্যাপি কাস্টমার ও লোন এড পুনরুদ্ধার করতে চান?')) {
      resetPromotionMedia();
      toast.success('ডিফল্ট গ্যালারি আইটেমগুলো সফলভাবে পুনরুদ্ধার করা হয়েছে');
    }
  };

  // Filter items
  const filteredList = (promotionMedia || []).filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const happyCount = (promotionMedia || []).filter((i) => i.category === 'happy_customer').length;
  const adCount = (promotionMedia || []).filter((i) => i.category === 'loan_ad').length;
  const activeCount = (promotionMedia || []).filter((i) => i.active !== false).length;

  return (
    <AdminLayout
      title="মিডিয়া ও হ্যাপি কাস্টমার গ্যালারি"
      subtitle="ইউজার পেজে প্রদর্শিত সফল ঋণগ্রহীতাদের ছবি, টেস্টমোনিয়াল ও লোন প্রমোশন ব্যানার নিয়ন্ত্রণ করুন"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            ডিফল্ট রিস্টোর
          </Button>
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            নতুন ছবি/এড যোগ করুন
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile Quick Action Bar */}
        <div className="flex sm:hidden items-center gap-2 bg-card p-3 rounded-xl border border-border shadow-xs">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5 text-xs flex-1 h-9">
            <RotateCcw className="w-3.5 h-3.5" />
            ডিফল্ট রিস্টোর
          </Button>
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 text-xs flex-1 h-9">
            <Plus className="w-4 h-4" />
            নতুন ছবি যোগ
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">মোট ছবি ও এড</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{(promotionMedia || []).length} টি</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ImageIcon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">হ্যাপি কাস্টমার ছবি</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{happyCount} জন</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">লোন প্রমোশন এড</p>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{adCount} টি</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Megaphone className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">সক্রিয় রয়েছে</p>
                <h3 className="text-2xl font-bold text-primary mt-1">{activeCount} টি</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
               
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live User View Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-foreground">
              এই ছবি ও বিজ্ঞাপনগুলো ইউজার পেজের <strong>লোন প্যাকেজসমূহ (/packages)</strong> এর ঠিক নিচে স্ক্রোলযোগ্য গ্যালারি হিসেবে প্রদর্শিত হচ্ছে।
            </span>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 gap-1 text-xs">
            <a href="/packages" target="_blank" rel="noopener noreferrer">
              ইউজার পেজে দেখুন
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>

        {/* Filter Tabs & Content */}
        <Card className="bg-card">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold">ছবি ও প্রমোশন তালিকা</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  ছবি পরিবর্তন, টেক্সট এডিট বা নতুন ছবি যুক্ত করুন
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                  className="text-xs h-8"
                >
                  সবগুলো ({promotionMedia?.length || 0})
                </Button>
                <Button
                  variant={activeTab === 'happy_customer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('happy_customer')}
                  className="text-xs h-8 flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  হ্যাপি কাস্টমার ({happyCount})
                </Button>
                <Button
                  variant={activeTab === 'loan_ad' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('loan_ad')}
                  className="text-xs h-8 flex items-center gap-1"
                >
                  <Megaphone className="w-3 h-3" />
                  লোন এড ({adCount})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-xl">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-base font-semibold text-foreground">কোনো ছবি পাওয়া যায়নি</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  উপরে "নতুন ছবি/এড যোগ করুন" বাটনে ক্লিক করে যোগ করতে পারেন
                </p>
                <Button onClick={handleOpenAdd} size="sm">
                  নতুন যুক্ত করুন
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredList.map((item) => (
                  <Card key={item.id} className="overflow-hidden border border-border/70 flex flex-col bg-card/60 hover:shadow-md transition-shadow">
                    {/* Media Image Thumbnail */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.titleBn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {item.category === 'happy_customer' ? (
                          <Badge className="bg-emerald-600 text-white text-[11px] font-medium">
                            হ্যাপি কাস্টমার
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-600 text-white text-[11px] font-medium">
                            লোন প্রমোশন এড
                          </Badge>
                        )}
                        {item.badgeBn && (
                          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm text-[11px] border border-white/20">
                            {item.badgeBn}
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <Badge variant={item.active !== false ? 'default' : 'destructive'} className="text-[11px]">
                          {item.active !== false ? 'সক্রিয়' : 'বন্ধ'}
                        </Badge>
                      </div>

                      {item.loanAmount && (
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 border border-white/20">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>{item.loanAmount}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-foreground line-clamp-1">{item.titleBn}</h4>
                        {item.category === 'happy_customer' && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.customerProfession || 'ঋণগ্রহীতা'} {item.customerLocation ? `• ${item.customerLocation}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                          {item.storyBn || item.captionBn}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={item.active !== false}
                            onCheckedChange={() => handleToggleActive(item)}
                            title={item.active !== false ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          />
                          <span className="text-[11px] text-muted-foreground">
                            {item.active !== false ? 'অন' : 'অফ'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            এডিট
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id, item.titleBn)}
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg md:text-xl font-bold">
              {editingItem ? 'মিডিয়া আইটেম এডিট করুন' : 'নতুন ছবি বা লোন বিজ্ঞাপন যোগ করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ডিভাইস বা গ্যালারি থেকে সরাসরি ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ক্যাটেগরি নির্বাচন করুন</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formCategory === 'happy_customer' ? 'default' : 'outline'}
                  onClick={() => {
                    setFormCategory('happy_customer');
                    if (formBadge === 'বিশেষ অফার') setFormBadge('সফল ঋণগ্রহীতা');
                  }}
                  className="flex items-center justify-center gap-2 h-10 text-xs"
                >
                  <Users className="w-4 h-4" />
                  হ্যাপি কাস্টমার (Happy Customer)
                </Button>
                <Button
                  type="button"
                  variant={formCategory === 'loan_ad' ? 'default' : 'outline'}
                  onClick={() => {
                    setFormCategory('loan_ad');
                    if (formBadge === 'সফল ঋণগ্রহীতা') setFormBadge('সীমিত সময়ের অফার');
                  }}
                  className="flex items-center justify-center gap-2 h-10 text-xs"
                >
                  <Megaphone className="w-4 h-4" />
                  লোন প্রমোশন বিজ্ঞাপন (Loan Ad)
                </Button>
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2 p-3.5 rounded-lg border border-border/70 bg-muted/20">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>ছবি নির্বাচন (গ্যালারি বা ডিভাইস থেকে আপলোড)</span>
                <span className="text-[11px] text-muted-foreground">JPG, PNG, WEBP</span>
              </Label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Image Preview Box */}
                <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {formImageUrl ? (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                      <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                      <span className="text-[10px]">ছবি নেই</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 text-xs h-9 flex-1 sm:flex-initial"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      গ্যালারি / ডিভাইস থেকে ছবি বাছুন
                    </Button>
                  </div>
                  <div>
                    <Input
                      placeholder="অথবা ছবির সরাসরি URL লিংক দিন..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Caption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  {formCategory === 'happy_customer' ? 'শিরোনাম / কাস্টমার প্রোফাইল নাম' : 'বিজ্ঞাপনের মূল শিরোনাম'} *
                </Label>
                <Input
                  placeholder={formCategory === 'happy_customer' ? 'যেমন: মোঃ রফিকুল ইসলাম - ডেইরি খামার' : 'যেমন: ০% প্রসেসিং ফি ও ক্যাশব্যাক অফার'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  {formCategory === 'happy_customer' ? 'লোনের পরিমাণ (টাকা)' : 'লোন পরিসীমা / সর্বোচ্চ অংক'}
                </Label>
                <Input
                  placeholder="যেমন: ৳ ৩,৫০,০০০ অথবা ৫০,০০০ - ৫,০০,০০০"
                  value={formLoanAmount}
                  onChange={(e) => setFormLoanAmount(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Happy Customer Specific Fields */}
            {formCategory === 'happy_customer' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">গ্রাহকের নাম</Label>
                  <Input
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">পেশা / ব্যবসার ধরন</Label>
                  <Input
                    placeholder="যেমন: ক্ষুদ্র উদ্যোক্তা / ডেইরি খামারি"
                    value={formCustomerProfession}
                    onChange={(e) => setFormCustomerProfession(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">জেলা / এলাকা</Label>
                  <Input
                    placeholder="যেমন: বগুড়া সদর, রাজশাহী"
                    value={formCustomerLocation}
                    onChange={(e) => setFormCustomerLocation(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">বিজ্ঞাপন ব্যাজ (Badge)</Label>
                  <Input
                    placeholder="যেমন: সীমিত সময়ের অফার / বিশেষ ছাড়"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">বাটন লিংক (CTA Link)</Label>
                  <Input
                    placeholder="যেমন: /apply অথবা /packages"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            )}

            {/* Subtitle / Short Caption */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">সংক্ষিপ্ত ক্যাপশন / হাইলাইট</Label>
              <Input
                placeholder="যেমন: ৩ লক্ষ ৫০ হাজার টাকা লোন পেয়ে খামারে নতুন ২০টি গাভী সংযোজন"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Full Story or Details */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {formCategory === 'happy_customer' ? 'সফলতার গল্প ও গ্রাহকের প্রশংসামূলক মন্তব্য' : 'বিজ্ঞাপনের বিস্তারিত বিবরণ'}
              </Label>
              <Textarea
                placeholder="এখানে বিস্তারিত লিখুন যা কার্ডের ভেতর ও মোডালে দেখা যাবে..."
                value={formStory}
                onChange={(e) => setFormStory(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">ইউজার পেজে প্রদর্শন চালু রাখুন</Label>
                <p className="text-[11px] text-muted-foreground">বন্ধ রাখলে ইউজাররা এই ছবিটি দেখতে পাবে না</p>
              </div>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-xs">
              বাতিল
            </Button>
            <Button onClick={handleSave} className="text-xs">
              {editingItem ? 'পরিবর্তন সংরক্ষণ করুন' : 'যোগ করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
