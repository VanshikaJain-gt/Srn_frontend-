"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { apiClient } from "@/lib/api-client";

// These pages render their own sidebar navigation.
const PAGES_WITH_SIDEBAR = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/achievements",
];

const QUICK_LINKS = [
  { href: "/dashboard/registrations", label: "My Registrations" },
  { href: "/dashboard/activities", label: "My Activities" },
  { href: "/dashboard/settings", label: "Settings" },
];

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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

  const showTopBar = !PAGES_WITH_SIDEBAR.includes(pathname);

  return (
    <>
      {showTopBar && (
        <nav className="border-b border-[#f0ded8] bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm font-bold sm:px-6">
            <Link href="/dashboard" className="text-[#ab3500] hover:underline">
              ← Dashboard
            </Link>

            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-[#261814]"
                    : "text-[#594139] hover:text-[#ab3500]"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {children}
    </>
  );
}
