import React, { useState, useEffect } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { DepositRequest, PaymentMethodConfig } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { withdrawalPaymentService, type WithdrawalPaymentMethod } from '@/services/withdrawalPaymentService';
import { 
  ArrowDownCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Wallet, 
  Smartphone, 
  FileCheck,
  Search,
  Filter,
  Eye,
  CreditCard,
  Building2,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  QrCode,
  Users,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDepositsPage: React.FC = () => {
  const { 
    depositRequests, 
    processDepositRequest, 
    paymentMethods, 
    savePaymentMethod, 
    deletePaymentMethod,
    users
  } = useLoan();

  const [activeTab, setActiveTab] = useState<'requests' | 'methods' | 'withdrawalMethods' | 'customerAccounts'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Withdrawal Payment Methods state
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalPaymentMethod[]>([]);
  const [loadingWithdrawalMethods, setLoadingWithdrawalMethods] = useState(false);
  const [withdrawalMethodDialogOpen, setWithdrawalMethodDialogOpen] = useState(false);
  const [editingWithdrawalMethod, setEditingWithdrawalMethod] = useState<WithdrawalPaymentMethod | null>(null);

  const [wmId, setWmId] = useState('');
  const [wmName, setWmName] = useState('');
  const [wmLabelBn, setWmLabelBn] = useState('');
  const [wmChannelType, setWmChannelType] = useState<'mobile_banking' | 'bank' | 'other'>('mobile_banking');
  const [wmLogoUrl, setWmLogoUrl] = useState('');
  const [wmPlaceholder, setWmPlaceholder] = useState('');
  const [wmInstructions, setWmInstructions] = useState('');
  const [wmIsActive, setWmIsActive] = useState(true);
  const [wmDisplayOrder, setWmDisplayOrder] = useState('1');

  const loadWithdrawalMethods = async () => {
    setLoadingWithdrawalMethods(true);
    const list = await withdrawalPaymentService.getAllMethods();
    setWithdrawalMethods(list);
    setLoadingWithdrawalMethods(false);
  };

  useEffect(() => {
    loadWithdrawalMethods();
  }, []);

  const handleOpenWithdrawalMethodModal = (method?: WithdrawalPaymentMethod) => {
    if (method) {
      setEditingWithdrawalMethod(method);
      setWmId(method.id);
      setWmName(method.name);
      setWmLabelBn(method.label_bn);
      setWmChannelType(method.channel_type);
      setWmLogoUrl(method.logo_url || '');
      setWmPlaceholder(method.account_number_placeholder || '');
      setWmInstructions(method.instructions_bn || '');
      setWmIsActive(method.is_active);
      setWmDisplayOrder(String(method.display_order || 1));
    } else {
      setEditingWithdrawalMethod(null);
      setWmId('');
      setWmName('');
      setWmLabelBn('');
      setWmChannelType('mobile_banking');
      setWmLogoUrl('');
      setWmPlaceholder('01XXXXXXXXX');
      setWmInstructions('সঠিক একাউন্ট বা মোবাইল নম্বর দিন।');
      setWmIsActive(true);
      setWmDisplayOrder(String(withdrawalMethods.length + 1));
    }
    setWithdrawalMethodDialogOpen(true);
  };

  const handleSaveWithdrawalMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wmName.trim() || !wmLabelBn.trim()) {
      toast.error('মেথড নাম ও বাংলা লেবেল আবশ্যক');
      return;
    }
    const finalId = editingWithdrawalMethod ? editingWithdrawalMethod.id : (wmId.trim() || wmName.trim());
    const res = await withdrawalPaymentService.saveMethod({
      id: finalId,
      name: wmName.trim(),
      label_bn: wmLabelBn.trim(),
      channel_type: wmChannelType,
      logo_url: wmLogoUrl.trim(),
      account_number_placeholder: wmPlaceholder.trim(),
      instructions_bn: wmInstructions.trim(),
      is_active: wmIsActive,
      display_order: parseInt(wmDisplayOrder, 10) || 1
    });

    if (res) {
      toast.success('উইথড্রয়াল পেমেন্ট মেথড সফলভাবে সংরক্ষণ করা হয়েছে');
      setWithdrawalMethodDialogOpen(false);
      loadWithdrawalMethods();
    } else {
      toast.error('মেথড সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteWithdrawalMethod = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" উইথড্রয়াল মেথডটি ডিলিট করতে চান?`)) {
      return;
    }
    const ok = await withdrawalPaymentService.deleteMethod(id);
    if (ok) {
      toast.success(`"${name}" উইথড্রয়াল মেথড মুছে ফেলা হয়েছে`);
      loadWithdrawalMethods();
    } else {
      toast.error('মেথড মুছে ফেলা যায়নি');
    }
  };

  const handleToggleWithdrawalMethodActive = async (id: string, current: boolean) => {
    const ok = await withdrawalPaymentService.toggleActive(id, current);
    if (ok) {
      toast.success(current ? 'মেথডটি নিষ্ক্রিয় করা হয়েছে' : 'মেথডটি সক্রিয় করা হয়েছে');
      loadWithdrawalMethods();
    } else {
      toast.error('স্ট্যাটাস পরিবর্তন করা যায়নি');
    }
  };

  // Deposit Action Dialog
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminNote, setAdminNote] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  // High-Resolution Multiple Slips Viewer Modal
  const [slipsModalOpen, setSlipsModalOpen] = useState(false);
  const [viewingSlipsDeposit, setViewingSlipsDeposit] = useState<DepositRequest | null>(null);
  const [currentSlipIndex, setCurrentSlipIndex] = useState(0);
  const [slipImgError, setSlipImgError] = useState(false);

  // Payment Method Dialog
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
  const [methodWithdrawalActive, setMethodWithdrawalActive] = useState(true);

  // Filtered deposits
  const filteredDeposits = depositRequests.filter((d) => {
    const matchesFilter = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch = 
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.methodName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = depositRequests.filter((d) => d.status === 'pending').length;

  const handleOpenDepositAction = (dep: DepositRequest, type: 'approve' | 'reject') => {
    setSelectedDeposit(dep);
    setActionType(type);
    setAdminNote(type === 'approve' ? 'টাকা একাউন্টে সফলভাবে জমা হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে।' : 'ভুল ট্রানজেকশন আইডি বা অপর্যাপ্ত তথ্য।');
    setActionDialogOpen(true);
  };

  const handleConfirmDepositAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit) return;

    const res = processDepositRequest(selectedDeposit.id, actionType === 'approve' ? 'approved' : 'rejected', adminNote);
    if (res) {
      toast.success(
        actionType === 'approve'
          ? `ডিপোজিট সফলভাবে অনুমোদিত হয়েছে! গ্রাহকের ওয়ালেটে ${formatTaka(selectedDeposit.amount)} যোগ করা হয়েছে।`
          : 'ডিপোজিট আবেদন বাতিল করা হয়েছে।'
      );
      setActionDialogOpen(false);
    } else {
      toast.error('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
    }
  };

  // Open Method Editor
  const handleOpenMethodModal = (method?: PaymentMethodConfig) => {
    if (method) {
      setEditingMethod(method);
      setMethodName(method.name || '');
      setMethodNameEn(method.nameEn || '');
      setMethodLogo(method.logo || '');
      setAccountType(method.accountType || 'Personal');
      setTransactionType(method.transactionType || 'Send Money');
      setAccountNumber(method.accountNumber || '');
      setInstructionBn(method.instructionBn || method.instructionsBn || '');
      setMinDeposit(method.minDeposit != null ? method.minDeposit.toString() : '500');
      setMaxDeposit(method.maxDeposit != null ? method.maxDeposit.toString() : '500000');
      setMethodActive(method.active !== false);
      setMethodWithdrawalActive(method.withdrawalActive !== false);
    } else {
      setEditingMethod(null);
      setMethodName('');
      setMethodNameEn('');
      setMethodLogo('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60');
      setAccountType('Personal');
      setTransactionType('Send Money');
      setAccountNumber('');
      setInstructionBn('');
      setMinDeposit('500');
      setMaxDeposit('500000');
      setMethodActive(true);
      setMethodWithdrawalActive(true);
    }
    setMethodDialogOpen(true);
  };

  const handleSaveMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim() || !accountNumber.trim()) {
      toast.error('মেথডের নাম এবং অ্যাকাউন্ট নম্বর বাধ্যতামূলক');
      return;
    }

    const payload: PaymentMethodConfig = {
      id: editingMethod?.id || `pm-${Date.now()}`,
      name: methodName.trim(),
      nameEn: methodNameEn.trim() || methodName.trim(),
      logo: methodLogo.trim() || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
      accountType,
      transactionType,
      accountNumber: accountNumber.trim(),
      instructionBn: instructionBn.trim() || `${methodName}-এ নির্ধারিত একাউন্টে টাকা পাঠান।`,
      minDeposit: parseFloat(minDeposit) || 500,
      maxDeposit: parseFloat(maxDeposit) || 500000,
      chargePercentage: 0,
      active: methodActive,
      withdrawalActive: methodWithdrawalActive
    };

    savePaymentMethod(payload);
    toast.success(editingMethod ? 'পেমেন্ট মেথড আপডেট করা হয়েছে!' : 'নতুন পেমেন্ট মেথড যুক্ত করা হয়েছে!');
    setMethodDialogOpen(false);
  };

  const handleDeleteMethod = (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" পেমেন্ট মেথডটি মুছে ফেলতে চান?`)) {
      deletePaymentMethod(id);
      toast.success('পেমেন্ট মেথড মুছে ফেলা হয়েছে');
    }
  };

  return (
    <AdminLayout
      title="ডিপোজিট ও পেমেন্ট মেথড ব্যবস্থাপনা"
      subtitle="গ্রাহকদের জমার আবেদন যাচাই, অটো ওয়ালেট ব্যালেন্স ক্রেডিট এবং পেমেন্ট মেথড ডায়নামিক পরিবর্তন"
      actions={
        activeTab === 'methods' ? (
          <Button
            onClick={() => handleOpenMethodModal()}
            className="bg-primary text-primary-foreground font-bold text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            নতুন ডিপোজিট মেথড যোগ করুন
          </Button>
        ) : activeTab === 'withdrawalMethods' ? (
          <Button
            onClick={() => handleOpenWithdrawalMethodModal()}
            className="bg-primary text-primary-foreground font-bold text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            নতুন উইথড্রয়াল মেথড যোগ করুন
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'requests' | 'methods' | 'withdrawalMethods' | 'customerAccounts')}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-4xl w-full">
            <TabsTrigger value="requests" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4" />
              ডিপোজিট আবেদনসমূহ
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-[10px] font-bold">
                  {toBengaliNumber(pendingCount)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="methods" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              ডিপোজিট মেথড ({toBengaliNumber(paymentMethods.length)})
            </TabsTrigger>
            <TabsTrigger value="withdrawalMethods" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              উইথড্রয়াল মেথড ও লোগো ({toBengaliNumber(withdrawalMethods.length)})
            </TabsTrigger>
            <TabsTrigger value="customerAccounts" className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              গ্রাহক একাউন্ট ({toBengaliNumber(users.filter((u) => Object.keys(u.boundWithdrawalAccounts || {}).length > 0).length)})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DEPOSIT REQUESTS */}
          <TabsContent value="requests" className="space-y-4 mt-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="গ্রাহকের নাম, মোবাইল, TrxID বা মেথড দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-full md:w-44 h-10 text-xs">
                      <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল আবেদন</SelectItem>
                      <SelectItem value="pending">অপেক্ষমান (পেন্ডিং)</SelectItem>
                      <SelectItem value="approved">অনুমোদিত (অ্যাপ্রুভড)</SelectItem>
                      <SelectItem value="rejected">বাতিলকৃত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-card">
              <CardHeader className="p-4 sm:p-5 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-primary" />
                  গ্রাহকদের জমাকৃত ডিপোজিট রিকোয়েস্ট তালিকা
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  যেকোনো ডিপোজিট অনুমোদন (Approve) করলে তাৎক্ষণিকভাবে গ্রাহকের ওয়ালেট ব্যালেন্সে টাকা যুক্ত হবে
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-semibold">
                      <tr>
                        <th className="px-4 py-3 whitespace-nowrap">আইডি ও তারিখ</th>
                        <th className="px-4 py-3 whitespace-nowrap">গ্রাহকের নাম ও ফোন</th>
                        <th className="px-4 py-3 whitespace-nowrap">মেথড ও প্রেরক নম্বর</th>
                        <th className="px-4 py-3 whitespace-nowrap">ট্রানজেকশন আইডি (TrxID)</th>
                        <th className="px-4 py-3 whitespace-nowrap text-right">জমার পরিমাণ</th>
                        <th className="px-4 py-3 whitespace-nowrap text-center">স্ট্যাটাস</th>
                        <th className="px-4 py-3 whitespace-nowrap text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredDeposits.map((dep) => {
                          const isPending = dep.status === 'pending';
                          return (
                            <tr key={dep.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                                <span className="font-bold text-foreground">{dep.id}</span>
                                <div className="text-[10px] text-muted-foreground">{dep.requestDate}</div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-bold text-foreground">{dep.customerName}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">{dep.phone}</div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <Badge variant="outline" className="font-bold text-xs bg-muted/50">
                                  {dep.methodName}
                                </Badge>
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  প্রেরক: {dep.senderNumber || dep.phone}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-primary">
                                {dep.transactionId}
                                {dep.slipUrl && (
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans">
                                    <FileCheck className="w-3 h-3 text-emerald-600" /> স্লিপ যুক্ত আছে
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-right font-extrabold text-foreground text-sm">
                                {formatTaka(dep.amount)}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                <Badge
                                  className={
                                    dep.status === 'approved'
                                      ? 'bg-emerald-600 text-white font-bold text-[10px]'
                                      : dep.status === 'rejected'
                                      ? 'bg-red-600 text-white font-bold text-[10px]'
                                      : 'bg-amber-500 text-white font-bold text-[10px] animate-pulse'
                                  }
                                >
                                  {dep.status === 'approved'
                                    ? 'অনুমোদিত'
                                    : dep.status === 'rejected'
                                    ? 'বাতিলকৃত'
                                    : 'অপেক্ষমান'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setViewingSlipsDeposit(dep);
                                      setCurrentSlipIndex(0);
                                      setSlipImgError(false);
                                      setSlipsModalOpen(true);
                                    }}
                                    className="h-7 px-2 text-[11px] font-bold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                                  >
                                    <Eye className="w-3 h-3" />
                                    স্লিপ ভিউ {((dep.slipUrls && dep.slipUrls.length) || (dep.slipUrl ? 1 : 0)) > 1 ? `(${dep.slipUrls?.length})` : ''}
                                  </Button>
                                  {isPending ? (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleOpenDepositAction(dep, 'approve')}
                                        className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        অনুমোদন
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleOpenDepositAction(dep, 'reject')}
                                        className="h-7 px-2 text-xs font-bold gap-1"
                                      >
                                        <XCircle className="w-3 h-3" />
                                        বাতিল
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground ml-1">
                                      {dep.approvedDate ? `${dep.approvedDate}` : 'সম্পন্ন'}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Organized Card View (No Horizontal Scroll) */}
                <div className="block md:hidden divide-y divide-border bg-card">
                  {filteredDeposits.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredDeposits.map((dep) => {
                      const isPending = dep.status === 'pending';
                      return (
                        <div key={dep.id} className="p-3.5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-foreground">{dep.id}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">• {dep.requestDate}</span>
                              </div>
                              <div className="font-bold text-xs text-foreground mt-0.5">{dep.customerName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{dep.phone}</div>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={
                                  dep.status === 'approved'
                                    ? 'bg-emerald-600 text-white font-bold text-[10px]'
                                    : dep.status === 'rejected'
                                    ? 'bg-red-600 text-white font-bold text-[10px]'
                                    : 'bg-amber-500 text-white font-bold text-[10px] animate-pulse'
                                }
                              >
                                {dep.status === 'approved'
                                  ? 'অনুমোদিত'
                                  : dep.status === 'rejected'
                                  ? 'বাতিলকৃত'
                                  : 'অপেক্ষমান'}
                              </Badge>
                              <div className="font-mono font-extrabold text-sm text-foreground mt-1">
                                {formatTaka(dep.amount)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2.5 rounded-lg border border-border/50">
                            <div>
                              <span className="text-muted-foreground block text-[10px]">পেমেন্ট মেথড:</span>
                              <Badge variant="outline" className="font-bold text-[10px] bg-card mt-0.5">
                                {dep.methodName}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                প্রেরক: {dep.senderNumber || dep.phone}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px]">TrxID:</span>
                              <span className="font-mono font-bold text-primary block break-all text-[11px] mt-0.5">
                                {dep.transactionId}
                              </span>
                              {dep.slipUrl && (
                                <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                                  <FileCheck className="w-3 h-3" /> স্লিপ আছে
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setViewingSlipsDeposit(dep);
                                setCurrentSlipIndex(0);
                                setSlipImgError(false);
                                setSlipsModalOpen(true);
                              }}
                              className="flex-1 h-8 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>স্লিপ ভিউ {((dep.slipUrls && dep.slipUrls.length) || (dep.slipUrl ? 1 : 0)) > 1 ? `(${dep.slipUrls?.length})` : ''}</span>
                            </Button>

                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenDepositAction(dep, 'approve')}
                                  className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>অনুমোদন</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleOpenDepositAction(dep, 'reject')}
                                  className="h-8 px-2.5 text-xs font-bold gap-1 shadow-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>বাতিল</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PAYMENT METHODS CONFIGURATION */}
          <TabsContent value="methods" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((pm) => (
                <Card key={pm.id} className="border shadow-sm bg-card hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={pm.logo}
                          alt={pm.name}
                          className="w-12 h-12 rounded-xl object-cover border bg-muted"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-base text-foreground">{pm.name}</h4>
                          <span className="text-xs text-muted-foreground">{pm.nameEn}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          pm.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]'
                            : 'bg-muted text-muted-foreground text-[10px]'
                        }
                      >
                        {pm.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">মেথড টাইপ:</span>
                        <span className="font-bold text-primary">{pm.transactionType} ({pm.accountType})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">অ্যাকাউন্ট নম্বর:</span>
                        <span className="font-mono font-bold text-foreground">{pm.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ডিপোজিট সীমা:</span>
                        <span className="font-medium text-foreground">{formatTaka(pm.minDeposit || 0)} - {formatTaka(pm.maxDeposit || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">উইথড্রয়ালে:</span>
                        <Badge variant="outline" className={pm.withdrawalActive !== false ? 'text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px]' : 'text-muted-foreground text-[10px]'}>
                          {pm.withdrawalActive !== false ? 'দেখাবে' : 'লুকানো'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {pm.instructionBn}
                    </p>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenMethodModal(pm)}
                        className="h-8 px-2.5 text-xs font-bold gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        এডিট
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMethod(pm.id, pm.name)}
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: DYNAMIC WITHDRAWAL PAYMENT METHODS */}
          <TabsContent value="withdrawalMethods" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card rounded-xl border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  উইথড্রয়াল পেমেন্ট মেথড ও লোগো ম্যানেজমেন্ট
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  এখানে মেথড যোগ, এডিট, লোগো পরিবর্তন ও ডিলিট করলে তা সাথে সাথে গ্রাহকের টাকা তোলার মডালে কার্যকর হবে।
                </p>
              </div>
              <Button
                onClick={() => handleOpenWithdrawalMethodModal()}
                className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                নতুন মেথড যোগ করুন
              </Button>
            </div>

            {loadingWithdrawalMethods ? (
              <div className="p-8 text-center text-xs text-muted-foreground">লোড হচ্ছে...</div>
            ) : withdrawalMethods.length === 0 ? (
              <Card className="border">
                <CardContent className="p-8 text-center text-xs text-muted-foreground">
                  কোনো উইথড্রয়াল মেথড পাওয়া যায়নি। উপরে বোতামে ক্লিক করে নতুন মেথড যোগ করুন।
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {withdrawalMethods.map((wm) => (
                  <Card key={wm.id} className="border shadow-xs flex flex-col justify-between overflow-hidden">
                    <CardHeader className="p-4 pb-2 border-b bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-card border p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                            {wm.logo_url ? (
                              <img src={wm.logo_url} alt={wm.name} className="w-full h-full object-contain" />
                            ) : wm.channel_type === 'bank' ? (
                              <Building2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold">{wm.label_bn}</CardTitle>
                            <CardDescription className="text-xs font-mono">{wm.name} (ID: {wm.id})</CardDescription>
                          </div>
                        </div>

                        <Badge
                          variant={wm.is_active ? 'default' : 'secondary'}
                          className={`text-[10px] cursor-pointer ${wm.is_active ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}
                          onClick={() => handleToggleWithdrawalMethodActive(wm.id, wm.is_active)}
                        >
                          {wm.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-2.5 flex-1 text-xs">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>ধরন:</span>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {wm.channel_type === 'bank' ? 'ব্যাংক হিসাব' : wm.channel_type === 'mobile_banking' ? 'মোবাইল ব্যাংকিং' : 'অন্যান্য'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>প্লেসহোল্ডার:</span>
                        <span className="font-mono text-foreground font-bold">{wm.account_number_placeholder || '01XXXXXXXXX'}</span>
                      </div>

                      {wm.instructions_bn && (
                        <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground line-clamp-2">
                          {wm.instructions_bn}
                        </div>
                      )}

                      <div className="pt-3 border-t flex items-center justify-between gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenWithdrawalMethodModal(wm)}
                          className="h-8 px-2.5 text-xs font-bold gap-1 flex-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          এডিট ও লোগো পরিবর্তন
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWithdrawalMethod(wm.id, wm.label_bn)}
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="ডিলিট করুন"
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

          {/* TAB 4: CUSTOMER WITHDRAWAL ACCOUNTS */}
          <TabsContent value="customerAccounts" className="space-y-4 mt-4">
            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-5 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  গ্রাহকদের সংযুক্ত উইথড্রয়াল অ্যাকাউন্ট
                </CardTitle>
                <CardDescription className="text-xs">
                  গ্রাহক নতুন উইথড্রয়াল মেথড যুক্ত করলে Supabase Realtime-এর মাধ্যমে এই তালিকা স্বয়ংক্রিয়ভাবে আপডেট হবে।
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">গ্রাহক</th>
                        <th className="px-4 py-3 text-left">ফোন</th>
                        <th className="px-4 py-3 text-left">উইথড্র মেথড</th>
                        <th className="px-4 py-3 text-left">অ্যাকাউন্ট</th>
                        <th className="px-4 py-3 text-left">হোল্ডার / ব্যাংক</th>
                        <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.flatMap((user) =>
                        Object.entries(user.boundWithdrawalAccounts || {}).map(([methodKey, account]: [string, any]) => ({ user, methodKey, account }))
                      ).length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">এখনো কোনো গ্রাহক উইথড্রয়াল অ্যাকাউন্ট যুক্ত করেনি।</td></tr>
                      ) : (
                        users.flatMap((user) =>
                          Object.entries(user.boundWithdrawalAccounts || {}).map(([methodKey, account]: [string, any]) => ({ user, methodKey, account }))
                        ).map(({ user, methodKey, account }) => (
                          <tr key={`${user.id}-${methodKey}`} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-bold">{user.name}</td>
                            <td className="px-4 py-3 font-mono">{user.phone}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="font-bold">{methodKey}</Badge></td>
                            <td className="px-4 py-3 font-mono font-bold">{account?.accountNumber || '—'}</td>
                            <td className="px-4 py-3">
                              <div>{account?.accountHolderName || user.name}</div>
                              {account?.bankName && <div className="text-[10px] text-muted-foreground">{account.bankName}{account.branchName ? ` • ${account.branchName}` : ''}</div>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {account?.isLocked ? (
                                <Badge className="bg-amber-500 text-white text-[10px] gap-1"><Lock className="w-3 h-3" /> লকড</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">সক্রিয়</Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Organized Card View (No Horizontal Scroll) */}
                <div className="block md:hidden divide-y divide-border bg-card">
                  {users.flatMap((user) =>
                    Object.entries(user.boundWithdrawalAccounts || {}).map(([methodKey, account]: [string, any]) => ({ user, methodKey, account }))
                  ).length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      এখনো কোনো গ্রাহক উইথড্রয়াল অ্যাকাউন্ট যুক্ত করেনি।
                    </div>
                  ) : (
                    users.flatMap((user) =>
                      Object.entries(user.boundWithdrawalAccounts || {}).map(([methodKey, account]: [string, any]) => ({ user, methodKey, account }))
                    ).map(({ user, methodKey, account }) => (
                      <div key={`${user.id}-${methodKey}`} className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-foreground">{user.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{user.phone}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-bold text-xs">
                              {methodKey}
                            </Badge>
                            {account?.isLocked ? (
                              <Badge className="bg-amber-500 text-white text-[10px] gap-1"><Lock className="w-3 h-3" /> লকড</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">সক্রিয়</Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-[11px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-[10px]">অ্যাকাউন্ট নম্বর:</span>
                            <span className="font-mono font-bold text-foreground">{account?.accountNumber || '—'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-[10px]">অ্যাকাউন্ট হোল্ডার:</span>
                            <span className="font-medium text-foreground">{account?.accountHolderName || user.name}</span>
                          </div>
                          {account?.bankName && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground">ব্যাংক ও শাখা:</span>
                              <span className="text-foreground">{account.bankName}{account.branchName ? ` (${account.branchName})` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* DEPOSIT ACTION APPROVE / REJECT MODAL */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-6 bg-card">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              ডিপোজিট আবেদন {actionType === 'approve' ? 'অনুমোদন ও ওয়ালেটে টাকা জমা' : 'বাতিলকরণ'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক: {selectedDeposit?.customerName} ({selectedDeposit?.phone})
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <form onSubmit={handleConfirmDepositAction} className="space-y-4 mt-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">মেথড:</span>
                  <strong className="text-foreground">{selectedDeposit.methodName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">জমার পরিমাণ:</span>
                  <strong className="text-emerald-600 text-sm">{formatTaka(selectedDeposit.amount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ট্রানজেকশন আইডি:</span>
                  <strong className="text-primary">{selectedDeposit.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">প্রেরক নম্বর:</span>
                  <span>{selectedDeposit.senderNumber}</span>
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  ✓ অনুমোদন করলে স্বয়ংক্রিয়ভাবে গ্রাহকের ওয়ালেটে <strong>{formatTaka(selectedDeposit.amount)}</strong> ক্রেডিট হবে এবং তাকে কনফার্মেশন নোটিফিকেশন পাঠানো হবে।
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">অ্যাডমিন নোট / বার্তা</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setActionDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-red-600 hover:bg-red-700 text-white font-bold'}
                >
                  {actionType === 'approve' ? 'অনুমোদন সম্পন্ন করুন' : 'বাতিল নিশ্চিত করুন'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* PAYMENT METHOD ADD / EDIT MODAL */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-6 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {editingMethod ? 'পেমেন্ট মেথড এডিট করুন' : 'নতুন পেমেন্ট মেথড যোগ করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              বিকাশ, নগদ বা যেকোনো নতুন পেমেন্ট গেটওয়ের লোগো, একাউন্ট নম্বর ও টাইপ পরিবর্তন করুন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMethodSubmit} className="space-y-3.5 mt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মেথডের নাম (বাংলা) *</Label>
                <Input
                  placeholder="যেমন: বিকাশ (bKash)"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মেথডের নাম (ইংরেজি)</Label>
                <Input
                  placeholder="যেমন: bKash"
                  value={methodNameEn}
                  onChange={(e) => setMethodNameEn(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ট্রানজেকশন টাইপ *</Label>
                <Select value={transactionType} onValueChange={(v) => setTransactionType(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Send Money">Send Money (সেন্ড মানি)</SelectItem>
                    <SelectItem value="Cash Out">Cash Out (ক্যাশ আউট)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">অ্যাকাউন্ট টাইপ *</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal (ব্যক্তিগত)</SelectItem>
                    <SelectItem value="Agent">Agent (এজেন্ট)</SelectItem>
                    <SelectItem value="Merchant">Merchant (মার্চেন্ট)</SelectItem>
                    <SelectItem value="Bank Account">Bank Account (ব্যাংক হিসাব)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">অ্যাকাউন্ট নম্বর / ব্যাংকের বিবরণ *</Label>
              <Input
                placeholder="যেমন: 01712-345678 বা একাউন্ট নম্বর ও শাখা"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">লোগো ইমেজ লিঙ্ক (URL)</Label>
              <Input
                placeholder="https://..."
                value={methodLogo}
                onChange={(e) => setMethodLogo(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">গ্রাহকের জন্য নির্দেশনা (Instruction)</Label>
              <Textarea
                placeholder="যেমন: আপনার বিকাশ অ্যাপ থেকে সেন্ড মানি করুন..."
                value={instructionBn}
                onChange={(e) => setInstructionBn(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">সর্বনিম্ন ডিপোজিট (BDT)</Label>
                <Input
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">সর্বোচ্চ ডিপোজিট (BDT)</Label>
                <Input
                  type="number"
                  value={maxDeposit}
                  onChange={(e) => setMaxDeposit(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="methodActiveCheckbox"
                checked={methodActive}
                onChange={(e) => setMethodActive(e.target.checked)}
                className="rounded text-primary"
              />
              <Label htmlFor="methodActiveCheckbox" className="text-xs font-semibold cursor-pointer">
                এই পেমেন্ট মেথডটি গ্রাহক পেজে সক্রিয় রাখুন
              </Label>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="methodWithdrawalActiveCheckbox"
                checked={methodWithdrawalActive}
                onChange={(e) => setMethodWithdrawalActive(e.target.checked)}
                className="rounded text-primary"
              />
              <Label htmlFor="methodWithdrawalActiveCheckbox" className="text-xs font-semibold cursor-pointer">
                এই মেথডটি গ্রাহকের টাকা উত্তোলনের পেজে দেখান
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setMethodDialogOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* HIGH RESOLUTION MULTIPLE SLIPS PREVIEW MODAL */}
      <Dialog open={slipsModalOpen} onOpenChange={setSlipsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl p-6 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              পেমেন্ট ট্রানজেকশন স্লিপ ও পেপার হাই-রেজোলিউশন ভিউয়ার
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক: <strong className="text-foreground">{viewingSlipsDeposit?.customerName}</strong> ({viewingSlipsDeposit?.phone}) • TrxID: <span className="font-mono text-primary font-bold">{viewingSlipsDeposit?.transactionId}</span> • পরিমাণ: <strong className="text-emerald-700">{formatTaka(viewingSlipsDeposit?.amount || 0)}</strong>
            </DialogDescription>
          </DialogHeader>

          {viewingSlipsDeposit && (() => {
            const allSlips = viewingSlipsDeposit.slipUrls && viewingSlipsDeposit.slipUrls.length > 0 
              ? viewingSlipsDeposit.slipUrls 
              : (viewingSlipsDeposit.slipUrl ? [viewingSlipsDeposit.slipUrl] : []);

            const activeSlip = allSlips[currentSlipIndex] || allSlips[0] || '';
            const isActualImage = (activeSlip.startsWith('http://') || activeSlip.startsWith('https://') || activeSlip.startsWith('data:image/') || activeSlip.startsWith('blob:')) && !slipImgError;

            return (
              <div className="space-y-4 mt-2">
                {/* Multiple slips selector pills */}
                {allSlips.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      সংযুক্ত পেপারসমূহ ({allSlips.length} টি):
                    </span>
                    {allSlips.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentSlipIndex(idx);
                          setSlipImgError(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                          currentSlipIndex === idx
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-muted/50 text-foreground hover:bg-muted border-border'
                        }`}
                      >
                        স্লিপ #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* High-Res Image View Box or Digital Verified Voucher Fallback */}
                {isActualImage ? (
                  <div className="relative border rounded-xl overflow-hidden bg-black/90 p-2 flex items-center justify-center min-h-[300px]">
                    <img
                      src={activeSlip}
                      alt="Transaction Slip"
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
                            {viewingSlipsDeposit.methodName}
                          </span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            বাংলাদেশ ডিজিটাল ভাউচার
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">
                          অফিসিয়াল ডিপোজিট ট্রানজেকশন স্লিপ
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">জমার পরিমাণ</span>
                        <strong className="text-xl font-extrabold text-emerald-700 font-mono">
                          {formatTaka(viewingSlipsDeposit.amount)}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">গ্রাহকের নাম:</span>
                        <strong className="text-foreground text-sm font-bold">{viewingSlipsDeposit.customerName}</strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">নিবন্ধিত ফোন নম্বর:</span>
                        <strong className="text-foreground font-mono font-bold">{viewingSlipsDeposit.phone}</strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">যে নম্বর থেকে টাকা এসেছে:</span>
                        <strong className="text-foreground font-mono font-bold">{viewingSlipsDeposit.senderNumber || viewingSlipsDeposit.phone}</strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[11px]">ট্রানজেকশন আইডি (TrxID):</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-primary font-mono font-extrabold text-sm">{viewingSlipsDeposit.transactionId}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(viewingSlipsDeposit.transactionId);
                              toast.success('TrxID কপি করা হয়েছে!');
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="TrxID কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2.5">
                      <span>তারিখ ও সময়: {viewingSlipsDeposit.requestDate}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        যাচাইকরণ প্রস্তুত
                      </span>
                    </div>

                    {activeSlip && (
                      <p className="text-[10px] text-muted-foreground italic truncate">
                        সংযুক্ত ফাইল রেফারেন্স: {activeSlip}
                      </p>
                    )}
                  </div>
                )}

                {/* Upload or Replace Slip Option for Admin */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs bg-muted/40 p-2.5 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>স্লিপের আসল ছবি যুক্ত / আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0] && viewingSlipsDeposit) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                const newUrl = reader.result;
                                setViewingSlipsDeposit({
                                  ...viewingSlipsDeposit,
                                  slipUrl: newUrl,
                                  slipUrls: [newUrl]
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
                  </div>

                  {isActualImage && (
                    <a
                      href={activeSlip}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      মূল ছবি বড় করে ব্রাউজারে খুলুন ↗
                    </a>
                  )}
                </div>

                {/* Quick Action from within slip viewer */}
                {viewingSlipsDeposit.status === 'pending' && (
                  <div className="pt-3 border-t flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">স্লিপ যাচাই করা হলে অনুমোদন বা বাতিল করুন:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSlipsModalOpen(false);
                          handleOpenDepositAction(viewingSlipsDeposit, 'approve');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        স্লিপ দেখে অনুমোদন করুন
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSlipsModalOpen(false);
                          handleOpenDepositAction(viewingSlipsDeposit, 'reject');
                        }}
                        className="font-bold text-xs gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        বাতিল
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* WITHDRAWAL METHOD ADD / EDIT MODAL */}
      <Dialog open={withdrawalMethodDialogOpen} onOpenChange={setWithdrawalMethodDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-5 sm:p-6 bg-card max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {editingWithdrawalMethod ? 'উইথড্রয়াল পেমেন্ট মেথড এডিট ও লোগো পরিবর্তন' : 'নতুন উইথড্রয়াল পেমেন্ট মেথড যোগ করুন'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহকের টাকা তোলার জন্য বিকাশ, নগদ, রকেট, ব্যাংক বা কাস্টম মেথড যুক্ত করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWithdrawalMethod} className="space-y-4 mt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মেথড নাম (ইংরেজি ID) *</Label>
                <Input
                  type="text"
                  placeholder="যেমন: bKash, Nagad, Upay, CityBank"
                  value={wmName}
                  onChange={(e) => {
                    setWmName(e.target.value);
                    if (!editingWithdrawalMethod && !wmId) {
                      setWmId(e.target.value);
                    }
                  }}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">বাংলা লেবেল *</Label>
                <Input
                  type="text"
                  placeholder="যেমন: বিকাশ, নগদ, সিটি ব্যাংক"
                  value={wmLabelBn}
                  onChange={(e) => setWmLabelBn(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মেথড ক্যাটাগরি / ধরন</Label>
                <Select value={wmChannelType} onValueChange={(v) => setWmChannelType(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_banking">মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট, ইত্যাদি)</SelectItem>
                    <SelectItem value="bank">ব্যাংক একাউন্ট (অনলাইন বা ব্রাঞ্চ ট্রান্সফার)</SelectItem>
                    <SelectItem value="other">অন্যান্য (ওয়ালেট / কার্ড)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">প্রদর্শন ক্রম (Display Order)</Label>
                <Input
                  type="number"
                  value={wmDisplayOrder}
                  onChange={(e) => setWmDisplayOrder(e.target.value)}
                  className="h-9 text-xs font-mono"
                  min="1"
                />
              </div>
            </div>

            {/* Logo URL & Preset Pickers */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/40 border">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>লোগো ইমেজ URL</span>
                {wmLogoUrl && <span className="text-[10px] text-emerald-600 font-bold">প্রিভিউ সক্রিয়</span>}
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="url"
                  placeholder="https://... (ইমেজ বা লোগো লিঙ্ক)"
                  value={wmLogoUrl}
                  onChange={(e) => setWmLogoUrl(e.target.value)}
                  className="h-9 text-xs font-mono flex-1"
                />
                <div className="w-9 h-9 rounded-lg bg-card border p-1 flex items-center justify-center shrink-0">
                  {wmLogoUrl ? (
                    <img src={wmLogoUrl} alt="Logo" className="w-full h-full object-contain" onError={() => toast.error('লোগো লোড হতে সমস্যা')} />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Quick Preset Logos */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-muted-foreground font-semibold">জনপ্রিয় লোগো দ্রুত সিলেক্ট করুন:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'bKash', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/BKash_Logo.svg' },
                    { label: 'Nagad', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Nagad_Logo.png' },
                    { label: 'Rocket', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Dutch-Bangla_Bank_Rocket_logo.svg/300px-Dutch-Bangla_Bank_Rocket_logo.svg.png' },
                    { label: 'Upay', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&q=80' },
                    { label: 'Bank', url: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setWmLogoUrl(preset.url)}
                      className="px-2 py-1 rounded bg-card hover:bg-primary/10 border text-[10px] font-bold transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">অ্যাকাউন্ট নম্বর প্লেসহোল্ডার</Label>
              <Input
                type="text"
                placeholder="যেমন: 01XXXXXXXXX অথবা 205021302004589"
                value={wmPlaceholder}
                onChange={(e) => setWmPlaceholder(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">গ্রাহকের জন্য নির্দেশনা</Label>
              <Textarea
                rows={2}
                placeholder="যেমন: সঠিক পার্সোনাল বিকাশ নম্বর দিন। কোনো এজেন্ট নম্বর গ্রহণযোগ্য নয়।"
                value={wmInstructions}
                onChange={(e) => setWmInstructions(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
              <div>
                <div className="font-bold text-xs">মেথড সক্রিয় রাখুন</div>
                <div className="text-[11px] text-muted-foreground">সক্রিয় রাখলে গ্রাহক উইথড্র মডালে এটি দেখতে পাবেন</div>
              </div>
              <Switch checked={wmIsActive} onCheckedChange={setWmIsActive} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWithdrawalMethodDialogOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground font-bold"
              >
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
