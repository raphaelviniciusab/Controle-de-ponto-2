import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function fetchMe(){
      try{
        const res = await api.get('/auth/me');
        setUser(res.data || null);
      } catch(e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  },[]);

  async function login(email, password){
    await api.post('/auth/login', { email, password });
    const res = await api.get('/auth/me');
    setUser(res.data || null);
  }

  async function logout(){
    try {
      await api.post('/auth/logout');
    } catch(e) {
      // ignora o erro
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
  return useContext(AuthContext);
}
