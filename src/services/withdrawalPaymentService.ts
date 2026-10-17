import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface WithdrawalPaymentMethod {
  id: string;
  name: string;
  label_bn: string;
  channel_type: 'mobile_banking' | 'bank' | 'other';
  logo_url?: string;
  account_number_placeholder?: string;
  instructions_bn?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_METHODS: WithdrawalPaymentMethod[] = [
  {
    id: 'bKash',
    name: 'bKash',
    label_bn: 'বিকাশ',
    channel_type: 'mobile_banking',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/BKash_Logo.svg',
    account_number_placeholder: '017XXXXXXXX',
    instructions_bn: 'সঠিক বিকাশ পার্সোনাল বা এজেন্ট নম্বর দিন।',
    is_active: true,
    display_order: 1
  },
  {
    id: 'Nagad',
    name: 'Nagad',
    label_bn: 'নগদ',
    channel_type: 'mobile_banking',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Nagad_Logo.png',
    account_number_placeholder: '01XXXXXXXXX',
    instructions_bn: 'সঠিক নগদ একাউন্ট নম্বর দিন।',
    is_active: true,
    display_order: 2
  },
  {
    id: 'Rocket',
    name: 'Rocket',
    label_bn: 'রকেট',
    channel_type: 'mobile_banking',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Dutch-Bangla_Bank_Rocket_logo.svg/300px-Dutch-Bangla_Bank_Rocket_logo.svg.png',
    account_number_placeholder: '01XXXXXXXXXX (১২ ডিজিট)',
    instructions_bn: 'রকেট একাউন্টের ১২ ডিজিটের নম্বর দিন।',
    is_active: true,
    display_order: 3
  },
  {
    id: 'Bank',
    name: 'Bank',
    label_bn: 'ব্যাংক হিসাব',
    channel_type: 'bank',
    logo_url: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&q=80',
    account_number_placeholder: 'হিসাব নম্বর',
    instructions_bn: 'যেকোনো অনুমোদিত তফসিলি ব্যাংকের তথ্য দিন।',
    is_active: true,
    display_order: 4
  }
];

export const withdrawalPaymentService = {
  async getAllMethods(): Promise<WithdrawalPaymentMethod[]> {
    if (!isSupabaseConfigured) return DEFAULT_METHODS;

    try {
      const { data, error } = await supabase
        .from('withdrawal_payment_methods')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_METHODS;
      }

      return data as WithdrawalPaymentMethod[];
    } catch {
      return DEFAULT_METHODS;
    }
  },

  async getActiveMethods(): Promise<WithdrawalPaymentMethod[]> {
    const list = await this.getAllMethods();
    return list.filter((m) => m.is_active);
  },

  async saveMethod(method: Partial<WithdrawalPaymentMethod> & { id: string; name: string; label_bn: string }): Promise<WithdrawalPaymentMethod | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const payload = {
        ...method,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('withdrawal_payment_methods')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving withdrawal method:', error);
        return null;
      }

      return data as WithdrawalPaymentMethod;
    } catch (err) {
      console.error('saveMethod error:', err);
      return null;
    }
  },

  async deleteMethod(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('withdrawal_payment_methods')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting withdrawal method:', error);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  async toggleActive(id: string, currentState: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('withdrawal_payment_methods')
        .update({ is_active: !currentState, updated_at: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }
};
