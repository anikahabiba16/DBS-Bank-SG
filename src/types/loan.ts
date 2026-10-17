export type LoanCategory = 'personal' | 'business' | 'education' | 'emergency' | 'agriculture';

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'disbursed' | 'rejected' | 'completed';

export interface LoanPackage {
  id: string;
  category: LoanCategory;
  nameBn: string;
  nameEn: string;
  taglineBn?: string;
  minAmount: number;
  maxAmount: number;
  defaultRate: number; // Annual %
  interestRate?: number;
  minDurationMonths: number;
  maxDurationMonths: number;
  minMonths?: number;
  maxMonths?: number;
  processingFeePercent: number;
  descriptionBn?: string;
  featuresBn: string[];
  eligibilityBn?: string[];
  requiredDocsBn?: string[];
  requiredDocuments?: string[];
  iconName?: string;
  badgeBn?: string;
  tag?: string;
  active: boolean;
}

export interface LoanApplicationDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category?: 'nid_front' | 'nid_back' | 'selfie' | 'utility_bill' | 'bank_statement' | 'income_proof' | 'signature' | 'nominee_doc' | 'deposit_slip' | 'other';
  previewUrl?: string;
  verified?: boolean;
  status?: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
}

export interface LoanApplication {
  id: string; // e.g. LN-2026-1001
  userId?: string;
  applicantName: string;
  phone: string;
  email: string;
  nidNumber: string;
  dob: string;
  gender: string;
  presentAddress: string;
  permanentAddress: string;
  profession: string;
  monthlyIncome: number;
  bankName?: string;
  bankAccountNumber?: string;
  
  // Loan specifics
  packageId: string;
  packageName: string;
  category: LoanCategory;
  loanAmount: number;
  amount?: number; // Alias for loanAmount
  durationMonths: number;
  interestRate: number; // Annual %
  monthlyEMI: number;
  totalPayable: number;
  totalInterest: number;
  loanPurpose: string;
  
  // Guarantor
  guarantorName: string;
  guarantorPhone: string;
  guarantorRelation: string;
  guarantorNid: string;
  guarantorAddress: string;
  
  // Status & audit
  status: ApplicationStatus;
  appliedDate: string;
  adminNotes?: string;
  approvedAmount?: number;
  approvedDate?: string;
  disbursedDate?: string;
  rejectedReason?: string;
  
  // Attached files
  documents: LoanApplicationDocument[];
}

export interface Installment {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Cash';
  transactionId?: string;
  slipName?: string;
}

export interface CustomerReview {
  id: string;
  name?: string;
  customerName?: string;
  nameBn?: string;
  role?: string;
  professionBn?: string;
  designationBn?: string;
  districtBn?: string;
  locationBn?: string;
  photoUrl?: string;
  avatarUrl?: string;
  loanAmount?: number | string;
  reviewBn?: string;
  reviewTextBn?: string;
  comment?: string;
  rating?: number; // 1-5
  date?: string;
  active?: boolean;
  isVerified?: boolean;
}

export interface PartnerBankConfig {
  id: string;
  nameBn: string;
  nameEn?: string;
  logoUrl: string;
  partnershipTypeBn?: string;
  websiteUrl?: string; // Clickable partner website link
  type?: string;
  active?: boolean;
}

export type PartnerBank = PartnerBankConfig;

export interface SiteSettings {
  companyNameBn: string;
  companyNameEn?: string;
  companySloganBn: string;
  logoText: string;
  supportPhone: string;
  emergencyPhone: string;
  supportEmail: string;
  officeAddressBn: string;
  officeTimeBn: string;
  heroTitleBn: string;
  heroSubtitleBn: string;
  noticeBannerBn: string;
  noticeActive: boolean;
  minLoanAmountGlobal: number;
  maxLoanAmountGlobal: number;
  defaultInterestRateGlobal: number;
  termsBn: string;
  privacyBn: string;
  // Dynamic Platform Branding & Video Guide
  platformName?: string;
  platformNameBn?: string;
  platformNameEn?: string;
  videoGuideUrl?: string;
  videoGuideTitle?: string;
  videoGuideTitleBn?: string;
  videoGuideDescBn?: string;
  videoGuideDescriptionBn?: string;
  videoDownloadUrl?: string;
  videoThumbnail?: string;
  loginBackgroundLogoUrl?: string;
  // Dynamic Branding & Logo Customization (Admin & User panels)
  adminSidebarLogoUrl?: string;
  adminSidebarLogoText?: string;
  userPortalLogoUrl?: string;
  adminLoginLogoUrl?: string;
  adminLoginTheme?: 'dark_navy' | 'deep_black' | 'midnight_blue' | 'custom_wallpaper';
  adminLoginWallpaperUrl?: string;
  customerReviews?: CustomerReview[];
  partnerBanks?: PartnerBankConfig[];
  promotionMediaItems?: PromotionMediaItem[];
}

export interface PromotionMediaItem {
  id: string;
  titleBn: string;
  captionBn?: string;
  category: 'happy_customer' | 'loan_ad';
  imageUrl: string;
  loanAmount?: string | number;
  customerName?: string;
  customerLocation?: string;
  customerProfession?: string;
  badgeBn?: string;
  storyBn?: string;
  ctaTextBn?: string;
  ctaLink?: string;
  date?: string;
  order?: number;
  active: boolean;
}

export interface VirtualDebitCard {
  id: string;
  cardNumber: string;
  cardHolder?: string;
  cardHolderName?: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  cardType: 'visa' | 'mastercard' | 'VISA' | 'MASTERCARD';
  status: 'active' | 'pending' | 'blocked';
  approvedDate?: string;
  spendingLimit?: number;
}

export interface WithdrawalCondition {
  required: boolean;
  noticeBn?: string;
  messageBn?: string;
  feeAmount: number;
  isApproved: boolean;
  reasonBn?: string;
  // Multi-stage condition workflow
  stageTitle?: string; // e.g. "প্রথম কিস্তি জমা", "ঋণ ঝুঁকি বীমা ফি", "সার্ভিস ও ক্লিয়ারেন্স ফি"
  instructionBn?: string; // Custom admin text e.g. "আপনাকে এখন ২০০০ টাকা জমা দিতে হবে প্রথম কিস্তি বাবদ"
  specialInstructionBn?: string; // Optional additional instructions shown separately to the customer
  paymentMethod?: string; // e.g. "bKash / Nagad / Bank"
  accountOrPhone?: string; // Admin deposit account/number
  customerConfirmed?: boolean; // User clicked "Confirm" / জমা নিশ্চিত করুন
  customerConfirmedAt?: string;
  customerTrxId?: string; // User submitted TxID
  customerSlipUrl?: string; // Uploaded payment slip proof (dataURL / image)
  status?: 'pending_payment' | 'user_confirmed' | 'accepted' | 'rejected' | 'cleared' | 'active' | 'approved';
  history?: {
    stageTitle: string;
    instructionBn?: string;
    feeAmount?: number;
    amount?: number;
    completedAt?: string;
    confirmedAt?: string;
    trxId?: string;
    slipUrl?: string;
    adminNote?: string;
  }[];
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  password?: string;
  email: string;
  role: 'customer' | 'admin';
  walletBalance: number;
  status: 'active' | 'suspended';
  isActive?: boolean;
  kycVerified: boolean;
  registeredAt: string;
  nidNumber?: string;
  profession?: string;
  monthlyIncome?: number;
  presentAddress?: string;
  address?: string;
  photoUrl?: string;
  avatarUrl?: string;
  profileImage?: string;
  documents?: LoanApplicationDocument[];
  // User Bank / Mobile Banking Account (editable)
  bankAccountNumber?: string; // 16-digit official DBS Bank account number
  accountNumber?: string;
  accountType?: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank';
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  // Multi-method withdrawal accounts independently bound and locked
  boundWithdrawalAccounts?: Record<string, BoundWithdrawalAccount>;
  // Virtual Card & Conditional Withdrawal
  virtualCard?: VirtualDebitCard;
  withdrawalCondition?: WithdrawalCondition;
}

export interface BoundWithdrawalAccount {
  method: string;
  accountNumber: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  boundAt: string;
  isLocked: boolean;
}

export type PaymentChannel = string;

export interface WithdrawalRequest {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  amount: number;
  method: PaymentChannel;
  accountNumber: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  adminNote?: string;
  transactionProof?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'loan_disbursement';
  amount: number;
  title: string;
  description: string;
  date: string;
  balanceAfter: number;
}

export interface AppNotification {
  id: string;
  userId: string | 'all';
  phone?: string;
  title: string;
  message: string;
  sender: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'loan';
  actionUrl?: string;
}

export interface LoanApprovalLetter {
  id: string;
  loanId: string;
  userId: string;
  customerName: string;
  phone: string;
  nidNumber: string;
  loanAmount: number;
  approvedDate: string;
  interestRate: number;
  durationMonths: number;
  monthlyEMI: number;
  sanctionLetterNumber: string;
  letterNumber?: string;
  officialHeaderBn: string;
  customMessageBn: string;
  bankSealText: string;
  managerSignatureTitle: string;
  termsConditionsBn: string[];
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  accountType: 'Personal' | 'Agent' | 'Merchant' | 'Bank Account';
  transactionType: 'Send Money' | 'Cash Out' | 'Bank Transfer';
  accountNumber: string;
  qrCodeUrl?: string;
  instructionBn: string;
  instructionsBn?: string;
  minDeposit: number;
  maxDeposit: number;
  chargePercentage: number;
  active: boolean;
  /** When false, this method is hidden from customer withdrawal options. Defaults to true for backwards compatibility. */
  withdrawalActive?: boolean;
}

export interface DepositRequest {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  methodId: string;
  methodName: string;
  amount: number;
  senderNumber: string;
  transactionId: string;
  slipUrl?: string;
  slipUrls?: string[]; // Multiple transaction receipts/slips
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  adminNote?: string;
}

export interface SupportChannelOption {
  id: string;
  type: 'imo' | 'whatsapp' | 'telegram' | 'phone' | 'email' | 'messenger' | 'custom';
  titleBn: string;
  accountNumber: string;
  directLink?: string;
  extraNote?: string;
  active: boolean;
  order?: number;
}

export interface CustomerSupportConfig {
  imoNumber: string;
  imoLink?: string;
  whatsappNumber: string;
  whatsappMessage?: string;
  telegramUsername: string;
  telegramLink?: string;
  helplinePhone: string;
  phone?: string;
  whatsapp?: string;
  availableHoursBn: string;
  noticeBn?: string;
  channels?: SupportChannelOption[];
}

export interface ContractPaper {
  id: string;
  contractNumber: string;
  userId: string;
  loanId: string;
  customerName: string;
  phone: string;
  nidNumber: string;
  loanAmount: number;
  durationMonths: number;
  monthlyEMI: number;
  issueDate: string;
  firstPartyBn: string;
  secondPartyBn: string;
  contractSubjectBn: string;
  clausesBn: string[];
  declarationBn: string;
  adminSealText: string;
  authorizedSignatoryTitle: string;
  signedDate: string;
  // Approval and Send status
  status?: 'draft' | 'sent';
  sentAt?: string;
  stampAmount?: number | string; // 100, 200, 300, 400, 500, or custom
  companyName?: string;
  customerAddress?: string;
  firstPartySealText?: string;
  firstPartySigText?: string;
  // 100 Tk Stamp (Image 2 style) fields
  stampSerialNo?: string;
  fatherName?: string;
  district?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  customerPhotoUrl?: string;
  showCustomerPhoto?: boolean;
  showApprovedSeal?: boolean;
  bankSignDate?: string;
  bankSignTitle?: string;
  borrowerSignText?: string;
}

// Fixed Deposit / DPS Models
export interface FixedDepositScheme {
  id: string;
  titleBn: string;
  taglineBn: string;
  durationMonths: number;
  durationDays?: number;
  monthlyProfitPercent: number; // e.g. 10 means 10% per month
  minAmount: number;
  maxAmount: number;
  badgeBn?: string;
  descriptionBn?: string;
  active: boolean;
  featuresBn: string[];
}

export interface CustomerFixedDeposit {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  schemeId: string;
  schemeTitleBn: string;
  depositAmount: number;
  profitPercent: number;
  dailyProfitPercent?: number; // এডমিন কর্তৃক কাস্টম দৈনিক কমিশন শতাংশ (%)
  dailyProfitAmount?: number; // দৈনিক লাভের পরিমাণ (টাকা)
  durationMonths: number;
  monthlyProfitAmount: number;
  totalMaturityAmount: number;
  startDate: string;
  maturityDate: string;
  status: 'pending' | 'active' | 'rejected' | 'matured' | 'cancelled';
  totalProfitEarned?: number;
  lastAccruedDate?: string; // শেষ কবে দৈনিক লাভ যুক্ত হয়েছে (YYYY-MM-DD)
  paymentMethod: string;
  transactionId: string;
  slipUrl?: string;
  slipUrls?: string[];
  adminNote?: string;
  approvedAt?: string;
  createdAt: string;
}

// Official Documents Generator Models
export type OfficialDocumentType = 
  | 'sanction_letter'     // লোন অনুমোদন পত্র
  | 'insurance_policy'    // ইন্সুরেন্স পেপার
  | 'stamp_paper'         // বাংলাদেশ অনুমোদিত নন-জুডিশিয়াল স্ট্যাম্প
  | 'bd_stamp'            // অ্যালিয়াস
  | 'bank_cheque'         // রিয়েল ব্যাংক চেক
  | 'money_receipt'       // মানি রিসিট
  | 'staff_id_card'       // বাংলাদেশ ব্যাংক স্টাফ আইডি কার্ড
  | 'staff_visiting_card'; // কর্পোরেট ভিজিটিং কার্ড

export type UserProfile = CustomerUser;

export interface GeneratedOfficialDocument {
  id: string;
  docNumber: string;
  type: OfficialDocumentType;
  docType?: OfficialDocumentType;
  titleBn: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerNid: string;
  customerAddress: string;
  loanAmount: number;
  loanDurationMonths?: number;
  monthlyEMI?: number;
  createdDate: string;
  issuerName: string;
  issuerDesignation: string;
  contentData: Record<string, any>;
}

export interface StaffIdCard {
  id: string;
  nameBn: string;             // যেমন: তাফি শেখ
  nameEn: string;             // যেমন: TAFI SHEIKH
  fatherNameBn: string;       // যেমন: মোঃ সাজু আহমেদ
  motherNameBn: string;       // যেমন: মোসাঃ মোহনা আক্তার
  dob: string;                // যেমন: 07 Jan 2002
  idNumber: string;           // যেমন: 63849492839
  photoUrl: string;           // গ্যালারি থেকে আপলোড করা ছবি
  signatureText?: string;     // যেমন: Sheikh
  signatureUrl?: string;      // ঐচ্ছিক হস্তাক্ষর ছবি
  designation?: string;       // পদবি (ঐচ্ছিক): যেমন লোন অফিসার
  department?: string;        // বিভাগ (ঐচ্ছিক): যেমন মাইক্রোফিন্যান্স
  bloodGroup?: string;        // রক্তের গ্রুপ: যেমন O+
  addressBn?: string;         // ঠিকানা: বাসা নং ১২, রোড নং ৪, ধানমন্ডি, ঢাকা
  issueDate?: string;         // ইস্যুর তারিখ: যেমন 12/03/2024
  headerGovtBn?: string;      // গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
  headerGovtEn?: string;      // Government of the People's Republic of Bangladesh
  cardTitleBnEn?: string;     // Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র
  createdAt: string;
  updatedAt?: string;
}

// Sub-Admin Management with Granular Module Permissions
export type AdminModuleKey = 
  | 'dashboard'
  | 'applications'
  | 'customers'
  | 'messages'
  | 'deposits'
  | 'withdrawals'
  | 'packages'
  | 'letters'
  | 'contracts'
  | 'staff_id'
  | 'support_partners'
  | 'notifications'
  | 'media'
  | 'official_docs'
  | 'settings';

export interface AdminModulePermission {
  key: AdminModuleKey;
  labelBn: string;
  descriptionBn: string;
}

export interface SubAdmin {
  id: string;
  username: string;
  password?: string;
  name: string;
  phone?: string;
  role: 'sub_admin';
  permissions: AdminModuleKey[];
  assigned_customer_ids: string[];
  can_delete_messages?: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

