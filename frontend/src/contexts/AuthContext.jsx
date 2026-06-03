import { createContext, useContext } from 'react';

const localUser = {
  id: 1,
  nome: 'Usuário Local',
  email: 'sistema@local.com',
  perfil: 'Acesso livre'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider
      value={{
        user: localUser,
        loading: false,
        login: async () => ({ user: localUser, token: null }),
        logout: () => {},
        isAuthenticated: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: localUser,
      loading: false,
      login: async () => ({ user: localUser, token: null }),
      logout: () => {},
      isAuthenticated: true
    };
  }

  return context;
}
