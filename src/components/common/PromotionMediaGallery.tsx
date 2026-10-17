import React, { useState, useRef } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { PromotionMediaItem } from '@/types/loan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Megaphone, 
  Users, 
  Coins, 
  MapPin, 
  Briefcase,
  Quote,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromotionMediaGalleryProps {
  className?: string;
  defaultFilter?: 'all' | 'happy_customer' | 'loan_ad';
  showFilterTabs?: boolean;
}

export const PromotionMediaGallery: React.FC<PromotionMediaGalleryProps> = ({
  className = '',
  defaultFilter = 'all',
  showFilterTabs = true
}) => {
  const { promotionMedia } = useLoan();
  const [activeTab, setActiveTab] = useState<'all' | 'happy_customer' | 'loan_ad'>(defaultFilter);
  const [selectedItem, setSelectedItem] = useState<PromotionMediaItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter only active items and apply category filter
  const activeItems = (promotionMedia || []).filter((item) => item.active !== false);
  const filteredItems = activeItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 bg-gradient-to-b from-muted/30 via-background to-muted/20 border-y border-border/40 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>সফল গ্রাহকদের গল্প ও আকর্ষণীয় অফার</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              আমাদের হ্যাপি কাস্টমার ও লোন বিজ্ঞাপন গ্যালারি
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1.5 max-w-2xl">
              সহজ শর্তে ঋণ নিয়ে যারা সফল হয়েছেন তাদের অভিজ্ঞতা দেখুন এবং চলমান বিশেষ আর্থিক সুবিধাসমূহ স্ক্রল করে যাচাই করুন।
            </p>
          </div>

          {/* Controls: Scroll Buttons & Optional Filters */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              className="h-10 w-10 rounded-full border-border/80 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
              title="বামে স্ক্রোল করুন"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              className="h-10 w-10 rounded-full border-border/80 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
              title="ডানে স্ক্রোল করুন"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        {showFilterTabs && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full text-xs font-medium h-8 px-4"
            >
              সকল ছবি ও অফার ({activeItems.length})
            </Button>
            <Button
              variant={activeTab === 'happy_customer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('happy_customer')}
              className="rounded-full text-xs font-medium h-8 px-4 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              হ্যাপি কাস্টমারবৃন্দ ({activeItems.filter((i) => i.category === 'happy_customer').length})
            </Button>
            <Button
              variant={activeTab === 'loan_ad' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('loan_ad')}
              className="rounded-full text-xs font-medium h-8 px-4 flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              লোন প্রমোশন বিজ্ঞাপন ({activeItems.filter((i) => i.category === 'loan_ad').length})
            </Button>
          </div>
        )}

        {/* Horizontal Scrollable Gallery Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[290px] sm:w-[330px] md:w-[360px] group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <Card className="h-full overflow-hidden border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col bg-card">
                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.titleBn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category & Badge Top overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    {item.category === 'happy_customer' ? (
                      <Badge className="bg-emerald-600/90 text-white font-medium text-xs px-2.5 py-0.5 backdrop-blur-sm shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>হ্যাপি কাস্টমার</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-600/90 text-white font-medium text-xs px-2.5 py-0.5 backdrop-blur-sm shadow-sm flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        <span>লোন বিজ্ঞাপন</span>
                      </Badge>
                    )}

                    {item.badgeBn && (
                      <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm border border-border/40">
                        {item.badgeBn}
                      </Badge>
                    )}
                  </div>

                  {/* Loan Amount bottom overlay */}
                  {item.loanAmount && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold border border-white/20">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.category === 'happy_customer' ? 'অনুমোদিত লোন:' : 'লোন পরিসীমা:'} {item.loanAmount}</span>
                      </div>
                      <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-1.5 rounded-full transition-colors">
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.titleBn}
                    </h3>

                    {/* Metadata for happy customer */}
                    {item.category === 'happy_customer' && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5 mb-2">
                        {item.customerProfession && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-primary/70" />
                            {item.customerProfession}
                          </span>
                        )}
                        {item.customerLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary/70" />
                            {item.customerLocation}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Short Story / Caption */}
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.captionBn || item.storyBn}
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                    <span className="flex items-center gap-1 group-hover:underline">
                      {item.category === 'happy_customer' ? 'সফলতার গল্প দেখুন' : 'বিজ্ঞাপনের বিস্তারিত'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Scroll hint indicator for mobile */}
        <div className="flex md:hidden items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
          <span>👈 ডানে বা বামে স্ক্রোল করে আরও দেখুন 👉</span>
        </div>
      </div>

      {/* Detail / Full View Modal Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto p-0">
            {/* Modal Image Header */}
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full bg-black/90">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.titleBn}
                className="w-full h-full object-contain md:object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={selectedItem.category === 'happy_customer' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}>
                  {selectedItem.category === 'happy_customer' ? 'হ্যাপি কাস্টমার স্টোরি' : 'লোন প্রমোশন অফার'}
                </Badge>
                {selectedItem.badgeBn && (
                  <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border border-white/20">
                    {selectedItem.badgeBn}
                  </Badge>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 space-y-4">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
                  {selectedItem.titleBn}
                </DialogTitle>
                {selectedItem.captionBn && (
                  <DialogDescription className="text-sm md:text-base text-muted-foreground font-medium">
                    {selectedItem.captionBn}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Specific info grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-muted/40 border border-border/50 text-xs md:text-sm">
                {selectedItem.loanAmount && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">লোনের পরিমাণ</span>
                    <span className="font-bold text-foreground text-sm text-primary flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      {selectedItem.loanAmount}
                    </span>
                  </div>
                )}

                {selectedItem.customerName && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">গ্রাহকের নাম</span>
                    <span className="font-bold text-foreground">{selectedItem.customerName}</span>
                  </div>
                )}

                {selectedItem.customerProfession && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">পেশা</span>
                    <span className="font-semibold text-foreground">{selectedItem.customerProfession}</span>
                  </div>
                )}

                {selectedItem.customerLocation && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">এলাকা / জেলা</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {selectedItem.customerLocation}
                    </span>
                  </div>
                )}

                {selectedItem.date && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">তারিখ</span>
                    <span className="font-medium text-foreground">{selectedItem.date}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground block text-[11px]">ভেরিফিকেশন স্ট্যাটাস</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    অফিসিয়ালি ভেরিফাইড
                  </span>
                </div>
              </div>

              {/* Story / Description Text */}
              {selectedItem.storyBn && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 relative">
                  <Quote className="w-6 h-6 text-primary/30 absolute top-2 right-2" />
                  <p className="text-sm md:text-base text-foreground leading-relaxed italic pr-6">
                    "{selectedItem.storyBn}"
                  </p>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  বন্ধ করুন
                </Button>
                {selectedItem.ctaLink ? (
                  <Button asChild className="gap-2">
                    <Link to={selectedItem.ctaLink} onClick={() => setSelectedItem(null)}>
                      {selectedItem.ctaTextBn || 'আবেদন করুন'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="gap-2">
                    <Link to="/apply" onClick={() => setSelectedItem(null)}>
                      এখনই লোন আবেদন করুন
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};
