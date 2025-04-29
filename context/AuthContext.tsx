import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // TODO: Implement real authentication logic (e.g., async storage, API calls)
  const [user, setUser] = useState(null); // Example: { id: 1, name: 'Gestor Exemplo', type: 'gestor' } or { id: 10, name: 'Funcionario Exemplo', type: 'funcionario' }
  const [isLoading, setIsLoading] = useState(true); // Simulate loading auth state

  // Simulate fetching user state on app load
  useState(() => {
    setTimeout(() => {
      // Simulate login - set to 'gestor' or 'funcionario' for testing
      setUser({ id: 1, name: 'Gestor Teste', type: 'gestor' }); 
      // setUser({ id: 10, name: 'Funcionário Teste', type: 'funcionario' });
      setIsLoading(false);
    }, 1500);
  }, []);

  const login = (userData) => {
    // TODO: Implement login API call
    setUser(userData);
  };

  const logout = () => {
    // TODO: Implement logout logic (clear storage, API call)
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

