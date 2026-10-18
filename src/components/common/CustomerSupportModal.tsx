import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { SupportChannelOption } from '@/types/loan';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Headphones, 
  MessageCircle, 
  Send, 
  PhoneCall, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Mail,
  Info,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({ open, onOpenChange }) => {
  const { customerSupport } = useLoan();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Determine channels to display (dynamic array or legacy fallback)
  const displayChannels: SupportChannelOption[] = 
    customerSupport.channels && customerSupport.channels.length > 0
      ? customerSupport.channels.filter((c) => c.active !== false)
      : [
          {
            id: 'legacy-imo',
            type: 'imo',
            titleBn: 'ইমু (Imo) কাস্টমার কেয়ার',
            accountNumber: customerSupport.imoNumber,
            directLink: customerSupport.imoLink,
            active: true
          },
          {
            id: 'legacy-wa',
            type: 'whatsapp',
            titleBn: 'হোয়াটসঅ্যাপ (WhatsApp)',
            accountNumber: customerSupport.whatsappNumber,
            extraNote: customerSupport.whatsappMessage,
            active: true
          },
          {
            id: 'legacy-tg',
            type: 'telegram',
            titleBn: 'টেলিগ্রাম (Telegram)',
            accountNumber: customerSupport.telegramUsername,
            directLink: customerSupport.telegramLink,
            active: true
          },
          {
            id: 'legacy-phone',
            type: 'phone',
            titleBn: 'সরাসরি কল (Helpline)',
            accountNumber: customerSupport.helplinePhone,
            active: true
          }
        ];

  const renderChannelIcon = (type: string) => {
    switch (type) {
      case 'imo':
        return (
          <span className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            imo
          </span>
        );
      case 'whatsapp':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
        );
      case 'telegram':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Send className="w-5 h-5" />
          </div>
        );
      case 'email':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
        );
      case 'messenger':
        return (
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      case 'phone':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="w-5 h-5" />
          </div>
        );
    }
  };

  const getChannelAction = (ch: SupportChannelOption) => {
    if (ch.type === 'phone') {
      return {
        href: ch.directLink && ch.directLink.startsWith('tel:') ? ch.directLink : `tel:${ch.accountNumber}`,
        label: 'কল করুন',
        isCall: true
      };
    }
    if (ch.type === 'whatsapp') {
      const cleanWaNumber = ch.accountNumber.replace(/[^0-9]/g, '');
      const waUrl = ch.directLink || `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
        ch.extraNote || customerSupport.whatsappMessage || 'হ্যালো সহজ লোন কাস্টমার সার্ভিস'
      )}`;
      return {
        href: waUrl,
        label: 'চ্যাট',
        isCall: false
      };
    }
    if (ch.type === 'telegram') {
      const tgUrl = ch.directLink || `https://t.me/${ch.accountNumber.replace('@', '')}`;
      return {
        href: tgUrl,
        label: 'মেসেজ',
        isCall: false
      };
    }
    if (ch.type === 'imo') {
      return {
        href: ch.directLink || `tel:${ch.accountNumber}`,
        label: 'খোলো',
        isCall: false
      };
    }
    if (ch.type === 'email') {
      return {
        href: ch.directLink || `mailto:${ch.accountNumber}`,
        label: 'মেইল',
        isCall: false
      };
    }
    return {
      href: ch.directLink || '#',
      label: 'যোগাযোগ',
      isCall: false
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="max-w-[calc(100%-1.25rem)] sm:max-w-md md:max-w-xl p-3.5 sm:p-6 md:p-7 bg-card rounded-2xl shadow-2xl border max-h-[92dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        <DialogHeader className="text-left pb-2.5 sm:pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-black text-foreground">
                কাস্টমার সার্ভিস ও সহায়তা কেন্দ্র
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
                <span>{customerSupport.availableHoursBn || '২৪/৭ নিরবচ্ছিন্ন গ্রাহক সেবা'}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-3 mt-1.5 sm:mt-2 text-xs">
          {customerSupport.noticeBn && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-[11px] sm:text-xs leading-relaxed flex items-start gap-2">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
              <span>{customerSupport.noticeBn}</span>
            </div>
          )}

          {/* DYNAMIC CHANNELS LIST */}
          {displayChannels.map((ch) => {
            const action = getChannelAction(ch);
            return (
              <div 
                key={ch.id} 
                className="p-2.5 sm:p-3.5 rounded-xl border bg-muted/30 hover:border-primary/40 transition-colors flex items-center justify-between gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {renderChannelIcon(ch.type)}
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{ch.titleBn}</h4>
                    <p className="text-[11px] sm:text-xs font-mono text-muted-foreground truncate">{ch.accountNumber}</p>
                    {ch.extraNote && (
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{ch.extraNote}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(ch.accountNumber, ch.id, ch.titleBn)}
                    className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs"
                    title="কপি করুন"
                  >
                    {copiedKey === ch.id ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </Button>
                  <a href={action.href} target={action.isCall ? '_self' : '_blank'} rel="noopener noreferrer">
                    <Button 
                      size="sm" 
                      className={`h-7 sm:h-8 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold gap-1 ${
                        ch.type === 'imo'
                          ? 'bg-sky-500 hover:bg-sky-600 text-white'
                          : ch.type === 'whatsapp'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : ch.type === 'telegram'
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {action.label}
                      {action.isCall ? <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center text-[10px] sm:text-[11px] text-muted-foreground border-t mt-1 sm:mt-2">
          আমাদের প্রতিনিধিবৃন্দ আপনার যেকোনো প্রশ্ন ও লোন সহায়তায় প্রস্তুত রয়েছেন
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const FloatingSupportWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* On desktop show floating action button; on mobile, support is accessed directly via bottom nav to keep the view clean and un-obscured */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full h-12 px-4 bg-primary text-primary-foreground font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform border border-white/20 active:scale-95"
          aria-label="কাস্টমার সাপোর্ট"
        >
          <div className="relative">
            <Headphones className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">সহায়তা</span>
        </Button>
      </div>

      <CustomerSupportModal open={open} onOpenChange={setOpen} />
    </>
  );
};
