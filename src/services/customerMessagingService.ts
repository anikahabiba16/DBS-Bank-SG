import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type CustomerMessageType = 'text' | 'voice' | 'image';
export type CustomerMessageRole = 'customer' | 'admin';

export interface CustomerConversation {
  id: string;
  customer_phone: string;
  customer_name: string;
  is_guest: boolean;
  last_message: string;
  last_message_type: CustomerMessageType;
  last_message_time: string;
  unread_count: number;
}

export interface CustomerMessage {
  id: string;
  user_phone: string;
  user_name: string;
  sender: CustomerMessageRole;
  message_type: CustomerMessageType;
  content: string | null;
  audio_url: string | null;
  image_url?: string | null;
  created_at: string;
  is_read: boolean;
}

/**
 * Utility to clean repetitive suffixes like "(অনির্ধ)" or "(গেস্ট)" from customer names
 */
export function cleanCustomerDisplayName(rawName: string | undefined | null, phone: string, isGuest: boolean): string {
  if (!rawName || rawName === 'Customer') {
    return isGuest
      ? `অতিথি গ্রাহক (${phone.replace('guest_', '').slice(-5)})`
      : `গ্রাহক (${phone.slice(-4)})`;
  }
  // Strip duplicated / repeating tags like (অনির্ধ), (অনিবন্ধিত), (অতিথি), (গেস্ট), (guest)
  const cleaned = rawName
    .replace(/\s*(\((অনির্ধ|অনিবন্ধিত|অতিথি|গেস্ট|guest|Customer)\))+/gi, '')
    .trim();

  if (!cleaned) {
    return isGuest
      ? `অতিথি গ্রাহক (${phone.replace('guest_', '').slice(-5)})`
      : `গ্রাহক (${phone.slice(-4)})`;
  }
  return cleaned;
}

/**
 * Helper to ensure database queries never hang indefinitely and choke the browser network pool
 */
const withQueryTimeout = <T>(promise: PromiseLike<T>, ms = 3500, fallback: T): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
};

/**
 * Fetch all customer conversations for Admin panel
 * Grouped by user_phone from Supabase
 * Optimized: selects only metadata fields and limits to recent records for maximum speed
 */
export async function getAdminConversations(): Promise<CustomerConversation[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const res = await withQueryTimeout(
      supabase
        .from('customer_messages')
        .select('id, user_phone, user_name, sender, message_type, content, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(300),
      3500,
      { data: null, error: new Error('getAdminConversations timeout') } as any
    );
    const { data, error } = res;

    if (error) {
      console.warn('Conversations fetch note/timeout:', error);
      return [];
    }

    const conversationMap = new Map<string, CustomerConversation>();

    (data || []).forEach((msg: any) => {
      const phone = msg.user_phone;
      if (!phone) return;

      const isGuest = phone.startsWith('guest_') || (!phone.startsWith('01') && !phone.startsWith('+880'));
      const displayName = cleanCustomerDisplayName(msg.user_name, phone, isGuest);

      let lastMsgText = msg.content || '';
      if (msg.message_type === 'voice') {
        lastMsgText = '🎙️ ভয়েস বার্তা (Voice Message)';
      } else if (msg.message_type === 'image') {
        lastMsgText = '📷 ছবি (Photo Attachment)';
      }

      if (!conversationMap.has(phone)) {
        conversationMap.set(phone, {
          id: phone,
          customer_phone: phone,
          customer_name: displayName,
          is_guest: isGuest,
          last_message: lastMsgText,
          last_message_type: (msg.message_type as CustomerMessageType) || 'text',
          last_message_time: msg.created_at,
          unread_count: (!msg.is_read && msg.sender === 'customer') ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(phone)!;
        if (!msg.is_read && msg.sender === 'customer') {
          conv.unread_count += 1;
        }
      }
    });

    return Array.from(conversationMap.values());
  } catch (err) {
    console.error('getAdminConversations error:', err);
    return [];
  }
}

/**
 * Fetch messages for a specific customer phone
 * Optimized: limits to latest 250 messages
 */
export async function getConversationMessages(phone: string): Promise<CustomerMessage[]> {
  if (!isSupabaseConfigured || !phone) return [];

  try {
    const res = await withQueryTimeout(
      supabase
        .from('customer_messages')
        .select('id, user_phone, user_name, sender, message_type, content, audio_url, image_url, created_at, is_read')
        .eq('user_phone', phone)
        .order('created_at', { ascending: true })
        .limit(150),
      3500,
      { data: null, error: new Error('getConversationMessages timeout') } as any
    );
    const { data, error } = res;

    if (error) {
      console.warn('Messages query note/timeout:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_phone: item.user_phone,
      user_name: cleanCustomerDisplayName(item.user_name, item.user_phone, item.user_phone.startsWith('guest_')),
      sender: item.sender as CustomerMessageRole,
      message_type: item.message_type as CustomerMessageType,
      content: item.content,
      audio_url: item.audio_url,
      image_url: item.image_url || null,
      created_at: item.created_at,
      is_read: item.is_read ?? false,
    }));
  } catch (err) {
    console.error('getConversationMessages error:', err);
    return [];
  }
}

/**
 * Upload chat image directly to Supabase Storage bucket 'chat_images'
 */
export async function uploadChatImage(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `chat/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat_images')
      .upload(filePath, file, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (!uploadError) {
      const { data } = supabase.storage.from('chat_images').getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn('Supabase storage upload error, falling back to data URL:', uploadError);
    }
  } catch (err) {
    console.warn('Storage upload exception, fallback to base64 Data URL:', err);
  }

// Fallback to reading file as Data URL so chat never breaks
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload chat voice audio directly to Supabase Storage bucket ('chat_audio' or 'chat_images')
 * to prevent main thread blocking and memory spikes from multi-megabyte Base64 payloads.
 */
export async function uploadChatAudio(audioBlob: Blob, mimeType = 'audio/webm'): Promise<string> {
  const ext = mimeType.includes('mp4') || mimeType.includes('aac') ? 'm4a' : (mimeType.includes('ogg') ? 'ogg' : 'webm');
  const cleanFileName = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = `voices/${cleanFileName}`;

  if (isSupabaseConfigured) {
    // Try chat_audio first, then fallback to chat_images
    const bucketsToTry = ['chat_audio', 'chat_images'];
    for (const b of bucketsToTry) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(b)
          .upload(filePath, audioBlob, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(b).getPublicUrl(filePath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        }
      } catch (e) {
        // Try next bucket
      }
    }
  }

  // Graceful fallback to data URL if cloud bucket is offline
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

export function playMessageNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Friendly double chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Autoplay policy fallback
  }
}

/**
 * Request Browser and Mobile Push Notification Permission
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.warn('Notification permission error:', err);
  }
  return false;
}

/**
 * Trigger Native Browser / Device Push Notification
 * Alerts customer even when the website is backgrounded or minimized
 */
export function triggerCustomerPushNotification(title: string, options?: { body?: string; url?: string; tag?: string }) {
  playMessageNotificationSound();
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: options?.body || 'সাপোর্ট থেকে একটি নতুন মেসেজ এসেছে। ট্যাপ করে দেখুন।',
        icon: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=128&auto=format&fit=crop&q=80',
        badge: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=96&auto=format&fit=crop&q=80',
        tag: options?.tag || 'chat-notification',
        requireInteraction: false
      });
      notification.onclick = () => {
        window.focus();
        if (options?.url && typeof window !== 'undefined') {
          window.location.href = options.url;
        }
        notification.close();
      };
    } catch (e) {
      console.warn('Native notification trigger failed:', e);
    }
  }
}

// Track sent message IDs in current tab to prevent duplicate display
export const sentMessageIdsInCurrentTab = new Set<string>();

function broadcastLocalMessage(msg: CustomerMessage) {
  if (typeof window === 'undefined') return;
  try {
    if (msg.id) {
      sentMessageIdsInCurrentTab.add(msg.id);
    }
    // Only broadcast across different browser tabs/windows.
    // Dispatching inside the same window was causing the sender to receive both the promise return
    // AND the local event simultaneously, rendering duplicate message bubbles.
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('medo_chat_channel');
      bc.postMessage(msg);
      bc.close();
    }
  } catch (e) {
    console.warn('Chat local broadcast note:', e);
  }
}

/**
 * Send an image message to Supabase
 */
export async function sendImageMessage(
  phone: string,
  sender: CustomerMessageRole,
  imageUrl: string,
  userName = 'Customer'
): Promise<CustomerMessage> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customer_messages')
    .insert({
      user_phone: phone,
      user_name: userName,
      sender,
      message_type: 'image',
      content: '📷 ছবি (Photo)',
      image_url: imageUrl,
      audio_url: null,
      is_read: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to send image message');
  }

  const result: CustomerMessage = {
    id: data.id,
    user_phone: data.user_phone,
    user_name: data.user_name,
    sender: data.sender as CustomerMessageRole,
    message_type: 'image',
    content: data.content,
    audio_url: null,
    image_url: data.image_url || imageUrl,
    created_at: data.created_at,
    is_read: data.is_read,
  };

  broadcastLocalMessage(result);
  return result;
}

/**
 * Send a text message to Supabase
 */
export async function sendTextMessage(
  phone: string,
  sender: CustomerMessageRole,
  text: string,
  userName = 'Customer'
): Promise<CustomerMessage> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customer_messages')
    .insert({
      user_phone: phone,
      user_name: userName,
      sender,
      message_type: 'text',
      content: text.trim(),
      audio_url: null,
      is_read: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to send message');
  }

  const result: CustomerMessage = {
    id: data.id,
    user_phone: data.user_phone,
    user_name: data.user_name,
    sender: data.sender as CustomerMessageRole,
    message_type: 'text',
    content: data.content,
    audio_url: null,
    image_url: null,
    created_at: data.created_at,
    is_read: data.is_read,
  };

  broadcastLocalMessage(result);
  return result;
}

/**
 * Send a voice audio message to Supabase
 */
export async function sendVoiceMessage(
  phone: string,
  sender: CustomerMessageRole,
  audioDataUrl: string,
  userName = 'Customer'
): Promise<CustomerMessage> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customer_messages')
    .insert({
      user_phone: phone,
      user_name: userName,
      sender,
      message_type: 'voice',
      content: '🎙️ ভয়েস অডিও বার্তা',
      audio_url: audioDataUrl,
      is_read: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to send voice message');
  }

  const result: CustomerMessage = {
    id: data.id,
    user_phone: data.user_phone,
    user_name: data.user_name,
    sender: data.sender as CustomerMessageRole,
    message_type: 'voice',
    content: data.content,
    audio_url: data.audio_url,
    image_url: null,
    created_at: data.created_at,
    is_read: data.is_read,
  };

  broadcastLocalMessage(result);
  return result;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(phone: string, roleToMark: CustomerMessageRole): Promise<void> {
  if (!isSupabaseConfigured || !phone) return;

  try {
    await supabase
      .from('customer_messages')
      .update({ is_read: true })
      .eq('user_phone', phone)
      .eq('sender', roleToMark);

    // Broadcast read receipt locally and to other tabs immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medo_chat_read', { detail: { phone, role: roleToMark } })
      );
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('medo_chat_channel');
          bc.postMessage({ type: 'READ_RECEIPT', phone, role: roleToMark });
          bc.close();
        } catch {}
      }
    }
  } catch (err) {
    console.error('markMessagesAsRead error:', err);
  }
}

/**
 * Permanently delete a chat message from Supabase (Two-way deletion for both Admin & User)
 */
export async function deleteChatMessage(messageId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !messageId) return false;

  try {
    const { error } = await supabase
      .from('customer_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('deleteChatMessage error:', error);
      return false;
    }

    // Broadcast delete event across local window and tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medo_chat_deleted', { detail: { id: messageId } })
      );
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('medo_chat_channel');
          bc.postMessage({ type: 'DELETE_MESSAGE', id: messageId });
          bc.close();
        } catch {}
      }
    }
    return true;
  } catch (err) {
    console.error('deleteChatMessage exception:', err);
    return false;
  }
}

/**
 * Get total unseen/unread messages count from customers
 */
export async function getTotalUnreadMessagesCount(assignedPhones?: string[] | null): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  try {
    let query = supabase
      .from('customer_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('sender', 'customer');

    if (assignedPhones && assignedPhones.length > 0) {
      query = query.in('user_phone', assignedPhones);
    }

    const res = await withQueryTimeout(
      query,
      3000,
      { count: 0, error: null } as any
    );
    const { count, error } = res;
    if (error) {
      return 0;
    }
    return count || 0;
  } catch (err) {
    return 0;
  }
}

/**
 * Realtime subscription to messages
 * Listens via Supabase Realtime WebSocket, Window CustomEvents, and BroadcastChannel
 */
export function subscribeToMessages(
  phone: string | null,
  onNewMessage: (msg: CustomerMessage) => void,
  onMessageUpdated?: (updated: CustomerMessage | { id?: string; user_phone: string; is_read: boolean }) => void,
  onMessageDeleted?: (deletedId: string) => void
): () => void {
  const seenMessageIds = new Set<string>();

  const emitMsg = (msg: CustomerMessage) => {
    if (!msg || !msg.id) return;
    if (seenMessageIds.has(msg.id)) return;
    seenMessageIds.add(msg.id);
    if (!phone || msg.user_phone === phone) {
      onNewMessage(msg);
    }
  };

  // 1. Window Event listener (instant within same window/tab)
  const handleLocalEvent = (e: any) => {
    if (e.detail) {
      emitMsg(e.detail as CustomerMessage);
    }
  };

  const handleLocalReadEvent = (e: any) => {
    if (e.detail && (!phone || e.detail.phone === phone)) {
      onMessageUpdated?.({ user_phone: e.detail.phone, is_read: true });
    }
  };

  const handleLocalDeleteEvent = (e: any) => {
    if (e.detail?.id) {
      onMessageDeleted?.(e.detail.id);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('medo_new_chat_message', handleLocalEvent);
    window.addEventListener('medo_chat_read', handleLocalReadEvent);
    window.addEventListener('medo_chat_deleted', handleLocalDeleteEvent);
  }

  // 2. BroadcastChannel (instant cross-tab synchronization)
  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('medo_chat_channel');
      bc.onmessage = (event) => {
        if (event.data) {
          if (event.data.type === 'READ_RECEIPT') {
            if (!phone || event.data.phone === phone) {
              onMessageUpdated?.({ user_phone: event.data.phone, is_read: true });
            }
          } else if (event.data.type === 'DELETE_MESSAGE') {
            if (event.data.id) {
              onMessageDeleted?.(event.data.id);
            }
          } else {
            emitMsg(event.data as CustomerMessage);
          }
        }
      };
    } catch {}
  }

  // 3. Supabase Realtime WebSocket channel (listening to INSERT, UPDATE and DELETE)
  let channel: any = null;
  if (isSupabaseConfigured) {
    const channelId = `chat-${phone || 'all'}-${Math.random().toString(36).substring(7)}`;

    channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_messages',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const item = payload.new as any;
            if (item && (!phone || item.user_phone === phone)) {
              onMessageUpdated?.({
                id: item.id,
                user_phone: item.user_phone,
                user_name: item.user_name || 'Customer',
                sender: item.sender as CustomerMessageRole,
                message_type: item.message_type as CustomerMessageType,
                content: item.content,
                audio_url: item.audio_url,
                image_url: item.image_url,
                created_at: item.created_at,
                is_read: item.is_read ?? false,
              });
            }
          } else if (payload.eventType === 'INSERT') {
            const item = payload.new as any;
            if (item) {
              emitMsg({
                id: item.id,
                user_phone: item.user_phone,
                user_name: item.user_name || 'Customer',
                sender: item.sender as CustomerMessageRole,
                message_type: item.message_type as CustomerMessageType,
                content: item.content,
                audio_url: item.audio_url,
                image_url: item.image_url,
                created_at: item.created_at,
                is_read: item.is_read ?? false,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldItem = payload.old as any;
            if (oldItem?.id) {
              onMessageDeleted?.(oldItem.id);
            }
          }
        }
      )
      .subscribe();
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('medo_new_chat_message', handleLocalEvent);
      window.removeEventListener('medo_chat_read', handleLocalReadEvent);
      window.removeEventListener('medo_chat_deleted', handleLocalDeleteEvent);
    }
    if (bc) {
      bc.close();
    }
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}
