import React from 'react';
import { LoanApprovalLetter } from '@/types/loan';
import { formatTaka } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Printer, Download, CheckCircle, ShieldCheck, Building2 } from 'lucide-react';

interface BankApprovalLetterViewProps {
  letter: LoanApprovalLetter;
  onPrint?: () => void;
  showDownloadButton?: boolean;
}

export const BankApprovalLetterView: React.FC<BankApprovalLetterViewProps> = ({
  letter,
  onPrint,
  showDownloadButton = true
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {showDownloadButton && (
        <div className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border print:hidden">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>অফিসিয়াল ব্যাংক-স্ট্যান্ডার্ড ঋণ অনুমোদন পত্র (Sanction Letter)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs font-bold gap-1.5 h-8 bg-card"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              প্রিন্ট করুন
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold gap-1.5 h-8 bg-primary text-primary-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              পিডিএফ ডাউনলোড (PDF)
            </Button>
          </div>
        </div>
      )}

      {/* Official Bank Sanction Letter Document Paper */}
      <div
        id={`sanction-letter-${letter.id}`}
        className="w-full bg-white text-slate-900 border-2 border-slate-800 rounded-none shadow-2xl p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden"
      >
        {/* Subtle Bank Watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Building2 className="w-[450px] h-[450px] text-slate-900" />
        </div>

        {/* Top Header: Bank / Financial Institution Letterhead */}
        <div className="border-b-2 border-slate-800 pb-5 text-center relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-left text-[11px] text-slate-600 font-mono">
              রেফারেন্স নং: <span className="font-bold text-slate-900">{letter.sanctionLetterNumber}</span>
            </div>
            <div className="text-right text-[11px] text-slate-600 font-medium">
              তারিখ: <span className="font-bold text-slate-900">{letter.approvedDate}</span>
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black text-base flex items-center justify-center">
              ঋ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-serif">
              সহজ লোন সার্ভিসেস লিমিটেড
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
            {letter.officialHeaderBn}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            প্রধান কার্যালয়: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা - ১২০৫ | হটলাইন: ১৬০০০, +৮৮০ ১৭ ১২৩৪ ৫৬৭৮
          </p>

          <div className="mt-3 inline-block bg-slate-900 text-white text-xs font-extrabold px-4 py-1 tracking-wider uppercase">
            ঋণ অনুমোদন সনদপত্র / SANCTION LETTER
          </div>
        </div>

        {/* Applicant Details Grid */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          <div>
            <span className="text-slate-500 font-medium">গ্রাহকের নাম:</span>{' '}
            <span className="font-bold text-slate-900 text-sm">{letter.customerName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">আবেদন ট্র্যাকিং আইডি:</span>{' '}
            <span className="font-bold font-mono text-slate-900">{letter.loanId}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>{' '}
            <span className="font-bold text-slate-900">{letter.phone}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">জাতীয় পরিচয়পত্র (NID):</span>{' '}
            <span className="font-bold font-mono text-slate-900">{letter.nidNumber}</span>
          </div>
        </div>

        {/* Sanction Message Body */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 text-justify">
          <p className="font-semibold text-slate-900">
            জনাব / মহোদয়া,
          </p>
          <p className="text-slate-800">
            {letter.customMessageBn}
          </p>

          {/* Approved Terms Table */}
          <div className="my-4 border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-100/60 font-semibold">
                  <td className="p-2.5 text-slate-600">মঞ্জুরকৃত ঋণের পরিমাণ (Approved Loan Amount)</td>
                  <td className="p-2.5 text-right font-black text-slate-950 text-sm">
                    {formatTaka(letter.loanAmount, true)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-600">বার্ষিক সুদের হার (Annual Interest Rate)</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    {letter.interestRate}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-600">ঋণের মেয়াদকাল (Repayment Tenure)</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    {letter.durationMonths} মাস
                  </td>
                </tr>
                <tr className="bg-emerald-50 font-semibold text-emerald-950">
                  <td className="p-2.5">প্রতি মাসের কিস্তির পরিমাণ (Monthly EMI)</td>
                  <td className="p-2.5 text-right font-black text-emerald-800 text-sm">
                    {formatTaka(letter.monthlyEMI, true)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Terms & Conditions */}
          {letter.termsConditionsBn && letter.termsConditionsBn.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                বিশেষ শর্তাবলী ও নীতিমালা:
              </h4>
              <ul className="list-decimal list-inside space-y-1 text-xs text-slate-700 pl-1">
                {letter.termsConditionsBn.map((term, index) => (
                  <li key={index} className="leading-snug">{term}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Official Seal and Signatures Section */}
        <div className="mt-12 pt-6 border-t-2 border-slate-300 grid grid-cols-2 items-end gap-6 text-center text-xs">
          {/* Bank Seal / Stamp Stamp */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-red-700 text-red-700 flex flex-col items-center justify-center p-2 transform -rotate-12 shadow-inner select-none">
              <ShieldCheck className="w-5 h-5 text-red-700 mb-0.5" />
              <div className="text-[9px] font-black leading-tight uppercase text-center">
                সহজ লোন সার্ভিসেস
              </div>
              <div className="text-[7.5px] font-bold text-center border-t border-b border-red-700 my-0.5 px-1">
                অফিসিয়াল অনুমোদন শাখা
              </div>
              <div className="text-[8px] font-mono font-bold">
                VERIFIED SEAL
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">
              কর্তৃপক্ষের আনুষ্ঠানিক সিলমোহর
            </p>
          </div>

          {/* Authorized Signature */}
          <div className="flex flex-col items-center">
            <div className="font-serif italic text-base font-bold text-slate-800 tracking-wider mb-1 underline decoration-slate-400">
              M. Rashedul Karim
            </div>
            <div className="w-36 h-0.5 bg-slate-800 mb-1"></div>
            <p className="font-bold text-slate-900 text-xs">
              {letter.managerSignatureTitle.split('\n')[0]}
            </p>
            <p className="text-[10px] text-slate-600">
              {letter.managerSignatureTitle.split('\n')[1] || 'প্রধান ঋণ কর্মকর্তা ও ব্যবস্থাপনা কর্তৃপক্ষ'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              সহজ লোন সার্ভিসেস লিমিটেড
            </p>
          </div>
        </div>

        {/* Document Footer Verification */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>ইলেকট্রনিক্যালি জেনারেটেড সনদপত্র | কোনো কারিগরি স্বাক্ষরের প্রয়োজন নেই</span>
          <span>SECURITY REF: {letter.id.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
