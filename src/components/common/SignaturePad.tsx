import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check, Undo2, PenTool } from 'lucide-react';
import { toast } from 'sonner';

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  label = 'আবেদনকারীর ডিজিটাল ইলেকট্রনিক স্বাক্ষর (Touch Signature)',
  required = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(value));
  const [history, setHistory] = useState<string[]>(value ? [value] : []);

  // Initialize canvas with proper scale and resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set internal resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A'; // Dark slate-blue stroke
    ctx.lineWidth = 2.5;

    // If pre-existing value exists, draw it
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, []);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setHistory((prev) => [...prev, dataUrl]);
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setHistory([]);
    onChange('');
    toast.info('স্বাক্ষর মুছে ফেলা হয়েছে। পুনরায় স্বাক্ষর করুন।');
  };

  const undoLastStroke = () => {
    if (history.length <= 1) {
      clearCanvas();
      return;
    }

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (previousState) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHistory(newHistory);
        onChange(previousState);
        setHasDrawn(true);
      };
      img.src = previousState;
    } else {
      clearCanvas();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-primary" />
          <span>{label}</span>
          {required && <span className="text-destructive font-black">*</span>}
        </label>
        {hasDrawn && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-700" /> স্বাক্ষর গৃহীত হয়েছে
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-primary/30 rounded-2xl p-2 bg-gradient-to-b from-card via-card to-muted/30 shadow-sm transition-all focus-within:border-primary">
        {/* Helper Watermark */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-muted-foreground/60 select-none px-4 text-center">
            <span className="text-xs font-bold text-foreground/70">
              এখানে আঙুল (Touch) বা মাউস দিয়ে আপনার স্বাক্ষর আঁকুন
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              কোনো কাগজের ছবি আপলোড করতে হবে না, সরাসরি স্ক্রিনেই স্পর্শ করে সাইন করুন
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 sm:h-44 bg-transparent cursor-crosshair rounded-xl touch-none"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 px-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            ডিসপ্লেতে আঙুল টেনে স্বাক্ষর সম্পূর্ণ করুন
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={undoLastStroke}
              disabled={history.length === 0}
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              title="পূর্বাবস্থায় ফিরুন"
            >
              <Undo2 className="w-3.5 h-3.5 mr-1" />
              আনডু
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              className="h-7 px-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/20"
              title="স্বাক্ষর মুছে নতুন করে আঁকুন"
            >
              <Eraser className="w-3.5 h-3.5 mr-1" />
              মুছে ফেলুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
