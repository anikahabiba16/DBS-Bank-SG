import React, { useState, useEffect } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import {  SupportChannelOption, PartnerBankConfig } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Headphones, 
  Building2, 
  MessageCircle, 
  Send, 
  PhoneCall, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 

  Mail,
  MessageSquare,
  Power
 
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminSupportPartnersPage: React.FC = () => {
  const { 
    customerSupport, 
    updateCustomerSupport, 
    partnerBanks, 
    savePartnerBank, 
    deletePartnerBank 
  } = useLoan();

  // Support Channels State
  const [channels, setChannels] = useState<SupportChannelOption[]>([]);
  const [availableHoursBn, setAvailableHoursBn] = useState(customerSupport.availableHoursBn || '২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা');
  const [noticeBn, setNoticeBn] = useState(customerSupport.noticeBn || '');

  // Channel Add/Edit Dialog State
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<SupportChannelOption | null>(null);
  const [channelType, setChannelType] = useState<SupportChannelOption['type']>('imo');
  const [channelTitleBn, setChannelTitleBn] = useState('');
  const [channelAccountNumber, setChannelAccountNumber] = useState('');
  const [channelDirectLink, setChannelDirectLink] = useState('');
  const [channelExtraNote, setChannelExtraNote] = useState('');
  const [channelActive, setChannelActive] = useState(true);

  // Sync state when customerSupport updates from cloud
  useEffect(() => {
    if (customerSupport.channels && customerSupport.channels.length > 0) {
      setChannels(customerSupport.channels);
    } else {
      // Default legacy initial channels if empty
      setChannels([
        {
          id: 'ch-imo',
          type: 'imo',
          titleBn: 'ইমু (Imo) কাস্টমার সাপোর্ট',
          accountNumber: customerSupport.imoNumber || '+8801977425147',
          directLink: customerSupport.imoLink || 'https://imo.im',
          extraNote: 'ইমু সরাসরি বার্তা ও কল সেবা',
          active: true,
          order: 1
        },
        {
          id: 'ch-whatsapp',
          type: 'whatsapp',
          titleBn: 'হোয়াটসঅ্যাপ (WhatsApp) সাপোর্ট',
          accountNumber: customerSupport.whatsappNumber || '+8801977425147',
          directLink: `https://wa.me/${(customerSupport.whatsappNumber || '+8801977425147').replace(/[^0-9]/g, '')}`,
          extraNote: customerSupport.whatsappMessage || 'আসসালামু আলাইকুম, সহজ লোন কাস্টমার সার্ভিসের সাথে যোগাযোগ করতে চাই।',
          active: true,
          order: 2
        },
        {
          id: 'ch-telegram',
          type: 'telegram',
          titleBn: 'টেলিগ্রাম (Telegram) সাপোর্ট',
          accountNumber: customerSupport.telegramUsername || 'bdloan',
          directLink: customerSupport.telegramLink || 'https://t.me/bdloan',
          extraNote: 'টেলিগ্রাম ডিরেক্ট সাপোর্ট',
          active: true,
          order: 3
        },
        {
          id: 'ch-helpline',
          type: 'phone',
          titleBn: 'সরাসরি হেল্পলাইন ও কাজের সময়',
          accountNumber: customerSupport.helplinePhone || '+8801998765432',
          directLink: `tel:${customerSupport.helplinePhone || '+8801998765432'}`,
          extraNote: '২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা',
          active: true,
          order: 4
        }
      ]);
    }
    setAvailableHoursBn(customerSupport.availableHoursBn || '২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা');
    setNoticeBn(customerSupport.noticeBn || '');
  }, [customerSupport]);

  // Partner Bank Dialog
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<PartnerBankConfig | null>(null);
  const [bankNameBn, setBankNameBn] = useState('');
  const [bankNameEn, setBankNameEn] = useState('');
  const [bankLogoUrl, setBankLogoUrl] = useState('');
  const [partnershipTypeBn, setPartnershipTypeBn] = useState('');
  const [bankWebsiteUrl, setBankWebsiteUrl] = useState('');
  const [bankActive, setBankActive] = useState(true);

  // Open Add Channel
  const handleOpenAddChannel = () => {
    setEditingChannel(null);
    setChannelType('whatsapp');
    setChannelTitleBn('নতুন কাস্টমার সাপোর্ট');
    setChannelAccountNumber('+8801');
    setChannelDirectLink('');
    setChannelExtraNote('');
    setChannelActive(true);
    setChannelModalOpen(true);
  };

  // Open Edit Channel
  const handleOpenEditChannel = (ch: SupportChannelOption) => {
    setEditingChannel(ch);
    setChannelType(ch.type);
    setChannelTitleBn(ch.titleBn);
    setChannelAccountNumber(ch.accountNumber);
    setChannelDirectLink(ch.directLink || '');
    setChannelExtraNote(ch.extraNote || '');
    setChannelActive(ch.active !== false);
    setChannelModalOpen(true);
  };

  // Delete Channel
  const handleDeleteChannel = (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" সাপোর্ট চ্যানেলটি মুছে ফেলতে চান? গ্রাহক পেজে এটি আর দেখা যাবে না।`)) {
      const updated = channels.filter((c) => c.id !== id);
      setChannels(updated);
      persistChannels(updated);
      toast.success(`"${title}" চ্যানেলটি সফলভাবে মুছে ফেলা হয়েছে!`);
    }
  };

  // Toggle Active Channel
  const handleToggleChannelActive = (id: string) => {
    const updated = channels.map((c) => {
      if (c.id === id) {
        return { ...c, active: !c.active };
      }
      return c;
    });
    setChannels(updated);
    persistChannels(updated);
    toast.info('চ্যানেল সক্রিয়তার স্ট্যাটাস আপডেট করা হয়েছে');
  };

  // Save/Submit Channel Dialog
  const handleSaveChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelTitleBn.trim()) {
      toast.error('চ্যানেলের নাম প্রদান করুন');
      return;
    }
    if (!channelAccountNumber.trim()) {
      toast.error('একাউন্ট নম্বর / ইউজারনেম প্রদান করুন');
      return;
    }

    let finalLink = channelDirectLink.trim();
    if (!finalLink) {
      if (channelType === 'phone') finalLink = `tel:${channelAccountNumber.trim()}`;
      else if (channelType === 'whatsapp') {
        const clean = channelAccountNumber.replace(/[^0-9]/g, '');
        finalLink = `https://wa.me/${clean}?text=${encodeURIComponent(channelExtraNote || 'হ্যালো সহজ লোন সাপোর্ট')}`;
      } else if (channelType === 'telegram') {
        finalLink = `https://t.me/${channelAccountNumber.replace('@', '').trim()}`;
      } else if (channelType === 'imo') {
        finalLink = `tel:${channelAccountNumber.trim()}`;
      } else if (channelType === 'email') {
        finalLink = `mailto:${channelAccountNumber.trim()}`;
      }
    }

    let updatedList: SupportChannelOption[];
    if (editingChannel) {
      updatedList = channels.map((c) =>
        c.id === editingChannel.id
          ? {
              ...c,
              type: channelType,
              titleBn: channelTitleBn.trim(),
              accountNumber: channelAccountNumber.trim(),
              directLink: finalLink,
              extraNote: channelExtraNote.trim(),
              active: channelActive
            }
          : c
      );
      toast.success('সাপোর্ট চ্যানেল সফলভাবে আপডেট হয়েছে!');
    } else {
      const newChannel: SupportChannelOption = {
        id: `ch-${Date.now()}`,
        type: channelType,
        titleBn: channelTitleBn.trim(),
        accountNumber: channelAccountNumber.trim(),
        directLink: finalLink,
        extraNote: channelExtraNote.trim(),
        active: channelActive,
        order: channels.length + 1
      };
      updatedList = [...channels, newChannel];
      toast.success('নতুন সাপোর্ট চ্যানেল যুক্ত হয়েছে!');
    }

    setChannels(updatedList);
    persistChannels(updatedList);
    setChannelModalOpen(false);
  };

  // Persist channels & global settings to Cloud
  const persistChannels = (channelsList: SupportChannelOption[]) => {
    // Also update legacy fields for backward compatibility
    const imoCh = channelsList.find((c) => c.type === 'imo');
    const waCh = channelsList.find((c) => c.type === 'whatsapp');
    const tgCh = channelsList.find((c) => c.type === 'telegram');
    const phoneCh = channelsList.find((c) => c.type === 'phone');

    updateCustomerSupport({
      channels: channelsList,
      availableHoursBn: availableHoursBn.trim(),
      noticeBn: noticeBn.trim(),
      imoNumber: imoCh?.accountNumber || customerSupport.imoNumber,
      imoLink: imoCh?.directLink || customerSupport.imoLink,
      whatsappNumber: waCh?.accountNumber || customerSupport.whatsappNumber,
      whatsappMessage: waCh?.extraNote || customerSupport.whatsappMessage,
      telegramUsername: tgCh?.accountNumber || customerSupport.telegramUsername,
      telegramLink: tgCh?.directLink || customerSupport.telegramLink,
      helplinePhone: phoneCh?.accountNumber || customerSupport.helplinePhone
    });
  };

  // Save all global support config
  const handleSaveSupport = (e: React.FormEvent) => {
    e.preventDefault();
    persistChannels(channels);
    toast.success('কাস্টমার সার্ভিস সাপোর্ট চ্যানেল ও সেটিংস ক্লাউডে রিয়েল-টাইম সেভ হয়েছে!');
  };

  // Partner Bank Handlers
  const handleOpenBankModal = (bank?: PartnerBankConfig) => {
    if (bank) {
      setEditingBank(bank);
      setBankNameBn(bank.nameBn);
      setBankNameEn(bank.nameEn || '');
      setBankLogoUrl(bank.logoUrl);
      setPartnershipTypeBn(bank.partnershipTypeBn || '');
      setBankWebsiteUrl(bank.websiteUrl || '');
      setBankActive(bank.active ?? true);
    } else {
      setEditingBank(null);
      setBankNameBn('');
      setBankNameEn('');
      setBankLogoUrl('https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60');
      setPartnershipTypeBn('আর্থিক লেনদেন ও ফান্ড শেয়ারিং পার্টনার');
      setBankWebsiteUrl('https://www.bb.org.bd');
      setBankActive(true);
    }
    setBankDialogOpen(true);
  };

  const handleSaveBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankNameBn.trim()) {
      toast.error('ব্যাংকের নাম প্রদান করুন');
      return;
    }

    const payload: PartnerBankConfig = {
      id: editingBank?.id || `pb-${Date.now()}`,
      nameBn: bankNameBn.trim(),
      nameEn: bankNameEn.trim() || bankNameBn.trim(),
      logoUrl: bankLogoUrl.trim() || 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60',
      partnershipTypeBn: partnershipTypeBn.trim() || 'আর্থিক লেনদেন পার্টনার',
      websiteUrl: bankWebsiteUrl.trim() || 'https://www.bb.org.bd',
      active: bankActive
    };

    savePartnerBank(payload);
    toast.success(editingBank ? 'পার্টনার ব্যাংক আপডেট হয়েছে এবং গ্রাহক পেজে সিঙ্ক হয়েছে!' : 'নতুন পার্টনার ব্যাংক যুক্ত হয়েছে!');
    setBankDialogOpen(false);
  };

  const handleDeleteBank = (id: string, name: string) => {
    if (window.confirm(`আপনি কি "${name}" পার্টনার ব্যাংক মুছে ফেলতে চান? গ্রাহক হোমপেজ থেকে এটি অপসারিত হবে।`)) {
      deletePartnerBank(id);
      toast.success('পার্টনার ব্যাংক মুছে ফেলা হয়েছে');
    }
  };

  const getChannelBadge = (type: string) => {
    switch (type) {
      case 'imo':
        return <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">imo</span>;
      case 'whatsapp':
        return <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0"><MessageCircle className="w-4 h-4" /></span>;
      case 'telegram':
        return <span className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0"><Send className="w-4 h-4" /></span>;
      case 'email':
        return <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0"><Mail className="w-4 h-4" /></span>;
      case 'messenger':
        return <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0"><MessageSquare className="w-4 h-4" /></span>;
      case 'phone':
      default:
        return <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0"><PhoneCall className="w-4 h-4" /></span>;
    }
  };

  return (
    <AdminLayout
      title="কাস্টমার সাপোর্ট ও পার্টনার ব্যাংক কনফিগারেশন"
      subtitle="ইমু, হোয়াটসঅ্যাপ, টেলিগ্রাম, কল চ্যানেল যুক্ত/মুছে ফেলা ও পার্টনার ব্যাংকসমূহ রিয়েল-টাইমে নিয়ন্ত্রণ করুন"
    >
      <Tabs defaultValue="support" className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md w-full">
          <TabsTrigger value="support" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <Headphones className="w-4 h-4" />
            কাস্টমার সার্ভিস সাপোর্ট ({channels.length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            পার্টনার ব্যাংকসমূহ ({partnerBanks.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SUPPORT CHANNELS */}
        <TabsContent value="support" className="space-y-4">
          <Card className="border shadow-sm bg-card">
            <CardHeader className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" />
                  গ্রাহক সহায়তা চ্যানেল ব্যবস্থাপনা (Dynamic Add/Edit/Delete)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  যেসব চ্যানেল সক্রিয় রাখবেন সেগুলো গ্রাহক সহায়তা মডালে প্রদর্শিত হবে। আপনি চাইলে যেকোনো অপশন মুছে ফেলতে বা নতুন যোগ করতে পারেন।
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={handleOpenAddChannel}
                className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                নতুন সাপোর্ট চ্যানেল যোগ করুন
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* CHANNELS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  বর্তমান সাপোর্ট চ্যানেলসমূহ ({channels.length})
                </h4>

                {channels.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed rounded-xl space-y-2">
                    <Headphones className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">কোনো সাপোর্ট চ্যানেল নেই।</p>
                    <Button size="sm" onClick={handleOpenAddChannel} className="text-xs gap-1">
                      <Plus className="w-3.5 h-3.5" /> চ্যানেল যোগ করুন
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {channels.map((ch) => (
                      <div
                        key={ch.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          ch.active !== false ? 'bg-card border-border hover:border-primary/40' : 'bg-muted/40 border-dashed opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {getChannelBadge(ch.type)}
                            <div className="min-w-0">
                              <h5 className="font-bold text-sm text-foreground truncate">{ch.titleBn}</h5>
                              <p className="text-xs font-mono font-medium text-muted-foreground truncate">{ch.accountNumber}</p>
                              {ch.extraNote && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{ch.extraNote}</p>
                              )}
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={ch.active !== false ? 'bg-emerald-50 text-emerald-700 text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}
                          >
                            {ch.active !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                        </div>

                        {ch.directLink && (
                          <div className="text-[11px] text-muted-foreground truncate bg-muted/50 px-2 py-1 rounded">
                            <span className="font-medium text-foreground">লিঙ্ক: </span>
                            {ch.directLink}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleChannelActive(ch.id)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                            title={ch.active !== false ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          >
                            <Power className={`w-3 h-3 ${ch.active !== false ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                            {ch.active !== false ? 'সক্রিয় আছে' : 'বন্ধ আছে'}
                          </Button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditChannel(ch)}
                              className="h-7 px-2.5 text-xs font-bold gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              এডিট
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteChannel(ch.id, ch.titleBn)}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                              title="চ্যানেল মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GLOBAL NOTICE & HOURS FORM */}
              <form onSubmit={handleSaveSupport} className="space-y-4 text-xs pt-4 border-t">
                <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                   
                    গ্রাহক সেবা সময়সূচী ও জরুরি সাপোর্ট নোটিশ
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">গ্রাহক সেবা সময়সূচী *</Label>
                      <Input
                        value={availableHoursBn}
                        onChange={(e) => setAvailableHoursBn(e.target.value)}
                        placeholder="২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা"
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">জরুরি সাপোর্ট নোটিশ / বার্তা</Label>
                      <Input
                        value={noticeBn}
                        onChange={(e) => setNoticeBn(e.target.value)}
                        placeholder="ইমু, হোয়াটসঅ্যাপ বা সরাসরি হেল্পলাইনে ফোন করে যেকোনো সময় সেবা নিন।"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-primary text-primary-foreground font-bold px-6 gap-2">
                    <Save className="w-4 h-4" />
                    সাপোর্ট চ্যানেল ও সেটিংস ক্লাউডে সেভ করুন
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PARTNER BANKS */}
        <TabsContent value="partners" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground">পার্টনার ও সহযোগী ব্যাংকসমূহ ({partnerBanks.length})</h3>
              <p className="text-xs text-muted-foreground">ইউজার হোমপেজে এই ব্যাংকগুলোর নাম ও লোগো রিয়েল-টাইমে প্রদর্শিত হবে</p>
            </div>
            <Button
              onClick={() => handleOpenBankModal()}
              className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              নতুন পার্টনার ব্যাংক যোগ করুন
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerBanks.map((bank) => (
              <Card key={bank.id} className="border shadow-sm bg-card hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={bank.logoUrl}
                        alt={bank.nameBn}
                        className="w-12 h-12 rounded-xl object-contain border bg-muted p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{bank.nameBn}</h4>
                        <span className="text-[11px] text-muted-foreground">{bank.nameEn}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={bank.active ? 'bg-emerald-50 text-emerald-700 text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}
                    >
                      {bank.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg line-clamp-2">
                    {bank.partnershipTypeBn || 'আর্থিক লেনদেন ও ফান্ড শেয়ারিং পার্টনার'}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t gap-2">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                      {bank.websiteUrl || 'bb.org.bd'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenBankModal(bank)}
                        className="h-7 px-2.5 text-xs font-bold gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        এডিট
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBank(bank.id, bank.nameBn)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CHANNEL ADD / EDIT MODAL */}
      <Dialog open={channelModalOpen} onOpenChange={setChannelModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-6 bg-card">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              {editingChannel ? 'সাপোর্ট চ্যানেল এডিট করুন' : 'নতুন সাপোর্ট চ্যানেল যোগ করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের সাথে যোগাযোগের জন্য চ্যানেল টাইপ ও লিঙ্ক দিন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveChannelSubmit} className="space-y-3.5 mt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">চ্যানেল টাইপ (ধরন) *</Label>
              <select
                value={channelType}
                onChange={(e) => {
                  const val = e.target.value as SupportChannelOption['type'];
                  setChannelType(val);
                  if (!editingChannel) {
                    if (val === 'imo') setChannelTitleBn('ইমু (Imo) সাপোর্ট');
                    else if (val === 'whatsapp') setChannelTitleBn('হোয়াটসঅ্যাপ (WhatsApp) সাপোর্ট');
                    else if (val === 'telegram') setChannelTitleBn('টেলিগ্রাম (Telegram) সাপোর্ট');
                    else if (val === 'phone') setChannelTitleBn('সরাসরি হেল্পলাইন ও কাজের সময়');
                    else if (val === 'email') setChannelTitleBn('অফিসিয়াল ইমেইল সাপোর্ট');
                    else if (val === 'messenger') setChannelTitleBn('ফেসবুক মেসেঞ্জার সাপোর্ট');
                  }
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="imo">ইমু (Imo)</option>
                <option value="whatsapp">হোয়াটসঅ্যাপ (WhatsApp)</option>
                <option value="telegram">টেলিগ্রাম (Telegram)</option>
                <option value="phone">সরাসরি ফোন কল / হেল্পলাইন</option>
                <option value="messenger">ফেসবুক মেসেঞ্জার (Messenger)</option>
                <option value="email">অফিসিয়াল ইমেইল (Email)</option>
                <option value="other">অন্যান্য / কাস্টম</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">চ্যানেলের নাম (বাংলায়) *</Label>
              <Input
                placeholder="যেমন: ইমু (Imo) কাস্টমার সাপোর্ট"
                value={channelTitleBn}
                onChange={(e) => setChannelTitleBn(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">একাউন্ট নম্বর / ইউজারনেম / আইডি *</Label>
              <Input
                placeholder="যেমন: +8801977425147 বা shohojloan"
                value={channelAccountNumber}
                onChange={(e) => setChannelAccountNumber(e.target.value)}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ডিরেক্ট ওয়েব লিঙ্ক (ঐচ্ছিক)</Label>
              <Input
                placeholder="যেমন: https://wa.me/8801977425147 বা https://t.me/..."
                value={channelDirectLink}
                onChange={(e) => setChannelDirectLink(e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">খালি রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে সঠিক লিঙ্ক তৈরি করে নিবে</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">অতিরিক্ত বার্তা / নির্দেশনা</Label>
              <Input
                placeholder="যেমন: আসসালামু আলাইকুম, সহজ লোন সার্ভিসের সাথে যোগাযোগ করতে চাই।"
                value={channelExtraNote}
                onChange={(e) => setChannelExtraNote(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="channelActiveCheckbox"
                checked={channelActive}
                onChange={(e) => setChannelActive(e.target.checked)}
                className="rounded text-primary"
              />
              <Label htmlFor="channelActiveCheckbox" className="text-xs font-semibold cursor-pointer">
                এই চ্যানেলটি গ্রাহক পেজে চালু রাখুন
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setChannelModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                {editingChannel ? 'আপডেট করুন' : 'যোগ করুন'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PARTNER BANK MODAL */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-6 bg-card">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editingBank ? 'পার্টনার ব্যাংক এডিট করুন' : 'নতুন পার্টনার ব্যাংক যুক্ত করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              আমাদের সাথে চুক্তিবদ্ধ ব্যাংকের নাম ও লোগো কনফিগার করুন (রিয়েল-টাইমে গ্রাহক পেজে আপডেট হবে)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBankSubmit} className="space-y-3.5 mt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ব্যাংকের নাম (বাংলা) *</Label>
              <Input
                placeholder="যেমন: সোনালী ব্যাংক পিএলসি"
                value={bankNameBn}
                onChange={(e) => setBankNameBn(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ব্যাংকের নাম (ইংরেজি)</Label>
              <Input
                placeholder="যেমন: Sonali Bank PLC"
                value={bankNameEn}
                onChange={(e) => setBankNameEn(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ব্যাংকের লোগো লিঙ্ক (URL)</Label>
              <Input
                placeholder="https://..."
                value={bankLogoUrl}
                onChange={(e) => setBankLogoUrl(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">অংশীদারিত্বের ধরন / ভূমিকা</Label>
              <Input
                placeholder="যেমন: অর্থায়ন ও লোন শেয়ারিং পার্টনার"
                value={partnershipTypeBn}
                onChange={(e) => setPartnershipTypeBn(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">অফিসিয়াল ওয়েবসাইট লিঙ্ক</Label>
              <Input
                placeholder="https://www.sonalibank.com.bd"
                value={bankWebsiteUrl}
                onChange={(e) => setBankWebsiteUrl(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="bankActiveCheckbox"
                checked={bankActive}
                onChange={(e) => setBankActive(e.target.checked)}
                className="rounded text-primary"
              />
              <Label htmlFor="bankActiveCheckbox" className="text-xs font-semibold cursor-pointer">
                এই ব্যাংকটি হোমপেজে প্রদর্শন করুন
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setBankDialogOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                সংরক্ষণ ও ক্লাউড সিঙ্ক
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
