import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { formatTaka, toBengaliNumber, calculateEMI } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Loan amount limits used by the calculator: ৳20,000 to ৳50,00,000.
const MIN_LOAN_AMOUNT = 20_000;
const MAX_LOAN_AMOUNT = 5_000_000;

export const CalculatorPage: React.FC = () => {
  const { packages, settings } = useLoan();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const packageIdParam = searchParams.get('packageId');
  const amountParam = searchParams.get('amount');
  const durationParam = searchParams.get('duration');

  const selectedPkg = packages.find((p) => p.id === packageIdParam);

  // Calculator inputs
  const [selectedPackageId, setSelectedPackageId] = useState<string>(selectedPkg?.id || 'custom');
  const [amount, setAmount] = useState<number>(() => {
    const requestedAmount = amountParam
      ? Number(amountParam)
      : (selectedPkg?.minAmount ? Math.max(selectedPkg.minAmount, 100_000) : 100_000);

    if (!Number.isFinite(requestedAmount)) return 100_000;
    return Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, requestedAmount));
  });
  const [durationMonths, setDurationMonths] = useState<number>(durationParam ? Number(durationParam) : 12);
  const [interestRate, setInterestRate] = useState<number>(selectedPkg ? selectedPkg.defaultRate : (settings.defaultInterestRateGlobal || 8.5));
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // When selected package changes, update defaults
  const handlePackageChange = (val: string) => {
    setSelectedPackageId(val);
    if (val === 'custom') {
      setInterestRate(settings.defaultInterestRateGlobal || 8.5);
    } else {
      const pkg = packages.find((p) => p.id === val);
      if (pkg) {
        setInterestRate(pkg.defaultRate);
        // The calculator supports the full range independently of package presets.
        setAmount((currentAmount) =>
          Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, currentAmount))
        );
        if (durationMonths < 3) setDurationMonths(3);
        if (durationMonths > 60) setDurationMonths(60);
      }
    }
  };

  const calculation = calculateEMI(amount, interestRate, durationMonths);
  const processingFee = Math.round(amount * 0.01); // 1%

  // Generate monthly amortization table
  const generateAmortization = () => {
    const schedule = [];
    let balance = amount;
    const monthlyRate = interestRate / 12 / 100;
    const monthlyEMI = calculation.monthlyEMI;

    for (let month = 1; month <= durationMonths; month++) {
      const interestForMonth = Math.round(balance * monthlyRate);
      const principalForMonth = Math.min(balance, monthlyEMI - interestForMonth);
      const endingBalance = Math.max(0, balance - principalForMonth);

      schedule.push({
        month,
        beginningBalance: balance,
        emi: monthlyEMI,
        principal: principalForMonth,
        interest: interestForMonth,
        endingBalance
      });

      balance = endingBalance;
      if (balance <= 0) break;
    }
    return schedule;
  };

  const amortizationSchedule = generateAmortization();

  const handleApplyClick = () => {
    const pkgParam = selectedPackageId !== 'custom' ? `packageId=${selectedPackageId}&` : '';
    navigate(`/apply?${pkgParam}amount=${amount}&duration=${durationMonths}&rate=${interestRate}`);
  };

  const handleReset = () => {
    setAmount(100_000);
    setDurationMonths(12);
    setInterestRate(8.5);
    setSelectedPackageId('custom');
    toast.success('ক্যালকুলেটর রিসেট করা হয়েছে');
  };

  return (
    <CustomerLayout>
      {/* Banner */}
      <div className="bg-muted/40 border-b border-border py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              নির্ভুল হিসাব
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              ইন্টারেক্টিভ লোন ও কিস্তি ক্যালকুলেটর
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              আপনার ঋণের পরিমাণ, মেয়াদ এবং সুদের হারের উপর ভিত্তি করে রিয়েল-টাইমে মাসিক কিস্তি (EMI), মোট প্রদেয় সুদ এবং বিস্তারিত কিস্তি তালিকা দেখুন।
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="ed-card border-border">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-serif">লোনের বিবরণ ইনপুট দিন</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1 text-muted-foreground">
                    <RotateCcw className="w-3.5 h-3.5" /> রিসেট
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* Package Preset Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    লোন প্যাকেজ নির্বাচন (প্রিসেট)
                  </Label>
                  <Select value={selectedPackageId} onValueChange={handlePackageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="প্যাকেজ বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">কাস্টম হিসাব (সরাসরি রেট বসান)</SelectItem>
                      {packages.filter((p) => p.active).map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.nameBn} ({toBengaliNumber(pkg.defaultRate)}% সুদ)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input & Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount-input" className="text-sm font-medium">
                      কাঙ্ক্ষিত ঋণের পরিমাণ (টাকা):
                    </Label>
                    <div className="w-36">
                      <Input
                        id="amount-input"
                        type="number"
                        min={MIN_LOAN_AMOUNT}
                        max={MAX_LOAN_AMOUNT}
                        step={5000}
                        value={amount}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue === '') {
                            setAmount(MIN_LOAN_AMOUNT);
                            return;
                          }
                          const parsedValue = Number(rawValue);
                          if (Number.isFinite(parsedValue)) {
                            setAmount(Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, parsedValue)));
                          }
                        }}
                        className="text-right font-mono font-bold"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[amount]}
                    min={MIN_LOAN_AMOUNT}
                    max={MAX_LOAN_AMOUNT}
                    step={10000}
                    onValueChange={(val) => setAmount(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTaka(MIN_LOAN_AMOUNT)}</span>
                    <span>৳ ২৫,০০,০০০</span>
                    <span>{formatTaka(MAX_LOAN_AMOUNT)}</span>
                  </div>
                </div>

                {/* Duration Months Input & Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="duration-input" className="text-sm font-medium">
                      পরিশোধের মেয়াদ (মাস):
                    </Label>
                    <div className="w-28 flex items-center gap-1">
                      <Input
                        id="duration-input"
                        type="number"
                        min={3}
                        max={60}
                        step={1}
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className="text-right font-mono font-bold"
                      />
                      <span className="text-xs text-muted-foreground">মাস</span>
                    </div>
                  </div>
                  <Slider
                    value={[durationMonths]}
                    min={3}
                    max={60}
                    step={1}
                    onValueChange={(val) => setDurationMonths(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>৩ মাস</span>
                    <span>১২ মাস (১ বছর)</span>
                    <span>৩৬ মাস (৩ বছর)</span>
                    <span>৬০ মাস (৫ বছর)</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="rate-input" className="text-sm font-medium">
                      বার্ষিক সুদের হার (%):
                    </Label>
                    <div className="w-28 flex items-center gap-1">
                      <Input
                        id="rate-input"
                        type="number"
                        min={3}
                        max={20}
                        step={0.1}
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="text-right font-mono font-bold"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <Slider
                    value={[interestRate]}
                    min={4}
                    max={15}
                    step={0.5}
                    onValueChange={(val) => setInterestRate(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>৪% (স্পেশাল)</span>
                    <span>৮% (স্ট্যান্ডার্ড)</span>
                    <span>১২%</span>
                    <span>১৫%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="ed-card border-border bg-card shadow-md">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">হিসাবের সারাংশ</CardTitle>
                <CardDescription className="text-xs">
                  আপনার নির্বাচিত তথ্যের উপর ভিত্তি করে আনুমানিক হিসাব
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Highlighted Monthly EMI */}
                <div className="p-5 rounded-lg bg-foreground text-background text-center space-y-1">
                  <span className="text-xs text-background/80 uppercase tracking-wider block">
                    প্রতি মাসে প্রদেয় কিস্তি (EMI)
                  </span>
                  <div className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-background">
                    {formatTaka(calculation.monthlyEMI)}
                  </div>
                  <span className="text-[11px] text-background/70 block">
                    মোট {toBengaliNumber(durationMonths)} টি সমান মাসিক কিস্তি
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">মূল ঋণের পরিমাণ:</span>
                    <strong className="text-foreground font-mono">{formatTaka(amount)}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">মোট প্রদেয় সুদ:</span>
                    <strong className="text-accent font-mono font-bold">{formatTaka(calculation.totalInterest)}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">আনুমানিক প্রসেসিং ফি (১%):</span>
                    <span className="text-foreground font-mono">{formatTaka(processingFee)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-muted/50 px-3 rounded-md">
                    <span className="font-semibold text-foreground">সর্বমোট পরিশোধযোগ্য টাকা:</span>
                    <strong className="text-foreground font-mono text-base font-bold">
                      {formatTaka(calculation.totalPayable)}
                    </strong>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>মূল ঋণ: {Math.round((amount / calculation.totalPayable) * 100)}%</span>
                    <span>সুদ: {Math.round((calculation.totalInterest / calculation.totalPayable) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex">
                    <div
                      className="bg-foreground h-full"
                      style={{ width: `${(amount / calculation.totalPayable) * 100}%` }}
                    />
                    <div
                      className="bg-accent h-full"
                      style={{ width: `${(calculation.totalInterest / calculation.totalPayable) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Apply Action */}
                <div className="pt-3 space-y-2">
                  <Button
                    onClick={handleApplyClick}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium py-5"
                  >
                    <span>এই শর্তে আবেদন করুন</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full text-xs"
                  >
                    {showSchedule ? 'কিস্তি শিডিউল লুকান' : 'পূর্ণাঙ্গ মাসিক কিস্তি শিডিউল দেখুন'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        {showSchedule && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-foreground">
                  মাসিক কিস্তির পূর্ণাঙ্গ শিডিউল (Amortization Schedule)
                </h3>
                <p className="text-xs text-muted-foreground">
                  প্রতি মাসের কিস্তিতে কত টাকা আসল এবং কত টাকা সুদ পরিশোধ হবে তার বিস্তারিত হিসাব
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {toBengaliNumber(durationMonths)} মাস
              </Badge>
            </div>

            <Card className="ed-card border-border overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <Table className="[&>div]:max-w-full min-w-[650px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap font-bold text-xs">মাস নং</TableHead>
                      <TableHead className="whitespace-nowrap font-bold text-xs">প্রারম্ভিক স্থিতি</TableHead>
                      <TableHead className="whitespace-nowrap font-bold text-xs">মাসিক কিস্তি (EMI)</TableHead>
                      <TableHead className="whitespace-nowrap font-bold text-xs text-emerald-700">আসল পরিশোধ</TableHead>
                      <TableHead className="whitespace-nowrap font-bold text-xs text-amber-700">সুদ পরিশোধ</TableHead>
                      <TableHead className="whitespace-nowrap font-bold text-xs">সমাপনী স্থিতি</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amortizationSchedule.map((row) => (
                      <TableRow key={row.month} className="hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap font-semibold text-xs">
                          মাস {toBengaliNumber(row.month)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {formatTaka(row.beginningBalance)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">
                          {formatTaka(row.emi)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-emerald-700">
                          {formatTaka(row.principal)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-amber-700">
                          {formatTaka(row.interest)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">
                          {formatTaka(row.endingBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
