import React, { useRef } from "react";
import { Phone, Mail, MapPin, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export interface CorporateVisitingCardProps {
  staffNameBn?: string;
  staffNameEn?: string;
  designationBn?: string;
  designationEn?: string;
  departmentBn?: string;
  phone: string;
  phone2?: string;
  whatsapp?: string;
  email: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  branchAddress?: string;
  companyNameBn?: string;
  companyNameEn?: string;
  companySubtitle?: string;
  logoUrl?: string;
  photoUrl?: string;
  licenseNo?: string;
  theme?: "red_navy" | "navy" | "emerald" | "burgundy" | "slate";
  side?: "front" | "back" | "both";
  scale?: number;
  showControls?: boolean;
}

export const CorporateVisitingCard: React.FC<CorporateVisitingCardProps> = ({
  staffNameBn = "তাহমিদ হাসান",
  staffNameEn = "JOHN SMITH",
  designationBn = "সিনিয়র লোন অফিসার",
  designationEn = "CREATIVE DIRECTOR",
  departmentBn = "Credit & SME Operations",
  phone = "+0 123 456 789 324",
  phone2 = "+0 987 675 789 123",
  whatsapp,
  email = "J.SMITH@YOURCOMPANY.COM",
  website = "WWW.YOURCOMPANY.COM",
  addressLine1 = "YOUR FIRST ADDRESS LINE",
  addressLine2 = "SECOND ADDRESS LINE",
  branchAddress,
  companyNameBn = "DBS BANK SG",
  companyNameEn = "COMPANY",
  companySubtitle = "LOGO HERE",
  logoUrl,
  photoUrl,
  licenseNo = "MRA/REG-2019/BB-8924",
  theme = "red_navy",
  side = "both",
  scale = 1,
  showControls = true
}) => {
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  // Normalize address lines
  const finalAddr1 = addressLine1 || (branchAddress ? branchAddress.split(",")[0] : "YOUR FIRST ADDRESS LINE");
  const finalAddr2 = addressLine2 || (branchAddress ? branchAddress.split(",").slice(1).join(",") : "SECOND ADDRESS LINE");

  const handleDownloadImage = async () => {
    if (!cardContainerRef.current) return;
    try {
      toast.info("ভিজিটিং কার্ডের হাই-রেজ্যুলুশন ইমেজ প্রস্তুত হচ্ছে...");
      const canvas = await html2canvas(cardContainerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const downloadName = (staffNameEn || staffNameBn || "Visiting-Card").replace(/\s+/g, "-");
      a.download = `Corporate-Card-${downloadName}.png`;
      a.click();
      toast.success("ভিজিটিং কার্ড ইমেজ সফলভাবে ডাউনলোড হয়েছে!");
    } catch (err) {
      console.error("Card export error:", err);
      toast.error("ইমেজ ডাউনলোডে সমস্যা হয়েছে। সরাসরি প্রিন্ট বাটন ব্যবহার করুন।");
    }
  };

  // QR Code URL based on employee details
  const qrData = encodeURIComponent(
    `OFFICIAL VISITING CARD\nName: ${staffNameEn || staffNameBn}\nDesignation: ${designationEn || designationBn}\nPhone: ${phone}\nEmail: ${email}\nWebsite: ${website}\nAddress: ${finalAddr1}, ${finalAddr2}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Control bar */}
      {showControls && (
        <div className="flex items-center gap-2 flex-wrap justify-center print:hidden">
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadImage}
            className="h-8 text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ইমেজ ডাউনলোড (PNG)</span>
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

      {/* Cards Display Container */}
      <div
        ref={cardContainerRef}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: "top center" }}
        className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700 max-w-full overflow-x-auto print:bg-white print:border-none print:p-0 shadow-2xl"
      >
        {/* FRONT SIDE - Modern Red & Navy (Image 4 Style) */}
        {(side === "front" || side === "both") && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider print:hidden flex items-center gap-1">
              <span>সামনের পিঠ (Front Side)</span>
              <span className="text-red-400 font-normal">• রেড-নেভি স্টাইল</span>
            </span>

            {/* Exact Card Dimension: 480px x 270px (16:9 business card standard) */}
            <div className="relative w-[480px] h-[270px] rounded-2xl overflow-hidden shadow-2xl bg-[#d41a27] text-white select-none shrink-0 border border-red-700/60">
              {/* Textured Dotted Grid Background */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)",
                  backgroundSize: "14px 14px"
                }}
              />

              {/* Radial Center Glow */}
              <div className="absolute inset-0 bg-radial from-red-500/30 via-transparent to-red-950/40 pointer-events-none" />

              {/* Top-Left Diagonal Navy Ribbon with crisp white borders */}
              <div className="absolute -top-16 -left-16 w-52 h-44 pointer-events-none z-10">
                <div
                  className="w-56 h-32 bg-[#1b193d] border-b-[6px] border-white shadow-xl flex items-center justify-center"
                  style={{ transform: "rotate(-42deg)", transformOrigin: "center" }}
                />
              </div>

              {/* Bottom-Right Diagonal Navy Ribbon with white border & website */}
              <div className="absolute -bottom-20 -right-20 w-64 h-52 pointer-events-none z-10">
                <div
                  className="w-72 h-36 bg-[#1b193d] border-t-[6px] border-white shadow-xl flex items-end justify-center pb-4"
                  style={{ transform: "rotate(-42deg)", transformOrigin: "center" }}
                >
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/95 uppercase drop-shadow-sm select-all">
                    {website}
                  </span>
                </div>
              </div>

              {/* Center Company Logo & Branding */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center p-6">
                {/* Logo circular badge */}
                <div className="w-18 h-18 rounded-full bg-white flex items-center justify-center shadow-2xl p-2.5 mb-3 border-2 border-red-200">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={companyNameEn || "Logo"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1b193d] text-white flex items-center justify-center shadow-inner">
                      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <h1 className="text-2xl font-black text-white tracking-[0.25em] uppercase font-sans drop-shadow-md leading-tight">
                  {companyNameEn}
                </h1>

                {/* Subtitle / Tagline */}
                <p className="text-[11px] font-bold text-white/90 tracking-[0.35em] uppercase font-mono mt-1 drop-shadow-sm">
                  {companySubtitle}
                </p>

                {companyNameBn && companyNameBn !== companyNameEn && (
                  <span className="text-[10px] font-bold text-red-100 tracking-wider mt-1 opacity-90">
                    {companyNameBn}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BACK SIDE - Modern Red-White Split (Image 4 Style) */}
        {(side === "back" || side === "both") && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider print:hidden flex items-center gap-1">
              <span>পেছনের পিঠ (Back Side)</span>
              <span className="text-red-400 font-normal">• কন্টাক্ট ও কিউআর কোড</span>
            </span>

            {/* Exact Card Dimension: 480px x 270px */}
            <div className="relative w-[480px] h-[270px] rounded-2xl overflow-hidden shadow-2xl bg-white text-slate-900 select-none shrink-0 border border-slate-300 flex flex-col">
              {/* TOP HEADER: 40% Rich Red background with dotted micro-pattern */}
              <div className="relative h-[105px] bg-[#d41a27] text-white px-7 flex flex-col justify-center shrink-0 overflow-hidden shadow-md">
                {/* Dotted texture */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)",
                    backgroundSize: "12px 12px"
                  }}
                />

                <div className="relative z-10">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wider font-sans drop-shadow-sm leading-tight">
                    {staffNameEn || staffNameBn}
                  </h2>
                  <p className="text-[11px] font-bold text-white/95 uppercase tracking-[0.25em] font-mono mt-1">
                    {designationEn || designationBn}
                  </p>
                  {staffNameBn && staffNameBn !== staffNameEn && (
                    <span className="text-[10px] text-red-100 font-semibold mt-0.5 block">
                      {staffNameBn} ({designationBn})
                    </span>
                  )}
                </div>
              </div>

              {/* BOTTOM SECTION: 60% Clean White Contact Grid & Framed QR Code */}
              <div className="flex-1 bg-white px-6 py-4 flex items-center justify-between gap-4">
                {/* Left Side: 3 Circular Red Badges for Contact info */}
                <div className="space-y-2.5 flex-1 min-w-0 pr-2">
                  {/* Address row */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#d41a27] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10px] leading-tight font-sans text-slate-800">
                      <span className="font-bold block text-slate-950 uppercase tracking-tight line-clamp-1">
                        {finalAddr1}
                      </span>
                      <span className="text-slate-600 font-medium block uppercase tracking-tight line-clamp-1">
                        {finalAddr2}
                      </span>
                    </div>
                  </div>

                  {/* Email row */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#d41a27] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-800 truncate uppercase tracking-tight">
                      {email}
                    </div>
                  </div>

                  {/* Phone row */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#d41a27] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10px] font-mono font-bold leading-tight text-slate-900">
                      <div>{phone}</div>
                      {phone2 && <div className="text-slate-700">{phone2}</div>}
                    </div>
                  </div>
                </div>

                {/* Right Side: Framed QR Code with Red Accent Border */}
                <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-200 shrink-0">
                  <div className="w-24 h-24 p-1.5 bg-white border-2 border-[#d41a27] rounded-lg shadow-sm flex items-center justify-center">
                    <img
                      src={qrUrl}
                      alt="Contact QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mt-1">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
