import React, { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { CustomerAuthGuard } from '@/components/auth/CustomerAuthGuard';

// Preload the requested route chunk immediately when initial script runs
if (typeof window !== 'undefined' && window.location) {
  const p = window.location.pathname;
  if (p === '/' || p === '/login' || p === '/register') {
    import('./pages/AuthPages').catch(() => {});
  } else if (p === '/dashboard' || p === '/wallet') {
    import('./pages/CustomerDashboardPage').catch(() => {});
  } else if (p.startsWith('/admin')) {
    import('./pages/admin/AdminDashboardPage').catch(() => {});
  }
}

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-6 gap-2">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="text-xs font-semibold text-muted-foreground">DBS Bank SG</span>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Lazy load Customer & Auth Pages to eliminate unused JavaScript
const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const PackagesPage = lazy(() => import('./pages/PackagesPage').then(m => ({ default: m.PackagesPage })));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage').then(m => ({ default: m.CalculatorPage })));
const ApplyPage = lazy(() => import('./pages/ApplyPage').then(m => ({ default: m.ApplyPage })));
const TrackPage = lazy(() => import('./pages/TrackPage').then(m => ({ default: m.TrackPage })));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })));

// Lazy load Customer Messages
const CustomerMessagesPage = lazy(() => import('./pages/CustomerMessagesPage'));

// Lazy load Admin Pages for lightning-fast initial load & 0 unused JavaScript for customers
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplicationsPage').then(m => ({ default: m.AdminApplicationsPage })));
const AdminPackagesPage = lazy(() => import('./pages/admin/AdminPackagesPage').then(m => ({ default: m.AdminPackagesPage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminInstallmentsPage = lazy(() => import('./pages/admin/AdminInstallmentsPage').then(m => ({ default: m.AdminInstallmentsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminWalletsPage = lazy(() => import('./pages/admin/AdminWalletsPage').then(m => ({ default: m.AdminWalletsPage })));
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage').then(m => ({ default: m.AdminWithdrawalsPage })));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })));
const AdminLettersPage = lazy(() => import('./pages/admin/AdminLettersPage').then(m => ({ default: m.AdminLettersPage })));
const AdminDepositsPage = lazy(() => import('./pages/admin/AdminDepositsPage').then(m => ({ default: m.AdminDepositsPage })));
const AdminContractsPage = lazy(() => import('./pages/admin/AdminContractsPage').then(m => ({ default: m.AdminContractsPage })));
const AdminSupportPartnersPage = lazy(() => import('./pages/admin/AdminSupportPartnersPage').then(m => ({ default: m.AdminSupportPartnersPage })));
const AdminOfficialDocumentGeneratorPage = lazy(() => import('./pages/admin/AdminOfficialDocumentGeneratorPage').then(m => ({ default: m.AdminOfficialDocumentGeneratorPage })));
const AdminStaffIdCardsPage = lazy(() => import('./pages/admin/AdminStaffIdCardsPage').then(m => ({ default: m.AdminStaffIdCardsPage })));
const AdminMediaGalleryPage = lazy(() => import('./pages/admin/AdminMediaGalleryPage').then(m => ({ default: m.AdminMediaGalleryPage })));
const AdminVirtualCardsPage = lazy(() => import('./pages/admin/AdminVirtualCardsPage').then(m => ({ default: m.AdminVirtualCardsPage })));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSubAdminsPage = lazy(() => import('./pages/admin/AdminSubAdminsPage'));

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
    return withSuspense(HomePage);
  }
  return withSuspense(LoginPage);
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
    element: withSuspense(LoginPage),
    public: true,
  },
  {
    name: 'গ্রাহক নিবন্ধন',
    path: '/register',
    element: withSuspense(RegisterPage),
    public: true,
  },

  // Fully Protected Customer Routes - Cannot access directly via URL/path without login
  {
    name: 'হোমপেজ',
    path: '/home',
    element: (
      <CustomerAuthGuard>
        {withSuspense(HomePage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন প্যাকেজসমূহ',
    path: '/packages',
    element: (
      <CustomerAuthGuard>
        {withSuspense(PackagesPage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন ক্যালকুলেটর',
    path: '/calculator',
    element: (
      <CustomerAuthGuard>
        {withSuspense(CalculatorPage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'লোন আবেদন',
    path: '/apply',
    element: (
      <CustomerAuthGuard>
        {withSuspense(ApplyPage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'আবেদন ট্র্যাকিং',
    path: '/track',
    element: (
      <CustomerAuthGuard>
        {withSuspense(TrackPage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'গ্রাহক ড্যাশবোর্ড ও ওয়ালেট',
    path: '/dashboard',
    element: (
      <CustomerAuthGuard>
        {withSuspense(CustomerDashboardPage)}
      </CustomerAuthGuard>
    ),
    public: false,
  },
  {
    name: 'ওয়ালেট রিডাইরেক্ট',
    path: '/wallet',
    element: (
      <CustomerAuthGuard>
        {withSuspense(CustomerDashboardPage)}
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
