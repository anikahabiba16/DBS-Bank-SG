import React, { ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';
import { loanStorage } from '@/services/storage';

interface CustomerAuthGuardProps {
  children: ReactNode;
}

export const CustomerAuthGuard: React.FC<CustomerAuthGuardProps> = ({ children }) => {
  const { currentUser } = useLoan();
  const location = useLocation();
  const navigate = useNavigate();
  const activeUser = currentUser || loanStorage.getCurrentUser();
  const locationRef = useRef(location.pathname + location.search);
  locationRef.current = location.pathname + location.search;

  // Protect logged-in customer from accidental back button exit out of dashboard
  useEffect(() => {
    // Only push guard state if currently on dashboard/wallet routes
    const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/wallet');
    if (isDashboardRoute) {
      try {
        if (!window.history.state?.customerGuard) {
          window.history.pushState({ customerGuard: true }, '', window.location.href);
        }
      } catch {}
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const onDashboard = locationRef.current.startsWith('/dashboard') || locationRef.current.startsWith('/wallet');

      // If user is on dashboard and clicks back into public/login/register
      if (
        onDashboard &&
        (currentPath === '/' || currentPath === '/login' || currentPath === '/register')
      ) {
        try {
          window.history.pushState({ customerGuard: true }, '', locationRef.current || '/dashboard');
        } catch {}
        navigate(locationRef.current || '/dashboard', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeUser, location.pathname, navigate]);

  // If customer is not authenticated, redirect to /login
  if (!activeUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};
