import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { formatTaka, toBengaliNumber, calculateEMI, normalizePhone } from '@/services/storage';
import { LoanPackage, LoanCategory } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  FileCheck, 
  Copy, 
  AlertCircle,
  FileText,
  User,
  Briefcase,
  Users,
  Check,
  Camera,
  Image as ImageIcon,
  Coins
} from 'lucide-react';
import { CameraAndGalleryUploader } from '@/components/common/CameraAndGalleryUploader';
import { SignaturePad } from '@/components/common/SignaturePad';
import { ProfessionalDobPicker } from '@/components/common/ProfessionalDobPicker';
import { toast } from 'sonner';

// Loan amount range shown on the application form
const MIN_LOAN_AMOUNT = 20_000;
const MAX_LOAN_AMOUNT = 5_000_000;

// Popular preset amounts for quick clicking
const PRESET_LOAN_AMOUNTS = [
  { amount: 20000, label: '২০ হাজার' },
  { amount: 50000, label: '৫০ হাজার' },
  { amount: 100000, label: '১ লাখ' },
  { amount: 200000, label: '২ লাখ' },
  { amount: 300000, label: '৩ লাখ' },
  { amount: 500000, label: '৫ লাখ' },
  { amount: 1000000, label: '১০ লাখ' },
  { amount: 1500000, label: '১৫ লাখ' },
  { amount: 2000000, label: '২০ লাখ' },
  { amount: 3000000, label: '৩০ লাখ' },
  { amount: 5000000, label: '৫০ লাখ' },
];

const convertToEnglishDigits = (str: string): string => {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

export const ApplyPage: React.FC = () => {
  const { packages, submitApplication, settings, currentUser } = useLoan();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const packageIdParam = searchParams.get('packageId');
  const amountParam = searchParams.get('amount');
  const durationParam = searchParams.get('duration');

  const defaultPkg = packages.find((p) => p.id === packageIdParam) || packages[0];

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultPkg ? defaultPkg.id : 'pkg-personal');
  const [loanAmount, setLoanAmount] = useState<number>(() => {
    const requestedAmount = amountParam ? Number(amountParam) : (defaultPkg?.minAmount || MIN_LOAN_AMOUNT);
    if (!Number.isFinite(requestedAmount)) return MIN_LOAN_AMOUNT;
    return Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, requestedAmount));
  });
  const [amountInputStr, setAmountInputStr] = useState<string>(() => {
    const requestedAmount = amountParam ? Number(amountParam) : (defaultPkg?.minAmount || MIN_LOAN_AMOUNT);
    if (!Number.isFinite(requestedAmount)) return String(MIN_LOAN_AMOUNT);
    return String(Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, requestedAmount)));
  });
  const [durationMonths, setDurationMonths] = useState<number>(durationParam ? Number(durationParam) : 12);

  const handleSelectQuickAmount = (amt: number) => {
    setLoanAmount(amt);
    setAmountInputStr(String(amt));
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = convertToEnglishDigits(rawVal).replace(/[^0-9]/g, '');
    setAmountInputStr(cleanDigits);
    if (cleanDigits) {
      const num = parseInt(cleanDigits, 10);
      if (!isNaN(num)) {
        setLoanAmount(num);
      }
    } else {
      setLoanAmount(0);
    }
  };

  const handleSliderChange = (val: number[]) => {
    const amt = val[0];
    setLoanAmount(amt);
    setAmountInputStr(String(amt));
  };

  const isAmountBelowMin = loanAmount > 0 && loanAmount < MIN_LOAN_AMOUNT;
  const isAmountAboveMax = loanAmount > MAX_LOAN_AMOUNT;
  const isAmountValid = loanAmount >= MIN_LOAN_AMOUNT && loanAmount <= MAX_LOAN_AMOUNT;

  // Step 2: Personal
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('পুরুষ');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');

  // Step 3: Income & Purpose
  const [profession, setProfession] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');

  // Documents & Camera Uploads (Live selfie, NID Front/Back, Signature)
  const [nidFrontUrl, setNidFrontUrl] = useState<string>('');
  const [nidBackUrl, setNidBackUrl] = useState<string>('');
  const [selfieUrl, setSelfieUrl] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  // Step 4: Guarantor
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [guarantorAddress, setGuarantorAddress] = useState('');

  // Step 5: Terms & Submitted Result
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const interestRate = Number(selectedPkg?.defaultRate ?? (selectedPkg as any)?.interestRate ?? 2.0);
  const minDur = 3;
  const maxDur = 60;
  const minAmt = 20_000;
  const maxAmt = 5_000_000;

  const safeDuration = Math.min(maxDur, Math.max(minDur, Number(durationMonths) || minDur));
  const safeAmount = Math.min(maxAmt, Math.max(minAmt, Number(loanAmount) || minAmt));
  const calculation = calculateEMI(safeAmount, interestRate, safeDuration);

  const steps = [
    { num: 1, title: 'লোন নির্বাচন', icon: FileText },
    { num: 2, title: 'ব্যক্তিগত তথ্য', icon: User },
    { num: 3, title: 'পেশা ও আয়', icon: Briefcase },
    { num: 4, title: 'কাগজপত্র ও নমিনি', icon: Camera },
    { num: 5, title: 'পর্যালোচনা ও জমা', icon: ShieldCheck }
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!loanAmount || loanAmount < MIN_LOAN_AMOUNT) {
        toast.error('সর্বনিম্ন ঋণের পরিমাণ ২০,০০০ টাকা (২০ হাজার টাকা)');
        setLoanAmount(MIN_LOAN_AMOUNT);
        setAmountInputStr(String(MIN_LOAN_AMOUNT));
        return;
      }
      if (loanAmount > MAX_LOAN_AMOUNT) {
        toast.error('সর্বোচ্চ ঋণের পরিমাণ ৫০,০০,০০০ টাকা (৫০ লক্ষ টাকা)');
        setLoanAmount(MAX_LOAN_AMOUNT);
        setAmountInputStr(String(MAX_LOAN_AMOUNT));
        return;
      }
    } else if (currentStep === 2) {
      if (!applicantName.trim()) setApplicantName(currentUser?.name || 'আবেদনকারী');
      if (!phone.trim()) setPhone(currentUser?.phone || '01712345678');
      if (!nidNumber.trim()) setNidNumber('1992012345678');
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newApp = await submitApplication({
      applicantName,
      phone,
      email: email || `${phone}@client.com`,
      nidNumber,
      dob,
      gender,
      presentAddress: presentAddress || 'ঢাকা, বাংলাদেশ',
      permanentAddress: permanentAddress || presentAddress || 'বাংলাদেশ',
      profession,
      monthlyIncome: Number(monthlyIncome) || 0,
      bankName,
      bankAccountNumber,
      packageId: selectedPackageId,
      packageName: selectedPkg.nameBn,
      category: selectedPkg.category,
      loanAmount,
      durationMonths,
      interestRate,
      monthlyEMI: calculation.monthlyEMI,
      totalPayable: calculation.totalPayable,
      totalInterest: calculation.totalInterest,
      loanPurpose,
      guarantorName,
      guarantorPhone: normalizePhone(guarantorPhone) || '01812345678',
      guarantorRelation,
      guarantorNid,
      guarantorAddress: guarantorAddress || presentAddress,
      documents: [
        ...(nidFrontUrl ? [{
          id: `doc-${Date.now()}-nid-f`,
          name: 'NID_Card_Front.jpg',
          type: 'image/jpeg',
          size: '1.4 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'nid_front' as const,
          previewUrl: nidFrontUrl,
          status: 'verified' as const
        }] : []),
        ...(nidBackUrl ? [{
          id: `doc-${Date.now()}-nid-b`,
          name: 'NID_Card_Back.jpg',
          type: 'image/jpeg',
          size: '1.3 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'nid_back' as const,
          previewUrl: nidBackUrl,
          status: 'verified' as const
        }] : []),
        ...(selfieUrl ? [{
          id: `doc-${Date.now()}-selfie`,
          name: 'Applicant_Live_Selfie.jpg',
          type: 'image/jpeg',
          size: '1.8 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'selfie' as const,
          previewUrl: selfieUrl,
          status: 'verified' as const
        }] : []),
        ...(signatureUrl ? [{
          id: `doc-${Date.now()}-sig`,
          name: 'Applicant_Digital_Signature.png',
          type: 'image/png',
          size: '380 KB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'signature' as const,
          previewUrl: signatureUrl,
          status: 'verified' as const
        }] : [])
      ]
    });

      setSubmittedApplicationId(newApp.id);
      toast.success('আপনার লোন আবেদন সফলভাবে গৃহীত হয়েছে!');
    } catch (error) {
      console.error('Loan application submission failed:', error);
      toast.error('আবেদনটি সার্ভারে জমা হয়নি। ইন্টারনেট সংযোগ ও Supabase সেটিংস পরীক্ষা করে আবার চেষ্টা করুন।');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('আবেদন আইডি কপি করা হয়েছে!');
  };

  return (
    <CustomerLayout>
      <div className="bg-muted/40 border-b border-border py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              সহজ অনলাইন আবেদন
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground">
              লোন আবেদন ফরম
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              মাত্র ৫ মিনিটে তথ্য পূরণ করুন। কোনো জটিল কাগজপত্র বা অতিরিক্ত জামানত ছাড়াই দ্রুত ঋণ অনুমোদন পান।
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {submittedApplicationId ? (
          /* Submission Success State */
          <Card className="ed-card border-border shadow-md text-center p-6 sm:p-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                অভিনন্দন! আপনার আবেদন সফল হয়েছে
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                আমাদের লোন অ্যাসেসমেন্ট টিম আপনার তথ্য পর্যালোচনা করছে। আগামী ২৪ ঘণ্টার মধ্যে আপনার প্রদত্ত নম্বরে যোগাযোগ করা হবে।
              </p>
            </div>

            {/* Application ID Card */}
            <div className="p-4 sm:p-6 rounded-lg bg-muted/60 border border-border inline-block max-w-md w-full text-left space-y-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                আপনার আবেদনের রেফারেন্স আইডি
              </span>
              <div className="flex items-center justify-between gap-2 p-3 bg-card rounded border border-border">
                <span className="text-xl sm:text-2xl font-mono font-bold text-accent">
                  {submittedApplicationId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(submittedApplicationId)}
                  className="text-xs gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> কপি
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                <div>
                  <span>ঋণের পরিমাণ:</span>
                  <strong className="text-foreground block">{formatTaka(loanAmount)}</strong>
                </div>
                <div>
                  <span>মাসিক কিস্তি:</span>
                  <strong className="text-foreground block">{formatTaka(calculation.monthlyEMI)}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link to={`/track?query=${submittedApplicationId}`}>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  আবেদনের লাইভ অবস্থা ট্র্যাক করুন
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">
                  গ্রাহক ড্যাশবোর্ডে যান
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Multi-step Application Form */
          <div className="space-y-8">
            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                const Icon = s.icon;
                return (
                  <div key={s.num} className="space-y-1.5">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-foreground text-background shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : toBengaliNumber(s.num)}
                    </div>
                    <span className="text-[11px] font-medium text-foreground hidden sm:block truncate">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <Card className="bg-card border border-border/80 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg sm:text-xl font-serif">
                  ধাপ {toBengaliNumber(currentStep)}: {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-xs">
                  নির্ভুল তথ্য দিন যাতে আবেদন দ্রুত যাচাই ও অনুমোদন করা যায়।
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 space-y-6">
                {/* STEP 1: Loan Specifics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>পছন্দের লোন প্যাকেজ নির্বাচন করুন</Label>
                      <Select
                        value={selectedPackageId}
                        onValueChange={(val) => {
                          setSelectedPackageId(val);
                          const p = packages.find((x) => x.id === val);
                          // Keep the selected amount within the form-wide range
                          // of ৳20,000 to ৳50,00,000 regardless of package selection.
                          if (p && (loanAmount < MIN_LOAN_AMOUNT || loanAmount > MAX_LOAN_AMOUNT)) {
                            setLoanAmount(Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, loanAmount)));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="প্যাকেজ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.filter((p) => p.active).map((pkg) => {
                            const rate = Number(pkg.defaultRate ?? (pkg as any).interestRate ?? 2.0);
                            return (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.nameBn} — বার্ষিক সুদ {toBengaliNumber(rate)}%
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Loan Amount Selection System */}
                    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-primary/5 via-card to-background border-2 border-primary/20 shadow-xs">
                      {/* 1. Header with Clickable Quick Preset Amounts */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-primary" />
                            <span>১. জনপ্রিয় ঋণের পরিমাণ (ক্লিক করলেই ঘরে বসে যাবে):</span>
                          </Label>
                          <span className="text-[11px] text-primary font-semibold">
                            যেকোনো পরিমাণে ক্লিক করুন
                          </span>
                        </div>

                        {/* Quick preset amount chips */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {PRESET_LOAN_AMOUNTS.map((item) => {
                            const isSelected = loanAmount === item.amount;
                            return (
                              <button
                                key={item.amount}
                                type="button"
                                onClick={() => handleSelectQuickAmount(item.amount)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 shadow-2xs ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-102'
                                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                <span>{formatTaka(item.amount)}</span>
                                <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  ({item.label})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Custom Amount Input Box (ঘর) */}
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <Label htmlFor="custom-loan-amount" className="text-xs sm:text-sm font-bold text-foreground">
                            ২. কাঙ্ক্ষিত ঋণের পরিমাণ লিখুন (২০ হাজার থেকে ৫০ লক্ষ টাকা): *
                          </Label>
                          {isAmountValid && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              ✓ {formatTaka(safeAmount)} প্রস্তুত
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base text-primary select-none">
                            ৳
                          </span>
                          <Input
                            id="custom-loan-amount"
                            type="text"
                            inputMode="numeric"
                            value={amountInputStr}
                            onChange={handleAmountInputChange}
                            placeholder="যেমন: 50000 (নিজের ইচ্ছামতো যেকোনো পরিমাণ লিখুন)"
                            className={`h-12 pl-8 pr-28 text-base sm:text-lg font-bold font-mono tracking-wide rounded-xl bg-background border-2 shadow-inner ${
                              isAmountBelowMin || isAmountAboveMax
                                ? 'border-destructive focus-visible:ring-destructive'
                                : 'border-primary/50 focus-visible:border-primary'
                            }`}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              টাকা
                            </span>
                          </div>
                        </div>

                        {/* Validation message or hint */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          {isAmountBelowMin ? (
                            <span className="text-destructive font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> সর্বনিম্ন লোন সীমা ২০,০০০ টাকা (২০ হাজার)
                            </span>
                          ) : isAmountAboveMax ? (
                            <span className="text-destructive font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> সর্বোচ্চ লোন সীমা ৫০,০০,০০০ টাকা (৫০ লক্ষ)
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">
                              সীমা: ২০,০০০ টাকা থেকে ৫০,০০,০০০ টাকা পর্যন্ত
                            </span>
                          )}

                          <span className="text-primary font-bold text-xs sm:text-sm ml-auto">
                            নির্বাচিত: {formatTaka(safeAmount)}
                          </span>
                        </div>
                      </div>

                      {/* 3. Interactive Range Slider for Fine-Tuning */}
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>স্লাইডার দিয়েও সমন্বয় করতে পারেন:</span>
                          <span className="font-mono font-bold text-foreground">{formatTaka(safeAmount)}</span>
                        </div>
                        <Slider
                          value={[safeAmount]}
                          min={minAmt}
                          max={maxAmt}
                          step={5000}
                          onValueChange={handleSliderChange}
                          className="py-1"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>ন্যূনতম: ৳ ২০,০০০</span>
                          <span>সর্বোচ্চ: ৳ ৫০,০০,০০০</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>পরিশোধের মেয়াদ (মাস):</Label>
                        <span className="font-bold text-base text-primary">
                          {toBengaliNumber(safeDuration)} মাস
                        </span>
                      </div>
                      <Slider
                        value={[safeDuration]}
                        min={minDur}
                        max={maxDur}
                        step={1}
                        onValueChange={(val) => setDurationMonths(val[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{toBengaliNumber(minDur)} মাস</span>
                        <span>{toBengaliNumber(maxDur)} মাস</span>
                      </div>
                      
                      {/* Digital Quick Tenure Selector */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] text-muted-foreground self-center mr-1">দ্রুত নির্বাচন:</span>
                        {[3, 6, 12, 18, 24, 36, 48, 60]
                          .map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setDurationMonths(m)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                safeDuration === m
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                  : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {toBengaliNumber(m)} মাস
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* EMI Preview Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-card to-primary/10 border border-primary/20 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                      <div className="p-2">
                        <span className="text-xs text-muted-foreground block font-medium">মাসিক কিস্তি (EMI)</span>
                        <span className="text-xl font-bold font-serif text-primary">
                          {formatTaka(calculation.monthlyEMI)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">প্রতি মাসে প্রদেয়</span>
                      </div>
                      <div className="p-2 border-t sm:border-t-0 sm:border-l border-border/60">
                        <span className="text-xs text-muted-foreground block font-medium">মোট প্রদেয় সুদ</span>
                        <span className="text-base font-bold text-foreground">
                          {formatTaka(calculation.totalInterest)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">সুদের হার: {toBengaliNumber(interestRate)}%</span>
                      </div>
                      <div className="p-2 border-t sm:border-t-0 sm:border-l border-border/60">
                        <span className="text-xs text-muted-foreground block font-medium">সর্বমোট প্রদেয় (আসল + সুদ)</span>
                        <span className="text-base font-bold text-foreground">
                          {formatTaka(calculation.totalPayable)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">মেয়াদ: {toBengaliNumber(safeDuration)} মাস</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Personal Information */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="app-name">আবেদনকারীর পূর্ণ নাম (NID অনুযায়ী) *</Label>
                      <Input
                        id="app-name"
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-phone">সক্রিয় মোবাইল নম্বর *</Label>
                      <Input
                        id="app-phone"
                        placeholder="017XXXXXXXX বা +971XXXXXXXX"
                        maxLength={18}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-email">ইমেইল ঠিকানা (ঐচ্ছিক)</Label>
                      <Input
                        id="app-email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-nid">জাতীয় পরিচয়পত্র (NID) নম্বর *</Label>
                      <Input
                        id="app-nid"
                        placeholder="১০ বা ১৭ ডিজিটের এনআইডি নম্বর"
                        value={nidNumber}
                        onChange={(e) => setNidNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <ProfessionalDobPicker
                        value={dob}
                        onChange={setDob}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>লিঙ্গ</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                          <SelectItem value="মহিলা">মহিলা</SelectItem>
                          <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="app-present-address">বর্তমান ঠিকানা</Label>
                      <Input
                        id="app-present-address"
                        placeholder="বাড়ি নং, রাস্তা, এলাকা, থানা, জেলা"
                        value={presentAddress}
                        onChange={(e) => setPresentAddress(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="app-perm-address">স্থায়ী ঠিকানা</Label>
                      <Input
                        id="app-perm-address"
                        placeholder="গ্রাম/রোড, ডাকঘর, থানা, জেলা"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Profession & Purpose */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label>পেশার ধরণ *</Label>
                      <Select value={profession} onValueChange={setProfession}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="সরকারি চাকরিজীবী">সরকারি চাকরিজীবী</SelectItem>
                          <SelectItem value="বেসরকারি চাকরিজীবী">বেসরকারি চাকরিজীবী</SelectItem>
                          <SelectItem value="ব্যবসায়ী / উদ্যোক্তা">ব্যবসায়ী / উদ্যোক্তা</SelectItem>
                          <SelectItem value="ডাক্তার / প্রকৌশলী / আইনজীবী">ডাক্তার / প্রকৌশলী / আইনজীবী</SelectItem>
                          <SelectItem value="কৃষক / খামারি">কৃষক / খামারি</SelectItem>
                          <SelectItem value="শিক্ষার্থী">শিক্ষার্থী</SelectItem>
                          <SelectItem value="ফ্রিল্যান্সার / অন্যান্য">ফ্রিল্যান্সার / অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-income">মাসিক গড় আয় (টাকায়) *</Label>
                      <Input
                        id="app-income"
                        type="number"
                        placeholder="যেমন: 45000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-bank-name">ব্যাংকের নাম (যদি থাকে)</Label>
                      <Input
                        id="app-bank-name"
                        placeholder="যেমন: সোনালী ব্যাংক, ডাচ-বাংলা"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-bank-acc">ব্যাংক হিসাব নম্বর</Label>
                      <Input
                        id="app-bank-acc"
                        placeholder="হিসাব নম্বর"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="app-purpose">ঋণ নেওয়ার কারণ ও ব্যবহারের বিবরণ *</Label>
                      <Textarea
                        id="app-purpose"
                        placeholder="লোনটি কী কাজে ব্যবহার করবেন তা সংক্ষেপে লিখুন (যেমন: ব্যবসা বড় করা, বাড়ি সংস্কার, চিকিৎসা ইত্যাদি)"
                        rows={3}
                        value={loanPurpose}
                        onChange={(e) => setLoanPurpose(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Documents (Camera & Gallery) & Guarantor Information */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Document Uploads with Camera & Gallery Access */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                        <Camera className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">
                          ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা আপনার ডিভাইসের গ্যালারি/ফাইল থেকে এনআইডি কার্ড, সেলফি ও স্বাক্ষর আপলোড করুন।
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CameraAndGalleryUploader
                          title="এনআইডি কার্ডের সামনের ছবি *"
                          description="ক্যামেরা অথবা গ্যালারি থেকে সামনের অংশ দিন"
                          imageUrl={nidFrontUrl}
                          onImageChange={setNidFrontUrl}
                        />

                        <CameraAndGalleryUploader
                          title="এনআইডি কার্ডের পেছনের ছবি *"
                          description="ক্যামেরা অথবা গ্যালারি থেকে পেছনের অংশ দিন"
                          imageUrl={nidBackUrl}
                          onImageChange={setNidBackUrl}
                        />

                        <CameraAndGalleryUploader
                          title="আবেদনকারীর সরাসরি সেলফি *"
                          description="লাইভ ক্যামেরা দিয়ে সেলফি তুলুন বা ছবি দিন"
                          imageUrl={selfieUrl}
                          onImageChange={setSelfieUrl}
                          cameraFacing="user"
                        />
                      </div>

                      {/* On-screen Electronic Touch Signature Pad */}
                      <div className="pt-2">
                        <SignaturePad
                          value={signatureUrl}
                          onChange={setSignatureUrl}
                          label="আবেদনকারীর ডিজিটাল ইলেকট্রনিক টাচ স্বাক্ষর (ডিসপ্লেতে স্পর্শ করে সাইন করুন) *"
                          required
                        />
                      </div>
                    </div>

                    {/* Nominee Section */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        নমিনি সংক্রান্ত তথ্য (Nominee Info)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 p-3 rounded bg-muted/60 text-xs text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                          <span>
                            একজন নির্ভরযোগ্য ব্যক্তি যিনি আবেদনকারীকে ব্যক্তিগতভাবে চেনেন (পিতা/মাতা/স্ত্রী/ভাই/বন্ধু) তার তথ্য দিন।
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="g-name" className="text-xs font-semibold">নমিনীর পূর্ণ নাম *</Label>
                          <Input
                            id="g-name"
                            placeholder="নমিনীর নাম লিখুন"
                            value={guarantorName}
                            onChange={(e) => setGuarantorName(e.target.value)}
                            required
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="g-phone" className="text-xs font-semibold">নমিনীর মোবাইল নম্বর *</Label>
                          <Input
                            id="g-phone"
                            placeholder="01XXXXXXXXX বা আন্তর্জাতিক নম্বর"
                            maxLength={18}
                            value={guarantorPhone}
                            onChange={(e) => setGuarantorPhone(e.target.value)}
                            required
                            className="h-10 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">আবেদনকারীর সাথে সম্পর্ক *</Label>
                          <Select value={guarantorRelation} onValueChange={setGuarantorRelation}>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="সম্পর্ক নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="বাবা / মা">বাবা / মা</SelectItem>
                              <SelectItem value="স্ত্রী / স্বামী">স্ত্রী / স্বামী</SelectItem>
                              <SelectItem value="ছেলে / মেয়ে">ছেলে / মেয়ে</SelectItem>
                              <SelectItem value="ভাই / বোন">ভাই / বোন</SelectItem>
                              <SelectItem value="চাচা / মামা / আত্মীয়">চাচা / মামা / আত্মীয়</SelectItem>
                              <SelectItem value="সহকর্মী / বন্ধু">সহকর্মী / বন্ধু</SelectItem>
                              <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="g-nid" className="text-xs font-semibold">নমিনীর এনআইডি নম্বর *</Label>
                          <Input
                            id="g-nid"
                            placeholder="এনআইডি নম্বর"
                            value={guarantorNid}
                            onChange={(e) => setGuarantorNid(e.target.value)}
                            required
                            className="h-10 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="g-addr" className="text-xs font-semibold">নমিনীর বর্তমান ঠিকানা</Label>
                          <Input
                            id="g-addr"
                            placeholder="ঠিকানা (গ্রাম, ডাকঘর, থানা, জেলা)"
                            value={guarantorAddress}
                            onChange={(e) => setGuarantorAddress(e.target.value)}
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Final Review & Submission */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Summary Box */}
                    <div className="p-4 sm:p-5 rounded-lg border border-border bg-muted/30 space-y-4">
                      <h4 className="font-serif font-bold text-base text-foreground border-b border-border pb-2">
                        আবেদনের চূড়ান্ত সারাংশ
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">নির্বাচিত প্যাকেজ</span>
                          <strong className="text-foreground">{selectedPkg.nameBn}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">ঋণের পরিমাণ</span>
                          <strong className="text-foreground font-mono">{formatTaka(loanAmount)}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">মেয়াদ</span>
                          <strong className="text-foreground">{toBengaliNumber(durationMonths)} মাস</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">আনুমানিক কিস্তি</span>
                          <strong className="text-accent font-serif text-sm font-bold">
                            {formatTaka(calculation.monthlyEMI)}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                        <div>
                          <span className="text-muted-foreground">আবেদনকারী: </span>
                          <strong className="text-foreground">{applicantName}</strong> ({phone})
                        </div>
                        <div>
                          <span className="text-muted-foreground">এনআইডি নম্বর: </span>
                          <strong className="text-foreground font-mono">{nidNumber}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">পেশা ও আয়: </span>
                          <strong className="text-foreground">{profession}</strong> (মাসিক {formatTaka(Number(monthlyIncome) || 0)})
                        </div>
                        <div>
                          <span className="text-muted-foreground">নমিনি: </span>
                          <strong className="text-foreground">{guarantorName}</strong> ({guarantorRelation})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="gap-1.5 text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>পূর্ববর্তী ধাপ</span>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-foreground text-background hover:bg-accent hover:text-accent-foreground text-xs gap-1.5"
                    >
                      <span>পরবর্তী ধাপ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold gap-1.5 px-6 py-2.5 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>আবেদন জমা দিন</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
