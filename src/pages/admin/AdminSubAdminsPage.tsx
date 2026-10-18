import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useLoan } from '@/contexts/LoanContext';
import { SubAdmin, AdminModuleKey } from '@/types/loan';
import { subAdminService, ALL_ADMIN_MODULES } from '@/services/subAdminService';
import { toBengaliNumber } from '@/services/storage';
import { 
  ShieldAlert, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Phone, 
  Users, 
  MessageSquare,
  Search,
  RotateCcw,
  ShieldCheck,
  Check,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubAdminsPage() {
  const { users, refreshUsers } = useLoan();
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<SubAdmin | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminModuleKey[]>(['messages', 'applications']);
  const [canDeleteMessages, setCanDeleteMessages] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // Dedicated Customer Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetSubAdmin, setAssignTargetSubAdmin] = useState<SubAdmin | null>(null);
  const [assignCustomerIds, setAssignCustomerIds] = useState<string[]>([]);
  const [assignSearch, setAssignSearch] = useState('');
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const handleOpenAssignCustomers = (sa: SubAdmin) => {
    setAssignTargetSubAdmin(sa);
    setAssignCustomerIds(sa.assigned_customer_ids || []);
    setAssignSearch('');
    setAssignModalOpen(true);
  };

  const handleToggleAssignCustomer = (phoneOrId: string) => {
    setAssignCustomerIds((prev) =>
      prev.includes(phoneOrId) ? prev.filter((id) => id !== phoneOrId) : [...prev, phoneOrId]
    );
  };

  const handleSelectAllAssignCustomers = () => {
    const visibleIds = assignFilteredCustomers.map((c) => c.phone || c.id);
    const allSelected = visibleIds.every((id) => assignCustomerIds.includes(id));
    if (allSelected) {
      setAssignCustomerIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setAssignCustomerIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleSaveAssignments = async () => {
    if (!assignTargetSubAdmin) return;
    setIsSavingAssign(true);
    try {
      const ok = await subAdminService.assignCustomers(assignTargetSubAdmin.id, assignCustomerIds);
      if (ok) {
        toast.success(`গ্রাহক সফলভাবে অ্যাসাইন করা হয়েছে! সাব-এডমিন "${assignTargetSubAdmin.name}" এখন শুধুমাত্র এই গ্রাহকদের দেখতে পারবে।`);
        setAssignModalOpen(false);
        await loadSubAdmins();
      } else {
        toast.error('ক্লাউড ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsSavingAssign(false);
    }
  };

  const loadSubAdmins = async () => {
    setLoading(true);
    try {
      const list = await subAdminService.getAllSubAdmins();
      setSubAdmins(list);
    } catch {
      toast.error('সাব-এডমিন তালিকা লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubAdmins();

    const handleRealtimeSubAdminUpdate = () => {
      loadSubAdmins();
    };

    window.addEventListener('sub_admin_updated', handleRealtimeSubAdminUpdate);
    window.addEventListener('sub_admin_deleted', handleRealtimeSubAdminUpdate);
    window.addEventListener('sub_admin_assigned_updated', handleRealtimeSubAdminUpdate);

    return () => {
      window.removeEventListener('sub_admin_updated', handleRealtimeSubAdminUpdate);
      window.removeEventListener('sub_admin_deleted', handleRealtimeSubAdminUpdate);
      window.removeEventListener('sub_admin_assigned_updated', handleRealtimeSubAdminUpdate);
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingSubAdmin(null);
    setUsername('');
    setPassword('Sub123456@');
    setName('');
    setPhone('');
    setIsActive(true);
    setSelectedPermissions(['messages', 'applications']);
    setCanDeleteMessages(false);
    setSelectedCustomerIds([]);
    setCustomerSearch('');
    setModalOpen(true);
  };

  const handleOpenEdit = (sa: SubAdmin) => {
    setEditingSubAdmin(sa);
    setUsername(sa.username);
    setPassword(sa.password || '');
    setName(sa.name);
    setPhone(sa.phone || '');
    setIsActive(sa.is_active);
    setSelectedPermissions(sa.permissions || []);
    setCanDeleteMessages(sa.can_delete_messages === true);
    setSelectedCustomerIds(sa.assigned_customer_ids || []);
    setCustomerSearch('');
    setModalOpen(true);
  };

  const handleTogglePermission = (modKey: AdminModuleKey) => {
    setSelectedPermissions((prev) => 
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === ALL_ADMIN_MODULES.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(ALL_ADMIN_MODULES.map((m) => m.key));
    }
  };

  const handleToggleCustomer = (userIdOrPhone: string) => {
    setSelectedCustomerIds((prev) => 
      prev.includes(userIdOrPhone)
        ? prev.filter((id) => id !== userIdOrPhone)
        : [...prev, userIdOrPhone]
    );
  };

  const handleSelectAllFilteredCustomers = () => {
    const filteredIds = filteredCustomers.map((c) => c.phone || c.id);
    const allSelected = filteredIds.every((id) => selectedCustomerIds.includes(id));
    if (allSelected) {
      setSelectedCustomerIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedCustomerIds, ...filteredIds]));
      setSelectedCustomerIds(merged);
    }
  };

  const handleSaveSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      toast.error('অনুগ্রহ করে ইউজারনেম এবং পুরো নাম প্রদান করুন');
      return;
    }

    if (!editingSubAdmin && !password.trim()) {
      toast.error('অনুগ্রহ করে সাব-এডমিনের লগইন পাসওয়ার্ড দিন');
      return;
    }

    try {
      const payload: Partial<SubAdmin> & { username: string; name: string } = {
        id: editingSubAdmin ? editingSubAdmin.id : undefined,
        username: username.trim(),
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim() || editingSubAdmin?.password,
        role: 'sub_admin',
        permissions: selectedPermissions,
        can_delete_messages: canDeleteMessages,
        assigned_customer_ids: selectedCustomerIds,
        is_active: isActive
      };

      const res = await subAdminService.saveSubAdmin(payload);
      if (res) {
        toast.success(editingSubAdmin ? 'সাব-এডমিন তথ্য সফলভাবে আপডেট হয়েছে!' : 'নতুন সাব-এডমিন সফলভাবে তৈরি হয়েছে!');
        setModalOpen(false);
        await loadSubAdmins();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে! ইউজারনেমটি হয়তো ইতিমধ্যে ব্যবহৃত হয়েছে।');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleDeleteSubAdmin = async () => {
    if (!targetDeleteId) return;
    try {
      const ok = await subAdminService.deleteSubAdmin(targetDeleteId);
      if (ok) {
        toast.success('সাব-এডমিন অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে');
        setDeleteConfirmOpen(false);
        setTargetDeleteId(null);
        await loadSubAdmins();
      } else {
        toast.error('ডিলিট করা সম্ভব হয়নি');
      }
    } catch {
      toast.error('সার্ভার ত্রুটি');
    }
  };

  // Filtered customer list for assignment picker
  const filteredCustomers = users.filter((u) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.nidNumber?.includes(q)
    );
  });

  // Filtered customer list for dedicated assignment modal
  const assignFilteredCustomers = users.filter((u) => {
    if (!assignSearch.trim()) return true;
    const q = assignSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.nidNumber?.includes(q)
    );
  });

  const filteredSubAdmins = subAdmins.filter((sa) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sa.name.toLowerCase().includes(q) ||
      sa.username.toLowerCase().includes(q) ||
      sa.phone?.includes(q)
    );
  });

  return (
    <AdminLayout
      title="সাব-এডমিন ও পারমিশন কন্ট্রোল (Sub-Admin Access Control)"
      subtitle="যত খুশি সাব-এডমিন তৈরি করুন, এডমিন প্যানেলের নির্দিষ্ট ফাংশন অ্যাক্সেস দিন এবং লাইভ চ্যাটের জন্য নির্দিষ্ট গ্রাহক সিলেক্ট করে দিন"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">মোট সাব-এডমিন</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-foreground">
                {toBengaliNumber(subAdmins.length)} জন
              </span>
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">সক্রিয় সাব-এডমিন</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-600">
                {toBengaliNumber(subAdmins.filter((s) => s.is_active).length)} জন
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-4 border bg-card">
            <span className="text-xs text-muted-foreground block">লাইভ চ্যাটে অ্যাসাইনকৃত গ্রাহক</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-blue-600">
                {toBengaliNumber(
                  Array.from(new Set(subAdmins.flatMap((s) => s.assigned_customer_ids || []))).length
                )} জন
              </span>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Action & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="সাব-এডমিনের নাম বা ইউজারনেম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadSubAdmins}
              className="h-10 text-xs gap-1.5 border-border hover:bg-muted font-bold text-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিফ্রেশ</span>
            </Button>
          </div>
        </div>

        {/* Sub-Admins Table Card */}
        <Card className="border shadow-sm overflow-hidden bg-card">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full max-w-full overflow-x-auto bg-card">
            <Table className="w-full min-w-[950px] text-xs [&>div]:max-w-full">
              <TableHeader>
                <TableRow className="bg-muted/40 font-bold text-xs">
                  <TableHead className="min-w-[180px] whitespace-nowrap px-3 py-3">সাব-এডমিনের নাম ও ফোন</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap px-3 py-3">ইউজারনেম (লগইন)</TableHead>
                  <TableHead className="min-w-[130px] whitespace-nowrap px-3 py-3">লগইন পাসওয়ার্ড</TableHead>
                  <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-3 text-center">স্ট্যাটাস</TableHead>
                  <TableHead className="min-w-[240px] px-3 py-3">অনুমোদিত মডিউল (Permissions)</TableHead>
                  <TableHead className="min-w-[160px] whitespace-nowrap px-3 py-3">লাইভ চ্যাট গ্রাহক</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap px-3 py-3 text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                      {loading ? 'লোড হচ্ছে...' : 'কোনো সাব-এডমিন পাওয়া যায়নি। উপরে "+ নতুন সাব-এডমিন তৈরি করুন" বাটনে ক্লিক করে যুক্ত করুন।'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubAdmins.map((sa) => (
                    <TableRow key={sa.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="min-w-[180px] whitespace-nowrap px-3 py-3.5 align-top">
                        <div className="font-bold text-foreground text-xs">{sa.name}</div>
                        {sa.phone && (
                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {sa.phone}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="min-w-[140px] whitespace-nowrap px-3 py-3.5 align-top font-mono font-semibold text-primary">
                        {sa.username}
                      </TableCell>

                      <TableCell className="min-w-[130px] whitespace-nowrap px-3 py-3.5 align-top">
                        <div className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded border text-[11px] font-mono">
                          <KeyRound className="w-3 h-3 text-muted-foreground" />
                          <span>{sa.password || '••••••••'}</span>
                        </div>
                      </TableCell>

                      <TableCell className="min-w-[100px] whitespace-nowrap px-3 py-3.5 text-center align-top">
                        {sa.is_active ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px]">সক্রিয়</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-300 font-bold text-[10px]">নিষ্ক্রিয়</Badge>
                        )}
                      </TableCell>

                      <TableCell className="min-w-[240px] px-3 py-3.5 align-top">
                        <div className="flex flex-wrap gap-1">
                          {sa.permissions.map((pk) => {
                            const mod = ALL_ADMIN_MODULES.find((m) => m.key === pk);
                            return (
                              <Badge key={pk} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                {mod?.labelBn || pk}
                              </Badge>
                            );
                          })}
                          {sa.can_delete_messages && (
                            <Badge className="bg-red-500/15 text-red-700 border border-red-300 font-bold text-[10px] gap-1">
                              <Trash2 className="w-2.5 h-2.5" /> মেসেজ ডিলিট অনুমোদিত
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="min-w-[190px] whitespace-nowrap px-3 py-3.5 align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAssignCustomers(sa)}
                            className="h-7 px-2.5 text-xs font-bold gap-1.5 bg-blue-50/80 text-blue-700 hover:bg-blue-100 border-blue-200"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>গ্রাহক নির্বাচন ({toBengaliNumber(sa.assigned_customer_ids?.length || 0)})</span>
                          </Button>
                          <span className="text-[10px] text-muted-foreground">
                            {sa.assigned_customer_ids?.length ? 'রিয়েল-টাইম কন্ট্রোল সক্রিয়' : 'কোনো গ্রাহক সিলেক্ট নেই'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="min-w-[140px] whitespace-nowrap px-3 py-3.5 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(sa)}
                            className="h-7 px-2 text-xs font-bold gap-1 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="w-3 h-3" />
                            <span>এডিট</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setTargetDeleteId(sa.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="h-7 px-2 text-xs font-bold"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Organized Card View (No Horizontal Scroll) */}
          <div className="block md:hidden divide-y divide-border bg-card">
            {filteredSubAdmins.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {loading ? 'লোড হচ্ছে...' : 'কোনো সাব-এডমিন পাওয়া যায়নি। উপরে "+ নতুন সাব-এডমিন তৈরি করুন" বাটনে ক্লিক করে যুক্ত করুন।'}
              </div>
            ) : (
              filteredSubAdmins.map((sa) => (
                <div key={sa.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-foreground">{sa.name}</div>
                      {sa.phone && (
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {sa.phone}
                        </div>
                      )}
                    </div>
                    <div>
                      {sa.is_active ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">সক্রিয়</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-300 font-bold text-[10px]">নিষ্ক্রিয়</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">ইউজারনেম:</span>
                      <span className="font-mono font-bold text-primary">{sa.username}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">পাসওয়ার্ড:</span>
                      <span className="font-mono font-semibold text-foreground">{sa.password || '••••••••'}</span>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[10px] block font-semibold">অনুমোদিত মডিউল:</span>
                    <div className="flex flex-wrap gap-1">
                      {sa.permissions.map((pk) => {
                        const mod = ALL_ADMIN_MODULES.find((m) => m.key === pk);
                        return (
                          <Badge key={pk} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                            {mod?.labelBn || pk}
                          </Badge>
                        );
                      })}
                      {sa.can_delete_messages && (
                        <Badge className="bg-red-500/15 text-red-700 border border-red-300 font-bold text-[10px] gap-1">
                          <Trash2 className="w-2.5 h-2.5" /> মেসেজ ডিলিট
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Customer Assignment Button & Actions */}
                  <div className="pt-1 space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAssignCustomers(sa)}
                      className="w-full h-8 text-xs font-bold gap-1.5 bg-blue-50/80 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>লাইভ চ্যাট গ্রাহক নির্বাচন ({toBengaliNumber(sa.assigned_customer_ids?.length || 0)})</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(sa)}
                        className="flex-1 h-8 text-xs font-bold gap-1 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>তথ্য ও পারমিশন এডিট</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setTargetDeleteId(sa.id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="h-8 px-3 text-xs font-bold gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Add / Edit Sub-Admin Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              {editingSubAdmin ? 'সাব-এডমিন তথ্য ও পারমিশন সম্পাদন' : 'নতুন সাব-এডমিন অ্যাকাউন্ট তৈরি'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              সাব-এডমিনকে এডমিন প্যানেলের নির্দিষ্ট ফাংশন অ্যাক্সেস দিন এবং লাইভ চ্যাটের জন্য নির্দিষ্ট গ্রাহক নির্বাচন করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSubAdmin} className="space-y-4 text-xs">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">ইউজারনেম (লগইন আইডি) *</Label>
                <Input
                  required
                  placeholder="যেমন: subadmin1 বা tanvir"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">লগইন পাসওয়ার্ড *</Label>
                <Input
                  required={!editingSubAdmin}
                  placeholder="শক্তিশালী পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">পুরো নাম (কর্মকর্তার নাম) *</Label>
                <Input
                  required
                  placeholder="যেমন: তানভীর করিম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">মোবাইল নম্বর (ঐচ্ছিক)</Label>
                <Input
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="is_active_toggle"
                checked={isActive}
                onCheckedChange={(c) => setIsActive(Boolean(c))}
              />
              <Label htmlFor="is_active_toggle" className="text-xs font-semibold cursor-pointer">
                এই সাব-এডমিন অ্যাকাউন্ট সক্রিয় (Active) থাকবে
              </Label>
            </div>

            {/* Live Chat Message Deletion Permission */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-amber-500/10 border-amber-500/30">
              <Checkbox
                id="can_delete_messages_toggle"
                checked={canDeleteMessages}
                onCheckedChange={(c) => setCanDeleteMessages(Boolean(c))}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="can_delete_messages_toggle" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>লাইভ চ্যাট মেসেজ ডিলিট করার পারমিশন (Delete Live Chat Messages)</span>
                </Label>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  এই পারমিশন চালু থাকলে এই সাব-এডমিন চ্যাটে পাঠানো যে কোনো মেসেজ উভয় পাশ (অ্যাডমিন ও গ্রাহক) থেকে স্থায়ীভাবে মুছে ফেলতে পারবেন।
                </p>
              </div>
            </div>

            {/* Granular Module Permissions */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-foreground block">
                    এডমিন প্যানেল মডিউল পারমিশন (Granular Permissions)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    যে যে মডিউলে টিক দেওয়া থাকবে, সাব-এডমিন শুধুমাত্র সেই অপশনগুলো দেখতে ও পরিচালনা করতে পারবে।
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPermissions}
                  className="h-7 text-[11px] px-2 font-bold"
                >
                  {selectedPermissions.length === ALL_ADMIN_MODULES.length ? 'সব আনসিলেক্ট' : 'সব সিলেক্ট'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border max-h-56 overflow-y-auto">
                {ALL_ADMIN_MODULES.map((mod) => {
                  const isChecked = selectedPermissions.includes(mod.key);
                  return (
                    <label
                      key={mod.key}
                      className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        isChecked ? 'bg-primary/10 border-primary/40' : 'bg-card border-border hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePermission(mod.key)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-xs flex items-center justify-between">
                          <span>{mod.labelBn}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{mod.descriptionBn}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Live Chat Customer Assignment */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    লাইভ চ্যাটের জন্য নির্দিষ্ট গ্রাহক নির্বাচন (Assigned Customers)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    এই সাব-এডমিন শুধুমাত্র নির্বাচিত গ্রাহকদের সাথেই লাইভ টেক্সট ও ভয়েস চ্যাট করতে পারবে। (সুপার এডমিন সবার চ্যাট দেখতে পাবেন)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-bold">
                    সিলেক্টেড: {toBengaliNumber(selectedCustomerIds.length)} জন
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllFilteredCustomers}
                    className="h-7 text-[11px] px-2 font-bold"
                  >
                    তালিকার সবাইকে যুক্ত
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border max-h-52 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="col-span-2 text-center py-4 text-muted-foreground text-xs">
                    কোনো গ্রাহক পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const identifier = cust.phone || cust.id;
                    const isAssigned = selectedCustomerIds.includes(identifier);
                    return (
                      <label
                        key={identifier}
                        className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                          isAssigned ? 'bg-blue-50 border-blue-300' : 'bg-card border-border hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => handleToggleCustomer(identifier)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground text-xs truncate">{cust.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{cust.phone}</div>
                        </div>
                        {isAssigned && (
                          <Badge className="bg-blue-600 text-white text-[9px] px-1 py-0">অ্যাসাইনড</Badge>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                {editingSubAdmin ? 'পরিবর্তন সংরক্ষণ করুন' : 'সাব-এডমিন তৈরি করুন'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              সাব-এডমিন ডিলিট নিশ্চিতকরণ
            </DialogTitle>
            <DialogDescription className="text-xs">
              আপনি কি নিশ্চিত যে এই সাব-এডমিন অ্যাকাউন্টটি ডিলিট করতে চান? ডিলিট করার পর তিনি আর এডমিন প্যানেলে প্রবেশ করতে পারবেন না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              না, বাতিল
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubAdmin}>
              হ্যাঁ, ডিলিট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dedicated Real-time Customer Assignment Dialog */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {assignTargetSubAdmin?.name} এর জন্য গ্রাহক নির্ধারণ করুন
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  ইউজারনেম: <span className="font-mono font-semibold text-primary">{assignTargetSubAdmin?.username}</span> • সাব-এডমিন শুধুমাত্র নির্বাচিত গ্রাহকদেরই দেখতে পারবে
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Realtime Supabase Notice */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>রিয়েল-টাইম ক্লাউড আইসোলেশন ও ফিল্টারিং</span>
              </div>
              <p className="text-blue-800/80 dark:text-blue-400 text-[11px] leading-relaxed">
                এই সাব-এডমিন যখন লগইন করবেন, তখন তার ড্যাশবোর্ড, ইউজার অ্যাকাউন্ট তালিকা, লোন আবেদন এবং লাইভ চ্যাটে শুধুমাত্র নিচের নির্বাচিত গ্রাহকদের তথ্যই রিয়েল-টাইমে দেখতে পারবেন।
              </p>
            </div>

            {/* Search and Batch Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="নাম, মোবাইল নম্বর বা এনআইডি দিয়ে খুঁজুন..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllAssignCustomers}
                  className="h-9 text-xs font-bold"
                >
                  {assignFilteredCustomers.length > 0 &&
                  assignFilteredCustomers.every((c) => assignCustomerIds.includes(c.phone || c.id))
                    ? 'সবগুলো বাতিল'
                    : 'সবগুলো সিলেক্ট করুন'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAssignCustomerIds([])}
                  className="h-9 text-xs text-muted-foreground hover:text-destructive"
                >
                  সব আনচেক
                </Button>
              </div>
            </div>

            {/* Selection Status Badge */}
            <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
              <span>মোট উপলব্ধ গ্রাহক: {toBengaliNumber(users.length)} জন</span>
              <span className="font-bold text-primary">
                নির্বাচিত গ্রাহক: {toBengaliNumber(assignCustomerIds.length)} জন
              </span>
            </div>

            {/* Customers Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-muted/30 p-3 rounded-xl border max-h-72 overflow-y-auto">
              {assignFilteredCustomers.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  কোনো গ্রাহক পাওয়া যায়নি।
                </div>
              ) : (
                assignFilteredCustomers.map((cust) => {
                  const identifier = cust.phone || cust.id;
                  const isChecked = assignCustomerIds.includes(identifier);
                  return (
                    <label
                      key={identifier}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 shadow-xs'
                          : 'bg-card border-border hover:bg-muted/60'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleToggleAssignCustomer(identifier)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-foreground truncate flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          {cust.kycVerified && (
                            <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0">ভেরিফাইড</Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {cust.phone}
                        </div>
                        {cust.accountNumber && (
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            অ্যাকাউন্ট: {cust.accountNumber}
                          </div>
                        )}
                      </div>
                      {isChecked && (
                        <Badge className="bg-blue-600 text-white text-[10px] shrink-0">
                          অ্যাসাইনড
                        </Badge>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              disabled={isSavingAssign}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              onClick={handleSaveAssignments}
              disabled={isSavingAssign}
              className="bg-primary text-primary-foreground font-bold gap-1.5"
            >
              <Save className={`w-4 h-4 ${isSavingAssign ? 'animate-spin' : ''}`} />
              <span>{isSavingAssign ? 'ক্লাউডে সেভ হচ্ছে...' : 'গ্রাহক অ্যাসাইন সংরক্ষণ করুন'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
