import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImageDirect } from '@/services/imageUploadService';
import { Upload, Image as ImageIcon, Loader2, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface DirectImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
  placeholder?: string;
  folder?: string;
  aspectHint?: string;
}

export const DirectImageUploadField: React.FC<DirectImageUploadFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  placeholder = 'https://.../logo.png',
  folder = 'logos',
  aspectHint
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const publicUrl = await uploadImageDirect(file, {
        bucket: 'branding_assets',
        folder,
        maxSizeMB: 1,
        onProgress: (p) => setUploadProgress(p)
      });

      if (publicUrl) {
        onChange(publicUrl);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error('ইমেজ আপলোড করতে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    toast.info('লোগো মুছে ফেলা হয়েছে');
  };

  return (
    <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-muted/20">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-bold text-foreground">
          {label}
        </Label>
        {aspectHint && (
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
            {aspectHint}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      )}

      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        {/* Direct Upload Button from PC / Mobile */}
        <Button
          type="button"
          onClick={handleTriggerUpload}
          disabled={isUploading}
          className="h-9 px-3.5 text-xs font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs shrink-0 rounded-xl"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>আপলোড হচ্ছে ({uploadProgress}%)...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>ডিভাইস থেকে সরাসরি আপলোড (PC / মোবাইল)</span>
            </>
          )}
        </Button>

        {/* Alternative URL Input */}
        <div className="relative flex-1 min-w-0">
          <Input
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 text-xs font-mono pr-7"
            disabled={isUploading}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-destructive"
              title="মুছে ফেলুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress Bar if active */}
      {isUploading && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Live Preview Box */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border/80 mt-2">
          <div className="w-12 h-12 rounded-lg bg-white border border-border/80 flex items-center justify-center p-1 shadow-2xs overflow-hidden shrink-0">
            <img src={value} alt="Logo Preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>সফলভাবে যুক্ত ও সিঙ্ক হয়েছে</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{value}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerUpload}
            className="h-7 text-[11px] px-2 font-semibold shrink-0 gap-1 border-border"
          >
            <RotateCcw className="w-3 h-3" />
            <span>পরিবর্তন</span>
          </Button>
        </div>
      )}
    </div>
  );
};
