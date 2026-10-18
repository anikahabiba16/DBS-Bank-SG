import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { ContractPaper } from '@/types/loan';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Printer, 
  Download, 
  Stamp, 
  ShieldCheck, 
  FileText,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  MousePointerClick
} from 'lucide-react';
import { AuthenticStampContractDocument } from './AuthenticStampContractDocument';

interface CustomerContractModalProps {
  contract: ContractPaper | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerContractModal: React.FC<CustomerContractModalProps> = ({
  contract,
  open,
  onOpenChange
}) => {
  const contractRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!contract) return null;

  const handleDownloadImage = async () => {
    if (!contractRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Loan_Contract_${contract.contractNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('চুক্তিপত্রের ছবি (PNG) সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err) {
      console.error(err);
      toast.error('ছবি ডাউনলোডে সমস্যা হয়েছে');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyImage = async () => {
    if (!contractRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
            toast.success('চুক্তিপত্রের ছবিটি ক্লিপবোর্ডে কপি হয়েছে! আপনি সরাসরি পেস্ট (Ctrl+V) করতে পারবেন।');
            return;
          } catch (e) {
            console.warn(e);
          }
        }
        toast.info('ছবি ডাউনলোডের জন্য "ছবি ডাউনলোড" বাটন ব্যবহার করুন।');
      }, 'image/png');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-4xl p-5 sm:p-7 bg-card rounded-2xl shadow-2xl border max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-left pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              আপনার অফিসিয়াল লোন চুক্তিপত্র (Agreement Contract Paper)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              চুক্তিপত্র আইডি: {contract.contractNumber} | তারিখ: {contract.issueDate}
            </DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              onClick={handleDownloadImage}
              disabled={isCapturing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 h-8 px-3 shadow-xs cursor-pointer"
              title="সম্পূর্ণ পেজ বাদ দিয়ে শুধুমাত্র এই চুক্তিপত্রের ছবি ডাউনলোড করুন"
            >
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>ছবি ডাউনলোড</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyImage}
              disabled={isCapturing}
              className="border-blue-400 text-blue-700 hover:bg-blue-50 font-bold text-xs gap-1.5 h-8 px-2.5 shadow-xs cursor-pointer"
              title="মাউস দিয়ে এক ক্লিকে ছবি কপি করুন"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
              <span>{copySuccess ? "কপি হয়েছে!" : "ছবি কপি"}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrint}
              className="text-xs text-muted-foreground h-8 w-8 p-0 cursor-pointer"
              title="প্রিন্ট ডায়ালগ"
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Contract Document: Authentic 100 Tk Stamp (Image 2) */}
        <div 
          ref={contractRef}
          id="customer-printable-contract" 
          onClick={handleCopyImage}
          title="মাউস দিয়ে ক্লিক করে এই চুক্তিপত্রের ছবি কপি করুন"
          className="p-1 sm:p-2 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all select-none relative group"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm flex items-center gap-1 pointer-events-none z-20">
            <Copy className="w-3 h-3" />
            <span>ক্লিক করে কপি করুন</span>
          </div>

          <AuthenticStampContractDocument
            data={{
              stampSerialNo: contract.stampSerialNo || 'খষ ৪৫৮১১৯৮',
              documentTitle: (contract as any).documentTitle || 'ঋণের চুক্তিপত্র',
              stampAmount: contract.stampAmount || 100,
              customerName: contract.customerName,
              customerNid: contract.nidNumber,
              applicationDate: contract.issueDate,
              loanAmount: contract.loanAmount,
              durationMonths: contract.durationMonths,
              monthlyEMI: contract.monthlyEMI,
              fatherName: contract.fatherName || 'লুৎফর রহমান',
              district: contract.district || 'ঢাকা',
              customerAddress: contract.customerAddress || 'বাসা/হোল্ডিং : ১৮৯, বড় মগবাজার হাসনাবাদ এপার্টমেন্ট ছ/৬, ডাকঘরঃ শান্তিনগর - ১২১৭, রমনা, ঢাকা উত্তর সিটি কর্পোরেশন, ঢাকা',
              companyName: contract.companyName || 'DBS Bank SG',
              firstPartySealText: contract.firstPartySealText || contract.adminSealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়',
              firstPartySigText: contract.firstPartySigText || contract.authorizedSignatoryTitle || 'অথরাইজড লোন অফিসার ও আইন কর্মকর্তা, DBS Bank SG',
              paragraph1: contract.paragraph1,
              paragraph2: contract.paragraph2,
              paragraph3: contract.paragraph3,
              customerPhotoUrl: contract.customerPhotoUrl,
              showCustomerPhoto: contract.showCustomerPhoto ?? true,
              showApprovedSeal: contract.showApprovedSeal ?? true,
              bankSignDate: contract.bankSignDate || contract.issueDate,
              bankSignTitle: contract.bankSignTitle || 'ব্যাংক কর্তৃপক্ষের স্বাক্ষর (DBS Bank SG)',
              borrowerSignText: contract.borrowerSignText || contract.customerName.split(' ').pop() || 'ঋণ গ্রহীতার স্বাক্ষর',
              bottomNotice: 'বিঃদ্রঃ ঋণের শর্তাবলী পালন না করলে ব্যাংক কর্তৃপক্ষ আইনানুগ ব্যবস্থা নিতে বাধ্য থাকিবে।',
              bottomSlogan: '“দেশপ্রেমের শপথ নিন, দুর্নীতিকে বিদায় দিন”'
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
