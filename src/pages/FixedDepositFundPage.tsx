import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PiggyBank, 

  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Percent, 
 
  Zap, 

  Eye,
  PlusCircle,

  History,
  Lock
} from 'lucide-react';
import { formatTaka, toBengaliNumber } from '@/services/storage';


export const FixedDepositFundPage: React.FC = () => {
  const { currentUser, customerFixedDeposits, refreshCustomerFixedDeposits } = useLoan();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'ledger'>('active');

  // Real-time listener for FD updates
  useEffect(() => {
    const handleSync = () => {
      refreshCustomerFixedDeposits();
    };
    window.addEventListener('loan_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('loan_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshCustomerFixedDeposits]);

  // Filter user's fixed deposits
  const myDeposits = customerFixedDeposits.filter(
    (d) => currentUser && (d.userId === currentUser.id || d.phone === currentUser.phone)
  );

  const activeDeposits = myDeposits.filter((d) => d.status === 'active');
  const pendingDeposits = myDeposits.filter((d) => d.status === 'pending');
  const rejectedDeposits = myDeposits.filter((d) => d.status === 'rejected');

  const totalPrincipal = activeDeposits.reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);
  const totalProfitEarned = activeDeposits.reduce((acc, curr) => acc + (curr.totalProfitEarned || 0), 0);
  const totalFundBalance = totalPrincipal + totalProfitEarned;

  const totalDailyIncome = activeDeposits.reduce((acc, curr) => {
    const rate = curr.dailyProfitPercent || 1.5;
    return acc + Math.round((curr.depositAmount * rate) / 100);
  }, 0);

  return (
    <CustomerLayout>
      <div className="bg-gradient-to-b from-primary/10 via-background to-background py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-5xl space-y-6">
          
          {/* Top Title & Quick Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <PiggyBank className="w-6 h-6" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    আমার ফিক্সড ডিপোজিট ফান্ড
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    আপনার স্থায়ী আমানত ব্যালেন্স, অর্জিত মুনাফা ও দৈনিক অটো কমিশন ট্র্যাকার
                  </p>
                </div>
              </div>
            </div>

            <Link to="/fixed-deposit" className="shrink-0">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                নতুন ডিপোজিট স্কিম নিন
              </Button>
            </Link>
          </div>

          {/* Master Live Fund Balance Widget */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 md:p-8 shadow-xl border border-emerald-700/40">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-6 top-6 opacity-15 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>রিয়েল-টাইম ফান্ড ওয়ালেট</span>
                </div>
                <div className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  ১০০% সুরক্ষিত আমানত
                </div>
              </div>

              <div>
                <span className="text-xs md:text-sm text-emerald-200 font-medium block">
                  মোট ফিক্সড ডিপোজিট ফান্ড ব্যালেন্স (আসল + মোট অর্জিত মুনাফা)
                </span>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight mt-1 text-white">
                  {formatTaka(totalFundBalance)}
                </div>
              </div>

              {/* Sub balances strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-emerald-200 block text-[11px]">মূল জমা (আসল মূলধন)</span>
                  <strong className="text-lg font-bold font-mono text-white block mt-0.5">
                    {formatTaka(totalPrincipal)}
                  </strong>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-emerald-200 block text-[11px]">মোট অর্জিত কমিশন / লাভ</span>
                  <strong className="text-lg font-bold font-mono text-emerald-300 block mt-0.5">
                    +{formatTaka(totalProfitEarned)}
                  </strong>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-emerald-200 block text-[11px]">দৈনিক নিশ্চিত মুনাফা বৃদ্ধি</span>
                  <strong className="text-lg font-bold font-mono text-amber-300 block mt-0.5">
                    +{formatTaka(totalDailyIncome)}/দিন
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 pt-1">
                <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  অ্যাডমিন নির্ধারিত কমিশন অনুযায়ী প্রতিদিন স্বয়ংক্রিয়ভাবে আপনার ব্যালেন্সে লাভ যোগ হয়।
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">সক্রিয় স্কিম</span>
                  <strong className="text-lg font-black text-foreground mt-0.5 block">
                    {toBengaliNumber(activeDeposits.length)} টি
                  </strong>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <PiggyBank className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">অপেক্ষমাণ আবেদন</span>
                  <strong className="text-lg font-black text-amber-600 mt-0.5 block">
                    {toBengaliNumber(pendingDeposits.length)} টি
                  </strong>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">গড় দৈনিক কমিশন হার</span>
                  <strong className="text-lg font-black text-emerald-600 mt-0.5 block">
                    {activeDeposits.length > 0 
                      ? `${toBengaliNumber(activeDeposits[0].dailyProfitPercent || 1.5)}%` 
                      : '০.০%'}
                  </strong>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Percent className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">মোট সঞ্চয় রিটার্ন</span>
                  <strong className="text-lg font-black text-primary mt-0.5 block">
                    +{formatTaka(totalProfitEarned)}
                  </strong>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b space-x-2 md:space-x-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>সক্রিয় স্কিমসমূহ ({activeDeposits.length} টি)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>অপেক্ষমাণ ও যাচাইাধীন আবেদন ({pendingDeposits.length} টি)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-4 h-4 text-primary" />
              <span>দৈনিক কমিশন স্টেটমেন্ট</span>
            </button>
          </div>

          {/* TAB 1: ACTIVE SCHEMES */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeDeposits.length === 0 ? (
                <Card className="border shadow-xs text-center p-8 sm:p-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
                    <PiggyBank className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">আপনার কোনো সক্রিয় ফিক্সড ডিপোজিট নেই</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    প্রতিদিন আকর্ষণীয় পার্সেন্টেজ হারে লাভ অর্জন করতে এখনই একটি মেয়াদী ফিক্সড ডিপোজিট স্কিমে আবেদন করুন।
                  </p>
                  <Link to="/fixed-deposit">
                    <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 px-4 gap-1.5 shadow-sm">
                      <PlusCircle className="w-4 h-4" />
                      স্কিম তালিকা দেখুন
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDeposits.map((dep) => {
                    const dailyRate = dep.dailyProfitPercent || 1.5;
                    const dailyProfit = Math.round((dep.depositAmount * dailyRate) / 100);

                    return (
                      <Card key={dep.id} className="border shadow-sm overflow-hidden flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2 bg-gradient-to-r from-emerald-500/5 to-transparent border-b">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px] mb-1">
                                সক্রিয় ও প্রফিট চালু
                              </Badge>
                              <CardTitle className="text-base font-bold text-foreground">
                                {dep.schemeTitleBn}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                ট্রানজেকশন: <span className="font-mono">{dep.transactionId || 'N/A'}</span> ({dep.paymentMethod})
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground block">আসল জমা</span>
                              <strong className="text-lg font-black text-foreground font-mono">
                                {formatTaka(dep.depositAmount)}
                              </strong>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3">
                          {/* Rate and profit highlight */}
                          <div className="grid grid-cols-2 gap-2 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs">
                            <div>
                              <span className="text-[11px] text-emerald-800 font-semibold block">নির্ধারিত কমিশন হার:</span>
                              <strong className="text-base font-black text-emerald-700 font-mono">
                                {toBengaliNumber(dailyRate)}% <span className="text-xs font-normal">/দিন</span>
                              </strong>
                            </div>
                            <div>
                              <span className="text-[11px] text-emerald-800 font-semibold block">প্রতিদিন স্বয়ংক্রিয় লাভ:</span>
                              <strong className="text-base font-black text-emerald-700 font-mono">
                                +{formatTaka(dailyProfit)}
                              </strong>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                            <div className="flex justify-between">
                              <span>এ পর্যন্ত মোট অর্জিত মুনাফা:</span>
                              <strong className="text-primary font-bold font-mono text-sm">
                                +{formatTaka(dep.totalProfitEarned || 0)}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>শুরুর তারিখ:</span>
                              <span className="font-mono text-foreground">{dep.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>মেয়াদ উত্তীর্ণের তারিখ:</span>
                              <span className="font-mono text-foreground">{dep.maturityDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>শেষ মুনাফা বণ্টনের তারিখ:</span>
                              <span className="font-mono text-foreground">{dep.lastAccruedDate || dep.startDate}</span>
                            </div>
                          </div>

                          <div className="border-t pt-2.5 flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">মোট প্রদেয় মেয়াদ শেষে:</span>
                            <strong className="text-emerald-700 font-extrabold font-mono">
                              {formatTaka(dep.depositAmount + (dep.totalProfitEarned || 0))}
                            </strong>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING & VERIFYING SUBMISSIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingDeposits.length === 0 ? (
                <Card className="border shadow-xs text-center p-8 sm:p-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">কোনো অপেক্ষমাণ আবেদন নেই</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    আপনার পূর্বে জমাকৃত সকল ফিক্সড ডিপোজিট আবেদন যাচাই ও নিষ্পত্তি করা হয়েছে।
                  </p>
                </Card>
              ) : (
                pendingDeposits.map((dep) => (
                  <Card key={dep.id} className="border border-amber-500/30 shadow-xs bg-amber-50/10 overflow-hidden">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500 text-white font-bold text-[10px] gap-1">
                            <Clock className="w-3 h-3" />
                            অ্যাডমিন যাচাইাধীন
                          </Badge>
                          <span className="text-xs font-bold text-foreground font-mono">
                            {dep.createdAt}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">{dep.schemeTitleBn}</h4>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>জমা মাধ্যম: <strong className="text-foreground">{dep.paymentMethod}</strong></div>
                          <div>ট্রানজেকশন আইডি: <strong className="text-primary font-mono">{dep.transactionId}</strong></div>
                        </div>
                        <p className="text-[11px] text-amber-800 bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                          অ্যাডমিন আপনার পেমেন্ট স্লিপ ও ট্রানজেকশন তথ্য যাচাই করছেন। অনুমোদন সম্পন্ন হলেই ব্যালেন্স যুক্ত হবে এবং দৈনিক কমিশন শুরু হবে।
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground block">আমানতের পরিমাণ</span>
                          <strong className="text-2xl font-black text-foreground font-mono">
                            {formatTaka(dep.depositAmount)}
                          </strong>
                        </div>
                        {dep.slipUrl && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            <span>পেমেন্ট স্লিপ সংযুক্ত রয়েছে</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PROFIT LEDGER / DAILY HISTORY */}
          {activeTab === 'ledger' && (
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>দৈনিক স্বয়ংক্রিয় কমিশন যুক্ত হওয়ার বিবরণী</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  আপনার সক্রিয় ফিক্সড ডিপোজিট স্কিমগুলো থেকে অর্জিত কমিশন
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {activeDeposits.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    কোনো সক্রিয় স্কিম নেই। স্কিম সক্রিয় হলে দৈনিক স্টেটমেন্ট এখানে দেখাবে।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeDeposits.map((dep, idx) => {
                      const dailyRate = dep.dailyProfitPercent || 1.5;
                      const dailyProfit = Math.round((dep.depositAmount * dailyRate) / 100);

                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border text-xs">
                          <div className="space-y-1">
                            <strong className="text-foreground font-semibold block">{dep.schemeTitleBn}</strong>
                            <div className="text-muted-foreground text-[11px] flex items-center gap-2">
                              <span>মূল জমা: {formatTaka(dep.depositAmount)}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">দৈনিক রেট: {toBengaliNumber(dailyRate)}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <strong className="text-sm font-black text-emerald-600 font-mono block">
                              +{formatTaka(dailyProfit)} / দিন
                            </strong>
                            <span className="text-[10px] text-muted-foreground">
                              মোট অর্জিত: {formatTaka(dep.totalProfitEarned || 0)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </CustomerLayout>
  );
};
