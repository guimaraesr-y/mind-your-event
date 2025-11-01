"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/verify?redirect=" + path);
      } else {
        setIsVerified(true);
      }
    }
  }, [user, isLoading, router]);

  if (!isVerified) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
