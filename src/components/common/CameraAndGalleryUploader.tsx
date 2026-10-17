import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Image as ImageIcon, CheckCircle2, RotateCcw, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CameraAndGalleryUploaderProps {
  label?: string;
  title?: string;
  subLabel?: string;
  description?: string;
  value?: string;
  imageUrl?: string;
  onChange?: (dataUrl: string) => void;
  onImageChange?: (dataUrl: string) => void;
  mode?: 'user' | 'environment'; // 'user' for selfie, 'environment' for documents
  cameraFacing?: string;
  required?: boolean;
}

export const CameraAndGalleryUploader: React.FC<CameraAndGalleryUploaderProps> = ({
  label: propLabel,
  title,
  subLabel: propSubLabel,
  description,
  value: propValue,
  imageUrl,
  onChange: propOnChange,
  onImageChange,
  mode: propMode = 'environment',
  cameraFacing,
  required = false
}) => {
  const label = propLabel || title || 'ডকুমেন্ট আপলোড';
  const subLabel = propSubLabel || description;
  const value = propValue || imageUrl;
  const onChange = propOnChange || onImageChange || (() => {});
  const mode = (cameraFacing === 'user' ? 'user' : propMode) as 'user' | 'environment';
  const [cameraOpen, setCameraOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Trigger gallery file chooser
  const handleOpenGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange(result);
          toast.success(`${label} সফলভাবে আপলোড হয়েছে`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open live webcam / phone camera modal
  const handleStartCamera = async () => {
    setCameraOpen(true);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode === 'user' ? 'user' : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      toast.error('ক্যামেরা চালু করা সম্ভব হয়নি। ডিভাইস পারমিশন চেক করুন অথবা গ্যালারি থেকে ছবি সিলেক্ট করুন।');
      // Fallback: trigger file input with capture attribute
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', mode === 'user' ? 'user' : 'environment');
        fileInputRef.current.click();
      }
      setCameraOpen(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onChange(dataUrl);
      toast.success(`${label} ছবি তোলা হয়েছে`);
      handleStopCamera();
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
    setCameraOpen(false);
  };

  const handleRemovePhoto = () => {
    onChange('');
  };

  return (
    <div className="space-y-2 p-3.5 rounded-xl border border-dashed border-border bg-card/60">
      <div className="flex justify-between items-start">
        <div>
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          {subLabel && <p className="text-[11px] text-muted-foreground mt-0.5">{subLabel}</p>}
        </div>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> সিলেক্টেড
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Preview or Empty State */}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border bg-muted/40 aspect-[4/3] max-h-48 w-full flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleOpenGallery}
              className="text-xs font-semibold h-8"
            >
              পরিবর্তন করুন
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemovePhoto}
              className="text-xs font-semibold h-8"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 pt-1 w-full min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenGallery}
            className="w-full h-10 text-xs font-bold flex items-center justify-center gap-2 border-border/80 hover:bg-muted/80 shadow-2xs rounded-xl px-2 min-w-0"
          >
            <ImageIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">গ্যালারি থেকে আপলোড</span>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={handleStartCamera}
            className="w-full h-10 text-xs font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 rounded-xl px-2 min-w-0"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="truncate">ক্যামেরায় সরাসরি ছবি তুলুন</span>
          </Button>
        </div>
      )}

      {/* Camera Live Modal */}
      <Dialog open={cameraOpen} onOpenChange={(open) => !open && handleStopCamera()}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] md:max-w-md p-4 sm:p-5 max-h-[88dvh] overflow-y-auto rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {label} — সরাসরি লাইভ ক্যামেরা
            </DialogTitle>
            <DialogDescription className="text-xs">
              ক্যামেরার সামনে সঠিকভাবে ডকুমেন্টস বা মুখমণ্ডল রাখুন এবং 'ছবি তুলুন' চাপুন।
            </DialogDescription>
          </DialogHeader>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!streamActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                ক্যামেরা লোড হচ্ছে...
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={!streamActive}
              className="flex-1 h-11 bg-primary text-primary-foreground font-bold text-sm shadow-md"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              ছবি তুলুন (Take Photo)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleStopCamera}
              className="h-11 px-4 text-xs font-semibold"
            >
              বাতিল
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
