import React from 'react';
import { Navigate } from 'react-router-dom';

export const AdminNotificationsPage: React.FC = () => {
  return <Navigate to="/admin" replace />;
};

export default AdminNotificationsPage;
