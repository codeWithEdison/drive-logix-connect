import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'client' | 'driver' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithDemo: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'client@demo.com',
    role: 'client',
    phone: '+1234567890',
    status: 'active'
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'driver@demo.com',
    role: 'driver',
    phone: '+1234567891',
    status: 'active'
  },
  {
    id: '3',
    name: 'Sarah Admin',
    email: 'admin@demo.com',
    role: 'admin',
    phone: '+1234567892',
    status: 'active'
  },
  {
    id: '4',
    name: 'Super Admin',
    email: 'superadmin@demo.com',
    role: 'super_admin',
    phone: '+1234567893',
    status: 'active'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('logistics_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('logistics_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const loginWithDemo = (role: UserRole) => {
    const demoUser = mockUsers.find(u => u.role === role);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('logistics_user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logistics_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithDemo,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}