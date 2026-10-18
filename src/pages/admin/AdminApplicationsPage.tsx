import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber, normalizePhone } from '@/services/storage';
import { LoanApplication, ApplicationStatus } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Banknote, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileCheck,
  Send,
  Maximize2,
  RefreshCw,
  Radio
} from 'lucide-react';
import { CustomerDocumentInspectorModal } from '@/components/common/CustomerDocumentInspectorModal';
import { toast } from 'sonner';
import { supabaseSync } from '@/services/supabaseSyncService';
import { loanStorage } from '@/services/storage';

export const AdminApplicationsPage: React.FC = () => {
  const { applications, updateApplicationStatus, getAllDocumentsForCustomer, refreshApplications, adminRole, currentSubAdmin } = useLoan();
  const [searchParams] = useSearchParams();
  const selectedParam = searchParams.get('selected');
  const [isSyncing, setIsSyncing] = useState(false);

  // Safe fallback to loanStorage if context array is empty
  const effectiveApplications = (applications && applications.length > 0) ? applications : loanStorage.getApplications();

  // Sub-Admin Isolation: only show assigned customers' applications
  const isSubAdmin = adminRole === 'sub_admin';
  const assignedCustomerIds = (isSubAdmin && currentSubAdmin && Array.isArray(currentSubAdmin.assigned_customer_ids) && currentSubAdmin.assigned_customer_ids.length > 0)
    ? currentSubAdmin.assigned_customer_ids
    : null;

  const scopedApplications = assignedCustomerIds !== null
    ? effectiveApplications.filter((a) =>
        assignedCustomerIds.includes(a.id || '') ||
        assignedCustomerIds.includes(a.userId || '') ||
        assignedCustomerIds.includes(a.phone) ||
        assignedCustomerIds.includes(normalizePhone(a.phone))
      )
    : effectiveApplications;

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const cloudApps = await supabaseSync.fetchApplicationsFromCloud();
      if (cloudApps && cloudApps.length > 0) {
        loanStorage.saveApplicationsFromCloud(cloudApps);
      }
      refreshApplications();
      toast.success('ক্লাউড থেকে লোন আবেদন ডাটা সফলভাবে রিফ্রেশ করা হয়েছে!');
    } catch {
      toast.error('ক্লাউড রিফ্রেশ করতে সমস্যা হয়েছে');
    } finally {
      setIsSyncing(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);

  // Inspector modal state
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Status Update Dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('under_review');
  const [adminNotes, setAdminNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(100000);
  const [rejectedReason, setRejectedReason] = useState('');

  useEffect(() => {
    if (selectedParam) {
      const found = applications.find((a) => a.id === selectedParam);
      if (found) {
        setSelectedApp(found);
      }
    }
  }, [selectedParam, scopedApplications]);

  const filteredApplications = [...scopedApplications]
    .sort((a, b) => {
      const timeA = a.appliedDate ? Date.parse(a.appliedDate) : 0;
      const timeB = b.appliedDate ? Date.parse(b.appliedDate) : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    })
    .filter((app) => {
      const matchesSearch = 
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        app.nidNumber.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

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

  const handleOpenAction = (app: LoanApplication, status: ApplicationStatus) => {
    setSelectedApp(app);
    setTargetStatus(status);
    setAdminNotes(app.adminNotes || '');
    setApprovedAmount(app.loanAmount);
    setRejectedReason(app.rejectedReason || 'প্রদত্ত তথ্য অসন্তোষজনক');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const disburseOrApprovedAmt = approvedAmount || selectedApp.loanAmount;

    await updateApplicationStatus(selectedApp.id, targetStatus, adminNotes, {
      approvedAmount: targetStatus === 'approved' || targetStatus === 'disbursed' ? disburseOrApprovedAmt : undefined,
      rejectedReason: targetStatus === 'rejected' ? rejectedReason : undefined
    });

    if (targetStatus === 'disbursed') {
      toast.success(`ঋণ ফান্ড বিতরণ সম্পন্ন! ৳ ${disburseOrApprovedAmt.toLocaleString('en-IN')} টাকা গ্রাহকের ওয়ালেটে সরাসরি যোগ হয়েছে।`);
    } else {
      toast.success(`আবেদন ${selectedApp.id} এর স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে!`);
    }
    setActionDialogOpen(false);
  };

  const handleCancelApplication = async (app: LoanApplication) => {
    const confirmed = window.confirm(
      `আপনি কি আবেদন ${app.id} বাতিল করে তালিকা থেকে সরাতে চান? এই কাজটি শুধু এই আবেদনটির জন্য হবে এবং Supabase থেকে রেকর্ড মুছে দেবে।`
    );
    if (!confirmed) return;

    try {
      // Delete only this application ID in Supabase, then update local state.
      await loanStorage.deleteApplication(app.id);
      refreshApplications();

      if (selectedApp?.id === app.id) setSelectedApp(null);
      toast.success(`আবেদন ${app.id} তালিকা থেকে সরানো হয়েছে।`);
    } catch (error) {
      console.error('Failed to cancel loan application:', error);
      toast.error('আবেদন সরানো যায়নি। Supabase অনুমতি (RLS) ও সংযোগ পরীক্ষা করুন।');
    }
  };

  return (
    <AdminLayout
      title="লোন আবেদন ব্যবস্থাপনা"
      subtitle="সকল গ্রাহকের লোন আবেদন যাচাই, অনুমোদন, বিতরণ ও পর্যবেক্ষণ করুন"
    >
      <div className="space-y-6">
        {/* Cloud Sync Status & Action Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">ক্লাউড রিয়েল-টাইম সিঙ্ক সক্রিয়</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-600 text-white">
                  Live Supabase
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                যেকোনো ডিভাইস বা ফোন থেকে নতুন লোন আবেদন জমা হওয়ার সাথে সাথে এই তালিকায় রিয়েল-টাইমে যুক্ত হয়।
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="shrink-0 gap-1.5 text-xs bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউড রিফ্রেশ'}
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="আইডি, নাম, ফোন বা এনআইডি খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">স্ট্যাটাস:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 text-xs">
                <SelectValue placeholder="সব স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব আবেদন ({applications.length})</SelectItem>
                <SelectItem value="pending">পেন্ডিং ({applications.filter(a => a.status === 'pending').length})</SelectItem>
                <SelectItem value="under_review">যাচাইাধীন ({applications.filter(a => a.status === 'under_review').length})</SelectItem>
                <SelectItem value="approved">অনুমোদিত ({applications.filter(a => a.status === 'approved').length})</SelectItem>
                <SelectItem value="disbursed">বিতরণকৃত ({applications.filter(a => a.status === 'disbursed').length})</SelectItem>
                <SelectItem value="rejected">বাতিলকৃত ({applications.filter(a => a.status === 'rejected').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications Master Table */}
        <Card className="ed-card border-border overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full max-w-full overflow-x-auto bg-card">
            <Table className="[&>div]:max-w-full min-w-[850px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap font-bold text-xs">আইডি</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">আবেদনকারী ও ফোন</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">প্যাকেজ</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">পরিমাণ ও কিস্তি</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">মাসিক আয়</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">জমা তারিখ</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">স্ট্যাটাস</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs text-right">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                      কোনো আবেদন পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap font-mono font-bold text-xs text-accent">
                        {app.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-semibold text-xs text-foreground">{app.applicantName}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{app.phone}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {app.packageName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        <div className="font-bold text-foreground">{formatTaka(app.loanAmount)}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {toBengaliNumber(app.durationMonths)} মাস ({formatTaka(app.monthlyEMI)}/মাস)
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {formatTaka(app.monthlyIncome)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {app.appliedDate}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>বিস্তারিত</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleCancelApplication(app)}
                          className="h-7 text-xs gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>সরান</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Organized Card View (No Horizontal Scroll) */}
          <div className="block md:hidden divide-y divide-border bg-card">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                কোনো আবেদন পাওয়া যায়নি।
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div key={app.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-accent">{app.id}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">• {app.appliedDate}</span>
                      </div>
                      <div className="font-bold text-xs text-foreground mt-0.5">{app.applicantName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{app.phone}</div>
                    </div>
                    <div className="text-right">
                      <div>{getStatusBadge(app.status)}</div>
                      <div className="font-mono font-extrabold text-sm text-foreground mt-1">
                        {formatTaka(app.loanAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">প্যাকেজ:</span>
                      <span className="font-semibold text-foreground">{app.packageName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">মেয়াদ ও কিস্তি:</span>
                      <span className="font-mono font-medium text-foreground">
                        {toBengaliNumber(app.durationMonths)} মাস ({formatTaka(app.monthlyEMI)}/মাস)
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between items-center">
                      <span className="text-muted-foreground text-[10px]">মাসিক আয়:</span>
                      <span className="font-mono font-bold text-foreground">{formatTaka(app.monthlyIncome)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      className="flex-1 h-8 text-xs font-bold gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বিস্তারিত পর্যালোচনা</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleCancelApplication(app)}
                      className="h-8 px-3 text-xs font-bold gap-1 shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>সরান</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Selected Application Detailed View Modal */}
        {selectedApp && (
          <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-xl font-serif">
                    আবেদন পর্যালোচনা: {selectedApp.id}
                  </DialogTitle>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <DialogDescription>
                  জমা প্রদানের তারিখ: {selectedApp.appliedDate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-2 text-xs">
                {/* 1. Loan Request Details */}
                <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
                  <h4 className="font-serif font-bold text-sm text-foreground">লোনের তথ্য</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-muted-foreground block">স্কিমের নাম</span>
                      <strong className="text-foreground">{selectedApp.packageName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">কাঙ্ক্ষিত পরিমাণ</span>
                      <strong className="text-foreground font-mono text-sm">{formatTaka(selectedApp.loanAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মেয়াদ ও সুদের হার</span>
                      <strong className="text-foreground">
                        {toBengaliNumber(selectedApp.durationMonths)} মাস ({toBengaliNumber(selectedApp.interestRate)}%)
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মাসিক কিস্তি (EMI)</span>
                      <strong className="text-accent font-serif text-sm font-bold">{formatTaka(selectedApp.monthlyEMI)}</strong>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-muted-foreground block">লোনের উদ্দেশ্য:</span>
                    <p className="text-foreground font-medium">{selectedApp.loanPurpose}</p>
                  </div>
                </div>

                {/* 2. Applicant Profile */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                  <h4 className="font-serif font-bold text-sm text-foreground">আবেদনকারীর ব্যক্তিগত তথ্য</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted-foreground block">নাম</span>
                      <strong className="text-foreground">{selectedApp.applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মোবাইল</span>
                      <strong className="text-foreground font-mono">{selectedApp.phone}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">এনআইডি নম্বর</span>
                      <strong className="text-foreground font-mono">{selectedApp.nidNumber}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">পেশা</span>
                      <strong className="text-foreground">{selectedApp.profession}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মাসিক আয়</span>
                      <strong className="text-foreground font-mono">{formatTaka(selectedApp.monthlyIncome)}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">ব্যাংক অ্যাকাউন্ট</span>
                      <span className="text-foreground font-mono">{selectedApp.bankName} - {selectedApp.bankAccountNumber || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-muted-foreground block">বর্তমান ঠিকানা</span>
                      <span className="text-foreground">{selectedApp.presentAddress}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Guarantor Info */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <h4 className="font-serif font-bold text-sm text-foreground">জামিনদার / গ্যারান্টারের তথ্য</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-muted-foreground block">নাম</span>
                      <strong className="text-foreground">{selectedApp.guarantorName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">সম্পর্ক</span>
                      <strong className="text-foreground">{selectedApp.guarantorRelation}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মোবাইল</span>
                      <strong className="text-foreground font-mono">{selectedApp.guarantorPhone}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">এনআইডি</span>
                      <strong className="text-foreground font-mono">{selectedApp.guarantorNid}</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Attached Documents */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      সংযুক্ত ডকুমেন্টস ({selectedApp.documents.length} টি)
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectorOpen(true)}
                      className="text-xs h-7 gap-1 border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <Maximize2 className="w-3 h-3" />
                      ইনস্পেক্টরে সব ফাইল ভিউ ও জুম করুন
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedApp.documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        onClick={() => setInspectorOpen(true)}
                        className="p-2.5 bg-card rounded-lg border border-border hover:border-accent/50 cursor-pointer shadow-2xs hover:shadow-sm transition-all flex items-center gap-2.5 group"
                      >
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0 border border-border relative">
                          {doc.previewUrl ? (
                            <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <FileCheck className="w-6 h-6 text-emerald-600 mx-auto mt-3" />
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-foreground block truncate" title={doc.name}>
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {doc.size} • {doc.uploadDate}
                          </span>
                          <span className="text-[10px] text-accent font-medium flex items-center gap-0.5 mt-0.5">
                            <Eye className="w-2.5 h-2.5" /> ক্লিক করে প্রিভিউ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Current Admin Notes */}
                {selectedApp.adminNotes && (
                  <div className="p-3 bg-muted rounded border border-border">
                    <span className="font-semibold block mb-1">পূর্ববর্তী অ্যাডমিন নোট:</span>
                    <p className="text-muted-foreground">{selectedApp.adminNotes}</p>
                  </div>
                )}

                {/* Quick Status Control Buttons */}
                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenAction(selectedApp, 'under_review')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      যাচাইাধীন হিসেবে চিহ্নিত করুন
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAction(selectedApp, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      ঋণ অনুমোদন করুন
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAction(selectedApp, 'disbursed')}
                      className="bg-foreground hover:bg-accent text-background text-xs"
                    >
                      ফান্ড বিতরণ (Disburse)
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenAction(selectedApp, 'rejected')}
                      className="text-xs"
                    >
                      আবেদন বাতিল করুন
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} className="text-xs">
                    বন্ধ করুন
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Change Status & Add Notes Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif">
                আবেদনের স্ট্যাটাস পরিবর্তন: {selectedApp?.id}
              </DialogTitle>
              <DialogDescription>
                স্ট্যাটাস পরিবর্তনের সাথে অ্যাডমিন নোট ও অন্যান্য প্রয়োজনীয় তথ্য আপডেট করুন।
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmAction} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>নতুন স্ট্যাটাস</Label>
                <Select
                  value={targetStatus}
                  onValueChange={(val) => setTargetStatus(val as ApplicationStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">পেন্ডিং (Pending)</SelectItem>
                    <SelectItem value="under_review">যাচাইাধীন (Under Review)</SelectItem>
                    <SelectItem value="approved">অনুমোদিত (Approved)</SelectItem>
                    <SelectItem value="disbursed">ফান্ড বিতরণকৃত (Disbursed)</SelectItem>
                    <SelectItem value="rejected">বাতিলকৃত (Rejected)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(targetStatus === 'approved' || targetStatus === 'disbursed') && (
                <div className="space-y-2">
                  <Label htmlFor="appr-amt">
                    {targetStatus === 'disbursed' ? 'বিতরণযোগ্য অর্থের পরিমাণ (গ্রাহকের ওয়ালেটে সরাসরি যোগ হবে)' : 'অনুমোদিত অর্থের পরিমাণ (টাকায়)'}
                  </Label>
                  <Input
                    id="appr-amt"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    required
                  />
                  {targetStatus === 'disbursed' && (
                    <p className="text-[11px] text-emerald-600 font-bold">
                      ✓ 'নিশ্চিত করুন' চাপামাত্র এই অর্থ গ্রাহকের ওয়ালেট ব্যালেন্সে অটোমেটিক ক্রেডিট হয়ে যাবে।
                    </p>
                  )}
                </div>
              )}

              {targetStatus === 'rejected' && (
                <div className="space-y-2">
                  <Label htmlFor="rej-reason">বাতিলকরণের কারণ *</Label>
                  <Input
                    id="rej-reason"
                    placeholder="যেমন: ক্রেডিট হিস্ট্রি দুর্বল বা ভুয়া ডকুমেন্ট"
                    value={rejectedReason}
                    onChange={(e) => setRejectedReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-notes">অফিসিয়াল মন্তব্য / অ্যাডমিন নোট</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="আবেদনের ফাইল সম্পর্কে আপনার পর্যবেক্ষণ বা সিদ্ধান্ত লিখুন..."
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActionDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  নিশ্চিত করুন
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Customer Document Inspector Modal */}
        {selectedApp && (
          <CustomerDocumentInspectorModal
            open={inspectorOpen}
            onOpenChange={setInspectorOpen}
            customerName={selectedApp.applicantName}
            customerPhone={selectedApp.phone}
            customerNid={selectedApp.nidNumber}
            documents={getAllDocumentsForCustomer(selectedApp.phone)}
          />
        )}
      </div>
    </AdminLayout>
  );
};
