import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteLoadingScreen
 * 
 * Shows a full-screen premium DBS Bank branded loading overlay for ~1 second
 * on every route change. Uses a progress bar + logo + tagline.
 */

const LOGO_URL =
  'https://miaoda-conversation-file.s3cdn.medo.dev/user-f41zuf58vw1s/app-f421pi7auvb5/20261015/image_1792085759107.png';

// Route-based contextual messages
const routeMessages: Record<string, { title: string; sub: string }> = {
  '/':               { title: 'DBS Bank SG',         sub: 'আপনাকে স্বাগতম' },
  '/packages':       { title: 'লোন প্যাকেজসমূহ',     sub: 'সেরা অফার লোড হচ্ছে…' },
  '/calculator':     { title: 'লোন ক্যালকুলেটর',     sub: 'হিসাব নিকাশ প্রস্তুত হচ্ছে…' },
  '/apply':          { title: 'লোন আবেদন',             sub: 'আবেদন ফর্ম লোড হচ্ছে…' },
  '/track':          { title: 'আবেদন ট্র্যাকিং',      sub: 'তথ্য যাচাই হচ্ছে…' },
  '/login':          { title: 'লগইন',                  sub: 'নিরাপদ প্রবেশ প্রস্তুত হচ্ছে…' },
  '/register':       { title: 'নিবন্ধন',               sub: 'অ্যাকাউন্ট তৈরি হচ্ছে…' },
  '/dashboard':      { title: 'আমার ড্যাশবোর্ড',      sub: 'অ্যাকাউন্ট তথ্য লোড হচ্ছে…' },
  '/wallet':         { title: 'ওয়ালেট',               sub: 'ব্যালেন্স লোড হচ্ছে…' },
  '/messages':       { title: 'সাপোর্ট মেসেজ',        sub: 'বার্তা লোড হচ্ছে…' },
  '/admin':          { title: 'Admin Panel',           sub: 'Dashboard লোড হচ্ছে…' },
  '/admin/applications': { title: 'লোন আবেদনসমূহ',   sub: 'সকল আবেদন লোড হচ্ছে…' },
  '/admin/customers':    { title: 'গ্রাহক তালিকা',    sub: 'গ্রাহক ডেটা লোড হচ্ছে…' },
  '/admin/deposits':     { title: 'ডিপোজিট',          sub: 'পেমেন্ট তথ্য লোড হচ্ছে…' },
  '/admin/wallets':      { title: 'ওয়ালেট কন্ট্রোল', sub: 'ব্যালেন্স তথ্য লোড হচ্ছে…' },
  '/admin/withdrawals':  { title: 'উইথড্রয়াল',       sub: 'রিকোয়েস্ট তালিকা লোড হচ্ছে…' },
  '/admin/messages':     { title: 'লাইভ চ্যাট হাব',  sub: 'বার্তা সিস্টেম সংযুক্ত হচ্ছে…' },
  '/admin/settings':     { title: 'সাইট সেটিংস',     sub: 'কনফিগারেশন লোড হচ্ছে…' },
};

const getRouteInfo = (pathname: string) => {
  // Exact match first
  if (routeMessages[pathname]) return routeMessages[pathname];
  // Prefix match for dynamic admin routes
  const prefix = Object.keys(routeMessages)
    .filter(k => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? routeMessages[prefix] : { title: 'DBS Bank SG', sub: 'লোড হচ্ছে…' };
};

interface Props {
  children: React.ReactNode;
}

export const RouteLoadingScreen: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [routeInfo, setRouteInfo] = useState(getRouteInfo(location.pathname));
  const [fadeOut, setFadeOut] = useState(false);

  // Track previous path so we don't trigger on mount
  const prevPath = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  useEffect(() => {
    // Skip first render (initial page load)
    if (prevPath.current === null) {
      prevPath.current = location.pathname;
      return;
    }

    // Same path — ignore
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    clearTimers();

    setRouteInfo(getRouteInfo(location.pathname));
    setProgress(0);
    setFadeOut(false);
    setVisible(true);

    // Animate progress bar: 0 → 90% over 700ms, then jump to 100%
    const startTime = Date.now();
    const duration = 700;
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(90, (elapsed / duration) * 90);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(progressRef.current!);
        setProgress(100);
      }
    }, 16);

    // After 1 second total: fade out, then hide
    timerRef.current = setTimeout(() => {
      setFadeOut(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 320); // match CSS transition duration
    }, 1000);

    return clearTimers;
  }, [location.pathname, clearTimers]);

  return (
    <>
      {/* Loading overlay */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #0c1a2e 0%, #0f2744 40%, #0a1e38 70%, #061629 100%)',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: fadeOut ? 'none' : 'all',
          }}
        >
          {/* Ambient glow orbs */}
          <div style={{
            position: 'absolute', top: '15%', left: '20%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2,132,199,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', right: '15%',
            width: 240, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none',
          }} />

          {/* Card container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            padding: '48px 40px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(2,132,199,0.1) inset',
            minWidth: 280,
            position: 'relative',
          }}>

            {/* Logo */}
            <div style={{
              width: 72, height: 72,
              borderRadius: 18,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 6,
              boxShadow: '0 0 0 1px rgba(2,132,199,0.3), 0 0 32px rgba(2,132,199,0.25), 0 8px 24px rgba(0,0,0,0.4)',
              animation: 'dbs-pulse 2s ease-in-out infinite',
            }}>
              <img
                src={LOGO_URL}
                alt="DBS Bank SG"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </div>

            {/* Bank name + page label */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{
                fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1.2,
              }}>
                {routeInfo.title}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.9)', fontWeight: 500, letterSpacing: '0.01em' }}>
                {routeInfo.sub}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: 4,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 999,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #0284c7, #38bdf8, #7dd3fc)',
                transition: 'width 0.08s linear',
                boxShadow: '0 0 12px rgba(56,189,248,0.6)',
                position: 'relative',
              }}>
                {/* Shimmer on progress bar */}
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 40, height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  animation: 'dbs-shimmer 0.9s ease-in-out infinite',
                }} />
              </div>
            </div>

            {/* Bottom tagline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                animation: 'dbs-blink 1.2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 11, color: 'rgba(100,116,139,0.9)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                Secure Banking • DBS SG
              </span>
            </div>
          </div>

          {/* CSS keyframes */}
          <style>{`
            @keyframes dbs-pulse {
              0%, 100% { box-shadow: 0 0 0 1px rgba(2,132,199,0.3), 0 0 28px rgba(2,132,199,0.2), 0 8px 24px rgba(0,0,0,0.4); }
              50%       { box-shadow: 0 0 0 1px rgba(2,132,199,0.5), 0 0 48px rgba(2,132,199,0.4), 0 8px 24px rgba(0,0,0,0.4); }
            }
            @keyframes dbs-shimmer {
              0%   { transform: translateX(-40px); opacity: 0; }
              40%  { opacity: 1; }
              100% { transform: translateX(40px); opacity: 0; }
            }
            @keyframes dbs-blink {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.3; }
            }
          `}</style>
        </div>
      )}

      {/* Actual page content always rendered underneath */}
      {children}
    </>
  );
};
