import React from 'react';
import { formatTaka, toBengaliNumber } from '@/services/storage';

export interface AuthenticStampData {
  stampSerialNo?: string;
  documentTitle?: string;
  stampAmount?: number | string;
  customerName: string;
  customerNid?: string;
  applicationDate?: string;
  loanAmount: number | string;
  durationMonths: number | string;
  monthlyEMI: number | string;
  fatherName?: string;
  district?: string;
  customerAddress?: string;
  companyName?: string;
  firstPartySealText?: string;
  firstPartySigText?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  customerPhotoUrl?: string;
  showCustomerPhoto?: boolean;
  showApprovedSeal?: boolean;
  bankSignDate?: string;
  bankSignTitle?: string;
  borrowerSignText?: string;
  borrowerSignatureUrl?: string;
  bottomNotice?: string;
  bottomSlogan?: string;
}

export interface AuthenticStampContractDocumentProps extends Partial<AuthenticStampData> {
  data?: AuthenticStampData;
  className?: string;
  contractNumber?: string;
  issueDate?: string;
  secondPartyBn?: string;
  firstPartyBn?: string;
  contractSubjectBn?: string;
  clausesBn?: string[];
  declarationBn?: string;
  adminSealText?: string;
  authorizedSignatoryTitle?: string;
  signedDate?: string;
  phone?: string;
  nidNumber?: string;
}

export const AuthenticStampContractDocument: React.FC<AuthenticStampContractDocumentProps> = ({
  data,
  className = '',
  ...props
}) => {
  const actualData: AuthenticStampData = data || {
    stampSerialNo: props.stampSerialNo || 'প ৯৪৪৫৯৮৬',
    documentTitle: props.documentTitle || 'ঋণের চুক্তিপত্র',
    stampAmount: props.stampAmount || 100,
    customerName: props.customerName || 'গ্রাহকের নাম',
    customerNid: props.customerNid || props.nidNumber || '১০১১৬০৭২৩৯',
    applicationDate: props.applicationDate || props.issueDate || '১২-১০-২০২৬ ইং',
    loanAmount: props.loanAmount || 200000,
    durationMonths: props.durationMonths || 24,
    monthlyEMI: props.monthlyEMI || 8733,
    fatherName: props.fatherName || 'লুৎফর রহমান',
    district: props.district || 'ঢাকা',
    customerAddress: props.customerAddress,
    companyName: props.companyName || 'DBS Bank SG',
    firstPartySealText: props.firstPartySealText || props.adminSealText || 'DBS Bank SG ★ আইন ও ঋণ চুক্তি বিভাগ ★ প্রধান কার্যালয়',
    firstPartySigText: props.firstPartySigText || props.authorizedSignatoryTitle || 'অথরাইজড লোন অফিসার ও আইন কর্মকর্তা\nDBS Bank SG',
    paragraph1: props.paragraph1,
    paragraph2: props.paragraph2,
    paragraph3: props.paragraph3,
    customerPhotoUrl: props.customerPhotoUrl,
    showCustomerPhoto: props.showCustomerPhoto ?? true,
    showApprovedSeal: props.showApprovedSeal ?? true,
    bankSignDate: props.bankSignDate || props.issueDate,
    bankSignTitle: props.bankSignTitle || 'ব্যাংক কর্তৃপক্ষের স্বাক্ষর (DBS Bank SG)',
    borrowerSignText: props.borrowerSignText || (props.customerName ? props.customerName.split(' ').pop() : 'ঋণ গ্রহীতার স্বাক্ষর'),
    borrowerSignatureUrl: props.borrowerSignatureUrl,
    bottomNotice: props.bottomNotice,
    bottomSlogan: props.bottomSlogan
  };

  const serialNo = actualData.stampSerialNo || 'খষ ৪৫৮১১৯৮';
  const title = actualData.documentTitle || 'ঋণের চুক্তিপত্র';
  const name = actualData.customerName || 'মো: ইয়াসিনুর রহমান';
  const nid = actualData.customerNid || '১০১১৬০৭২৩৯';
  const appDate = actualData.applicationDate || '১২-১০-২০২৬ ইং';
  
  // Format numeric values
  const rawLoanAmount = typeof actualData.loanAmount === 'number' ? actualData.loanAmount : Number(actualData.loanAmount) || 200000;
  const rawDuration = typeof actualData.durationMonths === 'number' ? actualData.durationMonths : Number(actualData.durationMonths) || 24;
  const rawEMI = typeof actualData.monthlyEMI === 'number' ? actualData.monthlyEMI : Number(actualData.monthlyEMI) || 8733;

  const formattedLoanAmount = `${toBengaliNumber(rawLoanAmount.toLocaleString('en-IN'))} টাকা`;
  const formattedDuration = `${toBengaliNumber(rawDuration)} মাস`;
  const formattedEMI = `${toBengaliNumber(rawEMI.toLocaleString('en-IN'))} টাকা`;

  // Stamp Denomination helper
  const rawStampAmount = typeof actualData.stampAmount === 'number' ? actualData.stampAmount : Number(actualData.stampAmount) || 100;
  const getStampInWords = (amt: number): string => {
    if (amt === 100) return 'একশত টাকা';
    if (amt === 200) return 'দুইশত টাকা';
    if (amt === 300) return 'তিনশত টাকা';
    if (amt === 400) return 'চারশত টাকা';
    if (amt === 500) return 'পাঁচশত টাকা';
    return `${toBengaliNumber(amt)} টাকা`;
  };
  const stampWordText = getStampInWords(rawStampAmount);
  const stampNumberText = `৳ ${toBengaliNumber(rawStampAmount)}`;

  const father = actualData.fatherName || 'লুৎফর রহমান';
  const address = actualData.customerAddress || 'বাসা/হোল্ডিং : ১৮৯, বড় মগবাজার হাসনাবাদ এপার্টমেন্ট ছ/৬, ডাকঘরঃ শান্তিনগর - ১২১৭, রমনা, ঢাকা উত্তর সিটি কর্পোরেশন, ঢাকা';
  const company = actualData.companyName || 'DBS Bank SG';

  // Default paragraphs matching Image 2 exactly
  const p1 = actualData.paragraph1 || 
    `আমি মোঃ ${name} , পিতা - ${father} , সাং - ${address}। আমাকে ${company} ${formattedLoanAmount}, ${formattedDuration} মেয়াদি, প্রতিমাসে ${formattedEMI} কিস্তির ঋণ প্রস্তাব করিলে, আমি সকল প্রক্রিয়া সম্পূর্ণ করে ও ${company} এর সকল শর্ত মেনে ঋণটি নিতে রাজি হয়েছি।`;

  const p2 = actualData.paragraph2 || 
    `আপনাকে প্রতিমাসে ১ থেকে ১০ তারিখের মধ্যে অনলাইনের মাধ্যমে কিস্তি প্রদান করতে হবে, কোনো মাসে দিতে সমস্যা হলে অবশ্যই আগে জানাতে হবে। ব্যাংক কর্তৃপক্ষ যেসব প্রক্রিয়ার কথা বলেছেন ওই সব প্রক্রিয়া অবশ্যই সম্পূর্ণ করতে হবে।`;

  const p3 = actualData.paragraph3 || 
    `আমি ব্যাংক কর্তৃপক্ষ সাক্ষ্য দিচ্ছি যে মোঃ ${name} এর দেওয়া তথ্যের উপর ভিত্তি করে ও তার আর্থিক অবস্থা এবং ঋণের যোগ্যতা যাচাই করে, আমার আত্মবিশ্বাস যে তিনি আমাদের দেওয়া সকল শর্ত ও নিয়মাবলী পূরণ করতে পারবে।`;

  const bankTitle = actualData.bankSignTitle || 'ব্যাংক কর্তৃপক্ষের স্বাক্ষর (DBS Bank SG)';
  const borrowerSignature = actualData.borrowerSignText || 'ঋণ গ্রহীতার স্বাক্ষর';
  const bottomNotice = actualData.bottomNotice || 'বিঃদ্রঃ ঋণের শর্তাবলী পালন না করলে ব্যাংক কর্তৃপক্ষ আইনানুগ ব্যবস্থা নিতে বাধ্য থাকিবে।';
  const bottomSlogan = actualData.bottomSlogan || '“দেশপ্রেমের শপথ নিন, দুর্নীতিকে বিদায় দিন”';

  return (
    <div 
      className={`w-full max-w-2xl mx-auto p-6 sm:p-9 rounded-sm shadow-xl text-slate-900 border border-amber-900/20 relative select-none ${className}`}
      style={{
        backgroundColor: '#fbf7ee',
        backgroundImage: 'radial-gradient(#e8dfca 0.75px, transparent 0.75px), radial-gradient(#faf3e0 0.75px, #fbf7ee 0.75px)',
        backgroundSize: '24px 24px',
        fontFamily: "'Noto Serif Bengali', 'SolaimanLipi', serif, sans-serif"
      }}
    >
      {/* ========================================================= */}
      {/* 1. TOP GREEN 100 TK NON-JUDICIAL STAMP HEADER (IMAGE 2)   */}
      {/* ========================================================= */}
      <div className="w-full relative rounded-md border-4 border-[#1f5e3b] p-2 bg-[#f4fbf6] shadow-sm overflow-hidden mb-6">
        {/* Intricate Guilloche Green Background Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `repeating-radial-gradient(circle at 50% 50%, #1f5e3b 0, #1f5e3b 1px, transparent 1px, transparent 6px)`
          }}
        />

        {/* Outer Fine Double Border */}
        <div className="relative border-2 border-dashed border-[#1f5e3b] p-2.5 rounded flex flex-col items-center">
          
          {/* Top Curved / Boxed Ribbon: গণপ্রজাতন্ত্রী বাংলাদেশ সরকার */}
          <div className="relative z-10 -mt-1 mb-2 px-8 py-1 rounded-full border-2 border-[#1f5e3b] bg-white shadow-xs">
            <h1 className="text-base sm:text-lg md:text-xl font-black text-[#174d30] tracking-wide font-serif text-center">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </h1>
          </div>

          {/* Middle Row: Left Rosette (৳ ১০০) | National Emblem (Shapla) | Right Rosette (৳ ১০০) */}
          <div className="w-full grid grid-cols-3 items-center my-1 relative z-10 px-1 sm:px-4">
            
            {/* Left Guilloche Rosette: Dynamic Stamp Amount */}
            <div className="flex justify-start sm:justify-center">
              <div className="relative w-24 sm:w-28 h-14 sm:h-16 rounded-full border-2 border-[#1f5e3b] bg-emerald-50/80 flex items-center justify-center shadow-inner overflow-hidden">
                {/* Guilloche scalloped radial SVG backdrop */}
                <svg className="absolute inset-0 w-full h-full text-[#1f5e3b] opacity-25" viewBox="0 0 100 60">
                  <ellipse cx="50" cy="30" rx="46" ry="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <ellipse cx="50" cy="30" rx="34" ry="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>
                <span className="text-xl sm:text-2xl font-black text-[#174d30] font-serif tracking-tight z-10">
                  {stampNumberText}
                </span>
              </div>
            </div>

            {/* Center Oval: Official Bangladesh National Emblem */}
            <div className="flex justify-center">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full border-2 border-[#1f5e3b] bg-white p-1 shadow-sm flex items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#174d30]">
                  {/* Outer circle with dots */}
                  <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 1.5" />
                  <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="1" />
                  
                  {/* Top 4 Stars */}
                  <g fill="currentColor" transform="translate(0, -2)">
                    <circle cx="38" cy="18" r="2" />
                    <circle cx="45" cy="14" r="2.2" />
                    <circle cx="55" cy="14" r="2.2" />
                    <circle cx="62" cy="18" r="2" />
                  </g>

                  {/* Top 3 Jute Leaves */}
                  <path d="M50 16 C 46 22 47 28 50 32 C 53 28 54 22 50 16 Z" fill="currentColor" />
                  <path d="M42 22 C 40 27 44 32 48 34 C 47 29 44 25 42 22 Z" fill="currentColor" />
                  <path d="M58 22 C 60 27 56 32 52 34 C 53 29 56 25 58 22 Z" fill="currentColor" />

                  {/* Water Lily (Shapla) Flower */}
                  <path d="M50 35 C 44 45 46 54 50 60 C 54 54 56 45 50 35 Z" fill="currentColor" />
                  <path d="M41 42 C 36 50 42 58 48 61 C 46 53 42 47 41 42 Z" fill="currentColor" />
                  <path d="M59 42 C 64 50 58 58 52 61 C 54 53 58 47 59 42 Z" fill="currentColor" />
                  <path d="M33 50 C 31 57 39 63 46 63 C 41 57 36 53 33 50 Z" fill="currentColor" />
                  <path d="M67 50 C 69 57 61 63 54 63 C 59 57 64 53 67 50 Z" fill="currentColor" />

                  {/* Water Ripples underneath */}
                  <path d="M26 66 Q 38 63 50 66 Q 62 69 74 66" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M30 71 Q 40 68 50 71 Q 60 74 70 71" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M36 76 Q 43 74 50 76 Q 57 78 64 76" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Side Rice Sheaves (Wreath) */}
                  <path d="M20 70 C 14 54 20 36 28 26" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M80 70 C 86 54 80 36 72 26" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="20" cy="58" r="1.8" fill="currentColor" />
                  <circle cx="18" cy="50" r="1.8" fill="currentColor" />
                  <circle cx="19" cy="42" r="1.8" fill="currentColor" />
                  <circle cx="22" cy="34" r="1.8" fill="currentColor" />
                  <circle cx="80" cy="58" r="1.8" fill="currentColor" />
                  <circle cx="82" cy="50" r="1.8" fill="currentColor" />
                  <circle cx="81" cy="42" r="1.8" fill="currentColor" />
                  <circle cx="78" cy="34" r="1.8" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Right Guilloche Rosette: Dynamic Stamp Amount */}
            <div className="flex justify-end sm:justify-center">
              <div className="relative w-24 sm:w-28 h-14 sm:h-16 rounded-full border-2 border-[#1f5e3b] bg-emerald-50/80 flex items-center justify-center shadow-inner overflow-hidden">
                <svg className="absolute inset-0 w-full h-full text-[#1f5e3b] opacity-25" viewBox="0 0 100 60">
                  <ellipse cx="50" cy="30" rx="46" ry="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <ellipse cx="50" cy="30" rx="34" ry="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>
                <span className="text-xl sm:text-2xl font-black text-[#174d30] font-serif tracking-tight z-10">
                  {stampNumberText}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Banner Ribbon: Dynamic Words */}
          <div className="relative z-10 mt-1 px-8 py-0.5 rounded-full border border-[#1f5e3b] bg-[#e6f4ec] text-[#174d30] font-black text-xs sm:text-sm tracking-wider font-serif shadow-xs">
            {stampWordText}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SERIAL NO (LEFT) & TITLE (CENTER) & PHOTO BOX (RIGHT)   */}
      {/* ========================================================= */}
      <div className="relative w-full mb-5">
        <div className="flex items-start justify-between">
          
          {/* Stamp Serial on Left */}
          <div className="text-left pt-1">
            <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-wider">
              {serialNo}
            </span>
          </div>

          {/* Document Title Centered */}
          <div className="flex-1 text-center px-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 inline-block border-b-2 border-slate-900 pb-1 px-3">
              {title}
            </h2>
          </div>

          {/* Customer Passport Photo & APPROVED Stamp on Right */}
          <div className="relative shrink-0 w-24 sm:w-28 h-28 sm:h-32 -mt-2">
            <div className="w-full h-full rounded border-2 border-slate-800 p-0.5 bg-white shadow-md overflow-hidden relative">
              {actualData.customerPhotoUrl ? (
                <img 
                  src={actualData.customerPhotoUrl} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-1">
                  <div className="w-10 h-10 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center mb-1 text-slate-500 font-bold text-xs">
                    ছবি
                  </div>
                  <span className="text-[9px] text-center font-sans">পাসপোর্ট ছবি</span>
                </div>
              )}

              {/* Red Rectangular LOAN APPROVED Stamp Overlay (Exact Image 2 style) */}
              {(actualData.showApprovedSeal !== false) && (
                <div 
                  className="absolute -bottom-1 -right-3 px-2 py-0.5 border-2 border-red-600 bg-red-100/40 text-red-600 flex items-center justify-center rotate-[-10deg] pointer-events-none shadow-xs select-none"
                >
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-red-600 uppercase font-mono">
                    LOAN APPROVED
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BORROWER DETAILS GRID (LEFT COLUMN, 6 KEY-VALUES)       */}
      {/* ========================================================= */}
      <div className="w-full sm:w-3/4 space-y-1.5 text-xs sm:text-sm font-medium mb-6">
        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">ঋণ গ্রহীতার নাম</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950">{name}</span>
        </div>

        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">এনআইডি নম্বর</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950 font-mono tracking-wide">{nid}</span>
        </div>

        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">আবেদনের তারিখ</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950 font-mono">{appDate}</span>
        </div>

        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">ঋণের পরিমাণ</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950">{formattedLoanAmount}</span>
        </div>

        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">ঋণের মেয়াদ</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950">{formattedDuration}</span>
        </div>

        <div className="flex items-center">
          <span className="w-32 sm:w-40 font-bold text-slate-900 shrink-0">মাসিক কিস্তি</span>
          <span className="mr-2 font-bold">:</span>
          <span className="font-bold text-slate-950">{formattedEMI}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. SECTION HEADER: গুরুত্বপূর্ণ তথ্য ও শর্তাবলী             */}
      {/* ========================================================= */}
      <div className="text-center my-5">
        <h3 className="text-sm sm:text-base font-bold text-slate-950 inline-block">
          গুরুত্বপূর্ণ তথ্য ও শর্তাবলী
        </h3>
      </div>

      {/* ========================================================= */}
      {/* 5. THREE LEGAL CLAUSES / TERMS PARAGRAPHS (IMAGE 2 EXACT) */}
      {/* ========================================================= */}
      <div className="space-y-4 text-xs sm:text-[13px] leading-relaxed text-justify text-slate-900 mb-8 font-normal">
        <p className="leading-relaxed">
          {p1}
        </p>

        <p className="leading-relaxed">
          {p2}
        </p>

        <p className="leading-relaxed">
          {p3}
        </p>
      </div>

      {/* ========================================================= */}
      {/* 6. BOTTOM SIGNATURES SECTION                               */}
      {/* ========================================================= */}
      <div className="pt-4 grid grid-cols-2 gap-4 items-end">
        {/* Left: Bank Authority Signature & DBS Bank SG Official Seal */}
        <div className="text-left space-y-1 relative">
          {/* DBS Bank SG Official Circular Seal */}
          <div className="absolute -top-12 left-12 sm:left-20 w-24 h-24 rounded-full border-2 border-dashed border-indigo-700/60 bg-indigo-50/25 text-indigo-900 flex flex-col items-center justify-center p-1 pointer-events-none select-none rotate-[-6deg] shadow-xs">
            <div className="w-full h-full rounded-full border border-indigo-700/50 flex flex-col items-center justify-center p-1 text-center">
              <span className="text-[7.5px] font-black uppercase tracking-wider text-indigo-950 leading-none">DBS BANK SG</span>
              <span className="text-[6.5px] text-indigo-700 my-0.5 font-bold">★ OFFICIAL SEAL ★</span>
              <span className="text-[7px] font-bold text-indigo-950 leading-tight">আইন ও ঋণ বিভাগ</span>
            </div>
          </div>

          <div className="h-10 flex items-end justify-start pl-2 relative z-10">
            <div className="font-serif italic text-base sm:text-lg text-slate-800 tracking-tight font-bold select-none rotate-[-4deg]">
              {actualData.firstPartySigText || 'DBS.Officer'}
            </div>
          </div>
          <div className="w-36 sm:w-44 border-b-2 border-slate-900" />
          <p className="text-xs sm:text-sm font-bold text-slate-900 pt-0.5">
            {bankTitle}
          </p>
          {actualData.firstPartySealText && (
            <p className="text-[10px] text-slate-600 font-medium line-clamp-1">
              {actualData.firstPartySealText}
            </p>
          )}
        </div>

        {/* Right: Borrower Signature */}
        <div className="text-right space-y-1 flex flex-col items-end">
          <div className="h-10 flex items-end justify-end pr-3">
            {actualData.borrowerSignatureUrl ? (
              <img src={actualData.borrowerSignatureUrl} alt="Signature" className="h-8 max-w-[120px] object-contain" />
            ) : (
              <span 
                className="text-base sm:text-lg font-bold text-slate-900 select-none tracking-wider"
                style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive, serif" }}
              >
                {borrowerSignature}
              </span>
            )}
          </div>
          <div className="w-36 sm:w-44 border-b-2 border-slate-900" />
          <p className="text-xs sm:text-sm font-bold text-slate-900 pt-0.5 pr-2">
            ঋণ গ্রহীতার স্বাক্ষর
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. BOTTOM DISCLAIMER & SLOGAN (IMAGE 2 EXACT)             */}
      {/* ========================================================= */}
      <div className="pt-6 text-center space-y-1 select-none">
        <p className="text-[11px] sm:text-xs font-medium text-slate-800">
          {bottomNotice}
        </p>
        <p className="text-xs sm:text-sm font-black text-[#1f5e3b] tracking-wide font-serif">
          {bottomSlogan}
        </p>
      </div>
    </div>
  );
};
