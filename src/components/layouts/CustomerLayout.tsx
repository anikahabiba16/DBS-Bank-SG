import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const CustomerLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';

  return (
    <div className={`flex flex-col min-h-screen w-full max-w-full bg-gradient-to-br from-[#EEF2F6] via-[#F4F7FB] to-[#E9EFF6] text-foreground ${isMessagesPage ? 'pb-0 h-[100dvh] max-h-[100dvh] overflow-hidden fixed inset-0' : 'pb-24 md:pb-0'} relative selection:bg-primary/20 overflow-x-clip`}>
      {/* Subtle luxury ambient tint */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[320px] bg-gradient-to-b from-primary/6 via-accent/4 to-transparent blur-3xl pointer-events-none z-0" />
      <Header />
      <main className={`flex-1 w-full min-w-0 max-w-full relative z-10 ${isMessagesPage ? 'flex flex-col h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] min-h-0 overflow-hidden' : ''}`}>{children}</main>
      {!isMessagesPage && <Footer />}
      {!isMessagesPage && <MobileBottomNav />}
    </div>
  );
};
