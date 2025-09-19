"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import { sendPageView } from "@/lib/gtm";
import { ReactQueryProvider } from "@/lib/queryClient";
import { SWRProvider } from "@/lib/swrConfig";

export default function GlobalProvider({ children }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (pathname && isClient) {
      sendPageView(pathname);
    }
  }, [pathname, isClient]);

  // Always render the same structure to prevent hydration mismatches
  return (
    <ReactQueryProvider>
      <SWRProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      </SWRProvider>
    </ReactQueryProvider>
  );
}