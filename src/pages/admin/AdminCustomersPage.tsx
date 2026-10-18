import React, { useState, useEffect, useMemo } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber, normalizePhone, format16DigitAccountNumber, loanStorage } from '@/services/storage';
import {  LoanApplicationDocument, VirtualDebitCard, WithdrawalCondition } from '@/types/loan';
import { Card,CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  UserCheck, 
  Phone, 

  Briefcase, 

  Trash2, 
  FileText, 
  Wallet, 

  ShieldCheck, 

  Eye, 
  EyeOff,
  Copy,
  CreditCard,
  AlertTriangle,
  Lock,
  CheckCircle2,
 
  ArrowRight,
  RotateCcw,
  Edit,
  Building2,
  LayoutGrid,
  List,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Scale
} from 'lucide-react';
import { CustomerDocumentInspectorModal } from '@/components/common/CustomerDocumentInspectorModal';
import { toast } from 'sonner';

interface CustomerListItem {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  nidNumber: string;
  profession: string;
  monthlyIncome: number;
  address: string;
  registeredAt: string;
  walletBalance: number;
  kycVerified: boolean;
  totalApplications: number;
  activeLoans: number;
  totalBorrowed: number;
  isRegisteredUser: boolean;
  isActive: boolean;
  bankAccountNumber?: string;
  accountType?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  boundWithdrawalAccounts?: Partial<Record<'bKash' | 'Nagad' | 'Rocket' | 'Bank', any>>;
  password?: string;
  canViewLoanAgreement?: boolean;
  withdrawalCondition?: WithdrawalCondition;
  virtualCard?: VirtualDebitCard;
  documents: LoanApplicationDocument[];
}

export const AdminCustomersPage: React.FC = () => {
  const { 
    users, 
    applications, 
    paymentMethods,
    refreshUsers,
    refreshApplications,
    purgeCustomerCompletely,
    getAllDocumentsForCustomer,
    updateUserWallet,
    updateCustomerAccount,
    updateCustomerWithdrawalCondition,
  
    acceptCustomerWithdrawalCondition,
    rejectCustomerWithdrawalConditionSlip,
    addNextWithdrawalCondition,
    updateCustomerVirtualCard,
    toggleCustomerActive,
   
    adminRole,
    currentSubAdmin
  } = useLoan();

  const activePaymentMethods = (paymentMethods || []).filter((m) => m.active);
  const defaultActiveDepositAccount = activePaymentMethods.length > 0
    ? activePaymentMethods.map((m) => `${m.name}${m.accountType ? ` (${m.accountType})` : ''}: ${m.accountNumber}`).join(' / ')
    : 'বিকাশ (Agent): 01762731633 / নগদ (Agent): 01333994575';

  useEffect(() => {
    refreshUsers();
    refreshApplications();
  }, [refreshUsers, refreshApplications]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Inspector Modal State
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectingCustomer, setInspectingCustomer] = useState<{
    name: string;
    phone: string;
    nid?: string;
    documents: LoanApplicationDocument[];
  } | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null);

  // Balance Adjustment State
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [customerToAdjust, setCustomerToAdjust] = useState<CustomerListItem | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('5000');
  const [balanceAction, setBalanceAction] = useState<'credit' | 'debit'>('credit');
  const [balanceNote, setBalanceNote] = useState('অ্যাডমিন কর্তৃক ওয়ালেট ব্যালেন্স সমন্বয়');
  const [balAttachCond, setBalAttachCond] = useState(true);
  const [balCondTitle, setBalCondTitle] = useState('প্রথম কিস্তি জমা বাবদ');
  const [balCondFee, setBalCondFee] = useState('2000');
  const [balCondMsg, setBalCondMsg] = useState('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ। জমা সম্পন্ন হলে TrxID দিয়ে কনফার্ম করুন।');

  // Next Stage Condition Dialog State
  const [nextStageDialogOpen, setNextStageDialogOpen] = useState(false);
  const [nextStageCustomer, setNextStageCustomer] = useState<CustomerListItem | null>(null);
  const [nextStageTitle, setNextStageTitle] = useState('ঋণ ঝুঁকি জীবন বীমা বাবদ');
  const [nextStageFee, setNextStageFee] = useState('1000');
  const [nextStageMsg, setNextStageMsg] = useState('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে জীবন বীমা বাবদ। জমা সম্পন্ন হলে TrxID দিয়ে কনফার্ম করুন।');
  const [nextStageAccount, setNextStageAccount] = useState('বিকাশ / নগদ / ব্যাংক');

  // 1. Account Edit Modal State (Multi-method support)
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerListItem | null>(null);
  const [accName, setAccName] = useState<string>('');
  const [accPhone, setAccPhone] = useState<string>('');
  const [accPassword, setAccPassword] = useState<string>('');
  const [accBkash, setAccBkash] = useState<string>('');
  const [accNagad, setAccNagad] = useState<string>('');
  const [accRocket, setAccRocket] = useState<string>('');
  const [accBankAcc, setAccBankAcc] = useState<string>('');
  const [accBankName, setAccBankName] = useState<string>('');
  const [accBankBranch, setAccBankBranch] = useState<string>('');
  const [accBankHolder, setAccBankHolder] = useState<string>('');
  const [accCanViewAgreement, setAccCanViewAgreement] = useState<boolean>(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState<boolean>(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // 2. Withdrawal Condition & Multi-Stage Fee Modal State
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [condCustomer, setCondCustomer] = useState<CustomerListItem | null>(null);
  const [condRequired, setCondRequired] = useState(false);
  const [condStageTitle, setCondStageTitle] = useState('প্রথম কিস্তি জমা বাবদ');
  const [condMessage, setCondMessage] = useState('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
  const [condFee, setCondFee] = useState<number>(2000);
  const [condDepositAccount, setCondDepositAccount] = useState('বিকাশ / নগদ (পার্সোনাল): 01712345678');
  const [condApproved, setCondApproved] = useState(false);
  const [condPreserveSubmission, setCondPreserveSubmission] = useState(true);
  const [isSavingCondition, setIsSavingCondition] = useState(false);

  // Slip Viewer Modal State
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [slipCustomer, setSlipCustomer] = useState<CustomerListItem | null>(null);

  // Post Accept & Add Next Stage Dialog
  const [postAcceptDialogOpen, setPostAcceptDialogOpen] = useState(false);
  const [postAcceptCustomer, setPostAcceptCustomer] = useState<CustomerListItem | null>(null);
  const [acceptedStageTitle, setAcceptedStageTitle] = useState('');

  // 3. Virtual Debit Card Modal State
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardCustomer, setCardCustomer] = useState<CustomerListItem | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardStatus, setCardStatus] = useState<'active' | 'pending' | 'blocked'>('active');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Reset page when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Unified customer map - memoized so expensive loops don't re-run on every state change
  const allCustomers = useMemo(() => {
    const customerMap = new Map<string, CustomerListItem>();

    // Pre-index applications by normalized phone and userId for O(1) lookups
    const appsByPhone = new Map<string, typeof applications>();
    const appsByUserId = new Map<string, typeof applications>();

    applications.forEach((a) => {
      const pNorm = normalizePhone(a.phone);
      if (pNorm) {
        if (!appsByPhone.has(pNorm)) appsByPhone.set(pNorm, []);
        appsByPhone.get(pNorm)!.push(a);
      }
      if (a.userId) {
        if (!appsByUserId.has(a.userId)) appsByUserId.set(a.userId, []);
        appsByUserId.get(a.userId)!.push(a);
      }
    });

    users.forEach((u) => {
      const userPhoneNorm = normalizePhone(u.phone);
      const matchedApps = [
        ...(u.id && appsByUserId.has(u.id) ? appsByUserId.get(u.id)! : []),
        ...(userPhoneNorm && appsByPhone.has(userPhoneNorm) ? appsByPhone.get(userPhoneNorm)! : [])
      ];
      // Deduplicate matched applications
      const userApps = Array.from(new Set(matchedApps));

      const totalBorrowed = userApps
        .filter((a) => a.status === 'approved' || a.status === 'disbursed')
        .reduce((sum, a) => sum + (a.loanAmount || a.amount || 0), 0);

      // Collect documents from matched apps without doing disk/localStorage queries
      const customerDocs: LoanApplicationDocument[] = [];
      const seenDocIds = new Set<string>();
      userApps.forEach((a) => {
        (a.documents || []).forEach((d) => {
          if (!seenDocIds.has(d.id)) {
            seenDocIds.add(d.id);
            customerDocs.push(d);
          }
        });
      });

      let userRegDate = u.registeredAt;
      if (!userRegDate) {
        const match = (u.id || '').match(/(\d{10,14})/);
        if (match) {
          const ts = parseInt(match[1], 10);
          if (!isNaN(ts) && ts > 1000000000000) {
            userRegDate = new Date(ts).toISOString();
          }
        }
      }

      customerMap.set(u.id, {
        id: u.id,
        userId: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email || `${u.phone}@client.com`,
        nidNumber: u.nidNumber || 'প্রক্রিয়াধীন',
        profession: u.profession || 'বেসরকারি চাকরিজীবী',
        monthlyIncome: 45000,
        address: u.address || 'ঢাকা, বাংলাদেশ',
        registeredAt: userRegDate || '2025-01-01',
        walletBalance: u.walletBalance || 0,
        kycVerified: u.kycVerified ?? true,
        totalApplications: userApps.length,
        activeLoans: userApps.filter((a) => a.status === 'disbursed').length,
        totalBorrowed,
        isRegisteredUser: true,
        isActive: u.isActive !== false,
        accountType: u.accountType,
        accountNumber: u.accountNumber,
        accountHolderName: u.accountHolderName || u.name,
        bankName: u.bankName,
        branchName: u.branchName,
        boundWithdrawalAccounts: u.boundWithdrawalAccounts,
        password: u.password || 'Aa112233@',
        canViewLoanAgreement: Boolean(u.canViewLoanAgreement),
        withdrawalCondition: u.withdrawalCondition,
        virtualCard: u.virtualCard,
        documents: customerDocs
      });
    });

    applications.forEach((app) => {
      const appPhoneNorm = normalizePhone(app.phone);
      let isAlreadyInList = false;

      for (const existing of customerMap.values()) {
        if (
          (app.userId && existing.userId === app.userId) ||
          normalizePhone(existing.phone) === appPhoneNorm ||
          existing.name.toLowerCase().trim() === app.applicantName.toLowerCase().trim()
        ) {
          isAlreadyInList = true;
          break;
        }
      }

      if (!isAlreadyInList) {
        const userApps = appsByPhone.get(appPhoneNorm) || [app];
        const totalBorrowed = userApps
          .filter((a) => a.status === 'approved' || a.status === 'disbursed')
          .reduce((sum, a) => sum + (a.loanAmount || a.amount || 0), 0);
        const disbursedWalletSum = userApps
          .filter((a) => a.status === 'disbursed')
          .reduce((sum, a) => sum + (a.approvedAmount || a.loanAmount || 0), 0);

        const customerDocs: LoanApplicationDocument[] = [];
        const seenDocIds = new Set<string>();
        userApps.forEach((a) => {
          (a.documents || []).forEach((d) => {
            if (!seenDocIds.has(d.id)) {
              seenDocIds.add(d.id);
              customerDocs.push(d);
            }
          });
        });

        customerMap.set(`applicant-${app.id}`, {
          id: `applicant-${app.id}`,
          userId: undefined,
          name: app.applicantName,
          phone: app.phone,
          email: app.email,
          nidNumber: app.nidNumber,
          profession: app.profession,
          monthlyIncome: app.monthlyIncome,
          address: app.presentAddress,
          registeredAt: app.appliedDate || new Date().toISOString().split('T')[0],
          walletBalance: disbursedWalletSum,
          kycVerified: true,
          totalApplications: userApps.length,
          activeLoans: userApps.filter((a) => a.status === 'disbursed').length,
          totalBorrowed,
          isRegisteredUser: false,
          isActive: true,
          accountType: 'bKash',
          accountNumber: app.bankAccountNumber || app.phone,
          accountHolderName: app.applicantName,
          password: 'User@123456',
          withdrawalCondition: undefined,
          virtualCard: undefined,
          documents: customerDocs
        });
      }
    });

    const getSortTimestamp = (c: CustomerListItem): number => {
      if (c.registeredAt) {
        const parsed = Date.parse(c.registeredAt);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const match = (c.id || '').match(/(\d{10,14})/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 1000000000000) return parsed;
      }
      const loanMatch = (c.id || '').match(/LN-(\d{4})-(\d{4})/);
      if (loanMatch) {
        const year = parseInt(loanMatch[1], 10);
        const seq = parseInt(loanMatch[2], 10);
        return new Date(year, 0, 1).getTime() + seq * 10000;
      }
      return 0;
    };

    // Sub-Admin Isolation
    const assignedCustomerIds = (adminRole === 'sub_admin' && currentSubAdmin)
      ? (currentSubAdmin.assigned_customer_ids || [])
      : null;

    const rawList = Array.from(customerMap.values()).filter((c) => {
      if (assignedCustomerIds === null) return true;
      const phoneNorm = normalizePhone(c.phone);
      return (
        assignedCustomerIds.includes(c.id) ||
        (c.userId && assignedCustomerIds.includes(c.userId)) ||
        assignedCustomerIds.includes(c.phone) ||
        assignedCustomerIds.includes(phoneNorm)
      );
    });

    return rawList.sort((a, b) => {
      const timeA = getSortTimestamp(a);
      const timeB = getSortTimestamp(b);
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [users, applications, adminRole, currentSubAdmin]);

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      const rawSearch = searchTerm.toLowerCase().trim();
      const cleanDigits = rawSearch.replace(/[\s-]+/g, '');
      const normSearch = normalizePhone(searchTerm).toLowerCase();
      const userBankAcc = (c.bankAccountNumber || '').toLowerCase().replace(/[\s-]+/g, '');
      const formattedBankAcc = format16DigitAccountNumber(c.bankAccountNumber || c.phone).toLowerCase().replace(/[\s-]+/g, '');
      const userPhoneClean = (c.phone || '').replace(/[\s-]+/g, '');

      const matchesSearch = 
        !rawSearch ||
        (c.name || '').toLowerCase().includes(rawSearch) ||
        userPhoneClean.includes(cleanDigits) ||
        (c.phone || '').includes(rawSearch) ||
        normalizePhone(c.phone || '').includes(normSearch) ||
        (c.id || '').toLowerCase().includes(rawSearch) ||
        (c.userId || '').toLowerCase().includes(rawSearch) ||
        userBankAcc.includes(cleanDigits) ||
        formattedBankAcc.includes(cleanDigits) ||
        (c.accountNumber && c.accountNumber.replace(/[\s-]+/g, '').includes(cleanDigits)) ||
        (c.nidNumber || '').includes(rawSearch);

      if (!matchesSearch) return false;

      if (filterType === 'verified') return c.kycVerified;
      if (filterType === 'pending') return !c.kycVerified;
      return true;
    });
  }, [allCustomers, searchTerm, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safeCurrentPage, pageSize]);

  const totalRegisteredCount = allCustomers.length;
  const verifiedCount = useMemo(() => allCustomers.filter((c) => c.kycVerified).length, [allCustomers]);
  const totalWalletSum = useMemo(() => allCustomers.reduce((sum, c) => sum + (c.walletBalance || 0), 0), [allCustomers]);
  const activeLoansCount = useMemo(() => allCustomers.filter((c) => c.activeLoans > 0).length, [allCustomers]);

  const handleOpenInspector = (c: CustomerListItem) => {
    const docs = getAllDocumentsForCustomer(c.phone);
    setInspectingCustomer({
      name: c.name,
      phone: c.phone,
      nid: c.nidNumber !== 'প্রক্রিয়াধীন' ? c.nidNumber : undefined,
      documents: docs
    });
    setInspectorOpen(true);
  };

  const handleOpenDeleteDialog = (c: CustomerListItem) => {
    setCustomerToDelete(c);
    setDeleteDialogOpen(true);
  };

  const handleConfirmPurgeDelete = async () => {
    if (!customerToDelete) return;
    const res = await purgeCustomerCompletely(customerToDelete.phone || customerToDelete.id);
    if (res.success) {
      toast.success(`গ্রাহক "${customerToDelete.name}" (${customerToDelete.phone})-এর অ্যাকাউন্ট মুছে ফেলা হয়েছে!`);
    } else {
      toast.error('ডিলিট করতে সমস্যা হয়েছে');
    }
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleOpenBalanceDialog = (c: CustomerListItem) => {
    setCustomerToAdjust(c);
    setBalanceAmount('5000');
    setBalanceAction('credit');
    setBalanceNote('অ্যাডমিন কর্তৃক ওয়ালেট ব্যালেন্স সমন্বয়');
    setBalanceDialogOpen(true);
  };

  const handleConfirmBalanceAdjustment = () => {
    if (!customerToAdjust) return;
    const amountNum = parseFloat(balanceAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('সঠিক টাকার পরিমাণ দিন');
      return;
    }
    const finalAmount = balanceAction === 'credit' ? amountNum : -amountNum;
    const txType: 'credit' | 'debit' = balanceAction === 'credit' ? 'credit' : 'debit';
    const txTitle = balanceAction === 'credit' ? 'অ্যাডমিন ক্রেডিট' : 'অ্যাডমিন কর্তন';
    const txDesc = balanceNote.trim() || 'অ্যাডমিন কর্তৃক ওয়ালেট ব্যালেন্স সমন্বয়';
    const res = updateUserWallet(customerToAdjust.phone || customerToAdjust.id, finalAmount, txType, txTitle, txDesc);
    if (res.success) {
      if (balanceAction === 'credit' && balAttachCond) {
        updateCustomerWithdrawalCondition(customerToAdjust.phone || customerToAdjust.id, {
          required: true,
          stageTitle: balCondTitle.trim() || 'প্রথম কিস্তি জমা বাবদ',
          feeAmount: parseFloat(balCondFee) || 0,
          instructionBn: balCondMsg.trim(),
          messageBn: balCondMsg.trim(),
          paymentMethod: 'bKash / Nagad / Bank',
          isApproved: false,
          status: 'active',
          customerConfirmed: false
        });
        toast.success(`${res.message} এবং উইথড্রয়াল শর্ত ও লক সক্রিয় করা হয়েছে!`);
      } else {
        toast.success(res.message);
      }
    } else {
      toast.error(res.message);
    }
    setBalanceDialogOpen(false);
  };

  const togglePasswordVisibility = (phone: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [phone]: !prev[phone]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে`);
  };

  // Open Account Edit
  const handleOpenAccountModal = (c: CustomerListItem) => {
    setEditingCustomer(c);
    setAccName(c.name || '');
    setAccPhone(c.phone || '');
    setAccPassword(c.password || 'Aa112233@');

    const bm = c.boundWithdrawalAccounts || {};
    // Extract methods
    const bkashNum = bm.bKash?.accountNumber || (c.accountType === 'bKash' && c.accountNumber !== c.phone ? c.accountNumber : '');
    const nagadNum = bm.Nagad?.accountNumber || (c.accountType === 'Nagad' && c.accountNumber !== c.phone ? c.accountNumber : '');
    const rocketNum = bm.Rocket?.accountNumber || (c.accountType === 'Rocket' && c.accountNumber !== c.phone ? c.accountNumber : '');
    const bankNum = bm.Bank?.accountNumber || (c.accountType === 'Bank' ? c.accountNumber : '');

    setAccBkash(bkashNum || '');
    setAccNagad(nagadNum || '');
    setAccRocket(rocketNum || '');
    setAccBankAcc(bankNum || '');
    setAccBankName(bm.Bank?.bankName || c.bankName || 'ইসলামী ব্যাংক বাংলাদেশ');
    setAccBankBranch(bm.Bank?.branchName || c.branchName || 'প্রধান শাখা');
    setAccBankHolder(bm.Bank?.accountHolderName || c.accountHolderName || c.name || '');
    setAccCanViewAgreement(Boolean(c.canViewLoanAgreement));

    setShowPasswordInModal(false);
    setAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!accName.trim()) {
      toast.error('গ্রাহকের নাম আবশ্যক');
      return;
    }
    if (!accPhone.trim()) {
      toast.error('গ্রাহকের লগইন মোবাইল নম্বর আবশ্যক');
      return;
    }

    // Build multi-method bound accounts map
    const newBound: Partial<Record<'bKash' | 'Nagad' | 'Rocket' | 'Bank', any>> = {};
    const today = new Date().toISOString().split('T')[0];

    if (accBkash.trim()) {
      newBound.bKash = {
        method: 'bKash',
        accountNumber: normalizePhone(accBkash.trim()),
        accountHolderName: accName.trim(),
        isLocked: true,
        boundAt: today
      };
    }
    if (accNagad.trim()) {
      newBound.Nagad = {
        method: 'Nagad',
        accountNumber: normalizePhone(accNagad.trim()),
        accountHolderName: accName.trim(),
        isLocked: true,
        boundAt: today
      };
    }
    if (accRocket.trim()) {
      newBound.Rocket = {
        method: 'Rocket',
        accountNumber: normalizePhone(accRocket.trim()),
        accountHolderName: accName.trim(),
        isLocked: true,
        boundAt: today
      };
    }
    if (accBankAcc.trim()) {
      newBound.Bank = {
        method: 'Bank',
        accountNumber: accBankAcc.trim(),
        bankName: accBankName.trim() || 'ব্যাংক হিসাব',
        branchName: accBankBranch.trim() || 'প্রধান শাখা',
        accountHolderName: accBankHolder.trim() || accName.trim(),
        isLocked: true,
        boundAt: today
      };
    }

    // Determine primary display method
    const primaryKey = (Object.keys(newBound)[0] || 'bKash') as 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
    const primaryAcc = newBound[primaryKey];

    const res = updateCustomerAccount(editingCustomer.id || editingCustomer.phone, {
      name: accName.trim(),
      phone: accPhone.trim(),
      accountType: primaryKey,
      accountNumber: primaryAcc ? primaryAcc.accountNumber : undefined,
      accountHolderName: primaryAcc ? primaryAcc.accountHolderName : accName.trim(),
      bankName: primaryKey === 'Bank' ? primaryAcc?.bankName : undefined,
      branchName: primaryKey === 'Bank' ? primaryAcc?.branchName : undefined,
      boundWithdrawalAccounts: newBound,
      password: accPassword.trim() || undefined,
      canViewLoanAgreement: accCanViewAgreement
    });

    if (res) {
      toast.success('গ্রাহকের নাম, লগইন ফোন, পাসওয়ার্ড ও উইথড্র অ্যাকাউন্ট সফলভাবে আপডেট হয়েছে!');
      refreshUsers();
      refreshApplications();
      setAccountModalOpen(false);
    } else {
      toast.error('অ্যাকাউন্ট তথ্য আপডেট করা সম্ভব হয়নি');
    }
  };

  const handleToggleAgreementAccess = (c: CustomerListItem) => {
    const nextState = !c.canViewLoanAgreement;
    const res = updateCustomerAccount(c.id || c.phone, { canViewLoanAgreement: nextState });
    if (res) {
      if (nextState) {
        toast.success(`গ্রাহক "${c.name}"-কে চুক্তিপত্র দেখার অনুমতি দেওয়া হয়েছে!`);
      } else {
        toast.info(`গ্রাহক "${c.name}"-এর চুক্তিপত্র দেখার অনুমতি প্রত্যাহার করা হয়েছে!`);
      }
      refreshUsers();
    }
  };

  // Open Withdrawal Condition & Fee (handles creating new or editing ongoing condition)
  const handleOpenConditionModal = (c: CustomerListItem, _mode: 'edit' | 'new' = 'edit') => {
    setCondCustomer(c);
    const cond = c.withdrawalCondition;
    const hasExisting = Boolean(cond && (cond.required || cond.stageTitle || (cond.feeAmount && cond.feeAmount > 0) || cond.isApproved));

    setCondRequired(hasExisting ? true : (cond ? cond.required : true));
    setCondStageTitle(cond?.stageTitle || 'প্রথম কিস্তি জমা বাবদ');
    setCondMessage(cond?.instructionBn || cond?.messageBn || 'আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
    setCondFee(cond?.feeAmount !== undefined ? cond.feeAmount : 2000);
    setCondDepositAccount(cond?.accountOrPhone && !cond.accountOrPhone.includes('01712345678') ? cond.accountOrPhone : defaultActiveDepositAccount);
    setCondApproved(cond ? Boolean(cond.isApproved) : false);
    setCondPreserveSubmission(Boolean(cond?.customerConfirmed));
    setConditionModalOpen(true);
  };

  const handleSaveCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condCustomer) return;

    setIsSavingCondition(true);
    try {
      const conditionPayload: WithdrawalCondition = {
        required: condRequired,
        stageTitle: condStageTitle.trim() || 'উইথড্রয়াল পূর্বশর্ত',
        instructionBn: condMessage.trim(),
        messageBn: condMessage.trim(),
        noticeBn: condMessage.trim(),
        feeAmount: Number(condFee),
        accountOrPhone: condDepositAccount.trim(),
        isApproved: condApproved,
        customerConfirmed: condPreserveSubmission && condCustomer.withdrawalCondition?.customerConfirmed ? true : false,
        customerConfirmedAt: condPreserveSubmission ? condCustomer.withdrawalCondition?.customerConfirmedAt : undefined,
        customerTrxId: condPreserveSubmission ? condCustomer.withdrawalCondition?.customerTrxId : undefined,
        customerSlipUrl: condPreserveSubmission ? condCustomer.withdrawalCondition?.customerSlipUrl : undefined,
        status: condApproved
          ? 'approved'
          : condRequired
          ? condPreserveSubmission && condCustomer.withdrawalCondition?.customerConfirmed
            ? 'user_confirmed'
            : 'pending_payment'
          : 'approved',
        history: condCustomer.withdrawalCondition?.history || []
      };

      const res = await loanStorage.updateCustomerWithdrawalConditionAsync(
        condCustomer.phone || condCustomer.id,
        conditionPayload,
        { preserveSubmission: condPreserveSubmission }
      );

      if (res) {
        toast.success(`'${condCustomer.name}'-এর উইথড্র শর্ত সফলভাবে আপডেট ও Supabase ক্লাউডে সংরক্ষিত হয়েছে!`, {
          description: `শর্ত: ${conditionPayload.stageTitle} | ফি: ${formatTaka(conditionPayload.feeAmount)}`
        });
        refreshUsers();
        setConditionModalOpen(false);
      } else {
        toast.error('উইথড্র শর্ত সংরক্ষণ করা সম্ভব হয়নি');
      }
    } catch (err: any) {
      toast.error('উইথড্র শর্ত সংরক্ষণে সমস্যা হয়েছে: ' + (err?.message || 'অজানা ত্রুটি'));
    } finally {
      setIsSavingCondition(false);
    }
  };

  // Open Slip Modal
  const handleOpenSlipModal = (c: CustomerListItem) => {
    setSlipCustomer(c);
    setSlipModalOpen(true);
  };

  // Accept current payment and prompt for next stage or complete unlock
  const handleAcceptCondition = (c: CustomerListItem, promptNext: boolean = true) => {
    const res = acceptCustomerWithdrawalCondition(c.phone || c.id, 'অ্যাডমিন কর্তৃক যাচাই ও অনুমোদিত');
    toast.success(`${c.name}-এর '${res.completedStageTitle || 'শর্ত'}' সফলভাবে Accept করা হয়েছে!`);
    refreshUsers();
    setSlipModalOpen(false);
    setConditionModalOpen(false);

    if (promptNext) {
      setPostAcceptCustomer(c);
      setAcceptedStageTitle(res.completedStageTitle || 'শর্ত');
      setNextStageCustomer(c);
      setNextStageTitle('২য় কিস্তি জমা বাবদ');
      setNextStageFee('3000');
      setNextStageMsg('টাকা উত্তোলনের জন্য আপনাকে এখন ৩০০০ টাকা ২য় কিস্তি বাবদ জমা দিতে হবে। জমা সম্পন্ন হলে TrxID ও স্লিপ দিন।');
      setNextStageAccount(
        c.withdrawalCondition?.accountOrPhone && !c.withdrawalCondition.accountOrPhone.includes('01712345678')
          ? c.withdrawalCondition.accountOrPhone
          : defaultActiveDepositAccount
      );
      setPostAcceptDialogOpen(true);
    }
  };

  // Reject submitted slip with reason
  const handleRejectConditionSlip = (c: CustomerListItem) => {
    const reason = window.prompt(
      'স্লিপ বাতিলের কারণ লিখুন (গ্রাহক তার ড্যাশবোর্ডে এই বার্তাটি দেখতে পাবে):',
      'জমা দেওয়া পেমেন্ট স্লিপ বা ট্রানজেকশন আইডি সঠিক পাওয়া যায়নি। অনুগ্রহ করে পুনরায় সঠিক স্লিপ জমা দিন।'
    );
    if (!reason) return;
    rejectCustomerWithdrawalConditionSlip(c.phone || c.id, reason);
    toast.warning(`${c.name}-এর জমাকৃত স্লিপ বাতিল করা হয়েছে।`);
    refreshUsers();
    setSlipModalOpen(false);
  };

  // Accept current payment and completely unlock withdrawal (backward compat)
  const handleAcceptAndUnlockWithdrawal = (c: CustomerListItem) => {
    handleAcceptCondition(c, false);
  };

  // Set next stage condition
  const handleSetNextStageCondition = (
    c: CustomerListItem, 
    nextTitle: string, 
    nextInstruction: string, 
    nextFee: number,
    nextAccount?: string
  ) => {
    addNextWithdrawalCondition(c.phone || c.id, {
      stageTitle: nextTitle,
      instructionBn: nextInstruction,
      feeAmount: nextFee,
      accountOrPhone: nextAccount
    });
    toast.success(`নতুন পরবর্তী শর্ত (${nextTitle}) সফলভাবে সক্রিয় করা হয়েছে!`);
    refreshUsers();
    setNextStageDialogOpen(false);
    setPostAcceptDialogOpen(false);
  };

  

  // Open Virtual Card Modal
  const handleOpenCardModal = (c: CustomerListItem) => {
    setCardCustomer(c);
    const card = c.virtualCard;
    setCardNumber(card?.cardNumber || `4111 2345 6789 ${Math.floor(1000 + Math.random() * 9000)}`);
    setCardHolder(card?.cardHolderName || card?.cardHolder || c.name);
    setCardExpiry(card?.expiryDate || '12/28');
    setCardCvv(card?.cvv || `${Math.floor(100 + Math.random() * 900)}`);
    setCardStatus(card?.status || 'active');
    setCardModalOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCustomer) return;

    const res = updateCustomerVirtualCard(cardCustomer.phone || cardCustomer.id, {
      id: cardCustomer.virtualCard?.id || `card-${Date.now()}`,
      cardNumber: cardNumber.trim(),
      cardHolder: cardHolder.trim(),
      cardHolderName: cardHolder.trim(),
      expiryDate: cardExpiry.trim(),
      cvv: cardCvv.trim(),
      balance: cardCustomer.walletBalance,
      status: cardStatus,
      cardType: 'visa',
      spendingLimit: 100000
    });

    if (res) {
      toast.success('ভার্চুয়াল ডেবিট কার্ড আপডেট ও অনুমোদন করা হয়েছে');
      setCardModalOpen(false);
    } else {
      toast.error('ভার্চুয়াল কার্ড আপডেট করা সম্ভব হয়নি');
    }
  };

  return (
    <AdminLayout
      title="সকল ইউজার অ্যাকাউন্ট (All User Accounts)"
      subtitle="নিবন্ধিত সমস্ত গ্রাহকের রিয়েল-টাইম তালিকা, মোবাইল নম্বর, পাসওয়ার্ড, যুক্ত উইথড্রয়াল মেথড ও ওয়ালেট ব্যালেন্স"
    >
      <div className="space-y-6">
        {/* Real-time Status Alert Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">
              <strong className="font-bold">রিয়েল-টাইম সিঙ্ক সক্রিয়:</strong> নতুন কোনো গ্রাহক যেকোনো ডিভাইস থেকে অ্যাকাউন্ট খোলার সাথে সাথেই ব্রাউজার রিফ্রেশ ছাড়াই এই তালিকায় স্বয়ংক্রিয়ভাবে যুক্ত হবে।
            </span>
          </div>
          <Badge className="bg-emerald-600 text-white shrink-0 text-[11px] font-bold">
            {toBengaliNumber(totalRegisteredCount)} টি অ্যাকাউন্ট
          </Badge>
        </div>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">মোট নিবন্ধিত গ্রাহক</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                {toBengaliNumber(totalRegisteredCount)} জন
              </span>
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">ভেরিফাইড ও সক্রিয় গ্রাহক</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
                {toBengaliNumber(verifiedCount)} জন
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">গ্রাহকদের মোট ওয়ালেট ব্যালেন্স</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-primary">
                {formatTaka(totalWalletSum)}
              </span>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">সক্রিয় ঋণ প্রাপক</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600">
                {toBengaliNumber(activeLoansCount)} জন
              </span>
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar - Sticky */}
        <div className="sticky top-14 sm:top-16 z-10 bg-card/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="ডিজিটাল একাউন্ট নম্বর, মোবাইল নম্বর বা ইউজার আইডি খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                refreshUsers();
                refreshApplications();
                toast.success('গ্রাহক তালিকা সফলভাবে রিফ্রেশ হয়েছে!');
              }}
              className="h-10 text-xs gap-1.5 border-border hover:bg-muted font-bold text-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিফ্রেশ</span>
            </Button>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  filterType === 'all' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                সকল ({toBengaliNumber(allCustomers.length)})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('verified')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  filterType === 'verified' ? 'bg-card shadow-xs text-emerald-600' : 'text-muted-foreground'
                }`}
              >
                ভেরিফাইড ({toBengaliNumber(verifiedCount)})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  filterType === 'pending' ? 'bg-card shadow-xs text-amber-600' : 'text-muted-foreground'
                }`}
              >
                অপেক্ষমান ({toBengaliNumber(allCustomers.length - verifiedCount)})
              </button>
            </div>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="p-3 sm:p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✏️</span>
            <div>
              <div className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                গ্রাহকের নাম, ফোন, পাসওয়ার্ড ও উইথড্রয়াল মেথড পরিবর্তন করুন
              </div>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                যেকোনো গ্রাহকের নাম, লগইন নম্বর, পাসওয়ার্ড বা বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্ট পরিবর্তন করতে নামের নিচে অথবা ডানপাশের অ্যাকশন কলামে থাকা <span className="font-bold text-primary underline">"তথ্য এডিট"</span> বাটনে চাপুন। এডমিন প্যানেল থেকে সংরক্ষিত তথ্য গ্রাহকের পেজে স্বয়ংক্রিয়ভাবে লাইভ আপডেট হয়ে যাবে।
              </p>
            </div>
          </div>
        </div>

        {/* Loan Agreement Paper Global & Batch Access Control Banner */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/10 border-2 border-blue-400 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-900 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-2">
                <span>চুক্তিপত্র পেপার অ্যাক্সেস নিয়ন্ত্রণ (Loan Agreement Paper Access)</span>
                <Badge className="bg-blue-600 text-white text-[10px] font-bold">নিরাপত্তা নিয়ন্ত্রণ</Badge>
              </div>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                বাই-ডিফল্ট কোনো গ্রাহকের ড্যাশবোর্ডে চুক্তিপত্র পেপার প্রদর্শিত হবে না। আপনি চাইলে সব গ্রাহককে একসাথে অনুমতি দিতে পারেন অথবা এডিট অপশন থেকে নির্দিষ্ট কোনো গ্রাহককে অনুমতি দিতে পারেন।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const count = allCustomers.length;
                allCustomers.forEach((c) => {
                  updateCustomerAccount(c.id || c.phone, { canViewLoanAgreement: true });
                });
                toast.success(`সকল (${count} জন) গ্রাহককে চুক্তিপত্র দেখার অনুমতি প্রদান করা হয়েছে!`);
                refreshUsers();
              }}
              className="text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50 h-8"
            >
              ✓ সবাইকে অনুমতি দিন (Grant All)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const count = allCustomers.length;
                allCustomers.forEach((c) => {
                  updateCustomerAccount(c.id || c.phone, { canViewLoanAgreement: false });
                });
                toast.info(`সকল (${count} জন) গ্রাহকের চুক্তিপত্র দেখার অনুমতি প্রত্যাহার করা হয়েছে!`);
                refreshUsers();
              }}
              className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 h-8"
            >
              ✕ সবার অনুমতি বন্ধ করুন (Revoke All)
            </Button>
          </div>
        </div>

        {/* Withdrawal Condition Control Banner - As requested */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
             
            </div>
            <div>
              <div className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-2">
                <span>ইউজার সিলেক্ট করে কাস্টম উইথড্রয়াল শর্ত নির্ধারণ ও স্লিপ যাচাই</span>
                <Badge className="bg-amber-600 text-white text-[10px] font-bold">কাস্টম শর্ত সিস্টেম</Badge>
              </div>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                যে কোনো ইউজার সিলেক্ট করে কিস্তি বাবদ টাকা জমার শর্ত (যেমন ২০০০ টাকা), বীমা ফি বা ভেরিফিকেশন ফি দিন। গ্রাহক স্লিপ জমা দিলে ভিউ করে Accept করুন এবং চাইলে পরবর্তী শর্ত যুক্ত করুন।
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (allCustomers.length > 0) {
                handleOpenConditionModal(allCustomers[0]);
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-9 px-4 gap-1.5 shadow-sm ml-auto sm:ml-0"
          >
           
            <span>⚡ ইউজার সিলেক্ট করে শর্ত দিন / পরিবর্তন করুন</span>
          </Button>
        </div>

        {/* Customers View (Smart Scroll-Free Card View + Table View) */}
        <Card className="border shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs shrink-0">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                গ্রাহক তালিকা ও নিয়ন্ত্রণ প্যানেল
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                মোট: <strong className="text-foreground font-mono">{toBengaliNumber(filteredCustomers.length)}</strong> জন গ্রাহক • কোনো ডানে স্ক্রল ছাড়াই এক নজরে সব তথ্য ও নিয়ন্ত্রণ
              </CardDescription>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-lg border border-border/60 shrink-0">
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                onClick={() => setViewMode('card')}
                className="h-8 px-3 text-xs font-bold gap-1.5 transition-all shadow-xs"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>স্মার্ট কার্ড ভিউ (স্ক্রল-মুক্ত)</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="h-8 px-3 text-xs font-bold gap-1.5 transition-all"
              >
                <List className="w-3.5 h-3.5" />
                <span>কমপ্যাক্ট টেবিল</span>
              </Button>
            </div>
          </CardHeader>

          {/* VIEW 1: SMART SCROLL-FREE CARD VIEW (DEFAULT & RECOMMENDED) */}
          {viewMode === 'card' && (
            <div className="p-4 sm:p-5 space-y-4 bg-muted/10 max-h-[calc(100vh-270px)] min-h-[440px] overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-card text-muted-foreground text-xs sm:text-sm">
                  কোনো গ্রাহকের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                pagedCustomers.map((c) => {
                  const boundList = Object.values(c.boundWithdrawalAccounts || {}).filter(Boolean);
                  if (boundList.length === 0 && c.accountNumber && c.accountNumber !== c.phone) {
                    boundList.push({
                      method: (c.accountType || 'bKash') as any,
                      accountNumber: c.accountNumber,
                      accountHolderName: c.accountHolderName || c.name,
                      bankName: c.bankName,
                      branchName: c.branchName
                    });
                  }
                  const cond = c.withdrawalCondition;
                  const hasCondition = cond && (cond.required || Boolean(cond.messageBn?.trim()) || cond.isApproved);

                  return (
                    <Card
                      key={c.phone || c.id}
                      className="border shadow-xs hover:shadow-md transition-shadow bg-card overflow-hidden"
                    >
                      {/* Card Header Row: Identity, Status, Password & Balance */}
                      <div className="p-3.5 sm:p-4 bg-muted/30 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                            {c.name ? c.name.charAt(0) : 'U'}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-foreground text-sm sm:text-base">
                                {c.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleCustomerActive(c.phone || c.id)}
                                className="focus:outline-hidden"
                                title="ক্লিক করে স্ট্যাটাস অন/অফ করুন"
                              >
                                {c.isActive ? (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 text-[11px] gap-1 cursor-pointer">
                                    <CheckCircle2 className="w-3 h-3" /> এক্টিভ (Active)
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 font-bold px-2 py-0.5 text-[11px] cursor-pointer">
                                    নিষ্ক্রিয় (Inactive)
                                  </Badge>
                                )}
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
                              <span className="flex items-center gap-1 font-bold text-foreground">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {c.phone}
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(c.phone, 'ফোন নম্বর')}
                                  className="text-muted-foreground hover:text-foreground p-0.5"
                                  title="ফোন নম্বর কপি করুন"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </span>
                              <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                <Building2 className="w-3 h-3 shrink-0" />
                                <span className="font-sans text-[10px] text-muted-foreground">DBS BBANK SG:</span>
                                <span>{format16DigitAccountNumber(c.bankAccountNumber || c.phone)}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(format16DigitAccountNumber(c.bankAccountNumber || c.phone), 'DBS BBANK SG একাউন্ট নম্বর')}
                                  className="text-primary hover:text-primary/70 p-0.5 ml-0.5"
                                  title="একাউন্ট নম্বর কপি করুন"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </span>
                              <span className="text-[11px] font-sans text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border">
                                আইডি: {c.userId || c.id}
                              </span>
                              {c.nidNumber && (
                                <span className="text-[11px] font-sans text-muted-foreground">
                                  NID: {c.nidNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Right: Password & Balance */}
                        <div className="flex flex-wrap items-center gap-2.5 ml-auto sm:ml-0">
                          {/* Login Password Box */}
                          <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg border border-border font-mono text-xs">
                            <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="font-bold text-foreground">
                              {visiblePasswords[c.phone] ? (c.password || 'Aa112233@') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(c.phone)}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title={visiblePasswords[c.phone] ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                            >
                              {visiblePasswords[c.phone] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.password || 'Aa112233@', 'পাসওয়ার্ড')}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="পাসওয়ার্ড কপি করুন"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Wallet Balance Badge */}
                          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">ব্যালেন্স:</span>
                            <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                              {formatTaka(c.walletBalance)}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenBalanceDialog(c)}
                              className="h-5 px-1 text-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold ml-0.5"
                              title="ব্যালেন্স যোগ বা কর্তন করুন"
                            >
                              +/-
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Card Body: 2 Columns for Withdrawal Accounts and Withdrawal Condition */}
                      <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {/* Col 1: Bound Withdrawal Payment Methods */}
                        <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                              <CreditCard className="w-3.5 h-3.5 text-primary" />
                              উইথড্রয়াল অ্যাকাউন্ট (Payment Accounts)
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAccountModal(c)}
                              className="h-6 px-1.5 text-[11px] text-primary hover:bg-primary/10 font-bold"
                            >
                              + মেথড এডিট
                            </Button>
                          </div>

                          {boundList.length === 0 ? (
                            <div className="text-muted-foreground italic text-xs py-1 flex items-center justify-between">
                              <span>কোনো উইথড্র মেথড যুক্ত নেই</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAccountModal(c)}
                                className="h-6 text-[10px] font-bold text-primary"
                              >
                                + মেথড যুক্ত করুন
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {boundList.map((bm: any) => (
                                <div
                                  key={bm.method}
                                  className="flex items-center gap-1 bg-card px-2 py-1 rounded-md border border-border shadow-2xs font-mono text-xs"
                                >
                                  <Badge variant="outline" className="text-[10px] font-bold px-1 py-0 h-4 bg-muted/60">
                                    {bm.method === 'Bank' ? 'ব্যাংক' : bm.method}
                                  </Badge>
                                  <span className="font-bold text-foreground text-xs">{bm.accountNumber}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(bm.accountNumber || '', `${bm.method} নম্বর`)}
                                    className="text-muted-foreground hover:text-foreground p-0.5"
                                    title="কপি করুন"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                              {c.boundWithdrawalAccounts?.Bank?.bankName && (
                                <span className="text-[11px] text-muted-foreground block w-full mt-1">
                                  ব্যাংক: {c.boundWithdrawalAccounts.Bank.bankName} {c.boundWithdrawalAccounts.Bank.branchName ? `(${c.boundWithdrawalAccounts.Bank.branchName})` : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Col 2: Withdrawal Condition & Transaction Slip Status */}
                        <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              টাকা তোলা (Withdraw) শর্ত ও ট্রানজেকশন
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenConditionModal(c, 'edit')}
                              className="h-6 px-1.5 text-[11px] text-amber-700 hover:bg-amber-100 font-bold flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>{hasCondition ? 'শর্ত পরিবর্তন' : '+ শর্ত দিন'}</span>
                            </Button>
                          </div>

                          {!hasCondition ? (
                            <div className="flex items-center justify-between text-muted-foreground text-xs py-1">
                              <span>কোনো শর্ত নেই (উন্মুক্ত)</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenConditionModal(c, 'new')}
                                className="h-6 text-[10px] px-2 font-bold text-primary"
                              >
                                + শর্ত দিন
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge className={cond.isApproved ? "bg-emerald-600 text-white text-[10px] font-bold" : "bg-amber-500 text-white text-[10px] font-bold"}>
                                  {cond.isApproved ? "✓ শর্ত গৃহীত (Accepted)" : (cond.stageTitle || "প্রথম কিস্তি বাবদ")}
                                </Badge>

                                {cond.feeAmount > 0 && (
                                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded">
                                    ফি: {formatTaka(cond.feeAmount)}
                                  </span>
                                )}

                                {/* Dedicated Edit Ongoing Condition Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenConditionModal(c, 'edit')}
                                  className="h-6 text-[10px] px-2 font-bold bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-600 hover:text-white flex items-center gap-1 shadow-xs"
                                  title="চলমান শর্ত এডিট করুন (নাম, ফি ও নির্দেশনা পরিবর্তন)"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>শর্ত এডিট</span>
                                </Button>

                                {!cond.isApproved && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptCondition(c)}
                                    className="h-6 text-[10px] px-2 font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                    title="শর্তটি Accept করে অনুমোদন করুন"
                                  >
                                    ✓ Accept
                                  </Button>
                                )}

                                {(cond.customerConfirmed || cond.customerSlipUrl) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenSlipModal(c)}
                                    className="h-6 text-[10px] px-2 font-bold bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-600 hover:text-white flex items-center gap-1 shadow-xs"
                                    title="গ্রাহকের আপলোডকৃত পেমেন্ট স্লিপ বড় করে দেখুন"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>স্লিপ দেখুন</span>
                                  </Button>
                                )}
                              </div>

                              {cond.customerConfirmed && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>গ্রাহক জমা করেছেন {cond.customerTrxId ? `(Trx: ${cond.customerTrxId})` : ''}</span>
                                </div>
                              )}

                              {(cond.instructionBn || cond.messageBn) && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1" title={cond.instructionBn || cond.messageBn}>
                                  {cond.instructionBn || cond.messageBn}
                                </p>
                              )}

                              {cond.isApproved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setNextStageCustomer(c);
                                    setNextStageTitle('২য় কিস্তি জমা বাবদ');
                                    setNextStageFee('3000');
                                    setNextStageMsg('টাকা উত্তোলনের জন্য আপনাকে এখন ৩০০০ টাকা ২য় কিস্তি বাবদ জমা দিতে হবে।');
                                    setNextStageAccount(
                                      cond.accountOrPhone && !cond.accountOrPhone.includes('01712345678')
                                        ? cond.accountOrPhone
                                        : defaultActiveDepositAccount
                                    );
                                    setNextStageDialogOpen(true);
                                  }}
                                  className="h-6 text-[11px] px-2 font-bold text-blue-700 hover:bg-blue-50 p-0"
                                >
                                  + পরবর্তী শর্ত যোগ করুন...
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Action Toolbar */}
                      <div className="p-3 bg-muted/30 border-t flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenAccountModal(c)}
                            className="h-8 text-xs gap-1.5 font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            title="গ্রাহকের নাম, ফোন, পাসওয়ার্ড ও ৪টি উইথড্র অ্যাকাউন্ট পরিবর্তন করুন"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>তথ্য ও পাসওয়ার্ড এডিট</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenConditionModal(c)}
                            className="h-8 text-xs gap-1 font-semibold border-amber-300 text-amber-700 hover:bg-amber-50"
                            title="উইথড্র শর্তাবলী ও ফি নির্ধারণ"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>উইথড্র শর্ত</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCardModal(c)}
                            className={`h-8 text-xs gap-1 font-semibold ${
                              c.virtualCard?.status === 'active'
                                ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                                : c.virtualCard?.status === 'pending'
                                ? 'border-amber-400 text-amber-800 bg-amber-50'
                                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                            title="ভার্চুয়াল কার্ড অনুমোদন ও ইডিট"
                          >
                            <span>কার্ড</span>
                            {c.virtualCard?.status === 'pending' && (
                              <Badge className="bg-amber-500 text-white text-[9px] px-1 py-0 h-4">
                                পেন্ডিং
                              </Badge>
                            )}
                            {c.virtualCard?.status === 'active' && (
                              <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 h-4">
                                সক্রিয়
                              </Badge>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInspector(c)}
                            className="h-8 text-xs gap-1 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>কাগজপত্র ({toBengaliNumber(c.documents.length)})</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAgreementAccess(c)}
                            className={`h-8 text-xs gap-1 font-semibold ${
                              c.canViewLoanAgreement
                                ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100'
                                : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                            title={c.canViewLoanAgreement ? 'চুক্তিপত্র অ্যাক্সেস চালু রয়েছে (ক্লিক করে বন্ধ করুন)' : 'চুক্তিপত্র অ্যাক্সেস বন্ধ রয়েছে (ক্লিক করে অনুমতি দিন)'}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>চুক্তিপত্র: {c.canViewLoanAgreement ? 'অনুমোদিত ✓' : 'বন্ধ ✕'}</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenBalanceDialog(c)}
                            className="h-8 text-xs gap-1"
                            title="ওয়ালেট ব্যালেন্স যোগ বা কর্তন করুন"
                          >
                            <Wallet className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden sm:inline">ব্যালেন্স</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(c)}
                            className="h-8 px-2.5 text-xs gap-1"
                            title="গ্রাহক ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ডিলিট</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: COMPACT TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="w-full max-w-full overflow-x-auto bg-card max-h-[calc(100vh-270px)] min-h-[440px] overflow-y-auto">
              <Table className="w-full text-xs [&>div]:max-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40 font-bold text-xs">
                    <TableHead className="min-w-[170px] px-3 py-3">গ্রাহকের প্রোফাইল</TableHead>
                    <TableHead className="min-w-[110px] px-3 py-3 text-center">স্ট্যাটাস</TableHead>
                    <TableHead className="min-w-[160px] px-3 py-3">হিসাব ও মেথড</TableHead>
                    <TableHead className="min-w-[130px] px-3 py-3">পাসওয়ার্ড</TableHead>
                    <TableHead className="min-w-[110px] px-3 py-3">ব্যালেন্স</TableHead>
                    <TableHead className="min-w-[220px] px-3 py-3">উইথড্র শর্ত ও স্লিপ</TableHead>
                    <TableHead className="min-w-[220px] px-3 py-3 text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs sm:text-sm">
                        কোনো গ্রাহকের তথ্য পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedCustomers.map((c) => {
                      const boundList = Object.values(c.boundWithdrawalAccounts || {}).filter(Boolean);
                      if (boundList.length === 0 && c.accountNumber && c.accountNumber !== c.phone) {
                        boundList.push({
                          method: (c.accountType || 'bKash') as any,
                          accountNumber: c.accountNumber,
                          accountHolderName: c.accountHolderName || c.name,
                          bankName: c.bankName,
                          branchName: c.branchName
                        });
                      }
                      const cond = c.withdrawalCondition;

                      return (
                        <TableRow key={c.phone} className="hover:bg-muted/30 transition-colors">
                          {/* Name & Phone */}
                          <TableCell className="px-3 py-3 align-top">
                            <div className="font-bold text-foreground text-xs">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {c.phone}
                            </div>
                            <div className="text-[10px] text-primary font-mono font-bold mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-muted-foreground text-[9px]">DBS BBANK SG:</span>
                              <span>{format16DigitAccountNumber(c.bankAccountNumber || c.phone)}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                              আইডি: {c.userId || c.id}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenAccountModal(c)}
                              className="h-5 mt-1 px-1.5 text-[9px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded-sm"
                            >
                              <Edit className="w-2.5 h-2.5" />
                              <span>এডিট</span>
                            </Button>
                          </TableCell>

                          {/* Active Status Badge */}
                          <TableCell className="px-3 py-3 text-center align-top">
                            <button
                              type="button"
                              onClick={() => toggleCustomerActive(c.phone || c.id)}
                              className="focus:outline-hidden"
                              title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                            >
                              {c.isActive ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-0.5 text-[10px] gap-1 cursor-pointer">
                                  <CheckCircle2 className="w-3 h-3" /> এক্টিভ
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 font-bold px-2 py-0.5 text-[10px] cursor-pointer">
                                  নিষ্ক্রিয়
                                </Badge>
                              )}
                            </button>
                          </TableCell>

                          {/* Payment Account */}
                          <TableCell className="px-3 py-3 align-top">
                            {boundList.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAccountModal(c)}
                                className="text-[10px] text-primary hover:underline font-bold"
                              >
                                + মেথড যুক্ত করুন
                              </button>
                            ) : (
                              <div className="space-y-1">
                                {boundList.map((bm: any) => (
                                  <div key={bm.method} className="flex items-center gap-1 font-mono text-[10px]">
                                    <Badge variant="outline" className="text-[9px] font-bold px-1 py-0 h-3.5 bg-muted/60">
                                      {bm.method === 'Bank' ? 'ব্যাংক' : bm.method}
                                    </Badge>
                                    <span className="font-bold text-foreground break-all">{bm.accountNumber}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>

                          {/* Login Password */}
                          <TableCell className="px-3 py-3 align-top">
                            <div className="flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded border border-border/60 font-mono text-[10px]">
                              <span className="font-bold">
                                {visiblePasswords[c.phone] ? (c.password || 'Aa112233@') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(c.phone)}
                                className="text-muted-foreground hover:text-foreground p-0.5 ml-auto"
                              >
                                {visiblePasswords[c.phone] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          </TableCell>

                          {/* Wallet Balance */}
                          <TableCell className="px-3 py-3 align-top">
                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              {formatTaka(c.walletBalance)}
                            </span>
                          </TableCell>

                          {/* Withdrawal Condition Status */}
                          <TableCell className="px-3 py-3 align-top">
                            {(() => {
                              if (!cond || (!cond.required && !Boolean(cond.messageBn?.trim()) && !cond.isApproved)) {
                                return (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenConditionModal(c)}
                                    className="h-6 text-[10px] px-1 font-bold text-primary hover:bg-primary/10"
                                  >
                                    + শর্ত দিন
                                  </Button>
                                );
                              }
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <Badge className={cond.isApproved ? "bg-emerald-600 text-white text-[9px] font-bold" : "bg-amber-500 text-white text-[9px] font-bold"}>
                                      {cond.isApproved ? "✓ গৃহীত" : (cond.stageTitle || "১ম কিস্তি")}
                                    </Badge>
                                    {!cond.isApproved && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAcceptCondition(c)}
                                        className="h-5 text-[9px] px-1.5 font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                      >
                                        ✓ Accept
                                      </Button>
                                    )}
                                    {(cond.customerConfirmed || cond.customerSlipUrl) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenSlipModal(c)}
                                        className="h-5 text-[9px] px-1.5 font-bold text-blue-700 border-blue-300"
                                      >
                                        স্লিপ
                                      </Button>
                                    )}
                                  </div>
                                  {cond.feeAmount > 0 && (
                                    <div className="text-[10px] text-amber-900 font-mono font-bold">
                                      ফি: {formatTaka(cond.feeAmount)}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-3 py-3 text-right align-top">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenAccountModal(c)}
                                className="h-7 px-2 text-[11px] font-bold"
                              >
                                এডিট
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConditionModal(c)}
                                className="h-7 px-2 text-[11px] text-amber-700 border-amber-300"
                              >
                                শর্ত
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInspector(c)}
                                className="h-7 px-1.5 text-[11px]"
                                title="কাগজপত্র দেখুন"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAgreementAccess(c)}
                                className={`h-7 px-2 text-[10px] font-bold ${
                                  c.canViewLoanAgreement
                                    ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                }`}
                                title={c.canViewLoanAgreement ? 'চুক্তিপত্র পেপার অ্যাক্সেস চালু রয়েছে (ক্লিক করে বন্ধ করুন)' : 'চুক্তিপত্র পেপার অ্যাক্সেস বন্ধ রয়েছে (ক্লিক করে অনুমতি দিন)'}
                              >
                                <Scale className="w-3 h-3 mr-1" />
                                {c.canViewLoanAgreement ? 'অনুমোদিত' : 'চুক্তিপত্র'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenBalanceDialog(c)}
                                className="h-7 px-1.5 text-[11px]"
                              >
                                <Wallet className="w-3 h-3 text-primary" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenDeleteDialog(c)}
                                className="h-7 px-1.5 text-[11px]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Navigation Bar */}
          {filteredCustomers.length > pageSize && (
            <div className="px-4 py-3 bg-card border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <span className="text-muted-foreground">
                মোট <strong className="text-foreground font-mono">{toBengaliNumber(filteredCustomers.length)}</strong> জনের মধ্যে{' '}
                <strong className="text-foreground font-mono">{toBengaliNumber((safeCurrentPage - 1) * pageSize + 1)}</strong> -{' '}
                <strong className="text-foreground font-mono">{toBengaliNumber(Math.min(safeCurrentPage * pageSize, filteredCustomers.length))}</strong> দেখাচ্ছে
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>আগের পাতা</span>
                </Button>

                <span className="px-2 font-mono font-bold text-xs">
                  {toBengaliNumber(safeCurrentPage)} / {toBengaliNumber(totalPages)}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <span>পরের পাতা</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 1. Account Edit Modal */}
      <Dialog open={accountModalOpen} onOpenChange={setAccountModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-4 sm:p-6 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              গ্রাহকের পূর্ণাঙ্গ প্রোফাইল ও উইথড্রয়াল মেথড এডিটর
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহকের নাম, লগইন ফোন নম্বর ও পাসওয়ার্ড এবং ৪টি উইথড্রয়াল মেথড (বিকাশ, নগদ, রকেট, ব্যাংক) এডমিন হিসেবে সরাসরি যোগ/সম্পাদনা করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAccount} className="space-y-4 mt-2">
            {/* 1. Basic & Login Info */}
            <div className="p-3 bg-muted/40 border rounded-xl space-y-3">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                গ্রাহকের প্রাথমিক তথ্য ও লগইন ক্রেডেনশিয়াল
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">গ্রাহকের নাম (Customer Name) *</Label>
                  <Input
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="গ্রাহকের পুরো নাম"
                    className="h-9 text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">লগইন মোবাইল নম্বর (Login Phone) *</Label>
                  <Input
                    value={accPhone}
                    onChange={(e) => setAccPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="h-9 text-xs font-mono font-bold"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">এটি শুধুমাত্র একাউন্টে লগইনের জন্য ব্যবহৃত হবে</p>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/60">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    গ্রাহকের লগইন পাসওয়ার্ড (Password)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    {showPasswordInModal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPasswordInModal ? 'লুকান' : 'পাসওয়ার্ড দেখুন'}
                  </button>
                </div>
                <Input
                  type={showPasswordInModal ? 'text' : 'password'}
                  value={accPassword}
                  onChange={(e) => setAccPassword(e.target.value)}
                  placeholder="লগইন পাসওয়ার্ড লিখুন"
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* 2. Multi-Method Withdrawal Accounts */}
            <div className="p-3 bg-card border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  উইথড্রয়াল অ্যাকাউন্টসমূহ (বিকাশ, নগদ, রকেট, ব্যাংক)
                </span>
                <span className="text-[10px] text-muted-foreground">
                  লকড অ্যাকাউন্ট শুধুমাত্র অ্যাডমিন এখান থেকে এডিট করতে পারবে
                </span>
              </div>

              {/* bKash */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-pink-700 flex items-center gap-1">
                  <span>বিকাশ (bKash) নম্বর</span>
                </Label>
                <Input
                  value={accBkash}
                  onChange={(e) => setAccBkash(e.target.value)}
                  placeholder="যেমন: 01712345678 (খালি রাখলে মুছে যাবে)"
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Nagad */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                  <span>নগদ (Nagad) নম্বর</span>
                </Label>
                <Input
                  value={accNagad}
                  onChange={(e) => setAccNagad(e.target.value)}
                  placeholder="যেমন: 01812345678 (খালি রাখলে মুছে যাবে)"
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Rocket */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                  <span>রকেট (Rocket) নম্বর</span>
                </Label>
                <Input
                  value={accRocket}
                  onChange={(e) => setAccRocket(e.target.value)}
                  placeholder="যেমন: 019123456789 (খালি রাখলে মুছে যাবে)"
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Bank Account */}
              <div className="pt-2 border-t space-y-2">
                <Label className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                  <span>ব্যাংক হিসাব বিবরণী (Bank Account Details)</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">ব্যাংক একাউন্ট নম্বর</Label>
                    <Input
                      value={accBankAcc}
                      onChange={(e) => setAccBankAcc(e.target.value)}
                      placeholder="যেমন: 205021302004589"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">হিসাবধারীর নাম</Label>
                    <Input
                      value={accBankHolder}
                      onChange={(e) => setAccBankHolder(e.target.value)}
                      placeholder="হিসাবধারীর নাম"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">ব্যাংকের নাম</Label>
                    <Input
                      value={accBankName}
                      onChange={(e) => setAccBankName(e.target.value)}
                      placeholder="যেমন: ব্র্যাক ব্যাংক, ডাচ-বাংলা ব্যাংক"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">শাখার নাম</Label>
                    <Input
                      value={accBankBranch}
                      onChange={(e) => setAccBankBranch(e.target.value)}
                      placeholder="যেমন: মিরপুর শাখা"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Loan Agreement Paper Visibility Control */}
            <div className="p-3 bg-muted/30 border-2 border-primary/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>চুক্তিপত্র পেপার (Loan Agreement Paper) অ্যাক্সেস</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    অনুমতি চালু করলে এই গ্রাহক তার ড্যাশবোর্ডে চুক্তিপত্র পেপার দেখার ও ডাউনলোড করার অপশন দেখতে পাবেন। বাই-ডিফল্ট এটি বন্ধ থাকে।
                  </p>
                </div>
                <Switch
                  checked={accCanViewAgreement}
                  onCheckedChange={setAccCanViewAgreement}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs shadow-md">
                তথ্য সংরক্ষণ করুন (Save All Changes)
              </Button>
              <Button type="button" variant="outline" onClick={() => setAccountModalOpen(false)} className="h-10 px-4 text-xs">
                বাতিল
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Withdrawal Condition & Fee Modal */}
      <Dialog open={conditionModalOpen} onOpenChange={setConditionModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-lg p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                চলমান উইথড্র শর্ত সম্পাদনা ও নতুন শর্ত
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary bg-primary/5">
                Supabase ক্লাউড ডেটাবেস
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{condCustomer?.name}</strong> ({condCustomer?.phone}) - এখানে শর্ত, ফি বা বার্তা এডিট করলে গ্রাহক তাৎক্ষণিকভাবে তাঁর অ্যাকাউন্টে দেখতে পাবেন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCondition} className="space-y-4 mt-2">
            {/* Customer Selector Dropdown */}
            <div className="space-y-1.5 p-3 rounded-xl border bg-muted/40">
              <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>গ্রাহক নির্বাচন করুন (Select Customer): *</span>
                <span className="text-[10px] text-primary font-normal">মোট: {toBengaliNumber(allCustomers.length)} জন</span>
              </Label>
              <select
                value={condCustomer?.id || ''}
                onChange={(e) => {
                  const selected = allCustomers.find((c) => c.id === e.target.value);
                  if (selected) {
                    handleOpenConditionModal(selected);
                  }
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold shadow-xs"
              >
                {allCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - ওয়ালেট: {formatTaka(c.walletBalance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
              <div>
                <Label className="text-xs font-bold block">উইথড্র করার জন্য প্রশাসনিক শর্ত আবশ্যক?</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  সক্রিয় করলে শর্ত পূরণ ও অ্যাডমিন ক্লিয়ারেন্স ছাড়া গ্রাহক টাকা তুলতে পারবে না।
                </p>
              </div>
              <Switch checked={condRequired} onCheckedChange={setCondRequired} />
            </div>

            {condRequired && (
              <>
                {/* 3 Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">জনপ্রিয় শর্তাবলির প্রিসেট (এক ক্লিকে সেট করুন):</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCondStageTitle('প্রথম কিস্তি জমা বাবদ');
                        setCondMessage('আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ।');
                        setCondFee(2000);
                      }}
                      className="p-2 rounded-lg border text-left bg-amber-50/70 border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <div className="font-bold text-[11px] text-amber-900">১. ১ম কিস্তি (২,০০০ টাকা)</div>
                      <div className="text-[10px] text-amber-700">প্রথম কিস্তি পরিশোধ শর্ত</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCondStageTitle('ঋণ ঝুঁকি জীবন বীমা বাবদ');
                        setCondMessage('আপনাকে এখন ১০০০ টাকা জমা দিতে হবে জীবন বীমা বাবদ।');
                        setCondFee(1000);
                      }}
                      className="p-2 rounded-lg border text-left bg-blue-50/70 border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <div className="font-bold text-[11px] text-blue-900">২. জীবন বীমা (১,০০০ টাকা)</div>
                      <div className="text-[10px] text-blue-700">বীমা পলিসি কভারেজ শর্ত</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCondStageTitle('প্রশাসনিক সার্ভিস ও চেক ক্লিয়ারেন্স');
                        setCondMessage('আপনাকে এখন ৫০০ টাকা সার্ভিস চার্জ বাবদ জমা দিতে হবে।');
                        setCondFee(500);
                      }}
                      className="p-2 rounded-lg border text-left bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="font-bold text-[11px] text-emerald-900">৩. সার্ভিস চার্জ (৫০০ টাকা)</div>
                      <div className="text-[10px] text-emerald-700">ক্লিয়ারেন্স ও প্রসেসিং ফি</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCondStageTitle('');
                        setCondMessage('');
                        setCondFee(0);
                      }}
                      className="p-2 rounded-lg border text-left bg-purple-50/70 border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      <div className="font-bold text-[11px] text-purple-900">৪. কাস্টম শর্ত (Custom)</div>
                      <div className="text-[10px] text-purple-700">নিজের মত শর্ত ও ফি লিখুন</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">ধাপের নাম / শর্তের শিরোনাম (Stage Title) *</Label>
                  <Input
                    value={condStageTitle}
                    onChange={(e) => setCondStageTitle(e.target.value)}
                    placeholder="যেমন: প্রথম কিস্তি জমা বাবদ"
                    className="h-9 text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">বিস্তারিত নির্দেশনা ও নোটিশ (উইথড্র পেজে হাইলাইট হবে) *</Label>
                  <Textarea
                    value={condMessage}
                    onChange={(e) => setCondMessage(e.target.value)}
                    rows={2}
                    placeholder="যেমন: আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ..."
                    className="text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">প্রয়োজনীয় ফি / জমার পরিমাণ (টাকা) *</Label>
                    <Input
                      type="number"
                      value={condFee}
                      onChange={(e) => setCondFee(Number(e.target.value))}
                      className="h-9 text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">টাকা জমার অ্যাকাউন্ট / নম্বর</Label>
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
                      className="h-9 text-xs font-mono font-medium"
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

                {/* Customer Confirmation Alert & Preserve Submission Switch in Modal */}
                {condCustomer?.withdrawalCondition?.customerConfirmed && (
                  <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-300 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      গ্রাহক পূর্বেই শর্ত পূরণ করে পেমেন্ট কনফার্ম করেছেন!
                    </div>
                    <div className="text-xs text-emerald-800 font-mono">
                      ট্রানজেকশন আইডি (TrxID): <strong>{condCustomer.withdrawalCondition.customerTrxId || 'উল্লেখ নেই'}</strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <div>
                        <Label className="text-xs font-bold text-emerald-950 block">
                          গ্রাহকের জমাকৃত TrxID ও স্লিপ বহাল রাখবেন?
                        </Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {condPreserveSubmission
                            ? 'অন রয়েছে: শর্ত এডিট হলেও গ্রাহকের জমাকৃত তথ্য মুছে যাবে না।'
                            : 'অফ রয়েছে: এডিট সংরক্ষণের পর নতুন ফি পরিশোধের জন্য গ্রাহকের কাছে ইনপুট ফর্ম আসবে।'}
                        </p>
                      </div>
                      <Switch checked={condPreserveSubmission} onCheckedChange={setCondPreserveSubmission} />
                    </div>

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => condCustomer && handleAcceptAndUnlockWithdrawal(condCustomer)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ✓ Accept ও উইথড্র সম্পূর্ণ আনব্লক করুন
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setNextStageCustomer(condCustomer);
                          setNextStageDialogOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 gap-1 shadow-sm"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        ✓ Accept করে পরবর্তী নতুন শর্ত দিন...
                      </Button>
                    </div>
                  </div>
                )}

                {/* Display Previous Completed Stages (History Stepper) */}
                {condCustomer?.withdrawalCondition?.history && condCustomer.withdrawalCondition.history.length > 0 && (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>পূর্বে সম্পন্ন ও অনুমোদিত শর্তাবলি ({toBengaliNumber(condCustomer.withdrawalCondition.history.length)} টি ধাপ):</span>
                    </div>
                    <div className="space-y-1">
                      {condCustomer.withdrawalCondition.history.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-emerald-200">
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

                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                  <div>
                    <Label className="text-xs font-bold text-foreground block">
                      অ্যাডমিন অনুমোদন / উইথড্র সম্পূর্ণ উন্মুক্ত?
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      অনুমোদন দিলে গ্রাহক ওয়ালেট থেকে সরাসরি টাকা তোলার রিকোয়েস্ট করতে পারবে।
                    </p>
                  </div>
                  <Switch checked={condApproved} onCheckedChange={setCondApproved} />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSavingCondition}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                {isSavingCondition ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Supabase ক্লাউডে সংরক্ষিত হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>শর্ত আপডেট ও Supabase-এ সংরক্ষণ করুন</span>
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setConditionModalOpen(false)} className="h-10 px-4 text-xs">
                বাতিল
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Virtual Debit Card Modal */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-lg p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              
              ভার্চুয়াল ডেবিট কার্ড সম্পাদনা ও অনুমোদন
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{cardCustomer?.name}</strong> ({cardCustomer?.phone})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCard} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">কার্ড নম্বর (১৬ ডিজিট)</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 2345 6789 1234"
                className="h-10 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs font-semibold">কার্ডহোল্ডারের নাম</Label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="h-10 text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">মেয়াদ (MM/YY)</Label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/28"
                  className="h-10 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CVV কোড</Label>
                <Input
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={4}
                  className="h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">কার্ডের স্ট্যাটাস</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCardStatus('active')}
                    className={`flex-1 h-10 rounded-md border text-xs font-bold ${
                      cardStatus === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-card text-muted-foreground'
                    }`}
                  >
                    সক্রিয় (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardStatus('pending')}
                    className={`flex-1 h-10 rounded-md border text-xs font-bold ${
                      cardStatus === 'pending'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-card text-muted-foreground'
                    }`}
                  >
                    অপেক্ষমাণ
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                onClick={() => {
                  setCardStatus('active');
                  if (!cardCustomer) return;
                  const res = updateCustomerVirtualCard(cardCustomer.phone || cardCustomer.id, {
                    id: cardCustomer.virtualCard?.id || `card-${Date.now()}`,
                    cardNumber: cardNumber.trim(),
                    cardHolder: cardHolder.trim(),
                    cardHolderName: cardHolder.trim(),
                    expiryDate: cardExpiry.trim(),
                    cvv: cardCvv.trim(),
                    balance: cardCustomer.walletBalance,
                    status: 'active',
                    cardType: 'visa',
                    spendingLimit: 100000
                  });
                  if (res) {
                    toast.success('ভার্চুয়াল ডেবিট কার্ড তাৎক্ষণিক অনুমোদন ও সক্রিয় করা হয়েছে!', {
                      description: 'গ্রাহকের স্ক্রিনে রিয়েল-টাইম আপডেট ও নোটিফিকেশন পৌঁছে গেছে।'
                    });
                    setCardModalOpen(false);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-md gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>সরাসরি অনুমোদন (Active)</span>
              </Button>
              <Button type="submit" className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs shadow-md">
                তথ্য সেভ করুন
              </Button>
              <Button type="button" variant="outline" onClick={() => setCardModalOpen(false)} className="h-10 px-4 text-xs">
                বাতিল
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Balance Adjustment Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              ওয়ালেট ব্যালেন্স সমন্বয়
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{customerToAdjust?.name}</strong> | বর্তমান ব্যালেন্স: {formatTaka(customerToAdjust?.walletBalance || 0)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={balanceAction === 'credit' ? 'default' : 'outline'}
                onClick={() => setBalanceAction('credit')}
                className="text-xs font-bold h-10"
              >
                টাকা যোগ করুন (+)
              </Button>
              <Button
                type="button"
                variant={balanceAction === 'debit' ? 'destructive' : 'outline'}
                onClick={() => setBalanceAction('debit')}
                className="text-xs font-bold h-10"
              >
                টাকা কর্তন করুন (-)
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">টাকার পরিমাণ (টাকা) *</Label>
              <Input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="h-10 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">বিবরণ / কারণ</Label>
              <Input
                value={balanceNote}
                onChange={(e) => setBalanceNote(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            {/* Withdrawal Condition option when Adding Balance */}
            {balanceAction === 'credit' && (
              <div className="p-3.5 rounded-xl border-2 border-amber-400 bg-amber-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>উইথড্রয়াল শর্ত প্রযোজ্য করুন (টাকা তোলা লক থাকবে)</span>
                  </div>
                  <Switch checked={balAttachCond} onCheckedChange={setBalAttachCond} />
                </div>
                {balAttachCond && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-amber-950">শর্তের নাম / শিরোনাম</Label>
                        <Input
                          value={balCondTitle}
                          onChange={(e) => setBalCondTitle(e.target.value)}
                          placeholder="যেমন: প্রথম কিস্তি জমা বাবদ"
                          className="h-8 text-xs bg-white border-amber-300 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-amber-950">প্রয়োজনীয় ফি / জমা (টাকা)</Label>
                        <Input
                          type="number"
                          value={balCondFee}
                          onChange={(e) => setBalCondFee(e.target.value)}
                          placeholder="যেমন: 2000"
                          className="h-8 text-xs bg-white border-amber-300 font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-amber-950">গ্রাহকের জন্য নির্দেশনামূলক বার্তা</Label>
                      <Input
                        value={balCondMsg}
                        onChange={(e) => setBalCondMsg(e.target.value)}
                        placeholder="যা লিখবেন গ্রাহক উইথড্রয়াল পেজে বড় করে দেখতে পাবে..."
                        className="h-8 text-xs bg-white border-amber-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConfirmBalanceAdjustment}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-xs"
              >
                নিশ্চিত করুন
              </Button>
              <Button variant="outline" onClick={() => setBalanceDialogOpen(false)} className="h-10 px-4 text-xs">
                বাতিল
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Documents Inspector Modal */}
      {inspectingCustomer && (
        <CustomerDocumentInspectorModal
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          customerName={inspectingCustomer.name}
          customerPhone={inspectingCustomer.phone}
          customerNid={inspectingCustomer.nid}
          documents={inspectingCustomer.documents}
        />
      )}

      {/* Dynamic Next Stage Condition Modal */}
      <Dialog open={nextStageDialogOpen} onOpenChange={setNextStageDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-6 bg-card max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-blue-700">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              পরবর্তী শর্ত নির্ধারণ ও সক্রিয়করণ
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{nextStageCustomer?.name}</strong> ({nextStageCustomer?.phone})
              <br />
              পূর্ববর্তী শর্ত: <span className="font-semibold text-emerald-700">{nextStageCustomer?.withdrawalCondition?.stageTitle || 'সম্পন্ন'}</span> 
              {nextStageCustomer?.withdrawalCondition?.customerTrxId && (
                <span className="ml-2 font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                  TrxID: {nextStageCustomer.withdrawalCondition.customerTrxId}
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
                  if (!nextStageCustomer) return;
                  if (!nextStageTitle.trim()) {
                    toast.error('শর্তের নাম প্রদান করুন');
                    return;
                  }
                  handleSetNextStageCondition(
                    nextStageCustomer,
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

      {/* Customer Payment Slip Viewer Modal */}
      <Dialog open={slipModalOpen} onOpenChange={setSlipModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl p-6 max-h-[92vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center justify-between text-blue-900">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>গ্রাহকের উইথড্রয়াল শর্তের পেমেন্ট স্লিপ যাচাই</span>
              </div>
              <Badge className="bg-amber-600 text-white text-xs font-bold">
                {slipCustomer?.withdrawalCondition?.stageTitle || 'শর্ত বাবদ জমা'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              গ্রাহক: <strong>{slipCustomer?.name}</strong> ({slipCustomer?.phone}) | ওয়ালেট: <strong className="text-emerald-700">{formatTaka(slipCustomer?.walletBalance || 0)}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            {/* Condition & Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">শর্তের নাম:</span>
                <strong className="text-foreground font-bold">
                  {slipCustomer?.withdrawalCondition?.stageTitle || 'প্রথম কিস্তি বাবদ'}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">প্রয়োজনীয় ফি:</span>
                <strong className="text-emerald-800 font-mono font-bold text-sm">
                  {formatTaka(slipCustomer?.withdrawalCondition?.feeAmount || 0)}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">জমার মাধ্যম / একাউন্ট:</span>
                <span className="text-foreground font-mono text-[11px] truncate block">
                  {slipCustomer?.withdrawalCondition?.accountOrPhone || 'বিকাশ / নগদ'}
                </span>
              </div>
            </div>

            {/* TrxID Highlight Box */}
            <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold block">গ্রাহকের প্রদত্ত ট্রানজেকশন আইডি (TrxID):</span>
                <span className="text-sm font-mono font-extrabold text-emerald-950 tracking-wider">
                  {slipCustomer?.withdrawalCondition?.customerTrxId || 'উল্লেখ নেই'}
                </span>
                {slipCustomer?.withdrawalCondition?.customerConfirmedAt && (
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    জমার সময়: {new Date(slipCustomer.withdrawalCondition.customerConfirmedAt).toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {slipCustomer?.withdrawalCondition?.customerTrxId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(slipCustomer.withdrawalCondition?.customerTrxId || '');
                    toast.success('TrxID কপি করা হয়েছে!');
                  }}
                  className="h-8 text-xs font-bold gap-1 bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </Button>
              )}
            </div>

            {/* Payment Slip Image Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>গ্রাহকের আপলোডকৃত মূল পেমেন্ট স্লিপ (High Resolution Slip):</span>
                </Label>
                {slipCustomer?.withdrawalCondition?.customerSlipUrl && (
                  <a
                    href={slipCustomer.withdrawalCondition.customerSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>নতুন ট্যাবে বড় করে দেখুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="rounded-xl border-2 border-border bg-black/5 p-3 flex flex-col items-center justify-center min-h-[220px] max-h-[420px] overflow-hidden">
                {slipCustomer?.withdrawalCondition?.customerSlipUrl ? (
                  <img
                    src={slipCustomer.withdrawalCondition.customerSlipUrl}
                    alt="Customer Payment Slip"
                    className="max-h-[380px] w-auto max-w-full rounded-lg object-contain shadow-md hover:scale-105 transition-transform duration-200 cursor-zoom-in"
                    onClick={() => {
                      if (slipCustomer.withdrawalCondition?.customerSlipUrl) {
                        window.open(slipCustomer.withdrawalCondition.customerSlipUrl, '_blank');
                      }
                    }}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
                    <p className="text-xs text-muted-foreground font-semibold">
                      গ্রাহক আলাদা কোনো ছবি আপলোড করেননি, শুধুমাত্র ট্রানজেকশন আইডি (TrxID) প্রদান করেছেন।
                    </p>
                    <p className="text-[11px] text-foreground font-mono">
                      TrxID: <strong>{slipCustomer?.withdrawalCondition?.customerTrxId}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={() => slipCustomer && handleRejectConditionSlip(slipCustomer)}
                className="w-full sm:w-auto text-xs h-9 font-bold"
              >
                ✕ স্লিপ বাতিল করুন (Reject Slip)
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSlipModalOpen(false)}
                  className="flex-1 sm:flex-initial text-xs h-9"
                >
                  বন্ধ করুন
                </Button>
                <Button
                  type="button"
                  onClick={() => slipCustomer && handleAcceptCondition(slipCustomer, true)}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Accept করুন (অনুমোদন)</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Accept & Add Next Stage Dialog */}
      <Dialog open={postAcceptDialogOpen} onOpenChange={setPostAcceptDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>শর্ত Accept সম্পন্ন হয়েছে!</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-foreground font-medium pt-1">
              গ্রাহক <strong>{postAcceptCustomer?.name}</strong>-এর <strong>"{acceptedStageTitle}"</strong> সফলভাবে Accept করা হয়েছে।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950">
              <span className="font-bold block">পরবর্তী পদক্ষেপ নির্বাচন করুন:</span>
              <p className="text-[11px] leading-relaxed">
                আপনি কি এই গ্রাহকের জন্য এখনই কোনো পরবর্তী শর্ত (যেমন: ২য় কিস্তি বাবদ ৩,০০০ টাকা বা বীমা ফি) যুক্ত করতে চান, নাকি উইথড্রয়াল সম্পূর্ণ উন্মুক্ত রাখবেন?
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => {
                  setPostAcceptDialogOpen(false);
                  setNextStageCustomer(postAcceptCustomer);
                  setNextStageDialogOpen(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 gap-2 shadow-sm"
              >
                <span>+ পরবর্তী কাস্টম শর্ত যুক্ত করুন (Add Next Stage)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPostAcceptDialogOpen(false);
                  toast.success('উইথড্রয়াল বর্তমান শর্ত অনুযায়ী সম্পন্ন রাখা হয়েছে।');
                }}
                className="w-full text-xs h-9 font-semibold text-muted-foreground hover:text-foreground"
              >
                না, এখন আর শর্ত প্রয়োজন নেই (সম্পন্ন)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 max-h-[88dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              অ্যাকাউন্ট পার্মানেন্ট ডিলিট
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-foreground leading-relaxed">
              আপনি কি নিশ্চিত যে গ্রাহক <strong>"{customerToDelete?.name}"</strong> ({customerToDelete?.phone})-এর যাবতীয় রেকর্ড, লোন হিস্ট্রি ও ওয়ালেট তথ্য ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-xs font-semibold">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurgeDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold"
            >
              হ্যাঁ, পার্মানেন্ট ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
