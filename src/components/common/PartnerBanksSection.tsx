import React, { useRef, useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const PartnerBanksSection: React.FC = () => {
  const { partnerBanks } = useLoan();
  const activeBanks = partnerBanks.filter((b) => b.active);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Mouse drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  if (activeBanks.length === 0) return null;

  // Duplicate list to achieve continuous infinite marquee effect
  const displayBanks = [...activeBanks, ...activeBanks, ...activeBanks];

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section className="py-14 bg-gradient-to-b from-muted/20 via-background to-muted/30 border-y border-border/80 overflow-hidden relative">
      <div className="container max-w-6xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="outline" className="px-3 py-1 bg-background/80 backdrop-blur-xs text-primary border-primary/25 text-xs font-bold gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
              সহযোগী ও পার্টনার নেটওয়ার্ক
            </Badge>

            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              আমাদের সহযোগী ও পার্টনার ব্যাংকসমূহ
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              গ্রাহকদের নিরাপদ ও দ্রুত ঋণ সেবা নিশ্চিতে বাংলাদেশের শীর্ষস্থানীয় তফসিলি ব্যাংকসমূহ।
            </p>
          </div>

          {/* Clean Left/Right Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={scrollPrev}
              className="p-2 rounded-xl bg-card border border-border shadow-2xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer active:scale-95"
              title="পূর্ববর্তী ব্যাংক"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="p-2 rounded-xl bg-card border border-border shadow-2xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer active:scale-95"
              title="পরবর্তী ব্যাংক"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Bank Card Carousel with Mouse Drag and Smooth Hover */}
      <div className="relative w-full overflow-hidden group select-none">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto no-scrollbar py-3 px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab scroll-smooth'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="animate-partner-marquee flex gap-4 sm:gap-5 items-center">
            {displayBanks.map((bank, idx) => {
              const hasLink = Boolean(bank.websiteUrl);
              const cardKey = `partner-${bank.id}-${idx}`;

              const LogoItem = (
                <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-card/90 hover:bg-card border border-border/70 hover:border-primary/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-w-[210px] sm:min-w-[240px] group/card">
                  {/* Clean rounded logo frame */}
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center p-2 shrink-0 transition-transform duration-300 group-hover/card:scale-105 overflow-hidden">
                    <img
                      src={bank.logoUrl}
                      alt={bank.nameBn}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/banks/sonali.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover/card:text-primary transition-colors truncate">
                      {bank.nameBn}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                      {bank.nameEn}
                    </p>
                  </div>
                  {hasLink && (
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover/card:text-primary transition-colors shrink-0" />
                  )}
                </div>
              );

              return hasLink ? (
                <a
                  key={cardKey}
                  href={bank.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-hidden shrink-0"
                  title={`${bank.nameBn} (${bank.nameEn})`}
                  onClick={(e) => {
                    // Prevent accidental navigation when dragging
                    if (isDragging) e.preventDefault();
                  }}
                >
                  {LogoItem}
                </a>
              ) : (
                <div key={cardKey} className="shrink-0">{LogoItem}</div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>বাংলাদেশ ব্যাংক ও আন্তর্জাতিক ব্যাংকিং গাইডলাইন অনুযায়ী পরিচালিত</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>সরাসরি ব্যাংক একাউন্টে তাৎক্ষণিক ফান্ড ট্রান্সফার ও ভেরিফিকেশন</span>
          </div>
        </div>
      </div>
    </section>
  );
};


