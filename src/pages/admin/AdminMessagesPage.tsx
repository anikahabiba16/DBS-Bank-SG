import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLoan } from '@/contexts/LoanContext';
import { loanStorage } from '@/services/storage';
import type { CustomerUser } from '@/types/loan';
import {
  getAdminConversations,
  getConversationMessages,
  sendTextMessage,
  sendVoiceMessage,
  sendImageMessage,
  uploadChatImage,
  uploadChatAudio,
  markMessagesAsRead,
  subscribeToMessages,
  deleteChatMessage,
  playMessageNotificationSound,
  cleanCustomerDisplayName,
  type CustomerConversation,
  type CustomerMessage,
} from '@/services/customerMessagingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Send,
  Mic,
  Square,
  Play,
  Pause,

  Search,
  User,
  Clock,
 
  Phone,
  RefreshCw,
  MessageSquare,
  CheckCheck,
  Image as ImageIcon,
  X,
 
  ArrowLeft,
 
  UserPlus,


  Check,
  Trash2
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

// Format seconds into MM:SS
const formatAudioTimer = (totalSecs: number): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toBengaliNumber(minsStr)}:${toBengaliNumber(secsStr)}`;
};

// Detect MediaRecorder supported audio mime types across Mobile Safari & Chrome
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

export default function AdminMessagesPage() {
  const { language, t } = useLanguage();
  const { adminRole, currentSubAdmin, users, applications } = useLoan();
  const assignedList = currentSubAdmin?.assigned_customer_ids || [];
  const canDelete = adminRole !== 'sub_admin' || currentSubAdmin?.can_delete_messages === true;

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেসেজটি উভয় পাশ (অ্যাডমিন এবং গ্রাহক) থেকে মুছে ফেলতে চান?')) {
      return;
    }
    const success = await deleteChatMessage(msgId);
    if (success) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      loadConversations();
      toast.success('মেসেজটি উভয় পাশ থেকে সফলভাবে মুছে ফেলা হয়েছে');
    } else {
      toast.error('মেসেজ ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  // Pre-seed conversations from known customers to achieve instant 0ms render without showing "লোড হচ্ছে..."
  const [conversations, setConversations] = useState<CustomerConversation[]>(() => {
    try {
      const storedUsers = loanStorage.getUsers();
      if (!storedUsers || storedUsers.length === 0) return [];
      return storedUsers.map((u: CustomerUser) => {
        const phone = u.phone || u.id;
        const isGuest = !phone.startsWith('01') && !phone.startsWith('+880');
        return {
          id: phone,
          customer_phone: phone,
          customer_name: cleanCustomerDisplayName(u.name, phone, isGuest),
          is_guest: isGuest,
          last_message: 'চ্যাট শুরু করতে ক্লিক করুন...',
          last_message_type: 'text' as const,
          last_message_time: u.registeredAt || new Date().toISOString(),
          unread_count: 0
        };
      });
    } catch {
      return [];
    }
  });

  const [selectedPhone, setSelectedPhone] = useState<string>(() => {
    try {
      const storedUsers = loanStorage.getUsers();
      return storedUsers?.[0]?.phone || '';
    } catch {
      return '';
    }
  });
  const [selectedCustomerMeta, setSelectedCustomerMeta] = useState<{
    phone: string;
    name: string;
    accountNumber?: string;
  } | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isFetchingConversationsRef = useRef<boolean>(false);
  const isFetchingMessagesRef = useRef<boolean>(false);

  // Mobile View Navigation: 'list' = show conversations, 'chat' = show active messages
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Admin Voice recording state & mobile Safari compatibility
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

  // Scroll to bottom safely within container without scrolling window/layout
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      });
    }
  };

  // Load all customer conversations with in-flight lock to eliminate socket starvation
  const loadConversations = async () => {
    if (isFetchingConversationsRef.current) return;
    isFetchingConversationsRef.current = true;
    try {
      const data = await getAdminConversations();
      if (data && data.length > 0) {
        setConversations((prev) => {
          const map = new Map<string, CustomerConversation>();
          // Put fresh cloud conversations first
          data.forEach((c) => map.set(c.customer_phone, c));
          // Keep registered customers who don't have chat history yet
          prev.forEach((p) => {
            if (!map.has(p.customer_phone)) {
              map.set(p.customer_phone, p);
            }
          });
          return Array.from(map.values());
        });
        if (!selectedPhone) {
          setSelectedPhone(data[0].customer_phone);
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      isFetchingConversationsRef.current = false;
    }
  };

  // Load messages for selected customer with in-flight lock
  const loadMessages = async (phone: string) => {
    if (!phone || isFetchingMessagesRef.current) return;
    isFetchingMessagesRef.current = true;
    try {
      const msgs = await getConversationMessages(phone);
      setMessages(msgs);
      void markMessagesAsRead(phone, 'customer');
    } catch (err) {
      console.warn('Failed to load conversation messages:', err);
    } finally {
      isFetchingMessagesRef.current = false;
    }
  };

  useEffect(() => {
    loadConversations();

    // Subscribe to all new messages and real-time read updates
    const unsubscribe = subscribeToMessages(
      null,
      (newMsg) => {
        // Refresh conversation list
        loadConversations();

        // Realtime notification logic
        if (newMsg.sender === 'customer') {
          const isTarget = adminRole !== 'sub_admin' || assignedList.includes(newMsg.user_phone);
          if (isTarget) {
            playMessageNotificationSound();
            toast.info(`🔔 গ্রাহক (${newMsg.user_name || newMsg.user_phone}) থেকে নতুন বার্তা এসেছে:`, {
              description: newMsg.message_type === 'voice' ? '🎙️ ভয়েস বার্তা' : (newMsg.content || '')
            });
          }
        }

        // If this message belongs to currently open customer
        if (newMsg.user_phone === selectedPhone) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender === 'customer') {
            void markMessagesAsRead(selectedPhone, 'customer');
          }
        }
      },
      (updated: any) => {
        // Real-time update for 'Seen / সিন' status when customer reads message
        if (updated.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        } else if (updated.user_phone === selectedPhone) {
          setMessages((prev) =>
            prev.map((m) => (m.sender === 'admin' ? { ...m, is_read: true } : m))
          );
        }
      },
      (deletedId: string) => {
        setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        loadConversations();
      }
    );

    // Gentle fallback polling every 45s (WebSocket handles all live push events immediately)
    const pollTimer = setInterval(async () => {
      try {
        if (document.hidden) return; // Save bandwidth when tab is backgrounded
        if (!isFetchingConversationsRef.current) {
          void loadConversations();
        }
        if (selectedPhone && !isFetchingMessagesRef.current) {
          const freshMsgs = await getConversationMessages(selectedPhone);
          setMessages((prev) => {
            const hasChanges =
              freshMsgs.length !== prev.length ||
              freshMsgs.some((fm) => {
                const cur = prev.find((pm) => pm.id === fm.id);
                return !cur || cur.is_read !== fm.is_read;
              });
            if (hasChanges) {
              const prevIds = new Set(prev.map((m) => m.id));
              const newIncoming = freshMsgs.some((m) => !prevIds.has(m.id) && m.sender === 'customer');
              if (newIncoming) {
                playMessageNotificationSound();
                void markMessagesAsRead(selectedPhone, 'customer');
              }
              return freshMsgs;
            }
            return prev;
          });
        }
      } catch {
        // Silent polling error catch
      }
    }, 45000);

    return () => {
      unsubscribe();
      clearInterval(pollTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedPhone, adminRole, assignedList]);

  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone);
    }
  }, [selectedPhone]);

  // Compile all registered customers from database (both user accounts & loan applicants)
  const allRegisteredCustomers = React.useMemo(() => {
    const map = new Map<string, {
      phone: string;
      name: string;
      accountNumber?: string;
      walletBalance?: number;
      status?: string;
      hasChat: boolean;
    }>();

    const activePhoneSet = new Set(conversations.map((c) => c.customer_phone));

    (users || []).forEach((u) => {
      if (u?.phone) {
        map.set(u.phone, {
          phone: u.phone,
          name: u.name || 'গ্রাহক',
          accountNumber: u.bankAccountNumber || u.accountNumber,
          walletBalance: u.walletBalance || 0,
          status: u.status || 'active',
          hasChat: activePhoneSet.has(u.phone),
        });
      }
    });

    (applications || []).forEach((app) => {
      if (app?.phone && !map.has(app.phone)) {
        map.set(app.phone, {
          phone: app.phone,
          name: app.applicantName || 'আবেদনকারী',
          accountNumber: app.bankAccountNumber || app.id,
          walletBalance: 0,
          status: 'applicant',
          hasChat: activePhoneSet.has(app.phone),
        });
      }
    });

    return Array.from(map.values());
  }, [users, applications, conversations]);

  // Matching uncontacted customers when searching from left search bar
  const matchingRegisteredCustomers = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return allRegisteredCustomers.filter(
      (c) =>
        !c.hasChat &&
        (c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.accountNumber && c.accountNumber.toLowerCase().includes(q)))
    );
  }, [allRegisteredCustomers, searchTerm]);

  // Filtered customers inside the "New Chat" modal
  const filteredModalCustomers = React.useMemo(() => {
    const q = newChatSearch.trim().toLowerCase();
    if (!q) return allRegisteredCustomers;
    return allRegisteredCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.accountNumber && c.accountNumber.toLowerCase().includes(q))
    );
  }, [allRegisteredCustomers, newChatSearch]);

  const handleSelectCustomerForNewChat = (customer: { phone: string; name: string; accountNumber?: string }) => {
    setSelectedPhone(customer.phone);
    setSelectedCustomerMeta({
      phone: customer.phone,
      name: customer.name,
      accountNumber: customer.accountNumber,
    });
    setMobileView('chat');
    setIsNewChatOpen(false);
    setSearchTerm('');
  };

  // Deduplicate messages by id and sort chronologically to eliminate duplicate bubbles
  const uniqueMessages = React.useMemo(() => {
    const map = new Map<string, CustomerMessage>();
    for (const m of messages) {
      if (m?.id) {
        map.set(m.id, m);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  // Selected conversation info
  const activeConversation = conversations.find((c) => c.customer_phone === selectedPhone);
  const isSelectedGuest = activeConversation?.is_guest ?? selectedPhone.startsWith('guest_');
  const activeCustomerName = cleanCustomerDisplayName(
    activeConversation?.customer_name || selectedCustomerMeta?.name,
    selectedPhone,
    isSelectedGuest
  );

  // Send Text Reply (Zero-delay instant optimistic send)
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !selectedPhone) return;

    if (adminRole === 'sub_admin' && !assignedList.includes(selectedPhone)) {
      toast.error('আপনি শুধুমাত্র আপনার অ্যাসাইনকৃত গ্রাহকের সাথে চ্যাট করতে পারেন');
      return;
    }

    // 1. INSTANT: Clear input immediately with 0ms delay!
    setTextInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 2. INSTANT: Append optimistic message immediately to UI with sending indicator
    const tempId = `temp_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: CustomerMessage = {
      id: tempId,
      user_phone: selectedPhone,
      user_name: activeCustomerName,
      sender: 'admin',
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
      const saved = await sendTextMessage(
        selectedPhone,
        'admin',
        trimmed,
        activeCustomerName
      );
      // Replace temporary ID with saved record
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      );
      loadConversations();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      toast.error(err?.message || 'Failed to send reply');
      // Remove optimistic message and restore text on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setTextInput(trimmed);
    }
  };

  // Handle Admin Image Upload and Send
  const handleAdminImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPhone) return;

    if (adminRole === 'sub_admin' && !assignedList.includes(selectedPhone)) {
      toast.error('আপনি শুধুমাত্র আপনার অ্যাসাইনকৃত গ্রাহকের সাথে যোগাযোগ করতে পারেন');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি ফাইল নির্বাচন করুন');
      return;
    }

    // Instant optimistic image preview
    const localPreviewUrl = URL.createObjectURL(file);
    const tempImgId = `temp_admin_img_${Date.now()}`;
    const optimisticImgMsg: CustomerMessage = {
      id: tempImgId,
      user_phone: selectedPhone,
      user_name: activeCustomerName,
      sender: 'admin',
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

      const saved = await sendImageMessage(
        selectedPhone,
        'admin',
        imageUrl,
        activeCustomerName
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === tempImgId ? saved : m))
      );
      loadConversations();
      toast.success('ছবি সফলভাবে পাঠানো হয়েছে');
    } catch (err: any) {
      console.error('Admin image send failed:', err);
      toast.error(err?.message || 'ছবি পাঠানো সম্ভব হয়নি');
      setMessages((prev) => prev.filter((m) => m.id !== tempImgId));
    } finally {
      setIsUploadingImage(false);
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start Voice Recording (Admin & Sub-Admin with Safari/Chrome Mobile Compatibility)
  const startRecording = async () => {
    if (adminRole === 'sub_admin' && !assignedList.includes(selectedPhone)) {
      toast.error('আপনি শুধুমাত্র আপনার অ্যাসাইনকৃত গ্রাহকের সাথে ভয়েস চ্যাট করতে পারেন');
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('আপনার ব্রাউজারে মাইক্রোফোন বা ভয়েস রেকর্ডিং সাপোর্ট নেই');
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
          toast.error('কোনো অডিও রেকর্ড হয়নি, পুনরায় চেষ্টা করুন');
          return;
        }

        const selectedMime = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMime });

        // Instant optimistic voice preview using blob object URL
        const localVoiceUrl = URL.createObjectURL(audioBlob);
        const tempVoiceId = `temp_admin_voice_${Date.now()}`;
        const optimisticVoiceMsg: CustomerMessage = {
          id: tempVoiceId,
          user_phone: selectedPhone,
          user_name: activeCustomerName,
          sender: 'admin',
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
          const remoteAudioUrl = await uploadChatAudio(audioBlob, selectedMime);
          const saved = await sendVoiceMessage(
            selectedPhone,
            'admin',
            remoteAudioUrl,
            activeCustomerName
          );
          setMessages((prev) =>
            prev.map((m) => (m.id === tempVoiceId ? saved : m))
          );
          loadConversations();
          toast.success(language === 'bn' ? 'অ্যাডমিন ভয়েস বার্তা সফলভাবে পাঠানো হয়েছে' : 'Admin voice note sent');
        } catch (err: any) {
          console.error('Failed to send voice message:', err);
          toast.error(err?.message || 'ভয়েস বার্তা পাঠানো যায়নি');
          setMessages((prev) => prev.filter((m) => m.id !== tempVoiceId));
        }
      };

      // 250ms timeslice ensures chunks flush properly on iOS Safari and Android
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
      toast.error('মাইক্রোফোন পারমিশন দিন এবং পুনরায় চেষ্টা করুন');
    }
  };

  // Cancel Recording without sending
  const cancelRecording = () => {
    isCancelledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Stop error:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    toast.info('ভয়েস রেকর্ডিং বাতিল করা হয়েছে');
  };

  // Stop Recording and automatically send
  const stopRecording = () => {
    isCancelledRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Stop error:', e);
      }
    }
    setIsRecording(false);
  };

  // Play/Pause Audio
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

  // Filter conversations based on role & assignment
  const scopedConversations = adminRole === 'sub_admin'
    ? conversations.filter((c) => assignedList.includes(c.customer_phone) || assignedList.includes(c.id))
    : conversations;

  const filteredConversations = scopedConversations.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.customer_phone.includes(q) ||
      c.customer_name.toLowerCase().includes(q) ||
      c.last_message.toLowerCase().includes(q)
    );
  });

  // Admin Quick Reply templates
  const quickReplies = [
    'আপনার আবেদনটি পর্যালোচনাধীন রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।',
    'আপনার প্রয়োজনীয় কাগজপত্র সফলভাবে যাচাই করা হয়েছে।',
    'নির্ধারিত প্রসেসিং ফি বা কিস্তি পরিশোধ করার জন্য নির্দেশ দেওয়া হলো।',
    'ধন্যবাদ, আপনার লোন অনুমোদন চূড়ান্ত ধাপে রয়েছে।'
  ];

  return (
    <AdminLayout
      title={language === 'bn' ? 'গ্রাহক মেসেজ হাব ও লাইভ সাপোর্ট' : 'Customer Message Hub & Live Support'}
      subtitle={language === 'bn' ? 'সরাসরি গ্রাহকদের সাথে টেক্সট ও ভয়েস বার্তা আদান-প্রদান করুন' : 'Real-time text and voice messaging with customers'}
    >
      <div className="flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-3 md:gap-4 h-[calc(100dvh-4.75rem)] sm:h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-10rem)] w-full overflow-hidden">
        {/* Left Column: Customer Conversation List (Full width on mobile when mobileView === 'list') */}
        <div className={`md:col-span-5 lg:col-span-4 flex-col bg-card border border-border rounded-xl shadow-xs overflow-hidden h-full ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header & Search */}
          <div className="p-3 border-b border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                {adminRole === 'sub_admin' ? 'অ্যাসাইনকৃত গ্রাহক' : (language === 'bn' ? 'গ্রাহক তালিকা' : 'Customers')} ({scopedConversations.length})
              </span>
              <div className="flex items-center gap-1">
                {adminRole === 'sub_admin' && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                    সাব-এডমিন
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadConversations}
                  className="h-7 w-7 text-muted-foreground"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Quick Button to Start New Chat with ANY registered customer */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewChatOpen(true)}
              className="w-full h-8 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ নতুন চ্যাট শুরু করুন (সকল গ্রাহক)</span>
            </Button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === 'bn' ? 'ফোন নম্বর বা নাম খুঁজুন...' : 'Search phone or name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {/* Show matching registered customers who don't have active chat history yet */}
            {matchingRegisteredCustomers.length > 0 && (
              <div className="p-2.5 bg-primary/5 border-b border-primary/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    <span>নিবন্ধিত গ্রাহক (চ্যাট শুরু করুন)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                    {matchingRegisteredCustomers.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {matchingRegisteredCustomers.slice(0, 4).map((c) => (
                    <button
                      key={c.phone}
                      type="button"
                      onClick={() => handleSelectCustomerForNewChat(c)}
                      className="w-full text-left p-2 rounded-lg bg-background hover:bg-primary/10 border border-border/80 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{c.phone}</p>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                        + চ্যাট
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                লোড হচ্ছে...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <User className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p>{language === 'bn' ? 'কোনো বার্তা বা গ্রাহক পাওয়া যায়নি' : 'No messages found'}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.customer_phone === selectedPhone;
                const isGuest = conv.is_guest || conv.customer_phone.startsWith('guest_');
                const displayName = cleanCustomerDisplayName(conv.customer_name, conv.customer_phone, isGuest);

                return (
                  <button
                    key={conv.customer_phone}
                    type="button"
                    onClick={() => {
                      setSelectedPhone(conv.customer_phone);
                      setMobileView('chat');
                    }}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isGuest 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {displayName ? displayName.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {displayName}
                          </span>
                          <span className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                            isGuest 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {isGuest ? 'গেস্ট' : 'নিবন্ধিত'}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(conv.last_message_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone className="w-2.5 h-2.5 shrink-0" />
                        <span className="font-mono truncate">{conv.customer_phone}</span>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white font-bold text-[9px] rounded-full shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply (Full width on mobile when mobileView === 'chat') */}
        <div className={`md:col-span-7 lg:col-span-8 flex-col bg-card border border-border rounded-xl shadow-xs overflow-hidden h-full ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedPhone ? (
            <>
              {/* Active Customer Header */}
              <div className="p-2.5 sm:p-4 border-b border-border bg-muted/15 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button to Customer List */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileView('list')}
                    className="md:hidden flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 h-8 px-2 -ml-1 shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>তালিকা</span>
                  </Button>

                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                    isSelectedGuest 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'bg-primary/15 text-primary'
                  }`}>
                    {activeCustomerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {activeCustomerName}
                      </h3>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
                        isSelectedGuest 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isSelectedGuest ? 'গেস্ট' : 'নিবন্ধিত'}
                      </span>
                      {!activeConversation && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          নতুন চ্যাট
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5 truncate">
                      <Phone className="w-2.5 h-2.5 text-primary shrink-0" />
                      <span className="truncate">{selectedPhone}</span>
                      {selectedCustomerMeta?.accountNumber && (
                        <span className="ml-1 text-primary font-semibold truncate">
                          | A/C: {selectedCustomerMeta.accountNumber}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>লাইভ</span>
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5 overscroll-contain"
              >
                {uniqueMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-muted-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                   
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {activeCustomerName}-এর সাথে নতুন কথোপকথন শুরু করুন
                      </p>
                      <p className="text-xs max-w-sm text-muted-foreground">
                        এই গ্রাহকের সাথে এখনো কোনো বার্তা নেই। নিচে মেসেজ লিখে, ছবি যুক্ত করে বা ভয়েস রেকর্ড পাঠিয়ে সরাসরি চ্যাট শুরু করুন।
                      </p>
                    </div>
                    {/* Quick initial greetings */}
                    <div className="flex flex-wrap gap-1.5 justify-center max-w-md pt-2">
                      {quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTextInput(qr)}
                          className="text-[11px] bg-background border border-border px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors text-left"
                        >
                          {qr.slice(0, 32)}...
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  uniqueMessages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
                          {isAdmin ? 'অ্যাডমিন (আপনি)' : (msg.user_name || 'গ্রাহক')}
                        </span>

                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${
                            isAdmin
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
                                <span>ছবি সংযুক্ত</span>
                              </p>
                            </div>
                          ) : msg.message_type === 'voice' && msg.audio_url ? (
                            <div className="flex items-center gap-3 py-1">
                              <button
                                type="button"
                                onClick={() => togglePlayAudio(msg.id, msg.audio_url!)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  isAdmin
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
                                      } ${isAdmin ? 'bg-primary-foreground/70' : 'bg-primary/70'}`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-[10px] block mt-0.5 ${isAdmin ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  🎙️ ভয়েস অডিও বার্তা
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
                            {isAdmin && (
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

                            {canDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(msg.id);
                                }}
                                title="উভয় পাশ (অ্যাডমিন ও গ্রাহক) থেকে এই মেসেজটি স্থায়ীভাবে মুছে ফেলুন"
                                className={`ml-1.5 p-1 rounded transition-opacity opacity-70 hover:opacity-100 ${
                                  isAdmin
                                    ? 'hover:bg-red-500/20 text-red-200 hover:text-white'
                                    : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-600'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies Bar */}
              <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                <span className="text-[10px] font-bold text-muted-foreground">দ্রুত উত্তর:</span>
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTextInput(qr)}
                    className="text-[10px] bg-background border border-border px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors shrink-0"
                  >
                    {qr.slice(0, 25)}...
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className="p-2 sm:p-3 border-t border-border bg-card">
                {isRecording ? (
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

                      <div className="text-xs font-bold text-red-600 truncate">
                        <span>ভয়েস রেকর্ড হচ্ছে... </span>
                        <span className="font-mono bg-red-100 dark:bg-red-950/60 text-red-700 px-1.5 py-0.5 rounded text-[11px]">
                          ({formatAudioTimer(recordingSeconds)} / ০২:০০)
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
                        বাতিল
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={stopRecording}
                        className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>রেকর্ড সম্পন্ন ও পাঠান</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
                    <form onSubmit={handleSendText} className="flex items-center gap-1.5 sm:gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAdminImageSelect}
                      />

                      {/* Image Attachment Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || isUploadingImage}
                        title="ছবি পাঠান"
                        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>

                      {/* Voice Recording Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={startRecording}
                        disabled={sending || isUploadingImage}
                        title="ভয়েস রেকর্ড করে পাঠান"
                        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 text-primary border-primary/30 hover:bg-primary/10 rounded-xl"
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
                              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
                            }
                          }}
                          onKeyDown={(e) => {
                            // If user hits Enter without Shift, send message
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
                              ? 'ছবি আপলোড হচ্ছে...'
                              : 'উত্তর লিখুন...'
                          }
                          disabled={sending || isUploadingImage}
                          className="w-full min-h-[38px] sm:min-h-[40px] max-h-[120px] sm:max-h-[150px] py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed transition-all shadow-2xs block"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={sending || isUploadingImage || !textInput.trim()}
                        className="h-9 w-9 sm:h-10 sm:w-auto px-0 sm:px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">উত্তর পাঠান</span>
                      </Button>
                    </form>

                    {/* Bottom Helper Bar: Add Line Break Button & Shortcut Hint */}
                    <div className="flex items-center justify-between px-1 text-[10px] sm:text-[11px] text-muted-foreground">
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
                                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
                                }
                              }, 10);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-muted/70 hover:bg-muted text-foreground/80 hover:text-primary transition-colors font-medium border border-border/60 text-[9px] sm:text-[10px]"
                          title="লাইনের নিচে নতুন লাইন যোগ করুন"
                        >
                          <span>↵ নতুন লাইন</span>
                        </button>
                        <span className="hidden md:inline text-[10px] text-muted-foreground/80">
                          টিপস: <strong>Shift + Enter</strong> চেপে নতুন লাইন লিখুন, <strong>Enter</strong> চাপলে পাঠানো হবে।
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono opacity-70">
                        {textInput.length > 0 ? `${textInput.length} অক্ষর` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-semibold text-sm">বাম পাশের তালিকা থেকে একজন গ্রাহক নির্বাচন করুন</p>
              <p className="text-xs">গ্রাহক নির্বাচন করে তাদের মেসেজের ইতিহাস দেখুন ও টেক্সট, ছবি বা ভয়েসে উত্তর দিন</p>
            </div>
          )}
        </div>
      </div>

      {/* Start New Chat with Any Registered Customer Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl p-4 sm:p-6 rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-border">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>নিবন্ধিত গ্রাহকের সাথে নতুন চ্যাট শুরু করুন</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              যে সকল গ্রাহক ইতিমধ্যে একাউন্ট খুলেছেন বা আবেদন করেছেন তাদের খুঁজে সরাসরি চ্যাট শুরু করুন।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="নাম, ফোন নম্বর বা অ্যাকাউন্ট নম্বর দিয়ে খুঁজুন..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="pl-9 h-10 text-xs sm:text-sm bg-background rounded-xl"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>মোট গ্রাহক: {filteredModalCustomers.length} জন</span>
              <span>নতুন চ্যাট শুরু করতে 'চ্যাট করুন' চাপুন</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border border border-border rounded-xl bg-background/50">
              {filteredModalCustomers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <User className="w-8 h-8 mx-auto text-muted-foreground/40" />
                  <p>কোনো নিবন্ধিত গ্রাহক পাওয়া যায়নি।</p>
                </div>
              ) : (
                filteredModalCustomers.map((cust) => (
                  <div
                    key={cust.phone}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-foreground truncate">{cust.name}</p>
                          {cust.hasChat ? (
                            <span className="text-[9px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                              ইতিপূর্বে মেসেজ হয়েছে
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                              নতুন
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                          {cust.phone}
                          {cust.accountNumber && (
                            <span className="ml-1.5 text-primary font-semibold">
                              | A/C: {cust.accountNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSelectCustomerForNewChat(cust)}
                      className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 rounded-lg px-3 shadow-xs"
                    >
                      চ্যাট করুন
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </AdminLayout>
  );
}
