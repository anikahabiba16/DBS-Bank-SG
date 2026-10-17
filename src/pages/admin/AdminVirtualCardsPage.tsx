import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useLoan } from '@/contexts/LoanContext';
import { supabaseSync } from '@/services/supabaseSyncService';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Phone, 
  Calendar, 
  Copy, 
  Trash2, 
  Edit3, 
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminVirtualCardsPage: React.FC = () => {
  const { users, updateCustomerVirtualCard, settings } = useLoan();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');

  // Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const [userPhone, setUserPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('12/29');
  const [cvv, setCvv] = useState('842');
  const [spendingLimit, setSpendingLimit] = useState('100000');
  const [cardType, setCardType] = useState('DBS Platinum Virtual');

  // Load Virtual Cards from Supabase Cloud
  const loadCards = async () => {
    setLoading(true);
    try {
      const cloudCards = await supabaseSync.fetchVirtualCardsFromCloud();
      if (cloudCards && cloudCards.length > 0) {
        setCards(cloudCards);
      } else {
        // Collect from user profiles if any
        const fallbackCards: any[] = [];
        users.forEach((u) => {
          if (u.virtualCard) {
            fallbackCards.push({
              id: u.virtualCard.id,
              user_phone: u.phone,
              customer_name: u.name,
              status: u.virtualCard.status,
              card_number: u.virtualCard.cardNumber,
              cardholder_name: u.virtualCard.cardHolder || u.name,
              expiry_date: u.virtualCard.expiryDate,
              cvv: u.virtualCard.cvv,
              card_type: u.virtualCard.cardType || 'visa',
              spending_limit: u.virtualCard.spendingLimit || 100000,
              balance: u.virtualCard.balance || u.walletBalance || 0,
              requested_at: new Date().toISOString()
            });
          }
        });
        setCards(fallbackCards);
      }
    } catch (e) {
      console.warn('Error loading virtual cards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [users]);

  // Open Issue Modal for a specific card request or customer
  const handleOpenIssueModal = (cardOrUser?: any) => {
    if (cardOrUser) {
      setSelectedCardId(cardOrUser.id);
      setUserPhone(cardOrUser.user_phone || cardOrUser.phone || '');
      const name = cardOrUser.customer_name || cardOrUser.name || cardOrUser.cardholder_name || '';
      setCustomerName(name);
      setCardHolder(cardOrUser.cardholder_name || name);
      setCardNumber(cardOrUser.card_number || `4111 8899 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`);
      setExpiryDate(cardOrUser.expiry_date || '12/29');
      setCvv(cardOrUser.cvv || `${Math.floor(100 + Math.random() * 900)}`);
      setSpendingLimit(String(cardOrUser.spending_limit || 100000));
      setCardType(cardOrUser.card_type || 'DBS Platinum Virtual');
    } else {
      setSelectedCardId(undefined);
      setUserPhone('');
      setCustomerName('');
      setCardHolder('');
      setCardNumber(`4111 8899 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`);
      setExpiryDate('12/29');
      setCvv(`${Math.floor(100 + Math.random() * 900)}`);
      setSpendingLimit('100000');
      setCardType('DBS Platinum Virtual');
    }
    setIssueModalOpen(true);
  };

  // When customer is selected from dropdown
  const handleSelectCustomer = (phone: string) => {
    setUserPhone(phone);
    const u = users.find((usr) => usr.phone === phone);
    if (u) {
      setCustomerName(u.name);
      setCardHolder(u.name);
    }
  };

  // Submit and Send Card
  const handleSendCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPhone.trim() || !customerName.trim() || !cardNumber.trim()) {
      toast.error('গ্রাহকের নাম, মোবাইল নম্বর এবং কার্ড নম্বর পূরণ করুন');
      return;
    }

    const cardPayload = {
      id: selectedCardId || `card-${Date.now()}`,
      user_phone: userPhone.trim(),
      customer_name: customerName.trim(),
      card_number: cardNumber.trim(),
      cardholder_name: cardHolder.trim() || customerName.trim(),
      expiry_date: expiryDate.trim(),
      cvv: cvv.trim(),
      card_type: cardType,
      spending_limit: parseFloat(spendingLimit) || 100000,
      balance: 0,
      status: 'sent'
    };

    try {
      // 1. Save to Supabase virtual_cards table
      await supabaseSync.issueAndSendVirtualCardInCloud(cardPayload);

      // 2. Sync to user profile virtualCard
      updateCustomerVirtualCard(userPhone.trim(), {
        id: cardPayload.id,
        cardNumber: cardPayload.card_number,
        cardHolder: cardPayload.cardholder_name,
        cardHolderName: cardPayload.cardholder_name,
        expiryDate: cardPayload.expiry_date,
        cvv: cardPayload.cvv,
        balance: 0,
        status: 'active',
        cardType: 'visa',
        spendingLimit: cardPayload.spending_limit
      });

      toast.success('ভার্চুয়াল কার্ড তৈরি ও সফলভাবে গ্রাহককে সেন্ড করা হয়েছে!', {
        description: `${customerName}-এর পোর্টালে কার্ডের পূর্ণ বিবরণ রিয়েল-টাইমে প্রদর্শিত হবে।`
      });

      setIssueModalOpen(false);
      loadCards();
    } catch (err) {
      console.error(err);
      toast.error('কার্ড সেন্ড করতে সমস্যা হয়েছে');
    }
  };

  const handleDeleteCard = async (id: string, name: string) => {
    if (confirm(`আপনি কি "${name}" এর কার্ড রেকর্ডটি মুছে ফেলতে চান?`)) {
      await supabaseSync.deleteVirtualCardFromCloud(id);
      toast.success('কার্ড রেকর্ড মুছে ফেলা হয়েছে');
      loadCards();
    }
  };

  const pendingCards = cards.filter((c) => c.status === 'pending');
  const sentCards = cards.filter((c) => c.status === 'sent' || c.status === 'active');

  return (
    <AdminLayout
      title="ভার্চুয়াল কার্ড রিকোয়েস্ট ও ইস্যু (Virtual Cards System)"
      subtitle="গ্রাহকদের ভার্চুয়াল ডেবিট কার্ডের আবেদন দেখুন, নাম অনুযায়ী কার্ড জেনারেট করুন এবং অনুমোদনের পর সেন্ড করুন"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCards}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </Button>
          <Button
            onClick={() => handleOpenIssueModal()}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কার্ড ইস্যু ও সেন্ড</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">মোট আবেদন ও কার্ড</span>
                <h3 className="text-2xl font-black text-foreground">{toBengaliNumber(cards.length)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">পেন্ডিং রিকোয়েস্ট (অপেক্ষমাণ)</span>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{toBengaliNumber(pendingCards.length)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">ইস্যুকৃত ও প্রেরিত কার্ড (Active)</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{toBengaliNumber(sentCards.length)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Pending vs Sent Cards */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="pending" className="text-xs font-bold gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>পেন্ডিং আবেদনসমূহ ({toBengaliNumber(pendingCards.length)})</span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs font-bold gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ইস্যুকৃত ও সক্রিয় কার্ডসমূহ ({toBengaliNumber(sentCards.length)})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PENDING REQUESTS */}
          <TabsContent value="pending" className="space-y-4">
            {pendingCards.length === 0 ? (
              <Card className="border p-12 text-center bg-card">
                <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground">বর্তমানে কোনো পেন্ডিং ভার্চুয়াল কার্ডের আবেদন নেই</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  গ্রাহক তার ড্যাশবোর্ড থেকে ভার্চুয়াল কার্ডের আবেদন করলে এখানে দেখতে পাবেন।
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCards.map((c) => (
                  <Card key={c.id} className="border border-amber-200/80 dark:border-amber-900/40 bg-card shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{c.customer_name || 'গ্রাহকের নাম'}</h4>
                            <span className="text-[11px] font-mono text-muted-foreground">{c.user_phone}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                          পেন্ডিং আবেদন
                        </Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">আবেদনের তারিখ:</span>
                          <span className="font-mono text-[11px]">
                            {c.requested_at ? new Date(c.requested_at).toLocaleDateString('bn-BD') : 'আজ'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">কার্ডের ধরণ:</span>
                          <span className="font-semibold text-primary">DBS Platinum Virtual</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenIssueModal(c)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>কার্ড তৈরি করুন ও সেন্ড করুন</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: SENT / ACTIVE CARDS */}
          <TabsContent value="sent" className="space-y-4">
            {sentCards.length === 0 ? (
              <Card className="border p-12 text-center bg-card">
                <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground">এখনো কোনো ভার্চুয়াল কার্ড সেন্ড করা হয়নি</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  উপরের "নতুন কার্ড ইস্যু ও সেন্ড" বাটনে ক্লিক করে যেকোনো গ্রাহককে কার্ড প্রদান করতে পারেন।
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentCards.map((c) => (
                  <Card key={c.id} className="border shadow-xs bg-card hover:border-primary/40 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      {/* Realistic Mini Virtual Card Representation */}
                      <div className="relative aspect-[1.586/1] w-full rounded-xl p-4 text-white shadow-md overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs tracking-wide text-indigo-300 uppercase">DBS BANK SG</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            সক্রিয় (Sent)
                          </span>
                        </div>
                        <div className="my-auto font-mono text-sm tracking-wider text-slate-100 text-center font-bold">
                          {c.card_number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-[10px] font-mono text-slate-300">
                          <div>
                            <div className="text-[8px] text-slate-400">CARD HOLDER</div>
                            <div className="font-bold uppercase line-clamp-1">{c.cardholder_name || c.customer_name}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-400">EXPIRES</div>
                            <div className="font-bold">{c.expiry_date || '12/29'}</div>
                          </div>
                          <div className="font-black italic text-sm text-amber-400">
                            VISA
                          </div>
                        </div>
                      </div>

                      {/* Card meta info */}
                      <div className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">গ্রাহক:</span>
                          <strong className="text-foreground">{c.customer_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">মোবাইল:</span>
                          <span className="font-mono text-muted-foreground">{c.user_phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">সিভিভি (CVV):</span>
                          <span className="font-mono font-bold text-primary">{c.cvv || '***'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">খরচের সীমা:</span>
                          <span className="font-bold text-foreground">{formatTaka(c.spending_limit || 100000)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenIssueModal(c)}
                          className="flex-1 text-xs h-8 gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>এডিট ও রি-সেন্ড</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(c.id, c.customer_name)}
                          className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ISSUE & SEND CARD DIALOG */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 bg-card max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>ভার্চুয়াল কার্ড ইস্যু ও সেন্ড করুন</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের নাম অনুযায়ী কার্ডের বিবরণ পূরণ করে "সেন্ড" বাটনে ক্লিক করলে তা গ্রাহকের পোর্টালে দৃশ্যমান হবে।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendCard} className="space-y-4 pt-3">
            {/* Quick Select Customer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">নিবন্ধিত গ্রাহক সিলেক্ট করুন (অটো-ফিল)</Label>
              <select
                value={userPhone}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="">গ্রাহক বেছে নিন...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.phone}>
                    {u.name} - {u.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">গ্রাহকের নাম *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="গ্রাহকের পুরো নাম"
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">মোবাইল নম্বর *</Label>
                <Input
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">কার্ডহোল্ডার নাম (কার্ডের উপরে প্রদর্শিত হবে)</Label>
              <Input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="CARD HOLDER NAME"
                className="h-9 text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">১৬ ডিজিট কার্ড নম্বর *</Label>
                <button
                  type="button"
                  onClick={() => setCardNumber(`4111 8899 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  র‍্যান্ডম জেনারেট
                </button>
              </div>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 8899 1234 5678"
                required
                className="h-9 text-xs font-mono font-bold tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">মেয়াদ (MM/YY) *</Label>
                <Input
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="12/29"
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">সিভিভি (CVV) *</Label>
                <Input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="842"
                  maxLength={4}
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">কার্ড টাইপ / ব্র্যান্ড</Label>
                <Input
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  placeholder="DBS Platinum Virtual"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">খরচের সীমা (টাকা)</Label>
                <Input
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  placeholder="100000"
                  type="number"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>রিয়েল-টাইম ক্লাউড সেন্ড নীতি</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                "গ্রাহককে সেন্ড করুন" চাপামাত্র সাববেস ক্লাউড ডাটাবেজের মাধ্যমে গ্রাহকের অ্যাপে কার্ডের সকল তথ্য লাইভ হয়ে যাবে।
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>গ্রাহককে সেন্ড করুন (Send Card)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIssueModalOpen(false)}
                className="h-10 text-xs px-4"
              >
                বাতিল
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
export default AdminVirtualCardsPage;
