import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

type User = {
  id: string;
  username: string;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // local only: check localStorage
    try {
      const stored = localStorage.getItem("cycle_sync_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const stored = localStorage.getItem("cycle_sync_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.username !== username) {
      }
    }

    const fakeUser: User = {
      id: "local-user-id",
      username,
      avatar: "🌸"
    };

    localStorage.setItem("cycle_sync_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    setLocation("/");
  };

  const register = async (username: string, password: string) => {
    const fakeUser: User = {
      id: "local-user-id",
      username,
      avatar: "🌸"
    };
    localStorage.setItem("cycle_sync_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    setLocation("/");
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    localStorage.setItem("cycle_sync_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = async () => {
    localStorage.removeItem("cycle_sync_user");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
