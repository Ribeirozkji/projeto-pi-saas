import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('@estoque:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('@estoque:token'));
  const [loading, setLoading] = useState(Boolean(token));

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    async function loadLoggedUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('@estoque:user', JSON.stringify(data.user));
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('@estoque:token');
        localStorage.removeItem('@estoque:user');
      } finally {
        setLoading(false);
      }
    }

    loadLoggedUser();
  }, [token]);

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('@estoque:token', data.token);
    localStorage.setItem('@estoque:user', JSON.stringify(data.user));

    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('@estoque:token');
    localStorage.removeItem('@estoque:user');
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout
  }), [user, token, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
