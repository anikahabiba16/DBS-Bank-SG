import React, { useState } from 'react';
import { LoanApplicationDocument } from '@/types/loan';
import { useLoan } from '@/contexts/LoanContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Eye, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  User,
  Phone,
  FileBadge,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerDocumentInspectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  customerNid?: string;
  documents: LoanApplicationDocument[];
}

export const CustomerDocumentInspectorModal: React.FC<CustomerDocumentInspectorModalProps> = ({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  customerNid,
  documents: initialDocuments
}) => {
  const { updateDocumentVerification } = useLoan();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDoc, setActiveDoc] = useState<LoanApplicationDocument | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'nid_front':
        return 'এনআইডি ফ্রন্ট পার্ট';
      case 'nid_back':
        return 'এনআইডি ব্যাক পার্ট';
      case 'selfie':
        return 'গ্রাহকের লাইভ ছবি/সেলফি';
      case 'utility_bill':
        return 'বিদ্যুৎ/ইউটিলিটি বিল';
      case 'bank_statement':
        return 'ব্যাংক হিসাব বিবরণী (৬ মাস)';
      case 'income_proof':
        return 'বেতন সনদ / আয়ের প্রমাণ';
      case 'signature':
        return 'ডিজিটাল স্বাক্ষর';
      case 'nominee_doc':
        return 'নমিনির পরিচয়পত্র ও ছবি';
      case 'deposit_slip':
        return 'আমানত জমা স্লিপ (Deposit)';
      default:
        return 'অন্যান্য ডকুমেন্ট';
    }
  };

  const categories = [
    { id: 'all', label: 'সকল ডকুমেন্টস' },
    { id: 'nid_front', label: 'এনআইডি কার্ড' },
    { id: 'selfie', label: 'ছবি / সেলফি' },
    { id: 'utility_bill', label: 'ইউটিলিটি বিল' },
    { id: 'bank_statement', label: 'ব্যাংক স্টেটমেন্ট' },
    { id: 'income_proof', label: 'বেতন/আয়ের প্রমাণ' },
    { id: 'signature', label: 'স্বাক্ষর' },
    { id: 'nominee_doc', label: 'নমিনি' },
    { id: 'deposit_slip', label: 'ডিপোজিট স্লিপ' }
  ];

  const filteredDocs = initialDocuments.filter((doc) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'nid_front') {
      return doc.category === 'nid_front' || doc.category === 'nid_back' || doc.name.toLowerCase().includes('nid');
    }
    return doc.category === selectedCategory;
  });

  const handleVerify = (doc: LoanApplicationDocument) => {
    updateDocumentVerification(doc.id, 'verified');
    doc.status = 'verified';
    doc.verified = true;
    toast.success(`"${doc.name}" সফলভাবে যাচাই ও অনুমোদন করা হয়েছে!`);
  };

  const handleReject = (doc: LoanApplicationDocument) => {
    if (!rejectReasonInput.trim()) {
      toast.error('বাতিলের সুনির্দিষ্ট কারণ লিখুন');
      return;
    }
    updateDocumentVerification(doc.id, 'rejected', rejectReasonInput);
    doc.status = 'rejected';
    doc.verified = false;
    doc.rejectionReason = rejectReasonInput;
    setRejectingDocId(null);
    setRejectReasonInput('');
    toast.error(`"${doc.name}" বাতিল করা হয়েছে। গ্রাহককে পুনরায় আপলোডের নোটিশ দেওয়া হবে।`);
  };

  const handleOpenLightbox = (doc: LoanApplicationDocument) => {
    setActiveDoc(doc);
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100%-1rem)] md:max-w-4xl max-h-[92dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  গ্রাহক আপলোডকৃত ডকুমেন্টস ভেরিফিকেশন প্যানেল
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <User className="w-3.5 h-3.5 text-accent" /> {customerName}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" /> {customerPhone}
                  </span>
                  {customerNid && (
                    <span className="flex items-center gap-1 font-mono text-muted-foreground">
                      <FileBadge className="w-3.5 h-3.5" /> এনআইডি: {customerNid}
                    </span>
                  )}
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    মোট ফাইল: {initialDocuments.length} টি
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Category Filter Pills */}
          <div className="py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {initialDocuments.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border px-4">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">কোনো আপলোডকৃত ডকুমেন্ট নেই</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  এই গ্রাহক এখনও কোনো এনআইডি বা ছবি আপলোড করেননি। শুধুমাত্র ক্লায়েন্ট নিজে যেসকল ফাইল শেয়ার করবেন, কেবল সেগুলিই এখানে রিয়েল-টাইমে দেখতে পাবেন। কোনো ধরনের ডামি পিকচার প্রদর্শন করা হয় না।
                </p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs sm:text-sm">এই ক্যাটাগরিতে কোনো আপলোডকৃত ডকুমেন্ট পাওয়া যায়নি।</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isVerified = doc.status === 'verified';
                const isRejected = doc.status === 'rejected';

                return (
                  <div
                    key={doc.id}
                    className="border border-border rounded-lg bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Thumbnail View */}
                    <div 
                      className="relative h-44 bg-muted/80 overflow-hidden group cursor-pointer"
                      onClick={() => handleOpenLightbox(doc)}
                    >
                      {doc.previewUrl ? (
                        <img
                          src={doc.previewUrl}
                          alt={doc.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-10 h-10 text-muted-foreground mb-1" />
                          <span className="text-xs font-mono text-muted-foreground">{doc.name}</span>
                        </div>
                      )}

                      {/* Overlay On Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenLightbox(doc)}
                          className="bg-white/90 hover:bg-white text-zinc-900 text-xs font-semibold gap-1.5 shadow"
                        >
                          <Maximize2 className="w-3.5 h-3.5" /> বড় করে দেখুন
                        </Button>
                      </div>

                      {/* Category Tag on Top Left */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-normal border-none">
                          {getCategoryLabel(doc.category)}
                        </Badge>
                      </div>

                      {/* Status Tag on Top Right */}
                      <div className="absolute top-2 right-2">
                        {isVerified ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] flex items-center gap-1 shadow-sm border-none">
                            <CheckCircle2 className="w-3 h-3" /> যাচাইকৃত
                          </Badge>
                        ) : isRejected ? (
                          <Badge className="bg-red-600 text-white text-[10px] flex items-center gap-1 shadow-sm border-none">
                            <XCircle className="w-3 h-3" /> বাতিল
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white text-[10px] flex items-center gap-1 shadow-sm border-none">
                            <AlertTriangle className="w-3 h-3" /> অপেক্ষমান
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                          <span>{doc.size}</span>
                          <span>তারিখ: {doc.uploadDate}</span>
                        </div>
                        {doc.rejectionReason && (
                          <p className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded mt-1.5 border border-red-200">
                            <strong>বাতিলের কারণ:</strong> {doc.rejectionReason}
                          </p>
                        )}
                      </div>

                      {/* Inline Reject Reason Box */}
                      {rejectingDocId === doc.id ? (
                        <div className="space-y-1.5 bg-muted/60 p-2 rounded text-xs border border-border">
                          <label className="text-[10px] font-semibold text-foreground">বাতিলের কারণ লিখুন:</label>
                          <Input
                            placeholder="যেমন: ছবি স্পষ্ট নয়, রি-আপলোড করুন"
                            value={rejectReasonInput}
                            onChange={(e) => setRejectReasonInput(e.target.value)}
                            className="h-7 text-xs"
                          />
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRejectingDocId(null)}
                              className="h-6 text-[11px] px-2"
                            >
                              বাতিল
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(doc)}
                              className="h-6 text-[11px] px-2.5"
                            >
                              নিশ্চিত করুন
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenLightbox(doc)}
                              className="h-7 text-[11px] gap-1 px-2 font-medium"
                            >
                              <Eye className="w-3 h-3 text-primary" /> দেখুন
                            </Button>

                            {doc.previewUrl && (
                              <a
                                href={doc.previewUrl}
                                download={doc.name || 'document.jpg'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                                  title="সরাসরি ডাউনলোড করুন"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRejectingDocId(doc.id);
                                setRejectReasonInput('');
                              }}
                              className="h-7 text-[11px] px-2 text-red-600 hover:bg-red-50"
                              title="ডকুমেন্ট বাতিল করুন"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVerify(doc)}
                              className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              title="ডকুমেন্ট অনুমোদন করুন"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> যাচাই
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              সকল ডকুমেন্টস সংরক্ষিত ও এনক্রিপ্টেড ব্যাকএন্ডে সংরক্ষিত রয়েছে।
            </span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Lightbox Modal */}
      {activeDoc && (
        <Dialog open={!!activeDoc} onOpenChange={() => setActiveDoc(null)}>
          <DialogContent className="max-w-[calc(100%-1rem)] md:max-w-4xl max-h-[95dvh] p-3 sm:p-5 flex flex-col">
            <DialogHeader className="border-b border-border pb-2 flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  {activeDoc.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  ক্যাটাগরি: {getCategoryLabel(activeDoc.category)} • সাইজ: {activeDoc.size} • আপলোড: {activeDoc.uploadDate}
                </DialogDescription>
              </div>

              {/* Zoom & Rotate Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="h-8 w-8 p-0"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="h-8 w-8 p-0"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="h-8 w-8 p-0"
                  title="ঘোরান (Rotate)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
                {activeDoc.previewUrl && (
                  <>
                    <a
                      href={activeDoc.previewUrl}
                      download={activeDoc.name || 'customer_document.jpg'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button size="sm" className="h-8 text-xs gap-1 bg-primary text-primary-foreground font-bold shadow-sm">
                        <Download className="w-3.5 h-3.5" /> ডাউনলোড
                      </Button>
                    </a>
                    <a
                      href={activeDoc.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> নতুন ট্যাব
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </DialogHeader>

            {/* Viewer Stage */}
            <div className="flex-1 min-h-[350px] max-h-[60vh] bg-zinc-950/90 rounded-lg flex items-center justify-center overflow-auto p-4 my-2">
              {activeDoc.previewUrl ? (
                <img
                  src={activeDoc.previewUrl}
                  alt={activeDoc.name}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }}
                  className="object-contain shadow-2xl rounded"
                />
              ) : (
                <div className="text-center text-zinc-400 p-8 space-y-2">
                  <FileText className="w-16 h-16 mx-auto text-zinc-600" />
                  <p className="text-sm">পিডিএফ বা টেক্সট ফাইল প্রিভিউ উপলব্ধ নয়</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleVerify(activeDoc)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> ডকুমেন্টটি সঠিক হিসেবে অনুমোদন করুন
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveDoc(null)} className="text-xs">
                প্রিভিউ বন্ধ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
