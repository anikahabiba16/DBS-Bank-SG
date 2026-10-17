import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatTaka, toBengaliNumber } from '@/services/storage';
import { LoanPackage, LoanCategory } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Briefcase, 
  UserCheck, 
  GraduationCap, 
  Zap, 
  Tractor 
} from 'lucide-react';
import { toast } from 'sonner';

// Site-wide loan amount limits: ৳20,000 to ৳50,00,000 (50 lakh).
const MIN_LOAN_AMOUNT = 20_000;
const MAX_LOAN_AMOUNT = 5_000_000;

export const AdminPackagesPage: React.FC = () => {
  const { packages, savePackage, deletePackage } = useLoan();

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<LoanPackage | null>(null);

  // Form State
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [taglineBn, setTaglineBn] = useState('');
  const [category, setCategory] = useState<LoanCategory>('personal');
  const [minAmount, setMinAmount] = useState<number>(MIN_LOAN_AMOUNT);
  const [maxAmount, setMaxAmount] = useState<number>(MAX_LOAN_AMOUNT);
  const [defaultRate, setDefaultRate] = useState<number>(9.0);
  const [minDurationMonths, setMinDurationMonths] = useState<number>(3);
  const [maxDurationMonths, setMaxDurationMonths] = useState<number>(60);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1.0);
  const [descriptionBn, setDescriptionBn] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [badgeBn, setBadgeBn] = useState('');
  const [active, setActive] = useState(true);

  const openCreateModal = () => {
    setEditingPkg(null);
    setNameBn('');
    setNameEn('');
    setTaglineBn('');
    setCategory('personal');
    setMinAmount(MIN_LOAN_AMOUNT);
    setMaxAmount(MAX_LOAN_AMOUNT);
    setDefaultRate(8.5);
    setMinDurationMonths(3);
    setMaxDurationMonths(60);
    setProcessingFeePercent(1.0);
    setDescriptionBn('');
    setFeaturesText('কোনো লুকায়িত খরচ নেই\nদ্রুত অনুমোদন\nসহজ মাসিক কিস্তি');
    setBadgeBn('');
    setActive(true);
    setPackageModalOpen(true);
  };

  const openEditModal = (pkg: LoanPackage) => {
    setEditingPkg(pkg);
    setNameBn(pkg.nameBn);
    setNameEn(pkg.nameEn);
    setTaglineBn(pkg.taglineBn || '');
    setCategory(pkg.category);
    setMinAmount(pkg.minAmount);
    setMaxAmount(pkg.maxAmount);
    setDefaultRate(pkg.defaultRate);
    setMinDurationMonths(pkg.minDurationMonths);
    setMaxDurationMonths(pkg.maxDurationMonths);
    setProcessingFeePercent(pkg.processingFeePercent);
    setDescriptionBn(pkg.descriptionBn || '');
    setFeaturesText(pkg.featuresBn.join('\n'));
    setBadgeBn(pkg.badgeBn || '');
    setActive(pkg.active);
    setPackageModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      toast.error('প্যাকেজের বাংলা নাম আবশ্যক');
      return;
    }

    const min = Number(minAmount);
    const max = Number(maxAmount);
    const rate = Number(defaultRate);
    const fee = Number(processingFeePercent);
    const minMonths = Number(minDurationMonths);
    const maxMonths = Number(maxDurationMonths);

    if (!Number.isFinite(min) || min < MIN_LOAN_AMOUNT || min > MAX_LOAN_AMOUNT) {
      toast.error('সর্বনিম্ন ঋণের পরিমাণ ৳২০,০০০ থেকে ৳৫০,০০,০০০-এর মধ্যে দিন');
      return;
    }
    if (!Number.isFinite(max) || max < MIN_LOAN_AMOUNT || max > MAX_LOAN_AMOUNT) {
      toast.error('সর্বোচ্চ ঋণের পরিমাণ ৳২০,০০০ থেকে ৳৫০,০০,০০০-এর মধ্যে দিন');
      return;
    }
    if (min > max) {
      toast.error('সর্বনিম্ন ঋণের পরিমাণ সর্বোচ্চ পরিমাণের চেয়ে বেশি হতে পারে না');
      return;
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      toast.error('বার্ষিক সুদের হার ০ থেকে ১০০-এর মধ্যে দিন');
      return;
    }
    if (!Number.isFinite(fee) || fee < 0 || fee > 100) {
      toast.error('প্রসেসিং ফি ০ থেকে ১০০-এর মধ্যে দিন');
      return;
    }
    if (!Number.isInteger(minMonths) || !Number.isInteger(maxMonths) || minMonths < 1 || maxMonths < minMonths || maxMonths > 600) {
      toast.error('ঋণের মেয়াদ সঠিকভাবে দিন (১–৬০০ মাস)');
      return;
    }

    const featuresArray = featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPkg: LoanPackage = {
      id: editingPkg ? editingPkg.id : `pkg-${Date.now()}`,
      category,
      nameBn: nameBn.trim(),
      nameEn: nameEn.trim() || nameBn.trim(),
      taglineBn: taglineBn.trim() || 'সহজ ও আকর্ষণীয় লোন সুবিধা',
      minAmount: min,
      maxAmount: max,
      defaultRate: rate,
      minDurationMonths: minMonths,
      maxDurationMonths: maxMonths,
      processingFeePercent: fee,
      descriptionBn: descriptionBn.trim() || 'এই লোনের মাধ্যমে গ্রাহকরা তাদের আর্থিক লক্ষ্য পূরণ করতে পারেন।',
      featuresBn: featuresArray.length > 0 ? featuresArray : ['স্বল্প সুদের হার', 'সহজ শর্ত'],
      eligibilityBn: editingPkg?.eligibilityBn || ['বয়স ২১ থেকে ৬০ বছর', 'আয়ের বৈধ প্রমাণ'],
      requiredDocsBn: editingPkg?.requiredDocsBn || ['জাতীয় পরিচয়পত্র', 'পাসপোর্ট সাইজ ছবি', 'আয়ের প্রমাণ'],
      iconName: category === 'business' ? 'Briefcase' : category === 'education' ? 'GraduationCap' : category === 'emergency' ? 'Zap' : category === 'agriculture' ? 'Tractor' : 'UserCheck',
      badgeBn: badgeBn.trim() || undefined,
      active
    };

    savePackage(newPkg);
    toast.success(editingPkg ? 'প্যাকেজ সফলভাবে আপডেট হয়েছে!' : 'নতুন লোন প্যাকেজ সফলভাবে তৈরি হয়েছে!');
    setPackageModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${name}" প্যাকেজটি মুছে ফেলতে চান?`)) {
      deletePackage(id);
      toast.success('প্যাকেজ মুছে ফেলা হয়েছে!');
    }
  };

  const toggleActive = (pkg: LoanPackage) => {
    savePackage({ ...pkg, active: !pkg.active });
    toast.success(`${pkg.nameBn} ${!pkg.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
  };

  return (
    <AdminLayout
      title="লোন প্যাকেজ ও স্কিম ব্যবস্থাপনা"
      subtitle="ওয়েবসাইটের সকল লোন স্কিম, সুদের হার, ঋণের সীমা ও শর্তাবলী সরাসরি এডিট করুন"
      actions={
        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন প্যাকেজ তৈরি করুন</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="ed-card border-border flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-serif text-foreground">
                        {pkg.nameBn}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">{pkg.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pkg.badgeBn && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px]">
                          {pkg.badgeBn}
                        </Badge>
                      )}
                      <Badge variant={pkg.active ? 'default' : 'outline'} className="text-[10px]">
                        {pkg.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-2 line-clamp-2">
                    {pkg.taglineBn}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                  {/* Rates and Terms */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded border border-border/60">
                    <div>
                      <span className="text-muted-foreground block">বার্ষিক সুদ</span>
                      <strong className="text-foreground text-sm font-serif">{toBengaliNumber(pkg.defaultRate)}%</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">মেয়াদ</span>
                      <strong className="text-foreground text-sm">
                        {toBengaliNumber(pkg.minDurationMonths)}-{toBengaliNumber(pkg.maxDurationMonths)} মাস
                      </strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border/60">
                      <span className="text-muted-foreground block">ঋণের সীমা</span>
                      <strong className="text-foreground">
                        {formatTaka(pkg.minAmount)} থেকে {formatTaka(pkg.maxAmount)}
                      </strong>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground block uppercase text-[10px]">ফিচারসমূহ:</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {pkg.featuresBn.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={pkg.active}
                    onCheckedChange={() => toggleActive(pkg)}
                    id={`active-${pkg.id}`}
                  />
                  <Label htmlFor={`active-${pkg.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {pkg.active ? 'লাইভ সাইটে দৃশ্যমান' : 'লুকানো'}
                  </Label>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(pkg)}
                    className="h-7 text-xs gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>এডিট</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(pkg.id, pkg.nameBn)}
                    className="w-7 h-7 text-destructive hover:bg-destructive/10"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create / Edit Package Modal */}
        <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">
                {editingPkg ? 'প্যাকেজ সম্পাদনা (Edit Package)' : 'নতুন লোন প্যাকেজ তৈরি করুন'}
              </DialogTitle>
              <DialogDescription>
                এই প্যাকেজের তথ্য ওয়েবসাইটের হোমপেজ, প্যাকেজ পেজ ও ক্যালকুলেটরে সরাসরি প্রতিফলিত হবে।
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-name-bn">প্যাকেজের বাংলা নাম *</Label>
                  <Input
                    id="pkg-name-bn"
                    placeholder="যেমন: ক্ষুদ্র ব্যবসা লোন"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-name-en">ইংরেজি নাম</Label>
                  <Input
                    id="pkg-name-en"
                    placeholder="SME Business Loan"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pkg-tagline">সংক্ষিপ্ত ট্যাগলাইন / স্লোগান</Label>
                  <Input
                    id="pkg-tagline"
                    placeholder="যেমন: ব্যবসা সম্প্রসারণ ও কার্যকরী মূলধনের জন্য সহজ অর্থায়ন"
                    value={taglineBn}
                    onChange={(e) => setTaglineBn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>ক্যাটাগরি</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as LoanCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">ব্যক্তিগত ঋণ (Personal)</SelectItem>
                      <SelectItem value="business">ব্যবসা ঋণ (Business)</SelectItem>
                      <SelectItem value="education">শিক্ষা ঋণ (Education)</SelectItem>
                      <SelectItem value="emergency">জরুরি ঋণ (Emergency)</SelectItem>
                      <SelectItem value="agriculture">কৃষি ও পল্লী ঋণ (Agri)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-badge">ব্যাজ লেবেল (ঐচ্ছিক)</Label>
                  <Input
                    id="pkg-badge"
                    placeholder="যেমন: সবচেয়ে জনপ্রিয় / দ্রুততম অনুমোদন"
                    value={badgeBn}
                    onChange={(e) => setBadgeBn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-min-amt">সর্বনিম্ন লোনের পরিমাণ (৳২০,০০০–৳৫০,০০,০০০) *</Label>
                  <Input
                    id="pkg-min-amt"
                    type="number"
                    min={MIN_LOAN_AMOUNT}
                    max={MAX_LOAN_AMOUNT}
                    step={5000}
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-max-amt">সর্বোচ্চ লোনের পরিমাণ (সর্বোচ্চ ৳৫০,০০,০০০) *</Label>
                  <Input
                    id="pkg-max-amt"
                    type="number"
                    min={MIN_LOAN_AMOUNT}
                    max={MAX_LOAN_AMOUNT}
                    step={5000}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-rate">বার্ষিক সুদের হার (%) *</Label>
                  <Input
                    id="pkg-rate"
                    type="number"
                    step={0.1}
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-fee">প্রসেসিং ফি (%)</Label>
                  <Input
                    id="pkg-fee"
                    type="number"
                    step={0.1}
                    value={processingFeePercent}
                    onChange={(e) => setProcessingFeePercent(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-min-dur">সর্বনিম্ন মেয়াদ (মাস)</Label>
                  <Input
                    id="pkg-min-dur"
                    type="number"
                    value={minDurationMonths}
                    onChange={(e) => setMinDurationMonths(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-max-dur">সর্বোচ্চ মেয়াদ (মাস)</Label>
                  <Input
                    id="pkg-max-dur"
                    type="number"
                    value={maxDurationMonths}
                    onChange={(e) => setMaxDurationMonths(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pkg-desc">বিস্তারিত বিবরণ</Label>
                  <Textarea
                    id="pkg-desc"
                    placeholder="এই স্কিমের বিস্তারিত বর্ণনা দিন..."
                    rows={2}
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pkg-features">মূল সুবিধাসমূহ (প্রতি লাইনে একটি)</Label>
                  <Textarea
                    id="pkg-features"
                    placeholder="কোনো জামানত লাগবে না&#10;২৪ ঘণ্টায় অনুমোদন&#10;সহজ কিস্তি"
                    rows={3}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                  <Switch
                    checked={active}
                    onCheckedChange={setActive}
                    id="modal-active"
                  />
                  <Label htmlFor="modal-active" className="cursor-pointer font-medium">
                    প্যাকেজটি গ্রাহক সাইটে সক্রিয় ও দৃশ্যমান রাখুন
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setPackageModalOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {editingPkg ? 'আপডেট সম্পন্ন করুন' : 'প্যাকেজ সংরক্ষণ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
