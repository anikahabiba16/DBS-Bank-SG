import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
}) => {
  const { language, toggleLanguage } = useLanguage();
  const isBangla = language === 'bn';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isBangla}
      aria-label="Toggle language between বাংলা and English"
      onClick={toggleLanguage}
      className={`group relative inline-flex items-center h-8 w-[72px] shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none shadow-inner border border-border/70 ${
        isBangla
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
          : 'bg-gradient-to-r from-sky-600 to-primary'
      } ${className}`}
    >
      {/* Background Labels inside the track */}
      <span
        className={`absolute left-2 text-[10px] font-black tracking-wider transition-opacity duration-200 text-white ${
          isBangla ? 'opacity-0' : 'opacity-90'
        }`}
      >
        EN
      </span>
      <span
        className={`absolute right-2 text-[10px] font-black tracking-wider transition-opacity duration-200 text-white font-bangla ${
          isBangla ? 'opacity-90' : 'opacity-0'
        }`}
      >
        বাংলা
      </span>

      {/* Sliding iOS Toggle Thumb */}
      <span
        className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-spring ${
          isBangla ? 'translate-x-0' : 'translate-x-[40px]'
        }`}
      >
        <span className="text-xs leading-none select-none drop-shadow-xs transition-transform group-hover:scale-110">
          {isBangla ? '🇧🇩' : '🇬🇧'}
        </span>
      </span>
    </button>
  );
};

export default LanguageSwitcher;
