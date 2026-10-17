import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { 
  Home, 
  Layers, 
  FileText, 
  Wallet, 
  Headphones, 
  User,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { formatTaka } from '@/services/storage';
import { CustomerSupportModal } from '@/components/common/CustomerSupportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';


import { useLanguage } from '@/contexts/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, walletBalance } = useLoan();
  const { language } = useLanguage();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);

  const navItems = [
    {
      name: language === 'en' ? 'Home' : 'হোম',
      path: '/',
      icon: Home
    },
    {
      name: language === 'en' ? 'Packages' : 'প্যাকেজ',
      path: '/packages',
      icon: Layers
    },
    {
      name: language === 'en' ? 'Apply' : 'আবেদন',
      path: '/apply',
      icon: FileText
    },
    currentUser
      ? {
          name: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
          path: '/dashboard',
          icon: Wallet,
          badge: walletBalance > 0 ? formatTaka(walletBalance) : null
        }
      : {
          name: language === 'en' ? 'Login' : 'লগইন',
          path: '/login',
          icon: User,
          badge: null
        }
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-bottom">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center h-full transition-colors relative py-1 ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-primary' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-primary text-primary-foreground text-[8px] font-extrabold whitespace-nowrap shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 leading-none tracking-tight ${isActive ? 'font-bold text-primary' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Support Tab opens clean Dedicated Options Modal */}
          <button
            type="button"
            onClick={() => setSupportMenuOpen(true)}
            className="flex flex-col items-center justify-center h-full transition-colors text-muted-foreground hover:text-primary active:scale-95 py-1"
          >
            <div className="relative">
              <Headphones className="w-5 h-5 text-accent" />
              <span className="w-2 h-2 rounded-full bg-accent absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span className="text-[10px] mt-1 leading-none tracking-tight text-accent font-bold">
              {language === 'en' ? 'Support' : 'সাপোর্ট'}
            </span>
          </button>
        </div>
      </div>

      {/* Support Selection Modal for Mobile */}
      <Dialog open={supportMenuOpen} onOpenChange={setSupportMenuOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md p-5 rounded-2xl">
          <DialogHeader className="text-left pb-2 border-b">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              কাস্টমার সাপোর্ট ও হেল্পডেস্ক
            </DialogTitle>
            <DialogDescription className="text-xs">
              আপনার প্রয়োজনীয় সহায়তা পেতে নিচের উপযুক্ত মাধ্যম নির্বাচন করুন:
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setSupportMenuOpen(false);
                navigate('/messages');
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  লাইভ চ্যাট ও ভয়েস মেসেজ
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">অনলাইন</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  এডমিন ও সাপোর্ট টিমের সাথে সরাসরি টেক্সট বা ভয়েস মেসেজে কথা বলুন
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportMenuOpen(false);
                setSupportModalOpen(true);
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0 border">
                <PhoneCall className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  হোয়াটসঅ্যাপ, ইমো ও হেল্পলাইন
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  অফিসিয়াল হটলাইন নম্বর ও সরাসরি মেসেঞ্জারে যোগাযোগ করুন
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerSupportModal open={supportModalOpen} onOpenChange={setSupportModalOpen} />
    </>
  );
};
