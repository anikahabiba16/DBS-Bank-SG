import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  PiggyBank, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Clock, 
  AlertCircle, 
  Wallet,
  Percent,
  Search,
  Sparkles,
  Eye,
  ShieldCheck,
  Copy,
  Upload,
  ExternalLink,
  Zap,
  Coins,
  RefreshCw
} from 'lucide-react';
import { formatTaka, toBengaliNumber, loanStorage } from '@/services/storage';
import { supabaseSync } from '@/services/supabaseSyncService';
import { FixedDepositScheme, CustomerFixedDeposit } from '@/types/loan';
import { toast } from 'sonner';

export const AdminFixedDepositPage: React.FC = () => {
  const { 
    fixedDepositSchemes, 
    saveFixedDepositScheme, 
    deleteFixedDepositScheme,
    customerFixedDeposits,
    approveCustomerFixedDeposit,
    rejectCustomerFixedDeposit,
    updateFixedDepositDailyCommission,
    distributeTodayFixedDepositProfit
  } = useLoan();

  const [activeTab, setActiveTab] = useState<'applications' | 'funds' | 'schemes'>('applications');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const cloudDeposits = await supabaseSync.fetchCustomerFixedDepositsFromCloud();
      if (cloudDeposits && cloudDeposits.length > 0) {
        loanStorage.saveCustomerFixedDepositsFromCloud(cloudDeposits);
        toast.success(`ক্লাউড থেকে ${toBengaliNumber(cloudDeposits.length)} টি ডিপোজিট সিঙ্ক হয়েছে!`);
      } else {
        toast.info('ডাটাবেজ বর্তমানে আপ-টু-ডেট রয়েছে');
      }
    } catch {
      toast.error('ক্লাউড সিঙ্কে সমস্যা হয়েছে');
    } finally {
      setRefreshing(false);
    }
  };

  // Slip Preview Modal state
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [viewingSlipDeposit, setViewingSlipDeposit] = useState<CustomerFixedDeposit | null>(null);
  const [slipImgError, setSlipImgError] = useState(false);

  // Approval Modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [depositForApproval, setDepositForApproval] = useState<CustomerFixedDeposit | null>(null);
  const [approvalDailyRate, setApprovalDailyRate] = useState<number>(1.5);
  const [approvalNote, setApprovalNote] = useState<string>('');

  // Rejection Modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [depositForRejection, setDepositForRejection] = useState<CustomerFixedDeposit | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Quick Commission Edit Modal state
  const [editCommissionModalOpen, setEditCommissionModalOpen] = useState(false);
  const [depositForRateEdit, setDepositForRateEdit] = useState<CustomerFixedDeposit | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(1.5);

  // Scheme Modal state
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [titleBn, setTitleBn] = useState('');
  const [taglineBn, setTaglineBn] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [durationDays, setDurationDays] = useState(30);
  const [monthlyProfitPercent, setMonthlyProfitPercent] = useState(10);
  const [minAmount, setMinAmount] = useState(1000);
  const [maxAmount, setMaxAmount] = useState(100000);
  const [badgeBn, setBadgeBn] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  // Count pending applications
  const pendingCount = customerFixedDeposits.filter((d) => d.status === 'pending').length;
  const activeDeposits = customerFixedDeposits.filter((d) => d.status === 'active');
  const totalPrincipalInvested = activeDeposits.reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);
  const totalProfitDistributed = activeDeposits.reduce((acc, curr) => acc + (curr.totalProfitEarned || 0), 0);
  const todayExpectedProfit = activeDeposits.reduce((acc, curr) => {
    const rate = curr.dailyProfitPercent || 1.0;
    return acc + Math.round((curr.depositAmount * rate) / 100);
  }, 0);

  // Filtered deposits for applications tab
  const filteredDeposits = customerFixedDeposits.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.customerName?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q) ||
      d.transactionId?.toLowerCase().includes(q) ||
      d.schemeTitleBn?.toLowerCase().includes(q)
    );
  });

  const handleOpenSlipModal = (dep: CustomerFixedDeposit) => {
    setViewingSlipDeposit(dep);
    setSlipImgError(false);
    setSlipModalOpen(true);
  };

  const handleOpenApprovalModal = (dep: CustomerFixedDeposit) => {
    setDepositForApproval(dep);
    setApprovalDailyRate(dep.dailyProfitPercent || 1.5);
    setApprovalNote('');
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!depositForApproval) return;
    const rate = Number(approvalDailyRate) || 1.5;
    approveCustomerFixedDeposit(depositForApproval.id, rate, approvalNote);
    toast.success(`আবেদন অনুমোদিত হয়েছে! গ্রাহক প্রতিদিন ${rate}% হারে কমিশন পাবেন।`);
    setApprovalModalOpen(false);
    setDepositForApproval(null);
  };

  const handleOpenRejectionModal = (dep: CustomerFixedDeposit) => {
    setDepositForRejection(dep);
    setRejectionReason('পেমেন্ট স্লিপ অথবা ট্রানজেকশন আইডিতে অমিল পাওয়া গেছে।');
    setRejectionModalOpen(true);
  };

  const handleConfirmRejection = () => {
    if (!depositForRejection) return;
    rejectCustomerFixedDeposit(depositForRejection.id, rejectionReason);
    toast.error('ফিক্সড ডিপোজিট আবেদন বাতিল করা হয়েছে');
    setRejectionModalOpen(false);
    setDepositForRejection(null);
  };

  const handleOpenEditCommission = (dep: CustomerFixedDeposit) => {
    setDepositForRateEdit(dep);
    setNewCommissionRate(dep.dailyProfitPercent || 1.5);
    setEditCommissionModalOpen(true);
  };

  const handleSaveCommissionRate = () => {
    if (!depositForRateEdit) return;
    const rate = Number(newCommissionRate) || 1.0;
    updateFixedDepositDailyCommission(depositForRateEdit.id, rate);
    toast.success(`কমিশন হার সফলভাবে ${rate}% সেট করা হয়েছে!`);
    setEditCommissionModalOpen(false);
    setDepositForRateEdit(null);
  };

  const handleDistributeTodayProfit = () => {
    const res = distributeTodayFixedDepositProfit();
    toast.success(`আজকের দৈনিক কমিশন সফলভাবে বণ্টন হয়েছে! মোট ${toBengaliNumber(res.count)} টি অ্যাকাউন্টে ${formatTaka(res.totalDistributed)} যুক্ত হয়েছে।`);
  };

  const handleOpenCreateScheme = () => {
    setEditingSchemeId(null);
    setTitleBn('');
    setTaglineBn('');
    setDurationMonths(1);
    setDurationDays(30);
    setMonthlyProfitPercent(10);
    setMinAmount(1000);
    setMaxAmount(100000);
    setBadgeBn('জনপ্রিয়');
    setFeaturesInput('মাসিক ১০% নিশ্চিত মুনাফা\nমেয়াদ শেষে মূলধন ফেরত\nযেকোনো সময় কাস্টমার সার্ভিস সাপোর্ট');
    setSchemeModalOpen(true);
  };

  const handleOpenEditScheme = (scheme: FixedDepositScheme) => {
    setEditingSchemeId(scheme.id);
    setTitleBn(scheme.titleBn);
    setTaglineBn(scheme.taglineBn || '');
    setDurationMonths(scheme.durationMonths);
    setDurationDays(scheme.durationDays || scheme.durationMonths * 30);
    setMonthlyProfitPercent(scheme.monthlyProfitPercent);
    setMinAmount(scheme.minAmount);
    setMaxAmount(scheme.maxAmount);
    setBadgeBn(scheme.badgeBn || '');
    setFeaturesInput(scheme.featuresBn?.join('\n') || '');
    setSchemeModalOpen(true);
  };

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      toast.error('অনুগ্রহ করে স্কিমের নাম লিখুন');
      return;
    }

    const feats = featuresInput
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const scheme: FixedDepositScheme = {
      id: editingSchemeId || `fds-${Date.now()}`,
      titleBn,
      taglineBn,
      durationMonths,
      durationDays,
      monthlyProfitPercent,
      minAmount,
      maxAmount,
      badgeBn: badgeBn || undefined,
      featuresBn: feats,
      active: true
    };

    saveFixedDepositScheme(scheme);
    toast.success(editingSchemeId ? 'স্কিম সফলভাবে আপডেট হয়েছে' : 'নতুন স্কিম যুক্ত হয়েছে');
    setSchemeModalOpen(false);
  };

  const handleDeleteScheme = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই স্কিমটি মুছে ফেলতে চান?')) {
      deleteFixedDepositScheme(id);
      toast.success('স্কিম মুছে ফেলা হয়েছে');
    }
  };

  return (
    <AdminLayout
      title="ফিক্সড ডিপোজিট (FD) ও দৈনিক কমিশন ব্যবস্থাপনা"
      subtitle="গ্রাহকদের ফিক্সড ডিপোজিট আবেদন যাচাই, পেমেন্ট স্লিপ প্রিভিউ, কাস্টম দৈনিক কমিশন % নির্ধারণ ও অটো মুনাফা বণ্টন"
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs h-9 px-3 gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'সিঙ্ক হচ্ছে...' : 'লাইভ রিফ্রেশ'}
          </Button>
          <Button
            onClick={handleDistributeTodayProfit}
            variant="outline"
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-9 px-3 gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            আজকের কমিশন বণ্টন করুন
          </Button>
          <Button
            onClick={handleOpenCreateScheme}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 px-3 gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন স্কিম তৈরি
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b space-x-2 md:space-x-4 text-xs font-bold overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ফিক্সড ডিপোজিট আবেদন ও স্লিপ যাচাই</span>
            {pendingCount > 0 ? (
              <Badge className="bg-amber-500 text-white font-extrabold text-[10px] px-1.5 py-0 h-4 min-w-4 rounded-full">
                {pendingCount}
              </Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground font-normal">({customerFixedDeposits.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funds')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'funds'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>সক্রিয় ফান্ড ও দৈনিক কমিশন নিয়ন্ত্রণ ({activeDeposits.length} টি)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schemes')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schemes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>স্কিম সেটিংস ({fixedDepositSchemes.length} টি)</span>
          </button>
        </div>

        {/* TAB 1: FD APPLICATIONS & SLIP VERIFICATION */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">ফিল্টার:</span>
                <Button
                  size="sm"
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="h-7 text-xs font-bold"
                >
                  সব আবেদন ({customerFixedDeposits.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  className="h-7 text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Clock className="w-3 h-3" />
                  অপেক্ষমাণ ({pendingCount})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  className="h-7 text-xs font-bold gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  অনুমোদিত ({activeDeposits.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  className="h-7 text-xs font-bold gap-1"
                >
                  <XCircle className="w-3 h-3 text-destructive" />
                  বাতিল ({customerFixedDeposits.filter((d) => d.status === 'rejected').length})
                </Button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="গ্রাহকের নাম, ফোন বা TrxID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Applications Table */}
            <Card className="border shadow-xs overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <Table className="[&>div]:max-w-full text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/50 font-bold text-[11px]">
                      <TableHead className="whitespace-nowrap px-4 py-3">গ্রাহকের নাম ও ফোন</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3">স্কিম</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-right">আমানতের পরিমাণ</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3">পেমেন্ট মেথড ও TrxID</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">পেমেন্ট স্লিপ</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">দৈনিক কমিশন (%)</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">স্ট্যাটাস</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">যাচাই ও অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          কোনো ফিক্সড ডিপোজিট আবেদন পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeposits.map((dep) => (
                        <TableRow key={dep.id} className="hover:bg-muted/30">
                          <TableCell className="whitespace-nowrap px-4 py-3">
                            <div className="font-bold text-foreground text-sm">{dep.customerName}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{dep.phone}</div>
                            <div className="text-[10px] text-muted-foreground">তারিখ: {dep.createdAt}</div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap px-4 py-3 font-medium">
                            <div className="text-foreground font-semibold">{dep.schemeTitleBn}</div>
                            <div className="text-[10px] text-muted-foreground">{dep.durationMonths} মাস মেয়াদ</div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                            <span className="font-mono font-extrabold text-sm text-foreground">
                              {formatTaka(dep.depositAmount)}
                            </span>
                          </TableCell>

                          <TableCell className="whitespace-nowrap px-4 py-3 font-mono">
                            <Badge variant="outline" className="text-[10px] font-bold mb-1">
                              {dep.paymentMethod}
                            </Badge>
                            <div className="flex items-center gap-1 font-bold text-xs text-primary">
                              <span>{dep.transactionId || 'N/A'}</span>
                              {dep.transactionId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(dep.transactionId);
                                    toast.success('TrxID কপি করা হয়েছে');
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="কপি করুন"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </TableCell>

                          {/* Payment Slip Button */}
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenSlipModal(dep)}
                              className="h-7 px-2.5 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              <span>স্লিপ দেখুন</span>
                            </Button>
                          </TableCell>

                          {/* Daily Commission */}
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1 font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span>{toBengaliNumber(dep.dailyProfitPercent || 1.5)}%</span>
                              <span className="text-[10px] text-emerald-600 font-normal">/দিন</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              +{formatTaka(Math.round((dep.depositAmount * (dep.dailyProfitPercent || 1.5)) / 100))}/দিন
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            {dep.status === 'pending' ? (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] gap-1">
                                <Clock className="w-3 h-3" />
                                অপেক্ষমাণ
                              </Badge>
                            ) : dep.status === 'active' ? (
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                সক্রিয় ফান্ড
                              </Badge>
                            ) : dep.status === 'rejected' ? (
                              <Badge variant="destructive" className="font-bold text-[10px] gap-1">
                                <XCircle className="w-3 h-3" />
                                বাতিল
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                {dep.status}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Action Buttons */}
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {dep.status === 'pending' ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenApprovalModal(dep)}
                                    className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>যাচাই ও অনুমোদন</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenRejectionModal(dep)}
                                    className="h-7 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30"
                                  >
                                    বাতিল
                                  </Button>
                                </>
                              ) : dep.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEditCommission(dep)}
                                  className="h-7 px-2.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1"
                                >
                                  <Percent className="w-3 h-3" />
                                  <span>কমিশন % পরিবর্তন</span>
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">
                                  {dep.adminNote || 'কার্যক্রম সম্পন্ন'}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: ACTIVE FUNDS & DAILY COMMISSIONS */}
        {activeTab === 'funds' && (
          <div className="space-y-6">
            {/* Stat Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border shadow-xs bg-gradient-to-br from-card to-emerald-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">মোট সক্রিয় ফান্ড মূলধন</span>
                    <h3 className="text-xl font-black text-foreground mt-1 font-mono">
                      {formatTaka(totalPrincipalInvested)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Wallet className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-xs bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">মোট অর্জিত মুনাফা</span>
                    <h3 className="text-xl font-black text-primary mt-1 font-mono">
                      {formatTaka(totalProfitDistributed)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-xs bg-gradient-to-br from-card to-amber-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">প্রতিদিনের মোট কমিশন দায়</span>
                    <h3 className="text-xl font-black text-amber-600 mt-1 font-mono">
                      {formatTaka(todayExpectedProfit)}/দিন
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Coins className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-xs bg-gradient-to-br from-card to-blue-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">সক্রিয় ডিপোজিট গ্রাহক</span>
                    <h3 className="text-xl font-black text-blue-600 mt-1">
                      {toBengaliNumber(activeDeposits.length)} জন
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Distribution Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">অটো দৈনিক কমিশন সক্রিয়</Badge>
                  <span className="text-xs font-bold text-emerald-800">
                    প্রতিদিন স্বয়ংক্রিয়ভাবে গ্রাহক ব্যালেন্সে লাভ যুক্ত হয়
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  সিস্টেম প্রতি ২৪ ঘণ্টা পর পর গ্রাহকদের নির্ধারিত পার্সেন্টেজ হারে লাভ যোগ করে। আপনি চাইলে এখনই ম্যানুয়ালি আজকের লাভ বণ্টন করতে পারেন।
                </p>
              </div>

              <Button
                onClick={handleDistributeTodayProfit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 gap-2 shadow-sm shrink-0"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                আজকের লাভ এখনই বণ্টন করুন
              </Button>
            </div>

            {/* Active Customers Fund Table */}
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">সক্রিয় গ্রাহক ফিক্সড ডিপোজিট পোর্টফোলিও</CardTitle>
                <CardDescription className="text-xs">
                  গ্রাহকের নির্ধারিত দৈনিক কমিশন শতকরা হার (%) যেকোনো সময় পরিবর্তন বা আপডেট করুন
                </CardDescription>
              </CardHeader>
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <Table className="[&>div]:max-w-full text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/50 font-bold text-[11px]">
                      <TableHead className="whitespace-nowrap px-4 py-3">গ্রাহক</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3">স্কিম</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-right">আসল জমা</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">দৈনিক কমিশন (%)</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-right">দৈনিক লাভ</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-right">মোট অর্জিত লাভ</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">শেষ বণ্টন তারিখ</TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-center">কমিশন আপডেট</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDeposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          কোনো সক্রিয় ফিক্সড ডিপোজিট নেই
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeDeposits.map((dep) => (
                        <TableRow key={dep.id} className="hover:bg-muted/30">
                          <TableCell className="whitespace-nowrap px-4 py-3">
                            <strong className="text-foreground text-sm block">{dep.customerName}</strong>
                            <span className="text-[11px] text-muted-foreground font-mono">{dep.phone}</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 font-medium">
                            {dep.schemeTitleBn}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold">
                            {formatTaka(dep.depositAmount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            <span className="font-mono font-extrabold text-xs text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                              {toBengaliNumber(dep.dailyProfitPercent || 1.5)}%
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold text-emerald-600">
                            +{formatTaka(Math.round((dep.depositAmount * (dep.dailyProfitPercent || 1.5)) / 100))}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono font-extrabold text-primary">
                            {formatTaka(dep.totalProfitEarned || 0)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center font-mono text-muted-foreground text-[11px]">
                            {dep.lastAccruedDate || dep.startDate}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditCommission(dep)}
                              className="h-7 px-2.5 text-xs font-bold text-primary border-primary/30 hover:bg-primary/10 gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              রেট পরিবর্তন
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: SCHEMES CONFIGURATION */}
        {activeTab === 'schemes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {fixedDepositSchemes.map((scheme) => (
              <Card key={scheme.id} className="border shadow-sm flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-primary">
                      {toBengaliNumber(scheme.durationMonths)} মাস মেয়াদী
                    </span>
                    {scheme.badgeBn && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                        {scheme.badgeBn}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-1">
                    {scheme.titleBn}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {scheme.taglineBn}
                  </CardDescription>

                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[11px] text-emerald-800 font-semibold">মাসিক প্রদেয় কমিশন</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {toBengaliNumber(scheme.monthlyProfitPercent)}%
                      <span className="text-xs font-normal text-emerald-700 ml-1">প্রতি মাসে</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="text-xs text-muted-foreground space-y-1 py-2 border-y">
                    <div className="flex justify-between">
                      <span>ন্যূনতম জমা:</span>
                      <strong className="text-foreground">{formatTaka(scheme.minAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>সর্বোচ্চ জমা:</span>
                      <strong className="text-foreground">{formatTaka(scheme.maxAmount)}</strong>
                    </div>
                  </div>

                  {scheme.featuresBn && (
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      {scheme.featuresBn.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditScheme(scheme)}
                      className="flex-1 h-8 text-xs font-bold gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      এডিট
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteScheme(scheme.id)}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 1. HIGH RESOLUTION PAYMENT SLIP PREVIEW MODAL */}
      <Dialog open={slipModalOpen} onOpenChange={setSlipModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ফিক্সড ডিপোজিট পেমেন্ট স্লিপ ও ট্রানজেকশন রসিদ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের ব্যাংক/এমএফএস জমা রসিদ বা ডিজিটাল ভাউচার যাচাই করুন
            </DialogDescription>
          </DialogHeader>

          {viewingSlipDeposit && (() => {
            const slip = viewingSlipDeposit.slipUrl || '';
            const isActualImage = (slip.startsWith('http://') || slip.startsWith('https://') || slip.startsWith('data:image/') || slip.startsWith('blob:')) && !slipImgError;

            return (
              <div className="space-y-4 mt-2">
                {/* High-Res Image View Box or Digital Verified Voucher Fallback */}
                {isActualImage ? (
                  <div className="relative border rounded-xl overflow-hidden bg-black/90 p-2 flex items-center justify-center min-h-[300px]">
                    <img
                      src={slip}
                      alt="FD Payment Slip"
                      onError={() => setSlipImgError(true)}
                      className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg cursor-zoom-in transition-transform hover:scale-105"
                    />
                  </div>
                ) : (
                  /* Official High-Resolution Digital Transaction Voucher Fallback */
                  <div className="border-2 border-emerald-500/40 rounded-2xl bg-gradient-to-b from-card via-emerald-50/20 to-card p-5 sm:p-6 shadow-md space-y-4 text-foreground relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-start justify-between border-b pb-3 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                            {viewingSlipDeposit.paymentMethod}
                          </span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ফিক্সড ডিপোজিট পেমেন্ট স্লিপ
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">
                          {viewingSlipDeposit.schemeTitleBn}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">ডিপোজিট পরিমাণ</span>
                        <strong className="text-xl font-extrabold text-emerald-700 font-mono">
                          {formatTaka(viewingSlipDeposit.depositAmount)}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">গ্রাহকের নাম:</span>
                        <strong className="text-foreground text-sm font-bold">{viewingSlipDeposit.customerName}</strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">ফোন নম্বর:</span>
                        <strong className="text-foreground font-mono font-bold">{viewingSlipDeposit.phone}</strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">ট্রানজেকশন আইডি (TrxID):</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-primary font-mono font-extrabold text-sm">{viewingSlipDeposit.transactionId}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(viewingSlipDeposit.transactionId);
                              toast.success('TrxID কপি করা হয়েছে!');
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="TrxID কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">আবেদনের তারিখ:</span>
                        <strong className="text-foreground font-mono">{viewingSlipDeposit.createdAt}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2.5">
                      <span>মেয়াদকাল: {viewingSlipDeposit.durationMonths} মাস</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        যাচাইকরণ প্রস্তুত
                      </span>
                    </div>
                  </div>
                )}

                {/* Upload or Replace Slip Option for Admin */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs bg-muted/40 p-2.5 rounded-lg border">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>স্লিপের আসল ছবি যুক্ত / আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0] && viewingSlipDeposit) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              const newUrl = reader.result;
                              setViewingSlipDeposit({
                                ...viewingSlipDeposit,
                                slipUrl: newUrl
                              });
                              setSlipImgError(false);
                              toast.success('স্লিপ ছবি সফলভাবে আপলোড করা হয়েছে!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {isActualImage && (
                    <a
                      href={slip}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      মূল ছবি বড় করে ব্রাউজারে খুলুন ↗
                    </a>
                  )}
                </div>

                {/* Direct Action from inside Slip Modal */}
                {viewingSlipDeposit.status === 'pending' && (
                  <div className="pt-3 border-t flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSlipModalOpen(false);
                        handleOpenRejectionModal(viewingSlipDeposit);
                      }}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-bold"
                    >
                      বাতিল করুন
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSlipModalOpen(false);
                        handleOpenApprovalModal(viewingSlipDeposit);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      যাচাই ও অনুমোদন করুন
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* 2. APPROVAL & DAILY COMMISSION SETUP MODAL */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>ফিক্সড ডিপোজিট অনুমোদন ও দৈনিক কমিশন নির্ধারণ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের ডিপোজিট ফান্ড সক্রিয় করুন এবং প্রতিদিন কত পার্সেন্ট কমিশন অটো যুক্ত হবে তা নির্ধারণ করুন
            </DialogDescription>
          </DialogHeader>

          {depositForApproval && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/40 p-3.5 rounded-xl border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">গ্রাহকের নাম:</span>
                  <strong className="text-foreground">{depositForApproval.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">মোবাইল নম্বর:</span>
                  <strong className="text-foreground font-mono">{depositForApproval.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">স্কিম:</span>
                  <strong className="text-foreground">{depositForApproval.schemeTitleBn}</strong>
                </div>
                <div className="flex justify-between border-t pt-1.5 mt-1.5">
                  <span className="text-muted-foreground">জমার আসল পরিমাণ:</span>
                  <strong className="text-emerald-700 text-sm font-extrabold font-mono">
                    {formatTaka(depositForApproval.depositAmount)}
                  </strong>
                </div>
              </div>

              {/* Commission Percentage Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>দৈনিক কমিশন শতকরা হার (%) নির্ধারণ করুন:</span>
                  </Label>
                  <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {toBengaliNumber(approvalDailyRate)}% / দিন
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={approvalDailyRate}
                  onChange={(e) => setApprovalDailyRate(Number(e.target.value))}
                  className="h-10 text-base font-bold font-mono text-emerald-700 border-emerald-300 focus-visible:ring-emerald-500"
                />
                
                {/* Live Daily Accrual Preview */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-semibold">
                    স্বয়ংক্রিয় প্রতিদিন গ্রাহক ব্যালেন্সে যোগ হবে:
                  </span>
                  <strong className="text-emerald-700 text-sm font-extrabold font-mono">
                    +{formatTaka(Math.round((depositForApproval.depositAmount * approvalDailyRate) / 100))}
                  </strong>
                </div>
              </div>

              {/* Admin Note */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">অ্যাডমিন নোট / রিমার্ক (ঐচ্ছিক):</Label>
                <Input
                  type="text"
                  placeholder="যেমন: ব্যাংক স্লিপ যাচাইপূর্বক ফান্ডে অনুমোদিত"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  onClick={handleConfirmApproval}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  অনুমোদন ও ফান্ডে যুক্ত করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setApprovalModalOpen(false)}
                  className="h-10 px-4 text-xs"
                >
                  বাতিল
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. REJECTION MODAL */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span>আবেদন বাতিলকরণ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের ফিক্সড ডিপোজিট আবেদন বাতিল করার কারণ উল্লেখ করুন
            </DialogDescription>
          </DialogHeader>

          {depositForRejection && (
            <div className="space-y-3 mt-2">
              <div className="text-xs bg-muted/30 p-2.5 rounded-lg border">
                <div>গ্রাহক: <strong>{depositForRejection.customerName}</strong> ({depositForRejection.phone})</div>
                <div>জমা: <strong>{formatTaka(depositForRejection.depositAmount)}</strong></div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">বাতিলের সুনির্দিষ্ট কারণ:</Label>
                <Input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleConfirmRejection}
                  variant="destructive"
                  className="flex-1 h-9 font-bold text-xs"
                >
                  আবেদন বাতিল নিশ্চিত করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectionModalOpen(false)}
                  className="h-9 px-4 text-xs"
                >
                  ফিরে যান
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. QUICK COMMISSION RATE EDIT MODAL */}
      <Dialog open={editCommissionModalOpen} onOpenChange={setEditCommissionModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              <span>দৈনিক কমিশন শতকরা হার পরিবর্তন</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              এই গ্রাহকের জন্য পরবর্তী দিনগুলোতে স্বয়ংক্রিয়ভাবে যে হারে লাভ যুক্ত হবে তা পরিবর্তন করুন
            </DialogDescription>
          </DialogHeader>

          {depositForRateEdit && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/40 p-3 rounded-xl border text-xs space-y-1">
                <div>গ্রাহক: <strong>{depositForRateEdit.customerName}</strong> ({depositForRateEdit.phone})</div>
                <div>আসল জমা: <strong>{formatTaka(depositForRateEdit.depositAmount)}</strong></div>
                <div>বর্তমান দৈনিক কমিশন: <strong className="text-emerald-700 font-mono">{toBengaliNumber(depositForRateEdit.dailyProfitPercent || 1.5)}%</strong></div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">নতুন দৈনিক কমিশন শতকরা হার (%):</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="h-10 text-base font-bold font-mono text-emerald-700"
                />
                <div className="text-[11px] text-muted-foreground">
                  নতুন দৈনিক লাভ হবে: <strong className="text-foreground">+{formatTaka(Math.round((depositForRateEdit.depositAmount * newCommissionRate) / 100))}/দিন</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  onClick={handleSaveCommissionRate}
                  className="flex-1 h-9 bg-primary text-primary-foreground font-bold text-xs"
                >
                  আপডেট সংরক্ষণ করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditCommissionModalOpen(false)}
                  className="h-9 px-4 text-xs"
                >
                  বাতিল
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. SCHEME EDITOR MODAL */}
      <Dialog open={schemeModalOpen} onOpenChange={setSchemeModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingSchemeId ? 'স্কিম সম্পাদনা' : 'নতুন ফিক্সড ডিপোজিট স্কিম তৈরি'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকদের জন্য আকর্ষণীয় মাসিক কমিশন ও মেয়াদী স্কিম কনফিগার করুন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveScheme} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">স্কিমের শিরোনাম (বাংলায়) *</Label>
              <Input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: ১ মাস মেয়াদী নিশ্চিত মুনাফা স্কিম"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">ট্যাগলাইন / সংক্ষিপ্ত বর্ণনা</Label>
              <Input
                type="text"
                value={taglineBn}
                onChange={(e) => setTaglineBn(e.target.value)}
                placeholder="যেমন: স্বল্পমেয়াদী আমানত ও সর্বোচ্চ রিটার্ন"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">মেয়াদ (মাস)</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={durationMonths}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setDurationMonths(m);
                    setDurationDays(m * 30);
                  }}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">মাসিক কমিশন (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  value={monthlyProfitPercent}
                  onChange={(e) => setMonthlyProfitPercent(Number(e.target.value))}
                  className="h-9 text-xs font-bold text-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">ন্যূনতম জমা (টাকা)</Label>
                <Input
                  type="number"
                  step="500"
                  min="500"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">সর্বোচ্চ জমা (টাকা)</Label>
                <Input
                  type="number"
                  step="5000"
                  min="1000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">ব্যাজ (ঐচ্ছিক)</Label>
              <Input
                type="text"
                value={badgeBn}
                onChange={(e) => setBadgeBn(e.target.value)}
                placeholder="যেমন: জনপ্রিয় / সুপার সেভার"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">বৈশিষ্ট্যসমূহ (প্রতি লাইনে একটি)</Label>
              <textarea
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="প্রতি লাইনে একটি করে বৈশিষ্ট্য লিখুন"
                rows={3}
                className="w-full text-xs p-2.5 rounded-md border border-input bg-background"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs shadow-md"
              >
                সংরক্ষণ করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSchemeModalOpen(false)}
                className="h-10 px-4 text-xs font-semibold"
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
