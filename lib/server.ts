'use server';

import { cookies } from "next/headers"
import { ReactNode } from "react"

/**
 * Legacy Supabase client getter. 
 * @deprecated Use Prisma repositories instead.
 */
export async function getSupabaseServerClient() {
  console.warn("getSupabaseServerClient is deprecated and should not be used.");
  return null as any;
}

export async function renderComponent(component: ReactNode) {
  const ReactDOMServer = await import("react-dom/server");
  return ReactDOMServer.renderToString(component);
}
