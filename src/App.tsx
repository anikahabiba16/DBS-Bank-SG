import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { LoanProvider } from '@/contexts/LoanContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FloatingChatButton } from '@/components/common/FloatingChatButton';
import { PwaInstallPrompt, PwaFloatingInstallButton } from '@/components/common/PwaInstallPrompt';
import { RouteLoadingScreen } from '@/components/common/AnimatedPage';

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



/** Inner shell — needs to be inside Router so useLocation works */
const AppShell: React.FC = () => {
  // Kick off prefetching once after mount
  useEffect(() => {
    prefetchAllLazyRoutes();
  }, []);

  return (
    <RouteLoadingScreen>
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <FloatingChatButton />
      <PwaInstallPrompt />
      <PwaFloatingInstallButton />
      <Toaster position="top-right" richColors />
    </RouteLoadingScreen>
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
