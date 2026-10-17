import React, { useState, useEffect } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Building2, 
  Smartphone, 
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  Filter,
  UserCheck,
  Send,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  CreditCard
} from 'lucide-react';
import { formatTaka, getUsers, updateCustomerWithdrawalCondition, toBengaliNumber } from '@/services/storage';
import { toast } from 'sonner';
import { WithdrawalRequest, UserProfile, WithdrawalCondition, PaymentMethodConfig } from '@/types/loan';

export const AdminWithdrawalsPage: React.FC = () => {
  const { withdrawals, processWithdrawal, paymentMethods, savePaymentMethod, deletePaymentMethod } = useLoan();
  const [activeTab, setActiveTab] = useState<'requests' | 'conditions' | 'methods'>('requests');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activePaymentMethods = (paymentMethods || []).filter((m) => m.active);
  const defaultActiveDepositAccount = activePaymentMethods.length > 0
    ? activePaymentMethods.map((m) => `${m.name}${m.accountType ? ` (${m.accountType})` : ''}: ${m.accountNumber}`).join(' / ')
    : 'বিকাশ (Agent): 01762731633 / নগদ (Agent): 01333994575';

  // Payment Method Management State (shared with customer withdrawal page)
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [methodName, setMethodName] = useState('');
  const [methodNameEn, setMethodNameEn] = useState('');
  const [methodLogo, setMethodLogo] = useState('');
  const [accountType, setAccountType] = useState<PaymentMethodConfig['accountType']>('Personal');
  const [transactionType, setTransactionType] = useState<PaymentMethodConfig['transactionType']>('Send Money');
  const [accountNumber, setAccountNumber] = useState('');
  const [instructionBn, setInstructionBn] = useState('');
  const [minDeposit, setMinDeposit] = useState('500');
  const [maxDeposit, setMaxDeposit] = useState('500000');
  const [methodActive, setMethodActive] = useState(true);

  // Process Request Modal State
  const [selectedReq, setSelectedReq] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [adminNote, setAdminNote] = useState('');
  const [transactionProof, setTransactionProof] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Next Stage Condition Dialog State
  const [nextStageDialogOpen, setNextStageDialogOpen] = useState(false);
  const [nextStageTargetUser, setNextStageTargetUser] = useState<UserProfile | null>(null);
  const [nextStageTitle, setNextStageTitle] = useState('ঋণ ঝুঁকি জীবন বীমা বাবদ');
  const [nextStageFee, setNextStageFee] = useState('1000');
  const [nextStageMsg, setNextStageMsg] = useState('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে জীবন বীমা বাবদ। জমা সম্পন্ন হলে TrxID দিয়ে কনফার্ম করুন।');
  const [nextStageAccount, setNextStageAccount] = useState('');

  useEffect(() => {
    if (nextStageDialogOpen && defaultActiveDepositAccount) {
      if (!nextStageAccount || nextStageAccount === 'বিকাশ / নগদ / ব্যাংক' || nextStageAccount.includes('01712345678')) {
        setNextStageAccount(defaultActiveDepositAccount);
      }
    }
  }, [nextStageDialogOpen, defaultActiveDepositAccount, nextStageAccount]);

  // Customer Condition Management State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [condRequired, setCondRequired] = useState(true);
  const [condStageTitle, setCondStageTitle] = useState('প্রথম কিস্তি জমা বাবদ');
  const [condMessage, setCondMessage] = useState('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
  const [condFee, setCondFee] = useState<number>(2000);
  const [condDepositAccount, setCondDepositAccount] = useState('বিকাশ / নগদ (পার্সোনাল): 01712345678');
  const [condApproved, setCondApproved] = useState(false);

  const loadUsers = () => {
    const list = getUsers();
    setUsersList(list);
    if (!selectedCustomer && list.length > 0) {
      handleSelectCustomer(list[0]);
    } else if (selectedCustomer) {
      const refreshed = list.find((u) => u.phone === selectedCustomer.phone || u.id === selectedCustomer.id);
      if (refreshed) {
        setSelectedCustomer(refreshed);
      }
    }
  };

  useEffect(() => {
    loadUsers();
    const handleUpdate = () => loadUsers();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('app_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('app_data_updated', handleUpdate);
    };
  }, []);

  const handleSelectCustomer = (user: UserProfile) => {
    setSelectedCustomer(user);
    const cond = user.withdrawalCondition;
    if (cond) {
      setCondRequired(cond.required);
      setCondStageTitle(cond.stageTitle || 'প্রথম কিস্তি জমা বাবদ');
      setCondMessage(cond.instructionBn || cond.messageBn || 'আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
      setCondFee(cond.feeAmount || 2000);
      setCondDepositAccount(cond.accountOrPhone && !cond.accountOrPhone.includes('01712345678') ? cond.accountOrPhone : defaultActiveDepositAccount);
      setCondApproved(cond.isApproved);
    } else {
      setCondRequired(true);
      setCondStageTitle('প্রথম কিস্তি জমা বাবদ');
      setCondMessage('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
      setCondFee(2000);
      setCondDepositAccount(defaultActiveDepositAccount);
      setCondApproved(false);
    }
  };

  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('অনুগ্রহ করে একজন গ্রাহক নির্বাচন করুন');
      return;
    }

    const res = updateCustomerWithdrawalCondition(selectedCustomer.phone || selectedCustomer.id, {
      required: condRequired,
      stageTitle: condStageTitle.trim() || 'উইথড্রয়াল পূর্বশর্ত',
      instructionBn: condMessage.trim(),
      messageBn: condMessage.trim(),
      noticeBn: condMessage.trim(),
      feeAmount: Number(condFee),
      accountOrPhone: condDepositAccount.trim(),
      isApproved: condApproved,
      customerConfirmed: condApproved ? false : selectedCustomer.withdrawalCondition?.customerConfirmed || false,
      customerTrxId: condApproved ? undefined : selectedCustomer.withdrawalCondition?.customerTrxId,
      status: condApproved ? 'approved' : condRequired ? 'active' : 'approved'
    });

    if (res) {
      toast.success(`${selectedCustomer.name}-এর উইথড্রয়াল শর্তাবলী সফলভাবে আপডেট হয়েছে! গ্রাহকের টাকা তোলার পেজে এটি হাইলাইট হবে।`);
      loadUsers();
    } else {
      toast.error('শর্তাবলী সংরক্ষণ করা যায়নি');
    }
  };

  // Accept current payment and unlock withdrawal
  const handleAcceptAndUnlock = (user: UserProfile) => {
    updateCustomerWithdrawalCondition(user.phone || user.id, {
      required: false,
      isApproved: true,
      stageTitle: 'উইথড্রয়াল অনুমোদিত',
      messageBn: 'উইথড্র শর্তাবলী অনুমোদিত হয়েছে।',
      noticeBn: 'উইথড্র শর্তাবলী অনুমোদিত হয়েছে।',
      instructionBn: 'উইথড্র শর্তাবলী অনুমোদিত হয়েছে।',
      feeAmount: 0,
      customerConfirmed: true,
      status: 'approved'
    });
    toast.success(`${user.name}-এর পেমেন্ট Accept করা হয়েছে এবং উইথড্রয়াল সম্পূর্ণ আনব্লক করা হয়েছে!`);
    loadUsers();
  };

  // Accept current condition and transition to NEXT STAGE hurdle (e.g. 1st installment -> insurance)
  const handleAcceptAndNextStage = (
    user: UserProfile, 
    nextTitle: string, 
    nextInstruction: string, 
    nextFee: number,
    nextAccount?: string
  ) => {
    const currentCond = user.withdrawalCondition;
    const history = currentCond?.history || [];
    if (currentCond?.stageTitle) {
      history.push({
        stageTitle: currentCond.stageTitle,
        amount: currentCond.feeAmount || 0,
        confirmedAt: currentCond.customerConfirmedAt || new Date().toISOString(),
        trxId: currentCond.customerTrxId
      });
    }

    updateCustomerWithdrawalCondition(user.phone || user.id, {
      required: true,
      isApproved: false,
      stageTitle: nextTitle,
      instructionBn: nextInstruction,
      messageBn: nextInstruction,
      noticeBn: nextInstruction,
      feeAmount: nextFee,
      accountOrPhone: nextAccount || currentCond?.accountOrPhone || defaultActiveDepositAccount,
      customerConfirmed: false,
      customerTrxId: undefined,
      status: 'active',
      history
    });
    toast.success(`পূর্ববর্তী শর্ত সফলভাবে নিষ্পত্তি হয়েছে এবং পরবর্তী ধাপ (${nextTitle}) সক্রিয় করা হয়েছে!`);
    loadUsers();
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter !== 'all' && w.status !== filter) return false;
    const q = searchTerm.toLowerCase();
    return (
      w.customerName.toLowerCase().includes(q) ||
      w.phone.includes(q) ||
      w.accountNumber.includes(q) ||
      w.id.toLowerCase().includes(q)
    );
  });

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const approvedTotal = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleOpenProcessModal = (req: WithdrawalRequest, action: 'approved' | 'rejected') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote(
      action === 'approved' 
        ? `${req.method} অ্যাকাউন্টে সফলভাবে টাকা প্রেরণ করা হয়েছে।` 
        : 'প্রদত্ত অ্যাকাউন্ট তথ্য সঠিক নয় অথবা ভেরিফিকেশন ব্যর্থ হয়েছে।'
    );
    setTransactionProof(action === 'approved' ? `TRX-${req.method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}` : '');
    setDialogOpen(true);
  };

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    processWithdrawal(selectedReq.id, actionType, adminNote.trim(), transactionProof.trim());

    if (actionType === 'approved') {
      toast.success(`উইথড্র আবেদন ${selectedReq.id} সফলভাবে অনুমোদন করা হয়েছে!`);
    } else {
      toast.info(`উইথড্র আবেদন ${selectedReq.id} বাতিল করা হয়েছে এবং টাকা গ্রাহকের ওয়ালেটে ফেরত দেওয়া হয়েছে।`);
    }
    setDialogOpen(false);
  };

  const handleOpenMethodModal = (method?: PaymentMethodConfig) => {
    if (method) {
      setEditingMethod(method);
      setMethodName(method.name || '');
      setMethodNameEn(method.nameEn || '');
      setMethodLogo(method.logo || '');
      setAccountType(method.accountType || 'Personal');
      setTransactionType(method.transactionType || 'Send Money');
      setAccountNumber(method.accountNumber || '');
      setInstructionBn(method.instructionBn || '');
      setMinDeposit(String(method.minDeposit ?? 500));
      setMaxDeposit(String(method.maxDeposit ?? 500000));
      setMethodActive(method.active !== false);
    } else {
      setEditingMethod(null);
      setMethodName('');
      setMethodNameEn('');
      setMethodLogo('');
      setAccountType('Personal');
      setTransactionType('Send Money');
      setAccountNumber('');
      setInstructionBn('');
      setMinDeposit('500');
      setMaxDeposit('500000');
      setMethodActive(true);
    }
    setMethodDialogOpen(true);
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim()) {
      toast.error('পেমেন্ট মেথডের নাম দিন');
      return;
    }
    if (!accountNumber.trim()) {
      toast.error('অ্যাকাউন্ট নম্বর / ব্যাংক তথ্য দিন');
      return;
    }

    const payload: PaymentMethodConfig = {
      id: editingMethod?.id || `pm-${Date.now()}`,
      name: methodName.trim(),
      nameEn: methodNameEn.trim() || methodName.trim(),
      logo: methodLogo.trim(),
      accountType,
      transactionType,
      accountNumber: accountNumber.trim(),
      instructionBn: instructionBn.trim() || `${methodName.trim()}-এ নির্ধারিত অ্যাকাউন্টে টাকা পাঠান।`,
      minDeposit: Number(minDeposit) || 500,
      maxDeposit: Number(maxDeposit) || 500000,
      chargePercentage: editingMethod?.chargePercentage || 0,
      active: methodActive
    };

    savePaymentMethod(payload);
    toast.success(editingMethod ? 'পেমেন্ট মেথড আপডেট হয়েছে। গ্রাহক পেজে রিয়েল-টাইমে পরিবর্তন যাবে।' : 'নতুন পেমেন্ট মেথড যোগ হয়েছে। গ্রাহক পেজে রিয়েল-টাইমে দেখা যাবে।');
    setMethodDialogOpen(false);
  };

  const handleDeleteMethod = (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" পেমেন্ট মেথডটি মুছে ফেলতে চান?`)) return;
    deletePaymentMethod(id);
    toast.success('পেমেন্ট মেথড মুছে ফেলা হয়েছে।');
  };

  return (
    <AdminLayout
      title="টাকা তুলুন (Withdraw) ও মাল্টি-স্টেজ গেটিং নিয়ন্ত্রণ"
      subtitle="গ্রাহকদের টাকা তোলার অনুরোধ প্রসেস করুন এবং উইথড্রয়াল ব্লক/পেন্ডিং এর শর্তাবলী কাস্টমাইজ করুন"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-card rounded-t-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>উইথড্রয়াল অনুরোধসমূহ</span>
            {pendingCount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4">
                {pendingCount}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'conditions'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>টাকা তুলুন ব্লক ও শর্ত নির্ধারণ (মাল্টি-স্টেজ গেটিং)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('methods')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'methods'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>পেমেন্ট মেথড</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{paymentMethods.length}</Badge>
          </button>
        </div>

        {/* TAB 1: WITHDRAWAL REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Top Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border shadow-sm bg-card">
                <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">অপেক্ষমান (Pending) আবেদন</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {pendingCount} টি
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card">
                <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">পরিশোধকৃত মোট উইথড্রয়াল</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-600">
                      {formatTaka(approvedTotal)}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card">
                <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ArrowDownToLine className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">সর্বমোট উইথড্র রিকোয়েস্ট</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {withdrawals.length} টি
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border shadow-sm bg-card">
              <CardHeader className="p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className="text-xs h-8"
                  >
                    সকল ({withdrawals.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                    className="text-xs h-8 text-amber-600 border-amber-200"
                  >
                    পেন্ডিং ({pendingCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilter('approved')}
                    className="text-xs h-8 text-emerald-600 border-emerald-200"
                  >
                    অনুমোদিত ({withdrawals.filter((w) => w.status === 'approved').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilter('rejected')}
                    className="text-xs h-8 text-red-600 border-red-200"
                  >
                    বাতিল ({withdrawals.filter((w) => w.status === 'rejected').length})
                  </Button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="নাম, ফোন বা আইডি দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        <th className="px-4 py-3 whitespace-nowrap">আইডি ও তারিখ</th>
                        <th className="px-4 py-3 whitespace-nowrap">গ্রাহকের নাম ও ফোন</th>
                        <th className="px-4 py-3 whitespace-nowrap">পেমেন্ট মেথড ও অ্যাকাউন্ট</th>
                        <th className="px-4 py-3 whitespace-nowrap text-right">পরিমাণ (টাকা)</th>
                        <th className="px-4 py-3 whitespace-nowrap">স্ট্যাটাস</th>
                        <th className="px-4 py-3 whitespace-nowrap text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                            কোনো উইথড্রয়াল রিকোয়েস্ট পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        filteredWithdrawals.map((w) => {
                          const isPending = w.status === 'pending';
                          const isBank = w.method === 'Bank';
                          return (
                            <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="font-mono font-bold text-foreground">{w.id}</span>
                                <div className="text-[10px] text-muted-foreground">{w.requestDate}</div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-bold text-foreground text-sm">{w.customerName}</div>
                                <div className="text-muted-foreground text-[11px] font-mono">{w.phone}</div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                  {isBank ? (
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                  ) : (
                                    <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                                  )}
                                  <span>{w.method}</span>
                                  <span className="font-mono text-primary font-bold">({w.accountNumber})</span>
                                </div>
                                {isBank && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    ব্যাংক: {w.bankName || 'N/A'} | শাখা: {w.branchName || 'N/A'}
                                    {w.accountHolderName && ` | নাম: ${w.accountHolderName}`}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-foreground font-mono">
                                  {formatTaka(w.amount)}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <Badge
                                  variant="outline"
                                  className={
                                    w.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : w.status === 'rejected'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  }
                                >
                                  {w.status === 'approved'
                                    ? 'পরিশোধিত (Approved)'
                                    : w.status === 'rejected'
                                    ? 'বাতিলকৃত (Rejected)'
                                    : 'অপেক্ষমান (Pending)'}
                                </Badge>
                                {w.transactionProof && (
                                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    {w.transactionProof}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                {isPending ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenProcessModal(w, 'approved')}
                                      className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      অনুমোদন ও পেআউট
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenProcessModal(w, 'rejected')}
                                      className="h-7 px-2.5 text-xs font-bold border-red-300 text-red-600 hover:bg-red-50 gap-1"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      বাতিল
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-muted-foreground">
                                    সম্পন্ন: {w.processedDate || w.requestDate}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: MULTI-STAGE WITHDRAWAL CONDITION GATING */}
        {activeTab === 'conditions' && (
          <div className="space-y-6">
            {/* Condition Banner */}
            <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950">
                    উইথড্রয়াল ব্লকিং ও মাল্টি-স্টেজ শর্তাবলী নিয়ন্ত্রণ
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5 max-w-2xl">
                    গ্রাহক টাকা তোলার সময় আপনি যেসব শর্ত ও ফি নির্ধারণ করবেন (যেমন: ১ম কিস্তি ২০০০ টাকা, বীমা ১০০০ টাকা) তা গ্রাহকের উইথড্র পেজে হাইলাইট হবে। গ্রাহক কনফার্ম করলে আপনি Accept করতে পারবেন বা পরবর্তী শর্ত দিতে পারবেন।
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                className="h-8 text-xs border-amber-300 bg-amber-50 hover:bg-amber-100 gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ করুন</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Customer Selector & List */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border shadow-sm">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      গ্রাহক নির্বাচন করুন ({toBengaliNumber(usersList.length)} জন)
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      যে গ্রাহকের জন্য শর্ত নির্ধারণ করতে চান তার নামের উপর ক্লিক করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 max-h-[500px] overflow-y-auto space-y-1.5">
                    {usersList.map((u) => {
                      const isSelected = selectedCustomer?.phone === u.phone;
                      const cond = u.withdrawalCondition;
                      const isBlocked = cond?.required && !cond?.isApproved;
                      const hasPaid = cond?.customerConfirmed;

                      return (
                        <div
                          key={u.phone}
                          onClick={() => handleSelectCustomer(u)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-xs'
                              : 'bg-card border-border hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-xs text-foreground">{u.name}</div>
                            {isBlocked ? (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
                                {cond?.stageTitle || 'শর্ত সক্রিয়'}
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 h-4">
                                উইথড্র উন্মুক্ত
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground font-mono">
                            <span>{u.phone}</span>
                            <span className="font-bold text-foreground">ওয়ালেট: {formatTaka(u.walletBalance || 0)}</span>
                          </div>
                          {hasPaid && (
                            <div className="mt-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>গ্রাহক পেমেন্ট কনফার্ম করেছেন (TrxID: {cond?.customerTrxId || 'N/A'})</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Condition & Multi-Stage Gate Editor */}
              <div className="lg:col-span-7">
                {selectedCustomer ? (
                  <Card className="border shadow-sm">
                    <CardHeader className="p-4 sm:p-5 border-b bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-600" />
                            উইথড্র শর্ত সম্পাদনা: {selectedCustomer.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            ফোন: <span className="font-mono font-bold">{selectedCustomer.phone}</span> | বর্তমান ওয়ালেট ব্যালেন্স: <strong className="text-emerald-700 font-mono">{formatTaka(selectedCustomer.walletBalance || 0)}</strong>
                          </CardDescription>
                        </div>

                        {selectedCustomer.withdrawalCondition?.required && !selectedCustomer.withdrawalCondition?.isApproved ? (
                          <Badge className="bg-amber-500 text-white text-xs">
                            🔒 উইথড্র ব্লক করা আছে
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-600 text-white text-xs">
                            🔓 উইথড্র আনব্লক / অনুমোদিত
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">
                      {/* Customer Payment Submission Notification */}
                      {selectedCustomer.withdrawalCondition?.customerConfirmed && (
                        <div className="mb-5 p-4 rounded-xl border bg-emerald-50 border-emerald-300 space-y-2.5">
                          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>গ্রাহক শর্ত পূরণ করে টাকা জমা দিয়েছেন ও কনফার্ম করেছেন!</span>
                          </div>
                          <div className="text-xs text-emerald-800 space-y-1">
                            <div>বর্তমান শর্ত: <strong>{selectedCustomer.withdrawalCondition.stageTitle}</strong> ({formatTaka(selectedCustomer.withdrawalCondition.feeAmount || 0)})</div>
                            <div>ট্রানজেকশন প্রুফ / TrxID: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">{selectedCustomer.withdrawalCondition.customerTrxId || 'উল্লেখ নেই'}</strong></div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              type="button"
                              onClick={() => handleAcceptAndUnlock(selectedCustomer)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              ✓ Accept ও উইথড্র সম্পূর্ণ আনব্লক করুন
                            </Button>

                            <Button
                              type="button"
                              onClick={() => {
                                setNextStageTargetUser(selectedCustomer);
                                setNextStageDialogOpen(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm"
                            >
                              <ArrowRight className="w-4 h-4" />
                              ✓ Accept করে পরবর্তী নতুন শর্ত দিন...
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Display Previous Completed Stages (History Stepper) */}
                      {selectedCustomer.withdrawalCondition?.history && selectedCustomer.withdrawalCondition.history.length > 0 && (
                        <div className="mb-4 p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-2">
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>পূর্বে সম্পন্ন ও অনুমোদিত শর্তাবলি ({toBengaliNumber(selectedCustomer.withdrawalCondition.history.length)} টি ধাপ):</span>
                          </div>
                          <div className="space-y-1.5">
                            {selectedCustomer.withdrawalCondition.history.map((h, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-emerald-200">
                                <span className="font-semibold text-emerald-900">
                                  ✓ ধাপ {toBengaliNumber(idx + 1)}: {h.stageTitle} ({formatTaka(h.amount || h.feeAmount || 0)})
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  TrxID: <strong className="text-foreground">{h.trxId || 'অনুমোদিত'}</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSaveCondition} className="space-y-4">
                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-foreground">
                            এক-ক্লিক প্রিসেটসমূহ (গ্রাহকের জন্য সরাসরি সেট করুন):
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCondStageTitle('প্রথম কিস্তি জমা বাবদ');
                                setCondMessage('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
                                setCondFee(2000);
                              }}
                              className="p-2.5 rounded-xl border text-left bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <div className="font-bold text-xs text-amber-950">১. ১ম কিস্তি (২,০০০ টাকা)</div>
                              <div className="text-[10px] text-amber-800 mt-0.5">প্রথম কিস্তি পরিশোধ শর্ত</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCondStageTitle('ঋণ ঝুঁকি জীবন বীমা বাবদ');
                                setCondMessage('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে বিমা বাবদ।');
                                setCondFee(1000);
                              }}
                              className="p-2.5 rounded-xl border text-left bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <div className="font-bold text-xs text-blue-950">২. জীবন বীমা (১,০০০ টাকা)</div>
                              <div className="text-[10px] text-blue-800 mt-0.5">বীমা পলিসি কভারেজ শর্ত</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCondStageTitle('প্রশাসনিক সার্ভিস চার্জ ও ক্লিয়ারেন্স');
                                setCondMessage('আপনাকে এখন ৫০০ টাকা সার্ভিস চার্জ বাবদ জমা দিতে হবে।');
                                setCondFee(500);
                              }}
                              className="p-2.5 rounded-xl border text-left bg-emerald-50 border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <div className="font-bold text-xs text-emerald-950">৩. সার্ভিস চার্জ (৫০০ টাকা)</div>
                              <div className="text-[10px] text-emerald-800 mt-0.5">ক্লিয়ারেন্স ও প্রসেসিং ফি</div>
                            </button>
                          </div>
                        </div>

                        {/* Stage Title */}
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">ধাপের নাম / শর্তের শিরোনাম (গ্রাহক দেখতে পাবে) *</Label>
                          <Input
                            value={condStageTitle}
                            onChange={(e) => setCondStageTitle(e.target.value)}
                            placeholder="যেমন: প্রথম কিস্তি জমা বাবদ"
                            className="h-10 text-xs font-bold"
                            required
                          />
                        </div>

                        {/* Bengali Instruction */}
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">
                            বিস্তারিত নির্দেশনা বার্তা (উইথড্র পেজে হাইলাইট হয়ে প্রদর্শিত হবে) *
                          </Label>
                          <Textarea
                            value={condMessage}
                            onChange={(e) => setCondMessage(e.target.value)}
                            rows={3}
                            placeholder="যেমন: আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ..."
                            className="text-xs"
                            required
                          />
                          <p className="text-[11px] text-muted-foreground">
                            এই লেখাটি গ্রাহক যখন টাকা তুলুন বাটনে চাপ দিবে তখন বড় করে লাল/হলুদ সতর্কবার্তায় দেখতে পাবে।
                          </p>
                        </div>

                        {/* Fee and Payment Account */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">প্রয়োজনীয় জমা / ফির পরিমাণ (টাকা) *</Label>
                            <Input
                              type="number"
                              value={condFee}
                              onChange={(e) => setCondFee(Number(e.target.value))}
                              className="h-10 text-xs font-mono font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">টাকা জমার অ্যাকাউন্ট / ফোন নম্বর</Label>
                              {activePaymentMethods.length > 0 && (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অটো-সিঙ্ক
                                </span>
                              )}
                            </div>
                            <Input
                              value={condDepositAccount}
                              onChange={(e) => setCondDepositAccount(e.target.value)}
                              placeholder="ডিপোজিট মেথড থেকে অটো-সিঙ্ক হবে"
                              className="h-10 text-xs font-mono font-medium"
                            />
                            {activePaymentMethods.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {activePaymentMethods.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setCondDepositAccount(`${m.name}${m.accountType ? ` (${m.accountType})` : ''}: ${m.accountNumber}`)}
                                    className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/60 hover:bg-muted font-mono"
                                  >
                                    {m.name}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setCondDepositAccount(defaultActiveDepositAccount)}
                                  className="text-[10px] px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary font-mono"
                                >
                                  সব
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Block / Mandatory Switch */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/30">
                          <div>
                            <Label className="text-xs font-bold text-foreground block">
                              উইথড্র ব্লক ও শর্ত বাধ্যতামূলক রাখুন?
                            </Label>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              সক্রিয় রাখলে এই শর্ত পূরণ ও আপনার অনুমোদন ছাড়া গ্রাহক টাকা তুলতে পারবে না।
                            </p>
                          </div>
                          <Switch checked={condRequired} onCheckedChange={setCondRequired} />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md gap-2"
                          >
                            <Send className="w-4 h-4" />
                            শর্ত সক্রিয় করুন ও গ্রাহকের পেজে হাইলাইট করুন
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-12 text-center border rounded-2xl bg-card text-muted-foreground">
                    বাম পাশ থেকে একজন গ্রাহক নির্বাচন করুন
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT METHOD CONFIGURATION */}
        {activeTab === 'methods' && (
          <div className="space-y-5">
            <Card className="border shadow-sm bg-card">
              <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    গ্রাহকের Withdraw পেমেন্ট মেথড
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    এখান থেকে bKash, Nagad, Rocket, Upay, ব্যাংক ট্রান্সফারসহ যেকোনো মেথড যোগ, সম্পাদনা, সক্রিয়/নিষ্ক্রিয় বা মুছে দিতে পারবেন। পরিবর্তনটি একই PaymentMethodConfig ও Supabase sync-এর মাধ্যমে গ্রাহক পেজে যাবে।
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenMethodModal()} className="font-bold text-xs gap-1.5">
                  <Plus className="w-4 h-4" />
                  নতুন মেথড যোগ করুন
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {paymentMethods.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    কোনো পেমেন্ট মেথড পাওয়া যায়নি। নতুন মেথড যোগ করুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paymentMethods.map((pm) => (
                      <Card key={pm.id} className="border shadow-sm hover:border-primary/40 transition-colors">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {pm.logo ? (
                                <img src={pm.logo} alt={pm.name} className="w-12 h-12 rounded-xl object-cover border bg-muted shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-12 h-12 rounded-xl border bg-muted flex items-center justify-center shrink-0"><CreditCard className="w-6 h-6 text-muted-foreground" /></div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-sm truncate">{pm.name}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{pm.nameEn}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className={pm.active ? 'text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px]' : 'text-muted-foreground text-[10px]'}>
                              {pm.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </div>

                          <div className="rounded-lg bg-muted/40 border p-3 text-xs space-y-1.5">
                            <div><span className="text-muted-foreground">অ্যাকাউন্ট:</span> <strong className="font-mono">{pm.accountNumber}</strong></div>
                            <div><span className="text-muted-foreground">টাইপ:</span> {pm.accountType} • {pm.transactionType}</div>
                            <div><span className="text-muted-foreground">সীমা:</span> {formatTaka(pm.minDeposit || 0)} – {formatTaka(pm.maxDeposit || 0)}</div>
                          </div>

                          {pm.instructionBn && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{pm.instructionBn}</p>
                          )}

                          <div className="flex gap-2 pt-1">
                            <Button type="button" size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => handleOpenMethodModal(pm)}>
                              <Edit3 className="w-3.5 h-3.5" /> সম্পাদনা
                            </Button>
                            <Button type="button" size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs gap-1" onClick={() => handleDeleteMethod(pm.id, pm.name)}>
                              <Trash2 className="w-3.5 h-3.5" /> মুছুন
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Method Add / Edit Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90dvh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {editingMethod ? 'পেমেন্ট মেথড সম্পাদনা' : 'নতুন পেমেন্ট মেথড যোগ করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              এই তথ্যটি customer withdrawal form-এ ব্যবহার হবে। Save করার পর shared payment-method sync চালু থাকবে।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMethod} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">মেথডের নাম (বাংলা) *</Label>
                <Input value={methodName} onChange={(e) => setMethodName(e.target.value)} placeholder="যেমন: বিকাশ" className="h-9 text-xs" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">নাম (English)</Label>
                <Input value={methodNameEn} onChange={(e) => setMethodNameEn(e.target.value)} placeholder="যেমন: bKash" className="h-9 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Transaction Type</Label>
                <select value={transactionType} onChange={(e) => setTransactionType(e.target.value as PaymentMethodConfig['transactionType'])} className="w-full h-9 rounded-md border bg-background px-3 text-xs">
                  <option value="Send Money">Send Money</option>
                  <option value="Cash Out">Cash Out</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Account Type</Label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value as PaymentMethodConfig['accountType'])} className="w-full h-9 rounded-md border bg-background px-3 text-xs">
                  <option value="Personal">Personal</option>
                  <option value="Agent">Agent</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Bank Account">Bank Account</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">অ্যাকাউন্ট নম্বর / ব্যাংক তথ্য *</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="যেমন: 01712345678" className="h-9 text-xs font-mono font-bold" required />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">লোগো URL</Label>
              <Input value={methodLogo} onChange={(e) => setMethodLogo(e.target.value)} placeholder="https://example.com/logo.png" className="h-9 text-xs" />
            </div>

            {methodLogo && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5">
                <img src={methodLogo} alt="Logo preview" className="w-10 h-10 rounded-lg object-cover border bg-white" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.25'; }} />
                <span className="text-[11px] text-muted-foreground">লোগো প্রিভিউ</span>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">গ্রাহকের নির্দেশনা</Label>
              <Textarea value={instructionBn} onChange={(e) => setInstructionBn(e.target.value)} rows={2} placeholder="যেমন: এই নম্বরে Send Money করুন।" className="text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">সর্বনিম্ন পরিমাণ</Label>
                <Input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="h-9 text-xs" min="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">সর্বোচ্চ পরিমাণ</Label>
                <Input type="number" value={maxDeposit} onChange={(e) => setMaxDeposit(e.target.value)} className="h-9 text-xs" min="0" />
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 cursor-pointer">
              <input type="checkbox" checked={methodActive} onChange={(e) => setMethodActive(e.target.checked)} className="h-4 w-4" />
              <span className="text-xs font-semibold">গ্রাহকের Withdraw পেজে এই মেথডটি সক্রিয় রাখুন</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setMethodDialogOpen(false)} className="text-xs">বাতিল</Button>
              <Button type="submit" className="font-bold text-xs">সংরক্ষণ করুন</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Process / Approval Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-6 bg-card">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === 'approved' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  উইথড্রয়াল আবেদন অনুমোদন ও টাকা প্রদান
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  উইথড্রয়াল আবেদন বাতিল ও ওয়ালেট রিফান্ড
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক: <span className="font-bold text-foreground">{selectedReq?.customerName}</span> ({selectedReq?.phone})
              <br />
              টাকার পরিমাণ: <span className="font-bold text-emerald-600">{formatTaka(selectedReq?.amount || 0)}</span> | মাধ্যম: <span className="font-bold">{selectedReq?.method}</span> ({selectedReq?.accountNumber})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProcessSubmit} className="space-y-4 mt-2">
            {actionType === 'approved' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ট্রানজেকশন প্রুফ / রেফারেন্স নম্বর *
                </Label>
                <Input
                  type="text"
                  placeholder="যেমন: TRX-BK-9845210"
                  value={transactionProof}
                  onChange={(e) => setTransactionProof(e.target.value)}
                  className="h-10 text-sm font-mono"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {actionType === 'approved' ? 'অ্যাডমিন নোট / কনফার্মেশন বার্তা' : 'বাতিলের কারণ (গ্রাহকের ইনবক্সে যাবে)'} *
              </Label>
              <Input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className={`flex-1 h-10 font-bold text-xs ${
                  actionType === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {actionType === 'approved' ? 'অনুমোদন নিশ্চিত করুন' : 'বাতিল নিশ্চিত করুন'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="h-10 px-4 text-xs"
              >
                বন্ধ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dynamic Next Stage Condition Modal */}
      <Dialog open={nextStageDialogOpen} onOpenChange={setNextStageDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-6 bg-card max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-blue-700">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              পরবর্তী শর্ত নির্ধারণ ও সক্রিয়করণ
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{nextStageTargetUser?.name}</strong> ({nextStageTargetUser?.phone})
              <br />
              পূর্ববর্তী শর্ত: <span className="font-semibold text-emerald-700">{nextStageTargetUser?.withdrawalCondition?.stageTitle || 'সম্পন্ন'}</span> 
              {nextStageTargetUser?.withdrawalCondition?.customerTrxId && (
                <span className="ml-2 font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                  TrxID: {nextStageTargetUser.withdrawalCondition.customerTrxId}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              পূর্ববর্তী শর্তটি সফলভাবে Accept ও আর্কাইভ করা হবে এবং নিচে আপনার দেওয়া নতুন শর্তটি (ধাপ) গ্রাহকের উইথড্রয়াল পেজে বাধ্যতামূলক হিসেবে সক্রিয় হবে।
            </p>

            {/* Quick Presets for Next Condition */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">জনপ্রিয় শর্তাবলির প্রিসেট (এক ক্লিকে নির্বাচন):</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('২য় কিস্তি জমা বাবদ');
                    setNextStageFee('2000');
                    setNextStageMsg('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে ২য় কিস্তি বাবদ। জমা সম্পন্ন হলে TrxID প্রদান করুন।');
                  }}
                  className="p-2 rounded-lg border text-left bg-amber-50 hover:bg-amber-100 border-amber-300 text-xs font-semibold text-amber-950"
                >
                  ২য় কিস্তি (২,০০০৳)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('ঋণ ঝুঁকি জীবন বীমা বাবদ');
                    setNextStageFee('1000');
                    setNextStageMsg('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে ঋণ ঝুঁকি জীবন বীমা বাবদ।');
                  }}
                  className="p-2 rounded-lg border text-left bg-blue-50 hover:bg-blue-100 border-blue-300 text-xs font-semibold text-blue-950"
                >
                  জীবন বীমা (১,০০০৳)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('বাংলাদেশ ব্যাংক স্ট্যাম্প ও দলিল ফি');
                    setNextStageFee('500');
                    setNextStageMsg('সরকারি ১০০ টাকার নন-জুডিশিয়াল স্ট্যাম্প ও লিগ্যাল নোটারি ক্লিয়ারেন্স বাবদ ৫০০ টাকা জমা দিন।');
                  }}
                  className="p-2 rounded-lg border text-left bg-purple-50 hover:bg-purple-100 border-purple-300 text-xs font-semibold text-purple-950"
                >
                  স্ট্যাম্প ফি (৫০০৳)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('সার্ভিস চার্জ ও সিকিউরিটি ক্লিয়ারেন্স');
                    setNextStageFee('1500');
                    setNextStageMsg('উইথড্রয়াল ক্লিয়ারেন্স ও ভেরিফিকেশন চার্জ বাবদ ১৫০০ টাকা জমা দিন।');
                  }}
                  className="p-2 rounded-lg border text-left bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-xs font-semibold text-emerald-950"
                >
                  সার্ভিস ফি (১,৫০০৳)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('সিকিউরিটি জামানত ডিপোজিট');
                    setNextStageFee('2500');
                    setNextStageMsg('রিটার্নেবল সিকিউরিটি জামানত বাবদ ২৫০০ টাকা জমা দিন।');
                  }}
                  className="p-2 rounded-lg border text-left bg-rose-50 hover:bg-rose-100 border-rose-300 text-xs font-semibold text-rose-950"
                >
                  জামানত (২,৫০০৳)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNextStageTitle('কাস্টম শর্ত');
                    setNextStageFee('');
                    setNextStageMsg('');
                  }}
                  className="p-2 rounded-lg border text-left bg-muted hover:bg-muted/80 text-xs font-semibold"
                >
                  কাস্টম শর্ত লিখুন
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">নতুন শর্তের নাম / শিরোনাম (Stage Title) *</Label>
              <Input
                value={nextStageTitle}
                onChange={(e) => setNextStageTitle(e.target.value)}
                placeholder="যেমন: ২য় কিস্তি জমা বাবদ"
                className="h-9 text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">প্রয়োজনীয় ফি / জমার পরিমাণ (টাকা) *</Label>
                <Input
                  type="number"
                  value={nextStageFee}
                  onChange={(e) => setNextStageFee(e.target.value)}
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">টাকা জমার অ্যাকাউন্ট / ফোন নম্বর *</Label>
                  {activePaymentMethods.length > 0 && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অটো-সিঙ্ক সক্রিয়
                    </span>
                  )}
                </div>
                <Input
                  value={nextStageAccount}
                  onChange={(e) => setNextStageAccount(e.target.value)}
                  placeholder="ডিপোজিট মেথড থেকে অটো-সিঙ্ক হবে"
                  className="h-9 text-xs font-mono font-medium"
                  required
                />
                {activePaymentMethods.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-muted-foreground block font-medium">ক্লিক করে সিলেক্ট করুন:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activePaymentMethods.map((m) => {
                        const mStr = `${m.name}${m.accountType ? ` (${m.accountType})` : ''}: ${m.accountNumber}`;
                        const isSelected = nextStageAccount === mStr;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setNextStageAccount(mStr)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-mono font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/70 hover:bg-muted text-foreground border-border'
                            }`}
                          >
                            {m.name}: {m.accountNumber}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setNextStageAccount(defaultActiveDepositAccount)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-mono font-medium transition-colors ${
                          nextStageAccount === defaultActiveDepositAccount
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'
                        }`}
                      >
                        সবগুলো ({activePaymentMethods.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">গ্রাহকের জন্য বিস্তারিত নির্দেশনামূলক বার্তা *</Label>
              <Textarea
                value={nextStageMsg}
                onChange={(e) => setNextStageMsg(e.target.value)}
                rows={2}
                placeholder="যেমন: আপনাকে এখন ২০০০ টাকা জমা দিতে হবে ২য় কিস্তি বাবদ..."
                className="text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setNextStageDialogOpen(false)}>
                বাতিল
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!nextStageTargetUser) return;
                  if (!nextStageTitle.trim()) {
                    toast.error('শর্তের নাম প্রদান করুন');
                    return;
                  }
                  handleAcceptAndNextStage(
                    nextStageTargetUser,
                    nextStageTitle.trim(),
                    nextStageMsg.trim(),
                    parseFloat(nextStageFee) || 0,
                    nextStageAccount.trim()
                  );
                  setNextStageDialogOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                ✓ পূর্ববর্তী শর্ত Accept করুন ও নতুন শর্ত সক্রিয় করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
