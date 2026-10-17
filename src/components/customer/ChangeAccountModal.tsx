import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  PhoneCall, 
  MessageCircle, 
  Send, 
  PlusCircle, 
  Building2, 
  Smartphone,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useLoan } from '@/contexts/LoanContext';
import { toast } from 'sonner';
import { withdrawalPaymentService, type WithdrawalPaymentMethod } from '@/services/withdrawalPaymentService';

interface ChangeAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIdOrPhone?: string; // If provided, admin is editing; otherwise current user
  currentData?: {
    accountNumber?: string;
    accountType?: string;
    accountHolderName?: string;
    bankName?: string;
    branchName?: string;
  };
  currentAccountType?: string;
  currentAccountNumber?: string;
  currentAccountHolderName?: string;
  currentBankName?: string;
  currentBranchName?: string;
}

const SUPPORTED_METHODS = [
  { id: 'bKash', labelBn: 'বিকাশ (bKash)', icon: Smartphone, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { id: 'Nagad', labelBn: 'নগদ (Nagad)', icon: Smartphone, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Rocket', labelBn: 'রকেট (Rocket)', icon: Smartphone, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Bank', labelBn: 'ব্যাংক হিসাব (Bank Account)', icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
] as const;

export const ChangeAccountModal: React.FC<ChangeAccountModalProps> = ({
  open,
  onOpenChange,
  userIdOrPhone
}) => {
  const { currentUser, bindCustomerWithdrawalMethod, settings } = useLoan();

  // Find all currently bound methods
  const boundMap = currentUser?.boundWithdrawalAccounts || {};
  
  // Also check if legacy account was set and not login phone
  const hasLegacyBound = currentUser?.accountNumber && 
    currentUser.accountType && 
    currentUser.accountNumber !== currentUser.phone &&
    !boundMap[currentUser.accountType as keyof typeof boundMap];

  const effectiveBoundMap: Record<string, any> = { ...boundMap };
  if (hasLegacyBound && currentUser?.accountType) {
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

  const boundKeys = Object.keys(effectiveBoundMap);

  const [methodsList, setMethodsList] = useState<WithdrawalPaymentMethod[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchMethods = async () => {
      try {
        const active = await withdrawalPaymentService.getActiveMethods();
        if (isMounted && active && active.length > 0) {
          setMethodsList(active);
        }
      } catch (err) {
        console.error('Failed to load active withdrawal methods:', err);
      }
    };

    if (open) {
      fetchMethods();
    }
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Fallback if empty
  const activeMethodsToUse: Array<{ id: string; labelBn: string; logoUrl?: string; channelType?: string; placeholder?: string; instructions?: string }> = 
    methodsList.length > 0
      ? methodsList.map(m => ({
          id: m.id,
          labelBn: m.label_bn || m.name,
          logoUrl: m.logo_url,
          channelType: m.channel_type,
          placeholder: m.account_number_placeholder,
          instructions: m.instructions_bn
        }))
      : SUPPORTED_METHODS.map(m => ({
          id: m.id,
          labelBn: m.labelBn,
          channelType: m.id === 'Bank' ? 'bank' : 'mobile_banking'
        }));

  const unboundMethods = activeMethodsToUse.filter((m) => !effectiveBoundMap[m.id]);

  // Adding state
  const [addingMethod, setAddingMethod] = useState<string | null>(
    unboundMethods.length > 0 ? unboundMethods[0].id : null
  );

  useEffect(() => {
    if (unboundMethods.length > 0 && (!addingMethod || !unboundMethods.some(u => u.id === addingMethod))) {
      setAddingMethod(unboundMethods[0].id);
    }
  }, [unboundMethods.length, open]);

  const selectedMethodObj = activeMethodsToUse.find(m => m.id === addingMethod);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(currentUser?.name || '');
  const [bankName, setBankName] = useState('ব্র্যাক ব্যাংক');
  const [branchName, setBranchName] = useState('প্রধান শাখা');
  const [loading, setLoading] = useState(false);

  const handleBindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingMethod) {
      toast.error('অনুগ্রহ করে একটি পেমেন্ট মাধ্যম নির্বাচন করুন');
      return;
    }
    if (!accountNumber.trim()) {
      toast.error('অনুগ্রহ করে সঠিক অ্যাকাউন্ট বা মোবাইল নম্বর দিন');
      return;
    }

    const targetIdentifier = userIdOrPhone || currentUser?.id || currentUser?.phone;
    if (!targetIdentifier) {
      toast.error('ব্যবহারকারী পাওয়া যায়নি');
      return;
    }

    setLoading(true);
    const res = bindCustomerWithdrawalMethod(targetIdentifier, {
      method: addingMethod as any,
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim() || currentUser?.name,
      bankName: addingMethod === 'Bank' ? bankName.trim() : undefined,
      branchName: addingMethod === 'Bank' ? branchName.trim() : undefined
    });
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      setAccountNumber('');
      // Check remaining unbound
      const remaining = unboundMethods.filter((m) => m.id !== addingMethod);
      setAddingMethod(remaining.length > 0 ? (remaining[0].id as any) : null);
    } else {
      toast.error(res.message);
    }
  };

  const supportPhone = settings.supportPhone || '01700000000';
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`;
  const telegramUrl = 'https://t.me/bangladesh_bank_loan';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-xl p-4 sm:p-6 bg-card max-h-[88dvh] overflow-y-auto rounded-2xl shadow-2xl">
        <DialogHeader className="text-left pb-2 border-b">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-primary" />
            উইথড্রয়াল অ্যাকাউন্ট ও ওয়ালেট ব্যবস্থাপনা
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            টাকা উত্তোলনের জন্য আপনার ব্যক্তিগত বিকাশ, নগদ, রকেট বা ব্যাংক হিসাব যুক্ত করুন। সুরক্ষার জন্য প্রতিটি মেথড একবার যুক্ত করার পর স্বয়ংক্রিয়ভাবে লক হয়ে যাবে।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Note explaining registration phone vs withdrawal accounts */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              লগইন নম্বর ও উইথড্র অ্যাকাউন্ট সংক্রান্ত তথ্য:
            </div>
            <p className="text-[11px] leading-relaxed text-blue-900">
              আপনার রেজিস্টার্ড মোবাইল নম্বর (<strong className="font-mono">{currentUser?.phone}</strong>) শুধুমাত্র আপনার একাউন্টে লগইন করার জন্য ব্যবহৃত হয়। টাকা উত্তোলনের জন্য আপনি নিচে সুবিধাজনক যেকোনো পেমেন্ট মেথড স্বাধীনভাবে যুক্ত করতে পারেন।
            </p>
          </div>

          {/* 1. Bound / Locked Accounts Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                ইতিমধ্যে যুক্ত ও লকড থাকা উইথড্র অ্যাকাউন্ট ({boundKeys.length}/৪):
              </Label>
              {boundKeys.length === 4 && (
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  সকল মেথড সুরক্ষিত
                </Badge>
              )}
            </div>

            {boundKeys.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground bg-muted/20">
                এখনো কোনো উইথড্রয়াল মেথড যুক্ত করা হয়নি। টাকা তুলতে নিচের ফরম থেকে আপনার বিকাশ, নগদ বা ব্যাংক যুক্ত করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {boundKeys.map((key) => {
                  const b = effectiveBoundMap[key];
                  const meta = activeMethodsToUse.find((m) => m.id === key);

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/40 relative space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          {meta?.logoUrl ? (
                            <img src={meta.logoUrl} alt={key} className="w-4 h-4 object-contain rounded" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          {meta?.labelBn || key}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold text-amber-800 bg-amber-100 border-amber-300 gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-700" /> লকড
                        </Badge>
                      </div>

                      <div className="font-mono text-sm font-black text-foreground">
                        {b.accountNumber}
                      </div>

                      {key === 'Bank' && b.bankName && (
                        <p className="text-[11px] text-muted-foreground">
                          {b.bankName} • {b.branchName || 'শাখা'}
                        </p>
                      )}

                      <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-between pt-1 border-t border-emerald-200">
                        <span>হোল্ডার: {b.accountHolderName || currentUser?.name}</span>
                        <span className="text-emerald-700 font-bold">সুরক্ষিত</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Add New Method Section (If not all are bound) */}
          {unboundMethods.length > 0 ? (
            <div className="p-4 rounded-2xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">
                  নতুন উইথড্রয়াল মেথড যুক্ত করুন ({unboundMethods.length}টি মেথড খালি আছে):
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {unboundMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setAddingMethod(m.id);
                      setAccountNumber('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      addingMethod === m.id
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {m.logoUrl ? (
                      <img src={m.logoUrl} alt={m.labelBn} className="w-5 h-5 object-contain rounded" />
                    ) : m.channelType === 'bank' ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    <span className="truncate max-w-[80px]">{m.labelBn}</span>
                  </button>
                ))}
              </div>

              {addingMethod && (
                <form onSubmit={handleBindSubmit} className="space-y-3 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {selectedMethodObj?.channelType === 'bank' ? 'ব্যাংক একাউন্ট নম্বর *' : `${selectedMethodObj?.labelBn || addingMethod} নম্বর *`}
                    </Label>
                    <Input
                      type="text"
                      placeholder={selectedMethodObj?.placeholder || (selectedMethodObj?.channelType === 'bank' ? 'যেমন: 205021302004589' : 'যেমন: 01712345678')}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-10 text-sm font-mono font-bold"
                      required
                    />
                    {selectedMethodObj?.instructions && (
                      <p className="text-[11px] text-muted-foreground">
                        {selectedMethodObj.instructions}
                      </p>
                    )}
                  </div>

                  {addingMethod === 'Bank' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">ব্যাংকের নাম *</Label>
                          <Input
                            type="text"
                            placeholder="যেমন: ব্র্যাক ব্যাংক, সোনালী ব্যাংক"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="h-9 text-xs"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">শাখার নাম *</Label>
                          <Input
                            type="text"
                            placeholder="যেমন: ধানমন্ডি শাখা"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            className="h-9 text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">হিসাবধারীর নাম *</Label>
                        <Input
                          type="text"
                          value={accountHolderName}
                          onChange={(e) => setAccountHolderName(e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">হিসাবধারীর নাম (ঐচ্ছিক)</Label>
                      <Input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="h-9 text-xs"
                        placeholder={currentUser?.name}
                      />
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>সতর্কতা:</strong> একবার এই মেথডটি সংরক্ষণ করলে সুরক্ষার স্বার্থে তা স্বয়ংক্রিয়ভাবে লক হয়ে যাবে এবং আপনি নিজে পরিবর্তন করতে পারবেন না।
                    </span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-primary-foreground font-bold text-xs h-9 px-5 gap-1.5 shadow-sm rounded-xl"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {loading ? 'সংরক্ষণ হচ্ছে...' : `${addingMethod === 'Bank' ? 'ব্যাংক হিসাব' : addingMethod} যুক্ত ও লক করুন`}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs text-center space-y-1">
              <p className="font-bold">অভিনন্দন! আপনার সকল উইথড্র অ্যাকাউন্ট (বিকাশ, নগদ, রকেট, ব্যাংক) সংযুক্ত রয়েছে।</p>
              <p className="text-[11px] text-emerald-800">কোনো তথ্য সংশোধনের প্রয়োজন হলে নিচে অ্যাডমিন সাপোর্টে যোগাযোগ করুন।</p>
            </div>
          )}

          {/* Close Action */}
          <div className="pt-2 border-t flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold"
            >
              বন্ধ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
