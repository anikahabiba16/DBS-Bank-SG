import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  PiggyBank, 
  Percent, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  Upload, 
  Wallet,
  PhoneCall,
  Calendar,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { FixedDepositScheme } from '@/types/loan';
import { toast } from 'sonner';

// Smart Image Compressor to prevent mobile quota limit overflows
const compressImage = (file: File, maxWidth = 1000, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
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

export const FixedDepositPage: React.FC = () => {
  const { 
    currentUser, 
    fixedDepositSchemes, 
    customerFixedDeposits, 
    createCustomerFixedDeposit,
    paymentMethods,
    customerSupport,
    settings 
  } = useLoan();

  // Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    fixedDepositSchemes[0]?.id || 'fds-1m'
  );

  // Deposit modal state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [chosenScheme, setChosenScheme] = useState<FixedDepositScheme | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('bKash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [slipUrl, setSlipUrl] = useState<string>('');
  const [slipDataUrl, setSlipDataUrl] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Early Cashout modal state
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);

  // Filter schemes
  const activeSchemes = fixedDepositSchemes.filter((s) => s.active);

  // Current selected scheme for calculator
  const calcScheme = activeSchemes.find((s) => s.id === selectedSchemeId) || activeSchemes[0] || {
    id: 'default',
    titleBn: '১ মাস মেয়াদী স্কিম',
    durationMonths: 1,
    monthlyProfitPercent: 10
  };

  const monthlyProfit = Math.round((calcAmount * (calcScheme.monthlyProfitPercent || 10)) / 100);
  const totalProfitOverDuration = monthlyProfit * (calcScheme.durationMonths || 1);
  const totalMaturityReturn = calcAmount + totalProfitOverDuration;

  const handleOpenDeposit = (scheme: FixedDepositScheme) => {
    if (!currentUser) {
      toast.error('ডিপোজিট করতে অনুগ্রহ করে প্রথমে লগইন করুন');
      return;
    }
    setChosenScheme(scheme);
    setDepositAmount(scheme.minAmount || 1000);
    setDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!chosenScheme) return;

    if (depositAmount < chosenScheme.minAmount) {
      toast.error(`সর্বনিম্ন জমার পরিমাণ ${formatTaka(chosenScheme.minAmount)}`);
      return;
    }
    if (depositAmount > chosenScheme.maxAmount) {
      toast.error(`সর্বোচ্চ জমার পরিমাণ ${formatTaka(chosenScheme.maxAmount)}`);
      return;
    }
    if (!transactionId.trim()) {
      toast.error('অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) দিন');
      return;
    }

    setSubmitting(true);
    try {
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + chosenScheme.durationMonths);

      const monthlyProfitAmount = Math.round((depositAmount * chosenScheme.monthlyProfitPercent) / 100);
      const totalMaturityAmount = depositAmount + (monthlyProfitAmount * chosenScheme.durationMonths);

      createCustomerFixedDeposit({
        userId: currentUser.id,
        customerName: currentUser.name,
        phone: currentUser.phone,
        schemeId: chosenScheme.id,
        schemeTitleBn: `${chosenScheme.titleBn} (${chosenScheme.monthlyProfitPercent}%)`,
        depositAmount,
        profitPercent: chosenScheme.monthlyProfitPercent,
        dailyProfitPercent: 1.0,
        dailyProfitAmount: Math.round((depositAmount * 1.0) / 100),
        durationMonths: chosenScheme.durationMonths,
        monthlyProfitAmount,
        totalMaturityAmount,
        totalProfitEarned: 0,
        startDate: startDate.toISOString().split('T')[0],
        maturityDate: maturityDate.toISOString().split('T')[0],
        status: 'pending', // Starts as pending for admin verification
        paymentMethod: selectedPaymentMethod,
        transactionId: transactionId.trim(),
        slipUrl: slipDataUrl || slipUrl || undefined
      });

      toast.success('ফিক্সড ডিপোজিট আবেদন ও পেমেন্ট স্লিপ সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেলে রিয়েল-টাইমে পাঠানো হয়েছে।');
      setDepositModalOpen(false);
      setTransactionId('');
      setSlipUrl('');
      setSlipDataUrl('');
      setSlipFileName('');
    } catch (err: any) {
      console.error('Fixed deposit submission error:', err);
      toast.error('ডিপোজিট জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    toast.success('অ্যাকাউন্ট নম্বর কপি করা হয়েছে');
  };

  const currentMethodConfig = paymentMethods.find((m) => m.name.toLowerCase() === selectedPaymentMethod.toLowerCase()) || paymentMethods[0];

  // User's own deposits
  const myDeposits = customerFixedDeposits.filter(
    (d) => currentUser && (d.userId === currentUser.id || d.phone === currentUser.phone)
  );

  return (
    <CustomerLayout>
      <div className="bg-gradient-to-b from-primary/10 via-background to-background py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 font-bold px-3 py-1 mb-3">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              নিশ্চিত মাসিক কমিশন ও সঞ্চয় বৃদ্ধি
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {settings.platformName || 'সহজ লোন'} ফিক্সড ডিপোজিট (DPS) স্কিম
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
              আপনার কষ্টার্জিত অর্থ নিরাপদে জমা রাখুন এবং প্রতি মাসে স্বয়ংক্রিয়ভাবে সর্বোচ্চ ১০% থেকে ১৮% আকর্ষণীয় 
              কমিশন আপনার ওয়ালেটে বুঝে নিন। মেয়াদ শেষে মূলধন সম্পূর্ণ ফেরত।
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link to="/fd-fund">
                <Button size="sm" className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                  <Wallet className="w-4 h-4" />
                  আমার ফিক্সড ডিপোজিট ফান্ড পেজ দেখুন →
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Profit Calculator */}
          <Card className="border shadow-md bg-card mb-12 overflow-hidden">
            <div className="bg-primary px-6 py-4 text-primary-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base md:text-lg">মুনাফা হিসাব ক্যালকুলেটর (Live Profit Calculator)</h3>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                স্বয়ংক্রিয় মাসিক ক্যাশআউট সুবিধা
              </span>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Inputs */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-bold text-sm text-foreground">
                        জমার পরিমাণ (টাকা):
                      </Label>
                      <span className="text-base font-extrabold text-primary">
                        {formatTaka(calcAmount)}
                      </span>
                    </div>
                    <Input
                      type="range"
                      min={1000}
                      max={200000}
                      step={1000}
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                      <span>১,০০০ টাকা</span>
                      <span>৫০,০০০ টাকা</span>
                      <span>১,০০,০০০ টাকা</span>
                      <span>২,০০,০০০ টাকা</span>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-sm text-foreground block mb-2.5">
                      মেয়াদ ও স্কিম নির্বাচন করুন:
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {activeSchemes.map((scheme) => (
                        <button
                          key={scheme.id}
                          type="button"
                          onClick={() => setSelectedSchemeId(scheme.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedSchemeId === scheme.id
                              ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                              : 'border-border bg-card hover:bg-muted/50'
                          }`}
                        >
                          <div className="text-xs font-bold text-foreground">
                            {toBengaliNumber(scheme.durationMonths)} মাস
                          </div>
                          <div className="text-sm font-extrabold text-emerald-600 mt-1">
                            {toBengaliNumber(scheme.monthlyProfitPercent)}% মাসিক
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="lg:col-span-5 bg-muted/40 p-5 md:p-6 rounded-2xl border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b text-xs">
                    <span className="text-muted-foreground font-medium">নির্বাচিত স্কিম</span>
                    <span className="font-bold text-foreground">{calcScheme.titleBn}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b text-xs">
                    <span className="text-muted-foreground font-medium">মাসিক মুনাফার হার</span>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                      {toBengaliNumber(calcScheme.monthlyProfitPercent)}% প্রতি মাসে
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-xs font-semibold text-muted-foreground">প্রতি মাসে আয় (মুনাফা)</span>
                    <span className="text-lg font-black text-emerald-600">
                      +{formatTaka(monthlyProfit)}
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                    <div className="text-xs font-semibold text-emerald-800">
                      {toBengaliNumber(calcScheme.durationMonths)} মাস পর মোট মূলধন + মোট লাভ:
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {formatTaka(totalMaturityReturn)}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      (মূলধন {formatTaka(calcAmount)} + সর্বমোট লাভ {formatTaka(totalProfitOverDuration)})
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenDeposit(calcScheme as FixedDepositScheme)}
                    className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20"
                  >
                    এই স্কিমে এখনই টাকা জমা দিন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Current DPS Portfolio if available */}
          {currentUser && myDeposits.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">আপনার সক্রিয় ফিক্সড ডিপোজিটসমূহ</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCashoutModalOpen(true)}
                  className="text-xs font-bold text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  জরুরি ক্যাশআউট নির্দেশিকা
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDeposits.map((dep) => (
                  <Card key={dep.id} className="border shadow-sm bg-card hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                          সক্রিয় স্কিম
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          ID: {dep.id}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold mt-2">
                        {dep.schemeTitleBn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      <div className="flex justify-between text-xs py-1 border-b">
                        <span className="text-muted-foreground">জমার পরিমাণ:</span>
                        <span className="font-bold text-foreground">{formatTaka(dep.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 border-b">
                        <span className="text-muted-foreground">মাসিক কমিশন ({toBengaliNumber(dep.profitPercent)}%):</span>
                        <span className="font-bold text-emerald-600">+{formatTaka(dep.monthlyProfitAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1 border-b">
                        <span className="text-muted-foreground">মেয়াদ উত্তীর্ণের তারিখ:</span>
                        <span className="font-semibold text-foreground">{dep.maturityDate}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1">
                        <span className="text-muted-foreground">মোট অর্জিত মুনাফা:</span>
                        <span className="font-bold text-primary">
                          {formatTaka(dep.totalProfitEarned || dep.monthlyProfitAmount)}
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCashoutModalOpen(true)}
                        className="w-full text-xs font-semibold h-8 mt-2"
                      >
                        মেয়াদপূর্বে উত্তোলন করুন
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available DPS Schemes Grid */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">আমাদের আকর্ষণীয় ফিক্সড ডিপোজিট প্যাকেজসমূহ</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                আপনার পছন্দের মেয়াদের যেকোনো প্যাকেজ নির্বাচন করে ঘরে বসেই অনলাইন পেমেন্টে টাকা জমা রাখুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeSchemes.map((scheme) => (
                <Card 
                  key={scheme.id} 
                  className={`border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden ${
                    scheme.id === 'fds-1m' ? 'border-primary ring-1 ring-primary/40' : ''
                  }`}
                >
                  {scheme.badgeBn && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px]">
                        {scheme.badgeBn}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="p-5 pb-3">
                    <span className="text-xs font-semibold text-primary">
                      {toBengaliNumber(scheme.durationMonths)} মাস মেয়াদী
                    </span>
                    <CardTitle className="text-lg font-bold mt-1 text-foreground">
                      {scheme.titleBn}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {scheme.taglineBn}
                    </CardDescription>

                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xs font-medium text-emerald-800">নিশ্চিত মাসিক কমিশন</div>
                      <div className="text-2xl font-black text-emerald-600">
                        {toBengaliNumber(scheme.monthlyProfitPercent)}%
                        <span className="text-xs font-medium text-emerald-700 ml-1">প্রতি মাসে</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="space-y-1 text-xs text-muted-foreground py-2 border-y">
                      <div className="flex justify-between">
                        <span>ন্যূনতম জমা:</span>
                        <strong className="text-foreground">{formatTaka(scheme.minAmount)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>সর্বোচ্চ জমা:</span>
                        <strong className="text-foreground">{formatTaka(scheme.maxAmount)}</strong>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-foreground">
                      {scheme.featuresBn?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleOpenDeposit(scheme)}
                      className="w-full font-bold text-xs h-10 bg-primary text-primary-foreground shadow-sm mt-3"
                    >
                      ডিপোজিট করুন
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rules & FAQ Card */}
          <Card className="border shadow-sm bg-muted/30">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                ফিক্সড ডিপোজিট সম্পর্কিত গুরুত্বপূর্ণ শর্তাবলী ও নিয়মাবলী
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs md:text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>১. <strong>স্বয়ংক্রিয় মুনাফা ক্রেডিট:</strong> আপনি টাকা জমা করার দিন থেকে প্রতি ৩০ দিন অন্তর আপনার ওয়ালেটে মাসিক নির্ধারিত কমিশন স্বয়ংক্রিয়ভাবে ক্রেডিট হবে।</p>
              <p>২. <strong>যেকোনো মেথডে উইথড্র:</strong> আপনার ওয়ালেটের অর্জিত মুনাফা বা যেকোনো ব্যালেন্স বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্টে তাৎক্ষণিক উইথড্র করতে পারবেন।</p>
              <p>৩. <strong>মেয়াদপূর্বে প্রত্যাহার (Early Cashout):</strong> জরুরি প্রয়োজনে আপনি মেয়াদ শেষ হওয়ার আগেই মূলধন প্রত্যাহার করতে পারবেন। এর জন্য আমাদের কাস্টমার সার্ভিসের সাথে যোগাযোগ করে সরাসরি ক্লিয়ারেন্স নিতে হবে।</p>
              <p>৪. <strong>নিরাপত্তা গ্যারান্টি:</strong> আপনার জমাকৃত আমানত সম্পূর্ণ নিরাপদ এবং বাংলাদেশ প্রচলিত ডিজিটাল ফাইন্যান্স অ্যাক্ট অনুসারে সংরক্ষিত।</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deposit Payment Modal */}
      {/* Deposit Action Modal - Mobile Optimized */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-lg p-4 sm:p-6 max-h-[85dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-card">
          <DialogHeader className="shrink-0 text-left border-b pb-3">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <PiggyBank className="w-5 h-5 text-primary shrink-0" />
              <span>স্থায়ী আমানত (DPS) পেমেন্ট ও জমা</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              নির্বাচিত স্কিম: <strong className="text-foreground">{chosenScheme?.titleBn}</strong> (মাসিক {toBengaliNumber(chosenScheme?.monthlyProfitPercent || 10)}% কমিশন)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDepositSubmit} className="space-y-4 mt-2 overflow-y-auto flex-1 pr-1 pb-4">
            <div>
              <Label className="text-xs font-semibold">জমার পরিমাণ (টাকা ৳)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">৳</span>
                <Input
                  type="number"
                  min={chosenScheme?.minAmount || 1000}
                  max={chosenScheme?.maxAmount || 200000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="h-11 pl-8 text-sm font-bold text-foreground"
                  required
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                এই স্কিমে প্রতি মাসে লাভ পাবেন: <strong className="text-emerald-600">{formatTaka(Math.round((depositAmount * (chosenScheme?.monthlyProfitPercent || 10)) / 100))}</strong>
              </span>
            </div>

            <div>
              <Label className="text-xs font-semibold">পেমেন্ট মেথড নির্বাচন করুন</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {paymentMethods.filter((m) => m.active).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(pm.name)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center ${
                      selectedPaymentMethod.toLowerCase() === pm.name.toLowerCase()
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Instruction Box */}
            {currentMethodConfig && (
              <div className="p-3.5 rounded-xl bg-muted/60 border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">টাকা পাঠানোর নম্বর ({currentMethodConfig.accountType}):</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyAccount(currentMethodConfig.accountNumber)}
                    className="h-8 text-xs font-bold text-primary gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> কপি করুন
                  </Button>
                </div>
                <div className="text-sm font-mono font-bold text-foreground bg-card p-2.5 rounded-lg border flex items-center justify-between">
                  <span>{currentMethodConfig.accountNumber}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {currentMethodConfig.instructionBn || 'উপরের নম্বরে টাকা Send Money বা Cash In করে নিচের বক্সে ট্রানজেকশন আইডি দিন।'}
                </p>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">ট্রানজেকশন আইডি (Transaction TrxID)</Label>
              <Input
                type="text"
                placeholder="যেমন: BK99X87210"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-11 text-sm font-mono mt-1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">পেমেন্ট স্লিপ বা জমার প্রমাণপত্র (ছবি আপলোড করুন) *</Label>
              <div className="flex flex-col gap-2">
                <label className="border-2 border-dashed border-primary/40 rounded-xl p-3 bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-col items-center justify-center text-center transition-colors min-h-[70px]">
                  <Upload className="w-5 h-5 text-primary mb-1" />
                  <span className="text-xs font-bold text-foreground">
                    {slipFileName ? `নির্বাচিত: ${slipFileName}` : 'মোবাইল থেকে স্লিপ বা স্ক্রিনশট নির্বাচন করুন'}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG বা স্ক্রিনশট</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSlipFileName(file.name);
                        try {
                          const compressed = await compressImage(file);
                          if (compressed) {
                            setSlipDataUrl(compressed);
                            toast.success(`স্লিপ "${file.name}" যুক্ত করা হয়েছে!`);
                          }
                        } catch {
                          toast.error('ছবি প্রসেসিং করতে ব্যর্থ হয়েছে');
                        }
                      }
                    }}
                  />
                </label>
                {slipDataUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border shadow-xs">
                    <img src={slipDataUrl} alt="Slip preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 sticky bottom-0 bg-card pb-1">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-primary text-primary-foreground font-extrabold text-sm shadow-md rounded-xl"
              >
                {submitting ? 'যাচাই হচ্ছে...' : 'ডিপোজিট নিশ্চিত করুন'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Early Cashout Guidance Modal - Mobile Optimized */}
      <Dialog open={cashoutModalOpen} onOpenChange={setCashoutModalOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-6 max-h-[85dvh] flex flex-col overflow-y-auto rounded-2xl shadow-xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              মেয়াদপূর্বে ডিপোজিট প্রত্যাহার (Early Cashout)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs md:text-sm text-foreground mt-2 leading-relaxed">
            <p>
              ফিক্সড ডিপোজিটের নির্ধারিত মেয়াদ শেষ হওয়ার পূর্বেই জরুরি প্রয়োজনে সম্পূর্ণ মূলধন প্রত্যাহার করতে চাইলে
              আমাদের অ্যাডমিন ও কাস্টমার সার্ভিসের সাথে সরাসরি কথা বলে তাৎক্ষণিক ক্লিয়ারেন্স গ্রহণ করতে হবে।
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-amber-700" />
                সরাসরি হেল্পলাইন যোগাযোগ:
              </div>
              <p>ফোন / ইমো / হোয়াটসঅ্যাপ: <strong>{customerSupport?.helplinePhone || settings.supportPhone}</strong></p>
              <p>অফিস সময়: {settings.officeTimeBn || 'সকাল ৯:০০ - সন্ধ্যা ৬:০০'}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                window.open(`https://wa.me/${(customerSupport?.whatsappNumber || '8801712345678').replace(/[^0-9]/g, '')}`, '_blank');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10"
            >
              হোয়াটসঅ্যাপে যোগাযোগ করুন
            </Button>
            <Button
              variant="outline"
              onClick={() => setCashoutModalOpen(false)}
              className="w-full text-xs font-semibold h-10"
            >
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
};
