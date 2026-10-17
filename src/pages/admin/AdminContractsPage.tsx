import React, { useState, useRef } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { ContractPaper } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  FileText, 
  FileCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  Stamp, 
  ShieldCheck, 
  Scale,
  Calendar,
  User,
  Phone,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  Send,
  Clock,
  Sparkles
} from 'lucide-react';
import { AuthenticStampContractDocument } from '@/components/common/AuthenticStampContractDocument';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const AdminContractsPage: React.FC = () => {
  const { 
    contractPapers, 
    saveContractPaper, 
    deleteContractPaper, 
    applications, 
    users,
    settings 
  } = useLoan();

  const [editorDialogOpen, setEditorDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractPaper | null>(null);

  // Editor Form Fields
  const [contractId, setContractId] = useState<string | undefined>(undefined);
  const [contractNumber, setContractNumber] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState('100000');
  const [durationMonths, setDurationMonths] = useState('12');
  const [monthlyEMI, setMonthlyEMI] = useState('8900');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // DBS Bank SG Default Seals and Signatures (Fully editable)
  const [firstPartyBn, setFirstPartyBn] = useState('DBS Bank SG (প্রথম পক্ষ/ঋণদাতা)');
  const [secondPartyBn, setSecondPartyBn] = useState('');
  const [contractSubjectBn, setContractSubjectBn] = useState('ব্যক্তিগত/ব্যবসায়িক ঋণ বিতরণ ও মাসিক কিস্তিতে পরিশোধের দ্বিপাক্ষিক আইনি চুক্তিপত্র');
  const [clausesText, setClausesText] = useState(
    `১. প্রথম পক্ষ ঋণগ্রহীতার অনুকূলে নির্ধারিত ঋণ মঞ্জুর করেছে এবং দ্বিতীয় পক্ষ তা সানন্দে গ্রহণ করেছে।\n২. দ্বিতীয় পক্ষ প্রতি ইংরেজি মাসের ১০ তারিখের মধ্যে নির্ধারিত মাসিক কিস্তির অর্থ পরিশোধ করতে আইনত বাধ্য থাকিবে।\n৩. ঋণগ্রহীতা ঋণের অর্থ অন্য কোনো অবৈধ বা উদ্দেশ্যবহির্ভূত কাজে ব্যবহার করিতে পারিবে না।\n৪. ঋণখেলাপি হওয়ার ক্ষেত্রে প্রথম পক্ষ প্রচলিত আইন অনুসারে জামিনদার ও গ্রহীতার বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণের পূর্ণ অধিকার সংরক্ষণ করে।\n৫. সম্পূর্ণ ঋণ ও সুদ পরিশোধ সমাপ্ত হওয়া সাপেক্ষে উভয় পক্ষের দায়মুক্তি সনদ (NOC) প্রদান করা হইবে।`
  );
  const [declarationBn, setDeclarationBn] = useState('আমি স্বজ্ঞানে, সুস্থ মস্তিষ্কে এবং কোনো প্ররোচনা ব্যতীত DBS Bank SG-এর এই ঋণ চুক্তিপত্রের সকল শর্তাবলি পড়িয়া ও বুঝিয়া স্বাক্ষর করিলাম।');
  const [adminSealText, setAdminSealText] = useState('DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়');
  const [signatoryTitle, setSignatoryTitle] = useState('অথরাইজড লোন অফিসার ও আইন কর্মকর্তা\nDBS Bank SG');
  const [companyName, setCompanyName] = useState('DBS Bank SG');
  const [firstPartySealText, setFirstPartySealText] = useState('DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ');
  const [firstPartySigText, setFirstPartySigText] = useState('DBS.Officer');

  // Stamp Denomination (100, 200, 300, 400, 500 or Custom)
  const [stampAmount, setStampAmount] = useState<number>(100);
  const [customStampInput, setCustomStampInput] = useState<string>('');

  // 100 Tk Stamp specific fields
  const [stampSerialNo, setStampSerialNo] = useState('প ৯৪৪৫৯৮৬');
  const [fatherName, setFatherName] = useState('মৃত রফিক উল্লাহ');
  const [district, setDistrict] = useState('সিলেট');
  const [paragraph1, setParagraph1] = useState(
    'আমাকে অনলাইন লোন DBS Bank SG ৩০০,০০০ টাকা ৬০ মাস মেয়াদে , প্রতি মাসে ৫,৭৯৯ হাজার টাকা কিস্তির ঋণ প্রস্তুত করিয়া , আমার সকল কার্যক্রম সম্পন্ন করে ও আমি ইন্টারন্যাশনাল মনিটরিং ফান্ড এর সকল শর্ত মানিয়ে ঋণ গ্রহণ করতে রাজি হয়েছি'
  );
  const [paragraph2, setParagraph2] = useState(
    'তবে , কোন মাসে কিস্তি দিতে দেরি হলে অবশ্যই মাসের শুরুতে জানাতে হবে ব্যাংক কর্তৃপক্ষ যেভাবে প্রক্রিয়ার কথা বলছে ওইসব প্রক্রিয়ায় অবশ্যই সম্পন্ন করতে হবে'
  );
  const [paragraph3, setParagraph3] = useState(
    'আমি ব্যাংক কর্তৃপক্ষকে সাক্ষ্য দিচ্ছি যে আমি মোঃ শাহিন আহমদ, উপরের তথ্য ভিত্তি করে আমি আত্মবিশ্বাসী যে আমার তাদের সকল শর্তাবলী পালন করতে পারবো'
  );
  const [showApprovedSeal, setShowApprovedSeal] = useState(true);

  const contractPaperRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownloadContractImage = async () => {
    if (!contractPaperRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(contractPaperRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Legal_Contract_${selectedContract?.contractNumber || 'doc'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('চুক্তিপত্রের মূল ছবি (PNG) সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err) {
      console.error(err);
      toast.error('ছবি তৈরিতে সমস্যা হয়েছে');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyContractImage = async () => {
    if (!contractPaperRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(contractPaperRef.current, {
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
            toast.success('চুক্তিপত্রের ছবি ক্লিপবোর্ডে কপি হয়েছে! সরাসরি পেস্ট করতে পারবেন।');
            return;
          } catch (e) {
            console.warn(e);
          }
        }
        toast.info('ছবি ডাউনলোডের জন্য "ছবি ডাউনলোড" বাটন চাপুন।');
      }, 'image/png');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Auto-Fill Details from Selected Customer
  const handleSelectCustomer = (phoneOrId: string) => {
    const user = users.find((u) => u.phone === phoneOrId || u.id === phoneOrId);
    const loan = applications.find((a) => a.phone === phoneOrId || a.id === phoneOrId);

    const cName = user?.name || loan?.applicantName || '';
    const cPhone = user?.phone || loan?.phone || phoneOrId;
    const cNid = user?.nidNumber || loan?.nidNumber || 'N/A';
    const cLoanAmount = loan?.loanAmount || 100000;
    const cDuration = loan?.durationMonths || 12;
    const cEmi = loan?.monthlyEMI || Math.round((cLoanAmount * 1.05) / cDuration);
    const cDist = (loan as any)?.district || user?.address || 'ঢাকা';
    const cFather = (loan as any)?.fatherName || 'মৃত রফিক উল্লাহ';

    setSelectedUserId(user?.id || cPhone);
    if (loan) setSelectedLoanId(loan.id);
    setCustomerName(cName);
    setPhone(cPhone);
    setNidNumber(cNid);
    setLoanAmount(String(cLoanAmount));
    setDurationMonths(String(cDuration));
    setMonthlyEMI(String(cEmi));
    setDistrict(cDist);
    setFatherName(cFather);
    setSecondPartyBn(`${cName} (দ্বিতীয় পক্ষ/ঋণগ্রহীতা)`);

    // Auto-update paragraphs with customer details
    setParagraph1(
      `আমাকে অনলাইন লোন DBS Bank SG ${toBengaliNumber(cLoanAmount)} টাকা ${toBengaliNumber(cDuration)} মাস মেয়াদে , প্রতি মাসে ${toBengaliNumber(cEmi)} টাকা কিস্তির ঋণ প্রস্তুত করিয়া , আমার সকল কার্যক্রম সম্পন্ন করে ও আমি ইন্টারন্যাশনাল মনিটরিং ফান্ড এর সকল শর্ত মানিয়ে ঋণ গ্রহণ করতে রাজি হয়েছি`
    );
    setParagraph2(
      'তবে , কোন মাসে কিস্তি দিতে দেরি হলে অবশ্যই মাসের শুরুতে জানাতে হবে ব্যাংক কর্তৃপক্ষ যেভাবে প্রক্রিয়ার কথা বলছে ওইসব প্রক্রিয়ায় অবশ্যই সম্পন্ন করতে হবে'
    );
    setParagraph3(
      `আমি ব্যাংক কর্তৃপক্ষকে সাক্ষ্য দিচ্ছি যে আমি ${cName}, উপরের তথ্য ভিত্তি করে আমি আত্মবিশ্বাসী যে আমার তাদের সকল শর্তাবলী পালন করতে পারবো`
    );

    if (!contractNumber) {
      setContractNumber(`DBS-CTR-${new Date().getFullYear()}-${cPhone.slice(-4)}`);
    }

    toast.success(`গ্রাহক "${cName}"-এর সকল তথ্য সফলভাবে অটো-ফিল হয়েছে!`);
  };

  // Open Editor
  const handleOpenEditor = (contract?: ContractPaper) => {
    if (contract) {
      setContractId(contract.id);
      setContractNumber(contract.contractNumber);
      setSelectedLoanId(contract.loanId);
      setSelectedUserId(contract.userId);
      setCustomerName(contract.customerName);
      setPhone(contract.phone);
      setNidNumber(contract.nidNumber);
      setLoanAmount(contract.loanAmount.toString());
      setDurationMonths(contract.durationMonths.toString());
      setMonthlyEMI(contract.monthlyEMI.toString());
      setIssueDate(contract.issueDate);
      setFirstPartyBn(contract.firstPartyBn || 'DBS Bank SG (প্রথম পক্ষ/ঋণদাতা)');
      setSecondPartyBn(contract.secondPartyBn || `${contract.customerName} (দ্বিতীয় পক্ষ/ঋণগ্রহীতা)`);
      setContractSubjectBn(contract.contractSubjectBn);
      setClausesText(contract.clausesBn.join('\n'));
      setDeclarationBn(contract.declarationBn || 'আমি স্বজ্ঞানে, সুস্থ মস্তিষ্কে এবং কোনো প্ররোচনা ব্যতীত DBS Bank SG-এর এই ঋণ চুক্তিপত্রের সকল শর্তাবলি পড়িয়া ও বুঝিয়া স্বাক্ষর করিলাম।');
      setAdminSealText(contract.adminSealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়');
      setSignatoryTitle(contract.authorizedSignatoryTitle || 'অথরাইজড লোন অফিসার ও আইন কর্মকর্তা\nDBS Bank SG');
      setCompanyName(contract.companyName || 'DBS Bank SG');
      setFirstPartySealText(contract.firstPartySealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ');
      setFirstPartySigText(contract.firstPartySigText || 'DBS.Officer');
      setStampAmount(Number(contract.stampAmount) || 100);
      setStampSerialNo(contract.stampSerialNo || 'প ৯৪৪৫৯৮৬');
      setFatherName(contract.fatherName || 'মৃত রফিক উল্লাহ');
      setDistrict(contract.district || 'সিলেট');
      setParagraph1(contract.paragraph1 || '');
      setParagraph2(contract.paragraph2 || '');
      setParagraph3(contract.paragraph3 || '');
      setShowApprovedSeal(contract.showApprovedSeal ?? true);
    } else {
      setContractId(undefined);
      setContractNumber(`DBS-CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSelectedLoanId('');
      setSelectedUserId('');
      setCustomerName('');
      setPhone('');
      setNidNumber('');
      setLoanAmount('100000');
      setDurationMonths('12');
      setMonthlyEMI('8900');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setFirstPartyBn('DBS Bank SG (প্রথম পক্ষ/ঋণদাতা)');
      setSecondPartyBn('');
      setContractSubjectBn('ব্যক্তিগত/ব্যবসায়িক ঋণ বিতরণ ও মাসিক কিস্তিতে পরিশোধের দ্বিপাক্ষিক আইনি চুক্তিপত্র');
      setClausesText(
        `১. প্রথম পক্ষ ঋণগ্রহীতার অনুকূলে নির্ধারিত ঋণ মঞ্জুর করেছে এবং দ্বিতীয় পক্ষ তা সানন্দে গ্রহণ করেছে।\n২. দ্বিতীয় পক্ষ প্রতি ইংরেজি মাসের ১০ তারিখের মধ্যে নির্ধারিত মাসিক কিস্তির অর্থ পরিশোধ করতে আইনত বাধ্য থাকিবে।\n৩. ঋণগ্রহীতা ঋণের অর্থ অন্য কোনো অবৈধ বা উদ্দেশ্যবহির্ভূত কাজে ব্যবহার করিতে পারিবে না।\n৪. ঋণখেলাপি হওয়ার ক্ষেত্রে প্রথম পক্ষ প্রচলিত আইন অনুসারে প্রয়োজনীয় ব্যবস্থা গ্রহণের অধিকার সংরক্ষণ করে।\n৫. সম্পূর্ণ ঋণ পরিশোধ সমাপ্ত হওয়া সাপেক্ষে দায়মুক্তি সনদ (NOC) প্রদান করা হইবে।`
      );
      setDeclarationBn('আমি স্বজ্ঞানে, সুস্থ মস্তিষ্কে এবং কোনো প্ররোচনা ব্যতীত DBS Bank SG-এর এই ঋণ চুক্তিপত্রের সকল শর্তাবলি পড়িয়া ও বুঝিয়া স্বাক্ষর করিলাম।');
      setAdminSealText('DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়');
      setSignatoryTitle('অথরাইজড লোন অফিসার ও আইন কর্মকর্তা\nDBS Bank SG');
      setCompanyName('DBS Bank SG');
      setFirstPartySealText('DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ');
      setFirstPartySigText('DBS.Officer');
      setStampAmount(100);
      setStampSerialNo('প ৯৪৪৫৯৮৬');
      setFatherName('মৃত রফিক উল্লাহ');
      setDistrict('ঢাকা');
      setParagraph1('');
      setParagraph2('');
      setParagraph3('');
      setShowApprovedSeal(true);
    }
    setEditorDialogOpen(true);
  };

  // Save Contract (as Draft or Sent)
  const handleSaveContractWithStatus = (targetStatus: 'draft' | 'sent') => {
    if (!customerName.trim() || !phone.trim() || !contractNumber.trim()) {
      toast.error('চুক্তি নম্বর, গ্রাহকের নাম ও মোবাইল নম্বর পূরণ করুন');
      return;
    }

    const clauses = clausesText
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const actualStamp = customStampInput && Number(customStampInput) > 0 ? Number(customStampInput) : stampAmount;

    saveContractPaper({
      id: contractId,
      contractNumber: contractNumber.trim(),
      userId: selectedUserId || phone.trim(),
      loanId: selectedLoanId || `LN-${Date.now().toString().slice(-4)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      nidNumber: nidNumber.trim() || 'N/A',
      loanAmount: parseFloat(loanAmount) || 100000,
      durationMonths: parseInt(durationMonths) || 12,
      monthlyEMI: parseFloat(monthlyEMI) || 8900,
      issueDate,
      firstPartyBn: firstPartyBn.trim(),
      secondPartyBn: secondPartyBn.trim() || `${customerName.trim()} (দ্বিতীয় পক্ষ/ঋণগ্রহীতা)`,
      contractSubjectBn: contractSubjectBn.trim(),
      clausesBn: clauses,
      declarationBn: declarationBn.trim(),
      adminSealText: adminSealText.trim(),
      authorizedSignatoryTitle: signatoryTitle.trim(),
      signedDate: issueDate,
      stampSerialNo: stampSerialNo.trim(),
      fatherName: fatherName.trim(),
      district: district.trim(),
      paragraph1: paragraph1.trim(),
      paragraph2: paragraph2.trim(),
      paragraph3: paragraph3.trim(),
      showApprovedSeal,
      stampAmount: actualStamp,
      companyName: companyName.trim() || 'DBS Bank SG',
      firstPartySealText: firstPartySealText.trim(),
      firstPartySigText: firstPartySigText.trim(),
      status: targetStatus,
      sentAt: targetStatus === 'sent' ? new Date().toISOString() : undefined
    });

    if (targetStatus === 'sent') {
      toast.success('চুক্তিপত্র সফলভাবে অনুমোদন ও গ্রাহককে সেন্ড করা হয়েছে!', {
        description: `${customerName} তার পোর্টালে এই চুক্তিপত্র রিয়েল-টাইমে দেখতে পারবে।`
      });
    } else {
      toast.success('চুক্তিপত্র খসড়া (Draft) হিসেবে সংরক্ষিত হয়েছে। গ্রাহক অনুমোদন ব্যাতীত এটি দেখতে পাবে না।');
    }
    setEditorDialogOpen(false);
  };

  // Instant Send Action from Card
  const handleDirectSend = (contract: ContractPaper) => {
    saveContractPaper({
      ...contract,
      status: 'sent',
      sentAt: new Date().toISOString()
    });
    toast.success(`"${contract.customerName}"-এর চুক্তিপত্র অনুমোদন ও সেন্ড করা হয়েছে!`, {
      description: 'গ্রাহক তার পোর্টালে এই চুক্তিপত্র রিয়েল-টাইমে দেখতে পারবে।'
    });
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`আপনি কি "${num}" চুক্তিপত্রটি মুছে ফেলতে চান?`)) {
      deleteContractPaper(id);
      toast.success('চুক্তিপত্র মুছে ফেলা হয়েছে');
    }
  };

  const handleOpenPreview = (contract: ContractPaper) => {
    setSelectedContract(contract);
    setPreviewDialogOpen(true);
  };

  return (
    <AdminLayout
      title="অফিসিয়াল লোন চুক্তিপত্র (DBS Bank SG Legal Agreements)"
      subtitle="গ্রাহকদের জন্য দ্বিপাক্ষিক আইনানুগ স্ট্যাম্প চুক্তিপত্র তৈরি, অনুমোদন, ডিফল্ট DBS Bank SG সিল-স্বাক্ষর এবং ক্লাউড সেন্ড ম্যানেজমেন্ট"
      actions={
        <Button
          onClick={() => handleOpenEditor()}
          className="bg-primary text-primary-foreground font-bold text-xs h-9 gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন চুক্তিপত্র তৈরি করুন</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium">মোট চুক্তিপত্র</span>
                <h3 className="text-2xl font-black text-foreground">{toBengaliNumber(contractPapers.length)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">অনুমোদিত ও গ্রাহককে সেন্ডকৃত</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {toBengaliNumber(contractPapers.filter((c) => c.status === 'sent').length)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">খসড়া (গ্রাহকের নিকট অপ্রকাশিত)</span>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {toBengaliNumber(contractPapers.filter((c) => c.status !== 'sent').length)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Papers Cards Grid */}
        {contractPapers.length === 0 ? (
          <Card className="border p-12 text-center bg-card">
            <Scale className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-foreground">কোনো চুক্তিপত্র পাওয়া যায়নি</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              "নতুন চুক্তিপত্র তৈরি করুন" বাটনে ক্লিক করে গ্রাহক সিলেক্ট করুন এবং স্বয়ংক্রিয় DBS Bank SG সিল-স্বাক্ষর সম্বলিত চুক্তিপত্র প্রস্তুত করুন।
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractPapers.map((contract) => {
              const isSent = contract.status === 'sent';
              return (
                <Card key={contract.id} className="border shadow-xs bg-card hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{contract.contractNumber}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">তারিখ: {contract.issueDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isSent ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                            অনুমোদিত ও সেন্ডকৃত
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                            খসড়া (অপ্রকাশিত)
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
                          {toBengaliNumber(contract.stampAmount || 100)} টাকার স্ট্যাম্প
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ঋণগ্রহীতা:</span>
                        <strong className="text-foreground">{contract.customerName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ফোন:</span>
                        <span className="font-mono">{contract.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ঋণের পরিমাণ:</span>
                        <strong className="text-primary">{formatTaka(contract.loanAmount)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">মাসিক কিস্তি:</span>
                        <span className="font-bold">{formatTaka(contract.monthlyEMI)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ব্যাংক সিল/কর্তৃপক্ষ:</span>
                        <span className="text-foreground font-medium">{contract.companyName || 'DBS Bank SG'}</span>
                      </div>
                    </div>

                    {/* Direct Send Action for drafts */}
                    {!isSent && (
                      <Button
                        size="sm"
                        onClick={() => handleDirectSend(contract)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>গ্রাহককে অনুমোদন ও সেন্ড করুন</span>
                      </Button>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleOpenPreview(contract)}
                        className="flex-1 h-8 text-xs font-bold bg-primary text-primary-foreground gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>চুক্তিপত্র দেখুন</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditor(contract)}
                        className="h-8 px-2.5 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contract.id, contract.contractNumber)}
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* CONTRACT EDITOR MODAL */}
      <Dialog open={editorDialogOpen} onOpenChange={setEditorDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-2xl p-4 sm:p-6 bg-card max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span>{contractId ? 'লোন চুক্তিপত্র এডিট করুন' : 'নতুন আইনি চুক্তিপত্র (DBS Bank SG) তৈরি করুন'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক নির্বাচন করলে তার তথ্য অটো-ফিল হবে। সমস্ত সিল ও স্বাক্ষর DBS Bank SG-এর নামে ডিফল্ট থাকবে এবং এডিটেবল।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2 text-xs">
            {/* Auto-Fill Customer Selector */}
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
              <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>গ্রাহক নির্বাচন করুন (সমস্ত তথ্য ও অনুচ্ছেদ অটো-ফিল হবে) *</span>
              </Label>
              <select
                onChange={(e) => handleSelectCustomer(e.target.value)}
                defaultValue=""
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="" disabled>-- গ্রাহক তালিকা থেকে সিলেক্ট করুন --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.phone}>
                    {u.name} ({u.phone}) - NID: {u.nidNumber || 'নেই'}
                  </option>
                ))}
              </select>
            </div>

            {/* Stamp Duty Value Selector (100, 200, 300, 400, 500 or Custom) */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Stamp className="w-4 h-4" />
                  <span>স্ট্যাম্প ডিউটির মূল্য নির্বাচন করুন (১০০, ২০০, ৩০০, ৪০০, ৫০০ বা কাস্টম)</span>
                </Label>
                <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                  বর্তমান: {toBengaliNumber(customStampInput && Number(customStampInput) > 0 ? Number(customStampInput) : stampAmount)} টাকা
                </Badge>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[100, 200, 300, 400, 500].map((amt) => {
                  const isSelected = (!customStampInput || Number(customStampInput) <= 0) && stampAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setStampAmount(amt);
                        setCustomStampInput('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-card text-foreground border-border hover:border-amber-500'
                      }`}
                    >
                      {toBengaliNumber(amt)} টাকা
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">অথবা কাস্টম টাকার অংক লিখুন:</span>
                <Input
                  type="number"
                  placeholder="যেমন: ২৫০ বা যেকোনো অংক"
                  value={customStampInput}
                  onChange={(e) => setCustomStampInput(e.target.value)}
                  className="h-8 text-xs font-mono font-bold max-w-[160px]"
                />
                <span className="text-[11px] text-muted-foreground">টাকা</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">চুক্তি নম্বর *</Label>
                <Input
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">চুক্তির তারিখ</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">গ্রাহকের নাম *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মোবাইল নম্বর *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">এনআইডি নম্বর</Label>
                <Input
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ঋণের পরিমাণ (BDT) *</Label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="h-9 text-xs font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মেয়াদ (মাস)</Label>
                <Input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">মাসিক কিস্তি (BDT)</Label>
                <Input
                  type="number"
                  value={monthlyEMI}
                  onChange={(e) => setMonthlyEMI(e.target.value)}
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>

            {/* DBS Bank SG Default Seals & Signatures Section (Editable) */}
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
              <div className="font-bold text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between border-b border-blue-200 dark:border-blue-900/40 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  DBS Bank SG ডিফল্ট সিল ও স্বাক্ষর সেটিংস (সম্পূর্ণ এডিটেবল)
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-normal">ডিফল্ট: DBS Bank SG</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">প্রথম পক্ষ (ঋণদাতা / ব্যাংক)</Label>
                  <Input
                    value={firstPartyBn}
                    onChange={(e) => setFirstPartyBn(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ব্যাংকের অফিসিয়াল নাম</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-8 text-xs bg-background font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">অফিসিয়াল সিল টেক্সট (DBS Bank SG)</Label>
                  <Input
                    value={adminSealText}
                    onChange={(e) => setAdminSealText(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">স্বাক্ষরকারী পদবি ও ব্যাংক</Label>
                  <Input
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">প্রথম পক্ষ সিলমোহর টেক্সট</Label>
                  <Input
                    value={firstPartySealText}
                    onChange={(e) => setFirstPartySealText(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">স্বাক্ষর সংক্ষেপ (Signature Text)</Label>
                  <Input
                    value={firstPartySigText}
                    onChange={(e) => setFirstPartySigText(e.target.value)}
                    className="h-8 text-xs bg-background font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Stamp 3 Paragraphs Section */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="font-bold text-emerald-950 dark:text-emerald-300 text-xs flex items-center justify-between border-b border-emerald-300/40 pb-1.5">
                <span>স্ট্যাম্প বডি অনুচ্ছেদ ও শর্তাবলী (গ্রাহকের নাম ও তথ্যে অটো-ফিল)</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">সম্পূর্ণ এডিটেবল</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">স্ট্যাম্প ক্রমিক নম্বর</Label>
                  <Input
                    value={stampSerialNo}
                    onChange={(e) => setStampSerialNo(e.target.value)}
                    className="h-8 text-xs bg-background font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">পিতার নাম</Label>
                  <Input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">জেলা</Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">শর্তাবলী অনুচ্ছেদ ১ (ঋণের বিবরণ ও সম্মতি)</Label>
                  <Textarea
                    value={paragraph1}
                    onChange={(e) => setParagraph1(e.target.value)}
                    rows={2}
                    className="text-xs bg-background resize-y"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">শর্তাবলী অনুচ্ছেদ ২ (দেরি হলে করণীয় ও প্রক্রিয়া)</Label>
                  <Textarea
                    value={paragraph2}
                    onChange={(e) => setParagraph2(e.target.value)}
                    rows={2}
                    className="text-xs bg-background resize-y"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">শর্তাবলী অনুচ্ছেদ ৩ (গ্রাহকের সাক্ষ্য ও অঙ্গীকারনামা)</Label>
                  <Textarea
                    value={paragraph3}
                    onChange={(e) => setParagraph3(e.target.value)}
                    rows={2}
                    className="text-xs bg-background resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Save Draft vs Send to Customer */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditorDialogOpen(false)}
                className="h-10 text-xs sm:w-auto"
              >
                বাতিল
              </Button>
              <div className="flex-1 flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleSaveContractWithStatus('draft')}
                  variant="secondary"
                  className="flex-1 h-10 text-xs font-bold gap-1.5"
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>খসড়া সংরক্ষণ (Save Draft)</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveContractWithStatus('sent')}
                  className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>অনুমোদন ও গ্রাহককে সেন্ড করুন</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OFFICIAL CONTRACT PAPER PRINT / PREVIEW MODAL */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-3xl p-4 sm:p-6 bg-card max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="text-left pb-2 border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <span>অফিসিয়াল আইনি চুক্তিপত্র (DBS Bank SG Legal Contract)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                চুক্তিপত্র নম্বর: {selectedContract?.contractNumber} | স্ট্যাম্প: {toBengaliNumber(selectedContract?.stampAmount || 100)} টাকা
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                onClick={handleDownloadContractImage}
                disabled={isCapturing}
                className="h-8 text-xs font-bold bg-primary text-primary-foreground gap-1.5"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>ছবি ডাউনলোড (PNG)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContractImage}
                disabled={isCapturing}
                className="h-8 text-xs gap-1.5"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>কপি করুন</span>
              </Button>
            </div>
          </DialogHeader>

          {selectedContract && (
            <div className="mt-4 border rounded-xl overflow-x-auto bg-slate-50 p-2 sm:p-4">
              <div ref={contractPaperRef} className="mx-auto bg-white shadow-lg">
                <AuthenticStampContractDocument
                  contractNumber={selectedContract.contractNumber}
                  customerName={selectedContract.customerName}
                  phone={selectedContract.phone}
                  nidNumber={selectedContract.nidNumber}
                  loanAmount={selectedContract.loanAmount}
                  durationMonths={selectedContract.durationMonths}
                  monthlyEMI={selectedContract.monthlyEMI}
                  issueDate={selectedContract.issueDate}
                  firstPartyBn={selectedContract.firstPartyBn || 'DBS Bank SG (প্রথম পক্ষ/ঋণদাতা)'}
                  secondPartyBn={selectedContract.secondPartyBn}
                  contractSubjectBn={selectedContract.contractSubjectBn}
                  clausesBn={selectedContract.clausesBn}
                  declarationBn={selectedContract.declarationBn}
                  adminSealText={selectedContract.adminSealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়'}
                  authorizedSignatoryTitle={selectedContract.authorizedSignatoryTitle || 'অথরাইজড লোন অফিসার ও আইন কর্মকর্তা\nDBS Bank SG'}
                  signedDate={selectedContract.signedDate}
                  showApprovedSeal={selectedContract.showApprovedSeal ?? true}
                  stampSerialNo={selectedContract.stampSerialNo || 'প ৯৪৪৫৯৮৬'}
                  fatherName={selectedContract.fatherName || 'মৃত রফিক উল্লাহ'}
                  district={selectedContract.district || 'সিলেট'}
                  paragraph1={selectedContract.paragraph1}
                  paragraph2={selectedContract.paragraph2}
                  paragraph3={selectedContract.paragraph3}
                  stampAmount={selectedContract.stampAmount || 100}
                  companyName={selectedContract.companyName || 'DBS Bank SG'}
                  firstPartySealText={selectedContract.firstPartySealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ'}
                  firstPartySigText={selectedContract.firstPartySigText || 'DBS.Officer'}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
export default AdminContractsPage;
