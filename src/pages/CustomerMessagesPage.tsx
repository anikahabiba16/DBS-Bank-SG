import React, { useState, useEffect, useRef } from 'react';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useLoan } from '@/contexts/LoanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getConversationMessages,
  sendTextMessage,
  sendVoiceMessage,
  sendImageMessage,
  uploadChatImage,
  uploadChatAudio,
  markMessagesAsRead,
  subscribeToMessages,
  playMessageNotificationSound,
  requestPushNotificationPermission,
  triggerCustomerPushNotification,
  type CustomerMessage,
} from '@/services/customerMessagingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Send,
  Mic,
  Square,
  Play,
  Pause,
  Headphones,
  CheckCheck,
  Clock,
  Sparkles,
  PhoneCall,
  Image as ImageIcon,
  X,
  User,
  ShieldCheck,
  ExternalLink,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// Helper for Bengali Digits
const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const parsed = parseInt(char, 10);
      return !isNaN(parsed) && parsed >= 0 && parsed <= 9 ? bengaliDigits[parsed] : char;
    })
    .join('');
};

const formatAudioTimer = (totalSecs: number, lang: string): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  if (lang === 'bn') {
    return `${toBengaliNumber(minsStr)}:${toBengaliNumber(secsStr)}`;
  }
  return `${minsStr}:${secsStr}`;
};

const getSupportedAudioMimeType = (): string => {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return '';
  }
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg'
  ];
  for (const t of candidateTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return '';
};

export default function CustomerMessagesPage() {
  const { currentUser, settings } = useLoan();
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const isCancelledRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Guest identification without localStorage (uses in-memory session)
  const [guestPhone] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let gid = window.sessionStorage.getItem('dbs_guest_chat_phone');
      if (!gid) {
        gid = 'guest_' + Math.floor(100000 + Math.random() * 900000);
        window.sessionStorage.setItem('dbs_guest_chat_phone', gid);
      }
      return gid;
    }
    return 'guest_' + Math.floor(100000 + Math.random() * 900000);
  });

  const isGuest = !currentUser?.phone;
  const userPhone = currentUser?.phone || guestPhone;
  const userName = currentUser?.name || 'অতিথি গ্রাহক';

  // Request push notifications on mount
  useEffect(() => {
    requestPushNotificationPermission();
  }, []);

  // Scroll to bottom strictly within the message container, never jumping the outer page/window
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      });
    }
  };

  // Load messages from Supabase
  const loadMessages = async () => {
    if (!userPhone) return;
    try {
      const msgs = await getConversationMessages(userPhone);
      setMessages(msgs);
      await markMessagesAsRead(userPhone, 'admin');
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPhone) {
      loadMessages();

      // Realtime subscription (Supabase WebSocket + BroadcastChannel + Local events) with read & delete updates
      const unsubscribe = subscribeToMessages(
        userPhone,
        (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender === 'admin') {
            playMessageNotificationSound();
            triggerCustomerPushNotification('DBS Bank SG সাপোর্ট: নতুন বার্তা', {
              body: newMsg.message_type === 'voice' 
                ? '🎙️ এডমিন একটি ভয়েস বার্তা পাঠিয়েছেন' 
                : (newMsg.content || 'নতুন বার্তা এসেছে'),
              url: '/messages',
              tag: 'chat-inbox-alert'
            });
            toast.info(language === 'bn' ? 'অ্যাডমিন থেকে নতুন বার্তা এসেছে!' : 'New message from Support!');
            void markMessagesAsRead(userPhone, 'admin');
          }
        },
        (updated: any) => {
          // Real-time update for 'Seen / সিন' status when admin reads customer message
          if (updated.id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
            );
          } else if (updated.user_phone === userPhone) {
            setMessages((prev) =>
              prev.map((m) => (m.sender === 'customer' ? { ...m, is_read: true } : m))
            );
          }
        },
        (deletedId: string) => {
          // Instant real-time two-way deletion: Admin deleted the message, remove from view immediately
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          toast.info(language === 'bn' ? 'একটি বার্তা মুছে ফেলা হয়েছে' : 'A message was removed');
        }
      );

      // Gentle fallback polling every 45s (WebSocket handles instant push events without congestion)
      const pollTimer = setInterval(async () => {
        try {
          if (document.hidden) return; // Do not poll when tab is in background
          const freshMsgs = await getConversationMessages(userPhone);
          setMessages((prev) => {
            const hasChanges =
              freshMsgs.length !== prev.length ||
              freshMsgs.some((fm) => {
                const cur = prev.find((pm) => pm.id === fm.id);
                return !cur || cur.is_read !== fm.is_read;
              });
            if (hasChanges) {
              const prevIds = new Set(prev.map((m) => m.id));
              const newIncoming = freshMsgs.some((m) => !prevIds.has(m.id) && m.sender === 'admin');
              if (newIncoming) {
                playMessageNotificationSound();
                toast.info(language === 'bn' ? 'অ্যাডমিন থেকে নতুন বার্তা এসেছে!' : 'New message from Support!');
                void markMessagesAsRead(userPhone, 'admin');
              }
              return freshMsgs;
            }
            return prev;
          });
        } catch {
          // Silent polling error catch
        }
      }, 45000);

      return () => {
        unsubscribe();
        clearInterval(pollTimer);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setLoading(false);
    }
  }, [userPhone, language]);

  // Deduplicate messages by id and sort chronologically to completely avoid duplicate bubbles
  const uniqueMessages = React.useMemo(() => {
    const map = new Map<string, CustomerMessage>();
    for (const msg of messages) {
      if (msg?.id) {
        map.set(msg.id, msg);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  // Handle Text Send (Zero-delay instant optimistic send)
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !userPhone) return;

    // 1. INSTANT: Clear input immediately with 0ms delay!
    setTextInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 2. INSTANT: Append optimistic message immediately to UI
    const tempId = `temp_cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: CustomerMessage = {
      id: tempId,
      user_phone: userPhone,
      user_name: userName,
      sender: 'customer',
      message_type: 'text',
      content: trimmed,
      audio_url: null,
      image_url: null,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom('smooth'), 10);

    // 3. BACKGROUND: Send to Supabase asynchronously without freezing input
    try {
      const saved = await sendTextMessage(userPhone, 'customer', trimmed, userName);
      // Replace temporary ID with saved record
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      );
    } catch (err: any) {
      console.error('Customer text send error:', err);
      toast.error(err?.message || (language === 'bn' ? 'মেসেজ পাঠানো সম্ভব হয়নি' : 'Failed to send message'));
      // Remove optimistic message and restore text on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setTextInput(trimmed);
    }
  };

  // Handle Image Selection and Upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    // Instant optimistic image preview
    const localPreviewUrl = URL.createObjectURL(file);
    const tempImgId = `temp_cust_img_${Date.now()}`;
    const optimisticImgMsg: CustomerMessage = {
      id: tempImgId,
      user_phone: userPhone,
      user_name: userName,
      sender: 'customer',
      message_type: 'image',
      content: '📷 ছবি সংযুক্ত',
      audio_url: null,
      image_url: localPreviewUrl,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimisticImgMsg]);
    setTimeout(() => scrollToBottom('smooth'), 10);

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadChatImage(file);

      const saved = await sendImageMessage(userPhone, 'customer', imageUrl, userName);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempImgId ? saved : m))
      );
      toast.success(language === 'bn' ? 'ছবি সফলভাবে পাঠানো হয়েছে' : 'Photo sent successfully');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err?.message || (language === 'bn' ? 'ছবি পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send image'));
      setMessages((prev) => prev.filter((m) => m.id !== tempImgId));
    } finally {
      setIsUploadingImage(false);
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start Voice Recording (with iOS Safari & Android mobile support)
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(language === 'bn' ? 'আপনার ব্রাউজার ভয়েস রেকর্ডিং সাপোর্ট করে না' : 'Microphone recording not supported');
        return;
      }

      isCancelledRef.current = false;
      audioChunksRef.current = [];
      setRecordingSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (isCancelledRef.current) {
          audioChunksRef.current = [];
          return;
        }

        if (audioChunksRef.current.length === 0) {
          toast.error(language === 'bn' ? 'কোনো অডিও রেকর্ড হয়নি' : 'No audio recorded');
          return;
        }

        const selectedMime = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMime });

        // Instant optimistic voice preview using blob object URL (lightweight, zero memory block)
        const localVoiceUrl = URL.createObjectURL(audioBlob);
        const tempVoiceId = `temp_cust_voice_${Date.now()}`;
        const optimisticVoiceMsg: CustomerMessage = {
          id: tempVoiceId,
          user_phone: userPhone,
          user_name: userName,
          sender: 'customer',
          message_type: 'voice',
          content: '🎙️ ভয়েস অডিও বার্তা',
          audio_url: localVoiceUrl,
          image_url: null,
          created_at: new Date().toISOString(),
          is_read: false,
        };
        setMessages((prev) => [...prev, optimisticVoiceMsg]);
        setTimeout(() => scrollToBottom('smooth'), 10);

        try {
          // Upload audio to storage bucket instead of giant base64 text payload
          const remoteAudioUrl = await uploadChatAudio(audioBlob, selectedMime);
          const saved = await sendVoiceMessage(userPhone, 'customer', remoteAudioUrl, userName);
          setMessages((prev) =>
            prev.map((m) => (m.id === tempVoiceId ? saved : m))
          );
          toast.success(language === 'bn' ? 'ভয়েস বার্তা সফলভাবে পাঠানো হয়েছে' : 'Voice message sent successfully');
        } catch (err: any) {
          console.error('Customer voice send error:', err);
          toast.error(err?.message || (language === 'bn' ? 'ভয়েস বার্তা পাঠানো যায়নি' : 'Failed to send voice message'));
          setMessages((prev) => prev.filter((m) => m.id !== tempVoiceId));
        }
      };

      // 250ms timeslice ensures flushed chunks on mobile
      mediaRecorder.start(250);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingSeconds(elapsed);
        if (elapsed >= 120) {
          stopRecording();
        }
      }, 500);
    } catch (err: any) {
      console.error('Microphone error:', err);
      toast.error(language === 'bn' ? 'মাইক্রোফোনের অনুমতি প্রদান করুন' : 'Please allow microphone access');
    }
  };

  // Cancel Voice Recording without sending
  const cancelRecording = () => {
    isCancelledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    toast.info(language === 'bn' ? 'ভয়েস রেকর্ডিং বাতিল করা হয়েছে' : 'Voice recording cancelled');
  };

  // Stop Voice Recording and automatically send
  const stopRecording = () => {
    isCancelledRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Play/Pause Voice Audio
  const togglePlayAudio = (id: string, audioUrl: string) => {
    if (playingAudioId === id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setPlayingAudioId(id);

      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        setPlayingAudioId(null);
      });

      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  // Quick Questions
  const quickQuestions = language === 'bn' ? [
    'আমার লোন আবেদনের বর্তমান স্ট্যাটাস কী?',
    'টাকা উত্তোলনের কত সময় লাগবে?',
    'আমার ভেরিফিকেশন কোড পাচ্ছি না',
    'কিস্তি পরিশোধ করার নিয়ম জানতে চাই'
  ] : [
    'What is my loan application status?',
    'How long does withdrawal take?',
    'I need help with my account verification',
    'How do I pay my installment?'
  ];

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <Card className="shadow-lg border-border overflow-hidden bg-card">
          {/* Header */}
          <CardHeader className="bg-primary/5 border-b border-border p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-background border border-border/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1">
                  {settings.userPortalLogoUrl || settings.adminSidebarLogoUrl ? (
                    <img
                      src={settings.userPortalLogoUrl || settings.adminSidebarLogoUrl}
                      alt="Bank Official Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                      DBS
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    {language === 'bn' ? 'DBS Bank SG সাপোর্ট ও লাইভ চ্যাট' : 'DBS Bank SG Support & Live Chat'}
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      isGuest 
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isGuest ? (language === 'bn' ? 'গেস্ট / অতিথি মোড' : 'Guest Mode') : (language === 'bn' ? 'নিবন্ধিত গ্রাহক' : 'Registered Member')}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isGuest 
                      ? (language === 'bn' ? `আপনি অতিথি হিসেবে চ্যাট করছেন। এডমিন আপনাকে লাইভ সহায়তা প্রদান করবে।` : 'Chatting as Guest User. Admin is ready to assist you.')
                      : (language === 'bn' ? `${userName} (${userPhone}) - সরাসরি লাইভ সাপোর্ট` : `${userName} - Live Support`)
                    }
                  </p>
                </div>
              </div>

              {settings.supportPhone && (
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{settings.supportPhone}</span>
                </a>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[68vh] sm:h-[70vh] overflow-hidden">
            {/* Messages Scroll Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-muted/10 overscroll-contain"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  {language === 'bn' ? 'মেসেজসমূহ লোড হচ্ছে...' : 'Loading conversation...'}
                </div>
              ) : uniqueMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-muted-foreground">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {language === 'bn' ? 'লাইভ সাপোর্টে স্বাগতম!' : 'Welcome to Live Support!'}
                    </p>
                    <p className="text-xs max-w-sm mt-1">
                      {language === 'bn'
                        ? 'আপনার বার্তা লিখুন, ছবি পাঠান অথবা মাইক চেপে ভয়েস রেকর্ড করুন। আমাদের প্রতিনিধি প্রস্তুত রয়েছে।'
                        : 'Send a message, attach photos, or send a voice note. Our team is ready to help.'}
                    </p>
                  </div>

                  {/* Quick Inquiry Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTextInput(q)}
                        className="text-[11px] bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                uniqueMessages.map((msg) => {
                  const isMe = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-muted-foreground mb-1 px-1">
                        {isMe ? (isGuest ? 'আপনি (অতিথি)' : 'আপনি') : (language === 'bn' ? 'DBS Bank SG সাপোর্ট' : 'Support Team')}
                      </span>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-xs'
                            : 'bg-card border border-border text-foreground rounded-bl-xs'
                        }`}
                      >
                        {msg.message_type === 'image' && (msg.image_url || msg.content) ? (
                          <div className="space-y-1.5 py-1">
                            <div className="overflow-hidden rounded-xl border border-white/20 max-w-[260px] sm:max-w-[320px] bg-black/10">
                              <img
                                src={msg.image_url || msg.content || ''}
                                alt="Shared photo"
                                className="w-full h-auto max-h-[280px] object-cover cursor-pointer hover:scale-[1.02] transition-transform rounded-lg"
                                onClick={() => setViewingImageUrl(msg.image_url || msg.content || '')}
                              />
                            </div>
                            <p className="text-[11px] opacity-90 flex items-center gap-1 font-medium">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ছবি সংযুক্ত' : 'Photo attachment'}</span>
                            </p>
                          </div>
                        ) : msg.message_type === 'voice' && msg.audio_url ? (
                          <div className="flex items-center gap-3 py-1">
                            <button
                              type="button"
                              onClick={() => togglePlayAudio(msg.id, msg.audio_url!)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isMe
                                  ? 'bg-primary-foreground text-primary hover:bg-white'
                                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                              }`}
                            >
                              {playingAudioId === msg.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1 min-w-[120px]">
                              <div className="flex items-center gap-1 h-5">
                                {[40, 70, 30, 90, 60, 100, 50, 80, 40, 60, 30].map((h, i) => (
                                  <span
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={`w-1 rounded-full ${
                                      playingAudioId === msg.id ? 'animate-pulse' : ''
                                    } ${isMe ? 'bg-primary-foreground/70' : 'bg-primary/70'}`}
                                  />
                                ))}
                              </div>
                              <span className={`text-[10px] block mt-0.5 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                🎙️ {language === 'bn' ? 'ভয়েস অডিও বার্তা' : 'Voice Audio Note'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-1.5 mt-1 opacity-90 text-[10px]">
                          <div className="flex items-center gap-1 opacity-75">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {isMe && (
                            <div className="flex items-center gap-1 ml-1 shrink-0">
                              {msg.is_read ? (
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-200 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-400/50 shadow-xs">
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                                  <span>সিন</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-primary-foreground/80 font-medium">
                                  <Check className="w-2.5 h-2.5 opacity-80" />
                                  <span>পাঠানো হয়েছে</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-border bg-card">
              {isRecording ? (
                /* Recording Active UI */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-red-500/10 border border-red-500/30 p-2 sm:p-2.5 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                    </div>

                    {/* Live Wave Animation Bars */}
                    <div className="flex items-center gap-0.5 h-4 shrink-0">
                      <span className="w-1 bg-red-500 rounded-full animate-pulse h-2" />
                      <span className="w-1 bg-red-600 rounded-full animate-bounce h-4" />
                      <span className="w-1 bg-red-500 rounded-full animate-pulse h-3" />
                      <span className="w-1 bg-red-600 rounded-full animate-bounce h-4" />
                      <span className="w-1 bg-red-500 rounded-full animate-pulse h-2" />
                    </div>

                    <div className="text-xs font-bold text-red-600 dark:text-red-400 truncate">
                      <span>{language === 'bn' ? 'ভয়েস রেকর্ড হচ্ছে... ' : 'Recording... '}</span>
                      <span className="font-mono bg-red-100 dark:bg-red-950/60 text-red-700 px-1.5 py-0.5 rounded text-[11px]">
                        ({formatAudioTimer(recordingSeconds, language)} / {language === 'bn' ? '০২:০০' : '02:00'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelRecording}
                      className="h-8 text-xs border-red-300 text-red-600 hover:bg-red-50 shrink-0"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={stopRecording}
                      className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'bn' ? 'রেকর্ড সম্পন্ন ও পাঠান' : 'Stop & Send'}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Standard Text, Image and Mic Input UI with Multiline Support */
                <div className="flex flex-col gap-1.5 w-full">
                  <form onSubmit={handleSendText} className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />

                    {/* Image Upload Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending || isUploadingImage}
                      title={language === 'bn' ? 'ছবি পাঠান' : 'Send Photo'}
                      className="h-10 w-10 shrink-0 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>

                    {/* Voice Record Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={startRecording}
                      disabled={sending || isUploadingImage}
                      title={language === 'bn' ? 'ভয়েস রেকর্ড করুন' : 'Record voice note'}
                      className="h-10 w-10 shrink-0 text-primary border-primary/30 hover:bg-primary/10 rounded-xl"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>

                    {/* Auto-expanding Multiline Textarea */}
                    <div className="flex-1 relative min-w-0">
                      <textarea
                        ref={textareaRef}
                        value={textInput}
                        onChange={(e) => {
                          setTextInput(e.target.value);
                          if (textareaRef.current) {
                            textareaRef.current.style.height = 'auto';
                            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (textInput.trim() && !sending && !isUploadingImage) {
                              handleSendText();
                            }
                          }
                        }}
                        rows={1}
                        placeholder={
                          isUploadingImage
                            ? (language === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading photo...')
                            : (language === 'bn'
                              ? 'আপনার বার্তা লিখুন... (Shift+Enter চেপে নতুন লাইন তৈরি করুন)'
                              : 'Type message... (Shift+Enter for new line)')
                        }
                        disabled={sending || isUploadingImage}
                        className="w-full min-h-[42px] max-h-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed transition-all shadow-2xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={sending || isUploadingImage || !textInput.trim()}
                      className="h-10 px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                    </Button>
                  </form>

                  {/* Helper line for mobile & desktop */}
                  <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTextInput((prev) => prev + '\n');
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                            setTimeout(() => {
                              if (textareaRef.current) {
                                textareaRef.current.style.height = 'auto';
                                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
                              }
                            }, 10);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/70 hover:bg-muted text-foreground/80 hover:text-primary transition-colors font-medium border border-border/60 text-[10px]"
                        title={language === 'bn' ? 'লাইনের নিচে নতুন লাইন যোগ করুন' : 'Add new line'}
                      >
                        <span>↵ {language === 'bn' ? 'নতুন লাইন' : 'New Line'}</span>
                      </button>
                      <span className="hidden sm:inline text-[10px] text-muted-foreground/80">
                        {language === 'bn'
                          ? 'টিপস: Shift+Enter চেপে নতুন লাইন তৈরি করুন, Enter চাপলে পাঠানো হবে।'
                          : 'Shift+Enter for line break, Enter to send.'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-70">
                      {textInput.length > 0 ? `${textInput.length} অক্ষর` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full Image Zoom Modal */}
        {viewingImageUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setViewingImageUrl(null)}
          >
            <div
              className="relative max-w-3xl max-h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl p-2 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewingImageUrl(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={viewingImageUrl}
                alt="Enlarged preview"
                className="w-auto h-auto max-w-full max-h-[82vh] object-contain rounded-xl mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
