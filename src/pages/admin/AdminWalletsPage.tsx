import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Wallet, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  User, 
  Phone, 
  Clock, 
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatTaka, updateCustomerWithdrawalCondition } from '@/services/storage';
import { toast } from 'sonner';
import { CustomerUser, WithdrawalCondition } from '@/types/loan';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Sparkles, ShieldAlert } from 'lucide-react';

export const AdminWalletsPage: React.FC = () => {
  const { users, updateUserWallet, transactions } = useLoan();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'deduct'>('add');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');

  // Withdrawal Condition State on Add Balance
  const [attachCondition, setAttachCondition] = useState(true);
  const [condPreset, setCondPreset] = useState<'installment' | 'insurance' | 'stamp' | 'custom'>('installment');
  const [condStageTitle, setCondStageTitle] = useState('প্রথম কিস্তি বাবদ');
  const [condFeeAmount, setCondFeeAmount] = useState('2000');
  const [condMessage, setCondMessage] = useState('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ। জমা সম্পন্ন হলে TrxID দিয়ে কনফার্ম করুন।');

  const filteredUsers = [...users]
    .sort((a, b) => {
      const timeA = a.registeredAt ? Date.parse(a.registeredAt) : ((a.id || '').match(/(\d{10,14})/) ? parseInt(a.id.match(/(\d{10,14})/)![1], 10) : 0);
      const timeB = b.registeredAt ? Date.parse(b.registeredAt) : ((b.id || '').match(/(\d{10,14})/) ? parseInt(b.id.match(/(\d{10,14})/)![1], 10) : 0);
      if (timeB !== timeA) return (timeB || 0) - (timeA || 0);
      return (b.id || '').localeCompare(a.id || '');
    })
    .filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });

  const totalWalletSum = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

  const handleOpenModal = (user: CustomerUser, mode: 'add' | 'deduct') => {
    setSelectedUser(user);
    setModalMode(mode);
    setAmount('');
    setNoteTitle(mode === 'add' ? 'অ্যাডমিন কর্তৃক ব্যালেন্স যোগ' : 'অ্যাডমিন কর্তৃক ব্যালেন্স কর্তন');
    setNoteDesc(mode === 'add' ? 'লোন মঞ্জুর / বিশেষ ফান্ড ব্যালেন্স' : 'ফি সমন্বয় / প্রশাসনিক কর্তন');
    
    // Initialize condition from user or default
    if (user.withdrawalCondition) {
      setAttachCondition(user.withdrawalCondition.required);
      setCondStageTitle(user.withdrawalCondition.stageTitle || 'প্রথম কিস্তি বাবদ');
      setCondFeeAmount(user.withdrawalCondition.feeAmount?.toString() || '2000');
      setCondMessage(user.withdrawalCondition.instructionBn || user.withdrawalCondition.messageBn || 'আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
    } else {
      setAttachCondition(true);
      setCondPreset('installment');
      setCondStageTitle('প্রথম কিস্তি বাবদ');
      setCondFeeAmount('2000');
      setCondMessage('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ। জমা সম্পন্ন হলে TrxID দিয়ে নিশ্চিত করুন।');
    }
    setDialogOpen(true);
  };

  const handleApplyPreset = (preset: 'installment' | 'insurance' | 'stamp' | 'custom') => {
    setCondPreset(preset);
    if (preset === 'installment') {
      setCondStageTitle('প্রথম কিস্তি জমা বাবদ');
      setCondFeeAmount('2000');
      setCondMessage('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ। অর্থ জমা করে TrxID কনফার্ম করুন।');
    } else if (preset === 'insurance') {
      setCondStageTitle('জীবন বীমা পলিসি বাবদ');
      setCondFeeAmount('1000');
      setCondMessage('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে বিমা বাবদ। বীমা নিশ্চিত করার পর লোন উত্তোলন সক্রিয় হবে।');
    } else if (preset === 'stamp') {
      setCondStageTitle('ডকুমেন্ট ও স্ট্যাম্প ভেরিফিকেশন ফি বাবদ');
      setCondFeeAmount('500');
      setCondMessage('সরকারি স্ট্যাম্প ও আইনি দলিল ভেরিফিকেশন ফি বাবদ ৫০০ টাকা জমা দিন।');
    } else {
      setCondStageTitle('প্রশাসনিক কাস্টম শর্ত বাবদ');
      setCondFeeAmount('1500');
      setCondMessage('টাকা উত্তোলনের জন্য এই বিশেষ প্রশাসনিক শর্তটি সম্পন্ন করুন।');
    }
  };

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('অনুগ্রহ করে সঠিক পরিমাণ টাকা উল্লেখ করুন');
      return;
    }

    const delta = modalMode === 'add' ? numAmount : -numAmount;
    const res = updateUserWallet(
      selectedUser.id,
      delta,
      modalMode === 'add' ? 'credit' : 'debit',
      noteTitle.trim() || (modalMode === 'add' ? 'অ্যাডমিন ক্রেডিট' : 'অ্যাডমিন ডেবিট'),
      noteDesc.trim() || 'অ্যাডমিন প্যানেল থেকে ম্যানুয়াল ব্যালেন্স আপডেট'
    );

    if (res.success) {
      // If adding balance and condition is attached, immediately set withdrawal condition
      if (modalMode === 'add') {
        const parsedFee = parseFloat(condFeeAmount) || 0;
        updateCustomerWithdrawalCondition(selectedUser.phone || selectedUser.id, {
          required: attachCondition,
          stageTitle: condStageTitle.trim() || 'উইথড্রয়াল পূর্বশর্ত',
          feeAmount: parsedFee,
          instructionBn: condMessage.trim() || `আপনাকে এখন ${condFeeAmount} টাকা জমা দিতে হবে ${condStageTitle}।`,
          messageBn: condMessage.trim() || `আপনাকে এখন ${condFeeAmount} টাকা জমা দিতে হবে ${condStageTitle}।`,
          paymentMethod: 'bKash / Nagad / Bank',
          isApproved: false,
          status: 'active',
          customerConfirmed: false
        });
      }

      toast.success(
        modalMode === 'add' && attachCondition
          ? `${res.message} এবং উইথড্রয়াল শর্ত ও গেটিং সক্রিয় করা হয়েছে!`
          : res.message
      );
      setDialogOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AdminLayout
      title="ওয়ালেট ও ব্যালেন্স নিয়ন্ত্রণ"
      subtitle="যেকোনো গ্রাহকের অ্যাকাউন্টে টাকা যোগ (Add) এবং কর্তন (Deduct) করুন ও লেনদেন ইতিহাস দেখুন"
    >
      <div className="space-y-6">
        {/* Top Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">মোট ইউজার ওয়ালেট ব্যালেন্স</p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatTaka(totalWalletSum)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">মোট নিবন্ধিত গ্রাহক</p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {users.length} জন
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <History className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">মোট ওয়ালেট ট্রানজেকশন</p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {transactions.length} টি
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Search & Wallet Control Table */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                গ্রাহক ওয়ালেট ব্যালেন্স তালিকা
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                যেকোনো ইউজারের ওয়ালেট ব্যালেন্সে সরাসরি টাকা যোগ অথবা কর্তন করতে নিচের অ্যাকশন বাটন ব্যবহার করুন
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">গ্রাহকের নাম ও ফোন</th>
                    <th className="px-4 py-3 whitespace-nowrap">নিবন্ধন তারিখ</th>
                    <th className="px-4 py-3 whitespace-nowrap">স্ট্যাটাস</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">বর্তমান ওয়ালেট ব্যালেন্স</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">ব্যালেন্স নিয়ন্ত্রণ অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        কোনো গ্রাহক পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-foreground text-sm">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3 text-primary" /> {u.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                          {u.registeredAt || '2026-09-01'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            {u.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            {formatTaka(u.walletBalance || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOpenModal(u, 'add')}
                              className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              টাকা যোগ (Add)
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenModal(u, 'deduct')}
                              className="h-8 px-2.5 text-xs font-bold border-red-300 text-red-600 hover:bg-red-50 gap-1"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                              টাকা কর্তন (Deduct)
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Global Wallet Transactions Log */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="p-4 sm:p-5 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <History className="w-4 h-4 text-primary" />
              সাম্প্রতিক ওয়ালেট ব্যালেন্স লেনদেন ইতিহাস
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">তারিখ</th>
                    <th className="px-4 py-3 whitespace-nowrap">গ্রাহক আইডি</th>
                    <th className="px-4 py-3 whitespace-nowrap">বিবরণী ও টাইটেল</th>
                    <th className="px-4 py-3 whitespace-nowrap">ধরণ</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">পরিমাণ</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">লেনদেন পরবর্তী ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.slice(0, 15).map((tx) => {
                    const isCredit = tx.type === 'credit' || tx.type === 'loan_disbursement';
                    return (
                      <tr key={tx.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono">{tx.userId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-foreground">{tx.title}</div>
                          <div className="text-[10px] text-muted-foreground">{tx.description}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              isCredit
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {isCredit ? 'যোগ (Credit)' : 'কর্তন (Debit)'}
                          </Badge>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right font-bold ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isCredit ? `+ ${formatTaka(tx.amount)}` : `- ${formatTaka(tx.amount)}`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-foreground">
                          {formatTaka(tx.balanceAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-6 bg-card max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {modalMode === 'add' ? (
                <>
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  গ্রাহকের ওয়ালেটে টাকা যোগ (Add Money)
                </>
              ) : (
                <>
                  <MinusCircle className="w-5 h-5 text-red-600" />
                  গ্রাহকের ওয়ালেট থেকে টাকা কর্তন (Deduct Money)
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক: <span className="font-bold text-foreground">{selectedUser?.name}</span> ({selectedUser?.phone})
              <br />
              বর্তমান ব্যালেন্স: <span className="font-bold text-emerald-600">{formatTaka(selectedUser?.walletBalance || 0)}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBalanceSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">টাকার পরিমাণ (BDT) *</Label>
              <Input
                type="number"
                placeholder="যেমন: 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-sm font-bold"
                required
                min="1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">লেনদেনের শিরোনাম (Title)</Label>
              <Input
                type="text"
                placeholder="যেমন: লোন অনুমোদন ব্যালেন্স ক্রেডিট"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">বিস্তারিত কারণ / রেফারেন্স</Label>
              <Input
                type="text"
                placeholder="যেমন: আবেদন নং LN-2026-1001 অনুমোদনের পর অর্থ প্রদান"
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* WITHDRAWAL CONDITION GATING SECTION (FOR ADD MONEY) */}
            {modalMode === 'add' && (
              <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/50 space-y-3 mt-2">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>উইথড্রয়াল শর্ত ও গেটিং লক প্রযোজ্য করুন</span>
                  </div>
                  <Switch
                    checked={attachCondition}
                    onCheckedChange={setAttachCondition}
                  />
                </div>

                {attachCondition && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-amber-900 leading-snug">
                      ব্যালেন্স যুক্ত করার সাথে সাথে গ্রাহক উইথড্রয়াল পেজে এই শর্তটি বড় করে দেখতে পাবে এবং আপনি অ্যাপ্রুভ না করা পর্যন্ত উত্তোলন ব্লক থাকবে।
                    </p>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-amber-950">শর্তের ধরন / প্রি-সেট নির্বাচন:</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset('installment')}
                          className={`h-8 text-[11px] font-bold justify-start px-2 ${
                            condPreset === 'installment'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          ১ম কিস্তি ২০০০৳
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset('insurance')}
                          className={`h-8 text-[11px] font-bold justify-start px-2 ${
                            condPreset === 'insurance'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          বীমা ফি ১০০০৳
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset('stamp')}
                          className={`h-8 text-[11px] font-bold justify-start px-2 ${
                            condPreset === 'stamp'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          স্ট্যাম্প ফি ৫০০৳
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset('custom')}
                          className={`h-8 text-[11px] font-bold justify-start px-2 ${
                            condPreset === 'custom'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          কাস্টম শর্ত লিখুন
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-amber-950">শর্তের শিরোনাম / কারণ</Label>
                        <Input
                          value={condStageTitle}
                          onChange={(e) => setCondStageTitle(e.target.value)}
                          placeholder="যেমন: প্রথম কিস্তি জমা বাবদ"
                          className="h-8 text-xs bg-white font-medium border-amber-300"
                          required={attachCondition}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-amber-950">প্রয়োজনীয় ফি / জমা (টাকা)</Label>
                        <Input
                          type="number"
                          value={condFeeAmount}
                          onChange={(e) => setCondFeeAmount(e.target.value)}
                          placeholder="যেমন: 2000"
                          className="h-8 text-xs font-mono font-bold bg-white border-amber-300"
                          required={attachCondition}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-amber-950">গ্রাহকের জন্য নির্দেশনামূলক বার্তা</Label>
                      <Textarea
                        value={condMessage}
                        onChange={(e) => setCondMessage(e.target.value)}
                        placeholder="যা লিখবেন তাই ইউজার উইথড্রয়াল পেজে বড় করে দেখতে পাবে..."
                        className="text-xs bg-white min-h-[55px] border-amber-300"
                        rows={2}
                        required={attachCondition}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                বাতিল
              </Button>
              <Button
                type="submit"
                className={`font-bold ${
                  modalMode === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {modalMode === 'add' ? 'ব্যালেন্স ও শর্ত সেভ করুন' : 'ব্যালেন্স কর্তন করুন'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
