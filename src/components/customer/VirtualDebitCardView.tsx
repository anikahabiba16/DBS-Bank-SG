import React, { useState } from 'react';
import { VirtualDebitCard } from '@/types/loan';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Wifi, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { formatTaka } from '@/services/storage';
import { toast } from 'sonner';

interface VirtualDebitCardViewProps {
  card?: VirtualDebitCard | null;
  platformName?: string;
  onEditClick?: () => void;
  onApplyCard?: () => void;
  showAdminControls?: boolean;
}

export const VirtualDebitCardView: React.FC<VirtualDebitCardViewProps> = ({
  card,
  platformName = 'সহজ লোন',
  onEditClick,
  onApplyCard,
  showAdminControls = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!card) {
    return (
      <div className="space-y-4 max-w-sm mx-auto">
        {/* Mock Card Preview */}
        <div className="relative aspect-[1.586/1] w-full rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide text-emerald-400 uppercase">{platformName}</span>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-bold">
              ইস্যু করা হয়নি
            </Badge>
          </div>
          <div className="my-auto font-mono text-lg tracking-widest text-slate-500 text-center">
            •••• •••• •••• ••••
          </div>
          <div className="flex justify-between items-end text-xs font-mono text-slate-400">
            <div>
              <div className="text-[9px] text-slate-500">CARD HOLDER</div>
              <div className="font-bold text-slate-300 uppercase">আপনার নাম</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">EXPIRES</div>
              <div className="font-bold text-slate-300">MM/YY</div>
            </div>
            <div className="font-black italic text-base text-amber-400">
              VISA
            </div>
          </div>
        </div>

        {/* Action card */}
        <Card className="border border-dashed p-5 text-center bg-muted/30 space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">কোনো ভার্চুয়াল কার্ড সক্রিয় নেই</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              অনলাইনে নিরাপদ শপিং ও আন্তর্জাতিক লেনদেনের জন্য আপনার পার্সোনাল ভার্চুয়াল ভিসা ডেবিট কার্ড ইস্যু করুন।
            </p>
          </div>
          {onApplyCard && (
            <Button
              type="button"
              onClick={onApplyCard}
              className="w-full bg-primary text-primary-foreground font-bold text-xs h-9 shadow-md gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ভার্চুয়াল কার্ডের জন্য আবেদন করুন</span>
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const isApproved = card.status === 'active' || (card as any).status === 'sent';

  const handleCopyCard = (num: string) => {
    if (!isApproved) {
      toast.info('কার্ডটি এখনও অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে');
      return;
    }
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    toast.success('কার্ড নম্বর কপি করা হয়েছে');
  };

  const formatCardNumber = (num: string) => {
    if (!isApproved) return '•••• •••• •••• ••••';
    if (showDetails) return num;
    const clean = num.replace(/\s+/g, '');
    if (clean.length === 16) {
      return `${clean.slice(0, 4)} •••• •••• ${clean.slice(12)}`;
    }
    return num;
  };

  return (
    <div className="space-y-4">
      {/* Status Warning if not approved */}
      {!isApproved && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>অপেক্ষমাণ:</strong> এই ভার্চুয়াল ডেবিট কার্ডটি অ্যাডমিন কর্তৃক অনুমোদনের অপেক্ষায় রয়েছে।
            </span>
          </div>
          {showAdminControls && onEditClick && (
            <Button
              size="sm"
              onClick={onEditClick}
              className="bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold h-7 shrink-0"
            >
              অনুমোদন ও ইডিট করুন
            </Button>
          )}
        </div>
      )}

      {/* Realistic Card UI */}
      <div className={`relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl p-5 text-white shadow-2xl overflow-hidden transition-transform duration-300 ${
        isApproved
          ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 border border-emerald-500/40 shadow-emerald-950/40'
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-700 opacity-90'
      }`}>
        {/* Subtle holographic foil circle */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-amber-400/20 via-emerald-400/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-xl pointer-events-none" />

        {/* Top row: Platform branding & Contactless Icon */}
        <div className="relative z-10 flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs shadow">
              {platformName.slice(0, 1)}
            </div>
            <span className="font-bold text-sm tracking-wide text-emerald-300 uppercase">
              {platformName}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">PLATINUM</span>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-slate-300 rotate-90" />
            <Badge className={`text-[9px] font-extrabold uppercase px-2 py-0.5 ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {isApproved ? 'ACTIVE' : 'PENDING'}
            </Badge>
          </div>
        </div>

        {/* EMV Chip & Hologram */}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 p-0.5 shadow-md flex flex-col justify-around px-1">
            <div className="w-full h-0.5 bg-amber-700/40" />
            <div className="w-full h-0.5 bg-amber-700/40" />
            <div className="w-full h-0.5 bg-amber-700/40" />
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest">
            VIRTUAL DEBIT
          </span>
        </div>

        {/* 16-Digit Card Number */}
        <div className="relative z-10 mb-4 flex items-center justify-between">
          <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100 drop-shadow">
            {formatCardNumber(card.cardNumber)}
          </div>
          <button
            type="button"
            onClick={() => handleCopyCard(card.cardNumber)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="কপি করুন"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom row: Cardholder, Expiry, CVV & Network */}
        <div className="relative z-10 flex justify-between items-end text-xs font-mono">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">CARD HOLDER</div>
            <div className="font-bold text-slate-200 uppercase tracking-wide truncate max-w-[150px]">
              {card.cardHolderName || card.cardHolder}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">EXPIRES</div>
            <div className="font-bold text-slate-200">{isApproved ? card.expiryDate : '••/••'}</div>
          </div>

          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">CVV</div>
            <div className="font-bold text-slate-200">
              {isApproved && showDetails ? card.cvv : '•••'}
            </div>
          </div>

          <div className="text-right">
            <div className="font-black italic text-base tracking-tighter text-amber-400">
              {card.cardType || 'VISA'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls & Details Reveal */}
      <div className="flex items-center justify-between max-w-sm mx-auto px-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
        >
          {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showDetails ? 'কার্ড নম্বর ও CVV লুকান' : 'পূর্ণাঙ্গ কার্ড নম্বর ও CVV দেখুন'}
        </Button>

        {showAdminControls && onEditClick && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="text-xs font-semibold h-8"
          >
            কার্ড ইডিট ও অনুমোদন
          </Button>
        )}
      </div>
    </div>
  );
};
