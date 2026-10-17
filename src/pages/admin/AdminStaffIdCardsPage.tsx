import React, { useState, useRef } from "react";
import { useLoan } from "@/contexts/LoanContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { StaffIdCard } from "@/types/loan";
import { RealisticStaffIdCard } from "@/components/common/RealisticStaffIdCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Contact2, 
  Upload, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Eye, 
  Sparkles,
  Check,
  UserCheck,
  Image as ImageIcon,
  PenTool,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

// Sample pre-loaded professional portrait photos for quick selection
const SAMPLE_PORTRAITS = [
  {
    name: "তাফি শেখ (Image 1 Style)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "ফিমেল অফিসার ২",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "মেল অফিসার ১",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "মেল অফিসার ২",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "ফিমেল অফিসার ৩",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
  }
];

export const AdminStaffIdCardsPage: React.FC = () => {
  const { staffIdCards, saveStaffIdCard, deleteStaffIdCard } = useLoan();
  
  // Selected Card state
  const [selectedCardId, setSelectedCardId] = useState<string>(
    staffIdCards[0]?.id || "staff-1"
  );

  const currentCard = staffIdCards.find((c) => c.id === selectedCardId) || staffIdCards[0] || {
    id: `staff-${Date.now()}`,
    nameBn: "তাফি শেখ",
    nameEn: "TAFI SHEIKH",
    fatherNameBn: "মোঃ সাজু আহমেদ",
    motherNameBn: "মোসাঃ মোহনা আক্তার",
    dob: "07 Jan 2002",
    idNumber: "63849492839",
    photoUrl: SAMPLE_PORTRAITS[0].url,
    signatureText: "Sheikh",
    designation: "ফিল্ড লোন অফিসার",
    department: "ক্ষুদ্র ঋণ যাচাই ও নিরীক্ষা শাখা",
    bloodGroup: "O+",
    addressBn: "বাসা নং ১২, রোড নং ০৪, ধানমন্ডি, ঢাকা-১২০৫",
    issueDate: "15/01/2024",
    headerGovtBn: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
    headerGovtEn: "Government of the People's Republic of Bangladesh",
    cardTitleBnEn: "Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র",
    createdAt: new Date().toISOString()
  };

  // Local editable form data
  const [formData, setFormData] = useState<StaffIdCard>(currentCard);
  const [viewSide, setViewSide] = useState<"front" | "back" | "both">("both");
  const [isDownloading, setIsDownloading] = useState(false);

  // File input refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const backCardRef = useRef<HTMLDivElement | null>(null);

  // Sync formData when selectedCardId changes
  const handleSelectStaff = (card: StaffIdCard) => {
    setSelectedCardId(card.id);
    setFormData(card);
  };

  // Field change handler
  const handleChange = (field: keyof StaffIdCard, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveStaffIdCard(updated);
  };

  // Handle Photo upload from device / gallery
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, ইত্যাদি) নির্বাচন করুন");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleChange("photoUrl", base64);
      toast.success("গ্যালারি থেকে ছবি সফলভাবে যুক্ত হয়েছে!");
    };
    reader.onerror = () => {
      toast.error("ছবি লোড করতে সমস্যা হয়েছে");
    };
    reader.readAsDataURL(file);
  };

  // Handle Signature upload from device / gallery
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleChange("signatureUrl", base64);
      toast.success("স্বাক্ষরের ছবি সফলভাবে যুক্ত হয়েছে!");
    };
    reader.readAsDataURL(file);
  };

  // Generate random 10 or 11 digit Bangladesh ID number
  const handleGenerateRandomId = () => {
    const randomNum = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    handleChange("idNumber", randomNum);
    toast.success(`নতুন আইডি নম্বর তৈরি হয়েছে: ${randomNum}`);
  };

  // Create new staff card
  const handleCreateNewStaff = () => {
    const newId = `staff-${Date.now()}`;
    const newStaff: StaffIdCard = {
      id: newId,
      nameBn: "নতুন কর্মকর্তা",
      nameEn: "NEW OFFICER",
      fatherNameBn: "মোঃ পিতার নাম",
      motherNameBn: "মোসাঃ মাতার নাম",
      dob: "01 Jan 1998",
      idNumber: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      photoUrl: SAMPLE_PORTRAITS[2].url,
      signatureText: "Officer",
      designation: "ফিল্ড লোন অফিসার",
      department: "ক্ষুদ্র ঋণ যাচাই শাখা",
      bloodGroup: "B+",
      addressBn: "বাড়ি নং ০১, মিরপুর, ঢাকা",
      issueDate: new Date().toLocaleDateString("en-GB"),
      headerGovtBn: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
      headerGovtEn: "Government of the People's Republic of Bangladesh",
      cardTitleBnEn: "Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র",
      createdAt: new Date().toISOString()
    };
    saveStaffIdCard(newStaff);
    setSelectedCardId(newId);
    setFormData(newStaff);
    toast.success("নতুন স্টাফ কার্ড যুক্ত করা হয়েছে! তথ্য পূরণ করুন।");
  };

  // Duplicate current staff card
  const handleDuplicateStaff = () => {
    const newId = `staff-${Date.now()}`;
    const duplicated: StaffIdCard = {
      ...formData,
      id: newId,
      nameBn: `${formData.nameBn} (কপি)`,
      nameEn: `${formData.nameEn} (COPY)`,
      idNumber: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      createdAt: new Date().toISOString()
    };
    saveStaffIdCard(duplicated);
    setSelectedCardId(newId);
    setFormData(duplicated);
    toast.success("স্টাফ কার্ড ডুপ্লিকেট করা হয়েছে!");
  };

  // Delete staff card
  const handleDeleteStaff = (id: string) => {
    if (staffIdCards.length <= 1) {
      toast.error("কমপক্ষে একটি স্টাফ আইডি কার্ড থাকতে হবে!");
      return;
    }
    if (window.confirm("আপনি কি নিশ্চিত এই স্টাফের আইডি কার্ডটি মুছে ফেলতে চান?")) {
      deleteStaffIdCard(id);
      const remaining = staffIdCards.filter((c) => c.id !== id);
      if (remaining[0]) {
        setSelectedCardId(remaining[0].id);
        setFormData(remaining[0]);
      }
      toast.success("স্টাফ আইডি কার্ড মুছে ফেলা হয়েছে!");
    }
  };

  // Download Card as high-resolution PNG using html2canvas
  const handleDownloadPNG = async (sideToDownload: "front" | "back") => {
    const targetElementId = sideToDownload === "front" ? "nid-staff-card-front" : "nid-staff-card-back";
    const element = document.getElementById(targetElementId);
    if (!element) {
      toast.error("কার্ড পাওয়া যায়নি!");
      return;
    }

    try {
      setIsDownloading(true);
      toast.info("হাই-রেজোলিউশন ছবি তৈরি হচ্ছে...");

      const canvas = await html2canvas(element, {
        scale: 3, // 3x sharp resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      const sanitizedName = (formData.nameEn || "staff").replace(/\s+/g, "_").toLowerCase();
      a.download = `NID_Card_${sanitizedName}_${sideToDownload}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`${sideToDownload === "front" ? "সামনের পিঠের" : "পেছনের পিঠের"} ছবি সফলভাবে ডাউনলোড হয়েছে!`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("ছবি ডাউনলোডে সমস্যা হয়েছে। সরাসরি প্রিন্ট অপশন ব্যবহার করতে পারেন।");
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Card
  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout
      title="স্টাফ আইডি কার্ড জেনারেটর (NID রিয়েল ফরম্যাট)"
      subtitle="স্টাফদের জন্য গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত রিয়েল জাতীয় পরিচয়পত্র ফরম্যাটে আইডি কার্ড তৈরি, গ্যালারি থেকে ছবি আপলোড ও সেভ করুন"
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateNewStaff}
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন স্টাফ যোগ করুন
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 border-border"
          >
            <Printer className="w-4 h-4 text-primary" />
            প্রিন্ট কার্ড
          </Button>
        </div>
      }
    >
      {/* STAFF LIST BAR */}
      <div className="mb-6 bg-card border border-border rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Contact2 className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-foreground">
              সংরক্ষিত স্টাফ আইডি তালিকা ({staffIdCards.length} জন)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              onClick={handleDuplicateStaff}
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3.5 h-3.5" />
              কার্ড কপি
            </Button>
            <Button
              onClick={() => handleDeleteStaff(formData.id)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              মুছে ফেলুন
            </Button>
          </div>
        </div>

        {/* Staff Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-thin">
          {staffIdCards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <button
                key={card.id}
                onClick={() => handleSelectStaff(card)}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-accent/15 border-accent text-foreground font-bold shadow-xs"
                    : "bg-muted/40 border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-muted border border-border/80 shrink-0">
                  {card.photoUrl ? (
                    <img src={card.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent/20" />
                  )}
                </div>
                <span>{card.nameBn || card.nameEn}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: PREVIEW (LEFT) + FULL CONTROLS & EDITOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIVE CARD PREVIEW & DOWNLOADS */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  লাইভ কার্ড প্রিভিউ (অফিসিয়াল NID সাইজ)
                </CardTitle>
                <CardDescription className="text-[11px] mt-0.5">
                  যে কোনো তথ্য বা ছবি পরিবর্তন করলে কার্ডে সাথে সাথে রিয়েল-টাইমে আপডেট হবে
                </CardDescription>
              </div>

              {/* View Side Toggles */}
              <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setViewSide("front")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    viewSide === "front" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  সামনের পিঠ
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("back")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    viewSide === "back" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  পেছনের পিঠ
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("both")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    viewSide === "both" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  উভয় পিঠ
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/40 flex flex-col items-center justify-center min-h-[380px] overflow-x-auto">
              {/* Scale Container */}
              <div className="flex flex-col items-center gap-6 max-w-full">
                {/* FRONT CARD */}
                {(viewSide === "front" || viewSide === "both") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                      <span className="font-bold flex items-center gap-1.5 text-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        সামনের পিঠ (Front Side)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDownloading}
                        onClick={() => handleDownloadPNG("front")}
                        className="h-7 text-[11px] gap-1 text-accent font-semibold hover:bg-accent/10"
                      >
                        <Download className="w-3 h-3" />
                        PNG ডাউনলোড
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-sm shadow-xl border border-slate-300">
                      <RealisticStaffIdCard
                        id="nid-staff-card-front"
                        card={formData}
                        side="front"
                      />
                    </div>
                  </div>
                )}

                {/* BACK CARD */}
                {(viewSide === "back" || viewSide === "both") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                      <span className="font-bold flex items-center gap-1.5 text-foreground">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        পেছনের পিঠ (Back Side)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDownloading}
                        onClick={() => handleDownloadPNG("back")}
                        className="h-7 text-[11px] gap-1 text-accent font-semibold hover:bg-accent/10"
                      >
                        <Download className="w-3 h-3" />
                        PNG ডাউনলোড
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-sm shadow-xl border border-slate-300">
                      <RealisticStaffIdCard
                        id="nid-staff-card-back"
                        card={formData}
                        side="back"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Quick Action Bar under preview */}
            <div className="p-3.5 bg-card border-t border-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                উচ্চ রেজোলিউশন ৩x ক্রিস্প ক্লিয়ার প্রিন্ট ও পিএনজি রেডি
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleDownloadPNG("front")}
                  size="sm"
                  variant="outline"
                  disabled={isDownloading}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  সামনের ছবি (PNG)
                </Button>

                <Button
                  onClick={() => handleDownloadPNG("back")}
                  size="sm"
                  variant="outline"
                  disabled={isDownloading}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  পেছনের ছবি (PNG)
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: FULL ID CARD EDITOR FORM WITH TABS */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="p-4 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PenTool className="w-4 h-4 text-accent" />
                কার্ডের যাবতীয় তথ্য ও ছবি এডিটর
              </CardTitle>
              <CardDescription className="text-[11px]">
                নাম, পিতা-মাতার নাম, ছবি, স্বাক্ষর, জন্মতারিখ ও আইডি নম্বর ইচ্ছেমতো পরিবর্তন করুন
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4 w-full h-9 mb-4">
                  <TabsTrigger value="basic" className="text-[11px] font-semibold">
                    মূল তথ্য
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="text-[11px] font-semibold">
                    ছবি ও স্বাক্ষর
                  </TabsTrigger>
                  <TabsTrigger value="address" className="text-[11px] font-semibold">
                    ঠিকানা ও ব্যাক
                  </TabsTrigger>
                  <TabsTrigger value="header" className="text-[11px] font-semibold">
                    শিরোনাম
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: BASIC INFORMATION */}
                <TabsContent value="basic" className="space-y-3.5 text-xs">
                  {/* নাম (বাংলা) */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                      <span>নাম (বাংলায়) *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">যেমন: তাফি শেখ</span>
                    </Label>
                    <Input
                      value={formData.nameBn}
                      onChange={(e) => handleChange("nameBn", e.target.value)}
                      placeholder="কর্মকর্তার বাংলা নাম"
                      className="h-9 text-xs font-bold"
                    />
                  </div>

                  {/* Name (English) */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                      <span>Name (English in Capital) *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">যেমন: TAFI SHEIKH</span>
                    </Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => handleChange("nameEn", e.target.value.toUpperCase())}
                      placeholder="OFFICER ENGLISH NAME"
                      className="h-9 text-xs font-mono font-bold uppercase"
                    />
                  </div>

                  {/* পিতা (বাংলা) */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      পিতা (বাংলায়) *
                    </Label>
                    <Input
                      value={formData.fatherNameBn}
                      onChange={(e) => handleChange("fatherNameBn", e.target.value)}
                      placeholder="যেমন: মোঃ সাজু আহমেদ"
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* মাতা (বাংলা) */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      মাতা (বাংলায়) *
                    </Label>
                    <Input
                      value={formData.motherNameBn}
                      onChange={(e) => handleChange("motherNameBn", e.target.value)}
                      placeholder="যেমন: মোসাঃ মোহনা আক্তার"
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                      <span>Date of Birth *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">যেমন: 07 Jan 2002</span>
                    </Label>
                    <Input
                      value={formData.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      placeholder="07 Jan 2002"
                      className="h-9 text-xs font-bold text-destructive"
                    />
                  </div>

                  {/* ID NO */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-foreground">
                        ID NO (আইডি নম্বর) *
                      </Label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomId}
                        className="text-[10px] text-accent font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        নতুন জেনারেট
                      </button>
                    </div>
                    <Input
                      value={formData.idNumber}
                      onChange={(e) => handleChange("idNumber", e.target.value)}
                      placeholder="যেমন: 63849492839"
                      className="h-9 text-xs font-mono font-black text-destructive tracking-wider"
                    />
                  </div>
                </TabsContent>

                {/* TAB 2: PHOTO & SIGNATURE UPLOAD */}
                <TabsContent value="photo" className="space-y-4 text-xs">
                  {/* Gallery Photo Upload */}
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        গ্যালারি / ডিভাইস থেকে ছবি আপলোড
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        সরাসরি সংযুক্ত হবে
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 rounded-md overflow-hidden bg-slate-200 border border-slate-400 shrink-0 shadow-inner">
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                            কোন ছবি নেই
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                        <Button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs font-bold border-accent text-accent hover:bg-accent/10 gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          গ্যালারি থেকে ফটো বেছে নিন
                        </Button>
                        <p className="text-[10px] text-muted-foreground">
                          পাসপোর্ট সাইজ বা সেলফি ছবি আপলোড করলে কার্ডের ফ্রেমে সুন্দরভাবে সেট হবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-made Portrait Gallery */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-foreground">
                      অথবা স্যাম্পল অফিসার ছবি থেকে নির্বাচন করুন:
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {SAMPLE_PORTRAITS.map((sample, idx) => {
                        const isChosen = formData.photoUrl === sample.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleChange("photoUrl", sample.url);
                              toast.success(`${sample.name} ছবি সেট করা হয়েছে!`);
                            }}
                            className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${
                              isChosen ? "border-accent ring-2 ring-accent/30 shadow-md" : "border-border hover:border-accent/60"
                            }`}
                          >
                            <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                            {isChosen && (
                              <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-accent drop-shadow" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-3">
                    <Label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                      <span>স্বাক্ষর (Signature)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">ছবির নিচে প্রদর্শিত হবে</span>
                    </Label>

                    <div className="space-y-2">
                      <Input
                        value={formData.signatureText || ""}
                        onChange={(e) => handleChange("signatureText", e.target.value)}
                        placeholder="যেমন: Sheikh বা Tafi"
                        className="h-8 text-xs italic font-serif"
                      />

                      <div className="flex items-center gap-2">
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                        />
                        <Button
                          type="button"
                          onClick={() => signatureInputRef.current?.click()}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground border border-dashed border-border"
                        >
                          <Upload className="w-3 h-3" />
                          স্বাক্ষরের ইমেজ আপলোড (ঐচ্ছিক)
                        </Button>
                        {formData.signatureUrl && (
                          <Button
                            type="button"
                            onClick={() => handleChange("signatureUrl", "")}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                          >
                            স্বাক্ষর মুছুন
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: ADDRESS, DESIGNATION & BACK CARD DETAILS */}
                <TabsContent value="address" className="space-y-3 text-xs">
                  {/* পদবী ও বিভাগ */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-foreground">পদবী (Designation)</Label>
                      <Input
                        value={formData.designation || ""}
                        onChange={(e) => handleChange("designation", e.target.value)}
                        placeholder="যেমন: ফিল্ড লোন অফিসার"
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-foreground">শাখা / বিভাগ</Label>
                      <Input
                        value={formData.department || ""}
                        onChange={(e) => handleChange("department", e.target.value)}
                        placeholder="যেমন: ঋণ যাচাই শাখা"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* রক্তের গ্রুপ ও ইস্যুর তারিখ */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-foreground">রক্তের গ্রুপ (Blood Group)</Label>
                      <Select
                        value={formData.bloodGroup || "O+"}
                        onValueChange={(val) => handleChange("bloodGroup", val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-foreground">প্রদানের তারিখ (Issue Date)</Label>
                      <Input
                        value={formData.issueDate || ""}
                        onChange={(e) => handleChange("issueDate", e.target.value)}
                        placeholder="যেমন: 15/01/2024"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* স্থায়ী / বর্তমান ঠিকানা */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      ঠিকানা (কার্ডের পেছনের পিঠে প্রদর্শিত)
                    </Label>
                    <Textarea
                      value={formData.addressBn || ""}
                      onChange={(e) => handleChange("addressBn", e.target.value)}
                      placeholder="বাসা নং ১২, রোড নং ০৪, ধানমন্ডি, ঢাকা-১২০৫"
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </TabsContent>

                {/* TAB 4: HEADER TITLES */}
                <TabsContent value="header" className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      শীর্ষ শিরোনাম (বাংলা)
                    </Label>
                    <Input
                      value={formData.headerGovtBn || ""}
                      onChange={(e) => handleChange("headerGovtBn", e.target.value)}
                      placeholder="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
                      className="h-8 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      শীর্ষ শিরোনাম (English)
                    </Label>
                    <Input
                      value={formData.headerGovtEn || ""}
                      onChange={(e) => handleChange("headerGovtEn", e.target.value)}
                      placeholder="Government of the People's Republic of Bangladesh"
                      className="h-8 text-xs font-bold text-[#047857]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-foreground">
                      সাব-টাইটেল (লাল রঙের টেক্সট)
                    </Label>
                    <Input
                      value={formData.cardTitleBnEn || ""}
                      onChange={(e) => handleChange("cardTitleBnEn", e.target.value)}
                      placeholder="Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র"
                      className="h-8 text-xs font-bold text-destructive"
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground pt-1">
                    টিপস: আপনি চাইলে এটি "Staff ID Card / কর্মকর্তা পরিচয় পত্র" বা আপনার প্রতিষ্ঠানের নামেও পরিবর্তন করতে পারবেন।
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
