import React from 'react';

interface BDLoanLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customText?: string;
}

export const BDLoanLogo: React.FC<BDLoanLogoProps> = ({
  showText = true,
  size = 'md',
  className = '',
  customText
}) => {
  const iconSizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl'
  }[size];

  return (
    <div
      className={`flex items-center gap-2 sm:gap-2.5 shrink-0 ${className}`}
    >
      {/* DBS Bank SG Logo */}
      <div
        className={`${iconSizeClasses} shrink-0 overflow-hidden bg-white shadow-md shadow-primary/20 border border-slate-200 flex items-center justify-center p-0.5`}
      >
        <img
          src="https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png"
          alt="DBS Bank SG Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-xs sm:text-sm md:text-base leading-tight text-foreground truncate tracking-tight">
            {customText || 'DBS Bank SG'}
          </span>

          <span className="text-[10px] text-muted-foreground hidden sm:inline-block font-medium truncate">
            ডিজিটাল ব্যাংকিং ও সহজ শর্তে ঋণ সেবা
          </span>
        </div>
      )}
    </div>
  );
};

export default BDLoanLogo;
