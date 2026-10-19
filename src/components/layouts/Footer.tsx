import React from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  Building2, 
  Lock, 
  Headphones,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { BDLoanLogo } from '@/components/common/BDLoanLogo';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { settings, packages } = useLoan();
  const { language } = useLanguage();
  const companyName = language === 'en'
    ? (settings.companyNameEn || 'DBS Bank SG')
    : (settings.companyNameBn || 'DBS Bank SG');

  return (
    <footer className="w-full bg-gradient-to-b from-card via-background to-muted/30 text-foreground border-t border-border mt-auto relative">
      {/* Top Trust & Security Ribbon */}
      <div className="border-b border-border/80 bg-muted/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">২৫৬-বিট এনক্রিপশন</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">১০০% সুরক্ষিত ব্যাংকিং ডাটা</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">স্বচ্ছ ও বৈধ ঋণ সেবা</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">কোনো লুকানো বা অতিরিক্ত ফি নেই</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs hover:border-amber-500/40 hover:shadow-xs transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Headphones className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">২৪/৭ অনলাইন সহায়তা</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">বিশেষজ্ঞ লোন অফিসার সাপোর্ট</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs hover:border-sky-500/40 hover:shadow-xs transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 border border-sky-500/20">
                <Building2 className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">তফসিলি ব্যাংক নেটওয়ার্ক</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">সরাসরি ব্যাংক একাউন্টে ট্রান্সফার</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <BDLoanLogo 
              size="md" 
              customText={settings.companyNameBn || 'DBS Bank SG'} 
            />
            
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
              {settings.companySloganBn || 'আপনার আর্থিক নির্ভরতার বিশ্বস্ত ব্যাংকিং সহযোগী। প্রতিটি গ্রাহকের স্বপ্ন পূরণে আমরা প্রতিশ্রুতিবদ্ধ।'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground font-semibold">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>আইএসও সার্টিফাইড ডিজিটাল ফাইন্যান্স সিস্টেম</span>
            </div>
          </div>

          {/* Quick Links (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              প্রয়োজনীয় সার্ভিস
            </h2>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link to="/calculator" className="hover:text-primary transition-colors flex items-center justify-between group py-1">
                  <span>লোন ক্যালকুলেটর ও ইএমআই হিসাব</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-primary transition-colors flex items-center justify-between group py-1">
                  <span>অনলাইন ঋণ আবেদন ফরম</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-primary transition-colors flex items-center justify-between group py-1">
                  <span>আবেদনের বর্তমান অবস্থা যাচাই</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center justify-between group py-1">
                  <span>গ্রাহক পোর্টাল ও ওয়ালেট হিসাব</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/fixed-deposit" className="hover:text-primary transition-colors flex items-center justify-between group py-1">
                  <span>ফিক্সড ডিপোজিট (এফডিআর) স্কিম</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Loan Packages (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ঋণ স্কিমসমূহ
            </h2>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {packages.slice(0, 5).map((pkg) => (
                <li key={pkg.id}>
                  <Link
                    to={`/packages?category=${pkg.category}`}
                    className="hover:text-foreground hover:translate-x-0.5 transition-all flex items-center gap-1.5 py-1"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 shrink-0" />
                    <span className="line-clamp-1">{pkg.nameBn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              যোগাযোগ ও সহায়তা
            </h2>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="leading-relaxed font-medium">{settings.officeAddressBn}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a href={`tel:${(settings.supportPhone || '').replace(/[^\d+]/g, '')}`} className="hover:text-primary transition-colors font-bold text-foreground">
                  {(settings.supportPhone || '').replace(/^.*?(?:যোগাযোগ\s*নম্বর|মোবাইল|ফোন|হটলাইন|হেল্পলাইন)[:\s-]*/gi, '').trim() || settings.supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary transition-colors font-medium">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="leading-relaxed font-medium">{settings.officeTimeBn}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{language === 'en' ? `© 2026 ${companyName}. All rights reserved.` : `© 2026 ${companyName}। সর্বস্বত্ব সংরক্ষিত।`}</p>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              গোপনীয়তা নীতি
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              ব্যবহারের শর্তাবলী
            </Link>
            <span className="text-border">•</span>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              হেল্প সেন্টার
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
