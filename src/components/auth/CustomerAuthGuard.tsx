import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLoan } from '@/contexts/LoanContext';

interface CustomerAuthGuardProps {
  children: ReactNode;
}

export const CustomerAuthGuard: React.FC<CustomerAuthGuardProps> = ({ children }) => {
  const { currentUser } = useLoan();
  const location = useLocation();

  // If customer is not authenticated, redirect to /login
  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};
