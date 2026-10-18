import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown, Globe } from 'lucide-react';
import { normalizePhone } from '@/services/storage';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CountryInfo {
  code: string;
  nameEn: string;
  nameBn: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  placeholder: string;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  // South Asia
  { code: 'BD', nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ', dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 11, placeholder: '01XXXXXXXXX' },
  { code: 'IN', nameEn: 'India', nameBn: 'ভারত (India)', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10, placeholder: '9XXXXXXXXX' },
  { code: 'PK', nameEn: 'Pakistan', nameBn: 'পাকিস্তান', dialCode: '+92', flag: '🇵🇰', minDigits: 10, maxDigits: 10, placeholder: '3XXXXXXXXX' },
  { code: 'NP', nameEn: 'Nepal', nameBn: 'নেপাল', dialCode: '+977', flag: '🇳🇵', minDigits: 10, maxDigits: 10, placeholder: '98XXXXXXXX' },
  { code: 'LK', nameEn: 'Sri Lanka', nameBn: 'শ্রীলঙ্কা', dialCode: '+94', flag: '🇱🇰', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'MV', nameEn: 'Maldives', nameBn: 'মালদ্বীপ', dialCode: '+960', flag: '🇲🇻', minDigits: 7, maxDigits: 7, placeholder: '7XXXXXX' },
  { code: 'BT', nameEn: 'Bhutan', nameBn: 'ভুটান', dialCode: '+975', flag: '🇧🇹', minDigits: 8, maxDigits: 8, placeholder: '17XXXXXX' },
  { code: 'AF', nameEn: 'Afghanistan', nameBn: 'আফগানিস্তান', dialCode: '+93', flag: '🇦🇫', minDigits: 9, maxDigits: 9, placeholder: '70XXXXXXX' },

  // Middle East / Gulf (GCC)
  { code: 'SA', nameEn: 'Saudi Arabia', nameBn: 'সৌদি আরব (KSA)', dialCode: '+966', flag: '🇸🇦', minDigits: 9, maxDigits: 10, placeholder: '5XXXXXXXX' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameBn: 'সংযুক্ত আরব আমিরাত (UAE)', dialCode: '+971', flag: '🇦🇪', minDigits: 9, maxDigits: 10, placeholder: '50XXXXXXX' },
  { code: 'QA', nameEn: 'Qatar', nameBn: 'কাতার', dialCode: '+974', flag: '🇶🇦', minDigits: 8, maxDigits: 8, placeholder: '3/5/6/7XXXXXX' },
  { code: 'KW', nameEn: 'Kuwait', nameBn: 'কুয়েত', dialCode: '+965', flag: '🇰🇼', minDigits: 8, maxDigits: 8, placeholder: '5/6/9XXXXXX' },
  { code: 'OM', nameEn: 'Oman', nameBn: 'ওমান', dialCode: '+968', flag: '🇴🇲', minDigits: 8, maxDigits: 8, placeholder: '9XXXXXXX' },
  { code: 'BH', nameEn: 'Bahrain', nameBn: 'বাহরাইন', dialCode: '+973', flag: '🇧🇭', minDigits: 8, maxDigits: 8, placeholder: '3XXXXXXX' },
  { code: 'JO', nameEn: 'Jordan', nameBn: 'জর্ডান', dialCode: '+962', flag: '🇯🇴', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'LB', nameEn: 'Lebanon', nameBn: 'লেবানন', dialCode: '+961', flag: '🇱🇧', minDigits: 7, maxDigits: 8, placeholder: '3XXXXXXX' },
  { code: 'IQ', nameEn: 'Iraq', nameBn: 'ইরাক', dialCode: '+964', flag: '🇮🇶', minDigits: 10, maxDigits: 10, placeholder: '7XXXXXXXXX' },
  { code: 'TR', nameEn: 'Turkey', nameBn: 'তুরস্ক', dialCode: '+90', flag: '🇹🇷', minDigits: 10, maxDigits: 10, placeholder: '5XXXXXXXXX' },

  // Southeast & East Asia
  { code: 'SG', nameEn: 'Singapore', nameBn: 'সিঙ্গাপুর', dialCode: '+65', flag: '🇸🇬', minDigits: 8, maxDigits: 9, placeholder: '8/9XXXXXXX' },
  { code: 'MY', nameEn: 'Malaysia', nameBn: 'মালয়েশিয়া', dialCode: '+60', flag: '🇲🇾', minDigits: 9, maxDigits: 11, placeholder: '1XXXXXXXX' },
  { code: 'JP', nameEn: 'Japan', nameBn: 'জাপান', dialCode: '+81', flag: '🇯🇵', minDigits: 10, maxDigits: 11, placeholder: '90XXXXXXXX' },
  { code: 'KR', nameEn: 'South Korea', nameBn: 'দক্ষিণ কোরিয়া', dialCode: '+82', flag: '🇰🇷', minDigits: 9, maxDigits: 11, placeholder: '10XXXXXXXX' },
  { code: 'CN', nameEn: 'China', nameBn: 'চীন', dialCode: '+86', flag: '🇨🇳', minDigits: 11, maxDigits: 11, placeholder: '13XXXXXXXXX' },
  { code: 'HK', nameEn: 'Hong Kong', nameBn: 'হংকং', dialCode: '+852', flag: '🇭🇰', minDigits: 8, maxDigits: 8, placeholder: '9XXXXXXX' },
  { code: 'TW', nameEn: 'Taiwan', nameBn: 'তাইওয়ান', dialCode: '+886', flag: '🇹🇼', minDigits: 9, maxDigits: 9, placeholder: '9XXXXXXXX' },
  { code: 'TH', nameEn: 'Thailand', nameBn: 'থাইল্যান্ড', dialCode: '+66', flag: '🇹🇭', minDigits: 9, maxDigits: 10, placeholder: '8XXXXXXXX' },
  { code: 'ID', nameEn: 'Indonesia', nameBn: 'ইন্দোনেশিয়া', dialCode: '+62', flag: '🇮🇩', minDigits: 9, maxDigits: 12, placeholder: '81XXXXXXXXX' },
  { code: 'PH', nameEn: 'Philippines', nameBn: 'ফিলিপাইন', dialCode: '+63', flag: '🇵🇭', minDigits: 10, maxDigits: 10, placeholder: '9XXXXXXXXX' },
  { code: 'VN', nameEn: 'Vietnam', nameBn: 'ভিয়েতনাম', dialCode: '+84', flag: '🇻🇳', minDigits: 9, maxDigits: 10, placeholder: '9XXXXXXXX' },
  { code: 'BN', nameEn: 'Brunei', nameBn: 'ব্রুনাই', dialCode: '+673', flag: '🇧🇳', minDigits: 7, maxDigits: 7, placeholder: '8XXXXXX' },
  { code: 'MM', nameEn: 'Myanmar', nameBn: 'মিয়ানমার', dialCode: '+95', flag: '🇲🇲', minDigits: 8, maxDigits: 10, placeholder: '9XXXXXXXX' },
  { code: 'KH', nameEn: 'Cambodia', nameBn: 'কম্বোডিয়া', dialCode: '+855', flag: '🇰🇭', minDigits: 8, maxDigits: 9, placeholder: '12XXXXXX' },

  // Europe
  { code: 'GB', nameEn: 'United Kingdom', nameBn: 'যুক্তরাজ্য (UK)', dialCode: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 11, placeholder: '7XXXXXXXXX' },
  { code: 'IT', nameEn: 'Italy', nameBn: 'ইতালি', dialCode: '+39', flag: '🇮🇹', minDigits: 9, maxDigits: 11, placeholder: '3XXXXXXXXX' },
  { code: 'DE', nameEn: 'Germany', nameBn: 'জার্মানি', dialCode: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11, placeholder: '15XXXXXXXX' },
  { code: 'FR', nameEn: 'France', nameBn: 'ফ্রান্স', dialCode: '+33', flag: '🇫🇷', minDigits: 9, maxDigits: 9, placeholder: '6XXXXXXXX' },
  { code: 'ES', nameEn: 'Spain', nameBn: 'স্পেন', dialCode: '+34', flag: '🇪🇸', minDigits: 9, maxDigits: 10, placeholder: '6XXXXXXXXX' },
  { code: 'PT', nameEn: 'Portugal', nameBn: 'পর্তুগাল', dialCode: '+351', flag: '🇵🇹', minDigits: 9, maxDigits: 9, placeholder: '9XXXXXXXX' },
  { code: 'NL', nameEn: 'Netherlands', nameBn: 'নেদারল্যান্ডস', dialCode: '+31', flag: '🇳🇱', minDigits: 9, maxDigits: 9, placeholder: '6XXXXXXXX' },
  { code: 'BE', nameEn: 'Belgium', nameBn: 'বেলজিয়াম', dialCode: '+32', flag: '🇧🇪', minDigits: 9, maxDigits: 9, placeholder: '4XXXXXXXX' },
  { code: 'CH', nameEn: 'Switzerland', nameBn: 'সুইজারল্যান্ড', dialCode: '+41', flag: '🇨🇭', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'SE', nameEn: 'Sweden', nameBn: 'সুইডেন', dialCode: '+46', flag: '🇸🇪', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'NO', nameEn: 'Norway', nameBn: 'নরওয়ে', dialCode: '+47', flag: '🇳🇴', minDigits: 8, maxDigits: 8, placeholder: '4XXXXXXX' },
  { code: 'DK', nameEn: 'Denmark', nameBn: 'ডেনমার্ক', dialCode: '+45', flag: '🇩🇰', minDigits: 8, maxDigits: 8, placeholder: '2XXXXXXX' },
  { code: 'FI', nameEn: 'Finland', nameBn: 'ফিনল্যান্ড', dialCode: '+358', flag: '🇫🇮', minDigits: 9, maxDigits: 10, placeholder: '4XXXXXXXX' },
  { code: 'PL', nameEn: 'Poland', nameBn: 'পোল্যান্ড', dialCode: '+48', flag: '🇵🇱', minDigits: 9, maxDigits: 9, placeholder: '5XXXXXXXX' },
  { code: 'IE', nameEn: 'Ireland', nameBn: 'আয়ারল্যান্ড', dialCode: '+353', flag: '🇮🇪', minDigits: 9, maxDigits: 9, placeholder: '8XXXXXXXX' },
  { code: 'RO', nameEn: 'Romania', nameBn: 'রোমানিয়া', dialCode: '+40', flag: '🇷🇴', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'GR', nameEn: 'Greece', nameBn: 'গ্রিস', dialCode: '+30', flag: '🇬🇷', minDigits: 10, maxDigits: 10, placeholder: '69XXXXXXXX' },
  { code: 'AT', nameEn: 'Austria', nameBn: 'অস্ট্রিয়া', dialCode: '+43', flag: '🇦🇹', minDigits: 10, maxDigits: 11, placeholder: '6XXXXXXXXX' },
  { code: 'RU', nameEn: 'Russia', nameBn: 'রাশিয়া', dialCode: '+7', flag: '🇷🇺', minDigits: 10, maxDigits: 10, placeholder: '9XXXXXXXXX' },
  { code: 'CY', nameEn: 'Cyprus', nameBn: 'সাইপ্রাস', dialCode: '+357', flag: '🇨🇾', minDigits: 8, maxDigits: 8, placeholder: '9XXXXXXX' },

  // Americas & Oceania
  { code: 'US', nameEn: 'United States', nameBn: 'যুক্তরাষ্ট্র (USA)', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10, placeholder: '202XXXXXXX' },
  { code: 'CA', nameEn: 'Canada', nameBn: 'কানাডা', dialCode: '+1', flag: '🇨🇦', minDigits: 10, maxDigits: 10, placeholder: '416XXXXXXX' },
  { code: 'AU', nameEn: 'Australia', nameBn: 'অস্ট্রেলিয়া', dialCode: '+61', flag: '🇦🇺', minDigits: 9, maxDigits: 9, placeholder: '4XXXXXXXX' },
  { code: 'NZ', nameEn: 'New Zealand', nameBn: 'নিউজিল্যান্ড', dialCode: '+64', flag: '🇳🇿', minDigits: 8, maxDigits: 10, placeholder: '2XXXXXXXX' },
  { code: 'BR', nameEn: 'Brazil', nameBn: 'ব্রাজিল', dialCode: '+55', flag: '🇧🇷', minDigits: 10, maxDigits: 11, placeholder: '119XXXXXXXX' },
  { code: 'MX', nameEn: 'Mexico', nameBn: 'মেক্সিকো', dialCode: '+52', flag: '🇲🇽', minDigits: 10, maxDigits: 10, placeholder: '55XXXXXXXX' },
  { code: 'AR', nameEn: 'Argentina', nameBn: 'আর্জেন্টিনা', dialCode: '+54', flag: '🇦🇷', minDigits: 10, maxDigits: 10, placeholder: '11XXXXXXXX' },

  // Africa
  { code: 'ZA', nameEn: 'South Africa', nameBn: 'দক্ষিণ আফ্রিকা', dialCode: '+27', flag: '🇿🇦', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'EG', nameEn: 'Egypt', nameBn: 'মিশর', dialCode: '+20', flag: '🇪🇬', minDigits: 10, maxDigits: 10, placeholder: '10XXXXXXXX' },
  { code: 'NG', nameEn: 'Nigeria', nameBn: 'নাইজেরিয়া', dialCode: '+234', flag: '🇳🇬', minDigits: 10, maxDigits: 10, placeholder: '80XXXXXXXX' },
  { code: 'KE', nameEn: 'Kenya', nameBn: 'কেনিয়া', dialCode: '+254', flag: '🇰🇪', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'MU', nameEn: 'Mauritius', nameBn: 'মরিশাস', dialCode: '+230', flag: '🇲🇺', minDigits: 8, maxDigits: 8, placeholder: '5XXXXXXX' },

  // Generic / Others
  { code: 'OTHER', nameEn: 'Other International', nameBn: 'অন্যান্য আন্তর্জাতিক দেশ', dialCode: '+', flag: '🌍', minDigits: 6, maxDigits: 15, placeholder: 'Phone Number' },
];

interface InternationalPhoneInputProps {
  value: string;
  onChange: (phone: string, isValid: boolean) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  id,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  defaultCountry = 'BD'
}) => {
  const { language } = useLanguage();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Detect country from initial value if it starts with + or another dial code
  useEffect(() => {
    if (!value) {
      setPhoneNumber('');
      return;
    }

    const clean = normalizePhone(value);
    // If it's already a local BD number (11 digits starting with 01)
    if (clean.startsWith('01') && clean.length === 11) {
      setSelectedCountryCode('BD');
      setPhoneNumber(clean);
      return;
    }

    // Try to match dial code
    let matchedCountry = SUPPORTED_COUNTRIES.find(
      (c) => c.code !== 'OTHER' && (value.startsWith(c.dialCode) || clean.startsWith(c.dialCode.replace('+', '')))
    );

    if (matchedCountry) {
      setSelectedCountryCode(matchedCountry.code);
      const withoutDial = value.startsWith(matchedCountry.dialCode)
        ? value.slice(matchedCountry.dialCode.length)
        : clean.startsWith(matchedCountry.dialCode.replace('+', ''))
        ? clean.slice(matchedCountry.dialCode.replace('+', '').length)
        : value;
      setPhoneNumber(withoutDial);
    } else {
      setPhoneNumber(value);
    }
  }, []);

  const activeCountry = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = SUPPORTED_COUNTRIES.find((c) => c.code === code) || SUPPORTED_COUNTRIES[0];
    computeAndEmit(country, phoneNumber);
  };

  const handleNumberChange = (rawText: string) => {
    // Strip non-digits unless starting with +
    let cleaned = rawText.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
    computeAndEmit(activeCountry, cleaned);
  };

  const computeAndEmit = (country: CountryInfo, digits: string) => {
    const rawDigits = digits.replace(/[^\d]/g, '');
    let finalPhone = '';
    let isValid = false;

    if (country.code === 'BD') {
      // For Bangladesh: standard 11 digits format (e.g. 01712345678)
      if (rawDigits.startsWith('880')) {
        finalPhone = '0' + rawDigits.slice(3);
      } else if (rawDigits.startsWith('1') && rawDigits.length === 10) {
        finalPhone = '0' + rawDigits;
      } else {
        finalPhone = rawDigits;
      }
      isValid = finalPhone.length === 11 && finalPhone.startsWith('01');
    } else if (country.code === 'OTHER') {
      finalPhone = digits.startsWith('+') ? digits : `+${rawDigits}`;
      isValid = rawDigits.length >= country.minDigits;
    } else {
      // Other country: prepend dialCode
      // If user typed dialCode itself, don't duplicate
      const dialClean = country.dialCode.replace('+', '');
      let stripped = rawDigits;
      if (stripped.startsWith(dialClean)) {
        stripped = stripped.slice(dialClean.length);
      }
      // Remove leading 0 if present in international mobile
      if (stripped.startsWith('0')) {
        stripped = stripped.slice(1);
      }
      finalPhone = `${country.dialCode}${stripped}`;
      isValid = stripped.length >= country.minDigits && stripped.length <= country.maxDigits;
    }

    onChange(finalPhone, isValid);
  };

  const renderFlag = (c: CountryInfo, size = 'w-5 h-3.5') => {
    if (c.code === 'OTHER') {
      return <span className="text-base shrink-0 leading-none">🌍</span>;
    }
    const iso = c.code.toLowerCase();
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${size} overflow-hidden rounded-[2px] shadow-2xs border border-slate-200/80 bg-slate-100`}>
        <img
          src={`https://flagcdn.com/w40/${iso}.png`}
          srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
          alt={c.nameEn}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to emoji if CDN image fails
            (e.currentTarget as HTMLElement).style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = `<span class="country-flag-icon text-sm">${c.flag}</span>`;
            }
          }}
        />
      </span>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Zero Layout-Shift Country Code Selector */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-[130px] sm:w-[148px] h-10 md:h-11 rounded-xl text-xs font-semibold bg-background border px-2.5 flex items-center justify-between shadow-2xs hover:bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 truncate">
            {renderFlag(activeCountry, 'w-5 h-3.5')}
            <span className="font-bold text-foreground text-xs">{activeCountry.dialCode}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-[270px] sm:w-[290px] max-h-[280px] overflow-y-auto rounded-xl border bg-popover p-1 shadow-xl text-popover-foreground animate-in fade-in-0 zoom-in-95">
            {SUPPORTED_COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  handleCountryChange(c.code);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg cursor-pointer transition-colors text-left hover:bg-primary hover:text-primary-foreground group ${
                  selectedCountryCode === c.code ? 'bg-primary/10 font-bold' : ''
                }`}
              >
                {renderFlag(c, 'w-5 h-3.5')}
                <span className="font-bold text-primary group-hover:text-primary-foreground w-12 shrink-0">
                  {c.dialCode}
                </span>
                <span className="truncate text-foreground group-hover:text-primary-foreground">
                  {language === 'en' ? c.nameEn : c.nameBn}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <div className="relative flex-1 min-w-0">
        <Input
          id={id}
          type="tel"
          placeholder={placeholder || activeCountry.placeholder}
          value={phoneNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="h-10 md:h-11 text-sm rounded-xl font-medium w-full"
        />
      </div>
    </div>
  );
};
