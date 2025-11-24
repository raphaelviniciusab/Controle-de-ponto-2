import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute(){
  const { user, loading } = useAuth();
  if(loading) return <div className="p-4 text-center">Carregando...</div>;
  if(!user) return <Navigate to="/login" replace />;
  if(user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
