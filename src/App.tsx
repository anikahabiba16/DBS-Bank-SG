import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { LoanProvider } from '@/contexts/LoanContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FloatingChatButton } from '@/components/common/FloatingChatButton';
import { PwaInstallPrompt, PwaFloatingInstallButton } from '@/components/common/PwaInstallPrompt';
import { AnimatePresence, motion } from 'motion/react';

import { routes } from './routes';

// Prefetch all lazy-loaded admin/customer page chunks during idle time
// so subsequent navigations feel instant (no network wait on first visit)
const prefetchAllLazyRoutes = () => {
  const idle = (typeof window !== 'undefined' && 'requestIdleCallback' in window)
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 200);

  idle(() => {
    // Customer protected pages
    import('./pages/CustomerDashboardPage').catch(() => {});
    import('./pages/CustomerMessagesPage').catch(() => {});
  });

  idle(() => {
    // Admin pages — chunked into separate idle callbacks to avoid blocking
    import('./pages/admin/AdminDashboardPage').catch(() => {});
    import('./pages/admin/AdminApplicationsPage').catch(() => {});
    import('./pages/admin/AdminCustomersPage').catch(() => {});
  });

  idle(() => {
    import('./pages/admin/AdminDepositsPage').catch(() => {});
    import('./pages/admin/AdminWalletsPage').catch(() => {});
    import('./pages/admin/AdminWithdrawalsPage').catch(() => {});
    import('./pages/admin/AdminMessagesPage').catch(() => {});
  });

  idle(() => {
    import('./pages/admin/AdminPackagesPage').catch(() => {});
    import('./pages/admin/AdminInstallmentsPage').catch(() => {});
    import('./pages/admin/AdminSettingsPage').catch(() => {});
    import('./pages/admin/AdminNotificationsPage').catch(() => {});
  });

  idle(() => {
    import('./pages/admin/AdminLettersPage').catch(() => {});
    import('./pages/admin/AdminContractsPage').catch(() => {});
    import('./pages/admin/AdminSupportPartnersPage').catch(() => {});
    import('./pages/admin/AdminOfficialDocumentGeneratorPage').catch(() => {});
    import('./pages/admin/AdminStaffIdCardsPage').catch(() => {});
    import('./pages/admin/AdminMediaGalleryPage').catch(() => {});
    import('./pages/admin/AdminVirtualCardsPage').catch(() => {});
    import('./pages/admin/AdminSubAdminsPage').catch(() => {});
  });
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

/** Inner shell — needs to be inside Router so useLocation works */
const AppShell: React.FC = () => {
  const location = useLocation();

  // Kick off prefetching once after mount
  useEffect(() => {
    prefetchAllLazyRoutes();
  }, []);

  return (
    <>
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Routes location={location}>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingChatButton />
      <PwaInstallPrompt />
      <PwaFloatingInstallButton />
      <Toaster position="top-right" richColors />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <LoanProvider>
          <AppShell />
        </LoanProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
