import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface ProfessionalDobPickerProps {
  value: string; // ISO format "YYYY-MM-DD" or empty
  onChange: (val: string) => void;
  required?: boolean;
  className?: string;
}

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const toBn = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => BENGALI_DIGITS[d] || d);
};

const MONTHS = [
  { value: '01', nameBn: 'জানুয়ারি', nameEn: 'January' },
  { value: '02', nameBn: 'ফেব্রুয়ারি', nameEn: 'February' },
  { value: '03', nameBn: 'মার্চ', nameEn: 'March' },
  { value: '04', nameBn: 'এপ্রিল', nameEn: 'April' },
  { value: '05', nameBn: 'মে', nameEn: 'May' },
  { value: '06', nameBn: 'জুন', nameEn: 'June' },
  { value: '07', nameBn: 'জুলাই', nameEn: 'July' },
  { value: '08', nameBn: 'আগস্ট', nameEn: 'August' },
  { value: '09', nameBn: 'সেপ্টেম্বর', nameEn: 'September' },
  { value: '10', nameBn: 'অক্টোবর', nameEn: 'October' },
  { value: '11', nameBn: 'নভেম্বর', nameEn: 'November' },
  { value: '12', nameBn: 'ডিসেম্বর', nameEn: 'December' },
];

export const ProfessionalDobPicker: React.FC<ProfessionalDobPickerProps> = ({
  value,
  onChange,
  required = true,
  className = ''
}) => {
  // Parse current value if valid "YYYY-MM-DD"
  const parsed = useMemo(() => {
    if (!value || typeof value !== 'string') return { year: '', month: '', day: '' };
    const parts = value.split('-');
    if (parts.length === 3) {
      return {
        year: parts[0] || '',
        month: parts[1]?.padStart(2, '0') || '',
        day: parts[2]?.padStart(2, '0') || ''
      };
    }
    return { year: '', month: '', day: '' };
  }, [value]);

  // Generate Year options (Adult borrowers: 18 years old to 78 years old)
  // Current year: 2026, so 2008 down to 1948
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18; // 2008
  const minYear = 1948;

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [maxYear, minYear]);

  // Calculate days in selected month/year (default 31)
  const daysInMonth = useMemo(() => {
    const y = parseInt(parsed.year, 10) || 2000;
    const m = parseInt(parsed.month, 10) || 1;
    return new Date(y, m, 0).getDate();
  }, [parsed.year, parsed.month]);

  const days = useMemo(() => {
    const list: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(String(d).padStart(2, '0'));
    }
    return list;
  }, [daysInMonth]);

  // Calculate age if valid date
  const calculatedAge = useMemo(() => {
    if (!parsed.year || !parsed.month || !parsed.day) return null;
    const birth = new Date(Number(parsed.year), Number(parsed.month) - 1, Number(parsed.day));
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }, [parsed]);

  const handleDayChange = (newDay: string) => {
    const y = parsed.year || String(currentYear - 28); // default ~1998
    const m = parsed.month || '01';
    onChange(`${y}-${m}-${newDay}`);
  };

  const handleMonthChange = (newMonth: string) => {
    const y = parsed.year || String(currentYear - 28);
    const d = parsed.day || '01';
    onChange(`${y}-${newMonth}-${d}`);
  };

  const handleYearChange = (newYear: string) => {
    const m = parsed.month || '01';
    const d = parsed.day || '01';
    onChange(`${newYear}-${m}-${d}`);
  };

  const selectedMonthObj = MONTHS.find((m) => m.value === parsed.month);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="app-dob" className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span>জন্ম তারিখ (NID অনুযায়ী) {required && <span className="text-red-500">*</span>}</span>
        </Label>
        {calculatedAge !== null && (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold text-primary bg-primary/10 border-primary/20 px-2 py-0.5"
          >
            বয়স: {toBn(calculatedAge)} বছর ({calculatedAge >= 18 ? 'ঋণ পাওয়ার যোগ্য' : '১৮ বছরের কম'})
          </Badge>
        )}
      </div>

      {/* 3-Column Selectors: Day, Month, Year */}
      <div className="grid grid-cols-3 gap-2">
        {/* DAY SELECTOR */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground block">দিন (Day)</span>
          <Select value={parsed.day || undefined} onValueChange={handleDayChange}>
            <SelectTrigger className="h-10 text-xs font-semibold bg-background border-input focus:ring-primary">
              <SelectValue placeholder="দিন নির্বাচন" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {days.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {toBn(d)} তারিখ ({d})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* MONTH SELECTOR */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground block">মাস (Month)</span>
          <Select value={parsed.month || undefined} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-10 text-xs font-semibold bg-background border-input focus:ring-primary">
              <SelectValue placeholder="মাস নির্বাচন" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {toBn(m.value)} - {m.nameBn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* YEAR SELECTOR */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground block">বছর (Year)</span>
          <Select value={parsed.year || undefined} onValueChange={handleYearChange}>
            <SelectTrigger className="h-10 text-xs font-semibold bg-background border-input focus:ring-primary font-mono">
              <SelectValue placeholder="বছর নির্বাচন" />
            </SelectTrigger>
            <SelectContent className="max-h-60 font-mono">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">
                  {toBn(y)} ({y})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Formatted Date Confirmation Banner */}
      {parsed.day && parsed.month && parsed.year ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            নির্বাচিত জন্ম তারিখ: <strong>{toBn(parsed.day)} {selectedMonthObj?.nameBn} {toBn(parsed.year)}</strong> ({parsed.day}/{parsed.month}/{parsed.year})
          </span>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          💡 জাতীয় পরিচয়পত্র (NID) কার্ডে উল্লেখিত দিন, মাস ও জন্মসাল নির্বাচন করুন।
        </p>
      )}
    </div>
  );
};
