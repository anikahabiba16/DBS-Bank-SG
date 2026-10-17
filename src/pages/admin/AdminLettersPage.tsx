import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BankApprovalLetterView } from '@/components/common/BankApprovalLetterView';
import { 
  FileCheck2, 
  Eye, 
  Printer, 
  FileEdit, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { formatTaka } from '@/services/storage';
import { toast } from 'sonner';
import { LoanApplication, LoanApprovalLetter } from '@/types/loan';

export const AdminLettersPage: React.FC = () => {
  const { 
    applications, 
    approvalLetters, 
    saveApprovalLetter, 
    getApprovalLetterByLoanId,
    users 
  } = useLoan();

  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<LoanApprovalLetter | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Editor Form State
  const [sanctionNumber, setSanctionNumber] = useState('');
  const [officialHeader, setOfficialHeader] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [managerSignature, setManagerSignature] = useState('');
  const [termsText, setTermsText] = useState('');

  const handleOpenEditor = (app: LoanApplication) => {
    setSelectedApp(app);
    const existing = getApprovalLetterByLoanId(app.id);

    if (existing) {
      setSanctionNumber(existing.sanctionLetterNumber);
      setOfficialHeader(existing.officialHeaderBn);
      setCustomMessage(existing.customMessageBn);
      setManagerSignature(existing.managerSignatureTitle);
      setTermsText(existing.termsConditionsBn?.join('\n') || '');
    } else {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      setSanctionNumber(`SHOHOJ/SANCTION/${year}/${month}/${app.id.replace('LN-', '')}`);
      setOfficialHeader('গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের আর্থিক প্রতিষ্ঠান নীতিমালা ও মাইক্রোক্রেডিট রেগুলেশন অনুসারে অনুমোদিত');
      setCustomMessage(
        `আপনার প্রদত্ত ব্যক্তিগত ও আয়ের তথ্যাদি সন্তোষজনকভাবে যাচাইপূর্বক সহজ লোন ক্রেডিট কমিটি আপনার অনুকূলে সর্বমোট ${formatTaka(app.approvedAmount || app.loanAmount, true)} ঋণ মঞ্জুর করেছে।`
      );
      setManagerSignature('মোহাম্মদ রাশেদুল করিম\nপ্রধান ঋণ কর্মকর্তা ও ব্যবস্থাপনা কর্তৃপক্ষ\nসহজ লোন সার্ভিসেস লিমিটেড');
      setTermsText(
        'প্রতি মাসের ১০ তারিখের মধ্যে নির্ধারিত কিস্তির অর্থ পরিশোধ করতে হবে।\nনির্ধারিত সময়ের মধ্যে কিস্তি অপরিশোধিত থাকলে বিলম্ব ফি প্রযোজ্য হবে।\nপ্রদত্ত ঋণ আবেদনপত্রে উল্লিখিত উদ্দেশ্যেই ব্যবহার করা যাবে।\nগ্রাহক যেকোনো সময় অগ্রিম সম্পূর্ণ ঋণ পরিশোধ করতে পারবেন।'
      );
    }

    setEditorOpen(true);
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const termsArray = termsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const saved = saveApprovalLetter({
      loanId: selectedApp.id,
      userId: selectedApp.phone, // map to phone or id
      customerName: selectedApp.applicantName,
      phone: selectedApp.phone,
      nidNumber: selectedApp.nidNumber,
      loanAmount: selectedApp.approvedAmount || selectedApp.loanAmount,
      approvedDate: selectedApp.approvedDate || new Date().toISOString().split('T')[0],
      interestRate: selectedApp.interestRate,
      durationMonths: selectedApp.durationMonths,
      monthlyEMI: selectedApp.monthlyEMI,
      sanctionLetterNumber: sanctionNumber.trim(),
      officialHeaderBn: officialHeader.trim(),
      customMessageBn: customMessage.trim(),
      bankSealText: 'সহজ লোন সার্ভিসেস লিমিটেড ★ অফিশিয়াল অনুমোদন সিল',
      managerSignatureTitle: managerSignature.trim(),
      termsConditionsBn: termsArray
    });

    toast.success('ব্যাংক-স্টাইল লোন অ্যাপ্রুভাল লেটার সফলভাবে তৈরি ও সংরক্ষণ করা হয়েছে!');
    setEditorOpen(false);

    // Open preview directly
    setPreviewLetter(saved);
    setPreviewOpen(true);
  };

  const handlePreviewDirect = (app: LoanApplication) => {
    const existing = getApprovalLetterByLoanId(app.id);
    if (existing) {
      setPreviewLetter(existing);
      setPreviewOpen(true);
    } else {
      handleOpenEditor(app);
    }
  };

  return (
    <AdminLayout
      title="ব্যাংক-স্টাইল লোন অ্যাপ্রুভাল লেটার ও পিডিএফ জেনারেটর"
      subtitle="যেকোনো গ্রাহকের জন্য ব্যাংকের সিল ও প্যাডের মতো অফিশিয়াল লোন অনুমোদন পত্র তৈরি ও ইস্যু করুন"
    >
      <div className="space-y-6">
        <Card className="border shadow-sm bg-card">
          <CardHeader className="p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                <FileCheck2 className="w-5 h-5 text-primary" />
                লোন আবেদন ও অফিসিয়াল অনুমোদন পত্র তালিকা
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                যেকোনো লোন আবেদনের জন্য আপনি যা লিখে দিবেন তা ব্যাংকের অফিসিয়াল প্যাডের মতো সেভ হবে এবং গ্রাহক ডাউনলোড করতে পারবে
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">আবেদন আইডি</th>
                    <th className="px-4 py-3 whitespace-nowrap">গ্রাহকের নাম ও ফোন</th>
                    <th className="px-4 py-3 whitespace-nowrap">লোন প্যাকেজ</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">মঞ্জুরকৃত পরিমাণ</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">লেটার স্ট্যাটাস</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((app) => {
                    const hasLetter = !!getApprovalLetterByLoanId(app.id);
                    return (
                      <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-foreground">
                          {app.id}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-foreground text-sm">{app.applicantName}</div>
                          <div className="text-[11px] text-muted-foreground">{app.phone}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-foreground font-medium">
                          {app.packageName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-bold text-foreground">
                          {formatTaka(app.approvedAmount || app.loanAmount)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {hasLetter ? (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              লেটার প্রস্তুত
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              তৈরি হয়নি
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {hasLetter && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewDirect(app)}
                                className="h-7 px-2 text-xs font-bold gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                দেখুন ও প্রিন্ট
                              </Button>
                            )}

                            <Button
                              size="sm"
                              onClick={() => handleOpenEditor(app)}
                              className="h-7 px-2.5 text-xs font-bold gap-1 bg-primary text-primary-foreground"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              {hasLetter ? 'এডিট করুন' : 'লেটার তৈরি করুন'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letter Editor Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl p-6 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary" />
              ব্যাংক-স্টাইল লোন অ্যাপ্রুভাল লেটার কাস্টমাইজ করুন
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              গ্রাহক: <span className="font-bold text-foreground">{selectedApp?.applicantName}</span> | আবেদন: <span className="font-mono font-bold">{selectedApp?.id}</span> | পরিমাণ: <span className="font-bold text-emerald-600">{formatTaka(selectedApp?.approvedAmount || selectedApp?.loanAmount || 0)}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLetter} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">রেফারেন্স নম্বর (Sanction Reference No)</Label>
                <Input
                  value={sanctionNumber}
                  onChange={(e) => setSanctionNumber(e.target.value)}
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">হেডার সাব-টাইটেল</Label>
                <Input
                  value={officialHeader}
                  onChange={(e) => setOfficialHeader(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                লোন মঞ্জুরির অফিসিয়াল বক্তব্য (Custom Sanction Body Text) *
              </Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                আপনি যা লিখে দিবেন গ্রাহকের অফিসিয়াল সনদে হুবহু সেই তথ্য প্রদর্শিত হবে।
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">শর্তাবলী ও নিয়মাবলী (প্রতি লাইনে একটি শর্ত)</Label>
              <Textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                rows={3}
                className="text-xs leading-relaxed font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">স্বাক্ষরকারী কর্মকর্তার পদবী ও তথ্য</Label>
              <Textarea
                value={managerSignature}
                onChange={(e) => setManagerSignature(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="font-bold bg-primary text-primary-foreground gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                সংরক্ষণ ও গ্রাহকের কাছে ইস্যু করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Letter Full Preview & Print Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl p-4 sm:p-6 bg-card max-h-[92vh] overflow-y-auto">
          {previewLetter && (
            <BankApprovalLetterView letter={previewLetter} />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
