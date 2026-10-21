"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { apiClient } from "@/lib/api-client";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // null on the server, so nothing protected renders before the token is known.
  const hasToken = useSyncExternalStore(
    subscribeToStorage,
    () => Boolean(apiClient.getToken()),
    () => null
  );

  // Every dashboard page needs a logged-in user; send visitors to login once,
  // instead of each page failing with its own "session expired" message.
  useEffect(() => {
    if (hasToken === false) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return null;
  }

  // One shared navigation (with Logout) for every dashboard page.
  return (
    <>
      <DashboardSidebar />

      <div className="lg:pl-64">{children}</div>
    </>
  );
}
