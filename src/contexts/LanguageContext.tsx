import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translateTextToEnglish } from '@/services/bilingualTranslations';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const DICTIONARY: Record<string, { bn: string; en: string }> = {
  // Navigation
  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.packages': { bn: 'লোন প্যাকেজসমূহ', en: 'Loan Packages' },
  'nav.apply': { bn: 'আবেদন করুন', en: 'Apply Now' },
  'nav.track': { bn: 'স্ট্যাটাস ট্র্যাকিং', en: 'Track Status' },
  'nav.dashboard': { bn: 'ড্যাশবোর্ড ও ওয়ালেট', en: 'Dashboard & Wallet' },
  'nav.login': { bn: 'লগইন', en: 'Login' },
  'nav.register': { bn: 'রেজিস্ট্রেশন', en: 'Register' },
  'nav.logout': { bn: 'লগআউট', en: 'Logout' },
  'nav.support': { bn: 'মেসেজ ও সাপোর্ট', en: 'Messages & Support' },

  // Admin Navigation
  'admin.nav.dashboard': { bn: 'ড্যাশবোর্ড ওভারভিউ', en: 'Dashboard Overview' },
  'admin.nav.applications': { bn: 'সকল লোন আবেদন', en: 'All Loan Applications' },
  'admin.nav.withdrawals': { bn: 'উত্তোলন ও উইথড্রল', en: 'Withdrawal Requests' },
  'admin.nav.deposits': { bn: 'ডিপোজিট ও রিচার্জ', en: 'Deposits & Recharge' },
  'admin.nav.fixedDeposits': { bn: 'ফিক্সড ডিপোজিট তালিকা', en: 'Fixed Deposit List' },
  'admin.nav.customers': { bn: 'গ্রাহক ও ইউজার তালিকা', en: 'Customers & Users' },
  'admin.nav.messages': { bn: 'মেসেজ হাব ও লাইভ সাপোর্ট', en: 'Message Hub & Live Support' },
  'admin.nav.packages': { bn: 'লোন প্যাকেজ এডিটর', en: 'Loan Package Editor' },
  'admin.nav.paymentMethods': { bn: 'পেমেন্ট গেটওয়ে ও নম্বর', en: 'Payment Gateways & Numbers' },
  'admin.nav.officialDocs': { bn: 'অফিসিয়াল ডকুমেন্ট জেনারেটর', en: 'Official Document Generator' },
  'admin.nav.contracts': { bn: 'আইনি লোন চুক্তিপত্র', en: 'Legal Loan Contracts' },
  'admin.nav.siteSettings': { bn: 'সাইট কনটেন্ট ও সেটিংস', en: 'Site Content & Settings' },
  'admin.nav.liveSite': { bn: 'মূল ওয়েবসাইটে যান', en: 'View Main Website' },
  'admin.security': { bn: 'অ্যাডমিন সিকিউরিটি প্যানেল', en: 'Admin Security Panel' },

  // Common UI
  'common.search': { bn: 'অনুসন্ধান করুন...', en: 'Search...' },
  'common.submit': { bn: 'জমা দিন', en: 'Submit' },
  'common.save': { bn: 'সংরক্ষণ করুন', en: 'Save Changes' },
  'common.cancel': { bn: 'বাতিল', en: 'Cancel' },
  'common.status': { bn: 'অবস্থা', en: 'Status' },
  'common.actions': { bn: 'অ্যাকশন', en: 'Actions' },
  'common.date': { bn: 'তারিখ', en: 'Date' },
  'common.amount': { bn: 'পরিমাণ', en: 'Amount' },
  'common.customer': { bn: 'গ্রাহক', en: 'Customer' },
  'common.phone': { bn: 'মোবাইল নম্বর', en: 'Phone Number' },
  'common.password': { bn: 'পাসওয়ার্ড', en: 'Password' },
  'common.email': { bn: 'ইমেইল', en: 'Email' },
  'common.loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  'common.success': { bn: 'সফল হয়েছে', en: 'Success' },
  'common.error': { bn: 'সমস্যা হয়েছে', en: 'Error' },

  // Auth
  'auth.loginTitle': { bn: 'গ্রাহক পোর্টাল লগইন', en: 'Customer Portal Login' },
  'auth.registerTitle': { bn: 'নতুন একাউন্ট নিবন্ধন', en: 'Create New Account' },
  'auth.loginBtn': { bn: 'লগইন করুন', en: 'Sign In' },
  'auth.registerBtn': { bn: 'নিবন্ধন সম্পন্ন করুন', en: 'Register Now' },
  'auth.needAccount': { bn: 'একাউন্ট নেই? নতুন একাউন্ট খুলুন', en: "Don't have an account? Sign up" },
  'auth.haveAccount': { bn: 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন', en: 'Already have an account? Sign in' },
  'auth.passwordPlaceholder': { bn: 'আপনার গোপন পাসওয়ার্ড দিন', en: 'Enter your password' },

  // Messages
  'msg.supportTitle': { bn: 'মেসেজ ও লাইভ সাপোর্ট', en: 'Messages & Live Support' },
  'msg.writePlaceholder': { bn: 'আপনার বার্তা বা সমস্যার বিবরণ লিখুন...', en: 'Write your message or inquiry...' },
  'msg.send': { bn: 'পাঠান', en: 'Send' },
  'msg.voiceRecord': { bn: 'ভয়েস রেকর্ড করুন', en: 'Record Voice' },
  'msg.voiceRecording': { bn: 'রেকর্ডিং হচ্ছে... (ক্লিক করে থামান)', en: 'Recording... (Click to stop)' },
  'msg.selectCustomer': { bn: 'গ্রাহক নির্বাচন করুন', en: 'Select a Customer' },
  'msg.noMessages': { bn: 'এখনো কোনো মেসেজ নেই', en: 'No messages yet' },
  'msg.admin': { bn: 'DBS Bank SG সাপোর্ট টিম', en: 'DBS Bank SG Support Team' },
  'msg.you': { bn: 'আপনি', en: 'You' },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

// Cache for original Bengali texts to restore on switch back to 'bn'
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

function translateTextNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return;
  const tag = parent.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'code') return;
  if (parent.getAttribute('contenteditable') === 'true') return;

  const val = node.nodeValue;
  if (!val || !/[\u0980-\u09FF]/.test(val)) return;

  if (!originalTextMap.has(node)) {
    originalTextMap.set(node, val);
  }
  const translated = translateTextToEnglish(val);
  if (translated !== val) {
    node.nodeValue = translated;
  }
}

function translateElementAttributes(el: Element) {
  const attrs = ['placeholder', 'title', 'aria-label'];
  for (const attr of attrs) {
    const val = el.getAttribute(attr);
    if (val && /[\u0980-\u09FF]/.test(val)) {
      if (!originalAttrMap.has(el)) {
        originalAttrMap.set(el, {});
      }
      const map = originalAttrMap.get(el)!;
      if (!(attr in map)) {
        map[attr] = val;
      }
      el.setAttribute(attr, translateTextToEnglish(val));
    }
  }
}

function translateSubtree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }
  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributes(root as Element);
  }

  // Use TreeWalker to reliably visit every single text node in this subtree
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();
    while (currentNode) {
      translateTextNode(currentNode);
      currentNode = walker.nextNode();
    }

    // Also visit element nodes for attributes
    if (root instanceof Element) {
      const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
      let curEl = elWalker.nextNode();
      while (curEl) {
        if (curEl instanceof Element) {
          translateElementAttributes(curEl);
        }
        curEl = elWalker.nextNode();
      }
    }
  } catch (err) {
    // Fallback if TreeWalker fails
  }
}

function restoreSubtree(root: Node) {
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (originalTextMap.has(currentNode)) {
        const orig = originalTextMap.get(currentNode);
        if (orig !== undefined && currentNode.nodeValue !== orig) {
          currentNode.nodeValue = orig;
        }
      }
      currentNode = walker.nextNode();
    }

    if (root instanceof Element) {
      const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
      let curEl = elWalker.nextNode();
      while (curEl) {
        if (curEl instanceof Element && originalAttrMap.has(curEl)) {
          const map = originalAttrMap.get(curEl)!;
          for (const [attr, origVal] of Object.entries(map)) {
            curEl.setAttribute(attr, origVal);
          }
        }
        curEl = elWalker.nextNode();
      }
    }
  } catch (err) {}
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && (window as any).__APP_LANGUAGE__) {
      return (window as any).__APP_LANGUAGE__;
    }
    return 'bn';
  });

  const observerRef = useRef<MutationObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      (window as any).__APP_LANGUAGE__ = lang;
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('app_language_changed', { detail: { language: lang } }));
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = DICTIONARY[key];
    if (entry) {
      return entry[language] || defaultText || key;
    }
    if (language === 'en') {
      return translateTextToEnglish(defaultText || key);
    }
    return defaultText || key;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).__APP_LANGUAGE__ = language;
    document.documentElement.lang = language;

    // Cancel any in-flight work from a previous language switch
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (idleHandleRef.current !== null) { clearTimeout(idleHandleRef.current); idleHandleRef.current = null; }

    if (language === 'en') {
      // ── Phase 1: Collect all Bengali-containing nodes ────────────────────────
      const nodesToProcess: Node[] = [];

      if (document.body) {
        // Text nodes
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            const p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            const tag = p.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'textarea') return NodeFilter.FILTER_REJECT;
            return /[\u0980-\u09FF]/.test(node.nodeValue || '')
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP;
          },
        });
        let n = tw.nextNode();
        while (n) { nodesToProcess.push(n); n = tw.nextNode(); }

        // Element attribute nodes
        const ew = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
          acceptNode(el) {
            const tag = (el as Element).tagName.toLowerCase();
            if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
            return ['placeholder', 'title', 'aria-label'].some(
              (a) => /[\u0980-\u09FF]/.test((el as Element).getAttribute(a) || '')
            )
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP;
          },
        });
        let e = ew.nextNode();
        while (e) { nodesToProcess.push(e); e = ew.nextNode(); }
      }

      // ── Phase 2: Process in idle-time chunks (60 nodes / chunk ≈ <5ms each) ─
      const CHUNK = 60;
      let idx = 0;

      const processChunk = () => {
        idleHandleRef.current = null;
        if ((window as any).__APP_LANGUAGE__ !== 'en') return; // language changed mid-flight

        const end = Math.min(idx + CHUNK, nodesToProcess.length);
        for (let i = idx; i < end; i++) {
          const nd = nodesToProcess[i];
          if (!nd.isConnected) continue;
          if (nd.nodeType === Node.TEXT_NODE) translateTextNode(nd);
          else if (nd.nodeType === Node.ELEMENT_NODE) translateElementAttributes(nd as Element);
        }
        idx = end;

        if (idx < nodesToProcess.length) {
          idleHandleRef.current = setTimeout(processChunk, 0);
        } else {
          setupObserver();
        }
      };

      if (nodesToProcess.length > 0) {
        idleHandleRef.current = setTimeout(processChunk, 0);
      } else {
        setupObserver();
      }

      // ── Phase 3: MutationObserver for incremental changes ────────────────────
      function setupObserver() {
        if ((window as any).__APP_LANGUAGE__ !== 'en' || !document.body) return;

        const pending = new Set<Node>();
        let rafScheduled = false;

        const observerOpts: MutationObserverInit = {
          childList: true, subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['placeholder', 'title', 'aria-label'],
        };

        const flush = () => {
          rafScheduled = false;
          if (!pending.size) return;
          obs.disconnect();
          try {
            for (const node of pending) {
              if (!node.isConnected) continue;
              if (node.nodeType === Node.TEXT_NODE) {
                translateTextNode(node);
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                translateElementAttributes(node as Element);
                // Only walk direct text children of the added element, not deep subtrees
                const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
                let c = tw.nextNode();
                while (c) { translateTextNode(c); c = tw.nextNode(); }
              }
            }
          } finally {
            pending.clear();
            if (document.body && (window as any).__APP_LANGUAGE__ === 'en') {
              obs.observe(document.body, observerOpts);
            }
          }
        };

        const obs = new MutationObserver((mutations) => {
          for (const mut of mutations) {
            if (mut.type === 'childList') {
              for (let i = 0; i < mut.addedNodes.length; i++) {
                const nd = mut.addedNodes[i];
                if (nd.nodeType === Node.TEXT_NODE && /[\u0980-\u09FF]/.test(nd.nodeValue || '')) {
                  pending.add(nd);
                } else if (nd.nodeType === Node.ELEMENT_NODE && /[\u0980-\u09FF]/.test((nd as Element).textContent || '')) {
                  pending.add(nd);
                }
              }
            } else if (mut.type === 'characterData') {
              if (mut.target && /[\u0980-\u09FF]/.test(mut.target.nodeValue || '')) {
                pending.add(mut.target);
              }
            } else if (mut.type === 'attributes' && mut.target instanceof Element) {
              const v = mut.target.getAttribute(mut.attributeName!) || '';
              if (/[\u0980-\u09FF]/.test(v)) {
                // Translate attribute immediately (no RAF needed, no subtree walk)
                obs.disconnect();
                translateElementAttributes(mut.target);
                if (document.body && (window as any).__APP_LANGUAGE__ === 'en') {
                  obs.observe(document.body, observerOpts);
                }
              }
            }
          }
          if (pending.size > 0 && !rafScheduled) {
            rafScheduled = true;
            rafRef.current = requestAnimationFrame(flush);
          }
        });

        obs.observe(document.body!, observerOpts);
        observerRef.current = obs;
      }
    } else {
      // ── Restore Bengali ──────────────────────────────────────────────────────
      if (document.body) restoreSubtree(document.body);
    }

    return () => {
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (idleHandleRef.current !== null) { clearTimeout(idleHandleRef.current); idleHandleRef.current = null; }
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
