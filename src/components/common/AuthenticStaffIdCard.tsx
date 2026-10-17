import React, { useRef } from "react";
import { Printer, Download, Phone, MapPin, Globe, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export interface AuthenticStaffIdCardProps {
  staffNameBn: string;
  staffNameEn?: string;
  designationBn: string;
  designationEn?: string;
  departmentBn?: string;
  staffIdNumber: string;
  bloodGroup?: string;
  issueDate?: string;
  expiryDate?: string;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  branchAddress?: string;
  companyNameBn: string;
  companyNameEn?: string;
  photoUrl?: string;
  signatureText?: string;
  signatureUrl?: string;
  enterpriseName?: string;
  subBadgeText?: string;
  licenceNo?: string;
  side?: "front" | "back" | "both";
  scale?: number;
  showControls?: boolean;
}

export const AuthenticStaffIdCard: React.FC<AuthenticStaffIdCardProps> = ({
  staffNameBn,
  staffNameEn = "MD. Abdur Rahim",
  designationBn,
  designationEn = "Agent Officer",
  departmentBn = "Agent Banking Division",
  staffIdNumber = "203376183",
  bloodGroup = "O+",
  issueDate = "2023-01-01",
  expiryDate = "2028-12-31",
  phone = "01790-335133",
  emergencyPhone = "01790-335133",
  email = "agent.banking@bdloan.world",
  branchAddress = "প্রধান শাখা, দিলকুশা বাণিজ্যিক এলাকা, মতিঝিল, ঢাকা-১০০০",
  companyNameBn,
  companyNameEn = "Dutch-Bangla Bank Ltd",
  photoUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  signatureText = "Rani",
  signatureUrl,
  enterpriseName = "Thanovi Enterprise",
  subBadgeText = "Agent Banking",
  licenceNo = "4216",
  side = "both",
  scale = 1,
  showControls = true
}) => {
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadImage = async () => {
    if (!cardContainerRef.current) return;
    try {
      toast.info("স্টাফ আইডি কার্ডের হাই-রেজ্যুলুশন ইমেজ প্রস্তুত হচ্ছে...");
      const canvas = await html2canvas(cardContainerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Staff-ID-${staffIdNumber}-${(staffNameEn || staffNameBn).replace(/\s+/g, "-")}.png`;
      a.click();
      toast.success("স্টাফ আইডি কার্ড ইমেজ সফলভাবে ডাউনলোড হয়েছে!");
    } catch (err) {
      console.error("ID Card export error:", err);
      toast.error("ইমেজ ডাউনলোডে সমস্যা হয়েছে। সরাসরি প্রিন্ট বাটন ব্যবহার করুন।");
    }
  };

  const displayName = staffNameEn || staffNameBn || "MD. Abdur Rahim";
  const displayDesignation = designationEn || designationBn || "Agent Officer";
  const displayCompany = companyNameEn || companyNameBn || "Dutch-Bangla Bank Ltd";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-2 flex-wrap justify-center print:hidden">
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadImage}
            className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>আইডি কার্ড ডাউনলোড (PNG)</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="h-8 text-xs font-bold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট করুন</span>
          </Button>
        </div>
      )}

      {/* Cards Render Container */}
      <div
        ref={cardContainerRef}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: "top center" }}
        className="flex flex-col sm:flex-row items-center justify-center gap-8 p-6 bg-slate-100/70 rounded-2xl border border-slate-200 max-w-full overflow-x-auto print:bg-white print:border-none print:p-0"
      >
        {/* FRONT SIDE (Exact Dutch-Bangla Agent Banking Real ID Card Style - Image 4) */}
        {(side === "front" || side === "both") && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider print:hidden">
              সামনের পিঠ (Front Side)
            </span>
            <div className="relative w-[340px] h-[550px] rounded-2xl bg-white text-slate-900 shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col justify-between shrink-0 select-none font-sans">
              
              {/* TOP SECTION */}
              <div className="pt-3 px-4 flex flex-col items-center">
                {/* 1. Red Pill "ID Card" Badge */}
                <div className="bg-[#e60000] text-white px-5 py-0.5 rounded-full text-xs font-black tracking-wide shadow-xs mb-2">
                  ID Card
                </div>

                {/* 2. Logo & Bank Header */}
                <div className="flex items-center justify-center gap-2.5 w-full">
                  {/* Multi-color circular swoosh emblem logo */}
                  <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                      {/* Outer glossy circle */}
                      <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      {/* Blue swoosh */}
                      <path d="M 20 65 Q 40 20 80 35 Q 50 35 30 75 Z" fill="#002b80" />
                      {/* Red swoosh */}
                      <path d="M 25 70 Q 50 25 85 45 Q 60 45 40 80 Z" fill="#e60000" />
                      {/* Green swoosh */}
                      <path d="M 32 75 Q 60 30 88 55 Q 70 55 50 85 Z" fill="#009944" />
                    </svg>
                  </div>

                  {/* Bank Name & Agent Banking */}
                  <div className="text-left flex-1 min-w-0">
                    <h2 className="text-[18px] font-black tracking-tight text-slate-950 font-serif leading-none truncate">
                      {displayCompany}
                    </h2>
                    <p className="text-[12.5px] font-bold text-[#e60000] tracking-tight leading-tight mt-0.5">
                      {subBadgeText}
                    </p>
                  </div>
                </div>

                {/* 3. Officer Portrait Photo Container (Cyan Rounded Box) */}
                <div className="mt-3 relative w-36 h-40 rounded-2xl bg-[#00a2d3] p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* 4. Officer Name & Titles */}
                <div className="text-center mt-3 w-full px-2">
                  <h3 className="text-[18px] font-black text-slate-950 font-serif leading-snug tracking-tight">
                    {displayName}
                  </h3>
                  <p className="text-[14px] font-black text-[#002b80] font-serif leading-tight mt-0.5">
                    {displayDesignation}
                  </p>
                  <p className="text-[14px] font-black text-slate-950 leading-tight mt-0.5">
                    {displayCompany}
                  </p>
                  <p className="text-[11.5px] font-bold text-[#e60000] leading-tight">
                    {subBadgeText}
                  </p>
                  {enterpriseName && (
                    <p className="text-[12.5px] font-bold text-[#007b8f] tracking-wide mt-1">
                      {enterpriseName}
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Key-Value Info List (Clean Colons Alignment) */}
              <div className="px-7 py-1 text-[13px] font-bold text-slate-950 space-y-0.5 font-sans">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5 text-slate-900 font-semibold">Licence No</span>
                  <span className="col-span-1 text-center font-bold">:</span>
                  <span className="col-span-6 font-bold">{licenceNo}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5 text-slate-900 font-semibold">Blood Group</span>
                  <span className="col-span-1 text-center font-bold">:</span>
                  <span className="col-span-6 font-bold text-red-600">{bloodGroup}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5 text-slate-900 font-semibold">ID No</span>
                  <span className="col-span-1 text-center font-bold">:</span>
                  <span className="col-span-6 font-mono font-bold">{staffIdNumber}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5 text-slate-900 font-semibold">Call</span>
                  <span className="col-span-1 text-center font-bold">:</span>
                  <span className="col-span-6 font-mono font-bold">{phone}</span>
                </div>
              </div>

              {/* 6. Signature Area */}
              <div className="px-7 pb-2 pt-1 flex justify-end items-end">
                <div className="text-center min-w-[110px]">
                  {signatureUrl ? (
                    <img src={signatureUrl} alt="Signature" className="h-6 mx-auto object-contain mb-0.5" />
                  ) : (
                    <div className="text-[16px] font-serif italic text-slate-900 font-bold tracking-wider -mb-1 select-none transform -rotate-2">
                      {signatureText}
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-0.5 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-900 block leading-tight">
                      Authorised Sign
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Bottom Horizontal Tricolor Bar (Navy Blue | Red | Green) */}
              <div className="w-full h-5 flex shrink-0">
                <div className="w-1/3 h-full bg-[#001a70]" />
                <div className="w-1/3 h-full bg-[#e60000]" />
                <div className="w-1/3 h-full bg-[#009944]" />
              </div>

            </div>
          </div>
        )}

        {/* BACK SIDE (Professional Terms & Emergency Info) */}
        {(side === "back" || side === "both") && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider print:hidden">
              পেছনের পিঠ (Back Side)
            </span>
            <div className="relative w-[340px] h-[550px] rounded-2xl bg-white text-slate-900 shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col justify-between shrink-0 select-none font-sans">
              
              {/* Top Banner */}
              <div className="pt-4 px-5 text-center bg-slate-50 border-b pb-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-[#001a70] text-white flex items-center justify-center font-black text-xs">
                    {displayCompany.slice(0, 1)}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 font-serif">
                    {displayCompany}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  OFFICIAL IDENTITY CARD
                </p>
              </div>

              {/* Terms and Instructions */}
              <div className="px-5 py-2 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 space-y-1.5 leading-relaxed">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-amber-800 border-b pb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>জরুরি নির্দেশনাবলী</span>
                  </div>
                  <p>১. এই কার্ডটি সংশ্লিষ্ট কর্তৃপক্ষের সম্পত্তি। দায়িত্ব পালনকালে কার্ডটি দৃশ্যমান রাখা আবশ্যক।</p>
                  <p>২. কার্ডটি সম্পূর্ণ অ-হস্তান্তরযোগ্য। যেকোনো অপব্যবহার আইনত দণ্ডনীয় অপরাধ।</p>
                  <p>৩. কার্ড হারিয়ে গেলে দ্রুত কর্তৃপক্ষ ও নিকটস্থ থানায় অবহিত করুন।</p>
                </div>

                {/* Emergency Contact */}
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-[#001a70] font-bold text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#001a70]" />
                    <span>জরুরি যোগাযোগ / হেল্পলাইন:</span>
                  </div>
                  <div className="font-mono font-black text-[#001a70] text-xs mt-0.5 pl-5">
                    {emergencyPhone}
                  </div>
                </div>

                {/* Address & Web */}
                <div className="space-y-1 text-[10px] text-slate-600 px-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    <span>{branchAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>www.bdloan.world • support@bdloan.world</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Return Note */}
              <div className="px-5 pb-3 flex flex-col items-center">
                <div className="flex items-end justify-center h-9 w-48 gap-[2px] bg-white p-1 border border-slate-300 rounded-xs">
                  {Array.from({ length: 38 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full bg-slate-900 ${
                        i % 5 === 0 ? "w-1" : i % 3 === 0 ? "w-0.5" : "w-[1px]"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] tracking-widest text-slate-700 font-bold mt-1">
                  *{staffIdNumber.replace(/[^0-9A-Z]/gi, "")}*
                </span>
                <span className="text-[8px] text-slate-400 mt-0.5 text-center">
                  কার্ডটি পাওয়া গেলে নিকটস্থ ডাকবাক্স বা শাখায় জমা দিন
                </span>
              </div>

              {/* Bottom Tricolor Bar */}
              <div className="w-full h-5 flex shrink-0">
                <div className="w-1/3 h-full bg-[#001a70]" />
                <div className="w-1/3 h-full bg-[#e60000]" />
                <div className="w-1/3 h-full bg-[#009944]" />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
