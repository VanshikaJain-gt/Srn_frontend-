"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, logoutUser, User } from "@/services/auth.service";

const NAV_ITEMS = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/dashboard", icon: "▣", label: "Dashboard" },
  { href: "/dashboard/profile", icon: "◉", label: "Profile" },
  { href: "/dashboard/registrations", icon: "✓", label: "My Registrations" },
  { href: "/dashboard/activities", icon: "🏃", label: "My Activities" },
  { href: "/challenges", icon: "⚑", label: "Challenges" },
  { href: "/events", icon: "◷", label: "Events" },
  { href: "/dashboard/strava", icon: "↻", label: "Strava Sync" },
  { href: "/dashboard/achievements", icon: "★", label: "Achievements" },
  { href: "/dashboard/settings", icon: "⚙", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation for every /dashboard/* page (rendered once by the dashboard layout):
 * a fixed, scrollable sidebar on desktop and a top bar on smaller screens.
 * Logout is reachable on every page at any screen height.
 */
export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Re-read on navigation so a name/photo change on the profile page shows up.
  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        // Pages handle an expired session themselves; the sidebar just shows "Runner".
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col overflow-y-auto bg-[#ffe9e3] py-6 text-[#261814] shadow-md lg:flex">
        <div className="mb-8 px-4">
          <Link
            href="/dashboard"
            className="font-[Sora] text-2xl font-extrabold tracking-tight text-[#ab3500]"
          >
            SRN
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-3 px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7ddd5] text-lg font-extrabold text-[#ab3500]">
            {user?.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePhotoUrl}
                alt={user.name || "Runner profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.name?.charAt(0) || "R").toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name || "Runner"}</p>
            <p className="mt-1 text-xs text-[#594139]">
              {user?.role === "ADMIN" ? "Admin" : "Runner"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                isActive(pathname, item.href)
                  ? "bg-[#ff6b35] text-[#5f1900]"
                  : "text-[#594139] hover:bg-[#f7ddd5]"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 space-y-3 px-4">
          <Link
            href="/dashboard/activities"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ff6b35_0%,#ba1724_100%)] py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95"
          >
            <span>🏃</span>
            Log a Run
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e1bfb5] bg-white py-3 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] active:scale-[0.98]"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="border-b border-[#f0ded8] bg-[#ffe9e3] text-[#261814] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="font-[Sora] text-xl font-extrabold tracking-tight text-[#ab3500]"
          >
            SRN
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-[#e1bfb5] bg-white px-4 py-2 text-xs font-bold text-[#ab3500] transition hover:bg-[#fff1ed] active:scale-[0.98]"
          >
            <span>↪</span>
            Logout
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                isActive(pathname, item.href)
                  ? "bg-[#ff6b35] text-[#5f1900]"
                  : "bg-white/70 text-[#594139] hover:bg-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
