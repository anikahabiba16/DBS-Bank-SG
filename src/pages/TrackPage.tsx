import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { LoanApplication, ApplicationStatus } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export const TrackPage: React.FC = () => {
  const { getApplicationById, applications } = useLoan();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [foundApplication, setFoundApplication] = useState<LoanApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, [queryParam]);

  const handleSearch = (q: string) => {
    setHasSearched(true);
    if (!q.trim()) {
      setFoundApplication(null);
      return;
    }
    const app = getApplicationById(q.trim());
    setFoundApplication(app || null);
    if (app) {
      setSearchParams({ query: q.trim() });
    } else {
      toast.error('উক্ত আবেদন আইডি বা নম্বরে কোনো তথ্য পাওয়া যায়নি');
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">পেন্ডিং / অপেক্ষমাণ</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">যাচাইাধীন</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-600 text-white">অনুমোদিত</Badge>;
      case 'disbursed':
        return <Badge className="bg-foreground text-background">ঋণ বিতরণকৃত</Badge>;
      case 'rejected':
        return <Badge variant="destructive">বাতিলকৃত</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-700 text-white">সম্পূর্ণ পরিশোধিত</Badge>;
      default:
        return null;
    }
  };

  const getStepProgress = (status: ApplicationStatus) => {
    if (status === 'rejected') return -1;
    if (status === 'pending') return 1;
    if (status === 'under_review') return 2;
    if (status === 'approved') return 3;
    if (status === 'disbursed' || status === 'completed') return 4;
    return 1;
  };

  const progressLevel = foundApplication ? getStepProgress(foundApplication.status) : 0;

  const timelineSteps = [
    { num: 1, label: 'আবেদন দাখিল' },
    { num: 2, label: 'ডকুমেন্ট যাচাই' },
    { num: 3, label: 'ঋণ অনুমোদন' },
    { num: 4, label: 'ফান্ড বিতরণ' }
  ];

  return (
    <CustomerLayout>
      <div className="bg-muted/40 border-b border-border py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              রিয়েল-টাইম তথ্য
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground">
              লোন আবেদনের লাইভ অবস্থা ট্র্যাক করুন
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              আপনার আবেদনের রেফারেন্স নম্বর (যেমন: LN-2026-1001) অথবা আবেদনে ব্যবহৃত মোবাইল নম্বর দিয়ে অনুসন্ধান করুন।
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Search Bar */}
        <Card className="ed-card border-border">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="রেফারেন্স আইডি (যেমন: LN-2026-1001) বা মোবাইল নম্বর..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                সন্ধান করুন
              </Button>
            </form>

            {/* Example Tracking Links */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>উদাহরণ ট্র্যাকিং আইডি:</span>
              <button
                type="button"
                onClick={() => { setSearchQuery('LN-2026-1001'); handleSearch('LN-2026-1001'); }}
                className="underline hover:text-accent font-mono"
              >
                LN-2026-1001 (বিতরণকৃত)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setSearchQuery('LN-2026-1002'); handleSearch('LN-2026-1002'); }}
                className="underline hover:text-accent font-mono"
              >
                LN-2026-1002 (যাচাইাধীন)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setSearchQuery('LN-2026-1005'); handleSearch('LN-2026-1005'); }}
                className="underline hover:text-accent font-mono"
              >
                LN-2026-1005 (বাতিলকৃত)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Found Application Details */}
        {foundApplication && (
          <div className="space-y-6">
            <Card className="ed-card border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-bold text-foreground">
                        {foundApplication.id}
                      </span>
                      {getStatusBadge(foundApplication.status)}
                    </div>
                    <CardDescription className="text-xs mt-1">
                      আবেদনের তারিখ: {foundApplication.appliedDate}
                    </CardDescription>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">ঋণের পরিমাণ</span>
                    <span className="text-xl font-serif font-bold text-accent">
                      {formatTaka(foundApplication.loanAmount)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Visual Progress Steps */}
                {progressLevel === -1 ? (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>আবেদনটি বাতিল করা হয়েছে</span>
                    </div>
                    <p className="text-xs text-red-700">
                      কারণ: {foundApplication.rejectedReason || 'নীতিমালা পূরণ হয়নি'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {timelineSteps.map((step) => {
                        const isDone = progressLevel >= step.num;
                        const isCurrent = progressLevel === step.num;
                        return (
                          <div key={step.num} className="space-y-2">
                            <div
                              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : toBengaliNumber(step.num)}
                            </div>
                            <span
                              className={`text-[11px] block ${
                                isCurrent
                                  ? 'font-bold text-foreground'
                                  : isDone
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block">আবেদনকারীর নাম</span>
                    <strong className="text-foreground text-sm">{foundApplication.applicantName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">মোবাইল নম্বর</span>
                    <strong className="text-foreground text-sm font-mono">{foundApplication.phone}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">লোন স্কিম</span>
                    <strong className="text-foreground">{foundApplication.packageName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">মেয়াদ ও কিস্তি</span>
                    <strong className="text-foreground">
                      {toBengaliNumber(foundApplication.durationMonths)} মাস (প্রতি মাসে {formatTaka(foundApplication.monthlyEMI)})
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">সুদের হার</span>
                    <strong className="text-foreground">{toBengaliNumber(foundApplication.interestRate)}% বার্ষিক</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">সর্বমোট প্রদেয়</span>
                    <strong className="text-foreground font-mono">{formatTaka(foundApplication.totalPayable)}</strong>
                  </div>
                </div>

                {/* Admin Note if any */}
                {foundApplication.adminNotes && (
                  <div className="p-3.5 rounded-lg bg-muted/60 border border-border text-xs space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" /> কর্মকর্তা পর্যালোচনা ও নোট:
                    </span>
                    <p className="text-muted-foreground">{foundApplication.adminNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    কোনো জিজ্ঞাসা থাকলে আমাদের হেল্পলাইনে যোগাযোগ করুন: <strong>+৮৮০ ১৭ ১২৩৪ ৫৬৭৮</strong>
                  </div>
                  {(foundApplication.status === 'disbursed' || foundApplication.status === 'approved') && (
                    <Link to="/dashboard">
                      <Button size="sm" className="bg-foreground text-background hover:bg-accent hover:text-accent-foreground text-xs gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>কিস্তির শিডিউল ও পেমেন্ট দেখুন</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {hasSearched && !foundApplication && (
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-serif font-semibold text-foreground">
              কোনো লোন আবেদন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              অনুগ্রহ করে আপনার সঠিক রেফারেন্স আইডি বা আবেদনের সময় ব্যবহৃত মোবাইল নম্বরটি পুনরায় যাচাই করে দিন।
            </p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
