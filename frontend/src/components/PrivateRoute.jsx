import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrivateRoute(){
  const { user, loading } = useAuth();
  if(loading) return <div className="p-4 text-center">Carregando...</div>;
  if(!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
