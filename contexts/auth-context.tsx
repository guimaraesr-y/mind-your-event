"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import Cookies from "js-cookie";
import { UserInterface } from "@/modules/user/user";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";

export const SESSION_COOKIE_NAME = 'session_token';

interface AuthContextType {
  user: UserInterface | null;
  isLoading: boolean;
  updateUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserStatus = useCallback(async () => {
    setIsLoading(true);

    // Lemos a fonte de verdade DIRETO do navegador, sempre fresquinho
    const sessionToken = Cookies.get('session_token');

    if (!sessionToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const fetchedUser = await retrieveUserBySessionToken(sessionToken);
      setUser(fetchedUser);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sem dependências perigosas agora!

  useEffect(() => {
    updateUserStatus();
  }, [updateUserStatus]);

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}