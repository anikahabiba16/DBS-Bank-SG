import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { normalizePhone } from '@/services/storage';

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
  { code: 'BD', nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ', dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 11, placeholder: '01XXXXXXXXX' },
  { code: 'IN', nameEn: 'India', nameBn: 'ভারত (India)', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10, placeholder: '9XXXXXXXXX' },
  { code: 'PK', nameEn: 'Pakistan', nameBn: 'পাকিস্তান', dialCode: '+92', flag: '🇵🇰', minDigits: 10, maxDigits: 10, placeholder: '3XXXXXXXXX' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameBn: 'সংযুক্ত আরব আমিরাত (UAE)', dialCode: '+971', flag: '🇦🇪', minDigits: 9, maxDigits: 10, placeholder: '50XXXXXXX' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameBn: 'সৌদি আরব (KSA)', dialCode: '+966', flag: '🇸🇦', minDigits: 9, maxDigits: 10, placeholder: '5XXXXXXXX' },
  { code: 'MY', nameEn: 'Malaysia', nameBn: 'মালয়েশিয়া', dialCode: '+60', flag: '🇲🇾', minDigits: 9, maxDigits: 11, placeholder: '1XXXXXXXX' },
  { code: 'SG', nameEn: 'Singapore', nameBn: 'সিঙ্গাপুর', dialCode: '+65', flag: '🇸🇬', minDigits: 8, maxDigits: 9, placeholder: '8/9XXXXXXX' },
  { code: 'QA', nameEn: 'Qatar', nameBn: 'কাতার', dialCode: '+974', flag: '🇶🇦', minDigits: 8, maxDigits: 8, placeholder: '3/5/6/7XXXXXX' },
  { code: 'KW', nameEn: 'Kuwait', nameBn: 'কুয়েত', dialCode: '+965', flag: '🇰🇼', minDigits: 8, maxDigits: 8, placeholder: '5/6/9XXXXXX' },
  { code: 'OM', nameEn: 'Oman', nameBn: 'ওমান', dialCode: '+968', flag: '🇴🇲', minDigits: 8, maxDigits: 8, placeholder: '9XXXXXXX' },
  { code: 'BH', nameEn: 'Bahrain', nameBn: 'বাহরাইন', dialCode: '+973', flag: '🇧🇭', minDigits: 8, maxDigits: 8, placeholder: '3XXXXXXX' },
  { code: 'NP', nameEn: 'Nepal', nameBn: 'নেপাল (Nepal)', dialCode: '+977', flag: '🇳🇵', minDigits: 10, maxDigits: 10, placeholder: '98XXXXXXXX' },
  { code: 'LK', nameEn: 'Sri Lanka', nameBn: 'শ্রীলঙ্কা (Sri Lanka)', dialCode: '+94', flag: '🇱🇰', minDigits: 9, maxDigits: 9, placeholder: '7XXXXXXXX' },
  { code: 'MV', nameEn: 'Maldives', nameBn: 'মালদ্বীপ (Maldives)', dialCode: '+960', flag: '🇲🇻', minDigits: 7, maxDigits: 7, placeholder: '7XXXXXX' },
  { code: 'JP', nameEn: 'Japan', nameBn: 'জাপান (Japan)', dialCode: '+81', flag: '🇯🇵', minDigits: 10, maxDigits: 11, placeholder: '90XXXXXXXX' },
  { code: 'KR', nameEn: 'South Korea', nameBn: 'দক্ষিণ কোরিয়া (Korea)', dialCode: '+82', flag: '🇰🇷', minDigits: 9, maxDigits: 11, placeholder: '10XXXXXXXX' },
  { code: 'TH', nameEn: 'Thailand', nameBn: 'থাইল্যান্ড (Thailand)', dialCode: '+66', flag: '🇹🇭', minDigits: 9, maxDigits: 10, placeholder: '8XXXXXXXX' },
  { code: 'ID', nameEn: 'Indonesia', nameBn: 'ইন্দোনেশিয়া (Indonesia)', dialCode: '+62', flag: '🇮🇩', minDigits: 9, maxDigits: 12, placeholder: '81XXXXXXXXX' },
  { code: 'PH', nameEn: 'Philippines', nameBn: 'ফিলিপাইন (Philippines)', dialCode: '+63', flag: '🇵🇭', minDigits: 10, maxDigits: 10, placeholder: '9XXXXXXXXX' },
  { code: 'VN', nameEn: 'Vietnam', nameBn: 'ভিয়েতনাম (Vietnam)', dialCode: '+84', flag: '🇻🇳', minDigits: 9, maxDigits: 10, placeholder: '9XXXXXXXX' },
  { code: 'BN', nameEn: 'Brunei', nameBn: 'ব্রুনাই (Brunei)', dialCode: '+673', flag: '🇧🇳', minDigits: 7, maxDigits: 7, placeholder: '8XXXXXX' },
  { code: 'CN', nameEn: 'China', nameBn: 'চীন (China)', dialCode: '+86', flag: '🇨🇳', minDigits: 11, maxDigits: 11, placeholder: '13XXXXXXXXX' },
  { code: 'HK', nameEn: 'Chinese Hong Kong', nameBn: 'চাইনিজ হংকং', dialCode: '+852', flag: '🇭🇰', minDigits: 8, maxDigits: 8, placeholder: '9XXXXXXX' },
  { code: 'TW', nameEn: 'Chinese Taiwan', nameBn: 'চাইনিজ তাইওয়ান', dialCode: '+886', flag: '🇨🇳', minDigits: 9, maxDigits: 9, placeholder: '9XXXXXXXX' },
  { code: 'US', nameEn: 'United States / Canada', nameBn: 'যুক্তরাষ্ট্র ও কানাডা', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10, placeholder: '202XXXXXXX' },
  { code: 'GB', nameEn: 'United Kingdom', nameBn: 'যুক্তরাজ্য (UK)', dialCode: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 11, placeholder: '7XXXXXXXXX' },
  { code: 'IT', nameEn: 'Italy', nameBn: 'ইতালি', dialCode: '+39', flag: '🇮🇹', minDigits: 9, maxDigits: 11, placeholder: '3XXXXXXXXX' },
  { code: 'ES', nameEn: 'Spain', nameBn: 'স্পেন', dialCode: '+34', flag: '🇪🇸', minDigits: 9, maxDigits: 10, placeholder: '6XXXXXXXXX' },
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
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Country Code Selector */}
      <Select value={selectedCountryCode} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="w-[130px] sm:w-[145px] shrink-0 h-10 md:h-11 rounded-xl text-xs font-semibold bg-background border px-2.5">
          <SelectValue>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-base shrink-0">{activeCountry.flag}</span>
              <span className="font-bold text-foreground text-xs">{activeCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] w-[260px] sm:w-[280px]">
          {SUPPORTED_COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code} className="text-xs cursor-pointer py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{c.flag}</span>
                <span className="font-bold text-primary w-12">{c.dialCode}</span>
                <span className="truncate text-muted-foreground">{c.nameBn}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
