import React, { useState, useRef } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Download, Play, ArrowRight} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const VideoGuideSection: React.FC = () => {
  const { settings } = useLoan();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reliable primary and secondary video URLs
  const videoUrl = settings.videoGuideUrl || 'https://assets.mixkit.co/videos/preview/mixkit-online-banking-with-a-smartphone-41533-large.mp4';
  const fallbackVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const videoTitle = settings.videoGuideTitleBn || settings.videoGuideTitle || 'কীভাবে লোন আবেদন ও একাউন্ট ওপেন করবেন? (ভিডিও গাইড)';
  const videoDesc = settings.videoGuideDescriptionBn || settings.videoGuideDescBn || 'সহজ লোন ডিজিটাল প্ল্যাটফর্মে মাত্র ৫ মিনিটে অ্যাকাউন্ট তৈরি, কাগজপত্র আপলোড ও লোন গ্রহণের সম্পূর্ণ ভিডিও টিউটোরিয়াল।';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Video play error:', err);
        toast.info('ভিডিও প্লে করতে প্লে বাটনে পুনরায় ক্লিক করুন');
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.info('ভিডিও ডাউনলোড শুরু হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');

    try {
      const targetUrl = videoUrl;
      const res = await fetch(targetUrl, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'ShohojLoan_Account_Open_Video_Guide.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        toast.success('ভিডিও গাইড সফলভাবে ডাউনলোড হয়েছে!');
        setIsDownloading(false);
        return;
      }
    } catch {
      // Fallback anchor tag
    }

    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = 'ShohojLoan_Video_Guide.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('ভিডিওটি নতুন ট্যাবে ওপেন হচ্ছে ও ডাউনলোড শুরু হয়েছে');
    } catch {
      toast.error('ডাউনলোড সম্পন্ন করা যায়নি। লিংক সরাসরি ভিজিট করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-bold gap-1.5">
            <Video className="w-3.5 h-3.5" />
            AI ও ভিডিও গাইডলাইন
          </Badge>
          <h2 className="text-xl md:text-2xl font-black text-foreground">
            {videoTitle}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {videoDesc}
          </p>
        </div>

        <Card className="border shadow-lg rounded-2xl overflow-hidden bg-card">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* Video Player Column */}
            <div className="md:col-span-7 bg-slate-950 relative flex items-center justify-center min-h-[300px] md:min-h-[380px] group">
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80"
                className="w-full h-full max-h-[420px] object-contain cursor-pointer"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={fallbackVideoUrl} type="video/mp4" />
                আপনার ব্রাউজার ভিডিও ট্যাগ সাপোর্ট করে না।
              </video>

              {/* Big overlay Play Button when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute z-10 w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border-2 border-white/80"
                  aria-label="ভিডিও প্লে করুন"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Video Guide Key Steps & Download CTA */}
            <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-muted/20 border-t md:border-t-0 md:border-l border-border space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">সহজ ৩ ধাপের প্রক্রিয়া</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">১</div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">রেজিস্ট্রেশন ও লগইন</h4>
                      <p className="text-[11px] text-muted-foreground">মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন।</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">২</div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">কাগজপত্র ও সেলফি আপলোড</h4>
                      <p className="text-[11px] text-muted-foreground">গ্যালারি থেকে সিলেক্ট করুন অথবা সরাসরি ক্যামেরা দিয়ে ছবি তুলুন।</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">৩</div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">অনুমোদন ও ঋণ গ্রহণ</h4>
                      <p className="text-[11px] text-muted-foreground">অ্যাডমিন অনুমোদন করলে ওয়ালেটে ব্যালেন্স জমা হবে এবং উইথড্র করতে পারবেন।</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full text-xs font-semibold gap-2 border-primary/40 text-primary hover:bg-primary/10 h-10"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'ভিডিও গাইড ডাউনলোড করুন'}
                </Button>

                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground font-bold text-xs gap-1.5 h-10 shadow-sm"
                >
                  <Link to="/apply">
                    <span>এখনই লোন আবেদন করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
