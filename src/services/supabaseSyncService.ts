import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  CustomerUser, 
  LoanApplication, 
  DepositRequest, 
  WithdrawalRequest, 
  WithdrawalCondition, 
  PromotionMediaItem,
  SiteSettings,
  LoanPackage,
  StaffIdCard,
  PaymentMethodConfig,
  FixedDepositScheme,
  CustomerFixedDeposit,
  CustomerSupportConfig,
  PartnerBankConfig
} from '@/types/loan';
import { toast } from 'sonner';

export const withQueryTimeout = <T>(promise: PromiseLike<T>, ms = 2500, fallback: any): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
};

/**
 * Supabase Realtime & Database Synchronization Service
 * সমস্ত ডাটা Supabase ক্লাউড ডাটাবেজে সংরক্ষণ ও রিয়েল-টাইমে সিঙ্ক করে
 */
class SupabaseSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: any = null;
  private isListening = false;
  private onSettingsChangeCallback?: (settings: SiteSettings) => void;
  private unavailableTables = new Set<string>();
  private userSyncQueues = new Map<string, Promise<void>>();

  /**
   * Realtime events are useful for the Admin Panel, but customers should not
   * receive popup/toast messages when an admin updates their data.
   * Keep the realtime callbacks active for silent data synchronization and
   * only show realtime toast messages while an admin page is open.
   */
  private isAdminPage(): boolean {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  }

  private showAdminInfo(message: string) {
    if (this.isAdminPage()) {
      toast.info(message);
    }
  }

  private showAdminSuccess(message: string, options?: { duration?: number }) {
    if (this.isAdminPage()) {
      toast.success(message, options);
    }
  }

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('shohoj_loan_realtime_sync');
      } catch {
        this.broadcastChannel = null;
      }
    }
  }

  // Legacy & Context helper initializer
  public init(onSettingsChange?: (newSettings: SiteSettings) => void) {
    if (onSettingsChange) {
      this.onSettingsChangeCallback = onSettingsChange;
    }
  }

  // --- Realtime Subscriptions ---
  public initRealtimeListeners(callbacks: {
    onUserRegistered?: (user: any) => void;
    onApplicationSubmitted?: (app: any) => void;
    onDepositSubmitted?: (dep: any) => void;
    onWithdrawalSubmitted?: (wd: any) => void;
    onConditionUpdated?: (cond: any) => void;
    onSettingsUpdated?: (settings: any) => void;
    onMediaUpdated?: (media: any) => void;
    onPaymentMethodUpdated?: (method: any) => void;
    onDpsSchemeUpdated?: (scheme: any) => void;
    onCustomerFixedDepositUpdated?: (deposit: any) => void;
    onPackageUpdated?: (pkg: any) => void;
    onCustomerSupportUpdated?: (support: CustomerSupportConfig) => void;
    onPartnerBanksUpdated?: (banks: PartnerBankConfig[]) => void;
    onCustomerPurged?: (payload: { phone: string; userId: string; loanIds: string[] }) => void;
    onContractUpdated?: (contract: any) => void;
    onVirtualCardUpdated?: (card: any) => void;
  }) {
    if (this.isListening) return;
    this.isListening = true;

    // 1. BroadcastChannel Listener (Instant Multi-Tab / Multi-Window Sync)
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        switch (type) {
          case 'USER_REGISTERED':
            callbacks.onUserRegistered?.(payload);
            break;
          case 'APPLICATION_SUBMITTED':
            callbacks.onApplicationSubmitted?.(payload);
            break;
          case 'APPLICATION_DELETED':
            // Other tabs can refresh their application snapshot.
            break;
          case 'DEPOSIT_SUBMITTED':
            callbacks.onDepositSubmitted?.(payload);
            break;
          case 'WITHDRAWAL_SUBMITTED':
            callbacks.onWithdrawalSubmitted?.(payload);
            break;
          case 'CONDITION_UPDATED':
            callbacks.onConditionUpdated?.(payload);
            break;
          case 'SETTINGS_UPDATED':
            callbacks.onSettingsUpdated?.(payload);
            this.onSettingsChangeCallback?.(payload);
            break;
          case 'MEDIA_UPDATED':
            callbacks.onMediaUpdated?.(payload);
            break;
          case 'PAYMENT_METHOD_UPDATED':
            callbacks.onPaymentMethodUpdated?.(payload);
            break;
          case 'DPS_SCHEME_UPDATED':
            callbacks.onDpsSchemeUpdated?.(payload);
            break;
          case 'CUSTOMER_FIXED_DEPOSIT_SUBMITTED':
            callbacks.onCustomerFixedDepositUpdated?.(payload);
            break;
          case 'PACKAGE_UPDATED':
            callbacks.onPackageUpdated?.(payload);
            break;
          case 'CUSTOMER_SUPPORT_UPDATED':
            callbacks.onCustomerSupportUpdated?.(payload);
            break;
          case 'PARTNER_BANKS_UPDATED':
            callbacks.onPartnerBanksUpdated?.(payload);
            break;
          case 'CUSTOMER_PURGED':
            callbacks.onCustomerPurged?.(payload);
            break;
          case 'CONTRACT_UPDATED':
          case 'CONTRACT_DELETED':
            callbacks.onContractUpdated?.(payload);
            break;
          case 'VIRTUAL_CARD_REQUESTED':
          case 'VIRTUAL_CARD_UPDATED':
          case 'VIRTUAL_CARD_DELETED':
            callbacks.onVirtualCardUpdated?.(payload);
            break;
        }
      };
    }

    // 2. Supabase Cloud Realtime Channel (Cross-Device Cloud Sync when configured)
    if (isSupabaseConfigured) {
      try {
        if (this.realtimeChannel) {
          try {
            supabase.removeChannel(this.realtimeChannel);
          } catch {
            // Ignore previous channel removal
          }
        }

        this.realtimeChannel = supabase
          .channel('shohoj_loan_db_sync')
          // site_users table listener (Real-time Cross-Device User Registration & Deletion)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_users' },
            (payload: any) => {
              if (payload.eventType === 'DELETE') {
                const oldPhone = (payload.old as any)?.phone;
                if (oldPhone) {
                  callbacks.onCustomerPurged?.({ phone: oldPhone, userId: oldPhone, loanIds: [] });
                  this.showAdminInfo('রিয়েল-টাইম: গ্রাহকের ডাটাবেজ রেকর্ড অপসারিত হয়েছে');
                }
              } else {
                const u = (payload.new as any)?.data as CustomerUser;
                if (u) {
                  callbacks.onUserRegistered?.(u);
                  // Notify mounted dashboards to reload the updated cloud snapshot.
                  // This event is intentionally local to the receiving browser; the
                  // Supabase postgres_changes event is what bridges separate devices.
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('app_data_updated', {
                      detail: { source: 'supabase-site-users', user: u }
                    }));
                  }
                  this.showAdminInfo(`রিয়েল-টাইম: গ্রাহক ${u.name || u.phone} নিবন্ধিত/আপডেট হয়েছেন!`);
                }
              }
            }
          )
          // site_loans listener (Real-time Cross-Device Loan Applications)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_loans' },
            (payload: any) => {
              const app = (payload.new as any)?.data as LoanApplication;
              if (app) {
                callbacks.onApplicationSubmitted?.(app);
                if (payload.eventType === 'INSERT') {
                  this.showAdminSuccess(`রিয়েল-টাইম: নতুন লোন আবেদন জমা পড়েছে (${app.applicantName || app.phone})!`);
                }
              }
            }
          )
          // site_deposits listener
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_deposits' },
            (payload: any) => {
              const dep = (payload.new as any)?.data as DepositRequest;
              if (dep) {
                callbacks.onDepositSubmitted?.(dep);
                if (payload.eventType === 'INSERT') {
                  this.showAdminInfo(`রিয়েল-টাইম: নতুন ডিপোজিট রিকোয়েস্ট জমা পড়েছে (৳ ${dep.amount})!`);
                }
              }
            }
          )
          // site_withdrawals listener
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_withdrawals' },
            (payload: any) => {
              const wd = (payload.new as any)?.data as WithdrawalRequest;
              if (wd) {
                callbacks.onWithdrawalSubmitted?.(wd);
                if (payload.eventType === 'INSERT') {
                  this.showAdminInfo(`রিয়েল-টাইম: নতুন উইথড্রয়াল আবেদন জমা পড়েছে (৳ ${wd.amount})!`);
                }
              }
            }
          )
          // site_settings listener (Real-time platform name, notice, branding, customer support, partner banks)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_settings' },
            (payload: any) => {
              const record = payload.new as any;
              if (record?.id === 'customer_support') {
                callbacks.onCustomerSupportUpdated?.(record.data);
                this.showAdminInfo('রিয়েল-টাইম: কাস্টমার সাপোর্ট চ্যানেলসমূহ আপডেট হয়েছে!');
              } else if (record?.id === 'partner_banks') {
                callbacks.onPartnerBanksUpdated?.(record.data);
                this.showAdminInfo('রিয়েল-টাইম: পার্টনার ব্যাংক তালিকা আপডেট হয়েছে!');
              } else if (record?.data) {
                callbacks.onSettingsUpdated?.(record.data);
                this.onSettingsChangeCallback?.(record.data);
                this.showAdminInfo('রিয়েল-টাইম: সাইট সেটিংস লাইভ আপডেট হয়েছে!');
              }
            }
          )
          // site_payment_methods listener (Real-time bKash/Nagad/Rocket account & gateway updates)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_payment_methods' },
            (payload: any) => {
              const pm = (payload.new as any)?.data as PaymentMethodConfig;
              if (pm) {
                callbacks.onPaymentMethodUpdated?.(pm);
                // Silent background update: users should never be interrupted with popup toasts
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                if (oldId) callbacks.onPaymentMethodUpdated?.({ id: oldId, _deleted: true });
              }
            }
          )
          // site_packages listener (Real-time loan package updates)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_packages' },
            (payload: any) => {
              const pkg = (payload.new as any)?.data as LoanPackage;
              if (pkg) {
                callbacks.onPackageUpdated?.(pkg);
                this.showAdminInfo(`রিয়েল-টাইম: লোন প্যাকেজ "${pkg.nameBn || pkg.nameEn}" আপডেট হয়েছে!`);
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                if (oldId) callbacks.onPackageUpdated?.({ id: oldId, _deleted: true });
              }
            }
          )
          // site_dps_schemes listener (Real-time Fixed Deposit / DPS scheme updates)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_dps_schemes' },
            (payload: any) => {
              const scheme = (payload.new as any)?.data as FixedDepositScheme;
              if (scheme) {
                callbacks.onDpsSchemeUpdated?.(scheme);
                this.showAdminInfo(`রিয়েল-টাইম: সঞ্চয় স্কিম "${scheme.titleBn}" আপডেট হয়েছে!`);
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                if (oldId) callbacks.onDpsSchemeUpdated?.({ id: oldId, _deleted: true });
              }
            }
          )
          // site_customer_fixed_deposits listener (Real-time customer deposit submission to Admin)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_customer_fixed_deposits' },
            (payload: any) => {
              const deposit = (payload.new as any)?.data as CustomerFixedDeposit;
              if (deposit) {
                callbacks.onCustomerFixedDepositUpdated?.(deposit);
                if (payload.eventType === 'INSERT') {
                  this.showAdminSuccess(`রিয়েল-টাইম: নতুন ফিক্সড ডিপোজিট জমা পড়েছে (৳ ${deposit.depositAmount || 0})!`, {
                    duration: 5000
                  });
                } else if (payload.eventType === 'UPDATE') {
                  this.showAdminInfo(`রিয়েল-টাইম: ফিক্সড ডিপোজিট স্ট্যাটাস আপডেট হয়েছে (${deposit.status === 'active' ? 'অনুমোদিত' : deposit.status})`);
                }
              }
            }
          )
          // sub_admins listener (Real-time Sub-Admin accounts and customer assignments)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sub_admins' },
            (payload: any) => {
              if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('sub_admin_deleted', { detail: { id: oldId } }));
                }
              } else {
                const subAdmin = payload.new as any;
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('sub_admin_updated', { detail: subAdmin }));
                }
              }
            }
          )
          // promotion_media listener (Real-time Happy Customers & Banner Ads)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'promotion_media' },
            (payload: any) => {
              if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                if (oldId) callbacks.onMediaUpdated?.({ id: oldId, _deleted: true });
              } else {
                const r = payload.new as any;
                if (r) {
                  const item: PromotionMediaItem = {
                    id: r.id,
                    titleBn: r.title_bn,
                    captionBn: r.caption_bn,
                    category: r.category,
                    imageUrl: r.image_url,
                    loanAmount: r.loan_amount,
                    customerName: r.customer_name,
                    customerLocation: r.customer_location,
                    customerProfession: r.customer_profession,
                    badgeBn: r.badge_bn,
                    storyBn: r.story_bn,
                    ctaTextBn: r.cta_text_bn,
                    ctaLink: r.cta_link,
                    date: r.date,
                    order: r.display_order,
                    active: r.active !== false
                  };
                  callbacks.onMediaUpdated?.(item);
                }
              }
            }
          )
          // site_contracts table listener (Real-time Legal Contract sync)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_contracts' },
            (payload: any) => {
              const contract = (payload.new as any)?.data;
              if (contract) {
                callbacks.onContractUpdated?.(contract);
                if (payload.eventType === 'INSERT') {
                  this.showAdminSuccess(`রিয়েল-টাইম: চুক্তিপত্র তৈরি হয়েছে!`);
                }
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                callbacks.onContractUpdated?.({ id: oldId, _deleted: true });
              }
            }
          )
          // virtual_cards table listener (Real-time Virtual Card Requests & Issue sync)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'virtual_cards' },
            (payload: any) => {
              const card = payload.new as any;
              if (card) {
                callbacks.onVirtualCardUpdated?.(card);
                if (payload.eventType === 'INSERT' && card.status === 'pending') {
                  this.showAdminSuccess(`রিয়েল-টাইম: নতুন ভার্চুয়াল কার্ডের আবেদন এসেছে (${card.customer_name})!`, { duration: 6000 });
                }
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as any)?.id;
                callbacks.onVirtualCardUpdated?.({ id: oldId, _deleted: true });
              }
            }
          )
          .subscribe((status: string, err?: Error) => {
            if (status === 'SUBSCRIBED') {
              console.info('[Supabase Realtime] Connected to the configured project.');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              // Gracefully handle close/reconnect events without polluting console error
              console.debug(`[Supabase Realtime] Status: ${status}`, err || '');
            }
          });
      } catch (err) {
        console.warn('Supabase Realtime subscription error:', err);
      }
    }
  }

  // --- Broadcast Notifications ---
  public broadcastEvent(type: string, payload: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, payload });
      } catch {
        // Ignore
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('loan_realtime_event', { detail: { type, payload } }));
      window.dispatchEvent(new CustomEvent('loan_data_updated'));
    }
  }

  // Helper to mark table unavailable on 404 (PGRST205)
  private handlePostgrestError(table: string, err: any) {
    if (err?.code === 'PGRST205' || err?.message?.includes('schema cache') || err?.status === 404) {
      this.unavailableTables.add(table);
      console.info(`Supabase table "${table}" not found in database. Run supabase_schema.sql to create it.`);
    }
  }

  // --- Cloud Database Write Methods ---

  // 1. Sync User / Profile
  public async syncUserToCloud(user: CustomerUser): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    if (!user?.phone) {
      throw new Error('Cannot sync a customer without a phone number.');
    }

    // Serialize writes for the same customer. Otherwise two quick balance
    // changes can finish out of order and leave an older wallet value in cloud.
    const key = user.phone.replace(/\\D/g, '') || user.phone;
    const previous = this.userSyncQueues.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(async () => {
      const { error } = await supabase
        .from('site_users')
        .upsert(
          {
            phone: user.phone,
            data: user,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        );

      if (error) {
        console.error('Failed to sync user to Supabase:', error);
        throw new Error(`Failed to sync customer ${user.phone} to Supabase: ${error.message}`);
      }

      this.broadcastEvent('USER_REGISTERED', user);
    });

    this.userSyncQueues.set(key, next);
    try {
      await next;
    } finally {
      if (this.userSyncQueues.get(key) === next) {
        this.userSyncQueues.delete(key);
      }
    }
  }

  // 2. Fetch Users from Cloud
  public async fetchUsersFromCloud(): Promise<CustomerUser[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_users').select('*').order('updated_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;

      return data.map((row: any) => row.data as CustomerUser).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 2.1 Fetch Specific User By Phone from Cloud
  public async findUserByPhoneInCloud(phone: string): Promise<CustomerUser | null> {
    if (!isSupabaseConfigured || !phone) return null;
    try {
      const cleanPhone = phone.toString().trim();
      const inputDigits = cleanPhone.replace(/\D/g, '');
      const inputCore = inputDigits.replace(/^0+/, '');

      // 1. Check all phone variants in a SINGLE parallel batch query (super fast, ~100-200ms)
      const directQueries = Array.from(new Set([
        cleanPhone,
        inputDigits,
        inputCore ? `0${inputCore}` : '',
        inputCore ? `+880${inputCore}` : '',
        inputCore ? `880${inputCore}` : ''
      ].filter(Boolean)));

      const { data: matchedRows, error: directErr } = await supabase
        .from('site_users')
        .select('*')
        .in('phone', directQueries)
        .limit(1);

      if (!directErr && matchedRows && matchedRows.length > 0) {
        const u = matchedRows[0].data as CustomerUser;
        if (u) return u;
      }

      // 2. Fallback: only if direct match fails, query the latest 100 users
      const { data, error } = await supabase
        .from('site_users')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) return null;

      for (const row of data) {
        const u = row.data as CustomerUser;
        if (!u || !u.phone) continue;

        const uRawDigits = u.phone.toString().replace(/\D/g, '');
        const uCore = uRawDigits.replace(/^0+/, '');

        if (u.phone === cleanPhone || uRawDigits === inputDigits) return u;
        if (inputCore && uCore) {
          if (uCore === inputCore) return u;
          if (uCore.endsWith(inputCore) || inputCore.endsWith(uCore)) return u;
          if (inputCore.length >= 8 && uCore.length >= 8) {
            if (uCore.slice(-8) === inputCore.slice(-8)) return u;
          }
        }
      }
      return null;
    } catch (e) {
      console.warn('findUserByPhoneInCloud error:', e);
      return null;
    }
  }

  // 3. Sync Loan Application
  // Do not report/broadcast a successful submission until Supabase confirms the write.
  public async syncApplicationToCloud(app: LoanApplication): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. The application was not saved to the cloud.');
    }

    try {
      const { error } = await supabase.from('site_loans').upsert(
        {
          id: app.id,
          user_phone: app.phone,
          data: app,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('site_loans upsert error:', error);
        throw new Error(`Could not save the application to Supabase: ${error.message}`);
      }

      // Notify other tabs/admin listeners only after the database write succeeds.
      this.broadcastEvent('APPLICATION_SUBMITTED', app);
    } catch (e: any) {
      console.error('site_loans sync failed:', e);
      if (e instanceof Error) throw e;
      throw new Error('Could not save the application to Supabase. Please try again.');
    }
  }

  // Delete exactly one application by its unique ID; never delete by phone number.
  public async deleteApplicationFromCloud(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. The application was not deleted.');
    }
    const cleanId = String(id || '').trim();
    if (!cleanId) throw new Error('Application ID is required.');

    const { error } = await supabase.from('site_loans').delete().eq('id', cleanId);
    if (error) {
      console.error('site_loans delete error:', error);
      throw new Error(`Could not delete application ${cleanId}: ${error.message}`);
    }
    this.broadcastEvent('APPLICATION_DELETED', { id: cleanId });
  }

  // Fetch Applications from Cloud
  public async fetchApplicationsFromCloud(): Promise<LoanApplication[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_loans').select('*').order('created_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;

      return data.map((row: any) => row.data as LoanApplication).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 4. Sync Deposit Request
  public async syncDepositToCloud(dep: DepositRequest): Promise<void> {
    this.broadcastEvent('DEPOSIT_SUBMITTED', dep);

    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_deposits').upsert(
        {
          id: dep.id,
          user_phone: dep.userId || dep.senderNumber,
          data: dep,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_deposits upsert error:', error);
      }
    } catch (e: any) {
      console.warn('site_deposits error:', e);
    }
  }

  // Fetch Deposits from Cloud
  public async fetchDepositsFromCloud(): Promise<DepositRequest[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_deposits').select('*').order('created_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;

      return data.map((row: any) => row.data as DepositRequest).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 5. Sync Withdrawal Request
  public async syncWithdrawalToCloud(wd: WithdrawalRequest): Promise<void> {
    this.broadcastEvent('WITHDRAWAL_SUBMITTED', wd);

    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_withdrawals').upsert(
        {
          id: wd.id,
          user_phone: wd.userId || wd.accountNumber,
          data: wd,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_withdrawals upsert error:', error);
      }
    } catch (e: any) {
      console.warn('site_withdrawals error:', e);
    }
  }

  // Fetch Withdrawals from Cloud
  public async fetchWithdrawalsFromCloud(): Promise<WithdrawalRequest[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_withdrawals').select('*').order('created_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;

      return data.map((row: any) => row.data as WithdrawalRequest).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 6. Sync Condition Step
  public async syncConditionToCloud(userId: string, cond: WithdrawalCondition): Promise<void> {
    this.broadcastEvent('CONDITION_UPDATED', { userId, cond });

    if (!isSupabaseConfigured || this.unavailableTables.has('withdrawal_conditions')) return;
    try {
      const { error } = await supabase.from('withdrawal_conditions').upsert(
        {
          id: `COND-${userId}`,
          user_id: userId,
          step_order: 1,
          condition_title: cond.stageTitle || 'উইথড্রয়াল শর্ত',
          condition_description: cond.instructionBn || cond.messageBn || '',
          fee_amount: cond.feeAmount || 0,
          trx_id: cond.customerTrxId || null,
          status: cond.status || (cond.isApproved ? 'completed' : 'pending'),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        this.handlePostgrestError('withdrawal_conditions', error);
      }
    } catch (e: any) {
      this.handlePostgrestError('withdrawal_conditions', e);
    }
  }

  // 7. Sync Promotion Media
  public async syncPromotionMediaToCloud(item: PromotionMediaItem): Promise<void> {
    this.broadcastEvent('MEDIA_UPDATED', item);

    if (!isSupabaseConfigured || this.unavailableTables.has('promotion_media')) return;
    try {
      const { error } = await supabase.from('promotion_media').upsert(
        {
          id: item.id,
          title_bn: item.titleBn,
          caption_bn: item.captionBn || null,
          category: item.category,
          image_url: item.imageUrl,
          loan_amount: item.loanAmount ? String(item.loanAmount) : null,
          customer_name: item.customerName || null,
          customer_location: item.customerLocation || null,
          customer_profession: item.customerProfession || null,
          badge_bn: item.badgeBn || null,
          story_bn: item.storyBn || null,
          cta_text_bn: item.ctaTextBn || null,
          cta_link: item.ctaLink || null,
          date: item.date || null,
          display_order: item.order || 0,
          active: item.active !== false,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        this.handlePostgrestError('promotion_media', error);
      }
    } catch (e: any) {
      this.handlePostgrestError('promotion_media', e);
    }
  }

  // 8. Settings & Package helper methods for LoanContext
  public async pushSettings(settings: SiteSettings): Promise<void> {
    await this.syncSettingsToCloud(settings);
  }

  public async syncSettingsToCloud(settings: SiteSettings): Promise<void> {
    this.broadcastEvent('SETTINGS_UPDATED', settings);
    this.onSettingsChangeCallback?.(settings);

    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_settings').upsert(
        {
          id: 'current',
          data: settings,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_settings upsert error:', error);
      }
    } catch (e: any) {
      console.warn('site_settings catch error:', e);
    }
  }

  public async fetchSettingsFromCloud(): Promise<SiteSettings | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_settings').select('*').eq('id', 'current').maybeSingle();
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;
      return (data.data as SiteSettings) || null;
    } catch {
      return null;
    }
  }

  // 8b. Customer Support Real-time Cloud Sync
  public async syncCustomerSupportToCloud(support: CustomerSupportConfig): Promise<void> {
    this.broadcastEvent('CUSTOMER_SUPPORT_UPDATED', support);
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('site_settings').upsert(
        {
          id: 'customer_support',
          data: support,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    } catch (e: any) {
      console.warn('syncCustomerSupportToCloud error:', e);
    }
  }

  public async fetchCustomerSupportFromCloud(): Promise<CustomerSupportConfig | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_settings').select('*').eq('id', 'customer_support').maybeSingle();
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;
      return (data.data as CustomerSupportConfig) || null;
    } catch {
      return null;
    }
  }

  // 8c. Partner Banks Real-time Cloud Sync
  public async syncPartnerBanksToCloud(banks: PartnerBankConfig[]): Promise<void> {
    this.broadcastEvent('PARTNER_BANKS_UPDATED', banks);
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('site_settings').upsert(
        {
          id: 'partner_banks',
          data: banks,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    } catch (e: any) {
      console.warn('syncPartnerBanksToCloud error:', e);
    }
  }

  public async fetchPartnerBanksFromCloud(): Promise<PartnerBankConfig[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_settings').select('*').eq('id', 'partner_banks').maybeSingle();
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;
      return (data.data as PartnerBankConfig[]) || null;
    } catch {
      return null;
    }
  }

  // 8d. Promotion Media Delete & Cloud Fetch
  public async deletePromotionMediaFromCloud(id: string): Promise<void> {
    this.broadcastEvent('MEDIA_UPDATED', { id, _deleted: true });
    if (!isSupabaseConfigured || this.unavailableTables.has('promotion_media')) return;
    try {
      await supabase.from('promotion_media').delete().eq('id', id);
    } catch (e: any) {
      this.handlePostgrestError('promotion_media', e);
    }
  }

  public async fetchPromotionMediaFromCloud(): Promise<PromotionMediaItem[] | null> {
    if (!isSupabaseConfigured || this.unavailableTables.has('promotion_media')) return null;
    try {
      const { data, error } = await supabase
        .from('promotion_media')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => ({
        id: r.id,
        titleBn: r.title_bn,
        captionBn: r.caption_bn,
        category: r.category,
        imageUrl: r.image_url,
        loanAmount: r.loan_amount,
        customerName: r.customer_name,
        customerLocation: r.customer_location,
        customerProfession: r.customer_profession,
        badgeBn: r.badge_bn,
        storyBn: r.story_bn,
        ctaTextBn: r.cta_text_bn,
        ctaLink: r.cta_link,
        date: r.date,
        order: r.display_order,
        active: r.active !== false
      })) as PromotionMediaItem[];
    } catch (e: any) {
      this.handlePostgrestError('promotion_media', e);
      return null;
    }
  }

  // 8e. Cascade User Deletion from Cloud
  public async purgeCustomerFromCloud(phone: string, userId: string, loanIds: string[]): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Customer records were not deleted from the cloud.');
    }

    const targets = Array.from(new Set([phone, userId].filter((value) => Boolean(value?.trim()))));

    if (targets.length === 0) {
      throw new Error('No customer phone number or user ID was provided.');
    }

    // Check Supabase's returned `error` for every operation. Supabase usually
    // returns errors in the response instead of throwing an exception.
    const runDelete = async (table: string, column: string, target: string) => {
      const { error } = await supabase.from(table).delete().eq(column, target);
      if (error) {
        console.error(`Customer purge failed for ${table}.${column}:`, error);
        throw new Error(
          `Could not delete customer data from "${table}": ${error.message || 'Supabase rejected the delete request.'}`
        );
      }
    };

    // Delete related records first, then the user profile. If any request fails,
    // stop and report the failure instead of pretending the full purge succeeded.
    for (const target of targets) {
      try {
        await runDelete('site_loans', 'user_phone', target);
      } catch (e) {
        console.warn('site_loans delete warning:', e);
      }
      try {
        await runDelete('site_deposits', 'user_phone', target);
      } catch (e) {
        console.warn('site_deposits delete warning:', e);
      }
      try {
        await runDelete('site_withdrawals', 'user_phone', target);
      } catch (e) {
        console.warn('site_withdrawals delete warning:', e);
      }
      try {
        await runDelete('site_customer_fixed_deposits', 'user_phone', target);
      } catch (e) {
        console.warn('site_customer_fixed_deposits delete warning:', e);
      }
      try {
        await runDelete('site_contracts', 'user_phone', target);
      } catch (e) {
        console.warn('site_contracts delete warning:', e);
      }
      try {
        await runDelete('withdrawal_conditions', 'user_id', target);
      } catch (e) {
        console.warn('withdrawal_conditions delete warning:', e);
      }
      try {
        await runDelete('customer_messages', 'user_phone', target);
      } catch (e) {
        console.warn('customer_messages delete warning:', e);
      }
    }

    if (loanIds?.length) {
      try {
        await supabase
          .from('site_installments')
          .delete()
          .in('loan_id', loanIds);
      } catch (e) {
        console.warn('site_installments delete warning:', e);
      }
    }

    for (const target of targets) {
      await runDelete('site_users', 'phone', target);
      try {
        await supabase.from('site_purged_users').upsert({
          id: target,
          phone: phone || target,
          purged_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('site_purged_users upsert warning:', e);
      }
    }

    // Notify other tabs/devices only after database deletes succeeded.
    this.broadcastEvent('CUSTOMER_PURGED', { phone, userId, loanIds });
  }

  // 8f. Fetch Purged Users from Cloud
  public async fetchPurgedUsersFromCloud(): Promise<string[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('site_purged_users').select('id, phone');
      if (error || !data) return [];
      const list: string[] = [];
      data.forEach((row: any) => {
        if (row.id) list.push(String(row.id));
        if (row.phone) list.push(String(row.phone));
      });
      return list;
    } catch {
      return [];
    }
  }

  // 9. Payment Methods Cloud Sync
  public async syncPaymentMethodToCloud(method: PaymentMethodConfig): Promise<void> {
    this.broadcastEvent('PAYMENT_METHOD_UPDATED', method);
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_payment_methods').upsert(
        {
          id: method.id,
          data: method,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('site_payment_methods error:', error);
    } catch (e: any) {
      console.warn('site_payment_methods catch error:', e);
    }
  }

  public async deletePaymentMethodFromCloud(id: string): Promise<void> {
    this.broadcastEvent('PAYMENT_METHOD_UPDATED', { id, _deleted: true });
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('site_payment_methods').delete().eq('id', id);
    } catch (e: any) {
      console.warn('site_payment_methods delete error:', e);
    }
  }

  public async fetchPaymentMethodsFromCloud(): Promise<PaymentMethodConfig[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_payment_methods').select('*').order('updated_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => r.data as PaymentMethodConfig).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 10. DPS / Fixed Deposit Schemes Cloud Sync
  public async syncDpsSchemeToCloud(scheme: FixedDepositScheme): Promise<void> {
    this.broadcastEvent('DPS_SCHEME_UPDATED', scheme);
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('site_dps_schemes').upsert(
        {
          id: scheme.id,
          data: scheme,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    } catch (e: any) {
      console.warn('site_dps_schemes error:', e);
    }
  }

  public async deleteDpsSchemeFromCloud(id: string): Promise<void> {
    this.broadcastEvent('DPS_SCHEME_UPDATED', { id, _deleted: true });
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('site_dps_schemes').delete().eq('id', id);
    } catch (e: any) {
      console.warn('site_dps_schemes delete error:', e);
    }
  }

  public async fetchDpsSchemesFromCloud(): Promise<FixedDepositScheme[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_dps_schemes').select('*').order('updated_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => r.data as FixedDepositScheme).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 10b. Customer Fixed Deposits (DPS) Cloud Sync & Realtime
  public async syncCustomerFixedDepositToCloud(deposit: CustomerFixedDeposit): Promise<void> {
    this.broadcastEvent('CUSTOMER_FIXED_DEPOSIT_SUBMITTED', deposit);

    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_customer_fixed_deposits').upsert(
        {
          id: deposit.id,
          user_phone: deposit.phone || deposit.userId,
          data: deposit,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_customer_fixed_deposits upsert error:', error);
      }
    } catch (e: any) {
      console.warn('site_customer_fixed_deposits error:', e);
    }
  }

  public async fetchCustomerFixedDepositsFromCloud(): Promise<CustomerFixedDeposit[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('site_customer_fixed_deposits')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => r.data as CustomerFixedDeposit).filter(Boolean);
    } catch {
      return null;
    }
  }

  // 11. Loan Packages Cloud Sync
  public async pushPackage(pkg: LoanPackage): Promise<void> {
    this.broadcastEvent('PACKAGE_UPDATED', pkg);
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_packages').upsert(
        {
          id: pkg.id,
          data: pkg,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_packages error:', error);
      }
    } catch (e: any) {
      console.warn('site_packages catch error:', e);
    }
  }

  public async fetchPackagesFromCloud(): Promise<LoanPackage[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const query = supabase.from('site_packages').select('*').order('updated_at', { ascending: false });
      const { data, error }: any = await withQueryTimeout(query, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => {
        const p = r.data || {};
        return {
          ...p,
          id: p.id || r.id,
          nameBn: p.nameBn || p.name || 'লোন প্যাকেজ',
          nameEn: p.nameEn || p.nameBn || 'Loan Package',
          defaultRate: Number(p.defaultRate ?? p.interestRate ?? 2.0),
          minAmount: Number(p.minAmount ?? 20000),
          maxAmount: Number(p.maxAmount ?? 5000000),
          minDurationMonths: Number(p.minDurationMonths ?? p.minMonths ?? 3),
          maxDurationMonths: Number(p.maxDurationMonths ?? p.maxMonths ?? 60),
          processingFeePercent: Number(p.processingFeePercent ?? 0.5),
          active: p.active !== false
        } as LoanPackage;
      }).filter(Boolean);
    } catch {
      return null;
    }
  }

  public async deletePackage(id: string): Promise<void> {
    this.broadcastEvent('PACKAGE_UPDATED', { id, _deleted: true });
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_packages').delete().eq('id', id);
      if (error) {
        console.warn('site_packages delete error:', error);
      }
    } catch (e: any) {
      console.warn('site_packages catch error:', e);
    }
  }

  public async pushStaffCard(card: StaffIdCard): Promise<void> {
    this.broadcastEvent('STAFF_CARD_UPDATED', card);
  }

  public async deleteStaffCard(id: string): Promise<void> {
    this.broadcastEvent('STAFF_CARD_DELETED', { id });
  }

  // --- Site Contracts (Official Legal Agreements) Sync ---
  public async syncContractToCloud(paper: any): Promise<void> {
    if (!paper) return;
    this.broadcastEvent('CONTRACT_UPDATED', paper);
    if (!isSupabaseConfigured) return;
    try {
      const contractId = String(paper.id || paper.loanId ? `ctr-${paper.loanId}` : `ctr-${Date.now()}`);
      const loanId = paper.loanId ? String(paper.loanId) : null;
      const userPhone = paper.phone || paper.userPhone ? String(paper.phone || paper.userPhone) : null;
      const status = paper.status ? String(paper.status) : 'sent';

      const { error } = await supabase.from('site_contracts').upsert(
        {
          id: contractId,
          loan_id: loanId,
          user_phone: userPhone,
          data: paper,
          status: status,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('site_contracts sync error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }
    } catch (e: any) {
      console.warn('site_contracts catch error:', e?.message || e);
    }
  }

  public async deleteContractFromCloud(id: string): Promise<void> {
    this.broadcastEvent('CONTRACT_DELETED', { id });
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('site_contracts').delete().eq('id', id);
      if (error) console.warn('site_contracts delete error:', error);
    } catch (e: any) {
      console.warn('site_contracts catch delete error:', e);
    }
  }

  public async fetchContractsFromCloud(userPhone?: string): Promise<any[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      let q = supabase.from('site_contracts').select('*').order('updated_at', { ascending: false });
      if (userPhone) {
        q = q.eq('user_phone', userPhone);
      }
      const { data, error }: any = await withQueryTimeout(q, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;
      return data.map((r: any) => {
        const item = r.data || {};
        return {
          ...item,
          id: r.id || item.id,
          loanId: r.loan_id || item.loanId,
          phone: r.user_phone || item.phone,
          status: r.status || item.status || 'sent'
        };
      });
    } catch {
      return null;
    }
  }

  // --- Virtual Cards System (Requests & Issues) Sync ---
  public async requestVirtualCardInCloud(userPhone: string, customerName: string): Promise<any> {
    const cardPayload = {
      id: `card-${Date.now()}`,
      user_phone: userPhone,
      customer_name: customerName,
      status: 'pending',
      card_number: null,
      cardholder_name: customerName,
      expiry_date: null,
      cvv: null,
      card_type: 'DBS Platinum Virtual',
      spending_limit: 100000,
      balance: 0,
      requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.broadcastEvent('VIRTUAL_CARD_REQUESTED', cardPayload);
    if (!isSupabaseConfigured) return cardPayload;
    try {
      const { data: existing } = await supabase
        .from('virtual_cards')
        .select('id')
        .eq('user_phone', userPhone)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('virtual_cards')
          .update({
            status: 'pending',
            customer_name: customerName,
            cardholder_name: customerName,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) console.warn('virtual_cards update error:', error);
        return data || cardPayload;
      } else {
        const { data, error } = await supabase
          .from('virtual_cards')
          .insert(cardPayload)
          .select()
          .single();
        if (error) console.warn('virtual_cards insert error:', error);
        return data || cardPayload;
      }
    } catch (e) {
      console.warn('requestVirtualCard catch error:', e);
      return cardPayload;
    }
  }

  public async issueAndSendVirtualCardInCloud(cardData: {
    id?: string;
    user_phone: string;
    customer_name: string;
    card_number: string;
    cardholder_name: string;
    expiry_date: string;
    cvv: string;
    card_type?: string;
    spending_limit?: number;
    balance?: number;
  }): Promise<any> {
    const payload = {
      ...cardData,
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.broadcastEvent('VIRTUAL_CARD_UPDATED', payload);
    if (!isSupabaseConfigured) return payload;
    try {
      let resData = null;
      if (cardData.id) {
        const { data, error } = await supabase
          .from('virtual_cards')
          .update(payload)
          .eq('id', cardData.id)
          .select()
          .single();
        if (!error) resData = data;
      } else {
        const { data, error } = await supabase
          .from('virtual_cards')
          .upsert(payload, { onConflict: 'user_phone' })
          .select()
          .single();
        if (!error) resData = data;
      }
      return resData || payload;
    } catch (e) {
      console.warn('issueAndSendVirtualCard catch error:', e);
      return payload;
    }
  }

  public async fetchVirtualCardsFromCloud(userPhone?: string): Promise<any[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      let q = supabase.from('virtual_cards').select('*').order('updated_at', { ascending: false });
      if (userPhone) {
        q = q.eq('user_phone', userPhone);
      }
      const { data, error }: any = await withQueryTimeout(q, 2500, { data: null, error: { message: 'timeout', details: '', hint: '', code: 'TIMEOUT' } as any });
      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  }

  public async deleteVirtualCardFromCloud(id: string): Promise<void> {
    this.broadcastEvent('VIRTUAL_CARD_DELETED', { id });
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('virtual_cards').delete().eq('id', id);
    } catch (e) {
      console.warn('deleteVirtualCard error:', e);
    }
  }
}

export const supabaseSync = new SupabaseSyncService();