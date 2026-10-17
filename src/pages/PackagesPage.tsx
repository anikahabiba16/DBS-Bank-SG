import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { LoanCategory } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Briefcase, 
  UserCheck, 
  GraduationCap, 
  Zap, 
  Tractor, 
  Calculator,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PromotionMediaGallery } from '@/components/common/PromotionMediaGallery';

export const PackagesPage: React.FC = () => {
  const { packages } = useLoan();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as LoanCategory) || 'all';
  const selectedPackageId = searchParams.get('selected');

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(selectedPackageId);

  const categories = [
    { id: 'all', label: 'সকল লোন' },
    { id: 'personal', label: 'ব্যক্তিগত ঋণ' },
    { id: 'business', label: 'ব্যবসা ঋণ' },
    { id: 'education', label: 'শিক্ষা ঋণ' },
    { id: 'emergency', label: 'জরুরি ঋণ' },
    { id: 'agriculture', label: 'কৃষি ও ডেইরি ঋণ' }
  ];

  const filteredPackages = packages.filter((pkg) => {
    if (!pkg.active) return false;
    if (activeCategory === 'all') return true;
    return pkg.category === activeCategory;
  });

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
      {/* Header Banner */}
      {/* Header Banner - Enhanced padding to avoid top-clipping on mobile */}
      <div className="bg-gradient-to-b from-muted/60 via-muted/30 to-background border-b border-border pt-6 pb-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md inline-block">
              সুবিধাজনক আর্থিক স্কিম
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-foreground leading-normal sm:leading-snug pt-1 pb-1 overflow-visible">
              আমাদের সকল লোন প্যাকেজ ও সুদের হার
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              আপনার প্রয়োজন এবং সুবিধার কথা বিবেচনা করে আমাদের লোন স্কিমগুলো সাজানো হয়েছে। সহজ শর্ত, কম সুদের হার এবং নমনীয় কিস্তির সুবিধা নিয়ে এগিয়ে যান স্বপ্নের পথে।
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Category Tabs - High Contrast, Crisp Typography and Mobile Horizontal Scroll */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs
              value={activeCategory}
              onValueChange={(val) => {
                setActiveCategory(val);
                setSearchParams(val === 'all' ? {} : { category: val });
              }}
              className="w-auto"
            >
              <TabsList className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md p-1.5 h-auto flex flex-nowrap sm:flex-wrap items-center gap-2 rounded-2xl w-max">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary/30 border border-transparent data-[state=inactive]:text-foreground/90 data-[state=inactive]:hover:bg-muted/80 whitespace-nowrap"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Link to="/calculator" className="shrink-0 self-start sm:self-auto">
            <Button size="sm" className="gap-1.5 text-xs font-bold h-10 px-4 rounded-xl shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
              <Calculator className="w-4 h-4 text-primary-foreground shrink-0" />
              <span>লোন ক্যালকুলেটরে যাচাই করুন</span>
            </Button>
          </Link>
        </div>

        {/* Packages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredPackages.map((pkg) => {
            const Icon = getPackageIcon(pkg.iconName || 'Briefcase');
            const isExpanded = expandedPackageId === pkg.id;

            return (
              <Card
                key={pkg.id}
                id={pkg.id}
                className="rounded-2xl border-2 border-border/80 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <CardHeader className="pb-4 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-serif font-black text-foreground">
                            {pkg.nameBn}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground font-medium">{pkg.nameEn}</span>
                        </div>
                      </div>
                      {pkg.badgeBn && (
                        <Badge className="bg-primary/10 text-primary border border-primary/30 font-bold text-xs shrink-0 px-2.5 py-0.5 rounded-full">
                          {pkg.badgeBn}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs sm:text-sm mt-3 text-muted-foreground leading-relaxed">
                      {pkg.taglineBn}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 space-y-5">
                    {/* Key Metrics - High Contrast Executive Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/60 border border-border/80 text-xs shadow-inner">
                      <div>
                        <span className="text-muted-foreground block font-medium">বার্ষিক সুদের হার</span>
                        <span className="text-xl sm:text-2xl font-black font-serif text-primary block mt-0.5">
                          {toBengaliNumber(pkg.defaultRate)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-medium">পরিশোধের মেয়াদ</span>
                        <span className="text-sm sm:text-base font-bold text-foreground block mt-0.5 font-mono">
                          {toBengaliNumber(pkg.minDurationMonths)} - {toBengaliNumber(pkg.maxDurationMonths)} মাস
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-muted-foreground block font-medium">প্রসেসিং ফি</span>
                        <span className="text-sm sm:text-base font-bold text-foreground block mt-0.5 font-mono">
                          {toBengaliNumber(pkg.processingFeePercent)}%
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-3 pt-3 border-t border-border/80 flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">ঋণের পরিমাণ:</span>
                        <span className="font-black text-foreground text-sm sm:text-base font-mono">
                          {formatTaka(pkg.minAmount)} থেকে {formatTaka(pkg.maxAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                      {pkg.descriptionBn}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                        মূল সুবিধাসমূহ:
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {pkg.featuresBn.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Collapsible Details: Eligibility & Required Docs */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-border bg-muted/20 p-4 rounded-lg">
                        <div>
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                            আবেদনের যোগ্যতা:
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {(pkg.eligibilityBn || []).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-accent">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                            প্রয়োজনীয় কাগজপত্র:
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {(pkg.requiredDocsBn || []).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-accent">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Footer Actions */}
                <div className="p-5 sm:p-6 pt-0 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-card">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                    className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
                  >
                    {isExpanded ? (
                      <span className="flex items-center gap-1">কম দেখুন <ChevronUp className="w-3.5 h-3.5" /></span>
                    ) : (
                      <span className="flex items-center gap-1">যোগ্যতা ও নথিপত্র দেখুন <ChevronDown className="w-3.5 h-3.5" /></span>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Link to={`/calculator?packageId=${pkg.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl border-border/80">
                        হিসাব করুন
                      </Button>
                    </Link>
                    <Link to={`/apply?packageId=${pkg.id}`}>
                      <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-xs px-4">
                        আবেদন করুন →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scrollable Happy Customers & Loan Ads Promotion Gallery directly below packages */}
      <PromotionMediaGallery className="mt-4" />
    </CustomerLayout>
  );
};
