import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLoan } from "@/contexts/LoanContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { RealisticStaffIdCard } from "@/components/common/RealisticStaffIdCard";
import { CorporateVisitingCard } from "@/components/common/CorporateVisitingCard";
import { AuthenticStaffIdCard } from "@/components/common/AuthenticStaffIdCard";
import { AuthenticStampContractDocument } from "@/components/common/AuthenticStampContractDocument";
import { StaffIdCard } from "@/types/loan";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { 
  Printer, 
  Image as ImageIcon, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  Award,
  Contact2,
  FileText,
  Stamp,
  CreditCard,
  Download,
  Copy,
  Check,
  Eye,
  Loader2,
  MousePointerClick
} from "lucide-react";
import { formatTaka, toBengaliNumber } from "@/services/storage";
import { toast } from "sonner";

export const POPULAR_INSURANCE_COMPANIES = [
  "জীবন বীমা কর্পোরেশন (JBC)",
  "সাধারণ বীমা করপোরেশন (SBC)",
  "মেটলাইফ বাংলাদেশ (MetLife)",
  "ডেল্টা লাইফ ইন্স্যুরেন্স লিমিটেড",
  "ন্যাশনাল লাইফ ইন্স্যুরেন্স কোম্পানি লিমিটেড",
  "গ্রিন ডেল্টা ইন্স্যুরেন্স কোম্পানি লিমিটেড",
  "প্রগতি লাইফ ইন্স্যুরেন্স লিমিটেড",
  "মেঘনা লাইফ ইন্স্যুরেন্স লিমিটেড",
  "পপুলার লাইফ ইন্স্যুরেন্স কোম্পানি লিমিটেড",
  "কাস্টম বীমা কোম্পানি (Custom)"
];

export const BD_BANKS = [
  "সোনালী ব্যাংক পিএলসি (Sonali Bank PLC)",
  "জনতা ব্যাংক পিএলসি (Janata Bank PLC)",
  "অগ্রণী ব্যাংক পিএলসি (Agrani Bank PLC)",
  "রূপালী ব্যাংক পিএলসি (Rupali Bank PLC)",
  "ব্র্যাক ব্যাংক পিএলসি (BRAC Bank PLC)",
  "ডাচ্-বাংলা ব্যাংক পিএলসি (Dutch-Bangla Bank PLC)",
  "ইসলামী ব্যাংক বাংলাদেশ পিএলসি (Islami Bank Bangladesh PLC)",
  "সিটি ব্যাংক পিএলসি (The City Bank PLC)",
  "ইস্টার্ন ব্যাংক পিএলসি (Eastern Bank PLC)",
  "ইউনাইটেড কমার্শিয়াল ব্যাংক পিএলসি (UCB)",
  "পূবালী ব্যাংক পিএলসি (Pubali Bank PLC)",
  "প্রাইম ব্যাংক পিএলসি (Prime Bank PLC)",
  "সাউথইস্ট ব্যাংক পিএলসি (Southeast Bank PLC)",
  "ঢাকা ব্যাংক পিএলসি (Dhaka Bank PLC)",
  "মিউচুয়াল ট্রাস্ট ব্যাংক পিএলসি (Mutual Trust Bank PLC)",
  "ব্যাংক এশিয়া পিএলসি (Bank Asia PLC)",
  "আল-আরাফাহ্ ইসলামী ব্যাংক পিএলসি (Al-Arafah Islami Bank PLC)",
  "ফার্স্ট সিকিউরিটি ইসলামী ব্যাংক (First Security Islami Bank PLC)",
  "সোশ্যাল ইসলামী ব্যাংক পিএলসি (Social Islami Bank PLC)",
  "গ্লোবাল ইসলামী ব্যাংক পিএলসি (Global Islami Bank PLC)",
  "ইউনিয়ন ব্যাংক পিএলসি (Union Bank PLC)",
  "এক্সিম ব্যাংক পিএলসি (EXIM Bank PLC)",
  "স্ট্যান্ডার্ড ব্যাংক পিএলসি (Standard Bank PLC)",
  "ট্রাস্ট ব্যাংক পিএলসি (Trust Bank PLC)",
  "বাংলাদেশ কৃষি ব্যাংক (Bangladesh Krishi Bank)",
  "বাংলাদেশ কমার্স ব্যাংক লিমিটেড (Bangladesh Commerce Bank)",
  "কমিউনিটি ব্যাংক বাংলাদেশ (Community Bank Bangladesh)",
  "DBS Bank SG (ডিজিটাল ব্যাংকিং)",
  "অন্যান্য / কাস্টম ব্যাংক (এডমিন পছন্দের নাম লিখবেন)"
];

export const AdminOfficialDocumentGeneratorPage: React.FC = () => {
  const { users, applications, settings, saveGeneratedDocument } = useLoan();
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  // High-Resolution Image Export & Clipboard States
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(users[0]?.id || "usr-1");
  const selectedUser = users.find((u) => u.id === selectedCustomerId) || users[0];
  const userApp = applications.find((a) => a.phone === selectedUser?.phone) || applications[0];

  // Document Type
  const [docType, setDocType] = useState<
    "bd_stamp" | "bank_cheque" | "sanction_letter" | "insurance_policy" | "money_receipt" | "staff_id_card" | "staff_visiting_card"
  >("bd_stamp");

  // General Form Fields
  const [docNumber, setDocNumber] = useState<string>(`DOC-BD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customerName, setCustomerName] = useState<string>(selectedUser?.name || "মোঃ তানভীর আহমেদ");
  const [customerPhone, setCustomerPhone] = useState<string>(selectedUser?.phone || "01712345678");
  const [customerNid, setCustomerNid] = useState<string>(selectedUser?.nidNumber || "19942692510000123");
  const [customerAddress, setCustomerAddress] = useState<string>(userApp?.presentAddress || "বাড়ি নং ১২, রোড নং ৪, মিরপুর-১০, ঢাকা-১২১৬");
  const [loanAmount, setLoanAmount] = useState<number>(userApp?.loanAmount || userApp?.amount || 100000);
  const [durationMonths, setDurationMonths] = useState<number>(userApp?.durationMonths || 12);
  const [monthlyEMI, setMonthlyEMI] = useState<number>(userApp?.monthlyEMI || 9120);
  const [bankName, setBankName] = useState<string>("রূপালী ব্যাংক পিএলসি");
  const [branchName, setBranchName] = useState<string>("Rupali Sadan Corporate Dhaka");
  const [chequeNumber, setChequeNumber] = useState<string>("SBA 5944952");
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Customer Photo & Gallery Upload State
  const initialPhoto =
    selectedUser?.photoUrl ||
    selectedUser?.avatarUrl ||
    userApp?.documents?.find((d) => d.category === "selfie")?.previewUrl ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80";

  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string>(initialPhoto);
  const [showCustomerPhoto, setShowCustomerPhoto] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (JPG, PNG ইত্যাদি) নির্বাচন করুন");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCustomerPhotoUrl(base64);
        setStaffPhotoUrl(base64);
        setShowCustomerPhoto(true);
        toast.success("গ্রাহকের ছবি গ্যালারি থেকে সফলভাবে আপলোড করা হয়েছে!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseCustomerSavedPhoto = () => {
    const saved =
      selectedUser?.photoUrl ||
      selectedUser?.avatarUrl ||
      userApp?.documents?.find((d) => d.category === "selfie")?.previewUrl;
    if (saved) {
      setCustomerPhotoUrl(saved);
      setStaffPhotoUrl(saved);
      setShowCustomerPhoto(true);
      toast.success("গ্রাহকের সংরক্ষিত ছবি সফলভাবে লোড করা হয়েছে!");
    } else {
      toast.info("গ্রাহকের কোনো সংরক্ষিত ছবি পাওয়া যায়নি, অনুগ্রহ করে গ্যালারি থেকে আপলোড করুন।");
    }
  };

  const platformTitle = settings.platformName || settings.platformNameBn || settings.companyNameBn || "DBS Bank SG";

  // 1. Non-Judicial 100 Tk Stamp State (Image 2 style, fully editable)
  const [stampSerialNo, setStampSerialNo] = useState<string>("খষ ৪৫৮১১৯৮");
  const [stampTitle, setStampTitle] = useState<string>("ঋণের চুক্তিপত্র");
  const [customerFatherName, setCustomerFatherName] = useState<string>("লুৎফর রহমান");
  const [customerDistrict, setCustomerDistrict] = useState<string>("ঢাকা");
  const [stampCompanyName, setStampCompanyName] = useState<string>("ক্ষুদ্রঋণ প্রকল্প");
  const [bottomNotice, setBottomNotice] = useState<string>("বিঃদ্রঃ ঋণের শর্তাবলী পালন না করলে ব্যাংক কর্তৃপক্ষ আইনানুগ ব্যবস্থা নিতে বাধ্য থাকিবে।");
  const [bottomSlogan, setBottomSlogan] = useState<string>("“দেশপ্রেমের শপথ নিন, দুর্নীতিকে বিদায় দিন”");
  const [stampParagraph1, setStampParagraph1] = useState<string>(
    `আমি মোঃ মো: ইয়াসিনুর রহমান , পিতা - লুৎফর রহমান , সাং - বাসা/হোল্ডিং : ১৮৯, বড় মগবাজার হাসনাবাদ এপার্টমেন্ট ছ/৬, ডাকঘরঃ শান্তিনগর - ১২১৭, রমনা, ঢাকা উত্তর সিটি কর্পোরেশন, ঢাকা। আমাকে ক্ষুদ্রঋণ প্রকল্প ২,০০,০০০ টাকা, ২৪ মাস মেয়াদি, প্রতিমাসে ৮,৭৩৩ টাকা কিস্তির ঋণ প্রস্তাব করিলে, আমি সকল প্রক্রিয়া সম্পূর্ণ করে ও ক্ষুদ্রঋণ প্রকল্প এর সকল শর্ত মেনে ঋণটি নিতে রাজি হয়েছি।`
  );
  const [stampParagraph2, setStampParagraph2] = useState<string>(
    `আপনাকে প্রতিমাসে ১ থেকে ১০ তারিখের মধ্যে অনলাইনের মাধ্যমে কিস্তি প্রদান করতে হবে, কোনো মাসে দিতে সমস্যা হলে অবশ্যই আগে জানাতে হবে। ব্যাংক কর্তৃপক্ষ যেসব প্রক্রিয়ার কথা বলেছেন ওই সব প্রক্রিয়া অবশ্যই সম্পূর্ণ করতে হবে।`
  );
  const [stampParagraph3, setStampParagraph3] = useState<string>(
    `আমি ব্যাংক কর্তৃপক্ষ সাক্ষ্য দিচ্ছি যে মোঃ মো: ইয়াসিনুর রহমান এর দেওয়া তথ্যের উপর ভিত্তি করে ও তার আর্থিক অবস্থা এবং ঋণের যোগ্যতা যাচাই করে, আমার আত্মবিশ্বাস যে তিনি আমাদের দেওয়া সকল শর্ত ও নিয়মাবলী পূরণ করতে পারবে।`
  );
  const [showApprovedSeal, setShowApprovedSeal] = useState<boolean>(true);
  const [bankSignDate, setBankSignDate] = useState<string>("১২-১০-২০২৬ ইং");
  const [bankSignTitle, setBankSignTitle] = useState<string>("ব্যাংক কর্তৃপক্ষের স্বাক্ষর");
  const [borrowerSignText, setBorrowerSignText] = useState<string>("ঋণ গ্রহীতার স্বাক্ষর");

  // Helper to re-generate Paragraph 1 based on current form fields
  const handleRegenerateParagraph1 = () => {
    const amtStr = toBengaliNumber(loanAmount.toLocaleString("en-IN"));
    const durStr = `${toBengaliNumber(durationMonths)} মাস`;
    const emiStr = toBengaliNumber(monthlyEMI.toLocaleString("en-IN"));
    const comp = stampCompanyName.trim() || platformTitle;
    setStampParagraph1(
      `আমি মোঃ ${customerName} , পিতা - ${customerFatherName} , সাং - ${customerAddress}। আমাকে ${comp} ${amtStr} টাকা, ${durStr} মেয়াদি, প্রতিমাসে ${emiStr} টাকা কিস্তির ঋণ প্রস্তাব করিলে, আমি সকল প্রক্রিয়া সম্পূর্ণ করে ও ${comp} এর সকল শর্ত মেনে ঋণটি নিতে রাজি হয়েছি।`
    );
    setStampParagraph3(
      `আমি ব্যাংক কর্তৃপক্ষ সাক্ষ্য দিচ্ছি যে মোঃ ${customerName} এর দেওয়া তথ্যের উপর ভিত্তি করে ও তার আর্থিক অবস্থা এবং ঋণের যোগ্যতা যাচাই করে, আমার আত্মবিশ্বাস যে তিনি আমাদের দেওয়া সকল শর্ত ও নিয়মাবলী পূরণ করতে পারবে।`
    );
    toast.success("চুক্তিপত্রের ১ ও ৩ নম্বর অনুচ্ছেদ বর্তমান তথ্য অনুযায়ী অটো-আপডেট হয়েছে!");
  };

  // 2. Insurance State (Popular Companies & Custom input)
  const [insuranceCompany, setInsuranceCompany] = useState<string>("জীবন বীমা কর্পোরেশন (JBC)");
  const [customInsuranceName, setCustomInsuranceName] = useState<string>("");
  const [policyNumber, setPolicyNumber] = useState<string>(`INS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [insuranceCoverage, setInsuranceCoverage] = useState<number>(loanAmount * 1.5);
  const [insuranceTerms, setInsuranceTerms] = useState<string>(
    `১. ঋণ পরিশোধ চলাকালীন গ্রাহকের যেকোনো অনাকাঙ্ক্ষিত দুর্ঘটনা বা মৃত্যুজনিত কারণে অবশিষ্ট সম্পূর্ণ ঋণ মওকুফ হবে।
২. পরিবারের ওপর কোনো দেনা বা আর্থিক দায় বর্তাবে না।
৩. স্থায়ী পঙ্গুত্ব বা জরুরি চিকিৎসার প্রয়োজনে বিশেষ আর্থিক অনুদান প্রাপ্তি।`
  );

  // 3. Staff ID Card State (Image 4 - Dutch-Bangla Agent Banking Real ID Card Style)
  const [staffBankName, setStaffBankName] = useState<string>("Dutch-Bangla Bank Ltd");
  const [staffSubBadge, setStaffSubBadge] = useState<string>("Agent Banking");
  const [staffEnterprise, setStaffEnterprise] = useState<string>("Thanovi Enterprise");
  const [staffName, setStaffName] = useState<string>("মোঃ আবদুর রহিম");
  const [staffNameEn, setStaffNameEn] = useState<string>("MD. Abdur Rahim");
  const [staffDesignation, setStaffDesignation] = useState<string>("এজেন্ট অফিসার");
  const [staffDesignationEn, setStaffDesignationEn] = useState<string>("Agent Officer");
  const [staffLicenceNo, setStaffLicenceNo] = useState<string>("4216");
  const [staffIdNumber, setStaffIdNumber] = useState<string>("203376183");
  const [staffBloodGroup, setStaffBloodGroup] = useState<string>("O+");
  const [staffPhone, setStaffPhone] = useState<string>("01790-335133");
  const [staffSignatureText, setStaffSignatureText] = useState<string>("Rani");
  const [staffPhotoUrl, setStaffPhotoUrl] = useState<string>(
    "https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261016/image_1792137064677.png"
  );
  const [staffDepartment, setStaffDepartment] = useState<string>("Agent Banking Division");
  const [staffJoinDate, setStaffJoinDate] = useState<string>("2023-01-01");
  const [staffExpiryDate, setStaffExpiryDate] = useState<string>("2028-12-31");
  const [staffWhatsapp, setStaffWhatsapp] = useState<string>("+880 1790-335133");
  const [staffEmail, setStaffEmail] = useState<string>("agent.officer@bdloan.world");
  const [staffBranchAddress, setStaffBranchAddress] = useState<string>("প্রধান শাখা, দিলকুশা বাণিজ্যিক এলাকা, মতিঝিল, ঢাকা-১০০০");
  const [cardTheme, setCardTheme] = useState<"red_navy" | "navy" | "emerald" | "burgundy" | "slate">("red_navy");
  const [cardSide, setCardSide] = useState<"both" | "front" | "back">("both");

  // Visiting Card Specific Settings
  const [visitingCompanyNameEn, setVisitingCompanyNameEn] = useState<string>("COMPANY");
  const [visitingCompanySubtitle, setVisitingCompanySubtitle] = useState<string>("LOGO HERE");
  const [visitingLogoUrl, setVisitingLogoUrl] = useState<string>("");
  const [visitingAddressLine1, setVisitingAddressLine1] = useState<string>("YOUR FIRST ADDRESS LINE");
  const [visitingAddressLine2, setVisitingAddressLine2] = useState<string>("SECOND ADDRESS LINE");
  const [visitingPhone2, setVisitingPhone2] = useState<string>("+0 987 675 789 123");
  const [visitingWebsite, setVisitingWebsite] = useState<string>("WWW.YOURCOMPANY.COM");

  // Real Bangladesh Bank Cheque States (Image 2 - Rupali Bank / CTS Cheque Style)
  const [selectedBdBank, setSelectedBdBank] = useState<string>("রূপালী ব্যাংক পিএলসি (Rupali Bank PLC)");
  const [customBdBankName, setCustomBdBankName] = useState<string>("");
  const [chequeBranchName, setChequeBranchName] = useState<string>("Rupali Sadan Corporate Dhaka");
  const [chequeRoutingNo, setChequeRoutingNo] = useState<string>("185275868");
  const [chequeAccountNo, setChequeAccountNo] = useState<string>("0026010014592");
  const [chequeAccountHolderName, setChequeAccountHolderName] = useState<string>("S M SALEHUR RAHMAN");
  const [chequePayeeName, setChequePayeeName] = useState<string>("");
  const [chequeAmountWords, setChequeAmountWords] = useState<string>("");
  const [chequeAmountFigures, setChequeAmountFigures] = useState<string>("");
  const [chequeBearerMode, setChequeBearerMode] = useState<"bearer" | "ac_payee">("bearer");
  const [chequeAuthorizedTitle, setChequeAuthorizedTitle] = useState<string>("AUTHORIZED SIGNATORY");
  const [chequeSignatureText, setChequeSignatureText] = useState<string>("Authorized Sign");

  const activeChequeBank = selectedBdBank.includes("অন্যান্য")
    ? (customBdBankName || "কাস্টম ব্যাংক পিএলসি")
    : selectedBdBank.includes("Rupali Bank")
    ? "RUPALI BANK LIMITED"
    : selectedBdBank.split("(")[1]?.replace(")", "") || selectedBdBank.split(" (")[0];

  // When changing selected customer, update form
  const handleCustomerChange = (userId: string) => {
    setSelectedCustomerId(userId);
    const u = users.find((x) => x.id === userId);
    if (u) {
      const app = applications.find((a) => a.phone === u.phone);
      setCustomerName(u.name);
      setCustomerPhone(u.phone);
      if (u.nidNumber) setCustomerNid(u.nidNumber);
      if (app) {
        setLoanAmount(app.loanAmount || app.amount || 100000);
        setDurationMonths(app.durationMonths);
        setMonthlyEMI(app.monthlyEMI);
        if (app.presentAddress) setCustomerAddress(app.presentAddress);
      }
      setStampParagraph3(
        `আমি ব্যাংক কর্তৃপক্ষকে সাক্ষ্য দিচ্ছি যে আমি-${u.name}, উপরের তথ্য ভিত্তি করে আমি আত্মবিশ্বাসী যে আমার তাদের সকল শর্তাবলী পালন করতে পারবো`
      );
      const savedPhoto = u.photoUrl || u.avatarUrl || app?.documents?.find((d) => d.category === "selfie")?.previewUrl;
      if (savedPhoto) {
        setCustomerPhotoUrl(savedPhoto);
        setStaffPhotoUrl(savedPhoto);
      }
    }
  };

  const handlePrintOrPdf = () => {
    window.print();
    saveGeneratedDocument({
      id: `doc-${Date.now()}`,
      docNumber,
      type: docType,
      docType: docType,
      titleBn:
        docType === "bd_stamp"
          ? "বাংলাদেশ নন-জুডিশিয়াল ১০০ টাকার স্ট্যাম্প (ঋণের চুক্তিপত্র)"
          : docType === "bank_cheque"
          ? "ব্যাংক চেক"
          : docType === "sanction_letter"
          ? "লোন অনুমোদন পত্র"
          : docType === "insurance_policy"
          ? "ইন্স্যুরেন্স পলিসি সনদ"
          : docType === "staff_id_card"
          ? "অফিসিয়াল স্মার্ট স্টাফ আইডি কার্ড"
          : docType === "staff_visiting_card"
          ? "প্রকৃত কর্পোরেট ভিজিটিং কার্ড"
          : "মানি রিসিট",
      userId: selectedUser?.id || "demo-user",
      customerName,
      customerPhone,
      customerNid,
      customerAddress,
      loanAmount,
      loanDurationMonths: durationMonths,
      monthlyEMI,
      createdDate: issueDate,
      issuerName: `${platformTitle} ফাইন্যান্স লিমিটেড`,
      issuerDesignation: "অনুমোদিত কর্মকর্তা",
      contentData: { 
        bankName, 
        branchName, 
        chequeNumber, 
        policyNumber, 
        customerPhotoUrl,
        insuranceCompany: insuranceCompany === "কাস্টম বীমা কোম্পানি (Custom)" ? customInsuranceName : insuranceCompany,
        staffName,
        staffDesignation,
        staffIdNumber,
        staffBankName
      }
    });
    toast.success("ডকুমেন্টটি সফলভাবে প্রস্তুত ও প্রিন্ট ডায়ালগে পাঠানো হয়েছে");
  };

  // 1. High-Resolution Document Canvas Capture (Captures ONLY the document container, NO sidebar/forms)
  const generateDocumentCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!printContainerRef.current) {
      toast.error("ডকুমেন্ট কন্টেইনার পাওয়া যায়নি");
      return null;
    }
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const canvas = await html2canvas(printContainerRef.current, {
        scale: 2.5, // Ultra sharp and crisp rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1200,
      });
      return canvas;
    } catch (error) {
      console.error("Error generating document canvas:", error);
      toast.error("ডকুমেন্টের ছবি তৈরি করতে সমস্যা হয়েছে");
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  // 2. Download Pure PNG Image (No PDF, No Page Elements)
  const handleDownloadImage = async () => {
    const canvas = await generateDocumentCanvas();
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const docSlug = (docType === "bd_stamp" ? "100_Taka_Stamp" : docType).replace(/\s+/g, "_");
      const custSlug = (customerName || "Customer").replace(/\s+/g, "_");
      link.download = `${docSlug}_${custSlug}_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      saveGeneratedDocument({
        id: `doc-${Date.now()}`,
        docNumber,
        type: docType,
        docType: docType,
        titleBn:
          docType === "bd_stamp"
            ? "বাংলাদেশ নন-জুডিশিয়াল ১০০ টাকার স্ট্যাম্প (ঋণের চুক্তিপত্র)"
            : docType === "bank_cheque"
            ? "ব্যাংক চেক"
            : docType === "sanction_letter"
            ? "লোন অনুমোদন পত্র"
            : docType === "insurance_policy"
            ? "ইন্স্যুরেন্স পলিসি সনদ"
            : docType === "staff_id_card"
            ? "অফিসিয়াল স্মার্ট স্টাফ আইডি কার্ড"
            : docType === "staff_visiting_card"
            ? "প্রকৃত কর্পোরেট ভিজিটিং কার্ড"
            : "মানি রিসিট",
        userId: selectedUser?.id || "demo-user",
        customerName,
        customerPhone,
        customerNid,
        customerAddress,
        loanAmount,
        loanDurationMonths: durationMonths,
        monthlyEMI,
        createdDate: issueDate,
        issuerName: `${platformTitle} ফাইন্যান্স লিমিটেড`,
        issuerDesignation: "অনুমোদিত কর্মকর্তা",
        contentData: { 
          bankName, 
          branchName, 
          chequeNumber, 
          policyNumber, 
          customerPhotoUrl,
          insuranceCompany: insuranceCompany === "কাস্টম বীমা কোম্পানি (Custom)" ? customInsuranceName : insuranceCompany,
          staffName,
          staffDesignation,
          staffIdNumber,
          staffBankName,
          stampSerialNo,
          stampTitle,
          customerFatherName,
          customerDistrict,
          stampCompanyName,
          stampParagraph1,
          stampParagraph2,
          stampParagraph3,
          showApprovedSeal,
          bankSignDate,
          bankSignTitle,
          borrowerSignText
        }
      });

      toast.success("শুধুমাত্র ডকুমেন্টের আসল ছবি (PNG) সফলভাবে ডাউনলোড হয়েছে!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("ছবি ডাউনলোড ব্যর্থ হয়েছে");
    }
  };

  // 3. One-Click Copy Image to Clipboard (Instant Paste in WhatsApp, Imo, etc.)
  const handleCopyImage = async () => {
    const canvas = await generateDocumentCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    setPreviewImageUrl(dataUrl);

    try {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && typeof ClipboardItem !== "undefined") {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
            toast.success("ডকুমেন্টের ছবি ক্লিপবোর্ডে কপি হয়েছে! আপনি সরাসরি মেসেঞ্জার, ইমু বা হোয়াটসঅ্যাপে পেস্ট (Ctrl+V) করতে পারবেন।");
            return;
          } catch (clipErr) {
            console.warn("Direct clipboard item write restricted, opening preview:", clipErr);
          }
        }
        setPreviewModalOpen(true);
        toast.info("ছবিটি স্ক্রিনে উন্মুক্ত হয়েছে। ছবির উপর মাউসের রাইট ক্লিক করে 'Copy image' নির্বাচন করুন।");
      }, "image/png");
    } catch (err) {
      console.error("Copy error:", err);
      setPreviewModalOpen(true);
      toast.info("ছবিটি স্ক্রিনে উন্মুক্ত হয়েছে। আপনি সরাসরি এখান থেকে কপি বা সেভ করতে পারেন।");
    }
  };

  // 4. Open Modal for Native Right-Click Copy or Large Preview
  const handleOpenPreviewModal = async () => {
    if (previewImageUrl) {
      setPreviewModalOpen(true);
      return;
    }
    const canvas = await generateDocumentCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    setPreviewImageUrl(dataUrl);
    setPreviewModalOpen(true);
  };

  const activeInsuranceCompanyName = 
    insuranceCompany === "কাস্টম বীমা কোম্পানি (Custom)"
      ? (customInsuranceName.trim() || "বিশেষায়িত জীবন বীমা কোম্পানি লিমিটেড")
      : insuranceCompany;

  const resolvedStampValueText = "১০০ টাকা";

  return (
    <AdminLayout
      title="অফিসিয়াল ডকুমেন্ট, ১০০ টাকার স্ট্যাম্প ও আইডি কার্ড জেনারেটর"
      subtitle="১০০ টাকার নন-জুডিশিয়াল স্ট্যাম্প, বাংলাদেশ ব্যাংক স্টাফ আইডি কার্ড, রিয়েল ব্যাংক চেক, জনপ্রিয় জীবন বীমা ও মানি রিসিট প্রস্তুতকারক"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action: Download ONLY the Document Image as PNG */}
          <Button
            onClick={handleDownloadImage}
            disabled={isCapturing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 gap-1.5 shadow-sm cursor-pointer"
            title="সম্পূর্ণ পেজ বা পিডিএফ ছাড়া শুধুমাত্র এই ডকুমেন্টের আসল ছবি ডাউনলোড করুন"
          >
            {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>ছবি ডাউনলোড (PNG)</span>
          </Button>

          {/* Mouse One-Click Copy Image */}
          <Button
            onClick={handleCopyImage}
            disabled={isCapturing}
            variant="outline"
            className="text-xs font-bold h-9 px-3.5 gap-1.5 border-blue-400 text-blue-700 hover:bg-blue-50 shadow-xs cursor-pointer"
            title="মাউস দিয়ে এক ক্লিকে ছবি কপি করুন"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
            <span>{copySuccess ? "কপি সম্পন্ন!" : "মাউস দিয়ে ছবি কপি"}</span>
          </Button>

          {/* Preview & Right-Click Copy */}
          <Button
            onClick={handleOpenPreviewModal}
            disabled={isCapturing}
            variant="secondary"
            className="text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
            title="বড় করে ছবি প্রিভিউ ও রাইট-ক্লিক কপি"
          >
            <Eye className="w-4 h-4 text-slate-700" />
            <span>ছবি প্রিভিউ</span>
          </Button>

          {/* Secondary Print Button */}
          <Button
            onClick={handlePrintOrPdf}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            title="প্রিন্ট ডায়ালগ (ঐচ্ছিক)"
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Controls Card */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="p-4 sm:p-5 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              ডকুমেন্টের ধরণ ও কাস্টমাইজেশন প্যানেল
            </CardTitle>
            <CardDescription className="text-xs">
              গ্রাহক নির্বাচন করুন এবং প্রয়োজনীয় ডকুমেন্ট সিলেক্ট করে যেকোনো লেখা বা শর্ত অ্যাডমিন থেকে এডিট করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">গ্রাহক নির্বাচন করুন *</Label>
                <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="h-10 text-xs mt-1">
                    <SelectValue placeholder="গ্রাহক নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.name} ({u.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">দলিল বা ডকুমেন্টের ধরণ *</Label>
                <Select value={docType} onValueChange={(val) => setDocType(val as any)}>
                  <SelectTrigger className="h-10 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bd_stamp" className="text-xs font-bold text-emerald-700">
                      📜 বাংলাদেশ নন-জুডিশিয়াল স্ট্যাম্প (১০০ টাকা ও কাস্টম)
                    </SelectItem>
                    <SelectItem value="staff_id_card" className="text-xs font-bold text-teal-700">
                      🪪 অফিসিয়াল স্মার্ট স্টাফ আইডি কার্ড (Official Smart Staff ID Card)
                    </SelectItem>
                    <SelectItem value="staff_visiting_card" className="text-xs font-bold text-indigo-700">
                      💼 প্রকৃত কর্পোরেট ভিজিটিং কার্ড (Corporate Business / Visiting Card)
                    </SelectItem>
                    <SelectItem value="bank_cheque" className="text-xs font-bold text-blue-700">
                      🏦 রিয়েল ব্যাংক চেক (Bank Cheque)
                    </SelectItem>
                    <SelectItem value="insurance_policy" className="text-xs font-bold text-amber-700">
                      🛡️ ঋণ ঝুঁকি বীমা পলিসি (জনপ্রিয় ও কাস্টম বীমা)
                    </SelectItem>
                    <SelectItem value="sanction_letter" className="text-xs font-bold text-purple-700">
                      📄 অফিসিয়াল লোন অনুমোদন পত্র (Sanction Letter)
                    </SelectItem>
                    <SelectItem value="money_receipt" className="text-xs font-bold text-slate-700">
                      🧾 অফিসিয়াল মানি রিসিট ভাউচার (Money Receipt)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">ইস্যু তারিখ</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="h-10 text-xs mt-1"
                />
              </div>
            </div>

            {/* General Customer Info */}
            {docType !== "staff_id_card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t text-xs">
                <div>
                  <Label className="text-[11px] font-medium text-muted-foreground">গ্রাহকের নাম</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-medium text-muted-foreground">মোবাইল নম্বর</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-medium text-muted-foreground">এনআইডি নম্বর</Label>
                  <Input
                    value={customerNid}
                    onChange={(e) => setCustomerNid(e.target.value)}
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-medium text-muted-foreground">লোনের পরিমাণ (টাকা)</Label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => {
                       const val = Number(e.target.value);
                       setLoanAmount(val);
                       setInsuranceCoverage(val * 1.5);
                    }}
                    className="h-9 text-xs font-bold mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-medium text-muted-foreground">গ্রাহকের বর্তমান ঠিকানা (Customer Address) *</Label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="যেমন: গ্রাম- রামপুর, ডাকঘর- সোনাতলা, বগুড়া"
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-medium text-muted-foreground">ব্যাংক / প্রতিষ্ঠানের শাখা ও প্রধান কার্যালয় ঠিকানা (Branch Address) *</Label>
                  <Input
                    value={staffBranchAddress}
                    onChange={(e) => {
                      setStaffBranchAddress(e.target.value);
                    }}
                    placeholder="যেমন: প্রধান শাখা, দিলকুশা বা/এ, মতিঝিল, ঢাকা-১০০০"
                    className="h-9 text-xs mt-1"
                  />
                </div>
              </div>
            )}

            {/* CUSTOMER PHOTO UPLOAD & MANAGEMENT PANEL */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-600 text-white shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      ডকুমেন্টে গ্রাহকের ছবি সংযুক্তি (গ্যালারি / ডিভাইস আপলোড)
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-300">
                        লাইভ প্রিভিউ ও প্রিন্ট রেডি
                      </span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      গ্যালারি থেকে গ্রাহকের পাসপোর্ট ছবি আপলোড করুন; এটি স্ট্যাম্প, চেক, অনুমোদন পত্র, বীমা সনদ ও মানি রিসিটে যুক্ত হবে।
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-slate-700 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-white select-none">
                    <input
                      type="checkbox"
                      checked={showCustomerPhoto}
                      onChange={(e) => setShowCustomerPhoto(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>ডকুমেন্টে ছবি দেখান</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Photo preview with Passport frame */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="w-24 h-28 rounded border-2 border-slate-700 p-1 bg-white shadow-md relative overflow-hidden flex items-center justify-center">
                    {customerPhotoUrl ? (
                      <img
                        src={customerPhotoUrl}
                        alt="Customer Passport"
                        className="w-full h-full object-cover rounded-xs"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <span className="text-[9px] block">ছবি নেই</span>
                      </div>
                    )}
                    {/* Verification watermark badge */}
                    <div className="absolute bottom-0 inset-x-0 bg-emerald-700/85 text-white text-[8px] font-bold py-0.5 text-center tracking-tight">
                      VERIFIED
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 mt-1">পাসপোর্ট সাইজ ছবি</span>
                </div>

                {/* Upload buttons & presets */}
                <div className="flex-1 w-full space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 gap-1.5 shadow-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      গ্যালারি / ডিভাইস থেকে ছবি আপলোড করুন
                    </Button>

                    <Button
                      type="button"
                      onClick={handleUseCustomerSavedPhoto}
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 font-medium bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5"
                    >
                      <Contact2 className="w-3.5 h-3.5" />
                      প্রোফাইল / সেলফি ব্যবহার করুন
                    </Button>

                    {customerPhotoUrl && (
                      <Button
                        type="button"
                        onClick={() => {
                          setCustomerPhotoUrl("");
                          setShowCustomerPhoto(false);
                          toast.info("ছবি সরানো হয়েছে");
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        ছবি সরান
                      </Button>
                    )}
                  </div>

                  {/* Preset sample avatars for instant testing */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-700">নমুনা ডেমো ছবি:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerPhotoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
                        setStaffPhotoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
                        setShowCustomerPhoto(true);
                        toast.success("নমুনা ১ (তরুণ) নির্বাচিত হয়েছে");
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                    >
                      ছবি ১ (পুরুষ)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerPhotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
                        setStaffPhotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
                        setShowCustomerPhoto(true);
                        toast.success("নমুনা ২ (নারী) নির্বাচিত হয়েছে");
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                    >
                      ছবি ২ (নারী)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerPhotoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80");
                        setStaffPhotoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80");
                        setShowCustomerPhoto(true);
                        toast.success("নমুনা ৩ (ব্যবসায়ী) নির্বাচিত হয়েছে");
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                    >
                      ছবি ৩ (ব্যবসায়ী)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SPECIFIC CONTROLS: 1. 100 TK NON-JUDICIAL STAMP (IMAGE 2 STYLE - ALL EDITABLE) */}
            {docType === "bd_stamp" && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-3.5 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                      <Stamp className="w-4 h-4 text-emerald-700" />
                      ১০০ টাকার সরকারি নন-জুডিশিয়াল স্ট্যাম্প 'ঋণের চুক্তিপত্র' (সবকিছু এডিটেবল)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerateParagraph1}
                      className="h-7 text-[11px] px-2.5 font-bold border-emerald-400 text-emerald-900 bg-emerald-100 hover:bg-emerald-200 cursor-pointer"
                      title="লোনের পরিমাণ, মেয়াদ ও কিস্তির তথ্য অনুযায়ী অনুচ্ছেদ ১ ও ৩ আপডেট করুন"
                    >
                      তথ্য অনুযায়ী অনুচ্ছেদ আপডেট
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">স্ট্যাম্প ক্রমিক নম্বর (Serial No) *</Label>
                    <Input
                      value={stampSerialNo}
                      onChange={(e) => setStampSerialNo(e.target.value)}
                      placeholder="প ৯৪৪৫৯৮৬"
                      className="h-9 text-xs bg-white font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">চুক্তিপত্রের শিরোনাম (Title) *</Label>
                    <Input
                      value={stampTitle}
                      onChange={(e) => setStampTitle(e.target.value)}
                      placeholder="ঋণের চুক্তিপত্র"
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">পিতা / স্বামীর নাম *</Label>
                    <Input
                      value={customerFatherName}
                      onChange={(e) => setCustomerFatherName(e.target.value)}
                      placeholder="মৃত রফিক উল্লাহ"
                      className="h-9 text-xs bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">জেলার নাম (District) *</Label>
                    <Input
                      value={customerDistrict}
                      onChange={(e) => setCustomerDistrict(e.target.value)}
                      placeholder="সিলেট"
                      className="h-9 text-xs bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-slate-800">ঋণ প্রদানকারী ব্যাংক / কোম্পানি নাম (অনুচ্ছেদের জন্য) *</Label>
                    <Input
                      value={stampCompanyName}
                      onChange={(e) => setStampCompanyName(e.target.value)}
                      placeholder="DBS Bank SG"
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">ব্যাংক কর্তৃপক্ষের স্বাক্ষরের তারিখ</Label>
                    <Input
                      value={bankSignDate}
                      onChange={(e) => setBankSignDate(e.target.value)}
                      placeholder="২৯/০১/২০২৫"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800">ঋণগ্রহীতার স্বাক্ষরের নাম</Label>
                    <Input
                      value={borrowerSignText}
                      onChange={(e) => setBorrowerSignText(e.target.value)}
                      placeholder="শাহিন"
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                {/* 3 Full Legal Paragraphs Textarea */}
                <div className="space-y-3 pt-2 border-t border-emerald-200">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                      <span>শর্তাবলী অনুচ্ছেদ ১ (লোনের অঙ্ক, মেয়াদ, কিস্তি ও সম্মতি বিবরণ)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">সম্পূর্ণ এডিটেবল</span>
                    </Label>
                    <Textarea
                      rows={3}
                      value={stampParagraph1}
                      onChange={(e) => setStampParagraph1(e.target.value)}
                      className="text-xs bg-white resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                      <span>শর্তাবলী অনুচ্ছেদ ২ (দেরি বা কিস্তি পরিশোধের শর্ত)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">সম্পূর্ণ এডিটেবল</span>
                    </Label>
                    <Textarea
                      rows={2}
                      value={stampParagraph2}
                      onChange={(e) => setStampParagraph2(e.target.value)}
                      className="text-xs bg-white resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                      <span>শর্তাবলী অনুচ্ছেদ ৩ (গ্রাহকের সাক্ষ্য ও অঙ্গীকারনামা)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">সম্পূর্ণ এডিটেবল</span>
                    </Label>
                    <Textarea
                      rows={2}
                      value={stampParagraph3}
                      onChange={(e) => setStampParagraph3(e.target.value)}
                      className="text-xs bg-white resize-y"
                    />
                  </div>
                </div>

                {/* Stamp Flags */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-emerald-200">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-300">
                    <input
                      type="checkbox"
                      checked={showApprovedSeal}
                      onChange={(e) => setShowApprovedSeal(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>লাল বৃত্তাকার \'APPROVED\' সিলমোহর দেখান</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-300">
                    <input
                      type="checkbox"
                      checked={showCustomerPhoto}
                      onChange={(e) => setShowCustomerPhoto(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>গ্রাহকের পাসপোর্ট ছবি যুক্ত রাখুন</span>
                  </label>
                </div>
              </div>
            )}

            {/* SPECIFIC CONTROLS: 2. INSURANCE (POPULAR BD COMPANIES & CUSTOM) */}
            {docType === "insurance_policy" && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    জনপ্রিয় জীবন বীমা কোম্পানি ও পলিসি শর্ত নির্বাচন
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">বীমা কোম্পানি নির্বাচন করুন</Label>
                    <Select value={insuranceCompany} onValueChange={(val) => setInsuranceCompany(val)}>
                      <SelectTrigger className="h-9 text-xs bg-white border-amber-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_INSURANCE_COMPANIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {insuranceCompany === "কাস্টম বীমা কোম্পানি (Custom)" && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-amber-900">কাস্টম বীমা কোম্পানির নাম লিখুন *</Label>
                      <Input
                        value={customInsuranceName}
                        onChange={(e) => setCustomInsuranceName(e.target.value)}
                        placeholder="যেমন: পদ্মা লাইফ ইন্স্যুরেন্স লিমিটেড"
                        className="h-9 text-xs bg-white font-bold"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">বীমা কভারেজ পরিমাণ (টাকা)</Label>
                    <Input
                      type="number"
                      value={insuranceCoverage}
                      onChange={(e) => setInsuranceCoverage(Number(e.target.value))}
                      className="h-9 text-xs bg-white font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3">
                    <Label className="text-[11px] font-bold text-amber-900">বীমার মূল সুবিধাসমূহ ও শর্তাবলী</Label>
                    <Textarea
                      rows={3}
                      value={insuranceTerms}
                      onChange={(e) => setInsuranceTerms(e.target.value)}
                      className="text-xs bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC CONTROLS: 2. REAL BANGLADESH BANK CHEQUE (IMAGE 2 STYLE) */}
            {docType === "bank_cheque" && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-amber-300/70 pb-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    রিয়েল বাংলাদেশ ব্যাংক চেক (Real CTS Bank Cheque) কাস্টমাইজেশন
                  </span>
                  <Badge className="bg-amber-800 text-white font-mono text-[10px]">
                    REAL CHEQUE (IMAGE 2)
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">ব্যাংক নির্বাচন (Select Bank) *</Label>
                    <Select value={selectedBdBank} onValueChange={(val) => setSelectedBdBank(val)}>
                      <SelectTrigger className="h-9 text-xs bg-white font-bold border-amber-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {BD_BANKS.map((b) => (
                          <SelectItem key={b} value={b} className="text-xs">
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBdBank.includes("অন্যান্য") && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-amber-900">কাস্টম ব্যাংকের নাম *</Label>
                      <Input
                        value={customBdBankName}
                        onChange={(e) => setCustomBdBankName(e.target.value)}
                        placeholder="যেমন: RUPALI BANK LIMITED"
                        className="h-9 text-xs bg-white font-bold"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">শাখার নাম ও ঠিকানা (Branch & Address) *</Label>
                    <Input
                      value={chequeBranchName}
                      onChange={(e) => setChequeBranchName(e.target.value)}
                      placeholder="Rupali Sadan Corporate Dhaka"
                      className="h-9 text-xs bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">চেকের সিরিয়াল নং (SBA / CQ No) *</Label>
                    <Input
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      placeholder="SBA 5944952"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">রাউটিং / ব্রাঞ্চ কোড (Branch/Routing No)</Label>
                    <Input
                      value={chequeRoutingNo}
                      onChange={(e) => setChequeRoutingNo(e.target.value)}
                      placeholder="185275868"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">অ্যাকাউন্ট নম্বর (A/C No) *</Label>
                    <Input
                      value={chequeAccountNo}
                      onChange={(e) => setChequeAccountNo(e.target.value)}
                      placeholder="0026010014592"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">অ্যাকাউন্টধারীর নাম (Name) *</Label>
                    <Input
                      value={chequeAccountHolderName}
                      onChange={(e) => setChequeAccountHolderName(e.target.value)}
                      placeholder="S M SALEHUR RAHMAN"
                      className="h-9 text-xs bg-white font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">প্রাপকের নাম (Pay To)</Label>
                    <Input
                      value={chequePayeeName || customerName}
                      onChange={(e) => setChequePayeeName(e.target.value)}
                      placeholder={customerName}
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">টাকার পরিমাণ কথায় (The sum of Taka)</Label>
                    <Input
                      value={chequeAmountWords}
                      onChange={(e) => setChequeAmountWords(e.target.value)}
                      placeholder={loanAmount >= 100000 ? `${(loanAmount / 100000).toFixed(0)} Lakh Taka Only` : `Taka ${loanAmount.toLocaleString("en-US")} Only`}
                      className="h-9 text-xs bg-white font-serif"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">টাকার পরিমাণ অঙ্কে (TK. Box)</Label>
                    <Input
                      value={chequeAmountFigures}
                      onChange={(e) => setChequeAmountFigures(e.target.value)}
                      placeholder={`${loanAmount.toLocaleString("en-US")} /-`}
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">চেকের ধরন (Mode)</Label>
                    <Select value={chequeBearerMode} onValueChange={(val: any) => setChequeBearerMode(val)}>
                      <SelectTrigger className="h-9 text-xs bg-white font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bearer">বাহককে প্রদানযোগ্য (Or Bearer - Image 2 Style)</SelectItem>
                        <SelectItem value="ac_payee">একাউন্ট পেয়ি (A/C PAYEE ONLY - ক্রস চেক)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900">স্বাক্ষরকারী টেক্সট (Signatory)</Label>
                    <Input
                      value={chequeSignatureText}
                      onChange={(e) => setChequeSignatureText(e.target.value)}
                      placeholder="Authorized Sign"
                      className="h-9 text-xs bg-white italic font-serif"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC CONTROLS: 3. STAFF ID CARD (IMAGE 4 STYLE) */}
            {docType === "staff_id_card" && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                    <Contact2 className="w-4 h-4 text-blue-700" />
                    রিয়েল স্টাফ আইডি কার্ড (Dutch-Bangla Agent Banking Style - Image 4)
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "both" ? "default" : "outline"}
                      onClick={() => setCardSide("both")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      উভয় পিঠ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "front" ? "default" : "outline"}
                      onClick={() => setCardSide("front")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      সামনে
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "back" ? "default" : "outline"}
                      onClick={() => setCardSide("back")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      পেছনে
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">ব্যাংক / প্রতিষ্ঠানের নাম *</Label>
                    <Input
                      value={staffBankName}
                      onChange={(e) => setStaffBankName(e.target.value)}
                      placeholder="Dutch-Bangla Bank Ltd"
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">সাব-হেডিং (Sub-Badge) *</Label>
                    <Input
                      value={staffSubBadge}
                      onChange={(e) => setStaffSubBadge(e.target.value)}
                      placeholder="Agent Banking"
                      className="h-9 text-xs bg-white font-bold text-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">আউটলেট / এন্টারপ্রাইজ নাম *</Label>
                    <Input
                      value={staffEnterprise}
                      onChange={(e) => setStaffEnterprise(e.target.value)}
                      placeholder="Thanovi Enterprise"
                      className="h-9 text-xs bg-white font-bold text-cyan-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">কর্মকর্তার নাম (Officer Name) *</Label>
                    <Input
                      value={staffNameEn}
                      onChange={(e) => setStaffNameEn(e.target.value)}
                      placeholder="MD. Abdur Rahim"
                      className="h-9 text-xs bg-white font-bold uppercase font-serif"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">পদবি (Designation) *</Label>
                    <Input
                      value={staffDesignationEn}
                      onChange={(e) => setStaffDesignationEn(e.target.value)}
                      placeholder="Agent Officer"
                      className="h-9 text-xs bg-white font-bold text-blue-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">লাইসেন্স নম্বর (Licence No) *</Label>
                    <Input
                      value={staffLicenceNo}
                      onChange={(e) => setStaffLicenceNo(e.target.value)}
                      placeholder="4216"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">রক্তের গ্রুপ (Blood Group) *</Label>
                    <Input
                      value={staffBloodGroup}
                      onChange={(e) => setStaffBloodGroup(e.target.value)}
                      placeholder="O+"
                      className="h-9 text-xs bg-white font-bold text-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">আইডি নম্বর (ID No) *</Label>
                    <Input
                      value={staffIdNumber}
                      onChange={(e) => setStaffIdNumber(e.target.value)}
                      placeholder="203376183"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">কল / মোবাইল নম্বর (Call) *</Label>
                    <Input
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="01790-335133"
                      className="h-9 text-xs bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">স্বাক্ষর (Authorised Sign) *</Label>
                    <Input
                      value={staffSignatureText}
                      onChange={(e) => setStaffSignatureText(e.target.value)}
                      placeholder="Rani"
                      className="h-9 text-xs bg-white italic font-serif font-bold"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <Label className="text-[11px] font-bold text-blue-900">কর্মকর্তার ছবির লিংক (Photo URL) *</Label>
                    <Input
                      value={staffPhotoUrl}
                      onChange={(e) => setStaffPhotoUrl(e.target.value)}
                      placeholder="Image URL"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC CONTROLS: 4. CORPORATE VISITING CARD */}
            {docType === "staff_visiting_card" && (
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
                  <span className="font-bold text-red-950 flex items-center gap-1.5 text-sm">
                    <CreditCard className="w-4 h-4 text-red-700" />
                    রেড-নেভি এক্সক্লুসিভ ভিজিটিং কার্ড (Visiting Card - Image 4 Style) কাস্টমাইজেশন
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "both" ? "default" : "outline"}
                      onClick={() => setCardSide("both")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      উভয় পিঠ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "front" ? "default" : "outline"}
                      onClick={() => setCardSide("front")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      সামনে
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cardSide === "back" ? "default" : "outline"}
                      onClick={() => setCardSide("back")}
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      পেছনে
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">ভিজিটিং কার্ডের কালার থিম</Label>
                    <Select value={cardTheme} onValueChange={(val: any) => setCardTheme(val)}>
                      <SelectTrigger className="h-9 text-xs bg-white border-red-300 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red_navy" className="text-xs font-bold text-red-700">
                          🔴 রেড-নেভি এক্সক্লুসিভ (Image 4 Style - ডিফল্ট)
                        </SelectItem>
                        <SelectItem value="navy" className="text-xs font-bold text-blue-800">
                          🔵 এক্সিকিউটিভ নেভি ব্লু (Executive Navy)
                        </SelectItem>
                        <SelectItem value="emerald" className="text-xs font-bold text-emerald-800">
                          🟢 রয়েল এমারেল্ড ও গোল্ড (Emerald & Gold)
                        </SelectItem>
                        <SelectItem value="burgundy" className="text-xs font-bold text-rose-800">
                          🍷 প্রিমিয়াম বারগুন্ডি (Premium Burgundy)
                        </SelectItem>
                        <SelectItem value="slate" className="text-xs font-bold text-slate-800">
                          ⚫ ডার্ক মেটালিক প্লাটিনাম (Dark Slate)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">কোম্পানি / ব্যাংক নাম (English) *</Label>
                    <Input
                      value={visitingCompanyNameEn}
                      onChange={(e) => setVisitingCompanyNameEn(e.target.value)}
                      placeholder="COMPANY বা DBS BANK SG"
                      className="h-9 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">ট্যাগলাইন / সাবটাইটেল (Subtitle)</Label>
                    <Input
                      value={visitingCompanySubtitle}
                      onChange={(e) => setVisitingCompanySubtitle(e.target.value)}
                      placeholder="LOGO HERE বা SMART BANKING"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">কর্মকর্তার নাম (English) *</Label>
                    <Input
                      value={staffNameEn}
                      onChange={(e) => setStaffNameEn(e.target.value)}
                      placeholder="JOHN SMITH"
                      className="h-9 text-xs bg-white font-mono uppercase font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">পদবি (English Designation) *</Label>
                    <Input
                      value={staffDesignationEn}
                      onChange={(e) => setStaffDesignationEn(e.target.value)}
                      placeholder="CREATIVE DIRECTOR"
                      className="h-9 text-xs bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">মোবাইল নম্বর ১ (Phone 1) *</Label>
                    <Input
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="+0 123 456 789 324"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">মোবাইল নম্বর ২ (Phone 2)</Label>
                    <Input
                      value={visitingPhone2}
                      onChange={(e) => setVisitingPhone2(e.target.value)}
                      placeholder="+0 987 675 789 123"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">ইমেইল (Email Address)</Label>
                    <Input
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="J.SMITH@YOURCOMPANY.COM"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-red-900">ওয়েবসাইট (Website Ribbon)</Label>
                    <Input
                      value={visitingWebsite}
                      onChange={(e) => setVisitingWebsite(e.target.value)}
                      placeholder="WWW.YOURCOMPANY.COM"
                      className="h-9 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-red-900">কার্ডের ঠিকানা লাইন ১ (Address Line 1) *</Label>
                    <Input
                      value={visitingAddressLine1}
                      onChange={(e) => setVisitingAddressLine1(e.target.value)}
                      placeholder="YOUR FIRST ADDRESS LINE (যেমন: দিলকুশা বা/এ)"
                      className="h-9 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-red-900">কার্ডের ঠিকানা লাইন ২ (Address Line 2) *</Label>
                    <Input
                      value={visitingAddressLine2}
                      onChange={(e) => setVisitingAddressLine2(e.target.value)}
                      placeholder="SECOND ADDRESS LINE (যেমন: মতিঝিল, ঢাকা-১০০০)"
                      className="h-9 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-4">
                    <Label className="text-[11px] font-bold text-red-900">ব্যাংক / কোম্পানির নিজস্ব লোগো লিংক (Logo URL)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={visitingLogoUrl}
                        onChange={(e) => setVisitingLogoUrl(e.target.value)}
                        placeholder="https://... অথবা সরাসরি ইমেজ ফাইল সিলেক্ট করুন"
                        className="h-9 text-xs bg-white font-mono flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white font-bold shrink-0"
                      >
                        আপলোড
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Visual Document Preview Area (Printable & Direct Image Copy) */}
        <div className="space-y-3">
          {/* Top Quick Actions Bar for Image Download & Click to Copy */}
          <div className="bg-card p-3 sm:p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white text-[11px] font-bold gap-1 px-2 py-0.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  শুধুমাত্র ডকুমেন্টের ছবি (PNG)
                </Badge>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                  মাউস দিয়ে ছবিতে ক্লিক করেও কপি করা যাবে
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                সম্পূর্ণ পেজ বা অ্যাডমিন বার বাদ দিয়ে শুধু এই ডকুমেন্টের মূল অংশ ক্রিস্টাল-ক্লিয়ার ছবি হিসেবে ডাউনলোড ও কপি করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-8 px-3.5 gap-1.5 shadow-xs cursor-pointer"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>ছবি ডাউনলোড</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyImage}
                disabled={isCapturing}
                className="flex-1 sm:flex-none border-blue-400 text-blue-700 hover:bg-blue-50 font-bold text-xs h-8 px-3 gap-1.5 shadow-xs cursor-pointer"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                <span>{copySuccess ? "কপি হয়েছে!" : "ছবি কপি করুন"}</span>
              </Button>
            </div>
          </div>

          <div className="bg-muted/40 p-3 sm:p-6 md:p-8 rounded-2xl border flex flex-col items-center">
            {/* Click to Copy Floating Hint Badge */}
            <div className="mb-2">
              <button
                type="button"
                onClick={handleCopyImage}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs transition-all hover:scale-102 cursor-pointer"
                title="মাউস দিয়ে ক্লিক করে ছবি কপি করুন"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                <span>মাউস দিয়ে এই ডকুমেন্টে ক্লিক করলে ছবি কপি হয়ে যাবে</span>
              </button>
            </div>

            <div 
              ref={printContainerRef}
              id="printable-document-area"
              onClick={handleCopyImage}
              title="মাউস দিয়ে ক্লিক করে এই ডকুমেন্টের ছবি কপি করুন"
              className="w-full max-w-3xl bg-white text-slate-900 shadow-2xl rounded-xl p-6 md:p-10 border border-slate-300 relative print:m-0 print:p-8 print:shadow-none print:border-none print:w-full print:max-w-none cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all select-none group"
              style={{ fontFamily: "'Noto Serif Bengali', serif, sans-serif" }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 text-white font-bold text-[10px] px-2 py-1 rounded-md shadow-sm flex items-center gap-1 pointer-events-none z-20">
                <Copy className="w-3 h-3" />
                <span>ক্লিক করে কপি করুন</span>
              </div>
            {/* 1. AUTHENTIC 100 TK NON-JUDICIAL STAMP (IMAGE 2 STYLE - ALL EDITABLE) */}
            {docType === "bd_stamp" && (
              <AuthenticStampContractDocument
                data={{
                  stampSerialNo,
                  documentTitle: stampTitle,
                  customerName,
                  customerNid,
                  applicationDate: issueDate,
                  loanAmount,
                  durationMonths,
                  monthlyEMI,
                  fatherName: customerFatherName,
                  district: customerDistrict,
                  customerAddress,
                  companyName: stampCompanyName,
                  paragraph1: stampParagraph1,
                  paragraph2: stampParagraph2,
                  paragraph3: stampParagraph3,
                  customerPhotoUrl,
                  showCustomerPhoto,
                  showApprovedSeal,
                  bankSignDate,
                  bankSignTitle,
                  borrowerSignText,
                  bottomNotice,
                  bottomSlogan
                }}
              />
            )}

            {/* 2. REALISTIC STAFF ID CARD (OFFICIAL SMART LANYARD ID) */}
            {docType === "staff_id_card" && (
              <div className="space-y-4">
                <div className="text-center pb-2 border-b">
                  <h3 className="text-base font-bold text-teal-950 flex items-center justify-center gap-2">
                    <Award className="w-5 h-5 text-teal-600" />
                    অফিসিয়াল স্মার্ট স্টাফ আইডি কার্ড (Official Smart Staff ID Card)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ল্যানইয়ার্ড স্লট, হাই-রেজ্যুলুশন কর্মকর্তা ছবি, নিরাপত্তা বারকোড ও ভেরিফিকেশন কিউআর কোডসহ রিয়েল কার্ড
                  </p>
                </div>

                <div className="py-2">
                  <AuthenticStaffIdCard
                    staffNameBn={staffName}
                    staffNameEn={staffNameEn}
                    designationBn={staffDesignation}
                    designationEn={staffDesignationEn}
                    departmentBn={staffDepartment}
                    enterpriseName={staffEnterprise}
                    subBadgeText={staffSubBadge}
                    licenceNo={staffLicenceNo}
                    staffIdNumber={staffIdNumber}
                    bloodGroup={staffBloodGroup}
                    issueDate={staffJoinDate}
                    expiryDate={staffExpiryDate}
                    phone={staffPhone}
                    emergencyPhone={staffPhone}
                    email={staffEmail}
                    branchAddress={staffBranchAddress}
                    companyNameBn={staffBankName || platformTitle}
                    companyNameEn={staffBankName}
                    photoUrl={staffPhotoUrl}
                    signatureText={staffSignatureText}
                    side={cardSide}
                  />
                </div>
              </div>
            )}

            {/* 2.1 REALISTIC CORPORATE VISITING CARD */}
            {docType === "staff_visiting_card" && (
              <div className="space-y-4">
                <div className="text-center pb-2 border-b">
                  <h3 className="text-base font-bold text-indigo-950 flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    প্রকৃত কর্পোরেট বিজনেস ভিজিটিং কার্ড (Corporate Visiting Card)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    উভয় পিঠ (Front & Back) প্রিন্ট ও ইমেজ ডাউনলোড সুবিধাসহ আধুনিক এক্সিকিউটিভ ভিজিটিং কার্ড
                  </p>
                </div>

                <div className="py-2">
                  <CorporateVisitingCard
                    staffNameBn={staffName}
                    staffNameEn={staffNameEn}
                    designationBn={staffDesignation}
                    designationEn={staffDesignationEn}
                    departmentBn={staffDepartment}
                    phone={staffPhone}
                    phone2={visitingPhone2}
                    whatsapp={staffWhatsapp}
                    email={staffEmail}
                    website={visitingWebsite}
                    addressLine1={visitingAddressLine1}
                    addressLine2={visitingAddressLine2}
                    branchAddress={staffBranchAddress}
                    companyNameBn={staffBankName || platformTitle}
                    companyNameEn={visitingCompanyNameEn}
                    companySubtitle={visitingCompanySubtitle}
                    logoUrl={visitingLogoUrl}
                    licenseNo="MRA/REG-2019/BB-8924"
                    theme={cardTheme}
                    side={cardSide}
                  />
                </div>
              </div>
            )}

            {/* 3. REALISTIC BANGLADESH BANK CHEQUE (IMAGE 2 - RUPALI BANK / CTS CHEQUE STYLE) */}
            {docType === "bank_cheque" && (
              <div className="space-y-4">
                <div
                  className="border-2 border-[#c2bda8] rounded-xl p-5 md:p-7 bg-[#faf6eb] relative shadow-lg overflow-hidden font-sans text-slate-900 select-none print:shadow-none min-h-[300px]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(210, 195, 160, 0.25) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(230, 215, 180, 0.15) 2px, transparent 2px)`,
                    backgroundSize: "16px 16px, 32px 32px"
                  }}
                >
                  {/* Security microprint watermark rosette in background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                    <div className="w-80 h-80 rounded-full border-[10px] border-amber-900 flex items-center justify-center text-center p-6">
                      <span className="text-3xl font-black text-amber-950 uppercase tracking-widest leading-none">
                        BANGLADESH CTS CHEQUE<br />SECURITY WATERMARK
                      </span>
                    </div>
                  </div>

                  {/* Left Margin Printer Identifier (Like SECURA 11/20 18 in Image 2) */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 flex items-center gap-1.5 pointer-events-none opacity-60">
                    <div className="w-2 h-2 bg-slate-800" />
                    <span className="text-[8px] font-mono tracking-widest text-slate-700 font-bold uppercase">
                      SECURA 11/20 18
                    </span>
                  </div>

                  {/* Optional A/C Payee Only Parallel Diagonal Lines (When selected) */}
                  {chequeBearerMode === "ac_payee" && (
                    <div className="absolute top-3 left-8 pointer-events-none z-20">
                      <div className="w-32 h-12 border-t-2 border-b-2 border-slate-800 -rotate-[25deg] flex items-center justify-center bg-[#faf6eb]/85 px-1 shadow-xs">
                        <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">
                          // A/C PAYEE ONLY //
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TOP HEADER ROW: Bank Logo + Bank Name & Branch on Left, Serial No & Date on Right */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2 relative z-10 pl-6 sm:pl-8">
                    {/* Top Left: Bank Logo & Bank Details */}
                    <div className="flex items-start gap-3">
                      {/* Rupali Bank Style Round Emblem */}
                      <div className="w-12 h-12 rounded-full border-2 border-[#b31414] bg-white p-0.5 shadow-xs shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border border-dashed border-[#b31414] bg-[#b31414]/5 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-8 h-8">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#b31414" strokeWidth="6" />
                            {/* Stylized tree/emblem like Rupali Bank */}
                            <path d="M 50 18 C 30 18 20 40 35 55 C 25 65 35 75 50 75 C 65 75 75 65 65 55 C 80 40 70 18 50 18 Z" fill="#1b7a35" />
                            <rect x="46" y="60" width="8" height="20" fill="#6d4c41" />
                          </svg>
                        </div>
                      </div>

                      <div className="leading-tight">
                        <h2 className="text-xl md:text-2xl font-black text-[#b31414] tracking-tight uppercase font-serif">
                          {activeChequeBank}
                        </h2>
                        <p className="text-xs font-bold text-slate-900 font-sans mt-0.5">
                          {chequeBranchName}
                        </p>
                        <p className="text-xs font-bold text-slate-900 font-mono tracking-wider">
                          {chequeRoutingNo}
                        </p>
                      </div>
                    </div>

                    {/* Top Right: Serial Number & 8 Date Boxes */}
                    <div className="text-right shrink-0 self-end sm:self-auto">
                      <div className="text-sm md:text-base font-black text-slate-950 font-serif tracking-wider mb-1">
                        {chequeNumber}
                      </div>

                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[11px] font-black font-serif text-slate-950 tracking-wider">DATE</span>
                        <div className="flex items-center gap-[2px]">
                          {issueDate.split("-").join("").split("").map((digit, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-6 bg-white border border-slate-900 flex items-center justify-center text-xs font-mono font-bold text-slate-950 shadow-xs"
                            >
                              {digit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-[7px] text-[8px] font-serif font-bold text-slate-700 tracking-widest mt-0.5 pr-0.5">
                        <span>D</span>
                        <span>D</span>
                        <span>M</span>
                        <span>M</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE SECTION: PAY TO, THE SUM OF TAKA, TK. BOX */}
                  <div className="space-y-4 pt-3 relative z-10 pl-6 sm:pl-8">
                    {/* 1. Pay To Line */}
                    <div className="flex items-baseline gap-2 relative">
                      <span className="font-serif font-black text-slate-950 text-sm whitespace-nowrap">
                        Pay To
                      </span>
                      <div className="flex-1 relative border-b border-slate-900 pb-0.5 min-h-[26px] flex items-baseline">
                        <span className="font-serif font-black text-base text-slate-950 px-2 tracking-wide">
                          {chequePayeeName || customerName}
                        </span>
                      </div>
                      <span className="font-serif font-bold text-slate-950 text-xs whitespace-nowrap pl-2">
                        {chequeBearerMode === "bearer" ? (
                          "Or Bearer"
                        ) : (
                          <span className="line-through decoration-2 decoration-slate-900 opacity-60">
                            Or Bearer
                          </span>
                        )}
                      </span>
                    </div>

                    {/* 2. The sum of Taka Line & TK Box */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-baseline gap-3">
                      <div className="flex-1 flex items-baseline gap-2">
                        <span className="font-serif font-black text-slate-950 text-sm whitespace-nowrap">
                          The sum of Taka
                        </span>
                        <div className="flex-1 border-b border-slate-900 pb-0.5 min-h-[26px] flex items-baseline overflow-hidden">
                          <span className="font-serif font-bold text-xs md:text-sm text-slate-950 px-2 italic tracking-wide">
                            {chequeAmountWords || (loanAmount >= 100000 ? `${(loanAmount / 100000).toFixed(0)} Lakh Taka Only` : `Taka ${loanAmount.toLocaleString("en-US")} Only`)}
                            {" -----------------------------------------------------------------------------------------------------------------------------------------------------------------"}
                          </span>
                        </div>
                      </div>

                      {/* TK. Box on the right (Exact Image 2 Style) */}
                      <div className="shrink-0 self-end sm:self-auto">
                        <div className="border-2 border-slate-900 bg-white px-4 py-1.5 flex items-center gap-2 min-w-[200px] shadow-sm">
                          <span className="font-serif font-black text-sm text-slate-950">TK.</span>
                          <span className="font-mono font-black text-base md:text-lg text-slate-950 tracking-wider flex-1 text-right">
                            {chequeAmountFigures || `${loanAmount.toLocaleString("en-US")} /-`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Account Holder Name, A/C No and Signature Row */}
                    <div className="pt-4 flex flex-col sm:flex-row justify-between items-end gap-4">
                      {/* Left: Name and A/C No */}
                      <div className="space-y-1">
                        <div className="font-serif text-xs md:text-sm text-slate-950">
                          <span className="font-bold">Name : </span>
                          <span className="font-black tracking-wide uppercase">
                            {chequeAccountHolderName || customerName}
                          </span>
                        </div>
                        <div className="font-serif text-xs md:text-sm text-slate-950">
                          <span className="font-bold">A/C No. : </span>
                          <span className="font-mono font-black tracking-wider">
                            {chequeAccountNo}
                          </span>
                        </div>
                      </div>

                      {/* Right: Signature Area */}
                      <div className="text-center min-w-[220px]">
                        <div className="h-8 flex items-end justify-center px-4 font-serif italic text-sm text-slate-900 font-bold -mb-1">
                          {chequeSignatureText}
                        </div>
                        <div className="border-t border-slate-900 pt-0.5">
                          <span className="text-[9px] font-sans text-slate-700 block">
                            Please Sign Above This Line
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Bottom Authentic MICR Line (Image 2 Style) */}
                    <div className="mt-5 -mx-5 md:-mx-7 -mb-5 md:-mb-7 pt-3 pb-3 bg-[#faf6eb] border-t border-slate-300 flex items-center justify-center">
                      <div className="font-mono tracking-[0.25em] text-xs md:text-sm font-black text-slate-950 select-all">
                        ⑈ {chequeNumber.replace(/[^0-9]/g, "").slice(0, 7) || "5944952"} ⑈ {chequeRoutingNo || "185275868"}⑆ {chequeAccountNo.replace(/[^0-9]/g, "") || "0026010014592"}⑈ 10
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 4. INSURANCE POLICY CERTIFICATE (POPULAR BD INSURANCE & CUSTOM) */}
            {docType === "insurance_policy" && (
              <div className="space-y-5 text-xs leading-relaxed border-4 border-amber-800/40 p-6 md:p-8 rounded-2xl bg-amber-50/25 relative overflow-hidden">
                {/* Background IDRA Emblem */}
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-48 h-48 text-amber-900" />
                </div>

                <div className="text-center border-b-2 border-amber-800/30 pb-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center mx-auto mb-1 text-amber-900 font-black">
                    <ShieldCheck className="w-7 h-7 text-amber-800" />
                  </div>
                  <h2 className="text-xl font-black text-amber-950 tracking-tight font-serif">
                    {activeInsuranceCompanyName}
                  </h2>
                  <p className="text-xs text-amber-900 font-bold mt-0.5">
                    ঋণ ঝুঁকি জীবন ও দুর্ঘটনা বীমা পলিসি সনদপত্র (Credit Life Insurance)
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    পলিসি নং: <strong>{policyNumber}</strong> • ইস্যুর তারিখ: <strong>{issueDate}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-amber-100/50 rounded-xl border border-amber-200/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                    <div>
                      <span className="text-slate-600 block text-[11px]">বীমাকৃত ঋণগ্রহীতার নাম:</span>
                      <strong className="text-sm text-slate-950">{customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px]">জাতীয় পরিচয়পত্র (NID):</span>
                      <strong className="text-slate-950 font-mono">{customerNid}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px]">মোবাইল নম্বর:</span>
                      <strong className="text-slate-950 font-mono">{customerPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px]">বীমার সুরক্ষা কভারেজ:</span>
                      <strong className="text-amber-950 font-mono text-sm">{formatTaka(insuranceCoverage)}</strong>
                    </div>
                  </div>
                  {showCustomerPhoto && customerPhotoUrl && (
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-20 h-24 border-2 border-amber-800 bg-white p-0.5 rounded shadow-sm relative overflow-hidden">
                        <img src={customerPhotoUrl} alt={customerName} className="w-full h-full object-cover rounded-xs" />
                        <div className="absolute bottom-0 inset-x-0 bg-amber-800/90 text-white text-[7px] font-bold text-center py-0.5">
                          বীমা গ্রাহক
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-950 mt-1 font-serif">সত্যায়িত ছবি</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border border-amber-300 rounded-xl space-y-2 shadow-xs">
                  <p className="font-bold text-amber-950 text-sm border-b border-amber-100 pb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    বীমা পলিসির আওতাভুক্ত সুরক্ষাসমূহ:
                  </p>
                  <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                    {insuranceTerms}
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-end border-t border-amber-800/20">
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p>• আইডিআরএ (IDRA) বাংলাদেশ লাইসেন্সপ্রাপ্ত ও অনুমোদিত।</p>
                    <p>• ঋণ সহযোগী প্ল্যাটফর্ম: {platformTitle}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-amber-950 w-36 mx-auto font-serif italic font-bold text-xs pb-1 text-amber-950">
                      Authorized Officer
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 block mt-0.5">প্রধান বীমা কর্মকর্তা ও সিল</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LOAN SANCTION / APPROVAL LETTER */}
            {docType === "sanction_letter" && (
              <div className="space-y-5 text-xs leading-relaxed">
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-black text-foreground">{platformTitle}</h2>
                  <p className="text-xs text-muted-foreground">ডিজিটাল ঋণ মঞ্জুরি ও অর্থায়ন বিভাগ • প্রধান কার্যালয়, মতিঝিল, ঢাকা</p>
                  <p className="text-[11px] font-mono mt-1 text-slate-600">স্মারক নং: {docNumber} • তারিখ: {issueDate}</p>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1">
                    <p><strong>প্রাপক:</strong> {customerName}</p>
                    <p><strong>মোবাইল নম্বর:</strong> {customerPhone}</p>
                    <p><strong>জাতীয় পরিচয়পত্র:</strong> {customerNid}</p>
                    <p><strong>ঠিকানা:</strong> {customerAddress}</p>
                  </div>
                  {showCustomerPhoto && customerPhotoUrl && (
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-20 h-24 border-2 border-slate-700 bg-white p-0.5 rounded shadow-sm relative overflow-hidden">
                        <img src={customerPhotoUrl} alt={customerName} className="w-full h-full object-cover rounded-xs" />
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-700 text-white text-[7px] font-bold text-center py-0.5">
                          ঋণ গ্রহীতা
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-800 font-bold mt-1">সত্যায়িত ফটো</span>
                    </div>
                  )}
                </div>

                <p className="font-bold text-sm text-foreground underline">
                  বিষয়: ব্যক্তিগত/ব্যবসায়িক ঋণ মঞ্জুরিপত্র (Loan Sanction Letter)।
                </p>

                <p>
                  মহোদয়, আপনার আবেদনের প্রেক্ষিতে জানানো যাচ্ছে যে, {platformTitle} ক্রেডিট কমিটির সুপারিশক্রমে আপনার অনুকূলে <strong>{formatTaka(loanAmount)}</strong> টাকা ঋণ অনুমোদন করা হলো।
                </p>

                <div className="border rounded-lg p-3 bg-slate-50 space-y-1.5 font-mono">
                  <div className="flex justify-between font-sans"><span>মঞ্জুরিকৃত ঋণের পরিমাণ:</span><strong>{formatTaka(loanAmount)}</strong></div>
                  <div className="flex justify-between font-sans"><span>পরিশোধের মেয়াদকাল:</span><strong>{toBengaliNumber(durationMonths)} মাস</strong></div>
                  <div className="flex justify-between font-sans"><span>মাসিক কিস্তি (EMI):</span><strong className="text-emerald-700">{formatTaka(monthlyEMI)}</strong></div>
                  <div className="flex justify-between font-sans"><span>প্রথম কিস্তির তারিখ:</span><strong>{issueDate} হতে ৩০ দিন পর</strong></div>
                </div>

                <p>
                  ঋণের অর্থ আপনার নিবন্ধিত ব্যাংক/মোবাইল ব্যাংকিং হিসাবে ছাড় করা হচ্ছে। কিস্তির অর্থ প্রতি মাসে নির্ধারিত সময়ের মধ্যে পরিশোধ করার জন্য অনুরোধ করা হলো।
                </p>

                <div className="pt-8 flex justify-between items-end">
                  <div className="text-[10px] text-muted-foreground">
                    সিস্টেম জেনারেটেড ডিজিটাল ডকুমেন্ট।
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border border-emerald-600 text-[8px] flex items-center justify-center font-bold text-emerald-800 mx-auto mb-1">
                      SEAL OF APPROVAL
                    </div>
                    <span className="font-bold text-xs block">চিফ ক্রেডিট অফিসার</span>
                    <span className="text-[10px] text-muted-foreground">{platformTitle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. OFFICIAL MONEY RECEIPT */}
            {docType === "money_receipt" && (
              <div className="space-y-4">
                <div
                  className="border-2 border-amber-800/70 rounded-xl p-6 bg-[#fffde8] relative shadow-md overflow-hidden font-sans text-slate-900 select-none print:shadow-none"
                  style={{
                    backgroundImage: "linear-gradient(rgba(245, 158, 11, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.06) 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }}
                >
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-amber-200/60 border-r-2 border-dashed border-amber-700/60 flex items-center justify-center">
                    <span className="text-[8px] text-amber-900 font-mono -rotate-90 whitespace-nowrap opacity-75">
                      ✂ কাউন্টারফয়েল স্টাব
                    </span>
                  </div>

                  <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full border-4 border-red-600/70 -rotate-12 flex flex-col items-center justify-center p-2 text-center pointer-events-none opacity-80">
                    <div className="w-full h-full rounded-full border border-dashed border-red-600/60 flex flex-col items-center justify-center text-red-700 font-bold">
                      <span className="text-[9px] font-black uppercase tracking-wider">{platformTitle}</span>
                      <span className="text-[11px] font-extrabold my-0.5">গৃহীত ও অনুমোদিত</span>
                      <span className="text-[8px] font-mono tracking-tighter">VERIFIED & RECEIVED</span>
                      <span className="text-[8px] font-mono mt-0.5">{issueDate}</span>
                    </div>
                  </div>

                  <div className="pl-4">
                    <div className="flex justify-between items-start border-b-2 border-amber-800/40 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-800 text-amber-50 font-bold text-[10px]">অফিসিয়াল কপি</span>
                          <h2 className="text-lg font-black text-amber-950 font-serif tracking-tight">
                            {platformTitle} ফিন্যান্স অ্যান্ড মাইক্রো লোন
                          </h2>
                        </div>
                        <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                          ডিজিটাল ক্যাশ ও অনলাইন জমা প্রাপ্তিস্বীকার পত্র (Money Receipt Voucher)
                        </p>
                        <p className="text-[10px] text-slate-600">রেজিস্ট্রেশন নং: ডিএইচ-৯৮২৪০১ • প্রধান কার্যালয়: ঢাকা</p>
                      </div>

                      <div className="text-right">
                        <div className="border border-red-500 bg-red-50 text-red-800 px-2.5 py-1 font-mono font-bold text-xs rounded shadow-sm inline-block">
                          রসিদ নং: {docNumber}
                        </div>
                        <p className="text-[11px] font-mono font-bold text-slate-800 mt-1">তারিখ: {issueDate}</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                          <div>
                            <span className="text-slate-600 text-[11px]">গ্রাহকের নাম:</span>
                            <p className="font-bold text-sm text-slate-900">{customerName}</p>
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px]">মোবাইল নম্বর:</span>
                            <p className="font-bold font-mono text-slate-900">{customerPhone}</p>
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px]">জাতীয় পরিচয়পত্র (NID):</span>
                            <p className="font-mono text-slate-900">{customerNid}</p>
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px]">গ্রাহকের ঠিকানা:</span>
                            <p className="text-slate-900">{customerAddress}</p>
                          </div>
                        </div>
                        {showCustomerPhoto && customerPhotoUrl && (
                          <div className="shrink-0 flex flex-col items-center">
                            <div className="w-20 h-24 border-2 border-amber-800 p-0.5 bg-white rounded shadow-sm relative overflow-hidden">
                              <img src={customerPhotoUrl} alt={customerName} className="w-full h-full object-cover rounded-xs" />
                              <div className="absolute -bottom-1 -left-1 w-9 h-9 rounded-full border border-red-600 bg-red-100/80 text-red-700 flex flex-col items-center justify-center text-[5px] font-black rotate-[-12deg] pointer-events-none">
                                <span>সত্যায়িত</span>
                                <span className="text-[4px]">PAID</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-amber-950 mt-1 font-serif">গ্রাহকের ছবি</span>
                          </div>
                        )}
                      </div>

                      <div className="border border-amber-800/30 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-amber-800/10 border-b border-amber-800/20 font-bold text-amber-950">
                            <tr>
                              <th className="p-2">ক্রমিক</th>
                              <th className="p-2">প্রাপ্তির বিবরণ ও খাত</th>
                              <th className="p-2 text-right">টাকার পরিমাণ (টাকা)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-800/10">
                            <tr>
                              <td className="p-2 font-mono">০১.</td>
                              <td className="p-2 font-medium">লোন প্রসেসিং, সিকিউরিটি আমানত ও বীমা প্রিমিয়াম ক্লিয়ারেন্স জমা</td>
                              <td className="p-2 text-right font-mono font-bold">{formatTaka(loanAmount)}</td>
                            </tr>
                          </tbody>
                          <tfoot className="bg-amber-100/70 font-black border-t-2 border-amber-800/30">
                            <tr>
                              <td colSpan={2} className="p-2 text-right">মোট প্রাপ্তি (সর্বমোট):</td>
                              <td className="p-2 text-right font-mono text-sm text-amber-950">{formatTaka(loanAmount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px]">
                        <strong>কথায়:</strong>{" "}
                        <span className="italic">
                          {loanAmount >= 100000 ? `${(loanAmount / 100000).toFixed(0)} লক্ষ টাকা মাত্র` : `${loanAmount.toLocaleString("en-US")} টাকা মাত্র`} (Taka {loanAmount.toLocaleString("en-US")} Only)
                        </span>
                      </div>

                      <div className="pt-6 flex justify-between items-end relative z-10">
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <p>• এই রসিদটি ডিজিটাল হিসাবভুক্ত এবং কম্পিউটার প্রস্তুতকৃত।</p>
                          <p>• কোনো ধরনের কাটাকাটি বা ঘষামাজা গ্রহণযোগ্য হবে না।</p>
                        </div>

                        <div className="flex gap-8 text-center">
                          <div>
                            <div className="border-b border-slate-700 w-28 mx-auto h-8 flex items-end justify-center text-[10px] italic">
                              গ্রাহকের স্বাক্ষর
                            </div>
                            <span className="text-[9px] text-slate-600 font-bold">আমানতকারী</span>
                          </div>
                          <div>
                            <div className="border-b-2 border-amber-900 w-32 mx-auto h-8 flex items-end justify-center font-serif text-xs font-bold text-amber-950">
                              Authorized Cashier
                            </div>
                            <span className="text-[10px] text-amber-900 font-black">হিসাবরক্ষক / ক্যাশিয়ার</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      {/* 2. Full High-Res Document Image Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl p-4 sm:p-6 max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>ডকুমেন্টের ছবি প্রিভিউ ও কপি</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              নিচের ছবিটি সরাসরি রাইট-ক্লিক করে 'Copy image' করতে পারেন অথবা বাটন চেপে ক্লিপবোর্ডে কপি বা ডাউনলোড করুন।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {previewImageUrl ? (
              <div className="border rounded-xl p-2 bg-slate-100 flex justify-center overflow-hidden">
                <img
                  src={previewImageUrl}
                  alt="Official Document"
                  className="max-h-[60vh] w-auto object-contain rounded shadow-md border cursor-pointer hover:opacity-95"
                  onClick={handleCopyImage}
                  title="ক্লিক করে কপি করুন অথবা রাইট-ক্লিক করে Copy image নির্বাচন করুন"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs mt-2">ছবি প্রস্তুত করা হচ্ছে...</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
              <p className="text-[11px] text-muted-foreground">
                💡 মাউসের রাইট-ক্লিক করে সরাসরি <strong>"Copy image"</strong> সিলেক্ট করতে পারেন।
              </p>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyImage}
                  className="text-xs font-bold gap-1.5 border-blue-400 text-blue-700 hover:bg-blue-50 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>ক্লিপবোর্ডে কপি</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadImage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ছবি ডাউনলোড (PNG)</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
