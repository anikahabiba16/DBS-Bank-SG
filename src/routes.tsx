import React, { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerAuthGuard } from '@/components/auth/CustomerAuthGuard';

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 gap-3">
    <div className="w-9 h-9 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    <span className="text-xs font-semibold text-muted-foreground animate-pulse">লোড হচ্ছে...</span>
  </div>
);

const withSuspense = (Component: React.ComponentType) => <Component />;

import { HomePage } from './pages/HomePage';
import { PackagesPage } from './pages/PackagesPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ApplyPage } from './pages/ApplyPage';
import { TrackPage } from './pages/TrackPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import CustomerMessagesPage from './pages/CustomerMessagesPage';

// Admin Pages - Direct imported for 100% instant navigation & zero chunk loading errors
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminPackagesPage } from './pages/admin/AdminPackagesPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminInstallmentsPage } from './pages/admin/AdminInstallmentsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminWalletsPage } from './pages/admin/AdminWalletsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminLettersPage } from './pages/admin/AdminLettersPage';
import { AdminDepositsPage } from './pages/admin/AdminDepositsPage';
import { AdminContractsPage } from './pages/admin/AdminContractsPage';
import { AdminSupportPartnersPage } from './pages/admin/AdminSupportPartnersPage';
import { AdminOfficialDocumentGeneratorPage } from './pages/admin/AdminOfficialDocumentGeneratorPage';
import { AdminStaffIdCardsPage } from './pages/admin/AdminStaffIdCardsPage';
import { AdminMediaGalleryPage } from './pages/admin/AdminMediaGalleryPage';
import { AdminVirtualCardsPage } from './pages/admin/AdminVirtualCardsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSubAdminsPage from './pages/admin/AdminSubAdminsPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

const RootEntryRoute: React.FC = () => {
  const { currentUser } = useLoan();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
};

export const routes: RouteConfig[] = [
  // Site Entry: If logged in -> HomePage, If NOT logged in -> Login / Registration
  {
    name: 'হোমপেজ / লগইন',
    path: '/',
    element: <RootEntryRoute />,
    public: true,
  },
  {
    name: 'গ্রাহক লগইন',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'গ্রাহক নিবন্ধন',
    path: '/register',
    element: <RegisterPage />,
    public: true,
  },

  // Fully Protected Customer Routes - Cannot access directly via URL/path without login
  {
    name: 'হোমপেজ',
    path: '/home',
    element: (
      <CustomerAuthGuard>
        <HomePage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন প্যাকেজসমূহ',
    path: '/packages',
    element: (
      <CustomerAuthGuard>
        <PackagesPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন ক্যালকুলেটর',
    path: '/calculator',
    element: (
      <CustomerAuthGuard>
        <CalculatorPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন আবেদন',
    path: '/apply',
    element: (
      <CustomerAuthGuard>
        <ApplyPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'আবেদন ট্র্যাকিং',
    path: '/track',
    element: (
      <CustomerAuthGuard>
        <TrackPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'গ্রাহক ড্যাশবোর্ড ও ওয়ালেট',
    path: '/dashboard',
    element: (
      <CustomerAuthGuard>
        <CustomerDashboardPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'ওয়ালেট রিডাইরেক্ট',
    path: '/wallet',
    element: (
      <CustomerAuthGuard>
        <CustomerDashboardPage />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'গ্রাহক সাপোর্ট মেসেজ',
    path: '/messages',
    element: withSuspense(CustomerMessagesPage),
    public: true,
  },
  {
    name: 'ড্যাশবোর্ড রিডাইরেক্ট',
    path: '/fixed-deposit',
    element: (
      <CustomerAuthGuard>
        <Navigate to="/dashboard" replace />
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'ড্যাশবোর্ড রিডাইরেক্ট',
    path: '/fd-fund',
    element: (
      <CustomerAuthGuard>
        <Navigate to="/dashboard" replace />
      </CustomerAuthGuard>
    ),
    public: false,
  },

  // Admin Routes
  {
    name: 'এডমিন ড্যাশবোর্ড',
    path: '/admin',
    element: withSuspense(AdminDashboardPage),
    public: true,
  },
  {
    name: 'এডমিন আবেদন ব্যবস্থাপনা',
    path: '/admin/applications',
    element: withSuspense(AdminApplicationsPage),
    public: true,
  },
  {
    name: 'এডমিন ডিপোজিট ও পেমেন্ট মেথড',
    path: '/admin/deposits',
    element: withSuspense(AdminDepositsPage),
    public: true,
  },
  {
    name: 'এডমিন ওয়ালেট ও ব্যালেন্স নিয়ন্ত্রণ',
    path: '/admin/wallets',
    element: withSuspense(AdminWalletsPage),
    public: true,
  },
  {
    name: 'এডমিন উইথড্রয়াল রিকোয়েস্ট',
    path: '/admin/withdrawals',
    element: withSuspense(AdminWithdrawalsPage),
    public: true,
  },
  {
    name: 'এডমিন চুক্তিপত্র (Contract Paper)',
    path: '/admin/contracts',
    element: withSuspense(AdminContractsPage),
    public: true,
  },
  {
    name: 'এডমিন ভার্চুয়াল কার্ড রিকোয়েস্ট ও ইস্যু',
    path: '/admin/cards',
    element: withSuspense(AdminVirtualCardsPage),
    public: true,
  },
  {
    name: 'এডমিন লোন পাশের লেটার (PDF)',
    path: '/admin/letters',
    element: withSuspense(AdminLettersPage),
    public: true,
  },
  {
    name: 'এডমিন অফিসিয়াল দলিল জেনারেটর',
    path: '/admin/documents',
    element: withSuspense(AdminOfficialDocumentGeneratorPage),
    public: true,
  },
  {
    name: 'এডমিন স্টাফ আইডি কার্ড (NID স্টাইল)',
    path: '/admin/staff-id',
    element: withSuspense(AdminStaffIdCardsPage),
    public: true,
  },
  {
    name: 'এডমিন মিডিয়া ও হ্যাপি কাস্টমার গ্যালারি',
    path: '/admin/media-gallery',
    element: withSuspense(AdminMediaGalleryPage),
    public: true,
  },
  {
    name: 'এডমিন ড্যাশবোর্ড রিডাইরেক্ট',
    path: '/admin/fixed-deposits',
    element: <Navigate to="/admin" replace />,
    public: true,
  },
  {
    name: 'এডমিন সাপোর্ট ও পার্টনার ব্যাংক',
    path: '/admin/support-partners',
    element: withSuspense(AdminSupportPartnersPage),
    public: true,
  },
  {
    name: 'এডমিন সাব-এডমিন ও পারমিশন কন্ট্রোল',
    path: '/admin/sub-admins',
    element: withSuspense(AdminSubAdminsPage),
    public: true,
  },
  {
    name: 'এডমিন কাস্টম নোটিফিকেশন',
    path: '/admin/notifications',
    element: withSuspense(AdminNotificationsPage),
    public: true,
  },
  {
    name: 'এডমিন প্যাকেজ এডিটর',
    path: '/admin/packages',
    element: withSuspense(AdminPackagesPage),
    public: true,
  },
  {
    name: 'এডমিন গ্রাহক তালিকা',
    path: '/admin/customers',
    element: withSuspense(AdminCustomersPage),
    public: true,
  },
  {
    name: 'এডমিন কাস্টমার মেসেজ হাব ও লাইভ সাপোর্ট',
    path: '/admin/messages',
    element: withSuspense(AdminMessagesPage),
    public: true,
  },
  {
    name: 'এডমিন কিস্তি ব্যবস্থাপনা',
    path: '/admin/installments',
    element: withSuspense(AdminInstallmentsPage),
    public: true,
  },
  {
    name: 'এডমিন সাইট কনটেন্ট ও সেটিংস',
    path: '/admin/settings',
    element: withSuspense(AdminSettingsPage),
    public: true,
  },
];
