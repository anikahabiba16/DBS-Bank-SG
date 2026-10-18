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
    if (!activeUser) return;

    try {
      window.history.pushState({ customerGuard: true }, '', window.location.href);
    } catch {}

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const isDashboardRoute = locationRef.current.startsWith('/dashboard') || locationRef.current.startsWith('/wallet');

      // If on dashboard and back button is clicked, or attempting to land on public/login/register/landing pages
      if (
        currentPath === '/' ||
        currentPath === '/login' ||
        currentPath === '/register' ||
        (isDashboardRoute && !currentPath.startsWith('/dashboard') && !currentPath.startsWith('/wallet'))
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
  }, [activeUser, navigate]);

  // If customer is not authenticated, redirect to /login
  if (!activeUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};
