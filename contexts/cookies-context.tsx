"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";

interface CookiesContextType {
  cookies: Record<string, string>;
  isLoading: boolean;
  setCookie: (name: string, value: string) => Promise<void>;
}

const CookiesContext = createContext<CookiesContextType | undefined>(undefined);

export function CookiesProvider({ children }: { children: ReactNode }) {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCookies(Cookies.get());
    console.log('peguei o cookie')
    setIsLoading(false);
  }, [])

  const setCookie = async (name: string, value: string) => {
    Cookies.set(name, value);
    setCookies(Cookies.get());
  };

  return (
    <CookiesContext.Provider value={{ cookies, setCookie, isLoading }}>
      {children}/
    </CookiesContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookiesContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
