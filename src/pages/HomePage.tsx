import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { formatTaka, toBengaliNumber, calculateEMI } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PartnerBanksSection } from '@/components/common/PartnerBanksSection';
import { CustomerReviewsSection } from '@/components/common/CustomerReviewsSection';
import { CustomerDepositModal } from '@/components/common/CustomerDepositModal';
import { CustomerSupportModal } from '@/components/common/CustomerSupportModal';
import { PromotionMediaGallery } from '@/components/common/PromotionMediaGallery';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  Banknote, 
  Users, 
  TrendingUp, 
  Zap,
  Award, 
  PhoneCall,
  ChevronRight,
  UserCheck,
  Briefcase,
  GraduationCap,
  Tractor,
  Wallet,
  ArrowDownCircle,
  Scale,
  Headphones,
  Building2,
  Search,
  Download,
  Smartphone,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, packages, currentUser, walletBalance } = useLoan();
  const navigate = useNavigate();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Quick Hero Calculator state
  const [quickAmount, setQuickAmount] = useState<number>(100000);
  const [quickMonths, setQuickMonths] = useState<number>(12);
  const quickRate = settings.defaultInterestRateGlobal || 8.5;

  const quickCalculation = calculateEMI(quickAmount, quickRate, quickMonths);

  const stats = [
    { label: 'মোট বিতরণকৃত ঋণ', value: '৳ ৫০+ কোটি', icon: Banknote },
    { label: 'সন্তুষ্ট গ্রাহক সংখ্যা', value: '১২,৫০০+', icon: Users },
    { label: 'আবেদন অনুমোদন হার', value: '৯৮%', icon: TrendingUp },
    { label: 'গড় অনুমোদন সময়', value: '২৪ ঘণ্টা', icon: Clock }
  ];

  const steps = [
    {
      step: '১',
      title: 'প্যাকেজ নির্বাচন ও হিসাব',
      desc: 'আপনার প্রয়োজন অনুযায়ী লোন প্যাকেজ পছন্দ করুন এবং ক্যালকুলেটরে মাসিক কিস্তি যাচাই করুন।'
    },
    {
      step: '২',
      title: 'অনলাইন আবেদন ফরম পূরণ',
      desc: 'জাতীয় পরিচয়পত্র ও প্রয়োজনীয় প্রাথমিক তথ্য দিয়ে মাত্র ৫ মিনিটে সহজে আবেদন সাবমিট করুন।'
    },
    {
      step: '৩',
      title: 'যাচাই ও তাৎক্ষণিক ফান্ড ছাড়',
      desc: 'আমাদের টিম তথ্য যাচাই করে অনুমোদন দিলেই সরাসরি আপনার ব্যাংক বা মোবাইল ওয়ালেটে অর্থ পৌঁছাবে।'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'ন্যূনতম কাগজপত্র ও দ্রুত অনুমোদন',
      desc: 'কোনো জটিল ও অতিরিক্ত নথিপত্র ছাড়াই সম্পূর্ণ ডিজিটাল প্রক্রিয়ায় দ্রুত ঋণ ছাড়।'
    },
    {
      icon: ShieldCheck,
      title: '১০০% স্বচ্ছ ও কোনো গোপন ফি নেই',
      desc: 'প্রসেসিং ফি এবং সুদের হার সম্পূর্ণ স্পষ্ট। কোনো অতিরিক্ত বা অপ্রত্যাশিত চার্জ কর্তন করা হয় না।'
    },
    {
      icon: Calculator,
      title: 'নমনীয় পরিশোধের কিস্তি শিডিউল',
      desc: '৩ মাস থেকে ৬০ মাস পর্যন্ত আপনার আয়ের সাথে সামঞ্জস্য রেখে মাসিক কিস্তির সময়সীমা বেছে নিন।'
    },
    {
      icon: Award,
      title: 'সহজ অগ্রিম পরিশোধ সুবিধা',
      desc: 'যেকোনো সময় অতিরিক্ত কিস্তি বা সম্পূর্ণ ঋণ অগ্রিম পরিশোধ করার অবাধ সুযোগ।'
    }
  ];

  // FAQ state & filters
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');

  const faqCategories = [
    { id: 'all', name: 'সকল প্রশ্ন' },
    { id: 'apply', name: 'আবেদন ও যোগ্যতা' },
    { id: 'repay', name: 'কিস্তি ও পরিশোধ' },
    { id: 'security', name: 'জামানত ও নিরাপত্তা' },
    { id: 'tracking', name: 'ট্র্যাকিং ও ফান্ড' }
  ];

  const faqs = [
    {
      id: 'faq-1',
      category: 'apply',
      q: 'লোনের আবেদনের জন্য কী কী কাগজপত্র প্রয়োজন?',
      a: 'সাধারণত জাতীয় পরিচয়পত্র (NID), পাসপোর্ট সাইজ ছবি, গত ৬ মাসের ব্যাংক হিসাবের বিবরণী অথবা আয়ের প্রমাণপত্র এবং বর্তমান ঠিকানার ইউটিলিটি বিলের কপি প্রয়োজন হয়।'
    },
    {
      id: 'faq-2',
      category: 'tracking',
      q: 'আবেদন করার কত সময়ের মধ্যে লোন পাওয়া যায়?',
      a: 'প্রয়োজনীয় সকল কাগজপত্র সঠিকভাবে জমা থাকলে জরুরি লোনের ক্ষেত্রে ৬ থেকে ১২ ঘণ্টা এবং সাধারণ পার্সোনাল বা বিজনেস লোনের ক্ষেত্রে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সরাসরি ব্যাংক বা ওয়ালেটে ফান্ড বিতরণ করা হয়।'
    },
    {
      id: 'faq-3',
      category: 'repay',
      q: 'আমি কীভাবে কিস্তি পরিশোধ করতে পারি?',
      a: 'আপনি বিকাশ, নগদ, রকেট, সরাসরি ব্যাংক ট্রান্সফার অথবা আমাদের যেকোনো ব্রাঞ্চে এসে ক্যাশের মাধ্যমে অত্যন্ত সহজে মাসিক কিস্তি পরিশোধ করতে পারবেন।'
    },
    {
      id: 'faq-4',
      category: 'security',
      q: 'লোন পেতে কি কোনো স্থাবর সম্পত্তির জামানত প্রয়োজন আছে?',
      a: 'ব্যক্তিগত লোন এবং জরুরি ক্ষুদ্র ঋণের ক্ষেত্রে কোনো জমি বা ফ্ল্যাটের জামানতের প্রয়োজন নেই; শুধু একজন নির্ভরযোগ্য গ্যারান্টার/নমিনীর তথ্য ও প্রাথমিক কাগজপত্র জমা দিলেই চলবে।'
    },
    {
      id: 'faq-5',
      category: 'tracking',
      q: 'আবেদনের বর্তমান অবস্থা কীভাবে ট্র্যাক করব?',
      a: 'আমাদের ওয়েবসাইটের "আবেদন ট্র্যাকিং" মেন্যুতে গিয়ে আপনার আবেদন আইডি (যেমন: LN-2026-XXXX) অথবা রেজিস্টার্ড মোবাইল নম্বর দিয়ে সার্চ করলেই তাৎক্ষণিক রিয়েলটাইম স্ট্যাটাস দেখা যাবে।'
    },
    {
      id: 'faq-6',
      category: 'repay',
      q: 'মেয়াদ শেষ হওয়ার আগেই কি সম্পূর্ণ লোন অগ্রিম পরিশোধ করা সম্ভব?',
      a: 'হ্যাঁ, আপনি যেকোনো সময় আপনার বকেয়া লোন এককালীন অগ্রিম পরিশোধ করে দিতে পারেন। এতে অতিরিক্ত কোনো গোপন জরিমানা বা চার্জ কাটা হয় না।'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeFaqCategory === 'all' || faq.category === activeFaqCategory;
    const query = faqSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const testimonials = [
    {
      name: 'ফারহানা ইসলাম',
      role: 'নারী উদ্যোক্তা, ঢাকা',
      comment: 'আমার বুটিক শপের জন্য সহজ লোন থেকে ৫ লক্ষ টাকা এসএমই ঋণ পেয়েছিলাম। পুরো প্রক্রিয়া অত্যন্ত দ্রুত ও ঝামেলামুক্ত ছিল।'
    },
    {
      name: 'মোস্তাফিজুর রহমান',
      role: 'চাকরিজীবী, মিরপুর',
      comment: 'জরুরি চিকিৎসার জন্য আমার তাৎক্ষণিক টাকার দরকার ছিল। আবেদন করার ১২ ঘণ্টার মধ্যেই আমার একাউন্টে টাকা চলে আসে।'
    },
    {
      name: 'আব্দুল করিম',
      role: 'খামারি, ময়মনসিংহ',
      comment: 'কৃষি ঋণের সুদের হার অনেক কম এবং ফসল কাটার পর কিস্তি দেওয়ার সুবিধা থাকায় আমি খামার বড় করতে পেরেছি।'
    }
  ];

  const getPackageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return Briefcase;
      case 'GraduationCap': return GraduationCap;
      case 'Zap': return Zap;
      case 'Tractor': return Tractor;
      default: return UserCheck;
    }
  };

  return (
    <CustomerLayout>
      {/* Hero Section with Gorgeous Ambient Lighting & Gradients */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-muted/20 border-b border-border/80 overflow-hidden">
        {/* Soft Modern Glow Blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-8%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary shadow-xs backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-primary animate-pulse" />
                <span>দ্রুত, নিরাপদ ও ঝামেলামুক্ত ঋণ প্রাপ্তি</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground leading-[1.2] tracking-tight">
                {settings.heroTitleBn}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                {settings.heroSubtitleBn}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2 w-full sm:w-auto">
                <Link to="/apply" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-7 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all rounded-xl gap-2 text-sm justify-center">
                    <span>এখনই লোন আবেদন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/packages" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-border hover:border-primary/40 text-foreground bg-card/60 backdrop-blur-md hover:bg-primary/5 hover:text-primary font-bold px-6 h-12 rounded-xl transition-all shadow-xs justify-center">
                    সকল লোন প্যাকেজ দেখুন
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/70 border border-border/70 backdrop-blur-xs shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground/90">কোনো লুকায়িত খরচ নেই</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/70 border border-border/70 backdrop-blur-xs shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground/90">২৪ ঘণ্টায় প্রাথমিক অনুমোদন</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/70 border border-border/70 backdrop-blur-xs shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground/90">নমনীয় কিস্তির সুবিধা</span>
                </div>
              </div>
            </div>

            {/* Right Quick EMI Calculator Card */}
            <div className="lg:col-span-5">
              <Card className="ed-card border-border/80 shadow-xl shadow-primary/5 bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4 border-b border-border/80 bg-gradient-to-r from-muted/50 to-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-serif font-black">কুইক লোন ক্যালকুলেটর</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        মাসিক আনুমানিক কিস্তি ও খরচের হিসাব দেখুন
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 font-bold px-2.5 py-1 rounded-full shadow-2xs">
                      {toBengaliNumber(quickRate)}% বার্ষিক সুদ
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Amount Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">লোনের পরিমাণ:</span>
                      <span className="font-bold text-base text-foreground font-mono">
                        {formatTaka(quickAmount)}
                      </span>
                    </div>
                    <Slider
                      value={[quickAmount]}
                      min={20000}
                      max={1000000}
                      step={10000}
                      onValueChange={(val) => setQuickAmount(val[0])}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>৳ ২০,০০০</span>
                      <span>৳ ৫,০০,০০০</span>
                      <span>৳ ১০,০০,০০০</span>
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">পরিশোধের মেয়াদ:</span>
                      <span className="font-bold text-base text-foreground">
                        {toBengaliNumber(quickMonths)} মাস ({toBengaliNumber(Math.round((quickMonths / 12) * 10) / 10)} বছর)
                      </span>
                    </div>
                    <Slider
                      value={[quickMonths]}
                      min={3}
                      max={36}
                      step={3}
                      onValueChange={(val) => setQuickMonths(val[0])}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>৩ মাস</span>
                      <span>১২ মাস</span>
                      <span>২৪ মাস</span>
                      <span>৩৬ মাস</span>
                    </div>
                  </div>

                  {/* Results Box */}
                  <div className="p-4 rounded-lg bg-muted/60 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">আনুমানিক মাসিক কিস্তি (EMI):</span>
                      <span className="text-xl font-bold text-accent font-serif">
                        {formatTaka(quickCalculation.monthlyEMI)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80 text-xs text-muted-foreground">
                      <div>
                        <span>মোট প্রদেয় সুদ: </span>
                        <strong className="text-foreground block font-mono">{formatTaka(quickCalculation.totalInterest)}</strong>
                      </div>
                      <div>
                        <span>সর্বমোট প্রদেয়: </span>
                        <strong className="text-foreground block font-mono">{formatTaka(quickCalculation.totalPayable)}</strong>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/apply?amount=${quickAmount}&duration=${quickMonths}`)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 rounded-xl"
                  >
                    এই পরিমাণে আবেদন করুন
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section with Elevated Floating Island */}
      <section className="bg-card/60 backdrop-blur-md border-b border-border/80 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="group/stat space-y-2 p-5 rounded-2xl bg-card border border-border/70 shadow-xs hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1 group-hover/stat:scale-110 group-hover/stat:bg-primary group-hover/stat:text-primary-foreground transition-all duration-300 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover/stat:text-foreground transition-colors">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Loan Packages */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background via-muted/15 to-background border-b border-border/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block mb-2">
                আমাদের ঋণ স্কিমসমূহ
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground mt-1">
                আপনার প্রয়োজন অনুযায়ী উপযুক্ত লোন বেছে নিন
              </h2>
            </div>
            <Link to="/packages">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl px-4 py-2 transition-all shadow-2xs">
                <span>সবগুলো প্যাকেজ দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.filter((p) => p.active).slice(0, 6).map((pkg) => {
              const Icon = getPackageIcon(pkg.iconName || 'Briefcase');
              return (
                <Card key={pkg.id} className="group/pkg flex flex-col justify-between border-border/70 hover:border-primary/50 bg-card/90 hover:bg-card transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 rounded-2xl h-full overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/pkg:scale-110 group-hover/pkg:bg-primary group-hover/pkg:text-primary-foreground transition-all duration-300 shadow-2xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      {pkg.badgeBn && (
                        <Badge variant="secondary" className="text-[11px] font-bold bg-primary/15 text-primary border border-primary/25 rounded-full px-2.5 py-0.5">
                          {pkg.badgeBn}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-serif mt-3 text-foreground font-black group-hover/pkg:text-primary transition-colors">
                      {pkg.nameBn}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                      {pkg.taglineBn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-1">
                    {/* Amount & Rate Grid */}
                    <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-muted/50 border border-border/50 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">সুদের হার (বার্ষিক)</span>
                        <strong className="text-foreground text-sm font-bold font-mono text-primary">{toBengaliNumber(pkg.defaultRate)}%</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">মেয়াদ</span>
                        <strong className="text-foreground text-sm font-bold">
                          {toBengaliNumber(pkg.minDurationMonths)}-{toBengaliNumber(pkg.maxDurationMonths)} মাস
                        </strong>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-border/60">
                        <span className="text-muted-foreground block text-[11px]">ঋণের সীমা</span>
                        <strong className="text-foreground text-sm font-bold font-mono">
                          {formatTaka(pkg.minAmount)} থেকে {formatTaka(pkg.maxAmount)}
                        </strong>
                      </div>
                    </div>

                    {/* Features preview */}
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {pkg.featuresBn.slice(0, 2).map((feat, fidx) => (
                        <li key={fidx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="font-medium text-foreground/80">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link to={`/apply?packageId=${pkg.id}`} className="flex-1">
                        <Button size="sm" className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/20 h-9 transition-transform active:scale-95">
                          আবেদন করুন
                        </Button>
                      </Link>
                      <Link to={`/packages?selected=${pkg.id}`}>
                        <Button variant="outline" size="sm" className="text-xs border-border hover:border-primary/40 text-foreground hover:bg-primary/5 hover:text-primary rounded-xl font-bold h-9">
                          বিস্তারিত
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scrollable Happy Customer Photos & Loan Ads Gallery directly under Loan Packages */}
      <PromotionMediaGallery />

      {/* 3 Step Process with Modern Stepper Flow */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/20 border-b border-border/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block">
              সহজ প্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground">
              মাত্র ৩টি সহজ ধাপে আপনার লোন হাতে পান
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              আমাদের স্বচ্ছ ও আধুনিক প্রযুক্তিভিত্তিক পদ্ধতিতে ঋণ গ্রহণের প্রতিটি ধাপ খুবই দ্রুত ও সহজবোধ্য।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {steps.map((s, idx) => (
              <div key={idx} className="group/step bg-card/95 hover:bg-card p-7 rounded-2xl border border-border/70 hover:border-primary/50 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-serif text-2xl font-black flex items-center justify-center shadow-md shadow-primary/25 group-hover/step:scale-105 transition-transform duration-300">
                  {toBengaliNumber(s.step)}
                </div>
                <h3 className="text-lg font-serif font-black text-foreground group-hover/step:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link to="/apply">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all rounded-xl px-8 h-12 gap-2 text-sm">
                <span>আজই আবেদন ফরম পূরণ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us (আমাদের অনন্য বৈশিষ্ট্য) */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background border-b border-border/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block">
              আমাদের অনন্য বৈশিষ্ট্য
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground">
              কেন হাজারো গ্রাহক আমাদের ওপর আস্থা রাখেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="group/benefit p-6 rounded-2xl border border-border/70 hover:border-primary/50 bg-card/90 hover:bg-card space-y-3.5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover/benefit:scale-110 group-hover/benefit:bg-primary group-hover/benefit:text-primary-foreground transition-all duration-300 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-black text-foreground group-hover/benefit:text-primary transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Customer Reviews / Happy Stories Showcase */}
      <CustomerReviewsSection />

      {/* Partner Banks Showcase */}
      <div id="partner-banks">
        <PartnerBanksSection />
      </div>

      {/* FAQ Section - Modern International Banking Style */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-background via-card/40 to-background border-b border-border/70 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          {/* Header section with badge & lead */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>সাধারণ প্রশ্নোত্তর ও হেল্প সেন্টার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground tracking-tight">
              আপনার প্রশ্নের সহজ সমাধান
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              লোন আবেদন, কিস্তি পরিশোধ এবং ডকুমেন্ট সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নগুলোর স্পষ্ট উত্তর নিচে দেখুন।
            </p>
          </div>

          {/* Interactive Search Bar & Category Filter */}
          <div className="max-w-xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা উত্তর খুঁজুন (যেমন: কিস্তি, কাগজপত্র, সময়)..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all outline-hidden"
              />
              {faqSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-muted/60 transition-colors"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {faqCategories.map((cat) => {
                const isActive = activeFaqCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveFaqCategory(cat.id)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all border ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-102'
                        : 'bg-card/80 text-muted-foreground border-border/80 hover:text-foreground hover:border-primary/30 hover:bg-card'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordion List with Spacious International Card Styling */}
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <AccordionItem
                  key={faq.id || idx}
                  value={`item-${idx}`}
                  className="group rounded-2xl border border-border/80 bg-card hover:bg-card/90 data-[state=open]:border-primary/40 data-[state=open]:shadow-md data-[state=open]:shadow-primary/5 transition-all overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-serif text-base sm:text-lg font-bold hover:no-underline py-5 px-6 sm:px-7 text-foreground hover:text-primary transition-colors flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3.5">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground transition-colors">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    <div className="pt-2 border-t border-border/40 pl-10">
                      {faq.a}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/50">
              <p className="text-sm font-medium text-muted-foreground">
                আপনার খোঁজা &ldquo;{faqSearchQuery}&rdquo; সম্পর্কিত কোনো প্রশ্নোত্তর পাওয়া যায়নি।
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setFaqSearchQuery(''); setActiveFaqCategory('all'); }}
                className="mt-3 text-xs rounded-xl"
              >
                সব প্রশ্ন দেখুন
              </Button>
            </div>
          )}

          {/* Fast Help Footnote Strip */}
          <div className="mt-10 p-5 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">আরও কোনো প্রশ্ন আছে?</p>
                <p className="text-xs text-muted-foreground">আমাদের গ্রাহক সেবা টিম সার্বক্ষণিক আপনার সহযোগিতায় প্রস্তুত।</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => setSupportModalOpen(true)}
                className="rounded-xl text-xs font-bold px-4 h-9 shadow-xs"
              >
                সরাসরি বার্তা পাঠান
              </Button>
              <a href={`tel:${(settings.supportPhone || '').replace(/[^\d+]/g, '')}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold px-4 h-9 border-border hover:border-primary/40"
                >
                  কল করুন
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Emergency Help Banner with Modern Glass/Gradient Finish */}
      <section className="py-14 bg-gradient-to-b from-card via-card/80 to-background border-t border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden">
            <div className="space-y-2.5 max-w-xl">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-foreground tracking-tight">
                কোনো বিষয়ে সাহায্য বা পরামর্শ প্রয়োজন?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                আমাদের বিশেষজ্ঞ লোন অফিসাররা সপ্তাহের ৬ দিন সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত আপনার সেবায় নিয়োজিত।
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full md:w-auto shrink-0">
              <a href={`tel:${(settings.supportPhone || '').replace(/[^\d+]/g, '')}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 rounded-xl gap-2 font-bold px-6 h-12 text-sm transition-all justify-center">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>
                    {(settings.supportPhone || '').replace(/^.*?(?:যোগাযোগ\s*নম্বর|মোবাইল|ফোন|হটলাইন|হেল্পলাইন)[:\s-]*/gi, '').trim() || settings.supportPhone}
                  </span>
                </Button>
              </a>
              <Link to="/calculator" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-border hover:border-primary/40 text-foreground bg-card hover:bg-primary/5 hover:text-primary font-bold rounded-xl px-6 h-12 text-sm transition-all shadow-2xs justify-center">
                  লোন ক্যালকুলেটর
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Customer Deposit Modal */}
      <CustomerDepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />

      {/* Customer Support Modal */}
      <CustomerSupportModal open={supportModalOpen} onOpenChange={setSupportModalOpen} />
    </CustomerLayout>
  );
};
