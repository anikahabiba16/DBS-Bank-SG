import React from "react";
import { StaffIdCard } from "@/types/loan";

export const BangladeshGovtSeal: React.FC<{ className?: string; size?: number }> = ({
  className = "w-14 h-14",
  size = 56
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer green ring */}
      <circle cx="100" cy="100" r="96" fill="#0b6e39" stroke="#044d24" strokeWidth="4" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff" strokeWidth="2" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#ffffff" strokeWidth="2" />

      {/* Circular text along path */}
      <defs>
        {/* Top curved path for Bengali text */}
        <path
          id="sealTopPath"
          d="M 30,100 A 70,70 0 1,1 170,100"
          fill="none"
        />
        {/* Bottom curved path */}
        <path
          id="sealBottomPath"
          d="M 170,100 A 70,70 0 0,1 30,100"
          fill="none"
        />
      </defs>

      <text fill="#ffffff" fontSize="17" fontWeight="bold" letterSpacing="2">
        <textPath href="#sealTopPath" startOffset="50%" textAnchor="middle">
          গণপ্রজাতন্ত্রী বাংলাদেশ
        </textPath>
      </text>

      <text fill="#ffffff" fontSize="17" fontWeight="bold" letterSpacing="4">
        <textPath href="#sealBottomPath" startOffset="50%" textAnchor="middle">
          সরকার
        </textPath>
      </text>

      {/* 4 Red Stars: 2 on left, 2 on right */}
      {/* Left stars */}
      <polygon points="25,92 28,100 21,95 30,95 23,100" fill="#dc2626" stroke="#ffffff" strokeWidth="0.5" />
      <polygon points="37,80 40,88 33,83 42,83 35,88" fill="#dc2626" stroke="#ffffff" strokeWidth="0.5" />
      {/* Right stars */}
      <polygon points="175,92 178,100 171,95 180,95 173,100" fill="#dc2626" stroke="#ffffff" strokeWidth="0.5" />
      <polygon points="163,80 166,88 159,83 168,83 161,88" fill="#dc2626" stroke="#ffffff" strokeWidth="0.5" />

      {/* Inner Red Disc */}
      <circle cx="100" cy="100" r="62" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />

      {/* Bangladesh Map Silhouette in Yellow/Gold */}
      <path
        d="M 98,54 
           C 104,55 110,58 112,62 
           C 114,66 110,70 115,74 
           C 120,78 126,76 128,82 
           C 130,88 125,94 127,100 
           C 129,106 135,110 134,116 
           C 133,122 124,124 122,130 
           C 120,136 116,144 110,146 
           C 104,148 100,140 96,144 
           C 92,148 88,146 84,140 
           C 80,134 85,128 82,122 
           C 79,116 72,114 74,106 
           C 76,98 84,96 82,88 
           C 80,80 84,72 88,66 
           C 92,60 94,54 98,54 Z"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const NationalEmblemWatermark: React.FC<{ className?: string }> = ({
  className = "w-64 h-64 text-yellow-500/35"
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Golden Water Lily (Shapla) Center Motif */}
      <g transform="translate(100, 100) scale(0.95) translate(-100, -100)">
        {/* Center Petal */}
        <path d="M 100,45 C 93,65 92,85 100,105 C 108,85 107,65 100,45 Z" />
        {/* Inner Left Petal */}
        <path d="M 100,105 C 88,85 76,75 70,60 C 82,75 92,92 100,105 Z" />
        {/* Inner Right Petal */}
        <path d="M 100,105 C 112,85 124,75 130,60 C 118,75 108,92 100,105 Z" />
        {/* Outer Left Petal */}
        <path d="M 100,105 C 78,92 62,88 50,80 C 65,92 82,100 100,105 Z" />
        {/* Outer Right Petal */}
        <path d="M 100,105 C 122,92 138,88 150,80 C 135,92 118,100 100,105 Z" />

        {/* Water Waves below shapla */}
        <path d="M 60,112 C 75,108 85,116 100,112 C 115,108 125,116 140,112 L 140,117 C 125,121 115,113 100,117 C 85,121 75,113 60,117 Z" />
        <path d="M 50,122 C 70,118 80,126 100,122 C 120,118 130,126 150,122 L 150,127 C 130,131 120,123 100,127 C 80,131 70,123 50,127 Z" />

        {/* Left Paddy Sheaf */}
        <path
          d="M 40,140 C 30,105 38,70 65,48 C 62,56 48,82 50,110 C 51,120 48,135 40,140 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        {/* Right Paddy Sheaf */}
        <path
          d="M 160,140 C 170,105 162,70 135,48 C 138,56 152,82 150,110 C 149,120 152,135 160,140 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        {/* 4 Top Stars */}
        <polygon points="85,30 87,35 82,32 89,32 84,35" />
        <polygon points="95,24 97,29 92,26 99,26 94,29" />
        <polygon points="105,24 107,29 102,26 109,26 104,29" />
        <polygon points="115,30 117,35 112,32 119,32 114,35" />

        {/* 3 Connected Jute Leaves at Top */}
        <path d="M 100,32 C 98,36 98,40 100,44 C 102,40 102,36 100,32 Z" />
        <path d="M 94,36 C 90,38 88,41 91,44 C 93,42 95,40 94,36 Z" />
        <path d="M 106,36 C 110,38 112,41 109,44 C 107,42 105,40 106,36 Z" />
      </g>
    </svg>
  );
};

export interface RealisticStaffIdCardProps {
  card: StaffIdCard;
  side?: "front" | "back";
  scale?: number;
  className?: string;
  id?: string;
}

export const RealisticStaffIdCard: React.FC<RealisticStaffIdCardProps> = ({
  card,
  side = "front",
  scale = 1,
  className = "",
  id = "nid-staff-card"
}) => {
  const isFront = side === "front";

  return (
    <div
      id={id}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        width: "560px",
        height: "354px"
      }}
      className={`relative bg-white text-black font-sans border-2 border-black rounded-sm shadow-2xl overflow-hidden select-none print:shadow-none print:m-0 shrink-0 ${className}`}
    >
      {isFront ? (
        /* FRONT SIDE OF NID / STAFF CARD (EXACT REPLICA OF USER IMAGE) */
        <div className="w-full h-full flex flex-col justify-between p-3.5 relative bg-white">
          {/* HEADER SECTION */}
          <div className="flex items-center gap-3 border-b-2 border-black pb-2.5">
            {/* Government Seal */}
            <div className="shrink-0 pl-1">
              <BangladeshGovtSeal className="w-16 h-16 drop-shadow-sm" size={64} />
            </div>

            {/* Header Text Columns */}
            <div className="flex-1 text-center pr-4">
              {/* Line 1: গণপ্রজাতন্ত্রী বাংলাদেশ সরকার */}
              <h1 className="text-[21px] font-black tracking-tight text-black leading-tight font-serif">
                {card.headerGovtBn || "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"}
              </h1>

              {/* Line 2: Government of the People's Republic of Bangladesh */}
              <p className="text-[12.5px] font-bold text-[#047857] leading-tight mt-0.5 tracking-tight">
                {card.headerGovtEn || "Government of the People's Republic of Bangladesh"}
              </p>

              {/* Line 3: Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র */}
              <p className="text-[12px] font-bold text-[#dc2626] leading-tight mt-0.5">
                {card.cardTitleBnEn || "Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র"}
              </p>
            </div>
          </div>

          {/* CARD BODY WITH WATERMARK */}
          <div className="flex-1 relative flex items-center pt-2 pb-1 overflow-hidden">
            {/* Center Golden Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <NationalEmblemWatermark className="w-56 h-56 text-[#eab308]/30 -mr-6" />
            </div>

            {/* Content Row: Photo on Left, Details on Right */}
            <div className="relative z-10 w-full flex items-start gap-4 h-full">
              {/* Photo & Signature Column */}
              <div className="w-[136px] flex flex-col items-center shrink-0">
                {/* Photo container */}
                <div className="w-[124px] h-[152px] bg-slate-100 border border-slate-400 overflow-hidden shadow-xs relative">
                  {card.photoUrl ? (
                    <img
                      src={card.photoUrl}
                      alt={card.nameEn || card.nameBn}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                {/* Signature Under Photo */}
                <div className="mt-1.5 w-full text-center flex items-center justify-center min-h-[26px]">
                  {card.signatureUrl ? (
                    <img
                      src={card.signatureUrl}
                      alt="Signature"
                      className="max-h-7 max-w-[110px] object-contain"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, serif"
                      }}
                      className="text-base font-semibold text-slate-900 tracking-wider italic"
                    >
                      {card.signatureText || card.nameEn?.split(" ")[0] || "Signature"}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Data Column (Exact match to Image 1) */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 pr-2 pt-0.5">
                {/* নাম: তাফি শেখ */}
                <div className="flex items-baseline text-[15px] font-bold text-black leading-snug">
                  <span className="shrink-0 w-14 font-bold text-black">নাম:</span>
                  <span className="font-extrabold text-black tracking-tight">{card.nameBn}</span>
                </div>

                {/* Name: TAFI SHEIKH */}
                <div className="flex items-baseline text-[15px] font-bold text-black leading-snug">
                  <span className="shrink-0 w-14 font-semibold text-black">Name:</span>
                  <span className="font-black text-black tracking-wide uppercase">
                    {card.nameEn}
                  </span>
                </div>

                {/* পিতা: মোঃ সাজু আহমেদ */}
                <div className="flex items-baseline text-[14px] font-bold text-black leading-snug">
                  <span className="shrink-0 w-14 font-semibold text-black">পিতা:</span>
                  <span className="font-bold text-black">{card.fatherNameBn}</span>
                </div>

                {/* মাতা: মোসাঃ মোহনা আক্তার */}
                <div className="flex items-baseline text-[14px] font-bold text-black leading-snug">
                  <span className="shrink-0 w-14 font-semibold text-black">মাতা:</span>
                  <span className="font-bold text-black">{card.motherNameBn}</span>
                </div>

                {/* Date of Birth: 07 Jan 2002 */}
                <div className="flex items-baseline text-[14.5px] font-bold text-black pt-1 leading-snug">
                  <span className="shrink-0 font-medium text-black mr-2">Date of Birth:</span>
                  <span className="font-black text-[#dc2626] tracking-tight">{card.dob}</span>
                </div>

                {/* ID NO: 63849492839 */}
                <div className="flex items-baseline text-[16px] font-black text-black pt-0.5 leading-snug">
                  <span className="shrink-0 font-bold text-black mr-2 tracking-tight">ID NO:</span>
                  <span className="font-black text-[#dc2626] text-[20px] tracking-wider font-mono">
                    {card.idNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Bottom Card Border Line */}
          <div className="h-0.5 w-full bg-black/80" />
        </div>
      ) : (
        /* BACK SIDE OF CARD (AUTHENTIC BANGLADESH NID / STAFF ID BACK VIEW) */
        <div className="w-full h-full flex flex-col justify-between p-3.5 relative bg-white text-xs">
          {/* Top Notice */}
          <div className="text-[10px] text-center border-b border-black pb-1.5 leading-tight font-medium text-slate-800">
            এই কার্ডটি DBS Bank SG এর বিশ্বস্ত কর্মকর্তা/কর্মচারীর পরিচয়পত্র। কার্ডটি কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিস বা DBS Bank SG শাখায় জমা দেওয়ার জন্য অনুরোধ করা হলো।
          </div>

          {/* Back Details Grid */}
          <div className="space-y-1.5 my-auto px-2">
            <div className="flex items-start">
              <span className="w-24 font-bold text-black shrink-0">ঠিকানা:</span>
              <span className="text-[11.5px] font-medium text-slate-900 leading-snug">
                {card.addressBn || "বাসা নং ১২, রোড নং ০৪, ধানমন্ডি, ঢাকা-১২০৫"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <span className="font-bold text-black mr-1">রক্তের গ্রুপ:</span>
                <span className="font-extrabold text-[#dc2626]">{card.bloodGroup || "O+"}</span>
              </div>
              <div>
                <span className="font-bold text-black mr-1">প্রদানের তারিখ:</span>
                <span className="font-medium text-slate-900">{card.issueDate || "15/01/2024"}</span>
              </div>
            </div>

            {card.designation && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="font-bold text-black mr-1">পদবী:</span>
                  <span className="font-semibold text-slate-800">{card.designation}</span>
                </div>
                <div>
                  <span className="font-bold text-black mr-1">শাখা/বিভাগ:</span>
                  <span className="font-semibold text-slate-800">{card.department || "ফিল্ড লোন ও নিরীক্ষা"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Authorized Sign & Barcode */}
          <div className="border-t-2 border-black pt-2">
            <div className="flex items-end justify-between px-2">
              {/* Barcode Simulation */}
              <div className="space-y-0.5">
                <div className="h-6 flex items-stretch gap-[1.5px]">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3].map((w, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${w}px` }}
                      className="bg-black h-full"
                    />
                  ))}
                </div>
                <p className="text-[8px] font-mono tracking-widest text-slate-700">
                  {card.idNumber || "63849492839"}
                </p>
              </div>

              {/* Authorized Authority Signature */}
              <div className="text-center">
                <div
                  style={{
                    fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif"
                  }}
                  className="text-base text-slate-900 italic font-bold leading-none mb-0.5"
                >
                  Gov. Registrar
                </div>
                <div className="w-28 h-[1px] bg-black mx-auto mb-0.5" />
                <span className="text-[9px] font-bold text-black block leading-none">
                  প্রদানকারী কর্তৃপক্ষের স্বাক্ষর
                </span>
              </div>
            </div>

            {/* MRZ Lines like real card */}
            <div className="mt-1.5 bg-slate-100 p-1 rounded-xs font-mono text-[8px] tracking-wider text-slate-700 leading-tight">
              <div>I&lt;BGD{card.idNumber || "63849492839"}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div>{card.dob?.replace(/\s+/g, "") || "07JAN2002"}&lt;&lt;&lt;{card.nameEn?.replace(/\s+/g, "&lt;") || "TAFI&lt;SHEIKH"}&lt;&lt;&lt;&lt;&lt;&lt;</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
