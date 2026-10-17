import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const CustomerLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full bg-gradient-to-br from-[#EEF2F6] via-[#F4F7FB] to-[#E9EFF6] text-foreground pb-24 md:pb-0 relative selection:bg-primary/20 overflow-x-clip">
      {/* Subtle luxury ambient tint */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[320px] bg-gradient-to-b from-primary/6 via-accent/4 to-transparent blur-3xl pointer-events-none z-0" />
      <Header />
      <main className="flex-1 w-full min-w-0 max-w-full relative z-10">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
