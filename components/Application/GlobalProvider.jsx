"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import store from "@/store/store";
import { sendPageView } from "@/lib/gtm";

export default function GlobalProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      sendPageView(pathname);
    }
  }, [pathname]);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}