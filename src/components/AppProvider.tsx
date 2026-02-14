"use client";

import { AppProvider as AmbrosiaAppProvider } from "@/context/AppContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AmbrosiaAppProvider>{children}</AmbrosiaAppProvider>;
}
