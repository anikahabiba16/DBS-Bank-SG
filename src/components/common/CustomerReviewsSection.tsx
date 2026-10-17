import React from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquareQuote, CheckCircle2, ShieldCheck, Quote } from 'lucide-react';
import { formatTaka } from '@/services/storage';

export const CustomerReviewsSection: React.FC = () => {
  const { settings } = useLoan();
  const reviews = settings.customerReviews || [];

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20 border-t border-border">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            গ্রাহক অভিজ্ঞতা ও হ্যাপি স্টোরিজ
          </Badge>
          <h2 className="text-xl md:text-2xl font-black text-foreground">
            আমাদের সম্মানিত গ্রাহকদের সফলতার গল্প
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            হাজারো ক্ষুদ্র উদ্যোক্তা ও সাধারণ মানুষের বিশ্বস্ত আর্থিক সঙ্গী সহজ লোন
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => {
            const name = rev.nameBn || rev.name || rev.customerName || 'সম্মানিত গ্রাহক';
            const role = rev.designationBn || rev.role || rev.professionBn || 'উদ্যোক্তা';
            const location = rev.districtBn || rev.locationBn || 'বাংলাদেশ';
            const comment = rev.reviewTextBn || rev.reviewBn || rev.comment || '';
            const avatar = rev.avatarUrl || rev.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

            return (
              <Card key={rev.id} className="border shadow-xs rounded-2xl overflow-hidden bg-card flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  {/* Rating Stars & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {(rev.isVerified ?? true) && (
                      <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        ভেরিফাইড প্রাপক
                      </Badge>
                    )}
                  </div>

                  <div className="relative">
                    <Quote className="w-6 h-6 text-primary/15 absolute -top-1 -left-2 rotate-180" />
                    <p className="text-xs sm:text-sm text-foreground/90 font-medium pl-4 leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>

                  {rev.loanAmount && (
                    <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] flex items-center justify-between font-mono">
                      <span className="text-muted-foreground">গৃহীত ঋণ:</span>
                      <strong className="text-emerald-700 font-bold">
                        {typeof rev.loanAmount === 'number' ? formatTaka(rev.loanAmount) : rev.loanAmount}
                      </strong>
                    </div>
                  )}
                </CardContent>

                {/* Reviewer Profile Card Footer */}
                <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 bg-muted">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{name}</h4>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {role} • {location}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
