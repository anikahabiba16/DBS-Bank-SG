import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber, normalizePhone, loanStorage } from '@/services/storage';
import { supabaseSync } from '@/services/supabaseSyncService';
import { ApplicationStatus } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Banknote, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  Settings, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Contact2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const { 
    applications, 
    packages, 
    installments, 
    updateApplicationStatus, 
    users, 
    adminRole, 
    currentSubAdmin,
    refreshApplications,
    refreshUsers,
    refreshInstallments
  } = useLoan();

  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-refresh fresh local and cloud state on dashboard mount
  React.useEffect(() => {
    refreshApplications();
    refreshUsers();
    refreshInstallments();
  }, [refreshApplications, refreshUsers, refreshInstallments]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const [cloudApps, cloudUsers] = await Promise.all([
        supabaseSync.fetchApplicationsFromCloud(),
        supabaseSync.fetchUsersFromCloud()
      ]);
      if (cloudApps && cloudApps.length > 0) {
        loanStorage.saveApplicationsFromCloud(cloudApps);
      }
      if (cloudUsers && cloudUsers.length > 0) {
        loanStorage.saveUsersFromCloud(cloudUsers);
      }
      refreshApplications();
      refreshUsers();
      refreshInstallments();
      toast.success('ক্লাউড থেকে সকল ডাটা সফলভাবে রিফ্রেশ হয়েছে!');
    } catch {
      toast.error('ক্লাউড সিঙ্ক করতে সমস্যা হয়েছে');
    } finally {
      setIsSyncing(false);
    }
  };

  // Scoped data for Sub-Admin isolation
  const assignedCustomerIds = (adminRole === 'sub_admin' && currentSubAdmin)
    ? (currentSubAdmin.assigned_customer_ids || [])
    : null;

  const scopedApplications = assignedCustomerIds !== null
    ? applications.filter((a) => 
        assignedCustomerIds.includes(a.userId || '') ||
        assignedCustomerIds.includes(a.phone) ||
        assignedCustomerIds.includes(normalizePhone(a.phone))
      )
    : applications;

  // Unified registered customers (merges registered users and loan applicants)
  const allRegisteredCustomers = React.useMemo(() => {
    const map = new Map<string, any>();

    // Index applications by normalized phone and userId
    const appsByPhone = new Map<string, any[]>();
    const appsByUserId = new Map<string, any[]>();
    applications.forEach((app) => {
      const pNorm = normalizePhone(app.phone);
      if (pNorm) {
        if (!appsByPhone.has(pNorm)) appsByPhone.set(pNorm, []);
        appsByPhone.get(pNorm)!.push(app);
      }
      if (app.userId) {
        if (!appsByUserId.has(app.userId)) appsByUserId.set(app.userId, []);
        appsByUserId.get(app.userId)!.push(app);
      }
    });

    // 1. Add all registered users
    users.forEach((u) => {
      const pNorm = normalizePhone(u.phone);
      const matchedApps = [
        ...(u.id && appsByUserId.has(u.id) ? appsByUserId.get(u.id)! : []),
        ...(pNorm && appsByPhone.has(pNorm) ? appsByPhone.get(pNorm)! : [])
      ];
      const matchedApp = matchedApps[0];

      map.set(u.id || u.phone, {
        id: u.id || u.phone,
        name: u.name || matchedApp?.applicantName || 'সম্মানিত গ্রাহক',
        phone: u.phone,
        password: u.password || 'Aa112233@',
        walletBalance: u.walletBalance ?? (matchedApp?.status === 'disbursed' ? matchedApp.approvedAmount || matchedApp.loanAmount : 0),
        boundWithdrawalAccounts: u.boundWithdrawalAccounts,
        accountType: u.accountType,
        registeredAt: u.registeredAt || matchedApp?.appliedDate || 'সম্প্রতি',
        user: u
      });
    });

    // 2. Add applicants who submitted applications so they also appear in live registered accounts
    applications.forEach((app) => {
      const pNorm = normalizePhone(app.phone);
      let exists = false;
      for (const item of map.values()) {
        const itemNorm = normalizePhone(item.phone);
        if (
          (app.userId && item.id === app.userId) ||
          (pNorm && itemNorm && itemNorm === pNorm)
        ) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        map.set(`applicant-${app.id}`, {
          id: `applicant-${app.id}`,
          name: app.applicantName,
          phone: app.phone,
          password: 'User@123456',
          walletBalance: app.status === 'disbursed' ? app.approvedAmount || app.loanAmount : 0,
          boundWithdrawalAccounts: undefined,
          accountType: app.bankAccountNumber ? 'ব্যাংক' : 'বিকাশ',
          registeredAt: app.appliedDate || 'সম্প্রতি',
          user: null
        });
      }
    });

    return Array.from(map.values());
  }, [users, applications]);

  const scopedUsers = assignedCustomerIds !== null
    ? allRegisteredCustomers.filter((u) =>
        assignedCustomerIds.includes(u.id) ||
        assignedCustomerIds.includes(u.phone) ||
        assignedCustomerIds.includes(normalizePhone(u.phone))
      )
    : allRegisteredCustomers;

  const totalApplications = scopedApplications.length;
  const pendingApps = scopedApplications.filter((a) => a.status === 'pending');
  const underReviewApps = scopedApplications.filter((a) => a.status === 'under_review');
  const approvedApps = scopedApplications.filter((a) => a.status === 'approved');
  const disbursedApps = scopedApplications.filter((a) => a.status === 'disbursed');
  const rejectedApps = scopedApplications.filter((a) => a.status === 'rejected');

  const totalDisbursedAmount = disbursedApps.reduce((sum, a) => sum + (a.approvedAmount || a.loanAmount), 0);
  const totalCollectedInstallments = installments.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPendingInstallments = installments.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-[11px]">পেন্ডিং</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 text-[11px]">যাচাইাধীন</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-600 text-white text-[11px]">অনুমোদিত</Badge>;
      case 'disbursed':
        return <Badge className="bg-foreground text-background text-[11px]">বিতরণকৃত</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[11px]">বাতিল</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title="এডমিন ড্যাশবোর্ড"
      subtitle="লোন আবেদন, আর্থিক পরিসংখ্যান ও প্ল্যাটফর্ম নিয়ন্ত্রণের কেন্দ্রীয় সারসংক্ষেপ"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="text-xs font-bold gap-1.5 h-8 bg-card shadow-xs"
          >
            <Clock className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ডাটা রিফ্রেশ'}</span>
          </Button>
          <Link to="/admin/applications">
            <Button size="sm" className="bg-foreground text-background hover:bg-accent hover:text-accent-foreground text-xs gap-1.5 h-8">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>সকল আবেদন দেখুন</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="ed-card border-border p-5 bg-card space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>মোট লোন আবেদন</span>
              <FileSpreadsheet className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-foreground font-mono">
              {toBengaliNumber(totalApplications)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="text-amber-600 font-semibold">{toBengaliNumber(pendingApps.length)} টি পেন্ডিং</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{toBengaliNumber(underReviewApps.length)} টি যাচাইাধীন</span>
            </div>
          </Card>

          <Card className="ed-card border-border p-5 bg-card space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>বিতরণকৃত মোট ফান্ড</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-foreground font-mono">
              {formatTaka(totalDisbursedAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {toBengaliNumber(disbursedApps.length)} টি সক্রিয় ঋণ চালু আছে
            </div>
          </Card>

          <Card className="ed-card border-border p-5 bg-card space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>আদায়কৃত কিস্তি</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 font-mono">
              {formatTaka(totalCollectedInstallments)}
            </div>
            <div className="text-xs text-muted-foreground">
              {toBengaliNumber(installments.filter((i) => i.status === 'paid').length)} টি কিস্তি সংগৃহীত
            </div>
          </Card>

          <Card className="ed-card border-border p-5 bg-card space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>বকেয়া কিস্তি পাওনা</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 font-mono">
              {formatTaka(totalPendingInstallments)}
            </div>
            <div className="text-xs text-muted-foreground">
              চলমান ঋণ হতে সংগৃহীত হবে
            </div>
          </Card>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          <Link to="/admin/customers" className="h-full block">
            <div className="h-full min-h-[82px] p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between group shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shadow-sm shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground truncate">সকল ইউজার অ্যাকাউন্ট</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold truncate">{toBengaliNumber(users.length)} জন নিবন্ধিত গ্রাহক</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          </Link>

          <Link to="/admin/applications" className="h-full block">
            <div className="h-full min-h-[82px] p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between group shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-muted text-accent shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">লোন আবেদন যাচাই</h4>
                  <p className="text-xs text-muted-foreground truncate">{toBengaliNumber(pendingApps.length)} টি পেন্ডিং আবেদন</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          </Link>

          <Link to="/admin/packages" className="h-full block">
            <div className="h-full min-h-[82px] p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between group shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-muted text-accent shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">লোন স্কিম ও সুদের হার</h4>
                  <p className="text-xs text-muted-foreground truncate">প্যাকেজ যোগ ও বিদ্যমান এডিট</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          </Link>

          <Link to="/admin/settings" className="h-full block">
            <div className="h-full min-h-[82px] p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between group shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-muted text-accent shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">সাইট কনটেন্ট এডিটর</h4>
                  <p className="text-xs text-muted-foreground truncate">ব্যানার, নোটিশ ও প্ল্যাটফর্ম ইনফো</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          </Link>
        </div>

        {/* Real-time Registered Accounts Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  রিয়েল-টাইম ইউজার অ্যাকাউন্টস (Live Registered Accounts)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  লাইভ সিঙ্ক চালু
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                গ্রাহক রেজিস্ট্রেশন করার সাথে সাথে ব্রাউজার রিফ্রেশ ছাড়াই এই তালিকায় রিয়েল-টাইমে আপডেট হবে
              </p>
            </div>
            <Link to="/admin/customers">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5" />
                <span>সকল ইউজার অ্যাকাউন্ট দেখুন ({toBengaliNumber(scopedUsers.length)} জন)</span>
              </Button>
            </Link>
          </div>

          <Card className="border border-border shadow-xs overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <Table className="[&>div]:max-w-full min-w-[750px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap font-bold text-xs">গ্রাহকের নাম</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">মোবাইল নম্বর (লগইন আইডি)</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">পাসওয়ার্ড</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">ওয়ালেট ব্যালেন্স</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">উইথড্র মেথড</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">নিবন্ধনের তারিখ</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs text-right">ম্যানেজ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                        কোনো নিবন্ধিত গ্রাহক অ্যাকাউন্ট পাওয়া যায়নি। নতুন ইউজার রেজিস্ট্রেশন করলে এখানে তাৎক্ষণিক প্রদর্শিত হবে।
                      </TableCell>
                    </TableRow>
                  ) : (
                    scopedUsers.slice(0, 6).map((u) => {
                      const boundMethods = [];
                      if (u.boundWithdrawalAccounts?.bKash) boundMethods.push('বিকাশ');
                      if (u.boundWithdrawalAccounts?.Nagad) boundMethods.push('নগদ');
                      if (u.boundWithdrawalAccounts?.Rocket) boundMethods.push('রকেট');
                      if (u.boundWithdrawalAccounts?.Bank) boundMethods.push('ব্যাংক');
                      if (boundMethods.length === 0 && u.accountType) boundMethods.push(u.accountType);

                      return (
                        <TableRow key={u.id || u.phone} className="hover:bg-muted/30">
                          <TableCell className="whitespace-nowrap font-bold text-xs text-foreground">
                            {u.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono font-semibold text-xs text-primary">
                            {u.phone}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded bg-muted border text-[11px] font-semibold">
                              {u.password || 'Aa112233@'}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-bold text-xs text-emerald-600 font-mono">
                            {formatTaka(u.walletBalance || 0)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {boundMethods.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {boundMethods.map((m) => (
                                  <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {m}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">যুক্ত হয়নি</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {u.registeredAt || 'আজ'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            <Link to="/admin/customers">
                              <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-2">
                                বিবরণ দেখুন
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Recent Applications Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-foreground">
                সাম্প্রতিক লোন আবেদনসমূহ
              </h3>
              <p className="text-xs text-muted-foreground">
                সর্বশেষ জমা পড়া আবেদনগুলোর অবস্থা পর্যবেক্ষণ ও দ্রুত অ্যাকশন
              </p>
            </div>
            <Link to="/admin/applications">
              <Button variant="outline" size="sm" className="text-xs">
                সম্পূর্ণ তালিকা
              </Button>
            </Link>
          </div>

          <Card className="ed-card border-border overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <Table className="[&>div]:max-w-full min-w-[750px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap font-bold text-xs">আইডি</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">আবেদনকারী</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">মোবাইল নম্বর</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">লোন স্কিম</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">পরিমাণ</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">তারিখ</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs">স্ট্যাটাস</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-xs text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                        কোনো লোন আবেদন পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  ) : (
                    scopedApplications.slice(0, 6).map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap font-mono font-bold text-xs text-accent">
                          {app.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold text-xs">
                          {app.applicantName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {app.phone}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {app.packageName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono font-bold text-xs">
                          {formatTaka(app.loanAmount)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {app.appliedDate}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <Link to={`/admin/applications?selected=${app.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              যাচাই করুন
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
