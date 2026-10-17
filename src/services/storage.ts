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
  OfficialDocumentType,
  GeneratedOfficialDocument,
  StaffIdCard,
  PromotionMediaItem
} from '@/types/loan';
import { supabaseSync } from './supabaseSyncService';

// Bengali number conversions (automatically returns English digits if language === 'en')
export const toBengaliNumber = (num: number | string): string => {
  if (typeof window !== 'undefined' && (window as any).__APP_LANGUAGE__ === 'en') {
    return String(num);
  }
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
};

// Normalize phone numbers: converts Bengali digits to English, trims, removes formatting, standardizes +880/880
export const normalizePhone = (phone: string | number | undefined | null): string => {
  if (!phone) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let str = String(phone).trim();
  bengaliDigits.forEach((b, index) => {
    str = str.split(b).join(String(index));
  });
  // Strip non-digits except leading +
  str = str.replace(/[^\d+]/g, '');
  if (str.startsWith('+880')) {
    str = '0' + str.slice(4);
  } else if (str.startsWith('880')) {
    str = '0' + str.slice(3);
  }
  return str;
};

export const formatTaka = (amount: number, inBengaliDigits = true): string => {
  const isEnglish = typeof window !== 'undefined' && (window as any).__APP_LANGUAGE__ === 'en';
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  if (inBengaliDigits && !isEnglish) {
    return `৳ ${toBengaliNumber(formatted)}`;
  }
  return `৳ ${formatted}`;
};

// Calculate monthly EMI using standard banking reducing balance formula
// EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
export const calculateEMI = (
  principal: number,
  annualRate: number,
  months: number
): {
  monthlyEMI: number;
  totalInterest: number;
  totalPayable: number;
} => {
  if (principal <= 0 || months <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalPayable: 0 };
  }
  if (annualRate <= 0) {
    const monthlyEMI = Math.round(principal / months);
    return { monthlyEMI, totalInterest: 0, totalPayable: principal };
  }
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyEMI = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayable = monthlyEMI * months;
  const totalInterest = Math.max(0, totalPayable - principal);

  return { monthlyEMI, totalInterest, totalPayable };
};

// Default site settings
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyNameBn: 'DBS Bank SG',
  companyNameEn: 'DBS Bank SG',
  companySloganBn: 'আপনার আর্থিক নির্ভরতার বিশ্বস্ত ব্যাংকিং সহযোগী',
  logoText: 'DBS Bank SG',
  platformName: 'DBS Bank SG',
  platformNameBn: 'DBS Bank SG',
  platformNameEn: 'DBS Bank SG',
  supportPhone: '+৮৮০১৮০৫৪৯২৩৫৭',
  emergencyPhone: '+৮৮০ ১৯ ৯৮৭৬ ৫৪৩২',
  supportEmail: 'support@dbsbank.sg',
  officeAddressBn: 'মতিঝিল বাণিজ্যিক এলাকা, ঢাকা - ১০০০, বাংলাদেশ',
  officeTimeBn: 'রবিবার - বৃহস্পতিবার: সকাল ৯:০০ - বিকাল ৫:০০ (শুক্রবার ও শনিবার বন্ধ)',
  heroTitleBn: 'DBS Bank SG, আপনার স্বপ্নের বিশ্বস্ত ব্যাংকিং সহযোগী',
  heroSubtitleBn: 'সহজ শর্ত ও দ্রুততম সময়ে মাত্র ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ব্যক্তিগত, ব্যবসা ও কৃষি লোন গ্রহণ করুন। কোনো লুকায়িত ফি নেই।',
  noticeBannerBn: 'বিশেষ ঘোষণা: প্রবাসিদের জন্য এবং যারা প্রবাসে যেতে চান তাদের জন্য মাত্র ২.০০% সুদের হারে লোন দিচ্ছে DBS Bank SG',
  noticeActive: true,
  minLoanAmountGlobal: 20000,
  maxLoanAmountGlobal: 5000000,
  defaultInterestRateGlobal: 2.4,
  termsBn: '১. আবেদনকারীর বয়স ২১ থেকে ৬০ বছরের মধ্যে হতে হবে। ২. জাতীয় পরিচয়পত্র ও বৈধ আয়ের প্রমাণ আবশ্যক। ৩. সঠিক তথ্য প্রদান বাধ্যতামূলক। মিথ্যা তথ্য দিলে আবেদন তাৎক্ষণিক বাতিল হবে।',
  privacyBn: 'আপনার সকল ব্যক্তিগত ও আর্থিক তথ্য অত্যন্ত গোপনীয়তা ও এনক্রিপশনের সাথে সুরক্ষিত রাখা হয়। কোনো তৃতীয় পক্ষের সাথে আপনার তথ্য শেয়ার করা হয় না।',
  videoGuideTitle: 'রেজিস্ট্রেশন, লগইন ও লোন আবেদনের সম্পূর্ণ ভিডিও গাইড',
  videoGuideUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoDownloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoThumbnail: 'https://images.unsplash.com/photo-1556742049-0a67c555356b?w=800&auto=format&fit=crop&q=80',
  loginBackgroundLogoUrl: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png',
  // Dynamic Logo & Theme Customization Defaults
  adminSidebarLogoUrl: '',
  adminSidebarLogoText: 'সহজ',
  userPortalLogoUrl: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png',
  adminLoginLogoUrl: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png',
  adminLoginTheme: 'dark_navy',
  adminLoginWallpaperUrl: ''
};

// Default loan packages
const DEFAULT_PACKAGES: LoanPackage[] = [
  {
    id: 'pkg-personal',
    category: 'personal',
    nameBn: 'ব্যক্তিগত ঋণ (Personal Loan)',
    nameEn: 'Personal Loan',
    taglineBn: 'জরুরি পারিবারিক বা ব্যক্তিগত যেকোনো প্রয়োজনে তাৎক্ষণিক অর্থায়ন',
    minAmount: 20000,
    maxAmount: 5000000,
    defaultRate: 9.0,
    minDurationMonths: 3,
    maxDurationMonths: 60,
    processingFeePercent: 1.0,
    descriptionBn: 'ব্যক্তিগত কাজে যেমন চিকিৎসা, বিয়ে, বাড়ির সংস্কার বা ভ্রমণের জন্য সহজ কিস্তিতে ঋণ পান। কোনো জটিল জামানত ছাড়াই দ্রুততম সময়ে বিতরণ।',
    featuresBn: [
      'কোনো স্থাবর জামানতের প্রয়োজন নেই',
      '২৪ থেকে ৪৮ ঘণ্টার মধ্যে অনুমোদন',
      'সহজ মাসিক কিস্তি (EMI) পরিশোধ সুবিধা',
      'প্রিপেমেন্ট বা মেয়াদপূর্ব পরিশোধের সুযোগ'
    ],
    eligibilityBn: [
      'বয়স: ২১ থেকে ৫৮ বছর',
      'চাকরিজীবী বা স্বনিয়োজিত পেশাজীবী',
      'ন্যূনতম মাসিক আয়: ২০,০০০ টাকা'
    ],
    requiredDocsBn: [
      'জাতীয় পরিচয়পত্র (NID)',
      'পাসপোর্ট সাইজ ছবি (২ কপি)',
      'গত ৬ মাসের ব্যাংক স্টেটমেন্ট',
      'বিদ্যুৎ/গ্যাস বিলের কপি'
    ],
    iconName: 'UserCheck',
    badgeBn: 'সবচেয়ে জনপ্রিয়',
    active: true
  },
  {
    id: 'pkg-business',
    category: 'business',
    nameBn: 'ক্ষুদ্র ও মাঝারি ব্যবসা ঋণ (SME Loan)',
    nameEn: 'SME Business Loan',
    taglineBn: 'ব্যবসা সম্প্রসারণ ও কার্যকরী মূলধনের জন্য সহজ অর্থায়ন',
    minAmount: 20000,
    maxAmount: 5000000,
    defaultRate: 8.0,
    minDurationMonths: 3,
    maxDurationMonths: 60,
    processingFeePercent: 1.5,
    descriptionBn: 'দোকানদার, পাইকারি ব্যবসায়ী এবং কুটির শিল্প উদ্যোক্তাদের জন্য স্টক ক্রয় ও ব্যবসা বড় করার বিশেষ ঋণ প্যাকেজ।',
    featuresBn: [
      'সর্বোচ্চ ৫০ লক্ষ টাকা পর্যন্ত আবেদন করা যেতে পারে (যোগ্যতা ও অনুমোদনসাপেক্ষে)',
      'ব্যবসার ধরণ অনুযায়ী নমনীয় কিস্তি',
      'কম সুদের হার ও দ্রুত ছাড়করণ',
      'ব্যবসা পরামর্শ ও আর্থিক সহায়তা'
    ],
    eligibilityBn: [
      'ন্যূনতম ১ বছরের ব্যবসার অভিজ্ঞতা',
      'বৈধ ট্রেড লাইসেন্স থাকতে হবে',
      'মাসিক গড় লেনদেন ৫০,০০০+ টাকা'
    ],
    requiredDocsBn: [
      'ট্রেড লাইসেন্স ও টিন সার্টিফিকেট',
      'ব্যবসার ব্যাংক হিসাবের ১ বছরের বিবরণী',
      'দোকান বা ব্যবসা প্রতিষ্ঠানের ভাড়ার চুক্তিপত্র'
    ],
    iconName: 'Briefcase',
    badgeBn: 'ব্যবসায়ীদের সেরা পছন্দ',
    active: true
  },
  {
    id: 'pkg-education',
    category: 'education',
    nameBn: 'উচ্চশিক্ষা ও ক্যারিয়ার ঋণ',
    nameEn: 'Education Loan',
    taglineBn: 'আপনার ও আপনার সন্তানের পড়াশোনার স্বপ্ন পূরণে সহায়ক',
    minAmount: 20000,
    maxAmount: 5000000,
    defaultRate: 6.5,
    minDurationMonths: 3,
    maxDurationMonths: 60,
    processingFeePercent: 0.5,
    descriptionBn: 'দেশ ও বিদেশের বিশ্ববিদ্যালয়ে ভর্তি ফি, সেমিস্টার ফি এবং আবাসন খরচের জন্য বিশেষ স্বল্পসুদে শিক্ষা ঋণ।',
    featuresBn: [
      'সবচেয়ে কম সুদের হার (মাত্র ৬.৫%)',
      'পড়াশোনা চলাকালীন অতিরিক্ত মোরাটোরিয়াম সুবিধা',
      'পিতা-মাতা বা অভিভাবক সহ-আবেদনকারী হিসেবে প্রযোজ্য',
      'সরাসরি শিক্ষা প্রতিষ্ঠানের ফি পরিশোধ বিকল্প'
    ],
    eligibilityBn: [
      'স্বীকৃত কলেজ/বিশ্ববিদ্যালয়ে ভর্তির প্রমাণ',
      'অভিভাবকের নিয়মিত আয়ের উৎস',
      'শিক্ষার্থীর বয়স ১৮-৩৫ বছর'
    ],
    requiredDocsBn: [
      'ভর্তির অফার লেটার ও ফি শিডিউল',
      'শিক্ষার্থীর অ্যাকাডেমিক সার্টিফিকেট',
      'অভিভাবকের এনআইডি ও আয়ের প্রমাণ'
    ],
    iconName: 'GraduationCap',
    badgeBn: 'স্বল্প সুদ',
    active: true
  },
  {
    id: 'pkg-emergency',
    category: 'emergency',
    nameBn: 'জরুরি তাৎক্ষণিক ঋণ (Emergency Loan)',
    nameEn: 'Instant Emergency Loan',
    taglineBn: 'চিকিৎসা বা সংকটকালীন মুহূর্তে মাত্র ৬ থেকে ১২ ঘণ্টায় অর্থ সহায়তা',
    minAmount: 20000,
    maxAmount: 5000000,
    defaultRate: 8.5,
    minDurationMonths: 3,
    maxDurationMonths: 60,
    processingFeePercent: 1.0,
    descriptionBn: 'হঠাৎ অসুস্থতা, দুর্ঘটনা বা জরুরি আর্থিক সংকটে তাৎক্ষণিক ভেরিফিকেশনের মাধ্যমে সরাসরি ব্যাংক অথবা বিকাশ/নগদে টাকা পান।',
    featuresBn: [
      'তাত্ক্ষণিক পেপারলেস যাচাইকরণ',
      '৬-১২ ঘণ্টার মধ্যে ফান্ড ছাড়',
      'স্বল্পমেয়াদী সহজ পরিশোধ শিডিউল',
      'কোনো অতিরিক্ত লুকায়িত চার্জ নেই'
    ],
    eligibilityBn: [
      'সক্রিয় বিকাশ/নগদ বা ব্যাংক হিসাবধারী',
      'জাতীয় পরিচয়পত্রধারী বাংলাদেশি নাগরিক',
      'বয়স: ২০ থেকে ৬০ বছর'
    ],
    requiredDocsBn: [
      'জাতীয় পরিচয়পত্রের উভয় পাশের ছবি',
      'একটি সক্রিয় মোবাইল নম্বর',
      'জরুরি অবস্থার বিবরণ/প্রেসক্রিপশন (যদি থাকে)'
    ],
    iconName: 'Zap',
    badgeBn: 'দ্রুততম অনুমোদন',
    active: true
  },
  {
    id: 'pkg-agriculture',
    category: 'agriculture',
    nameBn: 'কৃষি ও ডেইরি খামার ঋণ',
    nameEn: 'Agriculture & Dairy Loan',
    taglineBn: 'ফসল চাষ, গবাদিপশু পালন ও মৎস্য চাষে কৃষকের পাশে',
    minAmount: 20000,
    maxAmount: 5000000,
    defaultRate: 6.0,
    minDurationMonths: 3,
    maxDurationMonths: 60,
    processingFeePercent: 0.5,
    descriptionBn: 'বীজ, সার ক্রয়, আধুনিক সেচ সরঞ্জাম, ডেইরি এবং পোল্ট্রি ফার্ম গঠনের জন্য ঋতুভিত্তিক সুবিধাজনক কিস্তিতে কৃষি ঋণ।',
    featuresBn: [
      'ফসল কাটার পর বা মৌসুমি কিস্তি পরিশোধের বিশেষ সুবিধা',
      'সরকারী ও সহযোগী সংস্থার সমন্বিত সহায়তা',
      'কৃষি কার্ডধারীদের জন্য বিশেষ ছাড়',
      'সহজ জামানত ও গ্রামীণ পর্যায়ে সেবা'
    ],
    eligibilityBn: [
      'কৃষিকাজ বা খামারের সাথে প্রত্যক্ষ সম্পৃক্ততা',
      'নিজস্ব বা বর্গা জমির বিবরণ',
      'বয়স: ১৮ থেকে ৬৫ বছর'
    ],
    requiredDocsBn: [
      'জাতীয় পরিচয়পত্র',
      'কৃষি কার্ড বা জমির পরচা/দলিল (ফটোকপি)',
      'স্থানীয় চেয়ারম্যান/মেম্বারের প্রত্যয়ন'
    ],
    iconName: 'Tractor',
    badgeBn: 'কৃষক বান্ধব',
    active: true
  }
];

// Clean production empty applications & installments - Zero dummy/mock data
const DEFAULT_APPLICATIONS: LoanApplication[] = [];

const generateInitialInstallments = (): Installment[] => {
  return [];
};

// Storage keys
const STORAGE_KEYS = {
  PACKAGES: 'shohoj_loan_packages',
  APPLICATIONS: 'shohoj_loan_applications',
  INSTALLMENTS: 'shohoj_loan_installments',
  SETTINGS: 'shohoj_loan_settings',
  USERS: 'shohoj_loan_users',
  PURGED_USERS: 'shohoj_loan_purged_users',
  CURRENT_USER: 'shohoj_loan_current_user',
  WITHDRAWALS: 'shohoj_loan_withdrawals',
  WALLET_TRANSACTIONS: 'shohoj_loan_wallet_tx',
  NOTIFICATIONS: 'shohoj_loan_notifications',
  APPROVAL_LETTERS: 'shohoj_loan_approval_letters',
  ADMIN_AUTH: 'shohoj_loan_admin_auth',
  PAYMENT_METHODS: 'shohoj_loan_payment_methods',
  DEPOSIT_REQUESTS: 'shohoj_loan_deposit_requests',
  CUSTOMER_SUPPORT: 'shohoj_loan_customer_support',
  PARTNER_BANKS: 'shohoj_loan_partner_banks',
  CONTRACT_PAPERS: 'shohoj_loan_contract_papers',
  FIXED_DEPOSIT_SCHEMES: 'shohoj_loan_fd_schemes',
  CUSTOMER_FIXED_DEPOSITS: 'shohoj_loan_customer_fd',
  CUSTOMER_REVIEWS: 'shohoj_loan_customer_reviews',
  GENERATED_DOCUMENTS: 'shohoj_loan_generated_docs',
  STAFF_ID_CARDS: 'shohoj_loan_staff_id_cards',
  PROMOTION_MEDIA: 'shohoj_loan_promotion_media'
};

export const DEFAULT_USERS: CustomerUser[] = [];

export const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [];

export const DEFAULT_WALLET_TRANSACTIONS: WalletTransaction[] = [];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [];

export const DEFAULT_APPROVAL_LETTERS: LoanApprovalLetter[] = [];

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'pm-bkash',
    name: 'বিকাশ (bKash)',
    nameEn: 'bKash',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
    accountType: 'Agent',
    transactionType: 'Cash Out',
    accountNumber: '01762731633',
    instructionBn: 'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে নির্ধারিত এজেন্ট নম্বরে ক্যাশ আউট (Cash Out) করুন। টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) দিন।',
    minDeposit: 500,
    maxDeposit: 500000,
    chargePercentage: 0,
    active: true
  },
  {
    id: 'pm-nagad',
    name: 'নগদ (Nagad)',
    nameEn: 'Nagad',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=60',
    accountType: 'Agent',
    transactionType: 'Cash Out',
    accountNumber: '01333994575',
    instructionBn: 'আপনার নগদ অ্যাপ বা *167# ডায়াল করে নির্ধারিত এজেন্ট নম্বরে ক্যাশ আউট করুন। ক্যাশ-ইন গ্রহণ করা হয় না।',
    minDeposit: 500,
    maxDeposit: 500000,
    chargePercentage: 0,
    active: true
  },
  {
    id: 'pm-rocket',
    name: 'রকেট (Rocket DBBL)',
    nameEn: 'Rocket',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=60',
    accountType: 'Agent',
    transactionType: 'Cash Out',
    accountNumber: '01934-567890-4',
    instructionBn: 'রকেট এজেন্ট নম্বরে ক্যাশ আউট (Cash Out) করুন অথবা ডাচ-বাংলা নেক্সাসপে থেকে ফান্ড ট্রান্সফার করুন।',
    minDeposit: 500,
    maxDeposit: 300000,
    chargePercentage: 0,
    active: true
  },
  {
    id: 'pm-upay',
    name: 'উপায় (Upay UCB)',
    nameEn: 'Upay',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
    accountType: 'Personal',
    transactionType: 'Send Money',
    accountNumber: '01612-987654',
    instructionBn: 'উপায় মোবাইল ওয়ালেট থেকে সেন্ড মানি করুন এবং সফল ট্রানজেকশনের আইডি প্রদান করুন।',
    minDeposit: 500,
    maxDeposit: 200000,
    chargePercentage: 0,
    active: true
  },
  {
    id: 'pm-ibbl',
    name: 'ইসলামী ব্যাংক বাংলাদেশ',
    nameEn: 'Islami Bank Bangladesh',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60',
    accountType: 'Bank Account',
    transactionType: 'Bank Transfer',
    accountNumber: '205021302004589 (ধানমন্ডি শাখা, ঢাকা)',
    instructionBn: 'আই-স্মার্ট অ্যাপ, সেলফিন বা সরাসরি ব্যাংক শাখায় জমা দিন। হিসাবের নাম: DBS Bank SG সার্ভিসেস লিমিটেড।',
    minDeposit: 1000,
    maxDeposit: 2000000,
    chargePercentage: 0,
    active: true
  },
  {
    id: 'pm-citybank',
    name: 'দি সিটি ব্যাংক পিএলসি',
    nameEn: 'City Bank PLC',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
    accountType: 'Bank Account',
    transactionType: 'Bank Transfer',
    accountNumber: '1102948572001 (গুলশান শাখা)',
    instructionBn: 'সিটিটাচ অ্যাপ বা অনলাইন ট্রান্সফার করুন। ডিপোজিট স্লিপ বা কনফার্মেশন স্ক্রিনশট যুক্ত করুন।',
    minDeposit: 1000,
    maxDeposit: 2000000,
    chargePercentage: 0,
    active: true
  }
];

export const DEFAULT_DEPOSIT_REQUESTS: DepositRequest[] = [];

export const formatActivePaymentMethodsSummary = (methods: PaymentMethodConfig[]): string => {
  const active = (methods || []).filter((m) => m.active);
  if (!active.length) return '';
  return active
    .map((m) => `${m.name}${m.accountType ? ` (${m.accountType})` : ''}: ${m.accountNumber}`)
    .join(' / ');
};

export const DEFAULT_CUSTOMER_SUPPORT: CustomerSupportConfig = {
  imoNumber: '+8801712345678',
  imoLink: 'https://imo.im',
  whatsappNumber: '+8801712345678',
  whatsappMessage: 'আসসালামু আলাইকুম, সহজ লোন কাস্টমার সার্ভিসের সাথে যোগাযোগ করতে চাই।',
  telegramUsername: 'shohojloansupport',
  telegramLink: 'https://t.me/shohojloansupport',
  helplinePhone: '+8801998765432',
  availableHoursBn: '২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা',
  noticeBn: 'ইমু, হোয়াটসঅ্যাপ বা সরাসরি হেল্পলাইনে ফোন করে যেকোনো সময় লোন ও কিস্তি সংক্রান্ত সেবা নিন।',
  channels: [
    {
      id: 'ch-imo',
      type: 'imo',
      titleBn: 'ইমু (Imo) কাস্টমার সাপোর্ট',
      accountNumber: '+8801712345678',
      directLink: 'https://imo.im',
      extraNote: 'ইমুতে সরাসরি বার্তা ও কল সেবা',
      active: true,
      order: 1
    },
    {
      id: 'ch-whatsapp',
      type: 'whatsapp',
      titleBn: 'হোয়াটসঅ্যাপ (WhatsApp) সাপোর্ট',
      accountNumber: '+8801712345678',
      directLink: 'https://wa.me/8801712345678',
      extraNote: 'আসসালামু আলাইকুম, সহজ লোন কাস্টমার সার্ভিসের সাথে যোগাযোগ করতে চাই।',
      active: true,
      order: 2
    },
    {
      id: 'ch-telegram',
      type: 'telegram',
      titleBn: 'টেলিগ্রাম (Telegram) সাপোর্ট',
      accountNumber: '@shohojloansupport',
      directLink: 'https://t.me/shohojloansupport',
      extraNote: 'টেলিগ্রাম অফিসিয়াল গ্রুপ ও ডিরেক্ট সাপোর্ট',
      active: true,
      order: 3
    },
    {
      id: 'ch-helpline',
      type: 'phone',
      titleBn: 'সরাসরি হেল্পলাইন ও কাজের সময়',
      accountNumber: '+8801998765432',
      directLink: 'tel:+8801998765432',
      extraNote: '২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা',
      active: true,
      order: 4
    }
  ]
};

export const DEFAULT_PARTNER_BANKS: PartnerBankConfig[] = [
  {
    id: 'pb-sonali',
    nameBn: 'সোনালী ব্যাংক পিএলসি',
    nameEn: 'Sonali Bank PLC',
    logoUrl: '/images/banks/sonali.svg',
    partnershipTypeBn: 'আর্থিক লেনদেন ও ফান্ড শেয়ারিং পার্টনার',
    websiteUrl: 'https://www.sonalibank.com.bd',
    active: true
  },
  {
    id: 'pb-ibbl',
    nameBn: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
    nameEn: 'Islami Bank Bangladesh PLC',
    logoUrl: '/images/banks/ibbl.svg',
    partnershipTypeBn: 'শরীয়াহ ভিত্তিক ঋণ ও রেমিট্যান্স সহযোগী',
    websiteUrl: 'https://www.islamibankbd.com',
    active: true
  },
  {
    id: 'pb-brac',
    nameBn: 'ব্র্যাক ব্যাংক পিএলসি',
    nameEn: 'BRAC Bank PLC',
    logoUrl: '/images/banks/brac.svg',
    partnershipTypeBn: 'ক্ষুদ্র ও মাঝারি উদ্যোক্তা (SME) পার্টনার',
    websiteUrl: 'https://www.bracbank.com',
    active: true
  },
  {
    id: 'pb-dbbl',
    nameBn: 'ডাচ-বাংলা ব্যাংক পিএলসি',
    nameEn: 'Dutch-Bangla Bank PLC',
    logoUrl: '/images/banks/dbbl.svg',
    partnershipTypeBn: 'ডিজিটাল পেমেন্ট ও কিস্তি কালেকশন চ্যানেল',
    websiteUrl: 'https://www.dutchbanglabank.com',
    active: true
  },
  {
    id: 'pb-city',
    nameBn: 'দি সিটি ব্যাংক পিএলসি',
    nameEn: 'The City Bank PLC',
    logoUrl: '/images/banks/city.svg',
    partnershipTypeBn: 'ব্যক্তিগত ঋণ ও কার্ড সার্ভিস পার্টনার',
    websiteUrl: 'https://www.thecitybank.com',
    active: true
  }
];

export const DEFAULT_CONTRACT_PAPERS: ContractPaper[] = [];

export const DEFAULT_FIXED_DEPOSIT_SCHEMES: FixedDepositScheme[] = [
  {
    id: 'fds-1m',
    titleBn: '১ মাস মেয়াদী মাসিক মুনাফা স্কিম',
    taglineBn: 'স্বল্পমেয়াদী সর্বোচ্চ ১০% নিশ্চিত মাসিক কমিশন',
    durationMonths: 1,
    monthlyProfitPercent: 10,
    minAmount: 1000,
    maxAmount: 200000,
    badgeBn: '১০% প্রতি মাসে',
    descriptionBn: '১,০০০ টাকা থেকে শুরু করে যেকোনো পরিমাণ টাকা ১ মাসের জন্য জমা রাখুন এবং প্রতি মাসে ১০% নিশ্চিত মুনাফা সরাসরি ওয়ালেটে যোগ হবে।',
    active: true,
    featuresBn: [
      '১০০০ টাকায় ১০০ টাকা মাসিক লাভ',
      'প্রতি মাসের শেষে স্বয়ংক্রিয় মুনাফা ওয়ালেটে যুক্ত',
      'বিকাশ, নগদ বা রকেটে যেকোনো সময় উইথড্র সুবিধা',
      'জরুরি প্রয়োজনে কাস্টমার সার্ভিসের মাধ্যমে মেয়াদ পূর্বেই ক্যাশআউট'
    ]
  },
  {
    id: 'fds-3m',
    titleBn: '৩ মাস মেয়াদী আকর্ষণীয় ডিপিএস স্কিম',
    taglineBn: '১২% হারে ত্রৈমাসিক বৃদ্ধি ও নিশ্চিত মুনাফা',
    durationMonths: 3,
    monthlyProfitPercent: 12,
    minAmount: 2000,
    maxAmount: 500000,
    badgeBn: '১২% মাসিক মুনাফা',
    descriptionBn: 'মধ্যমেয়াদী বিনিয়োগকারীদের জন্য বিশেষ সুবিধা। প্রতি মাসে ১২% কমিশন হারে ৩ মাসে মোট ৩৬% পর্যন্ত রিটার্ন।',
    active: true,
    featuresBn: [
      'প্রতি মাসে ১২% হারে নিয়মিত মুনাফা',
      'কোনো গোপন চার্জ নেই',
      'মেয়াদ শেষে মূলধন সহ সম্পূর্ণ টাকা উত্তোলনের সুযোগ',
      'লাইভ ব্যালেন্স ট্র্যাকিং'
    ]
  },
  {
    id: 'fds-6m',
    titleBn: '৬ মাস মেয়াদী প্রিমিয়াম সঞ্চয় স্কিম',
    taglineBn: '১৫% মাসিক মুনাফায় দ্বিগুণ আয়ের সুযোগ',
    durationMonths: 6,
    monthlyProfitPercent: 15,
    minAmount: 5000,
    maxAmount: 1000000,
    badgeBn: 'জনপ্রিয় স্কিম',
    descriptionBn: 'উচ্চ সঞ্চয় ও ব্যবসা ফান্ড বৃদ্ধির জন্য সবচেয়ে নির্ভরযোগ্য ৬ মাসের স্কিম। প্রতি মাসে ১৫% আকর্ষণীয় কমিশন।',
    active: true,
    featuresBn: [
      '১৫% মাসিক নিশ্চিত মুনাফা',
      'উচ্চ নিরাপত্তা ও ডিজিটাল সনদপত্র',
      'অতিরিক্ত বোনাস ও লোন অগ্রাধিকার'
    ]
  },
  {
    id: 'fds-12m',
    titleBn: '১ বছর (১২ মাস) মেয়াদী গোল্ডেন ডিপিএস',
    taglineBn: '১৮% সর্বোচ্চ বার্ষিক মুনাফা ও নিশ্চিত ভবিষ্যৎ',
    durationMonths: 12,
    monthlyProfitPercent: 18,
    minAmount: 10000,
    maxAmount: 2500000,
    badgeBn: 'সর্বোচ্চ ১৮%',
    descriptionBn: 'দীর্ঘমেয়াদী নিরাপদ আর্থিক নিরাপত্তার জন্য গোল্ডেন স্কিম। ১৮% মাসিক মুনাফায় ভবিষ্যৎ গড়ে তুলুন।',
    active: true,
    featuresBn: [
      '১৮% সর্বোচ্চ প্রফিট রেট',
      'জরুরি সাপোর্ট ক্লিয়ারেন্স',
      'ভার্চুয়াল কার্ডে অগ্রাধিকার ব্যালেন্স ফান্ডিং'
    ]
  }
];

export const DEFAULT_CUSTOMER_REVIEWS: CustomerReview[] = [];

export const DEFAULT_GENERATED_DOCUMENTS: GeneratedOfficialDocument[] = [];

export const DEFAULT_CUSTOMER_FIXED_DEPOSITS: CustomerFixedDeposit[] = [];

export const DEFAULT_STAFF_ID_CARDS: StaffIdCard[] = [];

export const DEFAULT_PROMOTION_MEDIA: PromotionMediaItem[] = [];

/**
 * Persistent Browser-Backed Storage with In-Memory Caching
 * Ensures customer login session and application data persist seamlessly across page reloads (F5) and tabs.
 */
const inMemoryStore = new Map<string, string>();

const DUMMY_IDENTIFIERS = new Set([
  '01712345678', '01823456789', '01934567890', '01645678901', '01556789012', '01714599902',
  'LN-2026-1001', 'LN-2026-1002', 'LN-2026-1003', 'LN-2026-1004', 'LN-2026-1005',
  'user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-asha-01943772485', 'user-1791325632252',
  'WTH-1001', 'WTH-1002', 'DEP-1001', 'DEP-1002', 'ltr-1001'
]);

const DUMMY_NAME_KEYWORDS = [
  'মোহাম্মদ রফিকুল ইসলাম', 'আশা খাতুন', 'তানজিলা আক্তার', 'মো: আনোয়ার হোসেন',
  'জান্নাত খাতুন', 'মোঃ তানভীর আহমেদ', 'মোঃ কামরুল হাসান', 'সুমাইয়া জাহান', 'আনিসুর রহমান'
];

const isDummyRecord = (record: any): boolean => {
  if (!record) return false;
  if (record.id && DUMMY_IDENTIFIERS.has(record.id)) return true;
  if (record.phone && DUMMY_IDENTIFIERS.has(record.phone)) return true;
  if (record.userId && DUMMY_IDENTIFIERS.has(record.userId)) return true;
  const name = record.name || record.applicantName || record.customerName || '';
  if (name && DUMMY_NAME_KEYWORDS.some((kw) => name.includes(kw))) return true;
  return false;
};

const initPersistentMemoryStore = () => {
  if (typeof window === 'undefined') return;
  try {
    const st = window.sessionStorage;
    if (!st) return;
    for (let i = 0; i < st.length; i++) {
      const key = st.key(i);
      if (key && (key.startsWith('shohoj_') || key.startsWith('medo_') || key.startsWith('dbs_'))) {
        let val = st.getItem(key);
        if (val !== null) {
          // Actively purge any legacy dummy or test data arrays
          if (
            key === STORAGE_KEYS.USERS ||
            key === STORAGE_KEYS.APPLICATIONS ||
            key === STORAGE_KEYS.WITHDRAWALS ||
            key === STORAGE_KEYS.DEPOSIT_REQUESTS ||
            key === STORAGE_KEYS.WALLET_TRANSACTIONS ||
            key === STORAGE_KEYS.APPROVAL_LETTERS ||
            key === STORAGE_KEYS.INSTALLMENTS
          ) {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                const clean = parsed.filter((item) => !isDummyRecord(item));
                val = JSON.stringify(clean);
                st.setItem(key, val);
              }
            } catch {}
          } else if (
            key === STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS ||
            key === STORAGE_KEYS.CUSTOMER_REVIEWS ||
            key === STORAGE_KEYS.GENERATED_DOCUMENTS ||
            key === STORAGE_KEYS.STAFF_ID_CARDS ||
            key === STORAGE_KEYS.PROMOTION_MEDIA
          ) {
            // Clean empty arrays for demo collections
            val = JSON.stringify([]);
            st.setItem(key, val);
          } else if (key === STORAGE_KEYS.CURRENT_USER) {
            try {
              const parsedUser = JSON.parse(val);
              if (isDummyRecord(parsedUser)) {
                st.removeItem(key);
                continue;
              }
            } catch {}
          }
          inMemoryStore.set(key, val);
        }
      }
    }
  } catch (err) {
    console.warn('Persistent storage init note:', err);
  }
};

initPersistentMemoryStore();

const inMemoryParsedCache = new Map<string, any>();

const memoryStorage = {
  getItem: (key: string): string | null => {
    let val = inMemoryStore.get(key) ?? null;
    if (val === null && typeof window !== 'undefined') {
      try {
        val = window.sessionStorage?.getItem(key) ?? null;
        if (val !== null) inMemoryStore.set(key, val);
      } catch {}
    }
    return val;
  },
  getParsed: <T = any>(key: string): T | null => {
    if (inMemoryParsedCache.has(key)) {
      return inMemoryParsedCache.get(key) as T;
    }
    const raw = memoryStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      inMemoryParsedCache.set(key, parsed);
      return parsed as T;
    } catch {
      return null;
    }
  },
  setItem: (key: string, val: string): void => {
    inMemoryStore.set(key, String(val));
    inMemoryParsedCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(key, String(val));
      } catch (err: any) {
        // Fallback to sessionStorage if localStorage throws
        try {
          window.sessionStorage?.setItem(key, String(val));
        } catch (sessErr: any) {
          // If storage quota exceeded, clear non-critical temporary keys to free quota
          try {
            const keysToEvict = ['dbs_media_gallery', 'medo_promotion_media', 'medo_generated_docs'];
            keysToEvict.forEach((k) => {
              window.localStorage?.removeItem(k);
              window.sessionStorage?.removeItem(k);
            });
            window.sessionStorage?.setItem(key, String(val));
          } catch {
            // inMemoryStore already has it, so the app remains 100% operational
          }
        }
      }
    }
  },
  setParsed: (key: string, obj: any): void => {
    inMemoryParsedCache.set(key, obj);
    let serialized = '';
    try {
      serialized = JSON.stringify(obj);
    } catch {
      return;
    }
    inMemoryStore.set(key, serialized);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(key, serialized);
      } catch (err: any) {
        try {
          window.sessionStorage?.setItem(key, serialized);
        } catch (sessErr: any) {
          try {
            const keysToEvict = ['dbs_media_gallery', 'medo_promotion_media', 'medo_generated_docs'];
            keysToEvict.forEach((k) => {
              window.localStorage?.removeItem(k);
              window.sessionStorage?.removeItem(k);
            });
            window.sessionStorage?.setItem(key, serialized);
          } catch {
            // Kept securely in memoryParsedCache & inMemoryStore
          }
        }
      }
    }
  },
  removeItem: (key: string): void => {
    inMemoryStore.delete(key);
    inMemoryParsedCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.removeItem(key);
        window.sessionStorage?.removeItem(key);
      } catch {}
    }
  },
  clear: (): void => {
    inMemoryStore.clear();
    inMemoryParsedCache.clear();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      } catch {}
    }
  }
};

class LoanStorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- SITE SETTINGS ---
  getSettings(): SiteSettings {
    if (!this.isBrowser()) return DEFAULT_SITE_SETTINGS;
    try {
      const parsed = memoryStorage.getParsed<SiteSettings>(STORAGE_KEYS.SETTINGS);
      if (!parsed) {
        memoryStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SITE_SETTINGS));
        return DEFAULT_SITE_SETTINGS;
      }
      // Auto-migrate legacy default name to 'DBS Bank SG'
      if (
        parsed.platformName === 'সহজ লোন' || 
        parsed.companyNameBn === 'সহজ লোন সেবা' || 
        parsed.platformName === 'বাংলাদেশ ব্যাংক ক্ষুদ্র লোন সেবা' ||
        parsed.companyNameBn === 'বাংলাদেশ ব্যাংক ক্ষুদ্র লোন সেবা' ||
        parsed.logoText === 'বাংলাদেশ ব্যাংক ক্ষুদ্র লোন সেবা' ||
        parsed.platformName === 'বাংলাদেশ ক্ষুদ্র লোন সেবা' ||
        parsed.companyNameBn === 'বাংলাদেশ ক্ষুদ্র লোন সেবা' ||
        parsed.logoText === 'বাংলাদেশ ক্ষুদ্র লোন সেবা' ||
        !parsed.platformName
      ) {
        parsed.platformName = 'DBS Bank SG';
        parsed.platformNameBn = 'DBS Bank SG';
        parsed.companyNameBn = 'DBS Bank SG';
        parsed.companyNameEn = 'DBS Bank SG';
        parsed.logoText = 'DBS Bank SG';
        parsed.heroTitleBn = 'DBS Bank SG, আপনার স্বপ্নের বিশ্বস্ত ব্যাংকিং সহযোগী';
        memoryStorage.setParsed(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SITE_SETTINGS, ...parsed });
      }
      if (parsed.supportPhone && (parsed.supportPhone.includes('যোগাযোগ') || parsed.supportPhone.includes('নম্বর'))) {
        parsed.supportPhone = parsed.supportPhone.replace(/^.*?(?:যোগাযোগ\s*নম্বর|মোবাইল|ফোন|হটলাইন|হেল্পলাইন)[:\s-]*/gi, '').trim();
      }
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  }

  updateSettings(settings: Partial<SiteSettings>, _triggerCloud = true): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncSettingsToCloud(updated).catch(console.warn);
    }
    return updated;
  }

  savePackagesFromCloud(packages: LoanPackage[]): void {
    if (!packages || packages.length === 0) return;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  setPackages(packages: LoanPackage[]): void {
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  // --- LOAN PACKAGES ---
  getPackages(): LoanPackage[] {
    if (!this.isBrowser()) return DEFAULT_PACKAGES;
    try {
      const parsed = memoryStorage.getParsed<LoanPackage[]>(STORAGE_KEYS.PACKAGES);
      if (!parsed) {
        memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
        return DEFAULT_PACKAGES;
      }
      return parsed;
    } catch {
      return DEFAULT_PACKAGES;
    }
  }

  getPackageById(id: string): LoanPackage | undefined {
    return this.getPackages().find((pkg) => pkg.id === id);
  }

  savePackage(pkg: LoanPackage, _triggerCloud = true): LoanPackage[] {
    const list = this.getPackages();
    const index = list.findIndex((item) => item.id === pkg.id);
    if (index >= 0) {
      list[index] = pkg;
    } else {
      list.push(pkg);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.pushPackage(pkg).catch(console.warn);
    }
    return list;
  }

  deletePackage(id: string, _triggerCloud = true): boolean {
    const list = this.getPackages();
    const filtered = list.filter((pkg) => pkg.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.deletePackage(id).catch(console.warn);
    }
    return true;
  }

  // --- APPLICATIONS ---
  getApplications(): LoanApplication[] {
    if (!this.isBrowser()) return DEFAULT_APPLICATIONS;
    try {
      const parsed = memoryStorage.getParsed<LoanApplication[]>(STORAGE_KEYS.APPLICATIONS);
      if (!parsed) {
        memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
        return DEFAULT_APPLICATIONS;
      }
      return parsed;
    } catch {
      return DEFAULT_APPLICATIONS;
    }
  }

  getApplicationById(id: string): LoanApplication | undefined {
    const list = this.getApplications();
    const cleanId = id.trim().toUpperCase();
    const norm = normalizePhone(id);
    return list.find((app) => {
      if (app.id.toUpperCase() === cleanId) return true;
      const appNorm = normalizePhone(app.phone);
      if (appNorm === norm) return true;
      if (norm.length >= 8 && appNorm.length >= 8) {
        if (appNorm.endsWith(norm) || norm.endsWith(appNorm)) return true;
      }
      return false;
    });
  }

  async submitApplication(
    app: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>
  ): Promise<LoanApplication> {
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `LN-${currentYear}-${randomSuffix}`;
    const today = new Date().toISOString().split('T')[0];

    const newApp: LoanApplication = {
      ...app,
      id: newId,
      status: 'pending',
      appliedDate: today
    };

    // Save to Supabase first. If this fails, reject the submission rather than
    // showing a false success message or saving a local-only application.
    await supabaseSync.syncApplicationToCloud(newApp);

    if (this.isBrowser()) {
      const list = this.getApplications();
      // Avoid duplicating the application if a retry happens.
      const withoutDuplicate = list.filter((item) => item.id !== newApp.id);
      withoutDuplicate.unshift(newApp);
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(withoutDuplicate));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    return newApp;
  }

  /**
   * Delete one application in the cloud first, then remove it from local cache.
   */
  async deleteApplication(id: string): Promise<void> {
    const cleanId = String(id || '').trim();
    if (!cleanId) throw new Error('Application ID is required.');
    await supabaseSync.deleteApplicationFromCloud(cleanId);
    if (this.isBrowser()) {
      const remaining = this.getApplications().filter((item) => item.id !== cleanId);
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(remaining));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  updateApplication(updated: LoanApplication): LoanApplication {
    const list = this.getApplications();
    const index = list.findIndex((item) => item.id === updated.id);
    if (index >= 0) {
      list[index] = updated;
      if (this.isBrowser()) {
        memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
        try {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('loan_data_updated'));
        } catch {
          // ignore
        }
      }
      try {
        supabaseSync.syncApplicationToCloud(updated);
      } catch {
        // ignore
      }
    }
    return updated;
  }

  async updateApplicationStatus(
    id: string,
    status: LoanApplication['status'],
    adminNotes?: string,
    extra?: { approvedAmount?: number; rejectedReason?: string }
  ): Promise<LoanApplication | null> {
    const list = this.getApplications();
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const app = list[index];

    app.status = status;
    if (adminNotes !== undefined) app.adminNotes = adminNotes;
    let targetUser: CustomerUser | undefined;

    if (status === 'approved') {
      app.approvedDate = today;
      app.approvedAmount = extra?.approvedAmount || app.loanAmount;
    } else if (status === 'disbursed') {
      app.disbursedDate = today;
      if (extra?.approvedAmount) {
        app.approvedAmount = extra.approvedAmount;
      }
      // Auto-generate installments if not already generated
      this.generateInstallmentsForLoan(app);

      // Auto-disburse exact loan amount directly to customer's wallet balance in Supabase
      const disburseAmt = Number(app.approvedAmount || app.loanAmount || 0);
      targetUser = (app.userId ? this.getUserById(app.userId) : undefined) || this.getUserByPhone(app.phone);

      // If user does not have a registered CustomerUser account, auto-create one now so funds never get lost
      if (!targetUser) {
        const cleanPhone = normalizePhone(app.phone);
        const newCustomerId = app.userId || `user-${Date.now()}`;
        targetUser = {
          id: newCustomerId,
          name: app.applicantName?.trim() || 'গ্রাহক',
          phone: cleanPhone,
          password: '123456',
          email: app.email?.trim() || `${cleanPhone}@shohojloan.com.bd`,
          nidNumber: app.nidNumber || 'প্রক্রিয়াধীন',
          bankAccountNumber: app.bankAccountNumber || generate16DigitBankAccountNumber(cleanPhone),
          accountNumber: app.bankAccountNumber || cleanPhone,
          accountType: 'Bank',
          role: 'customer',
          walletBalance: 0,
          status: 'active',
          isActive: true,
          kycVerified: true,
          registeredAt: app.appliedDate || new Date().toISOString(),
          profession: app.profession || 'বেসরকারি চাকরিজীবী',
          monthlyIncome: app.monthlyIncome || 45000,
          address: app.presentAddress || 'ঢাকা, বাংলাদেশ'
        };
        const currentUsers = this.getUsers();
        currentUsers.unshift(targetUser);
        if (this.isBrowser()) {
          memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(currentUsers));
        }
      }

      if (targetUser && disburseAmt > 0) {
        const walletResult = this.updateUserWallet(
          targetUser.id,
          disburseAmt,
          'loan_disbursement',
          'ঋণ ফান্ড বিতরণ (Approved Loan Disbursement)',
          `লোন আবেদন #${app.id} এর সম্পূর্ণ অনুমোদিত অর্থ ৳ ${disburseAmt.toLocaleString('en-IN')} সরাসরি ওয়ালেটে যুক্ত হয়েছে।`
        );
        if (walletResult.user) {
          targetUser = walletResult.user;
        }
      }
    } else if (status === 'rejected') {
      app.rejectedReason = extra?.rejectedReason || 'অনুপযুক্ত ডকুমেন্টেশন বা নীতিমালা পূরণ হয়নি';
    }

    list[index] = app;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
        window.dispatchEvent(new CustomEvent('loan_user_registered'));
        if (targetUser) {
          window.dispatchEvent(new CustomEvent('app_data_updated', { detail: { source: 'disburse', user: targetUser } }));
        }
        
        // Permanent sync to Supabase Cloud Database
        await Promise.allSettled([
          supabaseSync.syncApplicationToCloud(app),
          targetUser ? supabaseSync.syncUserToCloud(targetUser) : Promise.resolve()
        ]);
        
        supabaseSync.broadcastEvent('APPLICATION_SUBMITTED', app);
        if (targetUser) {
          supabaseSync.broadcastEvent('USER_REGISTERED', targetUser);
        }
      } catch (err) {
        console.error('Error syncing disburse to Supabase:', err);
      }
    }

    // Auto send notification to user
    const userForNotify = targetUser || (app.userId ? this.getUserById(app.userId) : undefined) || this.getUserByPhone(app.phone);
    if (userForNotify) {
      if (status === 'approved') {
        this.sendNotification({
          userId: userForNotify.id,
          phone: userForNotify.phone,
          title: 'লোন আবেদন অনুমোদিত হয়েছে!',
          message: `অভিনন্দন ${app.applicantName}! আপনার ৳ ${(app.approvedAmount || app.loanAmount).toLocaleString('en-IN')} টাকার ঋণ আবেদন সফলভাবে অনুমোদিত হয়েছে।`,
          sender: 'সহজ লোন ক্রেডিট কমিটি',
          type: 'success'
        });
      } else if (status === 'disbursed') {
        this.sendNotification({
          userId: userForNotify.id,
          phone: userForNotify.phone,
          title: 'ঋণের অর্থ অ্যাকাউন্টে বিতরণ সম্পন্ন!',
          message: `প্রিয় ${app.applicantName}, আপনার ঋণের অর্থ ৳ ${(app.approvedAmount || app.loanAmount).toLocaleString('en-IN')} সফলভাবে ওয়ালেটে যুক্ত হয়েছে। কিস্তির সময়সূচি দেখতে আপনার ড্যাশবোর্ডে প্রবেশ করুন।`,
          sender: 'সহজ লোন অ্যাকাউন্টস',
          type: 'success'
        });
      } else if (status === 'rejected') {
        this.sendNotification({
          userId: userForNotify.id,
          phone: userForNotify.phone,
          title: 'লোন আবেদন নামঞ্জুর হয়েছে',
          message: `প্রিয় ${app.applicantName}, আপনার ঋণ আবেদনটি বর্তমানে নামঞ্জুর করা হয়েছে। কারণ: ${app.rejectedReason || 'শর্তাবলী পূরণ হয়নি'}`,
          sender: 'সহজ লোন ক্রেডিট কমিটি',
          type: 'warning'
        });
      }
    }
    return app;
  }

  // --- INSTALLMENTS ---
  getInstallments(): Installment[] {
    if (!this.isBrowser()) return generateInitialInstallments();
    try {
      const parsed = memoryStorage.getParsed<Installment[]>(STORAGE_KEYS.INSTALLMENTS);
      if (!parsed) {
        const initial = generateInitialInstallments();
        memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(initial));
        return initial;
      }
      return parsed;
    } catch {
      return generateInitialInstallments();
    }
  }

  getInstallmentsByLoanId(loanId: string): Installment[] {
    return this.getInstallments().filter((inst) => inst.loanId === loanId);
  }

  generateInstallmentsForLoan(app: LoanApplication): Installment[] {
    const current = this.getInstallments();
    const existing = current.filter((i) => i.loanId === app.id);
    if (existing.length > 0) return existing;

    const newInsts: Installment[] = [];
    const baseDate = new Date();
    const monthlyPrincipal = Math.round(app.loanAmount / app.durationMonths);
    const monthlyInterest = Math.max(0, app.monthlyEMI - monthlyPrincipal);

    for (let i = 1; i <= app.durationMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      newInsts.push({
        id: `inst-${app.id}-${i}`,
        loanId: app.id,
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: app.monthlyEMI,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        status: 'pending'
      });
    }

    const merged = [...current, ...newInsts];
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(merged));
    }
    return newInsts;
  }

  payInstallment(
    installmentId: string,
    details: {
      paymentMethod: Installment['paymentMethod'];
      transactionId: string;
      slipName?: string;
    }
  ): Installment | null {
    const list = this.getInstallments();
    const index = list.findIndex((item) => item.id === installmentId);
    if (index < 0) return null;

    list[index] = {
      ...list[index],
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: details.paymentMethod,
      transactionId: details.transactionId,
      slipName: details.slipName
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(list));
    }
    return list[index];
  }

  recordInstallmentAdmin(
    installmentId: string,
    status: Installment['status'],
    details?: {
      paymentMethod?: Installment['paymentMethod'];
      transactionId?: string;
    }
  ): Installment | null {
    const list = this.getInstallments();
    const index = list.findIndex((item) => item.id === installmentId);
    if (index < 0) return null;

    list[index] = {
      ...list[index],
      status,
      paidDate: status === 'paid' ? (list[index].paidDate || new Date().toISOString().split('T')[0]) : undefined,
      paymentMethod: details?.paymentMethod || list[index].paymentMethod || 'Cash',
      transactionId: details?.transactionId || list[index].transactionId || 'ADMIN-REC'
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(list));
    }
    return list[index];
  }

  // --- USERS & AUTH ---
  getPurgedUsers(): string[] {
    if (!this.isBrowser()) return [];
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.PURGED_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addPurgedUser(identifier: string): void {
    if (!this.isBrowser() || !identifier) return;
    try {
      const list = this.getPurgedUsers();
      const clean = String(identifier).trim();
      if (!list.includes(clean)) {
        list.push(clean);
        memoryStorage.setItem(STORAGE_KEYS.PURGED_USERS, JSON.stringify(list));
      }
    } catch {}
  }

  getUsers(): CustomerUser[] {
    const purgedList = this.getPurgedUsers();
    const purgedSet = new Set(purgedList.map((p) => normalizePhone(p)));
    purgedList.forEach((p) => purgedSet.add(p));

    if (!this.isBrowser()) {
      return DEFAULT_USERS.filter((u) => !purgedSet.has(u.id) && !purgedSet.has(u.phone) && !purgedSet.has(normalizePhone(u.phone)));
    }
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.USERS);
      let list: CustomerUser[] = [];
      if (data === null) {
        list = DEFAULT_USERS.filter((u) => !purgedSet.has(u.id) && !purgedSet.has(u.phone) && !purgedSet.has(normalizePhone(u.phone)));
        memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
      } else {
        const parsed = JSON.parse(data);
        list = Array.isArray(parsed) ? parsed : [];
      }

      // Filter out any purged/deleted customers unconditionally
      list = list.filter((u) => !purgedSet.has(u.id) && !purgedSet.has(u.phone) && !purgedSet.has(normalizePhone(u.phone)));

      // Guarantee each customer has a deterministic 16-digit real bank account number starting with 1602
      return list.map((u) => {
        if (!u.bankAccountNumber || !u.bankAccountNumber.startsWith('1602') || u.bankAccountNumber.replace(/\D/g, '').length !== 16) {
          u.bankAccountNumber = generate16DigitBankAccountNumber(u.phone || u.id);
        }
        return u;
      });
    } catch (error) {
      console.warn('getUsers could not read saved users:', error);
      return [];
    }
  }

  /**
   * Merge one authoritative Supabase user record into the local view.
   * Matching by normalized phone prevents duplicate records when the phone
   * number has different formatting in the browser and database.
   */
  mergeUserFromCloud(cloudUser: CustomerUser, emitEvents = true): void {
    if (!this.isBrowser() || !cloudUser || !cloudUser.phone) return;

    try {
      const purgedList = this.getPurgedUsers();
      const purgedSet = new Set(purgedList.map((p) => normalizePhone(p)));
      purgedList.forEach((p) => purgedSet.add(p));
      if (purgedSet.has(cloudUser.phone) || (cloudUser.id && purgedSet.has(cloudUser.id)) || purgedSet.has(normalizePhone(cloudUser.phone))) {
        return; // Skip purged user
      }

      const users = this.getUsers();
      const normalizedIncomingPhone = normalizePhone(cloudUser.phone);
      const index = users.findIndex((user) =>
        (user.id && cloudUser.id && user.id === cloudUser.id) ||
        (normalizePhone(user.phone || '') === normalizedIncomingPhone)
      );

      // Ensure 16-digit bank account number
      if (!cloudUser.bankAccountNumber || !cloudUser.bankAccountNumber.startsWith('1602') || cloudUser.bankAccountNumber.replace(/\D/g, '').length !== 16) {
        cloudUser.bankAccountNumber = generate16DigitBankAccountNumber(cloudUser.phone || cloudUser.id);
      }

      if (index >= 0) {
        users[index] = { ...users[index], ...cloudUser };
      } else {
        users.unshift(cloudUser);
      }

      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const currentUser = this.getCurrentUser();
      if (
        currentUser &&
        ((currentUser.id && currentUser.id === cloudUser.id) ||
          normalizePhone(currentUser.phone || '') === normalizedIncomingPhone)
      ) {
        this.setCurrentUser({ ...currentUser, ...cloudUser });
      }

      if (emitEvents) {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_user_registered'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      }
    } catch (error) {
      console.warn('mergeUserFromCloud error:', error);
    }
  }

  saveUsersFromCloud(cloudUsers: CustomerUser[], emitEvents = true): void {
    if (!this.isBrowser() || !Array.isArray(cloudUsers)) return;
    try {
      const purgedList = this.getPurgedUsers();
      const purgedSet = new Set(purgedList.map((p) => normalizePhone(p)));
      purgedList.forEach((p) => purgedSet.add(p));

      const byIdentity = new Map<string, CustomerUser>();
      cloudUsers.forEach((user) => {
        if (!user) return;
        const phone = normalizePhone(user.phone);
        const key = phone || user.id;
        if (key && !purgedSet.has(user.id) && !purgedSet.has(user.phone) && !purgedSet.has(phone)) {
          if (!user.bankAccountNumber || !user.bankAccountNumber.startsWith('1602') || user.bankAccountNumber.replace(/\D/g, '').length !== 16) {
            user.bankAccountNumber = generate16DigitBankAccountNumber(user.phone || user.id);
          }
          byIdentity.set(key, user);
        }
      });
      const nextUsers = Array.from(byIdentity.values());
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(nextUsers));
      if (emitEvents) {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_user_registered'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      }
    } catch (e) {
      console.warn('saveUsersFromCloud error:', e);
    }
  }

  saveApplicationsFromCloud(cloudApps: LoanApplication[]): void {
    if (!this.isBrowser() || !Array.isArray(cloudApps)) return;
    try {
      // Replace the local snapshot with the cloud snapshot. Merge-only logic
      // leaves deleted records in memoryStorage and makes them reappear.
      const byId = new Map<string, LoanApplication>();
      cloudApps.forEach((app) => {
        if (app && app.id) byId.set(app.id, app);
      });
      const next = Array.from(byId.values()).sort((a, b) =>
        String(b.appliedDate || '').localeCompare(String(a.appliedDate || ''))
      );
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    } catch (e) {
      console.warn('saveApplicationsFromCloud error:', e);
    }
  }

  saveDepositsFromCloud(cloudDeps: DepositRequest[]): void {
    if (!this.isBrowser() || !cloudDeps || !cloudDeps.length) return;
    try {
      const current = this.getDepositRequests();
      let updated = false;
      cloudDeps.forEach((cd) => {
        const idx = current.findIndex((d) => d.id === cd.id);
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...cd };
          updated = true;
        } else {
          current.unshift(cd);
          updated = true;
        }
      });
      if (updated) {
        memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(current));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      }
    } catch (e) {
      console.warn('saveDepositsFromCloud error:', e);
    }
  }

  saveWithdrawalsFromCloud(cloudWds: WithdrawalRequest[]): void {
    if (!this.isBrowser() || !cloudWds || !cloudWds.length) return;
    try {
      const current = this.getWithdrawals();
      let updated = false;
      cloudWds.forEach((cw) => {
        const idx = current.findIndex((w) => w.id === cw.id);
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...cw };
          updated = true;
        } else {
          current.unshift(cw);
          updated = true;
        }
      });
      if (updated) {
        memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(current));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      }
    } catch (e) {
      console.warn('saveWithdrawalsFromCloud error:', e);
    }
  }

  getUserById(id: string): CustomerUser | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  getUserByPhone(phone: string): CustomerUser | undefined {
    const cleanPhone = normalizePhone(phone);
    const users = this.getUsers();
    return users.find((u) => {
      const uPhone = normalizePhone(u.phone);
      if (uPhone === cleanPhone) return true;
      const uDigits = uPhone.replace(/\D/g, '');
      const cleanDigits = cleanPhone.replace(/\D/g, '');
      if (uDigits && cleanDigits) {
        if (uDigits === cleanDigits) return true;
        if (uDigits.length >= 8 && cleanDigits.length >= 8) {
          if (uDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uDigits)) return true;
        }
      }
      return false;
    });
  }

  registerUser(data: { name: string; phone: string; password?: string; email?: string; nidNumber?: string; accountNumber?: string; accountType?: any }): { success: boolean; user?: CustomerUser; message: string } {
    const users = this.getUsers();
    const cleanPhone = normalizePhone(data.phone);
    if (users.some((u) => normalizePhone(u.phone) === cleanPhone)) {
      return { success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' };
    }

    const initialBound: Partial<Record<'bKash' | 'Nagad' | 'Rocket' | 'Bank', any>> = {};
    if (data.accountNumber && data.accountType) {
      const cleanAcc = normalizePhone(data.accountNumber);
      const accMethod = data.accountType as 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
      initialBound[accMethod] = {
        method: accMethod,
        accountNumber: cleanAcc,
        accountHolderName: data.name.trim(),
        boundAt: new Date().toISOString().split('T')[0],
        isLocked: true
      };
    }

    const newUser: CustomerUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      phone: cleanPhone,
      password: data.password || '123456',
      email: data.email?.trim() || `${cleanPhone}@shohojloan.com.bd`,
      nidNumber: data.nidNumber,
      bankAccountNumber: generate16DigitBankAccountNumber(cleanPhone),
      accountNumber: data.accountNumber ? normalizePhone(data.accountNumber) : undefined,
      accountType: data.accountType || undefined,
      boundWithdrawalAccounts: initialBound,
      role: 'customer',
      walletBalance: 0,
      status: 'active',
      isActive: true,
      kycVerified: false,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_user_registered', { detail: newUser }));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      } catch (e) {
        console.error(e);
      }
    }
    // Sync to Supabase Cloud & Broadcast immediately in real-time
    try {
      void supabaseSync.syncUserToCloud(newUser).catch((error) => console.error('Customer cloud sync failed:', error));
    } catch {
      // Ignore
    }
    this.setCurrentUser(newUser);

    // Welcome notification
    this.sendNotification({
      userId: newUser.id,
      title: 'সহজ লোন প্ল্যাটফর্মে আপনাকে স্বাগতম!',
      message: `প্রিয় ${newUser.name}, আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনি যেকোনো লোন স্কিমে আবেদন করতে পারবেন।`,
      sender: 'সহজ লোন কাস্টমার কেয়ার',
      type: 'info'
    });

    return { success: true, user: newUser, message: 'রেজিস্ট্রেশন সফল হয়েছে!' };
  }

  loginUser(phone: string, password?: string): { success: boolean; user?: CustomerUser; message: string } {
    const cleanPhone = normalizePhone(phone);
    const user = this.getUserByPhone(cleanPhone);

    if (!user) {
      return { success: false, message: 'এই মোবাইল নম্বরের কোনো গ্রাহক অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'ভুল পাসওয়ার্ড দিয়েছেন! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' };
    }

    if (user.status === 'suspended') {
      return { success: false, message: 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে। অনুগ্রহ করে হেল্পলাইনে যোগাযোগ করুন।' };
    }

    this.setCurrentUser(user);
    return { success: true, user, message: 'সফলভাবে লগইন হয়েছে!' };
  }

  getCurrentUser(): CustomerUser | null {
    if (!this.isBrowser()) return null;
    try {
      const parsed = memoryStorage.getParsed<CustomerUser>(STORAGE_KEYS.CURRENT_USER);
      if (!parsed) {
        return null; // Return null so guest visitor lands on Login/Register
      }
      return parsed;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: CustomerUser | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      memoryStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      memoryStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  logoutUser(): void {
    this.setCurrentUser(null);
  }

  // --- ADMIN AUTH ---
  static readonly ADMIN_CREDENTIALS = {
    username: 'Molla0506',
    password: 'Mdroton126799@'
  };

  isAdminAuthenticated(): boolean {
    if (!this.isBrowser()) return true;
    try {
      const fromMem = memoryStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      if (fromMem === 'true') return true;
      if (typeof window !== 'undefined') {
        const fromLocal = window.localStorage?.getItem(STORAGE_KEYS.ADMIN_AUTH);
        if (fromLocal === 'true') {
          memoryStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          return true;
        }
        const fromSession = window.sessionStorage?.getItem(STORAGE_KEYS.ADMIN_AUTH);
        if (fromSession === 'true') {
          memoryStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  loginAdmin(username: string, password: string): boolean {
    if (
      username.trim() === LoanStorageService.ADMIN_CREDENTIALS.username &&
      password.trim() === LoanStorageService.ADMIN_CREDENTIALS.password
    ) {
      if (this.isBrowser()) {
        memoryStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        try {
          window.localStorage?.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          window.sessionStorage?.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        } catch {}
      }
      return true;
    }
    return false;
  }

  logoutAdmin(): void {
    if (this.isBrowser()) {
      memoryStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      try {
        window.localStorage?.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        window.sessionStorage?.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      } catch {}
    }
  }

  // --- WALLET & BALANCE CONTROL ---
  updateUserWallet(
    userId: string,
    amountDelta: number,
    type: WalletTransaction['type'],
    title: string,
    description: string
  ): { success: boolean; user?: CustomerUser; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId || normalizePhone(u.phone || '') === normalizePhone(userId));
    if (index < 0) {
      return { success: false, message: 'গ্রাহক খুঁজে পাওয়া যায়নি' };
    }

    const currentBalance = users[index].walletBalance || 0;
    const newBalance = currentBalance + amountDelta;

    if (newBalance < 0 && amountDelta < 0) {
      return { success: false, message: 'গ্রাহকের অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!' };
    }

    users[index].walletBalance = Math.max(0, newBalance);

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      // Update current user if it is this user
      const cur = this.getCurrentUser();
      if (cur && (cur.id === users[index].id || normalizePhone(cur.phone || '') === normalizePhone(users[index].phone || ''))) {
        this.setCurrentUser(users[index]);
      }
      try {
        void supabaseSync.syncUserToCloud(users[index]).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // ignore
      }
    }

    // Record wallet transaction
    this.recordWalletTransaction({
      userId: users[index].id,
      type,
      amount: Math.abs(amountDelta),
      title,
      description,
      balanceAfter: users[index].walletBalance
    });

    // Notify user
    this.sendNotification({
      userId: users[index].id,
      title: amountDelta >= 0 ? 'ওয়ালেটে টাকা যুক্ত হয়েছে' : 'ওয়ালেট থেকে টাকা কর্তন হয়েছে',
      message: `${title}: ৳ ${Math.abs(amountDelta).toLocaleString('en-IN')}। বর্তমান ব্যালেন্স: ৳ ${users[index].walletBalance.toLocaleString('en-IN')}`,
      sender: 'সহজ লোন অ্যাকাউন্টস',
      type: amountDelta >= 0 ? 'success' : 'warning'
    });

    return { success: true, user: users[index], message: 'ব্যালেন্স সফলভাবে আপডেট হয়েছে!' };
  }

  // --- WALLET TRANSACTIONS ---
  getWalletTransactions(userId?: string): WalletTransaction[] {
    let list: WalletTransaction[] = DEFAULT_WALLET_TRANSACTIONS;
    if (this.isBrowser()) {
      try {
        const parsed = memoryStorage.getParsed<WalletTransaction[]>(STORAGE_KEYS.WALLET_TRANSACTIONS);
        if (parsed) list = parsed;
        else memoryStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(DEFAULT_WALLET_TRANSACTIONS));
      } catch {
        list = DEFAULT_WALLET_TRANSACTIONS;
      }
    }
    if (userId) {
      return list.filter((tx) => tx.userId === userId);
    }
    return list;
  }

  recordWalletTransaction(tx: Omit<WalletTransaction, 'id' | 'date'>): WalletTransaction {
    const list = this.getWalletTransactions();
    const newTx: WalletTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    list.unshift(newTx);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(list));
    }
    return newTx;
  }

  // --- WITHDRAWALS ---
  getWithdrawals(userId?: string): WithdrawalRequest[] {
    let list: WithdrawalRequest[] = DEFAULT_WITHDRAWALS;
    if (this.isBrowser()) {
      try {
        const parsed = memoryStorage.getParsed<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS);
        if (parsed) list = parsed;
        else memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(DEFAULT_WITHDRAWALS));
      } catch {
        list = DEFAULT_WITHDRAWALS;
      }
    }
    if (userId) {
      return list.filter((w) => w.userId === userId || w.phone === userId);
    }
    return list;
  }

  createWithdrawal(request: {
    userId: string;
    customerName: string;
    phone: string;
    amount: number;
    method: PaymentChannel;
    accountNumber: string;
    accountHolderName?: string;
    bankName?: string;
    branchName?: string;
  }): { success: boolean; withdrawal?: WithdrawalRequest; message: string } {
    const user = this.getUserById(request.userId) || this.getUserByPhone(request.phone);
    if (!user) {
      return { success: false, message: 'গ্রাহক তথ্য পাওয়া যায়নি!' };
    }

    if (user.walletBalance < request.amount) {
      return { success: false, message: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' };
    }

    if (request.amount < 100) {
      return { success: false, message: 'সর্বনিম্ন উইথড্রয়াল পরিমাণ ১০০ টাকা।' };
    }

    // Deduct immediately on request submission to hold funds
    this.updateUserWallet(
      user.id,
      -request.amount,
      'withdrawal',
      `${request.method} উইথড্রয়াল আবেদন`,
      `উইথড্র আবেদন নং জমা হয়েছে (হোল্ড ব্যালেন্স)`
    );

    const list = this.getWithdrawals();
    const newReq: WithdrawalRequest = {
      id: `WTH-${Date.now().toString().slice(-4)}`,
      userId: user.id,
      customerName: request.customerName,
      phone: request.phone,
      amount: request.amount,
      method: request.method,
      accountNumber: request.accountNumber,
      accountHolderName: request.accountHolderName,
      bankName: request.bankName,
      branchName: request.branchName,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };

    list.unshift(newReq);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
      try {
        supabaseSync.syncWithdrawalToCloud(newReq);
      } catch {
        // ignore
      }
    }

    // Notify user
    this.sendNotification({
      userId: user.id,
      title: 'উইথড্র আবেদন গ্রহণ করা হয়েছে',
      message: `আপনার ৳ ${request.amount.toLocaleString('en-IN')} টাকার ${request.method} উইথড্রয়াল আবেদনটি গৃহীত হয়েছে। অ্যাডমিন ভেরিফিকেশনের পর দ্রুত টাকা প্রদান করা হবে।`,
      sender: 'সহজ লোন পেমেন্ট গেটওয়ে',
      type: 'info'
    });

    return { success: true, withdrawal: newReq, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!' };
  }

  processWithdrawal(
    id: string,
    status: 'approved' | 'rejected',
    adminNote?: string,
    transactionProof?: string
  ): WithdrawalRequest | null {
    const list = this.getWithdrawals();
    const index = list.findIndex((w) => w.id === id);
    if (index < 0) return null;

    const req = list[index];
    req.status = status;
    req.processedDate = new Date().toISOString().split('T')[0];
    if (adminNote) req.adminNote = adminNote;
    if (transactionProof) req.transactionProof = transactionProof;

    if (status === 'rejected') {
      // Refund money back to user wallet
      this.updateUserWallet(
        req.userId,
        req.amount,
        'credit',
        'উইথড্রয়াল বাতিল রিফান্ড',
        `উইথড্র আবেদন ${req.id} বাতিলের কারণে ব্যালেন্স রিফান্ড: ${adminNote || 'তথ্য গরমিল'}`
      );
      this.sendNotification({
        userId: req.userId,
        title: 'উইথড্র আবেদন প্রত্যাখ্যাত',
        message: `আপনার উইথড্র আবেদন ${req.id} প্রত্যাখ্যাত হয়েছে। টাকা ওয়ালেটে ফেরত দেওয়া হয়েছে। কারণ: ${adminNote || 'তথ্য যাচাই করা যায়নি'}`,
        sender: 'সহজ লোন অ্যাকাউন্টস',
        type: 'warning'
      });
    } else if (status === 'approved') {
      this.sendNotification({
        userId: req.userId,
        title: 'উইথড্র সম্পন্ন ও টাকা পাঠানো হয়েছে!',
        message: `আপনার উইথড্র আবেদন ${req.id} অনুমোদিত হয়েছে। ${req.method} নম্বরে টাকা পাঠানো হয়েছে। ট্রানজেকশন প্রুফ: ${transactionProof || 'N/A'}`,
        sender: 'সহজ লোন অ্যাকাউন্টস',
        type: 'success'
      });
    }

    list[index] = req;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
        supabaseSync.syncWithdrawalToCloud(req);
        supabaseSync.broadcastEvent('WITHDRAWAL_SUBMITTED', req);
      } catch {
        // ignore
      }
    }
    return req;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): AppNotification[] {
    let list: AppNotification[] = DEFAULT_NOTIFICATIONS;
    if (this.isBrowser()) {
      try {
        const parsed = memoryStorage.getParsed<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
        if (parsed) list = parsed;
        else memoryStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
      } catch {
        list = DEFAULT_NOTIFICATIONS;
      }
    }
    if (userId) {
      return list.filter((n) => n.userId === 'all' || n.userId === userId);
    }
    return list;
  }

  sendNotification(data: Omit<AppNotification, 'id' | 'date' | 'read'>): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    list.unshift(newNotif);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
    return newNotif;
  }

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      if (this.isBrowser()) {
        memoryStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      }
    }
  }

  // --- LOAN APPROVAL LETTERS (BANK-STYLE SANCTION PDF/LETTER) ---
  getApprovalLetters(userId?: string): LoanApprovalLetter[] {
    let list: LoanApprovalLetter[] = DEFAULT_APPROVAL_LETTERS;
    if (this.isBrowser()) {
      try {
        const data = memoryStorage.getItem(STORAGE_KEYS.APPROVAL_LETTERS);
        if (data) list = JSON.parse(data);
        else memoryStorage.setItem(STORAGE_KEYS.APPROVAL_LETTERS, JSON.stringify(DEFAULT_APPROVAL_LETTERS));
      } catch {
        list = DEFAULT_APPROVAL_LETTERS;
      }
    }
    if (userId) {
      return list.filter((ltr) => ltr.userId === userId || ltr.phone === userId);
    }
    return list;
  }

  getApprovalLetterByLoanId(loanId: string): LoanApprovalLetter | undefined {
    return this.getApprovalLetters().find((l) => l.loanId === loanId);
  }

  saveApprovalLetter(letter: Omit<LoanApprovalLetter, 'id'> & { id?: string }): LoanApprovalLetter {
    const list = this.getApprovalLetters();
    const existingIndex = list.findIndex((l) => l.loanId === letter.loanId || (letter.id && l.id === letter.id));
    
    let saved: LoanApprovalLetter;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...letter };
      list[existingIndex] = saved;
    } else {
      saved = {
        ...letter,
        id: letter.id || `ltr-${Date.now()}`
      };
      list.unshift(saved);
    }

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.APPROVAL_LETTERS, JSON.stringify(list));
    }

    // Also send user a notification
    this.sendNotification({
      userId: saved.userId,
      title: 'লোন পাশের অফিশিয়াল লেটার তৈরি হয়েছে!',
      message: `আপনার লোন আবেদন ${saved.loanId}-এর ব্যাংক-স্টাইল অফিশিয়াল অনুমোদন পত্র তৈরি হয়েছে। আপনি ড্যাশবোর্ড থেকে তা দেখতে ও ডাউনলোড করতে পারবেন।`,
      sender: 'সহজ লোন হেড অফিস',
      type: 'loan'
    });

    return saved;
  }

  savePaymentMethodsFromCloud(methods: PaymentMethodConfig[]): void {
    if (!methods) return;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  // --- PAYMENT METHODS DYNAMIC CONFIGURATION ---
  getActiveDepositAccountSummary(): string {
    const list = this.getPaymentMethods();
    const summary = formatActivePaymentMethodsSummary(list);
    return summary || 'বিকাশ (Agent): 01762731633 / নগদ (Agent): 01333994575';
  }

  getPaymentMethods(): PaymentMethodConfig[] {
    if (!this.isBrowser()) return DEFAULT_PAYMENT_METHODS;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
        return DEFAULT_PAYMENT_METHODS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PAYMENT_METHODS;
    }
  }

  savePaymentMethod(method: PaymentMethodConfig, _triggerCloud = true): PaymentMethodConfig[] {
    const list = this.getPaymentMethods();
    const index = list.findIndex((m) => m.id === method.id);
    if (index >= 0) {
      list[index] = method;
    } else {
      list.push(method);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncPaymentMethodToCloud(method).catch(console.warn);
    }
    return list;
  }

  deletePaymentMethod(id: string, _triggerCloud = true): boolean {
    const list = this.getPaymentMethods();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.deletePaymentMethodFromCloud(id).catch(console.warn);
    }
    return true;
  }

  // --- DEPOSIT REQUESTS & WALLET CREDIT ---
  getDepositRequests(userId?: string): DepositRequest[] {
    let list: DepositRequest[] = DEFAULT_DEPOSIT_REQUESTS;
    if (this.isBrowser()) {
      try {
        const parsed = memoryStorage.getParsed<DepositRequest[]>(STORAGE_KEYS.DEPOSIT_REQUESTS);
        if (parsed) list = parsed;
        else memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(DEFAULT_DEPOSIT_REQUESTS));
      } catch {
        list = DEFAULT_DEPOSIT_REQUESTS;
      }
    }
    if (userId) {
      return list.filter((d) => d.userId === userId || d.phone === userId);
    }
    return list;
  }

  createDepositRequest(data: Omit<DepositRequest, 'id' | 'status' | 'requestDate'>): { success: boolean; message: string; deposit?: DepositRequest } {
    const list = this.getDepositRequests();
    const newDep: DepositRequest = {
      ...data,
      id: `DEP-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };
    list.unshift(newDep);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(list));
      try {
        supabaseSync.syncDepositToCloud(newDep);
      } catch {
        // ignore
      }
    }

    // Notify user
    this.sendNotification({
      userId: newDep.userId,
      title: 'ডিপোজিট আবেদন জমা হয়েছে',
      message: `${newDep.methodName}-এর মাধ্যমে ${formatTaka(newDep.amount)} জমা দেওয়ার রিকোয়েস্ট গৃহীত হয়েছে। এডমিন ভেরিফাই করে দ্রুত ব্যালেন্স যুক্ত করবেন।`,
      sender: 'সহজ লোন পেমেন্ট গেটওয়ে',
      type: 'info'
    });

    return {
      success: true,
      message: 'আপনার ডিপোজিট আবেদন সফলভাবে জমা হয়েছে! এডমিন যাচাই করে দ্রুত ব্যালেন্স যোগ করবেন।',
      deposit: newDep
    };
  }

  processDepositRequest(id: string, status: 'approved' | 'rejected', adminNote?: string): boolean {
    const list = this.getDepositRequests();
    const item = list.find((d) => d.id === id);
    if (!item || item.status !== 'pending') return false;

    item.status = status;
    item.approvedDate = new Date().toISOString().split('T')[0];
    if (adminNote) item.adminNote = adminNote;

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(list));
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
        supabaseSync.syncDepositToCloud(item);
        supabaseSync.broadcastEvent('DEPOSIT_SUBMITTED', item);
      } catch {
        // ignore
      }
    }

    if (status === 'approved') {
      // Auto Credit Customer Wallet Balance!
      this.updateUserWallet(
        item.userId,
        item.amount,
        'credit',
        `${item.methodName} ডিপোজিট নিশ্চিতকরণ`,
        `ট্রানজেকশন আইডি ${item.transactionId}-এর মাধ্যমে সফল ডিপোজিট অনুমোদিত হয়েছে।`
      );

      this.sendNotification({
        userId: item.userId,
        title: 'ডিপোজিট অনুমোদিত হয়েছে! টাকা ওয়ালেটে যোগ হয়েছে',
        message: `আপনার ${item.methodName}-এর মাধ্যমে পাঠানো ${formatTaka(item.amount)} সফলভাবে আপনার ওয়ালেটে জমা হয়েছে।`,
        sender: 'সহজ লোন অ্যাকাউন্টস বিভাগ',
        type: 'success'
      });
    } else {
      this.sendNotification({
        userId: item.userId,
        title: 'ডিপোজিট আবেদন সাময়িকভাবে প্রত্যাখ্যাত',
        message: `আপনার ${item.methodName} ডিপোজিট (${formatTaka(item.amount)}) যাচাই ব্যর্থ হয়েছে। কারণ: ${adminNote || 'ভুল ট্রানজেকশন আইডি বা অপর্যাপ্ত তথ্য'}। অনুগ্রহ করে হেল্পলাইনে যোগাযোগ করুন।`,
        sender: 'সহজ লোন অ্যাকাউন্টস বিভাগ',
        type: 'warning'
      });
    }

    return true;
  }

  // --- CUSTOMER SUPPORT CONFIG (IMO, WHATSAPP, TELEGRAM, CALL) ---
  getCustomerSupport(): CustomerSupportConfig {
    if (!this.isBrowser()) return DEFAULT_CUSTOMER_SUPPORT;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.CUSTOMER_SUPPORT);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_SUPPORT, JSON.stringify(DEFAULT_CUSTOMER_SUPPORT));
        return DEFAULT_CUSTOMER_SUPPORT;
      }
      const parsed: CustomerSupportConfig = JSON.parse(data);
      // Ensure channels array is populated
      if (!parsed.channels || parsed.channels.length === 0) {
        parsed.channels = [...DEFAULT_CUSTOMER_SUPPORT.channels!];
      }
      return parsed;
    } catch {
      return DEFAULT_CUSTOMER_SUPPORT;
    }
  }

  updateCustomerSupport(config: Partial<CustomerSupportConfig>, _triggerCloud = true): CustomerSupportConfig {
    const current = this.getCustomerSupport();
    const updated = { ...current, ...config };
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_SUPPORT, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncCustomerSupportToCloud(updated).catch(console.warn);
    }
    return updated;
  }

  // --- PARTNER BANKS CONFIGURATION ---
  getPartnerBanks(): PartnerBankConfig[] {
    if (!this.isBrowser()) return DEFAULT_PARTNER_BANKS;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.PARTNER_BANKS);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.PARTNER_BANKS, JSON.stringify(DEFAULT_PARTNER_BANKS));
        return DEFAULT_PARTNER_BANKS;
      }
      const parsed: PartnerBankConfig[] = JSON.parse(data);
      // Migrate old external / broken images to local crisp SVGs
      const needsMigration = parsed.some(b => !b.logoUrl || b.logoUrl.includes('images.unsplash.com') || b.logoUrl.includes('wikimedia.org'));
      if (needsMigration) {
        const migrated = parsed.map(b => {
          const defaultMatch = DEFAULT_PARTNER_BANKS.find(def => def.id === b.id);
          if (defaultMatch) {
            return { 
              ...b, 
              logoUrl: defaultMatch.logoUrl, 
              websiteUrl: b.websiteUrl || defaultMatch.websiteUrl,
              nameBn: defaultMatch.nameBn,
              nameEn: defaultMatch.nameEn
            };
          }
          return b;
        });
        memoryStorage.setItem(STORAGE_KEYS.PARTNER_BANKS, JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
    } catch {
      return DEFAULT_PARTNER_BANKS;
    }
  }

  savePartnerBank(bank: PartnerBankConfig, _triggerCloud = true): PartnerBankConfig[] {
    const list = this.getPartnerBanks();
    const index = list.findIndex((b) => b.id === bank.id);
    if (index >= 0) {
      list[index] = bank;
    } else {
      list.push(bank);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PARTNER_BANKS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncPartnerBanksToCloud(list).catch(console.warn);
    }
    return list;
  }

  deletePartnerBank(id: string, _triggerCloud = true): boolean {
    const list = this.getPartnerBanks();
    const filtered = list.filter((b) => b.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PARTNER_BANKS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncPartnerBanksToCloud(filtered).catch(console.warn);
    }
    return true;
  }

  // --- CONTRACT PAPERS (OFFICIAL LEGAL AGREEMENTS) ---
  getContractPapers(userId?: string): ContractPaper[] {
    let list: ContractPaper[] = [];
    if (this.isBrowser()) {
      try {
        const data = memoryStorage.getItem(STORAGE_KEYS.CONTRACT_PAPERS);
        if (data) list = JSON.parse(data);
      } catch {
        list = [];
      }
    }
    if (userId) {
      return list.filter((c) => c.userId === userId || c.phone === userId);
    }
    return list;
  }

  getContractPaperByLoanId(loanId: string): ContractPaper | undefined {
    return this.getContractPapers().find((c) => c.loanId === loanId);
  }

  saveContractPaper(paper: Omit<ContractPaper, 'id'> & { id?: string }): ContractPaper {
    const list = this.getContractPapers();
    const existingIndex = list.findIndex((c) => c.loanId === paper.loanId || (paper.id && c.id === paper.id));

    let saved: ContractPaper;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...paper };
      list[existingIndex] = saved;
    } else {
      saved = {
        ...paper,
        id: paper.id || `ctr-${Date.now()}`
      };
      list.unshift(saved);
    }

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CONTRACT_PAPERS, JSON.stringify(list));
    }

    // Sync to Supabase cloud site_contracts table
    try {
      supabaseSync.syncContractToCloud(saved);
    } catch (e) {
      console.warn('Contract cloud sync error:', e);
    }

    // Notify user only if contract is sent
    if (saved.status === 'sent') {
      this.sendNotification({
        userId: saved.userId,
        title: 'লোন চুক্তিপত্র (Contract Paper) অনুমোদিত ও প্রেরিত হয়েছে!',
        message: `আপনার লোন আবেদন ${saved.loanId}-এর অফিসিয়াল আইনি চুক্তিপত্র প্রস্তুত ও পাঠানো হয়েছে। চুক্তিপত্র ট্যাবে দেখুন।`,
        sender: 'DBS Bank SG ★ আইন ও ঋণ বিভাগ',
        type: 'loan'
      });
    }

    return saved;
  }

  deleteContractPaper(id: string): boolean {
    const list = this.getContractPapers();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CONTRACT_PAPERS, JSON.stringify(filtered));
    }
    try {
      supabaseSync.deleteContractFromCloud(id);
    } catch (e) {
      console.warn('Contract cloud delete error:', e);
    }
    return true;
  }

  // --- PERMANENT CUSTOMER PURGE DELETE & DOCUMENT MANAGEMENT ---
  async purgeCustomerCompletely(identifier: string): Promise<{ 
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
  }> {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === identifier || u.phone === identifier);
    
    // Also find target applicant by phone or id
    const apps = this.getApplications();
    const userApps = apps.filter((a) => 
      (targetUser && a.phone === targetUser.phone) || 
      a.phone === identifier || 
      a.id === identifier ||
      (targetUser && a.applicantName.toLowerCase() === targetUser.name.toLowerCase())
    );
    const targetPhone = targetUser?.phone || (userApps[0]?.phone) || identifier;
    const targetUserId = targetUser?.id || targetPhone;
    const deletedAppIds = new Set(userApps.map((a) => a.id));

    // Confirm the cloud cascade delete before removing the local copy.
    // If Supabase rejects the operation, preserve local data and report failure.
    try {
      await supabaseSync.purgeCustomerFromCloud(
        targetPhone,
        targetUserId,
        Array.from(deletedAppIds)
      );
    } catch (error) {
      console.error('Cloud customer purge failed:', error);
      return {
        success: false,
        message: 'Supabase থেকে গ্রাহকের তথ্য মুছতে সমস্যা হয়েছে। ডেটা স্থানীয়ভাবে মুছে ফেলা হয়নি। Supabase permissions/RLS এবং network connection পরীক্ষা করুন।',
        deletedCounts: {
          applications: 0,
          installments: 0,
          deposits: 0,
          withdrawals: 0,
          transactions: 0,
          contracts: 0,
          letters: 0,
          notifications: 0
        }
      };
    }

    // 1. Remove from Users and register in purged users list
    this.addPurgedUser(targetPhone);
    this.addPurgedUser(normalizePhone(targetPhone));
    this.addPurgedUser(targetUserId);
    this.addPurgedUser(identifier);

    const normTarget = normalizePhone(targetPhone);
    const updatedUsers = users.filter((u) => 
      u.id !== targetUserId && 
      u.phone !== targetPhone && 
      normalizePhone(u.phone) !== normTarget &&
      u.id !== identifier &&
      u.phone !== identifier
    );
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      // Also clear active session if the deleted user is currently logged in
      const current = this.getCurrentUser();
      if (current && (current.id === targetUserId || normalizePhone(current.phone) === normTarget)) {
        this.logoutUser();
      }
    }

    // 2. Remove Applications
    const updatedApps = apps.filter((a) => !deletedAppIds.has(a.id) && a.phone !== targetPhone);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
    }

    // 3. Remove Installments
    const insts = this.getInstallments();
    const updatedInsts = insts.filter((i) => !deletedAppIds.has(i.loanId));
    const deletedInstCount = insts.length - updatedInsts.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(updatedInsts));
    }

    // 4. Remove Deposits
    const deposits = this.getDepositRequests();
    const updatedDeposits = deposits.filter((d) => d.userId !== targetUserId && d.phone !== targetPhone);
    const deletedDepositCount = deposits.length - updatedDeposits.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(updatedDeposits));
    }

    // 5. Remove Withdrawals
    const withdrawals = this.getWithdrawals();
    const updatedWithdrawals = withdrawals.filter((w) => w.userId !== targetUserId && w.phone !== targetPhone);
    const deletedWthCount = withdrawals.length - updatedWithdrawals.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(updatedWithdrawals));
    }

    // 6. Remove Wallet Transactions
    const txs = this.getWalletTransactions();
    const updatedTxs = txs.filter((t) => t.userId !== targetUserId);
    const deletedTxCount = txs.length - updatedTxs.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(updatedTxs));
    }

    // 7. Remove Sanction / Approval Letters
    const letters = this.getApprovalLetters();
    const updatedLetters = letters.filter((l) => l.userId !== targetUserId && l.phone !== targetPhone && !deletedAppIds.has(l.loanId));
    const deletedLetterCount = letters.length - updatedLetters.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.APPROVAL_LETTERS, JSON.stringify(updatedLetters));
    }

    // 8. Remove Contract Papers
    const contracts = this.getContractPapers();
    const updatedContracts = contracts.filter((c) => c.userId !== targetUserId && c.phone !== targetPhone && !deletedAppIds.has(c.loanId));
    const deletedContractCount = contracts.length - updatedContracts.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CONTRACT_PAPERS, JSON.stringify(updatedContracts));
    }

    // 9. Remove Notifications
    const notifs = this.getNotifications();
    const updatedNotifs = notifs.filter((n) => n.userId !== targetUserId && n.userId !== targetPhone);
    const deletedNotifCount = notifs.length - updatedNotifs.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifs));
    }

    // 10. Remove Customer Fixed Deposits
    const fds = this.getCustomerFixedDeposits();
    const updatedFds = fds.filter((f) => f.phone !== targetPhone && f.id !== targetUserId && f.userId !== targetUserId);
    const deletedFdCount = fds.length - updatedFds.length;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(updatedFds));
    }

    // 11. If current logged in user was this deleted user, logout session
    const cur = this.getCurrentUser();
    if (cur && (cur.id === targetUserId || cur.phone === targetPhone)) {
      this.setCurrentUser(null);
    }

    // Dispatch events
    if (this.isBrowser()) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    return {
      success: true,
      message: `গ্রাহকের প্রোফাইল ও সমস্ত হিস্ট্রি (আবেদন: ${userApps.length}, কিস্তি: ${deletedInstCount}, ডিপোজিট: ${deletedDepositCount}, উইথড্র: ${deletedWthCount}, ফিক্সড ডিপোজিট: ${deletedFdCount}, চুক্তিপত্র: ${deletedContractCount}) স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
      deletedCounts: {
        applications: userApps.length,
        installments: deletedInstCount,
        deposits: deletedDepositCount,
        withdrawals: deletedWthCount,
        transactions: deletedTxCount,
        contracts: deletedContractCount,
        letters: deletedLetterCount,
        notifications: deletedNotifCount
      }
    };
  }

  // Get all documents for a customer (from both user profile and all loan applications and deposit slips)
  getAllDocumentsForCustomer(identifier: string): LoanApplicationDocument[] {
    const normId = normalizePhone(identifier);
    const user = this.getUserById(identifier) || this.getUserByPhone(identifier);
    const userPhone = user ? normalizePhone(user.phone) : normId;
    const userName = user?.name?.toLowerCase().trim() || identifier.toLowerCase().trim();

    const apps = this.getApplications().filter((a) => {
      const appPhoneNorm = normalizePhone(a.phone);
      return (
        a.userId === identifier ||
        (user && a.userId === user.id) ||
        appPhoneNorm === userPhone ||
        appPhoneNorm === normId ||
        (userName && a.applicantName.toLowerCase().trim() === userName)
      );
    });

    const docs: LoanApplicationDocument[] = [];
    const seenIds = new Set<string>();

    // Only collect documents that the client actually submitted
    apps.forEach((a) => {
      (a.documents || []).forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          docs.push({
            ...d,
            previewUrl: d.previewUrl || ''
          });
        }
      });
    });

    // Also check if deposits had an uploaded payment slip by client
    const deposits = this.getDepositRequests().filter((dp) => {
      const dpPhoneNorm = normalizePhone(dp.phone);
      return dp.userId === identifier || dpPhoneNorm === userPhone || dpPhoneNorm === normId;
    });
    deposits.forEach((dp) => {
      if (dp.slipUrl) {
        const slipId = `slip-${dp.id}`;
        if (!seenIds.has(slipId)) {
          seenIds.add(slipId);
          docs.push({
            id: slipId,
            name: `${dp.methodName} পেমেন্ট স্লিপ - ${dp.transactionId}`,
            type: 'image/jpeg',
            size: '540 KB',
            uploadDate: dp.requestDate,
            category: 'deposit_slip',
            previewUrl: dp.slipUrl,
            status: dp.status === 'approved' ? 'verified' : dp.status === 'rejected' ? 'rejected' : 'pending'
          });
        }
      }
    });

    // Strictly return only genuine client uploaded documents - NO dummy fallback
    return docs;
  }

  // --- FIXED DEPOSIT / DPS SCHEMES & ACCOUNTS ---
  saveDpsSchemesFromCloud(schemes: FixedDepositScheme[]): void {
    if (!schemes || schemes.length === 0) return;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES, JSON.stringify(schemes));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  getFixedDepositSchemes(): FixedDepositScheme[] {
    if (!this.isBrowser()) return DEFAULT_FIXED_DEPOSIT_SCHEMES;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES, JSON.stringify(DEFAULT_FIXED_DEPOSIT_SCHEMES));
        return DEFAULT_FIXED_DEPOSIT_SCHEMES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_FIXED_DEPOSIT_SCHEMES;
    }
  }

  saveFixedDepositScheme(scheme: FixedDepositScheme, _triggerCloud = true): FixedDepositScheme[] {
    const list = this.getFixedDepositSchemes();
    const index = list.findIndex((s) => s.id === scheme.id);
    if (index >= 0) {
      list[index] = scheme;
    } else {
      list.push(scheme);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.syncDpsSchemeToCloud(scheme).catch(console.warn);
    }
    return list;
  }

  deleteFixedDepositScheme(id: string, _triggerCloud = true): boolean {
    const list = this.getFixedDepositSchemes();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.deleteDpsSchemeFromCloud(id).catch(console.warn);
    }
    return true;
  }

  getCustomerFixedDeposits(userId?: string): CustomerFixedDeposit[] {
    let list: CustomerFixedDeposit[] = DEFAULT_CUSTOMER_FIXED_DEPOSITS;
    if (this.isBrowser()) {
      try {
        const data = memoryStorage.getItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS);
        if (data) list = JSON.parse(data);
        else memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(DEFAULT_CUSTOMER_FIXED_DEPOSITS));
      } catch {
        list = DEFAULT_CUSTOMER_FIXED_DEPOSITS;
      }
    }

    // Automatically check and accrue daily profits for any elapsed days
    this.accrueDailyFixedDepositProfitsSilently(list);

    if (userId) {
      return list.filter((d) => d.userId === userId || d.phone === userId);
    }
    return list;
  }

  // Internal silent daily profit accrual engine
  private accrueDailyFixedDepositProfitsSilently(list: CustomerFixedDeposit[]): void {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    for (const fd of list) {
      if (fd.status === 'active' && fd.dailyProfitPercent && fd.dailyProfitPercent > 0) {
        const lastDate = fd.lastAccruedDate || (fd.approvedAt ? fd.approvedAt.split('T')[0] : fd.createdAt);
        if (lastDate && lastDate < today) {
          const diffTime = Math.abs(new Date(today).getTime() - new Date(lastDate).getTime());
          const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          if (diffDays > 0) {
            const dailyRate = fd.dailyProfitPercent;
            const singleDayProfit = Math.round((fd.depositAmount * dailyRate) / 100);
            const totalProfitAdded = singleDayProfit * diffDays;
            fd.totalProfitEarned = (fd.totalProfitEarned || 0) + totalProfitAdded;
            fd.dailyProfitAmount = singleDayProfit;
            fd.lastAccruedDate = today;
            changed = true;
          }
        }
      }
    }

    if (changed && this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to save accrued profits:', err);
      }
    }
  }

  createCustomerFixedDeposit(deposit: Omit<CustomerFixedDeposit, 'id' | 'createdAt'>): CustomerFixedDeposit {
    const list = this.getCustomerFixedDeposits();
    const newDeposit: CustomerFixedDeposit = {
      ...deposit,
      id: `cfd-${Date.now()}`,
      status: deposit.status || 'pending', // Starts as pending for admin verification
      totalProfitEarned: deposit.totalProfitEarned || 0,
      dailyProfitPercent: deposit.dailyProfitPercent || 1.0,
      dailyProfitAmount: Math.round((deposit.depositAmount * (deposit.dailyProfitPercent || 1.0)) / 100),
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newDeposit);
    if (this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      } catch (err) {
        console.warn('memoryStorage setItem exceeded quota, attempting trimmed backup:', err);
        try {
          const trimmedList = list.map(item => item.id === newDeposit.id ? { ...item, slipUrl: undefined } : item);
          memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(trimmedList));
        } catch {
          // Ignore
        }
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    // Realtime Supabase Cloud & Multi-window Broadcast Sync
    supabaseSync.syncCustomerFixedDepositToCloud(newDeposit).catch(console.warn);
    supabaseSync.broadcastEvent('CUSTOMER_FIXED_DEPOSIT_SUBMITTED', newDeposit);

    return newDeposit;
  }

  saveCustomerFixedDepositsFromCloud(cloudDeposits: CustomerFixedDeposit[]): void {
    if (!cloudDeposits || cloudDeposits.length === 0) return;
    const current = this.getCustomerFixedDeposits();
    const map = new Map<string, CustomerFixedDeposit>();
    current.forEach((d) => map.set(d.id, d));
    cloudDeposits.forEach((cd) => {
      map.set(cd.id, { ...(map.get(cd.id) || {}), ...cd });
    });
    const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(merged));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loan_data_updated'));
      } catch (err) {
        console.warn('Storage saveCustomerFixedDepositsFromCloud quota error:', err);
      }
    }
  }

  approveCustomerFixedDeposit(id: string, dailyProfitPercent: number, adminNote?: string): boolean {
    const list = this.getCustomerFixedDeposits();
    const deposit = list.find((d) => d.id === id);
    if (!deposit) return false;

    const today = new Date().toISOString().split('T')[0];
    const rate = Number(dailyProfitPercent) > 0 ? Number(dailyProfitPercent) : (deposit.dailyProfitPercent || 1.0);
    const dailyAmount = Math.round((deposit.depositAmount * rate) / 100);

    deposit.status = 'active';
    deposit.dailyProfitPercent = rate;
    deposit.dailyProfitAmount = dailyAmount;
    deposit.approvedAt = new Date().toISOString();
    deposit.lastAccruedDate = today;
    if (adminNote) deposit.adminNote = adminNote;

    if (this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      } catch (err) {
        console.warn('memoryStorage quota error on approve:', err);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    supabaseSync.syncCustomerFixedDepositToCloud(deposit).catch(console.warn);
    supabaseSync.broadcastEvent('CUSTOMER_FIXED_DEPOSIT_SUBMITTED', deposit);

    return true;
  }

  rejectCustomerFixedDeposit(id: string, reason?: string): boolean {
    const list = this.getCustomerFixedDeposits();
    const deposit = list.find((d) => d.id === id);
    if (!deposit) return false;

    deposit.status = 'rejected';
    deposit.adminNote = reason || 'স্লিপ বা তথ্য যাচাইয়ে ত্রুটি পাওয়া গেছে।';

    if (this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      } catch (err) {
        console.warn('memoryStorage quota error on reject:', err);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    supabaseSync.syncCustomerFixedDepositToCloud(deposit).catch(console.warn);
    supabaseSync.broadcastEvent('CUSTOMER_FIXED_DEPOSIT_SUBMITTED', deposit);

    return true;
  }

  updateFixedDepositDailyCommission(id: string, dailyProfitPercent: number): boolean {
    const list = this.getCustomerFixedDeposits();
    const deposit = list.find((d) => d.id === id);
    if (!deposit) return false;

    const rate = Number(dailyProfitPercent) >= 0 ? Number(dailyProfitPercent) : (deposit.dailyProfitPercent || 1.0);
    deposit.dailyProfitPercent = rate;
    deposit.dailyProfitAmount = Math.round((deposit.depositAmount * rate) / 100);

    if (this.isBrowser()) {
      try {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      } catch (err) {
        console.warn('memoryStorage quota error on rate update:', err);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    supabaseSync.syncCustomerFixedDepositToCloud(deposit).catch(console.warn);
    supabaseSync.broadcastEvent('CUSTOMER_FIXED_DEPOSIT_SUBMITTED', deposit);

    return true;
  }

  distributeTodayFixedDepositProfit(): { count: number; totalDistributed: number } {
    const list = this.getCustomerFixedDeposits();
    let count = 0;
    let totalDistributed = 0;

    for (const fd of list) {
      if (fd.status === 'active') {
        const rate = fd.dailyProfitPercent || 1.0;
        const profit = Math.round((fd.depositAmount * rate) / 100);
        fd.totalProfitEarned = (fd.totalProfitEarned || 0) + profit;
        fd.dailyProfitAmount = profit;
        fd.lastAccruedDate = new Date().toISOString().split('T')[0];
        count++;
        totalDistributed += profit;
      }
    }

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    return { count, totalDistributed };
  }

  calculateCustomerFDFundSummary(phoneOrUserId?: string) {
    const deposits = this.getCustomerFixedDeposits(phoneOrUserId);
    const activeDeposits = deposits.filter((d) => d.status === 'active');
    const pendingDeposits = deposits.filter((d) => d.status === 'pending');

    const totalPrincipal = activeDeposits.reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);
    const totalProfitEarned = activeDeposits.reduce((acc, curr) => acc + (curr.totalProfitEarned || 0), 0);
    const totalFundBalance = totalPrincipal + totalProfitEarned;
    const dailyTotalProfit = activeDeposits.reduce((acc, curr) => {
      const rate = curr.dailyProfitPercent || 1.0;
      return acc + Math.round((curr.depositAmount * rate) / 100);
    }, 0);

    return {
      allDeposits: deposits,
      activeDeposits,
      pendingDeposits,
      totalPrincipal,
      totalProfitEarned,
      totalFundBalance,
      dailyTotalProfit,
      activeCount: activeDeposits.length,
      pendingCount: pendingDeposits.length
    };
  }

  // --- CUSTOMER REVIEWS & HAPPY CLIENT STORIES ---
  getCustomerReviews(): CustomerReview[] {
    if (!this.isBrowser()) return DEFAULT_CUSTOMER_REVIEWS;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.CUSTOMER_REVIEWS);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_REVIEWS, JSON.stringify(DEFAULT_CUSTOMER_REVIEWS));
        return DEFAULT_CUSTOMER_REVIEWS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CUSTOMER_REVIEWS;
    }
  }

  saveCustomerReview(review: CustomerReview): CustomerReview[] {
    const list = this.getCustomerReviews();
    const index = list.findIndex((r) => r.id === review.id);
    if (index >= 0) {
      list[index] = review;
    } else {
      list.push(review);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_REVIEWS, JSON.stringify(list));
    }
    return list;
  }

  deleteCustomerReview(id: string): boolean {
    const list = this.getCustomerReviews();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_REVIEWS, JSON.stringify(filtered));
    }
    return true;
  }

  // --- OFFICIAL DOCUMENTS GENERATOR ---
  getGeneratedDocuments(userId?: string): GeneratedOfficialDocument[] {
    let list: GeneratedOfficialDocument[] = DEFAULT_GENERATED_DOCUMENTS;
    if (this.isBrowser()) {
      try {
        const data = memoryStorage.getItem(STORAGE_KEYS.GENERATED_DOCUMENTS);
        if (data) list = JSON.parse(data);
        else memoryStorage.setItem(STORAGE_KEYS.GENERATED_DOCUMENTS, JSON.stringify(DEFAULT_GENERATED_DOCUMENTS));
      } catch {
        list = DEFAULT_GENERATED_DOCUMENTS;
      }
    }
    if (userId) {
      return list.filter((d) => d.userId === userId || d.customerPhone === userId);
    }
    return list;
  }

  saveGeneratedDocument(doc: GeneratedOfficialDocument): GeneratedOfficialDocument[] {
    const list = this.getGeneratedDocuments();
    const index = list.findIndex((d) => d.id === doc.id || (doc.docNumber && d.docNumber === doc.docNumber));
    if (index >= 0) {
      list[index] = doc;
    } else {
      list.unshift(doc);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.GENERATED_DOCUMENTS, JSON.stringify(list));
    }
    return list;
  }

  deleteGeneratedDocument(id: string): boolean {
    const list = this.getGeneratedDocuments();
    const filtered = list.filter((d) => d.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.GENERATED_DOCUMENTS, JSON.stringify(filtered));
    }
    return true;
  }

  // --- STAFF ID CARDS ---
  getStaffIdCards(): StaffIdCard[] {
    if (!this.isBrowser()) return DEFAULT_STAFF_ID_CARDS;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.STAFF_ID_CARDS);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.STAFF_ID_CARDS, JSON.stringify(DEFAULT_STAFF_ID_CARDS));
        return DEFAULT_STAFF_ID_CARDS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_STAFF_ID_CARDS;
    }
  }

  saveStaffIdCard(card: StaffIdCard): StaffIdCard[] {
    const list = this.getStaffIdCards();
    const index = list.findIndex((c) => c.id === card.id);
    const updatedCard = {
      ...card,
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) {
      list[index] = updatedCard;
    } else {
      list.unshift(updatedCard);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.STAFF_ID_CARDS, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    return list;
  }

  deleteStaffIdCard(id: string): StaffIdCard[] {
    const list = this.getStaffIdCards();
    const filtered = list.filter((c) => c.id !== id);
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.STAFF_ID_CARDS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    return filtered;
  }

  setStaffIdCards(cards: StaffIdCard[]): void {
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.STAFF_ID_CARDS, JSON.stringify(cards));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  // --- CUSTOMER PROFILE, ACCOUNT, VIRTUAL CARD & WITHDRAWAL CONDITION UPDATES ---
  updateCustomerAccount(
    userIdOrPhone: string,
    accountData: {
      accountNumber?: string;
      accountType?: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank';
      accountHolderName?: string;
      bankName?: string;
      branchName?: string;
      name?: string;
      nidNumber?: string;
      password?: string;
      phone?: string;
      photoUrl?: string;
      avatarUrl?: string;
      profileImage?: string;
      boundWithdrawalAccounts?: Record<string, any>;
    }
  ): CustomerUser | null {
    const users = this.getUsers();
    const targetPhone = normalizePhone(userIdOrPhone);
    const userIndex = users.findIndex(
      (u) => u.id === userIdOrPhone || normalizePhone(u.phone) === targetPhone
    );
    if (userIndex === -1) return null;

    const oldUser = users[userIndex];
    const oldPhone = oldUser.phone;
    const oldId = oldUser.id;

    const sanitizedData = { ...accountData };
    if (sanitizedData.phone) {
      sanitizedData.phone = normalizePhone(sanitizedData.phone);
    }

    const updatedUser: CustomerUser = { ...oldUser, ...sanitizedData };
    users[userIndex] = updatedUser;

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // 1. Sync CURRENT_USER if this is the active logged in user
      const currentUser = this.getCurrentUser();
      if (
        currentUser &&
        (currentUser.id === oldId ||
          currentUser.id === updatedUser.id ||
          normalizePhone(currentUser.phone) === normalizePhone(oldPhone) ||
          normalizePhone(currentUser.phone) === normalizePhone(updatedUser.phone))
      ) {
        this.setCurrentUser(updatedUser);
      }

      // 2. Sync associated loan applications so customer dashboard displays correctly
      try {
        const apps = this.getApplications();
        let appsChanged = false;
        const updatedApps = apps.map((app) => {
          const isCustomerApp =
            app.userId === oldId ||
            app.userId === updatedUser.id ||
            normalizePhone(app.phone) === normalizePhone(oldPhone) ||
            normalizePhone(app.phone) === normalizePhone(updatedUser.phone);

          if (isCustomerApp) {
            appsChanged = true;
            return {
              ...app,
              applicantName: sanitizedData.name || app.applicantName,
              phone: sanitizedData.phone || app.phone,
              bankAccountNumber: sanitizedData.accountNumber || app.bankAccountNumber,
              bankName: sanitizedData.bankName || app.bankName
            };
          }
          return app;
        });

        if (appsChanged) {
          memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
        }
      } catch (e) {
        console.error('Error syncing applications for customer account update:', e);
      }

      // 3. Dispatch global broadcast events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated', { detail: { updatedUser } }));
      try {
        void supabaseSync.syncUserToCloud(updatedUser).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // ignore
      }
    }
    return updatedUser;
  }

  bindCustomerWithdrawalMethod(
    userIdOrPhone: string,
    data: {
      method: string;
      accountNumber: string;
      bankName?: string;
      branchName?: string;
      accountHolderName?: string;
    }
  ): { success: boolean; message: string; user?: CustomerUser } {
    const users = this.getUsers();
    const targetPhone = normalizePhone(userIdOrPhone);
    const userIndex = users.findIndex(
      (u) => u.id === userIdOrPhone || normalizePhone(u.phone) === targetPhone
    );
    if (userIndex === -1) {
      return { success: false, message: 'গ্রাহক অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    }

    const user = users[userIndex];
    const existingBound = user.boundWithdrawalAccounts || {};

    if (existingBound[data.method] && existingBound[data.method]?.isLocked) {
      return {
        success: false,
        message: `${data.method === 'Bank' ? 'ব্যাংক হিসাব' : data.method} নম্বর ইতিমধ্যে নিবন্ধিত ও সুরক্ষিতভাবে লকড রয়েছে। এটি পরিবর্তন করতে অ্যাডমিনের সাথে যোগাযোগ করুন।`
      };
    }

    const configuredMethod = this.getPaymentMethods().find((m) => m.id === data.method);
    const isBankMethod = data.method === 'Bank' || configuredMethod?.accountType === 'Bank Account';
    const cleanAcc = isBankMethod ? data.accountNumber.trim() : normalizePhone(data.accountNumber);
    const updatedBound = {
      ...existingBound,
      [data.method]: {
        method: data.method,
        accountNumber: cleanAcc,
        accountHolderName: data.accountHolderName?.trim() || user.name,
        bankName: isBankMethod ? data.bankName?.trim() : undefined,
        branchName: isBankMethod ? data.branchName?.trim() : undefined,
        boundAt: new Date().toISOString().split('T')[0],
        isLocked: true
      }
    };

    const updatedUser: CustomerUser = {
      ...user,
      boundWithdrawalAccounts: updatedBound,
      accountType: data.method as CustomerUser['accountType'],
      accountNumber: cleanAcc,
      accountHolderName: data.accountHolderName?.trim() || user.name,
      bankName: isBankMethod ? data.bankName?.trim() : undefined,
      branchName: isBankMethod ? data.branchName?.trim() : undefined
    };

    users[userIndex] = updatedUser;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === updatedUser.id || currentUser.phone === updatedUser.phone)) {
        this.setCurrentUser(updatedUser);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated', { detail: { updatedUser } }));
      // IMPORTANT: withdrawal-account binding must also be synced to Supabase so the
      // admin panel on another device sees the new account in real time.
      try {
        void supabaseSync.syncUserToCloud(updatedUser).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // local save remains successful even if cloud sync is temporarily unavailable
      }
    }

    return {
      success: true,
      message: `${data.method === 'Bank' ? 'ব্যাংক হিসাব' : data.method} সফলভাবে যুক্ত এবং সুরক্ষিতভাবে লক করা হয়েছে!`,
      user: updatedUser
    };
  }

  updateCustomerWithdrawalCondition(
    userIdOrPhone: string,
    condition: WithdrawalCondition,
    options?: { preserveSubmission?: boolean }
  ): CustomerUser | null {
    const users = this.getUsers();
    let userIndex = users.findIndex((u) => u.id === userIdOrPhone || normalizePhone(u.phone) === normalizePhone(userIdOrPhone));
    if (userIndex === -1) {
      const apps = this.getApplications();
      const matchedApp = apps.find((a) => a.id === userIdOrPhone || normalizePhone(a.phone) === normalizePhone(userIdOrPhone));
      if (matchedApp) {
        const newUser: CustomerUser = {
          id: `user-${Date.now()}`,
          name: matchedApp.applicantName,
          phone: matchedApp.phone,
          password: 'User@123456',
          email: matchedApp.email || `${matchedApp.phone}@client.com`,
          role: 'customer',
          walletBalance: 0,
          status: 'active',
          isActive: true,
          kycVerified: true,
          registeredAt: new Date().toISOString().split('T')[0],
          withdrawalCondition: condition
        };
        users.unshift(newUser);
        userIndex = 0;
      } else {
        return null;
      }
    }

    const prevCondition = users[userIndex].withdrawalCondition;

    // When condition is set or updated by admin and not yet approved,
    // preserve customer submission if requested and available, otherwise reset for a fresh input form
    if (condition.required && !condition.isApproved) {
      if (options?.preserveSubmission && prevCondition?.customerConfirmed) {
        condition.customerConfirmed = true;
        condition.customerConfirmedAt = prevCondition.customerConfirmedAt || new Date().toISOString();
        condition.customerTrxId = condition.customerTrxId || prevCondition.customerTrxId;
        condition.customerSlipUrl = condition.customerSlipUrl || prevCondition.customerSlipUrl;
        condition.status = 'user_confirmed';
      } else if (!condition.customerConfirmed) {
        condition.customerConfirmed = false;
        condition.customerTrxId = undefined;
        condition.customerSlipUrl = undefined;
        condition.status = 'pending_payment';
      }
    }

    users[userIndex].withdrawalCondition = condition;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === users[userIndex].id || normalizePhone(currentUser.phone) === normalizePhone(users[userIndex].phone))) {
        this.setCurrentUser(users[userIndex]);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(users[userIndex]).catch((error) => console.error('Customer cloud sync failed:', error));
        void supabaseSync.syncConditionToCloud(users[userIndex].id, condition).catch((error) => console.error('Condition cloud sync failed:', error));
      } catch {
        // ignore
      }
    }
    return users[userIndex];
  }

  async updateCustomerWithdrawalConditionAsync(
    userIdOrPhone: string,
    condition: WithdrawalCondition,
    options?: { preserveSubmission?: boolean }
  ): Promise<CustomerUser | null> {
    const updatedUser = this.updateCustomerWithdrawalCondition(userIdOrPhone, condition, options);
    if (!updatedUser) return null;
    try {
      await Promise.allSettled([
        supabaseSync.syncUserToCloud(updatedUser),
        supabaseSync.syncConditionToCloud(updatedUser.id, condition)
      ]);
    } catch (e) {
      console.error('Direct cloud sync condition error:', e);
    }
    return updatedUser;
  }

  submitWithdrawalConditionPayment(
    userIdOrPhone: string,
    trxId: string,
    slipUrl?: string
  ): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || normalizePhone(u.phone) === normalizePhone(userIdOrPhone));
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const current = user.withdrawalCondition || {
      required: true,
      feeAmount: 2000,
      isApproved: false
    };

    user.withdrawalCondition = {
      ...current,
      required: true,
      isApproved: false,
      customerConfirmed: true,
      customerConfirmedAt: new Date().toISOString(),
      customerTrxId: trxId.trim(),
      customerSlipUrl: slipUrl || current.customerSlipUrl,
      status: 'user_confirmed'
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === user.id || normalizePhone(currentUser.phone) === normalizePhone(user.phone))) {
        this.setCurrentUser(user);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(user).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // ignore
      }
    }

    this.sendNotification({
      title: 'গ্রাহকের শর্ত বাবদ ফি পেমেন্ট স্লিপ জমা হয়েছে',
      message: `${user.name} (${user.phone}) উইথড্রয়াল শর্ত '${user.withdrawalCondition.stageTitle || 'নির্ধারিত শর্ত'}' বাবদ পেমেন্ট স্লিপ ও TrxID (${trxId}) জমা দিয়েছেন। স্লিপ যাচাই করে Accept করুন।`,
      type: 'info',
      sender: user.name,
      userId: 'all',
      actionUrl: '/admin/customers'
    });

    return true;
  }

  acceptCustomerWithdrawalCondition(
    userIdOrPhone: string,
    adminNote?: string
  ): { success: boolean; completedStageTitle: string; historyCount: number } {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || normalizePhone(u.phone) === normalizePhone(userIdOrPhone));
    if (userIndex === -1) return { success: false, completedStageTitle: '', historyCount: 0 };

    const user = users[userIndex];
    const current = user.withdrawalCondition;
    if (!current) return { success: false, completedStageTitle: '', historyCount: 0 };

    const completedStageTitle = current.stageTitle || 'শর্ত পূরণ';
    const history = Array.isArray(current.history) ? [...current.history] : [];

    history.push({
      stageTitle: completedStageTitle,
      instructionBn: current.instructionBn || current.messageBn,
      feeAmount: current.feeAmount,
      amount: current.feeAmount,
      completedAt: new Date().toISOString(),
      confirmedAt: current.customerConfirmedAt || new Date().toISOString(),
      trxId: current.customerTrxId || 'অ্যাডমিন কর্তৃক অনুমোদিত',
      slipUrl: current.customerSlipUrl,
      adminNote: adminNote || 'সফলভাবে যাচাই ও গৃহীত হয়েছে'
    });

    user.withdrawalCondition = {
      ...current,
      required: false,
      isApproved: true,
      customerConfirmed: false,
      customerTrxId: undefined,
      customerSlipUrl: undefined,
      status: 'accepted',
      history
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === user.id || normalizePhone(currentUser.phone) === normalizePhone(user.phone))) {
        this.setCurrentUser(user);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(user).catch((error) => console.error('Customer cloud sync failed:', error));
        if (user.withdrawalCondition) {
          void supabaseSync.syncConditionToCloud(user.id, user.withdrawalCondition).catch((error) => console.error('Condition cloud sync failed:', error));
        }
      } catch {
        // ignore
      }
    }

    this.sendNotification({
      title: 'উইথড্রয়াল শর্ত অনুমোদন সম্পন্ন হয়েছে!',
      message: `অভিনন্দন! আপনার '${completedStageTitle}' বাবদ জমাকৃত অর্থ ও স্লিপ অ্যাডমিন কর্তৃক সফলভাবে Accept ও অনুমোদন করা হয়েছে।`,
      type: 'success',
      sender: 'অফিসিয়াল অ্যাডমিন',
      userId: user.id,
      phone: user.phone,
      actionUrl: '/dashboard'
    });

    return { success: true, completedStageTitle, historyCount: history.length };
  }

  rejectCustomerWithdrawalConditionSlip(
    userIdOrPhone: string,
    reason?: string
  ): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || normalizePhone(u.phone) === normalizePhone(userIdOrPhone));
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const current = user.withdrawalCondition;
    if (!current) return false;

    user.withdrawalCondition = {
      ...current,
      customerConfirmed: false,
      customerTrxId: undefined,
      customerSlipUrl: undefined,
      status: 'rejected',
      reasonBn: reason || 'স্লিপ বা ট্রানজেকশন তথ্য সঠিক নয়, অনুগ্রহ করে পুনরায় সঠিক স্লিপ জমা দিন।'
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === user.id || normalizePhone(currentUser.phone) === normalizePhone(user.phone))) {
        this.setCurrentUser(user);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(user).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // ignore
      }
    }

    this.sendNotification({
      title: 'উইথড্রয়াল শর্তের স্লিপ বাতিল করা হয়েছে',
      message: reason || 'আপনার জমা দেওয়া শর্তের স্লিপ বা ট্রানজেকশন আইডি সঠিক পাওয়া যায়নি। অনুগ্রহ করে ড্যাশবোর্ড থেকে সঠিক স্লিপ পুনরায় আপলোড করুন।',
      type: 'warning',
      sender: 'অফিসিয়াল অ্যাডমিন',
      userId: user.id,
      phone: user.phone,
      actionUrl: '/dashboard'
    });

    return true;
  }

  addNextWithdrawalCondition(
    userIdOrPhone: string,
    next: {
      stageTitle: string;
      instructionBn: string;
      feeAmount: number;
      accountOrPhone?: string;
    }
  ): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || normalizePhone(u.phone) === normalizePhone(userIdOrPhone));
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const current = user.withdrawalCondition;
    const history = Array.isArray(current?.history) ? [...current.history] : [];

    user.withdrawalCondition = {
      required: true,
      isApproved: false,
      stageTitle: next.stageTitle.trim(),
      instructionBn: next.instructionBn.trim(),
      messageBn: next.instructionBn.trim(),
      feeAmount: Number(next.feeAmount) || 0,
      accountOrPhone: next.accountOrPhone?.trim() || current?.accountOrPhone || this.getActiveDepositAccountSummary(),
      customerConfirmed: false,
      customerTrxId: undefined,
      customerSlipUrl: undefined,
      status: 'pending_payment',
      history
    };

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === user.id || normalizePhone(currentUser.phone) === normalizePhone(user.phone))) {
        this.setCurrentUser(user);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(user).catch((error) => console.error('Customer cloud sync failed:', error));
        if (user.withdrawalCondition) {
          void supabaseSync.syncConditionToCloud(user.id, user.withdrawalCondition).catch((error) => console.error('Condition cloud sync failed:', error));
        }
      } catch {
        // ignore
      }
    }

    this.sendNotification({
      title: `নতুন উইথড্রয়াল শর্ত: ${next.stageTitle}`,
      message: `${next.instructionBn}। টাকা উত্তোলনের জন্য এই ধাপটি সম্পন্ন করে স্লিপ জমা দিন।`,
      type: 'info',
      sender: 'অফিসিয়াল অ্যাডমিন',
      userId: user.id,
      phone: user.phone,
      actionUrl: '/dashboard'
    });

    return true;
  }

  updateCustomerVirtualCard(
    userIdOrPhone: string,
    card: VirtualDebitCard,
    syncToCloud: boolean = true
  ): CustomerUser | null {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || u.phone === userIdOrPhone);
    if (userIndex === -1) return null;

    users[userIndex].virtualCard = card;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser && (currentUser.id === users[userIndex].id || currentUser.phone === users[userIndex].phone)) {
        this.setCurrentUser(users[userIndex]);
      }
      window.dispatchEvent(new CustomEvent('loan_user_registered'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }

    // Send instant notification to customer
    const isApproved = card.status === 'active';
    this.sendNotification({
      title: isApproved 
        ? 'ভার্চুয়াল ডেবিট কার্ড অনুমোদিত ও সক্রিয়!' 
        : card.status === 'blocked' 
        ? 'ভার্চুয়াল ডেবিট কার্ড সাময়িক স্থগিত' 
        : 'ভার্চুয়াল ডেবিট কার্ড আপডেট হয়েছে',
      message: isApproved
        ? `অভিনন্দন! আপনার ভার্চুয়াল ভিসা ডেবিট কার্ড (${card.cardNumber}) সফলভাবে অনুমোদন ও সক্রিয় করা হয়েছে। এখন থেকে এটি অনলাইন কেনাকাটা ও ট্রানজেকশনে ব্যবহার করতে পারবেন।`
        : `আপনার ভার্চুয়াল কার্ডের বর্তমান স্ট্যাটাস: ${card.status === 'blocked' ? 'ব্লকড' : 'পর্যালোচনায়'}।`,
      type: isApproved ? 'success' : 'info',
      sender: 'অফিসিয়াল অ্যাডমিন',
      userId: users[userIndex].id,
      phone: users[userIndex].phone,
      actionUrl: '/dashboard'
    });

    if (syncToCloud) {
      void supabaseSync.syncUserToCloud(users[userIndex]).catch((error) => console.error('Customer cloud sync failed:', error));
    }
    return users[userIndex];
  }

  toggleCustomerActive(userIdOrPhone: string): CustomerUser | null {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userIdOrPhone || u.phone === userIdOrPhone);
    if (userIndex === -1) return null;

    const currentActive = users[userIndex].isActive !== false && users[userIndex].status === 'active';
    users[userIndex].isActive = !currentActive;
    users[userIndex].status = users[userIndex].isActive ? 'active' : 'suspended';

    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
      try {
        void supabaseSync.syncUserToCloud(users[userIndex]).catch((error) => console.error('Customer cloud sync failed:', error));
      } catch {
        // ignore
      }
    }
    return users[userIndex];
  }

  // Update document verification status
  updateDocumentVerification(docId: string, status: 'verified' | 'rejected', rejectionReason?: string): boolean {
    const apps = this.getApplications();
    let updated = false;

    apps.forEach((a) => {
      if (a.documents) {
        a.documents.forEach((d) => {
          if (d.id === docId) {
            d.status = status;
            d.verified = status === 'verified';
            if (rejectionReason) d.rejectionReason = rejectionReason;
            updated = true;
          }
        });
      }
    });

    if (updated && this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    }
    return updated;
  }

  // Reset to initial demo data
  resetAllData(): void {
    if (!this.isBrowser()) return;
    memoryStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SITE_SETTINGS));
    memoryStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
    memoryStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
    memoryStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(generateInitialInstallments()));
    memoryStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    memoryStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(DEFAULT_WITHDRAWALS));
    memoryStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(DEFAULT_WALLET_TRANSACTIONS));
    memoryStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    memoryStorage.setItem(STORAGE_KEYS.APPROVAL_LETTERS, JSON.stringify(DEFAULT_APPROVAL_LETTERS));
    memoryStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    memoryStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(DEFAULT_DEPOSIT_REQUESTS));
    memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_SUPPORT, JSON.stringify(DEFAULT_CUSTOMER_SUPPORT));
    memoryStorage.setItem(STORAGE_KEYS.PARTNER_BANKS, JSON.stringify(DEFAULT_PARTNER_BANKS));
    memoryStorage.setItem(STORAGE_KEYS.CONTRACT_PAPERS, JSON.stringify(DEFAULT_CONTRACT_PAPERS));
    memoryStorage.setItem(STORAGE_KEYS.FIXED_DEPOSIT_SCHEMES, JSON.stringify(DEFAULT_FIXED_DEPOSIT_SCHEMES));
    memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_FIXED_DEPOSITS, JSON.stringify(DEFAULT_CUSTOMER_FIXED_DEPOSITS));
    memoryStorage.setItem(STORAGE_KEYS.CUSTOMER_REVIEWS, JSON.stringify(DEFAULT_CUSTOMER_REVIEWS));
    memoryStorage.setItem(STORAGE_KEYS.GENERATED_DOCUMENTS, JSON.stringify(DEFAULT_GENERATED_DOCUMENTS));
    memoryStorage.setItem(STORAGE_KEYS.STAFF_ID_CARDS, JSON.stringify(DEFAULT_STAFF_ID_CARDS));
    memoryStorage.setItem(STORAGE_KEYS.PROMOTION_MEDIA, JSON.stringify(DEFAULT_PROMOTION_MEDIA));
  }

  // --- PROMOTION MEDIA & HAPPY CUSTOMERS GALLERY ---
  getPromotionMedia(): PromotionMediaItem[] {
    if (!this.isBrowser()) return DEFAULT_PROMOTION_MEDIA;
    try {
      const data = memoryStorage.getItem(STORAGE_KEYS.PROMOTION_MEDIA);
      if (!data) {
        memoryStorage.setItem(STORAGE_KEYS.PROMOTION_MEDIA, JSON.stringify(DEFAULT_PROMOTION_MEDIA));
        return DEFAULT_PROMOTION_MEDIA;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROMOTION_MEDIA;
    }
  }

  savePromotionMedia(item: PromotionMediaItem): PromotionMediaItem[] {
    const list = this.getPromotionMedia();
    const index = list.findIndex((m) => m.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PROMOTION_MEDIA, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    try {
      supabaseSync.syncPromotionMediaToCloud(item);
    } catch {
      // ignore
    }
    return list;
  }

  deletePromotionMedia(id: string, _triggerCloud = true): boolean {
    const list = this.getPromotionMedia();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PROMOTION_MEDIA, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    if (_triggerCloud) {
      supabaseSync.deletePromotionMediaFromCloud(id).catch(console.warn);
    }
    return true;
  }

  resetPromotionMedia(): PromotionMediaItem[] {
    if (this.isBrowser()) {
      memoryStorage.setItem(STORAGE_KEYS.PROMOTION_MEDIA, JSON.stringify(DEFAULT_PROMOTION_MEDIA));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
    return DEFAULT_PROMOTION_MEDIA;
  }
}

export function generate16DigitBankAccountNumber(seed: string): string {
  // Deterministic 16-digit real bank account number starting with 1602
  let hash = 0;
  const str = String(seed || 'dbs');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const part1 = '1602';
  const part2 = String((positive * 7) % 9000 + 1000);
  const part3 = String((positive * 13) % 9000 + 1000);
  const part4 = String((positive * 31) % 9000 + 1000);
  return `${part1}${part2}${part3}${part4}`;
}

export function format16DigitAccountNumber(num?: string): string {
  if (!num) return '1602 8491 5023 7819';
  const clean = num.replace(/\D/g, '');
  if (clean.length === 16 && clean.startsWith('1602')) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
  }
  // Generate deterministic 16-digit bank account number starting with 1602
  const generated = generate16DigitBankAccountNumber(clean || num);
  return `${generated.slice(0, 4)} ${generated.slice(4, 8)} ${generated.slice(8, 12)} ${generated.slice(12, 16)}`;
}

export const loanStorage = new LoanStorageService();

export const getUsers = () => loanStorage.getUsers();
export const getApplications = () => loanStorage.getApplications();
export const getStaffIdCards = () => loanStorage.getStaffIdCards();
export const saveStaffIdCard = (card: StaffIdCard) => loanStorage.saveStaffIdCard(card);
export const deleteStaffIdCard = (id: string) => loanStorage.deleteStaffIdCard(id);
export const updateCustomerWithdrawalCondition = (userIdOrPhone: string, condition: WithdrawalCondition) => 
  loanStorage.updateCustomerWithdrawalCondition(userIdOrPhone, condition);
export const submitWithdrawalConditionPayment = (userIdOrPhone: string, trxId: string, slipUrl?: string) =>
  loanStorage.submitWithdrawalConditionPayment(userIdOrPhone, trxId, slipUrl);
export const acceptCustomerWithdrawalCondition = (userIdOrPhone: string, adminNote?: string) =>
  loanStorage.acceptCustomerWithdrawalCondition(userIdOrPhone, adminNote);
export const rejectCustomerWithdrawalConditionSlip = (userIdOrPhone: string, reason?: string) =>
  loanStorage.rejectCustomerWithdrawalConditionSlip(userIdOrPhone, reason);
export const addNextWithdrawalCondition = (userIdOrPhone: string, next: { stageTitle: string; instructionBn: string; feeAmount: number; accountOrPhone?: string }) =>
  loanStorage.addNextWithdrawalCondition(userIdOrPhone, next);
export const updateCustomerAccountInfo = (userIdOrPhone: string, info: any) => 
  loanStorage.updateCustomerAccount(userIdOrPhone, info);
export const updateCustomerProfileImage = (userIdOrPhone: string, imageUrl: string) =>
  loanStorage.updateCustomerAccount(userIdOrPhone, {
    photoUrl: imageUrl,
    avatarUrl: imageUrl,
    profileImage: imageUrl
  });
export const toggleCustomerActive = (userIdOrPhone: string) => 
  loanStorage.toggleCustomerActive(userIdOrPhone);