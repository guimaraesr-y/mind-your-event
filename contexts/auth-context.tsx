"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { UserInterface } from "@/modules/user/user";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import Cookies from "js-cookie";

interface AuthContextType {
  user: UserInterface | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (sessionToken: string) => {
      return await retrieveUserBySessionToken(sessionToken);
    };

    const sessionToken = Cookies.get("session_token")

    if (!sessionToken) {
      setIsLoading(false);
      return;
    }

    fetchUser(sessionToken)
      .then((user: any) => {
        setUser(user);
      })
      .catch((error: any) => {
        console.error("Error fetching user:", error);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, [Cookies]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
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
