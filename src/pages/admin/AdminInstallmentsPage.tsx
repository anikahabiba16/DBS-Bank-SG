import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { Installment } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, CheckCircle2, Clock, AlertTriangle, CreditCard, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export const AdminInstallmentsPage: React.FC = () => {
  const { installments, applications, recordInstallmentAdmin } = useLoan();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<Installment | null>(null);
  const [newStatus, setNewStatus] = useState<Installment['status']>('paid');
  const [paymentMethod, setPaymentMethod] = useState<Installment['paymentMethod']>('Cash');
  const [transactionId, setTransactionId] = useState('');

  const filteredInstallments = installments.filter((inst) => {
    const loanApp = applications.find((a) => a.id === inst.loanId);
    const applicantName = loanApp?.applicantName || '';
    const phone = loanApp?.phone || '';

    const matchesSearch = 
      inst.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      (inst.transactionId && inst.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = installments.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = installments.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  const handleOpenRecord = (inst: Installment) => {
    setSelectedInst(inst);
    setNewStatus(inst.status === 'paid' ? 'pending' : 'paid');
    setPaymentMethod(inst.paymentMethod || 'Cash');
    setTransactionId(inst.transactionId || `ADM-${Math.floor(100000 + Math.random() * 900000)}`);
    setRecordModalOpen(true);
  };

  const handleConfirmRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInst) return;

    recordInstallmentAdmin(selectedInst.id, newStatus, {
      paymentMethod,
      transactionId: newStatus === 'paid' ? transactionId : undefined
    });

    toast.success(`কিস্তি #${selectedInst.installmentNo} এর পেমেন্ট রেকর্ড আপডেট হয়েছে!`);
    setRecordModalOpen(false);
  };

  return (
    <AdminLayout
      title="কিস্তি ও কালেকশন ব্যবস্থাপনা"
      subtitle="সকল বিতরণকৃত লোনের কিস্তি আদায়, বকেয়া পর্যবেক্ষণ ও অফলাইন পেমেন্ট এন্ট্রি"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="ed-card border-border p-4 bg-card space-y-1">
            <span className="text-xs text-muted-foreground uppercase">মোট সংগৃহীত কিস্তি</span>
            <div className="text-2xl font-serif font-bold text-emerald-600 font-mono">
              {formatTaka(totalCollected)}
            </div>
            <div className="text-xs text-muted-foreground">
              {toBengaliNumber(installments.filter(i => i.status === 'paid').length)} টি কিস্তি আদায় সম্পন্ন
            </div>
          </Card>

          <Card className="ed-card border-border p-4 bg-card space-y-1">
            <span className="text-xs text-muted-foreground uppercase">বকেয়া কিস্তি পাওনা</span>
            <div className="text-2xl font-serif font-bold text-amber-600 font-mono">
              {formatTaka(totalPending)}
            </div>
            <div className="text-xs text-muted-foreground">
              {toBengaliNumber(installments.filter(i => i.status !== 'paid').length)} টি কিস্তি বকেয়া
            </div>
          </Card>

          <Card className="ed-card border-border p-4 bg-card space-y-1">
            <span className="text-xs text-muted-foreground uppercase">মোট নির্ধারিত কিস্তি সংখ্যা</span>
            <div className="text-2xl font-serif font-bold text-foreground font-mono">
              {toBengaliNumber(installments.length)} টি
            </div>
            <div className="text-xs text-muted-foreground">
              চলমান লোনসমূহের আওতায়
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="আবেদন আইডি, গ্রাহকের নাম বা TrxID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">স্ট্যাটাস:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 text-xs">
                <SelectValue placeholder="সব কিস্তি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব কিস্তি ({installments.length})</SelectItem>
                <SelectItem value="paid">পরিশোধিত ({installments.filter(i => i.status === 'paid').length})</SelectItem>
                <SelectItem value="pending">বকেয়া ({installments.filter(i => i.status !== 'paid').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Installments Table */}
        <Card className="ed-card border-border overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full max-w-full overflow-x-auto bg-card">
            <Table className="[&>div]:max-w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap font-bold text-xs">লোন আইডি</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">গ্রাহকের নাম</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">কিস্তি নং</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">নির্ধারিত তারিখ</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">পরিমাণ</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">স্ট্যাটাস</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs">পদ্ধতি ও TrxID</TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-xs text-right">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((inst) => {
                  const loanApp = applications.find((a) => a.id === inst.loanId);
                  const isPaid = inst.status === 'paid';

                  return (
                    <TableRow key={inst.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap font-mono font-bold text-xs text-accent">
                        {inst.loanId}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs font-semibold">
                        {loanApp?.applicantName || 'গ্রাহক'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-xs">
                        #{toBengaliNumber(inst.installmentNo)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {inst.dueDate}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono font-bold text-xs text-foreground">
                        {formatTaka(inst.amount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {isPaid ? (
                          <Badge className="bg-emerald-600 text-white text-[11px] gap-1">
                            <CheckCircle2 className="w-3 h-3" /> আদায় হয়েছে
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-[11px] gap-1">
                            <Clock className="w-3 h-3" /> বকেয়া
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {isPaid ? (
                          <span className="font-mono text-[11px]">
                            <strong>{inst.paymentMethod}</strong>: {inst.transactionId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRecord(inst)}
                          className="h-7 text-xs"
                        >
                          {isPaid ? 'রেকর্ড পরিবর্তন' : 'পেমেন্ট রিসিভ করুন'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Organized Card View (No Horizontal Scroll) */}
          <div className="block md:hidden divide-y divide-border bg-card">
            {filteredInstallments.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                কোনো কিস্তি রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              filteredInstallments.map((inst) => {
                const loanApp = applications.find((a) => a.id === inst.loanId);
                const isPaid = inst.status === 'paid';

                return (
                  <div key={inst.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-accent">{inst.loanId}</span>
                          <span className="font-semibold text-xs text-foreground">• কিস্তি #{toBengaliNumber(inst.installmentNo)}</span>
                        </div>
                        <div className="font-bold text-xs text-foreground mt-0.5">{loanApp?.applicantName || 'গ্রাহক'}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">নির্ধারিত তারিখ: {inst.dueDate}</div>
                      </div>
                      <div className="text-right">
                        {isPaid ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" /> আদায় হয়েছে
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-[10px] gap-1">
                            <Clock className="w-3 h-3" /> বকেয়া
                          </Badge>
                        )}
                        <div className="font-mono font-extrabold text-sm text-foreground mt-1">
                          {formatTaka(inst.amount)}
                        </div>
                      </div>
                    </div>

                    {isPaid && (
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-[11px] font-mono">
                        <span className="text-muted-foreground">পদ্ধতি:</span> <strong>{inst.paymentMethod}</strong> • TrxID: {inst.transactionId}
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRecord(inst)}
                        className="w-full h-8 text-xs font-bold"
                      >
                        {isPaid ? 'রেকর্ড পরিবর্তন করুন' : 'পেমেন্ট রিসিভ ও আপডেট করুন'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Record Payment Dialog */}
        <Dialog open={recordModalOpen} onOpenChange={setRecordModalOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif">
                কিস্তি পেমেন্ট স্ট্যাটাস আপডেট (#{selectedInst ? toBengaliNumber(selectedInst.installmentNo) : ''})
              </DialogTitle>
              <DialogDescription>
                অফলাইন ক্যাশ বা সরাসরি ব্যাংক ডিপোজিট রেকর্ড এন্ট্রি করুন।
              </DialogDescription>
            </DialogHeader>

            {selectedInst && (
              <form onSubmit={handleConfirmRecord} className="space-y-4 pt-2 text-xs">
                <div className="p-3 bg-muted rounded border border-border flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">কিস্তির পরিমাণ:</span>
                  <strong className="text-foreground font-mono font-bold">
                    {formatTaka(selectedInst.amount)}
                  </strong>
                </div>

                <div className="space-y-1.5">
                  <Label>পেমেন্ট স্ট্যাটাস</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(val) => setNewStatus(val as Installment['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">পরিশোধিত (Paid)</SelectItem>
                      <SelectItem value="pending">বকেয়া (Pending)</SelectItem>
                      <SelectItem value="overdue">বিলম্বিত (Overdue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === 'paid' && (
                  <>
                    <div className="space-y-1.5">
                      <Label>পেমেন্ট মেথড</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(val) => setPaymentMethod(val as Installment['paymentMethod'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">অফিস কাউন্টারে নগদ (Cash)</SelectItem>
                          <SelectItem value="bKash">বিকাশ (bKash)</SelectItem>
                          <SelectItem value="Nagad">নগদ (Nagad)</SelectItem>
                          <SelectItem value="Rocket">রকেট (Rocket)</SelectItem>
                          <SelectItem value="Bank Transfer">ব্যাংক চেক / EFTN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rec-trx">রশিদ নং / TrxID</Label>
                      <Input
                        id="rec-trx"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setRecordModalOpen(false)}>
                    বাতিল
                  </Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    রেকর্ড সেভ করুন
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
