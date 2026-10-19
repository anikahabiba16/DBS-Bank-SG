import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { 
  formatTaka, 
  toBengaliNumber, 
  updateCustomerWithdrawalCondition, 
  format16DigitAccountNumber,
  updateCustomerProfileImage,
  normalizePhone,
  loanStorage
} from '@/services/storage';
import { Installment, LoanApplication, PaymentChannel, ContractPaper } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BankApprovalLetterView } from '@/components/common/BankApprovalLetterView';
import { CustomerDepositModal } from '@/components/common/CustomerDepositModal';
import { CustomerSupportModal } from '@/components/common/CustomerSupportModal';
import { CustomerContractModal } from '@/components/common/CustomerContractModal';
import { supabaseSync } from '@/services/supabaseSyncService';
import { ChangeAccountModal } from '@/components/customer/ChangeAccountModal';
import { VirtualDebitCardView } from '@/components/customer/VirtualDebitCardView';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
  Upload,
  Wallet,
  ArrowDownToLine,
  Smartphone,
  Building2,
  History,
  FileCheck2,
  Eye,
  Bell,
  ArrowDownCircle,
  Scale,
  Edit3,
  AlertTriangle,
  Lock,
  UploadCloud,
  Headphones,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

export const CustomerDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    users,
    applications, 
    getInstallmentsByLoanId, 
    payInstallment,
    walletBalance,
    createWithdrawal,
    withdrawals,
    getApprovalLetterByLoanId,
    contractPapers,
    settings,
    updateCustomerAccount,
    bindCustomerWithdrawalMethod,
    submitWithdrawalConditionPayment,
    refreshUsers,
    refreshApplications,
    refreshTransactions,
    updateCustomerVirtualCard
  } = useLoan();

  // Ensure dashboard loads fresh state once on entry without triggering infinite cascade
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refreshUsers();
      refreshApplications();
      refreshTransactions();
    }
  }, [refreshUsers, refreshApplications, refreshTransactions]);

  const userPhone = currentUser?.phone || '';
  const userPhoneNorm = useMemo(() => normalizePhone(userPhone), [userPhone]);

  // Find active customer record dynamically so administrative privilege toggles apply immediately
  const activeUser = useMemo(() => {
    if (!currentUser) return null;
    const freshUsers = loanStorage.getUsers();
    const fromFresh = freshUsers.find((u) => (currentUser.id && u.id === currentUser.id) || (userPhoneNorm && normalizePhone(u.phone) === userPhoneNorm));
    if (fromFresh) return fromFresh;
    const fromContext = users.find((u) => (currentUser.id && u.id === currentUser.id) || (userPhoneNorm && normalizePhone(u.phone) === userPhoneNorm));
    return fromContext || currentUser;
  }, [users, currentUser, userPhoneNorm]);

  const canViewLoanAgreement = Boolean(activeUser?.canViewLoanAgreement === true);
  
  const userApplications = useMemo(() => {
    return applications.filter((a) => {
      if (currentUser?.id && a.userId === currentUser.id) return true;
      const aNorm = normalizePhone(a.phone);
      if (userPhoneNorm && aNorm === userPhoneNorm) return true;
      if (userPhone && a.phone && (a.phone.endsWith(userPhone) || userPhone.endsWith(a.phone))) return true;
      return false;
    });
  }, [applications, currentUser?.id, userPhone, userPhoneNorm]);

  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    userApplications.length > 0 ? userApplications[0].id : ''
  );

  const selectedLoan = useMemo(() => {
    return userApplications.find((a) => a.id === selectedLoanId) || userApplications[0];
  }, [userApplications, selectedLoanId]);

  const installments = useMemo(() => {
    return selectedLoan ? getInstallmentsByLoanId(selectedLoan.id) : [];
  }, [selectedLoan, getInstallmentsByLoanId]);

  // Modals state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [payChannel, setPayChannel] = useState<PaymentChannel>('bKash');
  const [trxId, setTrxId] = useState('');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [viewingInstallment, setViewingInstallment] = useState<Installment | null>(null);

  // Deposit & Support Modals
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Profile Picture Upload Ref & Handler
  const profileInputRef = useRef<HTMLInputElement>(null);
  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে');
      if (e.target) e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const userIdentifier = currentUser.phone || currentUser.id;
        updateCustomerProfileImage(userIdentifier, dataUrl);
        refreshUsers();
        toast.success('প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!');
      }
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      toast.error('ছবি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Withdraw Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [wthAmount, setWthAmount] = useState('');
  const [wthMethod, setWthMethod] = useState<PaymentChannel>((currentUser?.accountType as any) || 'bKash');
  const [wthAccount, setWthAccount] = useState(currentUser?.accountNumber || '');
  const [wthHolderName, setWthHolderName] = useState(currentUser?.accountHolderName || currentUser?.name || '');
  const [wthBankName, setWthBankName] = useState(currentUser?.bankName || 'ব্র্যাক ব্যাংক');
  const [wthBranchName, setWthBranchName] = useState(currentUser?.branchName || 'ধানমন্ডি শাখা');

  // Change / Bind Account Modal
  const [changeAccountOpen, setChangeAccountOpen] = useState(false);

  // Approval Letter Modal
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [currentLetterLoanId, setCurrentLetterLoanId] = useState<string | null>(null);

  // Contract Paper Modal
  const [selectedContract, setSelectedContract] = useState<ContractPaper | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  const paidCount = installments.filter((i) => i.status === 'paid').length;
  const pendingCount = installments.filter((i) => i.status === 'pending' || i.status === 'overdue').length;
  const totalPaidAmount = installments.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalRemainingAmount = installments.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);

  const nextDueInstallment = installments.find((i) => i.status === 'pending' || i.status === 'overdue');

  const userWithdrawals = withdrawals.filter((w) => w.phone === userPhone || w.userId === currentUser?.id);

  // Check if withdrawal condition is active and gating the withdrawal
  const withdrawalCondition = currentUser?.withdrawalCondition;
  const isWithdrawalBlocked = Boolean(
    (withdrawalCondition?.required || Boolean(withdrawalCondition?.messageBn?.trim()) || Boolean(withdrawalCondition?.noticeBn?.trim())) && 
    !withdrawalCondition?.isApproved
  );

  // User Bound Withdrawal Accounts computation
  const boundMap = currentUser?.boundWithdrawalAccounts || {};
  const effectiveBoundMap: Record<string, any> = { ...boundMap };
  if (
    currentUser?.accountNumber &&
    currentUser.accountType &&
    currentUser.accountNumber !== currentUser.phone &&
    !boundMap[currentUser.accountType as keyof typeof boundMap]
  ) {
    effectiveBoundMap[currentUser.accountType] = {
      method: currentUser.accountType,
      accountNumber: currentUser.accountNumber,
      accountHolderName: currentUser.accountHolderName || currentUser.name,
      bankName: currentUser.bankName,
      branchName: currentUser.branchName,
      isLocked: true,
      boundAt: currentUser.registeredAt
    };
  }
  const boundMethodsList = Object.keys(effectiveBoundMap).map((k) => effectiveBoundMap[k]);

  useEffect(() => {
    const bound = effectiveBoundMap[wthMethod];
    if (bound) {
      setWthAccount(bound.accountNumber);
      if (wthMethod === 'Bank') {
        if (bound.accountHolderName) setWthHolderName(bound.accountHolderName);
        if (bound.bankName) setWthBankName(bound.bankName);
        if (bound.branchName) setWthBranchName(bound.branchName);
      }
    } else {
      setWthAccount('');
      if (wthMethod === 'Bank') {
        setWthHolderName(currentUser?.name || '');
      }
    }
  }, [wthMethod, withdrawModalOpen, currentUser]);

  const [condPayTrxId, setCondPayTrxId] = useState('');
  const [condSlipPreview, setCondSlipPreview] = useState<string>('');
  const [condSlipFileName, setCondSlipFileName] = useState<string>('');
  const [condConfirmSubmitting, setCondConfirmSubmitting] = useState(false);

  // Clear previous slip & TrxID when modal opens or when condition stage updates/is not confirmed
  useEffect(() => {
    if (withdrawModalOpen) {
      if (!withdrawalCondition?.customerConfirmed) {
        setCondPayTrxId('');
        setCondSlipPreview('');
        setCondSlipFileName('');
      }
    }
  }, [withdrawModalOpen, withdrawalCondition?.customerConfirmed, withdrawalCondition?.stageTitle]);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(img.src);
          }
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
      };
      reader.onerror = () => {
        resolve('');
      };
    });
  };

  const handleSlipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setCondSlipFileName(file.name);
        const compressedBase64 = await compressImageFile(file);
        if (compressedBase64) {
          setCondSlipPreview(compressedBase64);
          toast.success('পেমেন্ট স্লিপের ছবি সফলভাবে প্রস্তুত হয়েছে!');
        } else {
          toast.error('ছবি লোড করা সম্ভব হয়নি, অনুগ্রহ করে অন্য ছবি নির্বাচন করুন');
        }
      } catch {
        toast.error('ছবি প্রসেসিং করতে সমস্যা হয়েছে');
      }
    }
  };

  const handleConfirmConditionPayment = () => {
    if (!currentUser) return;
    if (!condPayTrxId.trim()) {
      toast.error('অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) বা জমার রেফারেন্স লিখুন');
      return;
    }
    setCondConfirmSubmitting(true);
    const success = submitWithdrawalConditionPayment(
      currentUser.phone || currentUser.id,
      condPayTrxId.trim(),
      condSlipPreview || undefined
    );
    if (success) {
      toast.success('আপনার জমার স্লিপ ও TrxID অ্যাডমিনের কাছে পাঠানো হয়েছে! অ্যাডমিন যাচাই করে Accept করলেই টাকা তুলতে পারবেন।');
      refreshUsers();
    } else {
      toast.error('জমার তথ্য সাবমিট করা সম্ভব হয়নি');
    }
    setCondConfirmSubmitting(false);
  };

  const handleOpenPay = (inst: Installment) => {
    setSelectedInstallment(inst);
    setTrxId('');
    setPayModalOpen(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment) return;
    if (!trxId.trim()) {
      toast.error('অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) দিন');
      return;
    }

    const success = payInstallment(selectedInstallment.id, { 
      paymentMethod: payChannel as any, 
      transactionId: trxId.trim(), 
      slipName: 'deposit_slip.jpg' 
    });
    if (success) {
      toast.success(`কিস্তি #${selectedInstallment.installmentNo} সফলভাবে পরিশোধ হয়েছে!`);
      setPayModalOpen(false);
    } else {
      toast.error('পরিশোধ ব্যর্থ হয়েছে');
    }
  };

  const handleOpenReceipt = (inst: Installment) => {
    setViewingInstallment(inst);
    setReceiptModalOpen(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWithdrawalBlocked) {
      toast.error(
        withdrawalCondition?.messageBn || 
        withdrawalCondition?.noticeBn || 
        'প্রশাসনিক শর্ত পূরণ ও অ্যাডমিন অনুমোদন ব্যতীত টাকা প্রত্যাহার করা সম্ভব নয়!'
      );
      return;
    }

    const amountNum = parseFloat(wthAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন');
      return;
    }
    if (amountNum > walletBalance) {
      toast.error('আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }
    if (!wthAccount.trim()) {
      toast.error('অনুগ্রহ করে একাউন্ট নম্বর দিন');
      return;
    }

    const res = createWithdrawal({
      userId: currentUser?.id || 'user-1',
      customerName: currentUser?.name || 'গ্রাহক',
      phone: currentUser?.phone || userPhone,
      amount: amountNum,
      method: wthMethod,
      accountNumber: wthAccount.trim(),
      accountHolderName: wthMethod === 'Bank' ? wthHolderName.trim() : undefined,
      bankName: wthMethod === 'Bank' ? wthBankName.trim() : undefined,
      branchName: wthMethod === 'Bank' ? wthBranchName.trim() : undefined
    });

    if (res.success) {
      // Auto-bind withdrawal account to profile if this method was not bound yet
      if (currentUser && !effectiveBoundMap[wthMethod]) {
        bindCustomerWithdrawalMethod(currentUser.id, {
          method: wthMethod as any,
          accountNumber: wthAccount.trim(),
          accountHolderName: wthHolderName.trim() || currentUser.name,
          bankName: wthMethod === 'Bank' ? wthBankName.trim() : undefined,
          branchName: wthMethod === 'Bank' ? wthBranchName.trim() : undefined
        });
      }
      toast.success(res.message);
      setWithdrawModalOpen(false);
      setWthAmount('');
    } else {
      toast.error(res.message);
    }
  };

  const handleOpenApprovalLetter = (loanId: string) => {
    setCurrentLetterLoanId(loanId);
    setLetterModalOpen(true);
  };

  const currentApprovalLetter = currentLetterLoanId 
    ? getApprovalLetterByLoanId(currentLetterLoanId) 
    : (selectedLoan ? getApprovalLetterByLoanId(selectedLoan.id) : undefined);

  // Check if current selected loan is approved by admin
  const isLoanApprovedByAdmin = Boolean(selectedLoan && (selectedLoan.status === 'approved' || selectedLoan.status === 'disbursed'));

  return (
    <CustomerLayout>
      {/* Top Banner with Profile, Wallet, and Account Change Option */}
      <div className="bg-muted/30 py-5 sm:py-8 border-b w-full max-w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
          <div className="bg-card border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full max-w-full min-w-0">
            <div className="flex items-start sm:items-center gap-4">
              {/* Profile Avatar with Gallery Upload */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => profileInputRef.current?.click()}
                title="গ্যালারি থেকে প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center font-bold text-xl relative shadow-xs">
                  {activeUser?.profileImage || activeUser?.avatarUrl || activeUser?.photoUrl || currentUser?.profileImage || currentUser?.avatarUrl || currentUser?.photoUrl ? (
                    <img
                      src={activeUser?.profileImage || activeUser?.avatarUrl || activeUser?.photoUrl || currentUser?.profileImage || currentUser?.avatarUrl || currentUser?.photoUrl}
                      alt={activeUser?.name || currentUser?.name || 'Customer Profile'}
                      width="64"
                      height="64"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                  <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">পরিবর্তন</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md border-2 border-background hover:scale-110 transition-transform"
                  title="গ্যালারি থেকে প্রোফাইল ছবি আপলোড করুন"
                  onClick={(e) => {
                    e.stopPropagation();
                    profileInputRef.current?.click();
                  }}
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input
                  type="file"
                  ref={profileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePhotoSelect}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {currentUser?.name || 'সম্মানিত গ্রাহক'}
                  </h1>
                  <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> সক্রিয় একাউন্ট
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-muted/80 px-2.5 py-1 rounded-lg border font-mono">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-foreground">{userPhone}</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-medium">(লগইন নম্বর)</span>
                  </span>
                  <span>•</span>
                  <span>আইডি: {currentUser?.id || 'usr-1001'}</span>
                </p>

                {/* 16-Digit Real DBS Bank Account Number */}
                <div className="pt-1.5 w-full sm:w-auto">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs max-w-full flex-wrap">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">DBS BBANK SG account number:</span>
                    <span className="font-mono font-black text-xs sm:text-sm text-primary tracking-wider break-all">
                      {format16DigitAccountNumber(currentUser?.bankAccountNumber || currentUser?.phone)}
                    </span>
                  </div>
                </div>

                {/* Multi-Method Withdrawal Accounts Indicator */}
                <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                  {boundMethodsList.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {boundMethodsList.map((bm: any) => (
                          <div
                            key={bm.method}
                            className="text-xs bg-muted/90 px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono shadow-xs"
                          >
                            <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 h-4 bg-card text-foreground">
                              {bm.method === 'Bank' ? 'ব্যাংক' : bm.method}
                            </Badge>
                            <span className="font-bold text-foreground text-xs">{bm.accountNumber}</span>
                            <span title="লকড ও সুরক্ষিত" className="text-amber-600 flex items-center">
                              <Lock className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChangeAccountOpen(true)}
                        className="h-7 text-[11px] font-bold gap-1 text-primary bg-primary/10 border-primary/30 hover:bg-primary/20 rounded-lg"
                      >
                        {boundMethodsList.length < 4 ? '+ অন্য মেথড যুক্ত করুন' : 'উইথড্র মেথডসমূহ (লকড)'}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => setChangeAccountOpen(true)}
                        className="h-8 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:scale-[1.01] transition-transform rounded-xl"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        উইথড্রয়াল অ্যাকাউন্ট যুক্ত করুন +
                      </Button>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        টাকা তোলার জন্য বিকাশ, নগদ বা ব্যাংক যুক্ত করুন
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Executive Premium Banking Wallet Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-xl">
              {/* Luxury background glow & grid accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      সক্রিয় ডিজিটাল ওয়ালেট (Verified Active)
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 flex items-center gap-1.5 pt-0.5">
                    <Wallet className="w-4 h-4 text-emerald-400" /> বর্তমান উপলব্ধ ওয়ালেট ব্যালেন্স
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
                    <span className="text-emerald-400 font-serif text-2xl sm:text-3xl">৳</span>
                    <span className="font-mono text-emerald-300 drop-shadow-sm">{toBengaliNumber(walletBalance.toLocaleString('en-IN'))}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full lg:w-auto">
                  <Button
                    onClick={() => setDepositModalOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm h-11 px-4 shadow-lg shadow-emerald-950/60 rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.99] transition-all"
                  >
                    <ArrowDownCircle className="w-4 h-4 shrink-0 text-white" />
                    <span>জমা</span>
                  </Button>
                  <Button
                    onClick={() => {
                      // Open withdrawal modal directly so user can immediately view active administrative conditions
                      setWithdrawModalOpen(true);
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm h-11 px-4 shadow-md backdrop-blur-md rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.99] transition-all"
                  >
                    <ArrowDownToLine className="w-4 h-4 shrink-0 text-emerald-300" />
                    <span>টাকা তুলুন</span>
                  </Button>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0">
        {/* Android Mobile Banking Quick Action Bar shifted from HomePage */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground font-black flex items-center justify-center text-lg shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : 'সহ'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">স্বাগতম,</span>
                  <h3 className="text-sm font-bold text-foreground">
                    {currentUser?.name || 'সম্মানিত গ্রাহক'}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">ব্যালেন্স:</span>
                  <span className="text-xs font-black text-emerald-600 font-mono">৳ {walletBalance.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setDepositModalOpen(true)}
                className="flex-1 sm:flex-none h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 shadow-xs"
              >
                <ArrowDownCircle className="w-4 h-4" />
                 জমা
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSupportModalOpen(true)}
                className="flex-1 sm:flex-none h-9 px-3 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-xl gap-1.5"
              >
                <Headphones className="w-4 h-4" />
                সাপোর্ট
              </Button>
            </div>
          </div>

          {/* Android Quick Services Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-4 mt-3 border-t border-border/60">
            <Link to="/apply" className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">ঋণ আবেদন</span>
            </Link>

            <button
              type="button"
              onClick={() => setDepositModalOpen(true)}
              className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">জমা</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('wallet-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">কিস্তি পরিশোধ</span>
            </button>

            <Link to="/calculator" className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">ক্যালকুলেটর</span>
            </Link>

            <Link to="/track" className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">স্ট্যাটাস ট্র্যাক</span>
            </Link>

            <button
              type="button"
              onClick={() => setSupportModalOpen(true)}
              className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">সহায়তা</span>
            </button>

            <Link to="/packages" className="flex flex-col items-center text-center group p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1">প্যাকেজসমূহ</span>
            </Link>
          </div>

          {/* 1-Click PWA App Install Banner */}
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-primary to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>DBS Bank SG অফিসিয়াল মোবাইল অ্যাপ</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-amber-950 font-black">১-ক্লিক ইনস্টল</span>
                </h4>
                <p className="text-[11px] text-white/80">
                  ব্রাউজারের ঝামেলা ছাড়াই সরাসরি মোবাইলের হোম স্ক্রিন থেকে দ্রুত লোন ও ব্যাংকিং সেবা নিন
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-pwa-install'));
              }}
              className="w-full sm:w-auto h-9 px-4 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs rounded-xl shadow-sm gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>অ্যাপ ইনস্টল করুন</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="loans" className="space-y-6 w-full max-w-full min-w-0">
          <div className="w-full">
            <TabsList
              className={`w-full h-auto p-1 bg-muted/80 rounded-xl grid ${
                canViewLoanAgreement ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'
              } gap-1`}
            >
              <TabsTrigger
                value="loans"
                className="font-bold text-[11px] sm:text-xs md:text-sm py-2 px-1 text-center rounded-lg data-[state=active]:shadow-xs"
              >
                লোন ও কিস্তিসমূহ
              </TabsTrigger>
              <TabsTrigger
                value="card"
                className="font-bold text-[11px] sm:text-xs md:text-sm py-2 px-1 text-center rounded-lg data-[state=active]:shadow-xs"
              >
                ভার্চুয়াল কার্ড
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="font-bold text-[11px] sm:text-xs md:text-sm py-2 px-1 text-center rounded-lg data-[state=active]:shadow-xs"
              >
                উইথড্র ও লেনদেন
              </TabsTrigger>
              <TabsTrigger
                value="letters"
                className="font-bold text-[11px] sm:text-xs md:text-sm py-2 px-1 text-center rounded-lg data-[state=active]:shadow-xs"
              >
                লেটার সনদ (PDF)
              </TabsTrigger>
              {canViewLoanAgreement && (
                <TabsTrigger
                  value="contracts"
                  className="font-bold text-[11px] sm:text-xs md:text-sm py-2 px-1 text-center rounded-lg data-[state=active]:shadow-xs"
                >
                  চুক্তিপত্র
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* TAB 1: LOANS & CONDITIONAL EMI SCHEDULE */}
          <TabsContent value="loans" className="space-y-6">
            {/* Active Loan Selector */}
            {userApplications.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  আপনার লোনসমূহ:
                </span>
                {userApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedLoanId(app.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedLoan?.id === app.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {app.id} ({formatTaka(app.approvedAmount || app.loanAmount)})
                  </button>
                ))}
              </div>
            )}

            {!selectedLoan ? (
              <Card className="p-8 text-center border bg-card">
                <p className="text-muted-foreground text-sm">আপনার কোনো সক্রিয় লোন আবেদন পাওয়া যায়নি।</p>
                <Button asChild className="mt-4 font-bold text-xs">
                  <Link to="/apply">নতুন লোনের জন্য আবেদন করুন</Link>
                </Button>
              </Card>
            ) : !isLoanApprovedByAdmin ? (
              /* Conditional EMI Schedule: Shown ONLY when admin approves the loan */
              <div className="space-y-4">
                <Card className="border border-amber-200 bg-amber-50/60 p-6 sm:p-8 text-center space-y-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-xs">
                    আবেদন স্ট্যাটাস: প্রক্রিয়াধীন (Pending Admin Approval)
                  </Badge>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">
                    পূর্ণাঙ্গ কিস্তি পরিশোধের সময়সূচি (EMI Schedule) অপেক্ষমাণ
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 max-w-lg mx-auto leading-relaxed">
                    আপনার লোন আবেদনটি (#{selectedLoan.id}) বর্তমানে অ্যাডমিন কর্তৃক যাচাই-বাছাই ও অনুমোদনের প্রক্রিয়ায় রয়েছে। অ্যাডমিন প্যানেল থেকে লোন অনুমোদন করার পরেই স্বয়ংক্রিয়ভাবে আপনার পূর্ণাঙ্গ মাসিক কিস্তির সময়সূচি ও পরিশোধ অপশন এখানে উন্মুক্ত হবে।
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Button asChild variant="outline" size="sm" className="text-xs border-amber-400 text-amber-900">
                      <Link to={`/track?search=${selectedLoan.id}`}>আবেদন ট্র্যাক করুন</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              /* Approved Loan: Full EMI Schedule visible, only admin-approved installments show as paid */
              <>
                {/* Official Sanction Letter Callout Banner */}
                {getApprovalLetterByLoanId(selectedLoan.id) && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          অভিনন্দন! আপনার অফিসিয়াল লোন পাশপত্র ইস্যু করা হয়েছে
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          অনুমোদিত সনদপত্রটি যাচাই ও প্রিন্ট করতে ভিউ করুন।
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenApprovalLetter(selectedLoan.id)}
                      className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      সনদপত্র দেখুন
                    </Button>
                  </div>
                )}

                {/* Loan Overview Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-semibold">মঞ্জুরকৃত ঋণের পরিমাণ</span>
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {formatTaka(selectedLoan.approvedAmount || selectedLoan.loanAmount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        সুদের হার: {selectedLoan.interestRate}% (বার্ষিক)
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-semibold">মাসিক কিস্তি (EMI)</span>
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {formatTaka(selectedLoan.monthlyEMI)}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        মেয়াদকাল: {selectedLoan.durationMonths} মাস
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-semibold">অনুমোদিত পরিশোধিত কিস্তি</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-xl font-bold text-emerald-600">
                        {toBengaliNumber(paidCount)} / {toBengaliNumber(installments.length)} টি
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        পরিশোধিত: {formatTaka(totalPaidAmount)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-semibold">অবশিষ্ট ঋণ স্থিতি</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-xl font-bold text-amber-600">
                        {formatTaka(totalRemainingAmount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        বাকি কিস্তি: {toBengaliNumber(pendingCount)} টি
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Next EMI Due Callout Banner */}
                {nextDueInstallment && (
                  <Card className="border-l-4 border-l-primary bg-primary/5 shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-bold text-xs">
                            আসন্ন কিস্তি #{toBengaliNumber(nextDueInstallment.installmentNo)}
                          </Badge>
                          <span className="text-xs font-semibold text-muted-foreground">
                            পরিশোধের শেষ তারিখ: <strong className="text-foreground">{nextDueInstallment.dueDate}</strong>
                          </span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-foreground mt-1">
                          কিস্তির পরিমাণ: {formatTaka(nextDueInstallment.amount)}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleOpenPay(nextDueInstallment)}
                        className="bg-primary text-primary-foreground font-bold text-xs h-9 px-4 gap-1.5 shrink-0"
                      >
                        <CreditCard className="w-4 h-4" />
                        অনলাইনে কিস্তি পরিশোধ করুন
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Installments Schedule Table */}
                <Card className="border shadow-sm min-w-0 w-full max-w-full overflow-hidden">
                  <CardHeader className="p-4 sm:p-5 border-b">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      পূর্ণাঙ্গ কিস্তি পরিশোধের সময়সূচি (EMI Schedule)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      শুধুমাত্র অ্যাডমিন প্যানেল থেকে লোন আদায় হিসেবে অনুমোদিত কিস্তিগুলো পরিশোধিত হিসেবে প্রদর্শিত হচ্ছে।
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full max-w-full overflow-x-auto bg-card">
                      <Table className="[&>div]:max-w-full min-w-[700px] text-xs">
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="whitespace-nowrap font-bold">কিস্তি নং</TableHead>
                            <TableHead className="whitespace-nowrap font-bold">পরিশোধের তারিখ</TableHead>
                            <TableHead className="whitespace-nowrap font-bold">কিস্তির পরিমাণ</TableHead>
                            <TableHead className="whitespace-nowrap font-bold text-center">স্ট্যাটাস</TableHead>
                            <TableHead className="whitespace-nowrap font-bold text-right">অ্যাকশন / রসিদ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {installments.map((inst) => {
                            const isPaid = inst.status === 'paid';
                            return (
                              <TableRow key={inst.id} className="hover:bg-muted/20">
                                <TableCell className="whitespace-nowrap font-mono font-bold">
                                  #{toBengaliNumber(inst.installmentNo)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap font-mono">
                                  {inst.dueDate}
                                </TableCell>
                                <TableCell className="whitespace-nowrap font-bold font-mono">
                                  {formatTaka(inst.amount)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-center">
                                  {isPaid ? (
                                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1 font-bold">
                                      <CheckCircle2 className="w-3 h-3" /> পরিশোধিত (Approved)
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 text-[10px] font-bold">
                                      বকেয়া (Unpaid)
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-right">
                                  {isPaid ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenReceipt(inst)}
                                      className="h-7 text-xs font-semibold gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    >
                                      <Receipt className="w-3 h-3" /> রসিদ
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenPay(inst)}
                                      className="h-7 text-xs font-semibold bg-primary text-primary-foreground gap-1"
                                    >
                                      <CreditCard className="w-3 h-3" /> পরিশোধ
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 2: VIRTUAL DEBIT CARD */}
          <TabsContent value="card" className="space-y-6">
            <Card className="border shadow-sm p-6 bg-card">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    আন্তর্জাতিক মানের ভার্চুয়াল ভিসা কার্ড
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">
                    আপনার পার্সোনাল ভার্চুয়াল ডেবিট কার্ড
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    অনলাইনে নিরাপদ শপিং ও লেনদেনের জন্য অ্যাডমিন কর্তৃক ইস্যুকৃত ভার্চুয়াল কার্ড।
                  </p>
                </div>

                <VirtualDebitCardView
                  card={currentUser?.virtualCard}
                  platformName={settings.platformNameBn || 'DBS Bank SG'}
                  onApplyCard={async () => {
                    if (!currentUser) return;
                    const newCard = {
                      id: `card-${Date.now()}`,
                      cardNumber: `•••• •••• •••• ••••`,
                      cardHolder: currentUser.name,
                      cardHolderName: currentUser.name,
                      expiryDate: '••/••',
                      cvv: '•••',
                      balance: currentUser.walletBalance || 0,
                      status: 'pending' as const,
                      cardType: 'visa' as const,
                      spendingLimit: 100000
                    };
                    // 1. Sync to Supabase virtual_cards table (zero localStorage)
                    await supabaseSync.requestVirtualCardInCloud(currentUser.phone || currentUser.id, currentUser.name);
                    // 2. Update user context
                    updateCustomerVirtualCard(currentUser.phone || currentUser.id, newCard);
                    toast.success('ভার্চুয়াল ডেবিট কার্ডের আবেদন সফলভাবে জমা হয়েছে!', {
                      description: 'অ্যাডমিন অনুমোদন সম্পন্ন করে কার্ড সেন্ড করলে আপনি কার্ডের পূর্ণ বিবরণ দেখতে পাবেন।'
                    });
                  }}
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: WALLET WITHDRAWALS & TRANSACTIONS */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Withdraw Action Card */}
              <Card className="border shadow-sm bg-card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">সহজ ওয়ালেট ব্যালেন্স</h3>
                    <p className="text-xs text-muted-foreground">যেকোনো সময় টাকা তুলুন</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border text-center space-y-1">
                  <span className="text-xs text-muted-foreground">বর্তমান উত্তোলনযোগ্য ব্যালেন্স</span>
                  <div className="text-2xl font-black text-emerald-700">
                    {formatTaka(walletBalance)}
                  </div>
                </div>

                {isWithdrawalBlocked && (
                  <div className="p-4 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-500 text-amber-950 text-xs space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{withdrawalCondition?.stageTitle || 'উইথড্রয়াল স্থগিত - প্রশাসনিক পূর্বশর্ত প্রযোজ্য'}</span>
                      </div>

                    </div>

                    <p className="leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-amber-300 shadow-inner">
                      {withdrawalCondition?.instructionBn || withdrawalCondition?.messageBn || 'টাকা উত্তোলনের জন্য নির্ধারিত ফি বা কিস্তি জমা দিতে হবে।'}
                    </p>

                    <div className="flex items-center justify-between font-mono font-bold text-xs bg-amber-200/70 p-2 rounded-lg border border-amber-300">
                      <span className="font-sans font-bold text-amber-950">প্রয়োজনীয় জমা:</span>
                      <span className="text-emerald-900 font-extrabold text-sm">{formatTaka(withdrawalCondition?.feeAmount || 0)}</span>
                    </div>

                    {withdrawalCondition?.customerConfirmed && (
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-300 text-emerald-900 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TrxID জমাকৃত:</span>
                        <span className="font-mono font-bold">{withdrawalCondition.customerTrxId}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-amber-900 font-semibold pt-0.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>অ্যাডমিন ক্লিয়ারেন্স ও Accept ব্যতীত টাকা উত্তোলন লক থাকবে</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setWithdrawModalOpen(true)}
                  className={`w-full h-11 font-bold gap-2 text-sm text-white ${
                    isWithdrawalBlocked
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  {isWithdrawalBlocked ? 'শর্ত পূরণ করে টাকা তুলুন (Condition)' : 'টাকা উইথড্র করুন'}
                </Button>

                <div className="text-[11px] text-muted-foreground space-y-1.5 pt-2 border-t">
                  <p className="font-semibold text-foreground">সাপোর্টেড পেমেন্ট মেথড:</p>
                  <p>• বিকাশ, নগদ, রকেট, উপায়</p>
                  <p>• বাংলাদেশের যেকোনো তফসিলি ব্যাংক একাউন্ট</p>
                </div>
              </Card>

              {/* Withdrawal Requests History */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border shadow-sm bg-card">
                  <CardHeader className="p-4 sm:p-5 border-b">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4 text-primary" />
                      আপনার উইথড্রয়াল রিকোয়েস্ট হিস্ট্রি
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full max-w-full overflow-x-auto bg-card">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-semibold">
                          <tr>
                            <th className="px-4 py-3 whitespace-nowrap">তারিখ ও আইডি</th>
                            <th className="px-4 py-3 whitespace-nowrap">মাধ্যম ও নম্বর</th>
                            <th className="px-4 py-3 whitespace-nowrap text-right">পরিমাণ</th>
                            <th className="px-4 py-3 whitespace-nowrap text-center">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {userWithdrawals.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                কোনো উইথড্রয়াল রিকোয়েস্ট জমা পড়েনি
                              </td>
                            </tr>
                          ) : (
                            userWithdrawals.map((w) => (
                              <tr key={w.id} className="hover:bg-muted/20">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-bold font-mono text-foreground">{w.id}</span>
                                  <div className="text-[10px] text-muted-foreground">{w.requestDate}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Badge variant="outline" className="text-[10px] font-bold">
                                    {w.method}
                                  </Badge>
                                  <div className="font-mono text-[11px] text-foreground">{w.accountNumber}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                                  {formatTaka(w.amount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  {w.status === "approved" ? (
                                    <Badge className="bg-emerald-600 text-white text-[10px]">সফল (Completed)</Badge>
                                  ) : w.status === 'rejected' ? (
                                    <Badge variant="destructive" className="text-[10px]">বাতিল (Rejected)</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                                      অপেক্ষমাণ (Pending)
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: APPROVAL LETTERS */}
          <TabsContent value="letters" className="space-y-6">
            <Card className="border shadow-sm bg-card">
              <CardHeader className="p-5 border-b">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                  <FileCheck2 className="w-5 h-5 text-primary" />
                  অফিসিয়াল লোন পাশপত্র ও মঞ্জুরিপত্র (Sanction Letters)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  অ্যাডমিন কর্তৃক অনুমোদিত ঋণ পাশের অফিসিয়াল প্যাড সম্বলিত সনদপত্র
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {userApplications.filter((a) => getApprovalLetterByLoanId(a.id)).length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    আপনার নামে এখনো কোনো অফিসিয়াল লোন পাশপত্র ইস্যু করা হয়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userApplications
                      .filter((a) => getApprovalLetterByLoanId(a.id))
                      .map((app) => {
                        const letter = getApprovalLetterByLoanId(app.id)!;
                        return (
                          <div
                            key={letter.id}
                            className="p-5 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-primary">
                                {letter.sanctionLetterNumber}
                              </span>
                              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                                অফিসিয়াল সনদ
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{app.packageName}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                অনুমোদিত অর্থ: <strong className="text-foreground">{formatTaka(letter.loanAmount)}</strong> | মেয়াদ: {letter.durationMonths} মাস
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {letter.customMessageBn}
                            </p>
                            <div className="pt-2 flex items-center justify-between border-t">
                              <span className="text-[11px] text-muted-foreground">ইস্যু তারিখ: {letter.approvedDate}</span>
                              <Button
                                size="sm"
                                onClick={() => handleOpenApprovalLetter(app.id)}
                                className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                লেটার ভিউ ও ডাউনলোড
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: CONTRACT AGREEMENT PAPERS */}
          {/* TAB 5: OFFICIAL CONTRACTS (AGREEMENT PAPER) */}
          {canViewLoanAgreement && (
            <TabsContent value="contracts" className="space-y-6">
              <Card className="border shadow-sm bg-card">
                <CardHeader className="p-5 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                        <Scale className="w-5 h-5 text-primary" />
                        দ্বিপাক্ষিক আইনি ঋণ চুক্তিপত্র (Official Agreement Contract)
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        অ্যাডমিন কর্তৃক প্রস্তুতকৃত ও ইস্যুকৃত অফিসিয়াল আইনি চুক্তিপত্র দেখুন, যাচাই করুন এবং প্রিন্ট/পিডিএফ ডাউনলোড করুন
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs font-bold gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>DBS Bank SG অনুমোদিত</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {(() => {
                    const approvedCustomerContracts = contractPapers.filter(
                      (c) => (c.userId === currentUser?.id || c.phone === currentUser?.phone) && c.status === 'sent'
                    );

                    if (approvedCustomerContracts.length === 0) {
                      return (
                        <div className="p-8 sm:p-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/50">
                            <Scale className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-foreground">
                              আপনার জন্য কোনো অনুমোদিত চুক্তিপত্র প্রস্তুত করা হয়নি
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                              অ্যাডমিন প্যানেল থেকে অনুমোদন ও সেন্ড না করা পর্যন্ত গ্রাহক কোনো চুক্তিপত্র দেখতে পাবে না। অ্যাডমিন অনুমোদন সম্পন্ন করলে চুক্তিপত্রটি এখানে রিয়েল-টাইমে দেখতে পাবেন।
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approvedCustomerContracts.map((c) => (
                          <div
                            key={c.id}
                            className="p-5 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-primary">
                                {c.contractNumber}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                                  অনুমোদিত চুক্তিপত্র
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400">
                                  {toBengaliNumber(c.stampAmount || 100)} টাকার স্ট্যাম্প
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{c.contractSubjectBn}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ঋণের পরিমাণ: <strong className="text-foreground">{formatTaka(c.loanAmount)}</strong> | মেয়াদ: {toBengaliNumber(c.durationMonths)} মাস | কিস্তি: {formatTaka(c.monthlyEMI)}
                              </p>
                            </div>
                            <div className="pt-2 flex items-center justify-between border-t">
                              <span className="text-[11px] text-muted-foreground">তারিখ: {c.issueDate}</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(c);
                                  setContractModalOpen(true);
                                }}
                                className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                চুক্তিপত্র দেখুন
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* WITHDRAWAL DIALOG WITH CONDITIONAL NOTICE & FEE - Mobile Optimized */}
      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-xl p-5 sm:p-7 bg-card max-h-[90dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
          <DialogHeader className="text-left pb-2 border-b shrink-0">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>টাকা উইথড্র করুন (Withdraw Money)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              আপনার ওয়ালেট ব্যালেন্স: <span className="font-bold text-emerald-600">{formatTaka(walletBalance)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 min-h-0 py-2 space-y-3.5 mt-1">
          {/* Conditional Notice / Gating Warning Banner */}
          {isWithdrawalBlocked ? (
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-500 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                  <span className="line-clamp-2">
                    {withdrawalCondition?.stageTitle || 'উইথড্রয়াল পূর্বশর্ত ও প্রশাসনিক নির্দেশনা'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-amber-950 font-bold leading-relaxed bg-white p-3.5 rounded-xl border border-amber-300 shadow-inner">
                {withdrawalCondition?.instructionBn || withdrawalCondition?.messageBn || 'আপনাকে নির্ধারিত অর্থ জমা প্রদান করতে হবে।'}
              </div>

              <div className="flex items-center justify-between text-xs bg-amber-200/70 p-2.5 rounded-lg border border-amber-300">
                <span className="font-bold text-amber-950">প্রয়োজনীয় জমার পরিমাণ:</span>
                <strong className="font-mono text-base text-emerald-900 font-extrabold">
                  {formatTaka(withdrawalCondition?.feeAmount || 0)}
                </strong>
              </div>

              {withdrawalCondition?.accountOrPhone && (
                <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-amber-300 font-mono">
                  <span className="text-muted-foreground font-sans font-semibold">টাকা জমার অ্যাকাউন্ট:</span>
                  <strong className="text-foreground">{withdrawalCondition.accountOrPhone}</strong>
                </div>
              )}

              {/* Customer Confirmation Action or Status */}
              {withdrawalCondition?.customerConfirmed ? (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2 text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আপনার অর্থ জমা ও স্লিপ সফলভাবে সাবমিট হয়েছে!</span>
                  </div>
                  <div className="text-[11px] text-emerald-900 font-mono space-y-1">
                    <div>প্রেরক নাম্বার / TrxID: <strong>{withdrawalCondition.customerTrxId || 'জমা সম্পন্ন'}</strong></div>
                    {withdrawalCondition.customerSlipUrl && (
                      <div className="pt-1">
                        <span className="text-[10px] text-muted-foreground block font-sans">জমাকৃত স্লিপের প্রিভিউ:</span>
                        <img 
                          src={withdrawalCondition.customerSlipUrl} 
                          alt="Submitted Slip" 
                          className="h-20 w-auto rounded border object-contain bg-white shadow-xs mt-0.5" 
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-900 font-semibold mt-0.5">
                    টাকা জমা দেওয়ার পর অনুগ্রহ করে কিছু সময় অপেক্ষা করুন আপনার ব্যালেন্স অটোমেটিক যোগ হয়ে যাবে।
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-white rounded-xl border-2 border-amber-300 space-y-3.5 shadow-sm">
                  {/* Step 1: Sender Number 4/6 digits or TrxID */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <Label className="text-xs font-bold text-amber-950">
                        ১. যে নাম্বার থেকে টাকা পাঠিয়েছেন তার লাষ্টের ৪ সংখ্যা বা ৬ সংখ্যা দিন: *
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        (বা TrxID)
                      </span>
                    </div>
                    <Input
                      value={condPayTrxId}
                      onChange={(e) => setCondPayTrxId(e.target.value)}
                      placeholder="যে নাম্বার থেকে টাকা পাঠিয়েছেন তার লাষ্টের ৪ সংখ্যা বা ৬ সংখ্যা দিন (যেমন: 4582)"
                      className="h-10 text-xs font-mono font-bold bg-white border-amber-300 focus-visible:border-amber-500 tracking-wider shadow-2xs"
                      required
                    />
                  </div>

                  {/* Step 2: Prominently Highlighted Slip Upload Card */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span>২. টাকা জমার রশিদ / স্লিপ আপলোড করুন:</span>
                      </Label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        স্ক্রিনশট বা রসিদের ছবি
                      </span>
                    </div>

                    <label className="flex flex-col sm:flex-row items-center justify-center gap-3 p-3.5 sm:p-4 border-2 border-dashed border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl cursor-pointer hover:border-emerald-600 hover:bg-emerald-100/70 transition-all shadow-sm group">
                      <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-950 block">
                          {condSlipFileName ? `✓ ${condSlipFileName}` : 'পেমেন্ট স্লিপ বা স্ক্রিনশট আপলোড করুন'}
                        </span>
                        <span className="text-[11px] text-emerald-800 block mt-0.5 font-medium">
                          {condSlipPreview 
                            ? 'স্লিপ প্রস্তুত আছে (পরিবর্তন করতে এখানে পুনরায় ট্যাপ করুন)' 
                            : 'গ্যালারি থেকে জমার রসিদ বা ট্রানজেকশনের স্ক্রিনশট নির্বাচন করতে এখানে চাপুন'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlipChange}
                        className="hidden"
                      />
                    </label>

                    {condSlipPreview && (
                      <div className="relative mt-2 p-2 bg-emerald-50/90 border-2 border-emerald-400 rounded-xl flex items-center gap-3 shadow-xs">
                        <img
                          src={condSlipPreview}
                          alt="Slip Preview"
                          className="h-16 w-16 rounded-lg border border-emerald-500 object-cover bg-white shrink-0 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-xs font-bold text-emerald-950 block truncate">
                            {condSlipFileName || 'পেমেন্ট স্ক্রিনশট'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> স্লিপ সফলভাবে যুক্ত হয়েছে
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCondSlipPreview('');
                            setCondSlipFileName('');
                          }}
                          className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          title="মুছে ফেলুন"
                        >
                          মুছুন
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleConfirmConditionPayment}
                    disabled={condConfirmSubmitting || !condPayTrxId.trim()}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-10 rounded-xl shadow-sm"
                  >
                    {condConfirmSubmitting ? 'প্রসেসিং...' : '✓ পেমেন্ট স্লিপ ও তথ্য জমা দিন (Confirm)'}
                  </Button>
                </div>
              )}

              {/* Status Notice replacement */}
              <div className="p-3 bg-amber-500/15 border-2 border-amber-500/50 rounded-xl flex items-center gap-2.5 text-xs font-bold text-amber-950 shadow-xs">
                <Clock className="w-5 h-5 text-amber-800 shrink-0 animate-pulse" />
                <span className="leading-relaxed">
                  টাকা জমা দেওয়ার পর অনুগ্রহ করে কিছু সময় অপেক্ষা করুন আপনার ব্যালেন্স অটোমেটিক যোগ হয়ে যাবে
                </span>
              </div>

              <div className="pt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setWithdrawModalOpen(false)}
                  className="w-full text-xs font-semibold h-9 rounded-xl"
                >
                  বন্ধ করুন
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">পেমেন্ট মেথড নির্বাচন করুন *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket', 'Upay', 'Bank'] as PaymentChannel[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWthMethod(m)}
                      className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                        wthMethod === m
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m === 'Bank' ? 'ব্যাংক ট্রান্সফার' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">উইথড্র টাকার পরিমাণ (BDT) *</Label>
                <Input
                  type="number"
                  placeholder="যেমন: 5000"
                  value={wthAmount}
                  onChange={(e) => setWthAmount(e.target.value)}
                  max={walletBalance}
                  min="100"
                  className="h-10 text-sm font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    {wthMethod === 'Bank' ? 'ব্যাংক হিসাব নম্বর (Account No) *' : `${wthMethod} মোবাইল নম্বর *`}
                  </Label>
                  {effectiveBoundMap[wthMethod] ? (
                    <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      <Lock className="w-3 h-3 text-amber-700" /> লকড ও সংরক্ষিত
                    </span>
                  ) : (
                    <span className="text-[10px] text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      <PlusCircle className="w-3 h-3 text-primary" /> নতুন মেথড (যুক্ত হবে)
                    </span>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder={wthMethod === 'Bank' ? 'যেমন: 205021302004589' : 'যেমন: 01712345678'}
                  value={wthAccount}
                  onChange={(e) => setWthAccount(e.target.value)}
                  readOnly={Boolean(effectiveBoundMap[wthMethod])}
                  className={`h-10 text-sm font-mono font-bold ${
                    effectiveBoundMap[wthMethod] ? 'bg-muted/80 text-foreground cursor-not-allowed' : ''
                  }`}
                  required
                />
                {effectiveBoundMap[wthMethod] ? (
                  <p className="text-[10px] text-amber-900 font-medium">
                    🔒 আপনার এই {wthMethod === 'Bank' ? 'ব্যাংক হিসাবটি' : `${wthMethod} নম্বরটি`} পূর্বে যুক্ত ও লকড করা হয়েছে। পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-800 font-medium">
                    💡 প্রথমবার উত্তোলনের পর এই মেথডটি স্বয়ংক্রিয়ভাবে আপনার প্রোফাইলে যুক্ত হয়ে স্থায়ীভাবে সংরক্ষিত ও লকড থাকবে।
                  </p>
                )}
              </div>

              {wthMethod === 'Bank' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">অ্যাকাউন্টধারীর নাম</Label>
                    <Input
                      type="text"
                      value={wthHolderName}
                      onChange={(e) => setWthHolderName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">ব্যাংকের নাম</Label>
                      <Input
                        type="text"
                        value={wthBankName}
                        onChange={(e) => setWthBankName(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">শাখার নাম</Label>
                      <Input
                        type="text"
                        value={wthBranchName}
                        onChange={(e) => setWthBranchName(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t sticky bottom-0 bg-card pb-1">
                <Button type="button" variant="outline" onClick={() => setWithdrawModalOpen(false)}>
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  disabled={isWithdrawalBlocked}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  উইথড্র রিকোয়েস্ট পাঠান
                </Button>
              </div>
            </form>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Account Modal */}
      <ChangeAccountModal
        open={changeAccountOpen}
        onOpenChange={setChangeAccountOpen}
        currentAccountType={currentUser?.accountType || 'bKash'}
        currentAccountNumber={currentUser?.accountNumber || userPhone}
        currentAccountHolderName={currentUser?.accountHolderName || currentUser?.name || ''}
        currentBankName={currentUser?.bankName}
        currentBranchName={currentUser?.branchName}
      />

      {/* Customer Deposit Modal */}
      <CustomerDepositModal
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
      />

      {/* Customer Support Modal */}
      <CustomerSupportModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
      />

      {/* Approval Letter Modal */}
      {currentApprovalLetter && (
        <Dialog open={letterModalOpen} onOpenChange={setLetterModalOpen}>
          <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-5xl p-5 sm:p-7 bg-card max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>অফিসিয়াল লোন অনুমোদন পত্র</DialogTitle>
            </DialogHeader>
            <BankApprovalLetterView letter={currentApprovalLetter} />
          </DialogContent>
        </Dialog>
      )}

      {/* Contract Modal */}
      {selectedContract && (
        <CustomerContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          contract={selectedContract}
        />
      )}
    </CustomerLayout>
  );
};
