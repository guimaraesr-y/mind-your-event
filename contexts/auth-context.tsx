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
import { useCookies } from "./cookies-context";

interface AuthContextType {
  user: UserInterface | null;
  isLoading: boolean;
  updateUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { cookies, isLoading: cookieIsLoading } = useCookies();
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (sessionToken: string) => {
    return await retrieveUserBySessionToken(sessionToken);
  };

  const updateUserStatus = async () => {
    setIsLoading(true);
    const sessionToken = cookies.session_token;

    if (cookieIsLoading) {
      return;
    }

    if (!sessionToken) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await fetchUser(sessionToken);
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    updateUserStatus();
    console.log({ cookies, cookieIsLoading });
  }, [cookies, cookieIsLoading]);

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
