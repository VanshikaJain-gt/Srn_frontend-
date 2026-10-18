"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";

import { GOOGLE_CLIENT_ID, GOOGLE_LOGIN_ENABLED } from "@/lib/site-config";

interface GoogleProviderProps {
  children: ReactNode;
}

export default function GoogleProvider({
  children,
}: GoogleProviderProps) {
  // Without a client id the Google button is hidden, so no provider is needed.
  if (!GOOGLE_LOGIN_ENABLED) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
