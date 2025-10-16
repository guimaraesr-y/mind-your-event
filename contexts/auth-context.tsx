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
import { retrieveUserByEmailAndSessionToken } from "@/actions/user/retrieve";

interface AuthContextType {
  user: UserInterface | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (email: string, sessionToken: string) => {
      return await retrieveUserByEmailAndSessionToken(email, sessionToken);
    };

    const userEmail = localStorage.getItem("userEmail");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!userEmail || !sessionToken) {
      setIsLoading(false);
      return;
    }

    fetchUser(userEmail, sessionToken)
      .then((user: any) => {
        setUser(user);
      })
      .catch((error: any) => {
        console.error("Error fetching user:", error);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, []);

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
