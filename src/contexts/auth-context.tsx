"use client";

import { apiClient } from "@/apis/client";
import type { LoginSuccessResponse, UserWithMenu } from "@/apis/interfaces/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = UserWithMenu;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de localStorage al montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validar que el token siga siendo válido
          await validateToken(storedToken);
        }
      } catch (error) {
        // Si hay error al validar, limpiar todo
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const validateToken = async (tokenValue: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, tokenValue);
      setToken(tokenValue);

      const response = await apiClient.get<UserWithMenu>("/auth/me");
      const userData = response.data;

      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      // Token expirado o inválido
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<LoginSuccessResponse>("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);

      const { access_token: newToken, user: userData } = response.data;
      
      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Actualizar estado
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Limpiar estado
    setToken(null);
    setUser(null);

    // Redirigir al login (opcional, puede hacerlo el componente)
  };

  const refreshUser = async () => {
    if (!token) throw new Error("No token available");
    await validateToken(token);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
