import React, { useState, useEffect } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { PaymentMethodConfig } from '@/types/loan';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDownCircle, 
  Copy, 
  Check, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Sparkles,
  History,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDepositModal: React.FC<CustomerDepositModalProps> = ({ open, onOpenChange }) => {
  const { 
    currentUser, 
    paymentMethods, 
    depositRequests, 
    createDepositRequest 
  } = useLoan();

  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    paymentMethods.length > 0 ? paymentMethods[0].id : ''
  );

  const [depositAmount, setDepositAmount] = useState('1000');
  const [senderNumber, setSenderNumber] = useState(currentUser?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [slipFileName, setSlipFileName] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active payment methods
  const activeMethods = paymentMethods.filter((m) => m.active);

  // Keep selected method in sync with real-time cloud updates
  useEffect(() => {
    if (!selectedMethodId && activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0].id);
    } else if (selectedMethodId && !activeMethods.some((m) => m.id === selectedMethodId) && activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0].id);
    }
  }, [activeMethods, selectedMethodId]);

  // Dynamically resolve selected method to always reflect latest cloud updates
  const selectedMethod: PaymentMethodConfig | null = 
    activeMethods.find((m) => m.id === selectedMethodId) ||
    paymentMethods.find((m) => m.id === selectedMethodId) ||
    activeMethods[0] ||
    paymentMethods[0] ||
    null;

  // Filter deposit history for current user
  const userDeposits = depositRequests.filter(
    (d) => !currentUser || d.userId === currentUser.id || d.phone === currentUser.phone
  );

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(true);
    toast.success('অ্যাকাউন্ট নম্বর কপি করা হয়েছে!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSlipDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
      toast.success(`ডিপোজিট স্লিপ "${file.name}" যুক্ত করা হয়েছে!`);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      toast.error('অনুগ্রহ করে একটি পেমেন্ট মেথড সিলেক্ট করুন');
      return;
    }

    const amount = parseFloat(depositAmount);
    const min = selectedMethod.minDeposit ?? 100;
    const max = selectedMethod.maxDeposit ?? 10000000;
    if (!amount || amount < min) {
      toast.error(`সর্বনিম্ন ডিপোজিট পরিমাণ ${formatTaka(min)}`);
      return;
    }

    if (amount > max) {
      toast.error(`সর্বোচ্চ ডিপোজিট পরিমাণ ${formatTaka(max)}`);
      return;
    }

    if (!senderNumber.trim()) {
      toast.error('যে নম্বর থেকে টাকা পাঠিয়েছেন তা উল্লেখ করুন');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('টাকা পাঠানোর পর প্রাপ্ত TrxID প্রদান করুন');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = createDepositRequest({
        userId: currentUser?.id || `guest-${Date.now()}`,
        customerName: currentUser?.name || 'সম্মানিত গ্রাহক',
        phone: senderNumber.trim(),
        methodId: selectedMethod.id,
        methodName: selectedMethod.name,
        amount,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        slipUrl: slipDataUrl || slipFileName || undefined
      });

      setIsSubmitting(false);

      if (res.success) {
        toast.success(res.message);
        setTransactionId('');
        setSlipFileName('');
        setActiveTab('history');
      } else {
        toast.error('ডিপোজিট আবেদন জমা করতে সমস্যা হয়েছে');
      }
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-xl p-4 sm:p-6 bg-card rounded-2xl shadow-2xl border max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="text-left pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                আমানত জমা ও ওয়ালেট রিচার্জ (Deposit)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                বাংলাদেশের যেকোনো মোবাইল ব্যাংকিং বা ব্যাংক একাউন্ট থেকে সহজে টাকা জমা দিন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'deposit' | 'history')} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full h-9">
            <TabsTrigger value="deposit" className="text-xs font-bold gap-1.5">
              <ArrowDownCircle className="w-3.5 h-3.5" />
              টাকা জমা দিন
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold gap-1.5">
              <History className="w-3.5 h-3.5" />
              জমার হিস্ট্রি ({toBengaliNumber(userDeposits.length)})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SUBMIT DEPOSIT */}
          <TabsContent value="deposit" className="space-y-4 mt-3">
            {/* Step 1: Payment Methods Selection */}
            <div>
              <Label className="text-xs font-bold text-foreground mb-2 block">
                ১. পেমেন্ট মেথড নির্বাচন করুন (Select Payment Method):
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {activeMethods.map((pm) => {
                  const isSelected = selectedMethod?.id === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethodId(pm.id);
                        setCopiedAccount(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <img
                          src={pm.logo}
                          alt={pm.name}
                          className="w-8 h-8 rounded-lg object-cover border bg-muted shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs truncate text-foreground">{pm.name}</h5>
                          <span className="text-[10px] text-muted-foreground block truncate">{pm.nameEn}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 font-bold ${
                            pm.transactionType === 'Send Money'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : pm.transactionType === 'Cash Out'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {pm.transactionType}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">{pm.accountType}</span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Payment Details & Account Info */}
            {selectedMethod && (
              <div className="p-3.5 rounded-xl border bg-muted/40 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">নির্ধারিত অ্যাকাউন্ট নম্বর:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-sm text-foreground bg-background px-2.5 py-1 rounded border">
                      {selectedMethod.accountNumber}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyAccount(selectedMethod.accountNumber)}
                      className="h-7 px-2 text-xs font-bold gap-1 bg-background"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAccount ? 'কপি হয়েছে' : 'কপি'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">লেনদেনের নিয়ম:</span>
                  <strong className="text-primary font-bold">
                    {selectedMethod.transactionType} ({selectedMethod.accountType})
                  </strong>
                </div>

                <div className="p-2.5 rounded-lg bg-background/80 border text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-0.5">নির্দেশনা:</strong>
                  {selectedMethod.instructionBn}
                </div>
              </div>
            )}

            {/* Step 3: Deposit Submission Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">জমার পরিমাণ (টাকা) *</Label>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="যেমন: 1000"
                    className="h-9 text-xs font-bold"
                    required
                  />
                  {selectedMethod && (
                    <span className="text-[10px] text-muted-foreground">
                      সীমা: {formatTaka(selectedMethod.minDeposit || 100)} - {formatTaka(selectedMethod.maxDeposit || 10000000)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">যে নম্বর/হিসাব থেকে পাঠিয়েছেন *</Label>
                  <Input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="আপনার বিকাশ/নগদ নম্বর"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Label className="text-xs font-semibold">ট্রানজেকশন আইডি (TrxID) *</Label>
                  <span className="text-[10px] text-primary font-bold">
                    যে নাম্বার থেকে টাকা পাঠিয়েছেন তার লাস্টের ৪ বা ৬ সংখ্যা
                  </span>
                </div>
                <Input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যে নাম্বার থেকে টাকা পাঠিয়েছেন তার লাস্টের ৪ বা ৬ সংখ্যা"
                  className="h-10 text-xs font-mono font-bold tracking-wider"
                  required
                />
              </div>

              {/* Deposit Slip Upload - Prominently Highlighted */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">ডিপোজিট স্লিপ / স্ক্রিনশট (ঐচ্ছিক)</Label>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    রসিদের ছবি দিন
                  </span>
                </div>
                <label className="flex items-center justify-center gap-3 p-4 sm:p-5 border-2 border-dashed border-primary/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/15 transition-all shadow-xs group">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center sm:text-left min-w-0">
                    <span className="text-xs font-bold text-primary block truncate">
                      {slipFileName ? `✅ ${slipFileName}` : 'স্ক্রিনশট বা রসিদের ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      গ্যালারি থেকে জমার রসিদ বা ট্রানজেকশনের স্ক্রিনশট নির্বাচন করতে ট্যাপ করুন
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-black text-sm h-11 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'ডিপোজিট রিকোয়েস্ট নিশ্চিত করুন'}
                </Button>
                
                {/* Auto Verify Notification Note */}
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>ট্রানজেকশন অটো ভেরিফাই হবে দয়া করে কিছু সময় অপেক্ষা করুন</span>
                  </p>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* TAB 2: DEPOSIT HISTORY */}
          <TabsContent value="history" className="space-y-3 mt-3">
            {userDeposits.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium">আপনার কোনো পূর্ববর্তী ডিপোজিট রেকর্ড পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {userDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-xl border bg-card hover:bg-muted/20 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground font-mono">{dep.id}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold bg-muted/40">
                          {dep.methodName}
                        </Badge>
                      </div>
                      <Badge
                        className={
                          dep.status === 'approved'
                            ? 'bg-emerald-600 text-white font-bold text-[10px]'
                            : dep.status === 'rejected'
                            ? 'bg-red-600 text-white font-bold text-[10px]'
                            : 'bg-amber-500 text-white font-bold text-[10px]'
                        }
                      >
                        {dep.status === 'approved' ? 'অনুমোদিত ও যুক্ত' : dep.status === 'rejected' ? 'বাতিল' : 'যাচাই চলছে'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">TrxID: {dep.transactionId}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">তারিখ: {dep.requestDate}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600">{formatTaka(dep.amount)}</span>
                    </div>

                    {dep.adminNote && (
                      <div className="text-[10px] p-2 rounded bg-muted/50 text-muted-foreground">
                        মন্তব্য: {dep.adminNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
