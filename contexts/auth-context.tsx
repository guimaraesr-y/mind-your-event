"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/client";
import { UserInterface } from "@/modules/user/user";

interface AuthContextType {
  user: UserInterface | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (email: string, sessionToken: string) => {
      const supabase = getSupabaseBrowserClient();

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("session_token", sessionToken)
        .single();

      // console.log(user)
      return user;
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
