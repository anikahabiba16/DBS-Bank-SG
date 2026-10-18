import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { LoanProvider } from '@/contexts/LoanContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FloatingChatButton } from '@/components/common/FloatingChatButton';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { routes } from './routes';



/** Inner shell — needs to be inside Router so useLocation works */
const AppShell: React.FC = () => {
  return (
    <>
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
