import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  LoanPackage, 
  LoanApplication, 
  LoanApplicationDocument,
  Installment, 
  SiteSettings, 
  CustomerUser,
  WithdrawalRequest,
  WalletTransaction,
  AppNotification,
  LoanApprovalLetter,
  PaymentChannel,
  PaymentMethodConfig,
  DepositRequest,
  CustomerSupportConfig,
  PartnerBankConfig,
  ContractPaper,
  VirtualDebitCard,
  WithdrawalCondition,
  FixedDepositScheme,
  CustomerFixedDeposit,
  CustomerReview,
  GeneratedOfficialDocument,
  StaffIdCard,
  PromotionMediaItem,
  SubAdmin
} from '@/types/loan';
import { loanStorage, normalizePhone } from '@/services/storage';
import { supabaseSync } from '@/services/supabaseSyncService';
import { subAdminService } from '@/services/subAdminService';

interface LoanContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  packages: LoanPackage[];
  refreshPackages: () => void;
  savePackage: (pkg: LoanPackage) => void;
  deletePackage: (id: string) => boolean;
  applications: LoanApplication[];
  refreshApplications: () => void;
  getApplicationById: (id: string) => LoanApplication | undefined;
  submitApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => Promise<LoanApplication>;
  updateApplicationStatus: (
    id: string, 
    status: LoanApplication['status'], 
    notes?: string, 
    extra?: { approvedAmount?: number; rejectedReason?: string }
  ) => Promise<LoanApplication | null>;
  updateApplication: (app: LoanApplication) => void;
  installments: Installment[];
  refreshInstallments: () => void;
  getInstallmentsByLoanId: (loanId: string) => Installment[];
  payInstallment: (
    installmentId: string, 
    details: { paymentMethod: Installment['paymentMethod']; transactionId: string; slipName?: string }
  ) => boolean;
  recordInstallmentAdmin: (
    installmentId: string, 
    status: Installment['status'], 
    details?: { paymentMethod?: Installment['paymentMethod']; transactionId?: string }
  ) => boolean;

  // Customers & Auth
  users: CustomerUser[];
  refreshUsers: () => void;
  currentUser: CustomerUser | null;
  registerUser: (data: { name: string; phone: string; password?: string; email?: string; nidNumber?: string; accountNumber?: string; accountType?: any }) => { success: boolean; user?: CustomerUser; message: string };
  loginUser: (phone: string, password?: string) => Promise<{ success: boolean; user?: CustomerUser; message: string }>;
  logout: () => void;
  
  // Admin Auth (Strict: Molla0506 / Mdroton126799@ & Sub-Admins)
  isAdmin: boolean;
  adminRole: 'super_admin' | 'sub_admin';
  currentSubAdmin: SubAdmin | null;
  loginAdmin: (username: string, password: string, subAdmin?: SubAdmin) => boolean;
  logoutAdmin: () => void;

  // Wallet
  walletBalance: number;
  updateUserWallet: (
    userId: string, 
    amountDelta: number, 
    type: WalletTransaction['type'], 
    title: string, 
    description: string
  ) => { success: boolean; user?: CustomerUser; message: string };
  transactions: WalletTransaction[];
  refreshTransactions: () => void;
  getTransactionsForUser: (userId?: string) => WalletTransaction[];

  // Withdrawals
  withdrawals: WithdrawalRequest[];
  refreshWithdrawals: () => void;
  createWithdrawal: (req: {
    userId: string;
    customerName: string;
    phone: string;
    amount: number;
    method: PaymentChannel;
    accountNumber: string;
    accountHolderName?: string;
    bankName?: string;
    branchName?: string;
  }) => { success: boolean; withdrawal?: WithdrawalRequest; message: string };
  processWithdrawal: (
    id: string,
    status: 'approved' | 'rejected',
    adminNote?: string,
    transactionProof?: string
  ) => void;

  // Notifications
  notifications: AppNotification[];
  refreshNotifications: () => void;
  sendNotification: (data: Omit<AppNotification, 'id' | 'date' | 'read'>) => AppNotification;
  markNotificationRead: (id: string) => void;
  unreadCount: number;

  // Bank Approval Letters
  approvalLetters: LoanApprovalLetter[];
  refreshApprovalLetters: () => void;
  saveApprovalLetter: (letter: Omit<LoanApprovalLetter, 'id'> & { id?: string }) => LoanApprovalLetter;
  getApprovalLetterByLoanId: (loanId: string) => LoanApprovalLetter | undefined;

  // Payment Methods Configuration (bKash, Nagad, etc.)
  paymentMethods: PaymentMethodConfig[];
  refreshPaymentMethods: () => void;
  savePaymentMethod: (method: PaymentMethodConfig) => void;
  deletePaymentMethod: (id: string) => boolean;

  // Deposits
  depositRequests: DepositRequest[];
  refreshDepositRequests: () => void;
  createDepositRequest: (data: Omit<DepositRequest, 'id' | 'status' | 'requestDate'>) => { success: boolean; message: string; deposit?: DepositRequest };
  processDepositRequest: (id: string, status: 'approved' | 'rejected', adminNote?: string) => boolean;

  // Customer Support (Imo, WhatsApp, Telegram, Call)
  customerSupport: CustomerSupportConfig;
  refreshCustomerSupport: () => void;
  updateCustomerSupport: (config: Partial<CustomerSupportConfig>) => void;

  // Partner Banks
  partnerBanks: PartnerBankConfig[];
  refreshPartnerBanks: () => void;
  savePartnerBank: (bank: PartnerBankConfig) => void;
  deletePartnerBank: (id: string) => boolean;

  // Legal Contract Papers
  contractPapers: ContractPaper[];
  refreshContractPapers: () => void;
  getContractPaperByLoanId: (loanId: string) => ContractPaper | undefined;
  saveContractPaper: (paper: Omit<ContractPaper, 'id'> & { id?: string }) => ContractPaper;
  deleteContractPaper: (id: string) => boolean;

  // Fixed Deposit / DPS
  fixedDepositSchemes: FixedDepositScheme[];
  refreshFixedDepositSchemes: () => void;
  saveFixedDepositScheme: (scheme: FixedDepositScheme) => void;
  deleteFixedDepositScheme: (id: string) => boolean;
  customerFixedDeposits: CustomerFixedDeposit[];
  refreshCustomerFixedDeposits: () => void;
  createCustomerFixedDeposit: (deposit: Omit<CustomerFixedDeposit, 'id' | 'createdAt'>) => CustomerFixedDeposit;
  approveCustomerFixedDeposit: (id: string, dailyProfitPercent: number, adminNote?: string) => boolean;
  rejectCustomerFixedDeposit: (id: string, reason?: string) => boolean;
  updateFixedDepositDailyCommission: (id: string, dailyProfitPercent: number) => boolean;
  distributeTodayFixedDepositProfit: () => { count: number; totalDistributed: number };

  // Customer Reviews & Stories
  customerReviews: CustomerReview[];
  refreshCustomerReviews: () => void;
  saveCustomerReview: (review: CustomerReview) => void;
  deleteCustomerReview: (id: string) => boolean;

  // Promotion Media & Happy Customers Gallery
  promotionMedia: PromotionMediaItem[];
  refreshPromotionMedia: () => void;
  savePromotionMedia: (item: PromotionMediaItem) => void;
  deletePromotionMedia: (id: string) => boolean;
  resetPromotionMedia: () => void;

  // Official Documents Generator
  generatedDocuments: GeneratedOfficialDocument[];
  refreshGeneratedDocuments: () => void;
  saveGeneratedDocument: (doc: GeneratedOfficialDocument) => void;
  deleteGeneratedDocument: (id: string) => boolean;

  // Staff ID Cards (NID Style)
  staffIdCards: StaffIdCard[];
  refreshStaffIdCards: () => void;
  saveStaffIdCard: (card: StaffIdCard) => void;
  deleteStaffIdCard: (id: string) => boolean;

  // Customer Account, Withdrawal Conditions & Virtual Card
  updateCustomerAccount: (
    userIdOrPhone: string,
    accountData: {
      phone?: string;
      accountNumber?: string;
      accountType?: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank';
      accountHolderName?: string;
      bankName?: string;
      branchName?: string;
      name?: string;
      nidNumber?: string;
      password?: string;
      boundWithdrawalAccounts?: any;
    }
  ) => CustomerUser | null;
  bindCustomerWithdrawalMethod: (
    userIdOrPhone: string,
    data: {
      method: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
      accountNumber: string;
      bankName?: string;
      branchName?: string;
      accountHolderName?: string;
    }
  ) => { success: boolean; message: string; user?: CustomerUser };
  updateCustomerWithdrawalCondition: (userIdOrPhone: string, condition: WithdrawalCondition) => CustomerUser | null;
  submitWithdrawalConditionPayment: (userIdOrPhone: string, trxId: string, slipUrl?: string) => boolean;
  acceptCustomerWithdrawalCondition: (userIdOrPhone: string, adminNote?: string) => { success: boolean; completedStageTitle: string; historyCount: number };
  rejectCustomerWithdrawalConditionSlip: (userIdOrPhone: string, reason?: string) => boolean;
  addNextWithdrawalCondition: (userIdOrPhone: string, next: { stageTitle: string; instructionBn: string; feeAmount: number; accountOrPhone?: string }) => boolean;
  updateCustomerVirtualCard: (userIdOrPhone: string, card: VirtualDebitCard) => CustomerUser | null;
  toggleCustomerActive: (userIdOrPhone: string) => CustomerUser | null;

  // Customer Permanent Purge & Documents
  purgeCustomerCompletely: (identifier: string) => Promise<{ 
    success: boolean; 
    message: string; 
    deletedCounts: { 
      applications: number; 
      installments: number; 
      deposits: number; 
      withdrawals: number; 
      transactions: number; 
      contracts: number; 
      letters: number; 
      notifications: number; 
    } 
  }>;
  getAllDocumentsForCustomer: (identifier: string) => LoanApplicationDocument[];
  updateDocumentVerification: (docId: string, status: 'verified' | 'rejected', notes?: string) => boolean;

  resetAllData: () => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(loanStorage.getSettings());
  const [packages, setPackages] = useState<LoanPackage[]>(loanStorage.getPackages());
  const [applications, setApplications] = useState<LoanApplication[]>(loanStorage.getApplications());
  const [installments, setInstallments] = useState<Installment[]>(loanStorage.getInstallments());
  
  const [users, setUsers] = useState<CustomerUser[]>(loanStorage.getUsers());
  const [currentUser, setCurrentUserState] = useState<CustomerUser | null>(loanStorage.getCurrentUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (loanStorage.isAdminAuthenticated()) return true;
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem('medo_sub_admin_auth') === 'true' ||
        localStorage.getItem('medo_sub_admin_auth') === 'true'
      );
    }
    return false;
  });
  const [adminRole, setAdminRole] = useState<'super_admin' | 'sub_admin'>(() => {
    if (typeof window !== 'undefined') {
      if (
        sessionStorage.getItem('medo_sub_admin_auth') === 'true' ||
        localStorage.getItem('medo_sub_admin_auth') === 'true'
      ) {
        return 'sub_admin';
      }
    }
    return 'super_admin';
  });
  const [currentSubAdmin, setCurrentSubAdmin] = useState<SubAdmin | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const s = sessionStorage.getItem('medo_sub_admin_data') || localStorage.getItem('medo_sub_admin_data');
        return s ? JSON.parse(s) : null;
      }
    } catch {}
    return null;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(loanStorage.getWalletTransactions());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(loanStorage.getWithdrawals());
  const [notifications, setNotifications] = useState<AppNotification[]>(loanStorage.getNotifications());
  const [approvalLetters, setApprovalLetters] = useState<LoanApprovalLetter[]>(loanStorage.getApprovalLetters());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(loanStorage.getPaymentMethods());
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(loanStorage.getDepositRequests());
  const [customerSupport, setCustomerSupport] = useState<CustomerSupportConfig>(loanStorage.getCustomerSupport());
  const [partnerBanks, setPartnerBanks] = useState<PartnerBankConfig[]>(loanStorage.getPartnerBanks());
  const [contractPapers, setContractPapers] = useState<ContractPaper[]>(loanStorage.getContractPapers());

  const hasHydratedRef = useRef(false);
  const syncTimerRef = useRef<any>(null);

  const [fixedDepositSchemes, setFixedDepositSchemes] = useState<FixedDepositScheme[]>(loanStorage.getFixedDepositSchemes());
  const [customerFixedDeposits, setCustomerFixedDeposits] = useState<CustomerFixedDeposit[]>(loanStorage.getCustomerFixedDeposits());
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(loanStorage.getCustomerReviews());
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedOfficialDocument[]>(loanStorage.getGeneratedDocuments());
  const [staffIdCards, setStaffIdCards] = useState<StaffIdCard[]>(loanStorage.getStaffIdCards());
  const [promotionMedia, setPromotionMedia] = useState<PromotionMediaItem[]>(loanStorage.getPromotionMedia());

  const refreshPromotionMedia = useCallback(() => {
    setPromotionMedia(loanStorage.getPromotionMedia());
  }, []);

  const refreshPackages = useCallback(() => {
    setPackages(loanStorage.getPackages());
  }, []);

  const refreshApplications = useCallback(() => {
    setApplications(loanStorage.getApplications());
  }, []);

  const refreshInstallments = useCallback(() => {
    setInstallments(loanStorage.getInstallments());
  }, []);

  const refreshUsers = useCallback(() => {
    const list = loanStorage.getUsers();
    setUsers(list);
    const cur = loanStorage.getCurrentUser();
    if (cur) {
      const curPhone = normalizePhone(cur.phone || '');
      const refreshedCur = list.find(
        (u) => (cur.id && u.id === cur.id) || (curPhone && normalizePhone(u.phone || '') === curPhone)
      );
      if (refreshedCur) {
        // Only update current user state if critical properties actually changed to avoid triggering cascading re-renders
        const curSerialized = JSON.stringify({
          id: cur.id,
          phone: cur.phone,
          walletBalance: cur.walletBalance,
          status: cur.status,
          withdrawalCondition: cur.withdrawalCondition,
          virtualCard: cur.virtualCard,
          isActive: cur.isActive,
          name: cur.name,
          canViewLoanAgreement: Boolean(cur.canViewLoanAgreement)
        });
        const refSerialized = JSON.stringify({
          id: refreshedCur.id,
          phone: refreshedCur.phone,
          walletBalance: refreshedCur.walletBalance,
          status: refreshedCur.status,
          withdrawalCondition: refreshedCur.withdrawalCondition,
          virtualCard: refreshedCur.virtualCard,
          isActive: refreshedCur.isActive,
          name: refreshedCur.name,
          canViewLoanAgreement: Boolean(refreshedCur.canViewLoanAgreement)
        });

        if (curSerialized !== refSerialized) {
          loanStorage.setCurrentUser(refreshedCur);
          setCurrentUserState(refreshedCur);
        }
      }
    }
  }, []);

  const refreshTransactions = useCallback(() => {
    setTransactions(loanStorage.getWalletTransactions());
  }, []);

  const refreshWithdrawals = useCallback(() => {
    setWithdrawals(loanStorage.getWithdrawals());
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(loanStorage.getNotifications());
  }, []);

  const refreshApprovalLetters = useCallback(() => {
    setApprovalLetters(loanStorage.getApprovalLetters());
  }, []);

  // Stable refs to hold latest sub-admin state without causing effect re-runs
  const adminRoleRef = useRef(adminRole);
  const currentSubAdminRef = useRef(currentSubAdmin);
  useEffect(() => { adminRoleRef.current = adminRole; }, [adminRole]);
  useEffect(() => { currentSubAdminRef.current = currentSubAdmin; }, [currentSubAdmin]);

  // Sync current user and listen for live updates across tabs or admin edits
  // Deps: [] — runs once on mount. Uses refs so handlers always see latest values.
  useEffect(() => {
    const cur = loanStorage.getCurrentUser();
    if (cur) setCurrentUserState(cur);

    // Re-hydrate Admin and Sub-Admin auth on page reload
    const isSubAdmin = typeof window !== 'undefined' && (
      sessionStorage.getItem('medo_sub_admin_auth') === 'true' ||
      localStorage.getItem('medo_sub_admin_auth') === 'true'
    );

    if (isSubAdmin) {
      setIsAdmin(true);
      setAdminRole('sub_admin');
      try {
        const s = sessionStorage.getItem('medo_sub_admin_data') || localStorage.getItem('medo_sub_admin_data');
        if (s) {
          const parsed = JSON.parse(s);
          setCurrentSubAdmin(parsed);
          currentSubAdminRef.current = parsed;
        }
      } catch {}
    } else {
      setIsAdmin(loanStorage.isAdminAuthenticated());
    }

    // Initialize cloud sync and realtime updates from Supabase
    supabaseSync.init((newSettings) => {
      setSettings(newSettings);
    });

    const handleSubAdminSync = async (e?: any) => {
      const activeRole = adminRoleRef.current;
      const activeSub = currentSubAdminRef.current;
      if (activeRole === 'sub_admin' && activeSub) {
        try {
          const fresh = await subAdminService.getAllSubAdmins();
          const me = fresh.find((s: any) => s.id === activeSub.id || s.username === activeSub.username);
          if (me) {
            setCurrentSubAdmin(me);
            currentSubAdminRef.current = me;
            sessionStorage.setItem('medo_sub_admin_data', JSON.stringify(me));
            localStorage.setItem('medo_sub_admin_data', JSON.stringify(me));
          }
        } catch {}
      }
    };
    window.addEventListener('sub_admin_assigned_updated', handleSubAdminSync);
    window.addEventListener('sub_admin_updated', handleSubAdminSync);

    return () => {
      window.removeEventListener('sub_admin_assigned_updated', handleSubAdminSync);
      window.removeEventListener('sub_admin_updated', handleSubAdminSync);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = loanStorage.updateSettings(newSettings);
    setSettings(updated);
    // Push immediately to Supabase so changes sync in real-time to custom domain & all users
    supabaseSync.pushSettings(updated);
  };

  const savePackage = (pkg: LoanPackage) => {
    const updated = loanStorage.savePackage(pkg);
    setPackages([...updated]);
    supabaseSync.pushPackage(pkg);
  };

  const deletePackage = (id: string): boolean => {
    const ok = loanStorage.deletePackage(id);
    if (ok) {
      setPackages(loanStorage.getPackages());
      supabaseSync.deletePackage(id);
    }
    return ok;
  };

  const getApplicationById = (id: string) => {
    return loanStorage.getApplicationById(id);
  };

  const submitApplication = async (appData: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp = await loanStorage.submitApplication(appData);
    refreshApplications();
    return newApp;
  };

  const updateApplicationStatus = async (
    id: string, 
    status: LoanApplication['status'], 
    notes?: string, 
    extra?: { approvedAmount?: number; rejectedReason?: string }
  ) => {
    const res = await loanStorage.updateApplicationStatus(id, status, notes, extra);
    refreshApplications();
    refreshInstallments();
    refreshUsers();
    refreshTransactions();
    return res;
  };

  const updateApplication = (app: LoanApplication) => {
    loanStorage.updateApplication(app);
    refreshApplications();
  };

  const getInstallmentsByLoanId = useCallback((loanId: string) => {
    return loanStorage.getInstallmentsByLoanId(loanId);
  }, []);

  const payInstallment = (
    installmentId: string, 
    details: { paymentMethod: Installment['paymentMethod']; transactionId: string; slipName?: string }
  ) => {
    const res = loanStorage.payInstallment(installmentId, details);
    if (res) {
      refreshInstallments();
      return true;
    }
    return false;
  };

  const recordInstallmentAdmin = (
    installmentId: string, 
    status: Installment['status'], 
    details?: { paymentMethod?: Installment['paymentMethod']; transactionId?: string }
  ) => {
    const res = loanStorage.recordInstallmentAdmin(installmentId, status, details);
    if (res) {
      refreshInstallments();
      return true;
    }
    return false;
  };

  // Auth
  const registerUser = (data: { name: string; phone: string; password?: string; email?: string; nidNumber?: string; accountNumber?: string; accountType?: any }) => {
    const result = loanStorage.registerUser(data);
    if (result.success && result.user) {
      setCurrentUserState(result.user);
      refreshUsers();
      refreshNotifications();
    }
    return result;
  };

  const loginUser = async (phone: string, password?: string) => {
    const result = await loanStorage.loginUserAsync(phone, password);
    if (result.success && result.user) {
      setCurrentUserState(result.user);
      refreshUsers();
    }
    return result;
  };

  const logout = () => {
    loanStorage.logoutUser();
    setCurrentUserState(null);
  };

  // Admin Auth
  const loginAdmin = (username: string, password: string, subAdmin?: SubAdmin): boolean => {
    if (subAdmin) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('medo_sub_admin_auth', 'true');
        sessionStorage.setItem('medo_sub_admin_data', JSON.stringify(subAdmin));
        localStorage.setItem('medo_sub_admin_auth', 'true');
        localStorage.setItem('medo_sub_admin_data', JSON.stringify(subAdmin));
      }
      setIsAdmin(true);
      setAdminRole('sub_admin');
      setCurrentSubAdmin(subAdmin);
      return true;
    }

    const ok = loanStorage.loginAdmin(username, password);
    if (ok) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('medo_sub_admin_auth');
        sessionStorage.removeItem('medo_sub_admin_data');
        localStorage.removeItem('medo_sub_admin_auth');
        localStorage.removeItem('medo_sub_admin_data');
      }
      setIsAdmin(true);
      setAdminRole('super_admin');
      setCurrentSubAdmin(null);
    }
    return ok;
  };

  const logoutAdmin = () => {
    loanStorage.logoutAdmin();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('medo_sub_admin_auth');
      sessionStorage.removeItem('medo_sub_admin_data');
      localStorage.removeItem('medo_sub_admin_auth');
      localStorage.removeItem('medo_sub_admin_data');
    }
    setIsAdmin(false);
    setAdminRole('super_admin');
    setCurrentSubAdmin(null);
  };

  // Wallet
  const updateUserWallet = (
    userId: string, 
    amountDelta: number, 
    type: WalletTransaction['type'], 
    title: string, 
    description: string
  ) => {
    const res = loanStorage.updateUserWallet(userId, amountDelta, type, title, description);
    if (res.success) {
      refreshUsers();
      refreshTransactions();
      refreshNotifications();
    }
    return res;
  };

  const getTransactionsForUser = (userId?: string) => {
    const targetId = userId || currentUser?.id;
    return transactions.filter((t) => !targetId || t.userId === targetId);
  };

  // Withdrawals
  const createWithdrawal = (req: {
    userId: string;
    customerName: string;
    phone: string;
    amount: number;
    method: PaymentChannel;
    accountNumber: string;
    accountHolderName?: string;
    bankName?: string;
    branchName?: string;
  }) => {
    const res = loanStorage.createWithdrawal(req);
    if (res.success) {
      refreshWithdrawals();
      refreshUsers();
      refreshTransactions();
      refreshNotifications();
    }
    return res;
  };

  const processWithdrawal = (
    id: string,
    status: 'approved' | 'rejected',
    adminNote?: string,
    transactionProof?: string
  ) => {
    loanStorage.processWithdrawal(id, status, adminNote, transactionProof);
    refreshWithdrawals();
    refreshUsers();
    refreshTransactions();
    refreshNotifications();
  };

  // Notifications
  const sendNotification = (data: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const res = loanStorage.sendNotification(data);
    refreshNotifications();
    return res;
  };

  const markNotificationRead = (id: string) => {
    loanStorage.markNotificationRead(id);
    refreshNotifications();
  };

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.userId === 'all' || (currentUser && (n.userId === currentUser.id || (n.phone && n.phone === currentUser.phone))))
  ).length;

  // Approval Letters
  const saveApprovalLetter = (letter: Omit<LoanApprovalLetter, 'id'> & { id?: string }) => {
    const res = loanStorage.saveApprovalLetter(letter);
    refreshApprovalLetters();
    refreshNotifications();
    return res;
  };

  const getApprovalLetterByLoanId = (loanId: string) => {
    return loanStorage.getApprovalLetterByLoanId(loanId);
  };

  // Payment Methods
  const refreshPaymentMethods = useCallback(() => {
    setPaymentMethods(loanStorage.getPaymentMethods());
  }, []);

  const savePaymentMethod = (method: PaymentMethodConfig) => {
    loanStorage.savePaymentMethod(method);
    refreshPaymentMethods();
  };

  const deletePaymentMethod = (id: string) => {
    const res = loanStorage.deletePaymentMethod(id);
    refreshPaymentMethods();
    return res;
  };

  // Deposit Requests
  const refreshDepositRequests = useCallback(() => {
    setDepositRequests(loanStorage.getDepositRequests());
  }, []);

  const createDepositRequest = (data: Omit<DepositRequest, 'id' | 'status' | 'requestDate'>) => {
    const res = loanStorage.createDepositRequest(data);
    if (res.success) {
      refreshDepositRequests();
      refreshNotifications();
    }
    return res;
  };

  const processDepositRequest = (id: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const res = loanStorage.processDepositRequest(id, status, adminNote);
    if (res) {
      refreshDepositRequests();
      refreshUsers();
      refreshTransactions();
      refreshNotifications();
    }
    return res;
  };

  // Customer Support
  const refreshCustomerSupport = useCallback(() => {
    setCustomerSupport(loanStorage.getCustomerSupport());
  }, []);

  const updateCustomerSupport = (config: Partial<CustomerSupportConfig>) => {
    const updated = loanStorage.updateCustomerSupport(config);
    setCustomerSupport(updated);
  };

  // Partner Banks
  const refreshPartnerBanks = useCallback(() => {
    setPartnerBanks(loanStorage.getPartnerBanks());
  }, []);

  const savePartnerBank = (bank: PartnerBankConfig) => {
    loanStorage.savePartnerBank(bank);
    refreshPartnerBanks();
  };

  const deletePartnerBank = (id: string) => {
    const res = loanStorage.deletePartnerBank(id);
    refreshPartnerBanks();
    return res;
  };

  // Legal Contract Papers
  const refreshContractPapers = useCallback(() => {
    setContractPapers(loanStorage.getContractPapers());
  }, []);

  const getContractPaperByLoanId = (loanId: string) => {
    return loanStorage.getContractPaperByLoanId(loanId);
  };

  const saveContractPaper = (paper: Omit<ContractPaper, 'id'> & { id?: string }) => {
    const res = loanStorage.saveContractPaper(paper);
    refreshContractPapers();
    refreshNotifications();
    // Cloud sync to Supabase site_contracts table (zero localStorage dependency)
    void supabaseSync.syncContractToCloud(res);
    return res;
  };

  const deleteContractPaper = (id: string) => {
    const res = loanStorage.deleteContractPaper(id);
    refreshContractPapers();
    // Delete from Supabase
    void supabaseSync.deleteContractFromCloud(id);
    return res;
  };

  // Fixed Deposit (DPS)
  const refreshFixedDepositSchemes = useCallback(() => {
    setFixedDepositSchemes(loanStorage.getFixedDepositSchemes());
  }, []);

  const saveFixedDepositScheme = (scheme: FixedDepositScheme) => {
    loanStorage.saveFixedDepositScheme(scheme);
    refreshFixedDepositSchemes();
  };

  const deleteFixedDepositScheme = (id: string) => {
    const res = loanStorage.deleteFixedDepositScheme(id);
    refreshFixedDepositSchemes();
    return res;
  };

  const refreshCustomerFixedDeposits = useCallback(() => {
    setCustomerFixedDeposits(loanStorage.getCustomerFixedDeposits());
  }, []);

  const createCustomerFixedDeposit = (deposit: Omit<CustomerFixedDeposit, 'id' | 'createdAt'>) => {
    const res = loanStorage.createCustomerFixedDeposit(deposit);
    refreshCustomerFixedDeposits();
    refreshTransactions();
    refreshUsers();
    refreshNotifications();
    return res;
  };

  const approveCustomerFixedDeposit = (id: string, dailyProfitPercent: number, adminNote?: string) => {
    const res = loanStorage.approveCustomerFixedDeposit(id, dailyProfitPercent, adminNote);
    refreshCustomerFixedDeposits();
    refreshTransactions();
    refreshUsers();
    refreshNotifications();
    return res;
  };

  const rejectCustomerFixedDeposit = (id: string, reason?: string) => {
    const res = loanStorage.rejectCustomerFixedDeposit(id, reason);
    refreshCustomerFixedDeposits();
    refreshTransactions();
    refreshUsers();
    refreshNotifications();
    return res;
  };

  const updateFixedDepositDailyCommission = (id: string, dailyProfitPercent: number) => {
    const res = loanStorage.updateFixedDepositDailyCommission(id, dailyProfitPercent);
    refreshCustomerFixedDeposits();
    return res;
  };

  const distributeTodayFixedDepositProfit = () => {
    const res = loanStorage.distributeTodayFixedDepositProfit();
    refreshCustomerFixedDeposits();
    refreshTransactions();
    refreshUsers();
    return res;
  };

  // Customer Reviews
  const refreshCustomerReviews = useCallback(() => {
    setCustomerReviews(loanStorage.getCustomerReviews());
  }, []);

  const saveCustomerReview = (review: CustomerReview) => {
    loanStorage.saveCustomerReview(review);
    refreshCustomerReviews();
  };

  const deleteCustomerReview = (id: string) => {
    const res = loanStorage.deleteCustomerReview(id);
    refreshCustomerReviews();
    return res;
  };

  const savePromotionMedia = (item: PromotionMediaItem) => {
    loanStorage.savePromotionMedia(item);
    refreshPromotionMedia();
  };

  const deletePromotionMedia = (id: string) => {
    const res = loanStorage.deletePromotionMedia(id);
    refreshPromotionMedia();
    return res;
  };

  const resetPromotionMedia = () => {
    loanStorage.resetPromotionMedia();
    refreshPromotionMedia();
  };

  // Official Documents Generator
  const refreshGeneratedDocuments = useCallback(() => {
    setGeneratedDocuments(loanStorage.getGeneratedDocuments());
  }, []);

  const saveGeneratedDocument = (doc: GeneratedOfficialDocument) => {
    loanStorage.saveGeneratedDocument(doc);
    refreshGeneratedDocuments();
  };

  const deleteGeneratedDocument = (id: string) => {
    const res = loanStorage.deleteGeneratedDocument(id);
    refreshGeneratedDocuments();
    return res;
  };

  // Staff ID Cards (NID Style)
  const refreshStaffIdCards = useCallback(() => {
    setStaffIdCards(loanStorage.getStaffIdCards());
  }, []);

  const saveStaffIdCard = (card: StaffIdCard) => {
    loanStorage.saveStaffIdCard(card);
    refreshStaffIdCards();
    supabaseSync.pushStaffCard(card);
  };

  const deleteStaffIdCard = (id: string) => {
    const res = loanStorage.deleteStaffIdCard(id);
    refreshStaffIdCards();
    supabaseSync.deleteStaffCard(id);
    return res.length < staffIdCards.length;
  };

  // Customer Account, Virtual Card & Withdrawal Condition
  const updateCustomerAccount = (userIdOrPhone: string, accountData: any) => {
    const res = loanStorage.updateCustomerAccount(userIdOrPhone, accountData);
    refreshUsers();
    refreshApplications();
    const freshCur = loanStorage.getCurrentUser();
    if (freshCur) {
      setCurrentUserState(freshCur);
    }
    return res;
  };

  const bindCustomerWithdrawalMethod = (
    userIdOrPhone: string,
    data: {
      method: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
      accountNumber: string;
      bankName?: string;
      branchName?: string;
      accountHolderName?: string;
    }
  ) => {
    const res = loanStorage.bindCustomerWithdrawalMethod(userIdOrPhone, data);
    refreshUsers();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const updateCustomerWithdrawalCondition = (userIdOrPhone: string, condition: WithdrawalCondition) => {
    const res = loanStorage.updateCustomerWithdrawalCondition(userIdOrPhone, condition);
    refreshUsers();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const submitWithdrawalConditionPayment = (userIdOrPhone: string, trxId: string, slipUrl?: string) => {
    const res = loanStorage.submitWithdrawalConditionPayment(userIdOrPhone, trxId, slipUrl);
    refreshUsers();
    refreshNotifications();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const acceptCustomerWithdrawalCondition = (userIdOrPhone: string, adminNote?: string) => {
    const res = loanStorage.acceptCustomerWithdrawalCondition(userIdOrPhone, adminNote);
    refreshUsers();
    refreshNotifications();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const rejectCustomerWithdrawalConditionSlip = (userIdOrPhone: string, reason?: string) => {
    const res = loanStorage.rejectCustomerWithdrawalConditionSlip(userIdOrPhone, reason);
    refreshUsers();
    refreshNotifications();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const addNextWithdrawalCondition = (
    userIdOrPhone: string,
    next: { stageTitle: string; instructionBn: string; feeAmount: number; accountOrPhone?: string }
  ) => {
    const res = loanStorage.addNextWithdrawalCondition(userIdOrPhone, next);
    refreshUsers();
    refreshNotifications();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  const updateCustomerVirtualCard = (userIdOrPhone: string, card: VirtualDebitCard) => {
    const res = loanStorage.updateCustomerVirtualCard(userIdOrPhone, card, true);
    refreshUsers();
    const current = loanStorage.getCurrentUser();
    if (current && (current.id === userIdOrPhone || current.phone === userIdOrPhone)) {
      setCurrentUserState(loanStorage.getCurrentUser());
    }
    return res;
  };

  const toggleCustomerActive = (userIdOrPhone: string) => {
    const res = loanStorage.toggleCustomerActive(userIdOrPhone);
    refreshUsers();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  // Permanent Purge Customer & History
  const purgeCustomerCompletely = (identifier: string) => {
    const res = loanStorage.purgeCustomerCompletely(identifier);
    refreshUsers();
    refreshApplications();
    refreshInstallments();
    refreshDepositRequests();
    refreshWithdrawals();
    refreshCustomerFixedDeposits();
    refreshTransactions();
    refreshApprovalLetters();
    refreshContractPapers();
    refreshNotifications();
    setCurrentUserState(loanStorage.getCurrentUser());
    return res;
  };

  // Optimized, non-blocking cloud hydration and debounced live synchronization
  useEffect(() => {
    // 1. Debounced state refresh to avoid UI freezes on multiple rapid events
    // 500ms debounce: collapses burst events (hydration, realtime) into one single batch refresh
    const debouncedSync = () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        // Skip background execution when page is hidden
        if (typeof document !== 'undefined' && document.hidden) return;
        refreshUsers();
        refreshApplications();
        refreshInstallments();
        refreshPackages();
        refreshWithdrawals();
        refreshDepositRequests();
        refreshStaffIdCards();
        refreshPromotionMedia();
        refreshPaymentMethods();
        refreshFixedDepositSchemes();
        refreshCustomerFixedDeposits();
        refreshCustomerSupport();
        refreshPartnerBanks();
        setSettings(loanStorage.getSettings());
      }, 500);
    };

    // 2. Perform initial hydration from Supabase in 2 non-blocking staggered batches
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;

      const runHydration = async () => {
        try {
          // Batch 1: critical customer, loan & settings state
          const [purgedRes, usersRes, appsRes, settingsRes, methodsRes, pkgsRes] = await Promise.allSettled([
            supabaseSync.fetchPurgedUsersFromCloud(),
            supabaseSync.fetchUsersFromCloud(),
            supabaseSync.fetchApplicationsFromCloud(),
            supabaseSync.fetchSettingsFromCloud(),
            supabaseSync.fetchPaymentMethodsFromCloud(),
            supabaseSync.fetchPackagesFromCloud()
          ]);

          if (purgedRes.status === 'fulfilled' && purgedRes.value?.length) {
            purgedRes.value.forEach((id: string) => loanStorage.addPurgedUser(id));
          }

          if (usersRes.status === 'fulfilled' && usersRes.value?.length) {
            const purgedList = loanStorage.getPurgedUsers();
            const purgedSet = new Set(purgedList.map((p) => normalizePhone(p)));
            purgedList.forEach((p) => purgedSet.add(p));
            const activeUsers = usersRes.value.filter(
              (u) => !purgedSet.has(u.id) && !purgedSet.has(u.phone) && !purgedSet.has(normalizePhone(u.phone))
            );
            loanStorage.saveUsersFromCloud(activeUsers, false);
          }

          if (appsRes.status === 'fulfilled' && appsRes.value?.length) {
            loanStorage.saveApplicationsFromCloud(appsRes.value);
          }

          if (settingsRes.status === 'fulfilled' && settingsRes.value) {
            loanStorage.updateSettings(settingsRes.value, false);
            setSettings(settingsRes.value);
          }

          if (methodsRes.status === 'fulfilled' && methodsRes.value?.length) {
            loanStorage.savePaymentMethodsFromCloud(methodsRes.value);
          }

          if (pkgsRes.status === 'fulfilled' && pkgsRes.value?.length) {
            loanStorage.savePackagesFromCloud(pkgsRes.value);
          }

          debouncedSync();

          // Batch 2: secondary financial and media records
          const [depsRes, wdsRes, dpsRes, supportRes, banksRes, mediaRes, contractsRes] = await Promise.allSettled([
            supabaseSync.fetchDepositsFromCloud(),
            supabaseSync.fetchWithdrawalsFromCloud(),
            supabaseSync.fetchDpsSchemesFromCloud(),
            supabaseSync.fetchCustomerSupportFromCloud(),
            supabaseSync.fetchPartnerBanksFromCloud(),
            supabaseSync.fetchPromotionMediaFromCloud(),
            supabaseSync.fetchContractsFromCloud()
          ]);

          if (depsRes.status === 'fulfilled' && depsRes.value?.length) {
            loanStorage.saveDepositsFromCloud(depsRes.value);
          }
          if (wdsRes.status === 'fulfilled' && wdsRes.value?.length) {
            loanStorage.saveWithdrawalsFromCloud(wdsRes.value);
          }
          if (dpsRes.status === 'fulfilled' && dpsRes.value?.length) {
            loanStorage.saveDpsSchemesFromCloud(dpsRes.value);
          }
          if (supportRes.status === 'fulfilled' && supportRes.value) {
            loanStorage.updateCustomerSupport(supportRes.value, false);
            setCustomerSupport(supportRes.value);
          }
          if (banksRes.status === 'fulfilled' && banksRes.value?.length) {
            setPartnerBanks(banksRes.value);
          }
          if (mediaRes.status === 'fulfilled' && mediaRes.value?.length) {
            setPromotionMedia(mediaRes.value);
          }
          if (contractsRes.status === 'fulfilled' && contractsRes.value?.length) {
            contractsRes.value.forEach((c) => loanStorage.saveContractPaper(c));
            setContractPapers(loanStorage.getContractPapers());
          }

          debouncedSync();
        } catch (err) {
          console.warn('Initial cloud hydration note:', err);
        }
      };

      void runHydration();

      // Initialize Supabase Cloud Realtime & BroadcastChannel Listeners once
      supabaseSync.initRealtimeListeners({
        onUserRegistered: (incomingUser) => {
          if (incomingUser) {
            loanStorage.mergeUserFromCloud(incomingUser, false);
            const current = loanStorage.getCurrentUser();
            if (current && (current.id === incomingUser.id || normalizePhone(current.phone || '') === normalizePhone(incomingUser.phone || ''))) {
              loanStorage.setCurrentUser(incomingUser);
              setCurrentUserState(incomingUser);
            }
          }
          debouncedSync();
        },
        onApplicationSubmitted: (incomingApp) => {
          if (incomingApp) {
            loanStorage.saveApplicationsFromCloud([incomingApp]);
          }
          debouncedSync();
        },
        onDepositSubmitted: (incomingDep) => {
          if (incomingDep) {
            loanStorage.saveDepositsFromCloud([incomingDep]);
          }
          debouncedSync();
        },
        onWithdrawalSubmitted: (incomingWd) => {
          if (incomingWd) {
            loanStorage.saveWithdrawalsFromCloud([incomingWd]);
          }
          debouncedSync();
        },
        onConditionUpdated: () => {
          debouncedSync();
        },
        onSettingsUpdated: (newSettings) => {
          if (newSettings) {
            loanStorage.updateSettings(newSettings, false);
            setSettings(newSettings);
          } else {
            setSettings(loanStorage.getSettings());
          }
        },
        onPaymentMethodUpdated: (pm) => {
          if (pm) {
            if (pm._deleted) {
              loanStorage.deletePaymentMethod(pm.id, false);
            } else {
              loanStorage.savePaymentMethod(pm, false);
            }
            debouncedSync();
          }
        },
        onDpsSchemeUpdated: (scheme) => {
          if (scheme) {
            if (scheme._deleted) {
              loanStorage.deleteFixedDepositScheme(scheme.id, false);
            } else {
              loanStorage.saveFixedDepositScheme(scheme, false);
            }
            debouncedSync();
          }
        },
        onCustomerFixedDepositUpdated: (deposit) => {
          if (deposit) {
            loanStorage.saveCustomerFixedDepositsFromCloud([deposit]);
            debouncedSync();
          }
        },
        onPackageUpdated: (pkg) => {
          if (pkg) {
            if (pkg._deleted) {
              loanStorage.deletePackage(pkg.id, false);
            } else {
              loanStorage.savePackage(pkg, false);
            }
            debouncedSync();
          }
        },
        onCustomerSupportUpdated: (support) => {
          if (support) {
            loanStorage.updateCustomerSupport(support, false);
            setCustomerSupport(support);
          }
        },
        onPartnerBanksUpdated: (banks) => {
          if (banks && Array.isArray(banks)) {
            setPartnerBanks(banks);
          }
        },
        onCustomerPurged: () => {
          debouncedSync();
        },
        onMediaUpdated: (item) => {
          if (item) {
            if ((item as any)._deleted) {
              loanStorage.deletePromotionMedia(item.id, false);
            } else {
              loanStorage.savePromotionMedia(item);
            }
          }
          debouncedSync();
        },
        onContractUpdated: (contract) => {
          if (contract) {
            if (contract._deleted) {
              loanStorage.deleteContractPaper(contract.id);
            } else {
              // Pass false so receiving a realtime contract from cloud doesn't bounce back and re-trigger sync
              loanStorage.saveContractPaper(contract, false);
            }
            setContractPapers(loanStorage.getContractPapers());
          }
        },
        onVirtualCardUpdated: (card) => {
          if (card) {
            const current = loanStorage.getCurrentUser();
            if (current && (current.phone === card.user_phone || current.id === card.user_phone)) {
              const updatedCard: any = {
                id: card.id,
                cardNumber: card.card_number || '•••• •••• •••• ••••',
                cardHolder: card.cardholder_name || current.name,
                cardHolderName: card.cardholder_name || current.name,
                expiryDate: card.expiry_date || '12/29',
                cvv: card.cvv || '842',
                balance: card.balance || 0,
                status: card.status === 'sent' || card.status === 'active' ? 'active' : 'pending',
                cardType: 'visa',
                spendingLimit: card.spending_limit || 100000
              };
              const updatedUser = {
                ...current,
                virtualCard: updatedCard
              };
              loanStorage.setCurrentUser(updatedUser);
              setCurrentUserState(updatedUser);
            }
            debouncedSync();
          }
        }
      });
    }

    // NOTE: 'storage' event is intentionally NOT listened to here.
    // The native 'storage' event only fires for cross-tab changes from *other* tabs,
    // never for same-tab writes, so it was only useful when a fake synthetic storage
    // dispatch was present (which has been removed). Supabase Realtime + BroadcastChannel
    // handle cross-device and cross-tab sync respectively.
    window.addEventListener('loan_data_updated', debouncedSync);
    window.addEventListener('loan_user_registered', debouncedSync);
    window.addEventListener('app_data_updated', debouncedSync);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      window.removeEventListener('loan_data_updated', debouncedSync);
      window.removeEventListener('loan_user_registered', debouncedSync);
      window.removeEventListener('app_data_updated', debouncedSync);
    };
  }, [
    refreshUsers,
    refreshApplications,
    refreshInstallments,
    refreshPackages,
    refreshWithdrawals,
    refreshDepositRequests,
    refreshPromotionMedia,
    refreshStaffIdCards,
    refreshPaymentMethods,
    refreshFixedDepositSchemes,
    refreshCustomerFixedDeposits,
    refreshCustomerSupport,
    refreshPartnerBanks
  ]);

  const getAllDocumentsForCustomer = (identifier: string) => {
    return loanStorage.getAllDocumentsForCustomer(identifier);
  };

  const updateDocumentVerification = (docId: string, status: 'verified' | 'rejected', notes?: string) => {
    const res = loanStorage.updateDocumentVerification(docId, status, notes);
    refreshApplications();
    return res;
  };

  const resetAllData = () => {
    loanStorage.resetAllData();
    setSettings(loanStorage.getSettings());
    setPackages(loanStorage.getPackages());
    setApplications(loanStorage.getApplications());
    setInstallments(loanStorage.getInstallments());
    setUsers(loanStorage.getUsers());
    setCurrentUserState(loanStorage.getCurrentUser());
    setIsAdmin(loanStorage.isAdminAuthenticated());
    setTransactions(loanStorage.getWalletTransactions());
    setWithdrawals(loanStorage.getWithdrawals());
    setNotifications(loanStorage.getNotifications());
    setApprovalLetters(loanStorage.getApprovalLetters());
    setPaymentMethods(loanStorage.getPaymentMethods());
    setDepositRequests(loanStorage.getDepositRequests());
    setCustomerSupport(loanStorage.getCustomerSupport());
    setPartnerBanks(loanStorage.getPartnerBanks());
    setContractPapers(loanStorage.getContractPapers());
    setStaffIdCards(loanStorage.getStaffIdCards());
    setFixedDepositSchemes(loanStorage.getFixedDepositSchemes());
    setCustomerFixedDeposits(loanStorage.getCustomerFixedDeposits());
    setCustomerReviews(loanStorage.getCustomerReviews());
    setGeneratedDocuments(loanStorage.getGeneratedDocuments());
    setPromotionMedia(loanStorage.getPromotionMedia());
  };

  const walletBalance = currentUser?.walletBalance || 0;

  return (
    <LoanContext.Provider
      value={{
        settings,
        updateSettings,
        packages,
        refreshPackages,
        savePackage,
        deletePackage,
        applications,
        refreshApplications,
        getApplicationById,
        submitApplication,
        updateApplicationStatus,
        updateApplication,
        installments,
        refreshInstallments,
        getInstallmentsByLoanId,
        payInstallment,
        recordInstallmentAdmin,

        users,
        refreshUsers,
        currentUser,
        registerUser,
        loginUser,
        logout,

        isAdmin,
        adminRole,
        currentSubAdmin,
        loginAdmin,
        logoutAdmin,

        walletBalance,
        updateUserWallet,
        transactions,
        refreshTransactions,
        getTransactionsForUser,

        withdrawals,
        refreshWithdrawals,
        createWithdrawal,
        processWithdrawal,

        notifications,
        refreshNotifications,
        sendNotification,
        markNotificationRead,
        unreadCount,

        approvalLetters,
        refreshApprovalLetters,
        saveApprovalLetter,
        getApprovalLetterByLoanId,

        paymentMethods,
        refreshPaymentMethods,
        savePaymentMethod,
        deletePaymentMethod,

        depositRequests,
        refreshDepositRequests,
        createDepositRequest,
        processDepositRequest,

        customerSupport,
        refreshCustomerSupport,
        updateCustomerSupport,

        partnerBanks,
        refreshPartnerBanks,
        savePartnerBank,
        deletePartnerBank,

        contractPapers,
        refreshContractPapers,
        getContractPaperByLoanId,
        saveContractPaper,
        deleteContractPaper,

        fixedDepositSchemes,
        refreshFixedDepositSchemes,
        saveFixedDepositScheme,
        deleteFixedDepositScheme,
        customerFixedDeposits,
        refreshCustomerFixedDeposits,
        createCustomerFixedDeposit,
        approveCustomerFixedDeposit,
        rejectCustomerFixedDeposit,
        updateFixedDepositDailyCommission,
        distributeTodayFixedDepositProfit,
        customerReviews,
        refreshCustomerReviews,
        saveCustomerReview,
        deleteCustomerReview,
        promotionMedia,
        refreshPromotionMedia,
        savePromotionMedia,
        deletePromotionMedia,
        resetPromotionMedia,
        generatedDocuments,
        refreshGeneratedDocuments,
        saveGeneratedDocument,
        deleteGeneratedDocument,
        staffIdCards,
        refreshStaffIdCards,
        saveStaffIdCard,
        deleteStaffIdCard,
        updateCustomerAccount,
        bindCustomerWithdrawalMethod,
        updateCustomerWithdrawalCondition,
        submitWithdrawalConditionPayment,
        acceptCustomerWithdrawalCondition,
        rejectCustomerWithdrawalConditionSlip,
        addNextWithdrawalCondition,
        updateCustomerVirtualCard,
        toggleCustomerActive,

        purgeCustomerCompletely,
        getAllDocumentsForCustomer,
        updateDocumentVerification,

        resetAllData
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    // If during Vite HMR reload or transient unmount context is briefly unavailable, return safe fallback instead of hard crash
    console.warn('useLoan accessed outside LoanProvider (possible HMR reload)');
    return {} as any;
  }
  return context;
};