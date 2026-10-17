import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Compresses an image file client-side to WEBP format (max 1080p, quality 0.8)
 * Iteratively reduces quality if needed to ensure file size is under maxSizeMB (default 1MB)
 */
export async function compressImageToWebp(file: File, maxSizeMB = 1, initialQuality = 0.8): Promise<{ blob: Blob; wasCompressed: boolean; finalSizeKB: number }> {
  // If already under size and is standard image, still check dimensions
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // 1080p max bound

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = initialQuality;
        const attemptCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Image conversion failed'));
                return;
              }

              const sizeMB = blob.size / (1024 * 1024);
              if (sizeMB > maxSizeMB && q > 0.3) {
                // Iteratively degrade quality
                attemptCompress(q - 0.15);
              } else {
                resolve({
                  blob,
                  wasCompressed: true,
                  finalSizeKB: Math.round(blob.size / 1024)
                });
              }
            },
            'image/webp',
            q
          );
        };

        attemptCompress(currentQuality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Direct file upload handler for Computer and Mobile
 * Uses Supabase Storage with graceful compressed Data URL fallback
 */
export async function uploadImageDirect(
  file: File,
  options?: ImageUploadOptions
): Promise<string> {
  const bucket = options?.bucket || 'branding_assets';
  const folder = options?.folder || 'logos';
  const maxSizeMB = options?.maxSizeMB || 1;

  options?.onProgress?.(20);

  try {
    // 1. Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('শুধুমাত্র JPG, PNG, WEBP বা SVG ইমেজ ফাইল আপলোড করা যাবে');
      throw new Error('Unsupported image format');
    }

    options?.onProgress?.(40);

    // 2. Client-side compression if needed (skip SVG)
    let uploadBlob: Blob = file;
    let finalFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (file.type !== 'image/svg+xml') {
      const { blob, wasCompressed, finalSizeKB } = await compressImageToWebp(file, maxSizeMB, options?.quality || 0.85);
      uploadBlob = blob;
      finalFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;
      if (wasCompressed) {
        // notify user
        toast.info(`ইমেজ স্বয়ংক্রিয়ভাবে অপ্টিমাইজ করা হয়েছে (${finalSizeKB} KB)`);
      }
    }

    options?.onProgress?.(60);

    // 3. Supabase Storage upload
    const filePath = `${folder}/${finalFileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadBlob, {
        contentType: uploadBlob.type || 'image/webp',
        upsert: true
      });

    options?.onProgress?.(80);

    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (data?.publicUrl) {
        options?.onProgress?.(100);
        toast.success('লোগো সফলভাবে আপলোড ও ক্লাউডে সিঙ্ক হয়েছে!');
        return data.publicUrl;
      }
    }

    // 4. Fallback if storage bucket is unavailable
    console.warn('Storage upload note, using optimized data URL fallback:', uploadError);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        options?.onProgress?.(100);
        toast.success('লোগো সফলভাবে যুক্ত হয়েছে!');
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(uploadBlob);
    });
  } catch (err: any) {
    options?.onProgress?.(0);
    toast.error('ইমেজ আপলোডে সমস্যা হয়েছে: ' + (err?.message || 'পুনরায় চেষ্টা করুন'));
    throw err;
  }
}
