import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SubAdmin, AdminModuleKey, AdminModulePermission } from '@/types/loan';

export const ALL_ADMIN_MODULES: AdminModulePermission[] = [
  { key: 'dashboard', labelBn: 'ড্যাশবোর্ড ওভারভিউ', descriptionBn: 'এডমিন ড্যাশবোর্ডের সার্বিক পরিসংখ্যান ও নোটিশ' },
  { key: 'applications', labelBn: 'লোন আবেদন যাচাই ও অনুমোদন', descriptionBn: 'গ্রাহকদের আবেদন দেখা, অনুমোদন বা বাতিল করা' },
  { key: 'customers', labelBn: 'সকল ইউজার অ্যাকাউন্টস ও প্রোফাইল', descriptionBn: 'গ্রাহকদের তথ্য, পাসওয়ার্ড, অ্যাকাউন্ট এডিট ও শর্ত' },
  { key: 'messages', labelBn: 'লাইভ চ্যাট ও মেসেজিং হাব (টেক্সট/ভয়েস)', descriptionBn: 'গ্রাহকদের সাথে সরাসরি চ্যাট ও অডিও মেসেজ' },
  { key: 'deposits', labelBn: 'ডিপোজিট ও পেমেন্ট মেথড ম্যানেজমেন্ট', descriptionBn: 'জমা টাকা অনুমোদন ও পেমেন্ট চ্যানেল কনফিগার' },
  { key: 'withdrawals', labelBn: 'টাকা উত্তোলন (Withdraw) ও চার্জ', descriptionBn: 'উত্তোলন রিকোয়েস্ট অনুমোদন ও ফি হিসাব' },
  { key: 'packages', labelBn: 'লোন প্যাকেজ ও সুদের হার', descriptionBn: 'নতুন লোন স্কিম তৈরি ও সুদের হার এডিট' },
  { key: 'letters', labelBn: 'লোন অনুমোদন লেটার (Sanction Letter)', descriptionBn: 'গ্রাহকের জন্য অফিশিয়াল চিঠি তৈরি ও প্রিন্ট' },
  { key: 'contracts', labelBn: 'স্ট্যাম্প ও ডিজিটাল ঋণ চুক্তিপত্র', descriptionBn: '৩০০ টাকার স্ট্যাম্পে আইনি চুক্তি তৈরি' },
  { key: 'staff_id', labelBn: 'স্টাফ আইডি কার্ড (NID স্টাইল)', descriptionBn: 'কর্মকর্তা আইডি কার্ড তৈরি ও অনুমোদন' },
  { key: 'support_partners', labelBn: 'সাপোর্ট ও পার্টনার ব্যাংক', descriptionBn: 'হোয়াটসঅ্যাপ, ইমো ও ব্যাংক তথ্য ব্যবস্থাপনা' },
  { key: 'notifications', labelBn: 'কাস্টম নোটিফিকেশন', descriptionBn: 'গ্রাহকদের ব্রডকাস্ট বা বিশেষ বার্তা পাঠানো' },
  { key: 'media', labelBn: 'প্রমোশনাল ব্যানার ও মিডিয়া গ্যালারি', descriptionBn: 'হোম পেজের ব্যানার ও প্রমোশন ছবি পরিবর্তন' },
  { key: 'official_docs', labelBn: 'অফিশিয়াল সনদ ও ব্যাংক দলিল', descriptionBn: 'অন্যান্য আইনি ও প্রাতিষ্ঠানিক ডকুমেন্ট জেনারেটর' },
  { key: 'settings', labelBn: 'সাইট কনটেন্ট ও ওয়াটারমার্ক সেটিংস', descriptionBn: 'লগইন ব্যাকগ্রাউন্ড, লোগো ও সার্বিক কনফিগারেশন' }
];

export const subAdminService = {
  // Fetch all sub-admins from Supabase
  async getAllSubAdmins(): Promise<SubAdmin[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('sub_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((item) => ({
        id: item.id,
        username: item.username,
        password: item.password,
        name: item.name,
        phone: item.phone,
        role: 'sub_admin' as const,
        permissions: (item.permissions || []) as AdminModuleKey[],
        assigned_customer_ids: (item.assigned_customer_ids || []) as string[],
        can_delete_messages: item.can_delete_messages === true,
        is_active: item.is_active !== false,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (e) {
      console.error('Failed to fetch sub-admins:', e);
      return [];
    }
  },

  // Save or update a sub-admin
  async saveSubAdmin(subAdmin: Partial<SubAdmin> & { username: string; name: string }): Promise<SubAdmin | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const id = subAdmin.id || `subadmin-${Date.now()}`;
      const payload = {
        id,
        username: subAdmin.username.trim(),
        password: subAdmin.password?.trim() || 'Sub123456@',
        name: subAdmin.name.trim(),
        phone: subAdmin.phone?.trim() || '',
        role: 'sub_admin',
        permissions: subAdmin.permissions || ['messages'],
        assigned_customer_ids: subAdmin.assigned_customer_ids || [],
        can_delete_messages: subAdmin.can_delete_messages === true,
        is_active: subAdmin.is_active !== false,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sub_admins')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error saving sub_admin:', error);
        return null;
      }

      const savedRecord: SubAdmin = {
        id: data.id,
        username: data.username,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: 'sub_admin',
        permissions: (data.permissions || []) as AdminModuleKey[],
        assigned_customer_ids: (data.assigned_customer_ids || []) as string[],
        can_delete_messages: data.can_delete_messages === true,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sub_admin_updated', { detail: savedRecord }));
      }

      return savedRecord;
    } catch (e) {
      console.error('Exception in saveSubAdmin:', e);
      return null;
    }
  },

  // Delete a sub-admin
  async deleteSubAdmin(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('sub_admins').delete().eq('id', id);
      if (!error && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sub_admin_deleted', { detail: { id } }));
      }
      return !error;
    } catch (e) {
      console.error('Failed to delete sub-admin:', e);
      return false;
    }
  },

  // Assign specific customers to a sub-admin in real-time
  async assignCustomers(subAdminId: string, customerPhoneOrIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .from('sub_admins')
        .update({
          assigned_customer_ids: customerPhoneOrIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', subAdminId);

      if (error) {
        console.error('Error assigning customers:', error);
        return false;
      }

      // Broadcast update event locally and across sessions
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sub_admin_assigned_updated', {
          detail: { subAdminId, customerPhoneOrIds }
        }));
      }

      return true;
    } catch (e) {
      console.error('Exception assigning customers:', e);
      return false;
    }
  },

  // Authenticate sub-admin
  async authenticateSubAdmin(username: string, password: string): Promise<SubAdmin | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('sub_admins')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        username: data.username,
        name: data.name,
        phone: data.phone,
        role: 'sub_admin',
        permissions: (data.permissions || []) as AdminModuleKey[],
        assigned_customer_ids: (data.assigned_customer_ids || []) as string[],
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch {
      return null;
    }
  }
};
