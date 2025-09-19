"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import { sendPageView } from "@/lib/gtm";

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

  if (!isClient) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<div className="flex justify-center items-center h-64">Loading...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}