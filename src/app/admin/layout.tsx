"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser, User } from "@/services/auth.service";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Challenges",
    href: "/admin/challenges",
    icon: "emoji_events",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: "event",
  },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: "how_to_reg",
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: "payments",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "group",
  },
  {
    label: "Activities",
    href: "/admin/activities",
    icon: "directions_run",
  },
  {
    label: "Results / Winners",
    href: "/admin/results",
    icon: "military_tech",
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: "photo_library",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminUser() {
      try {
        const currentUser = await getCurrentUser();

        if (cancelled) return;

        if (currentUser.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        setUser(currentUser);
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    loadAdminUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logoutUser();
    router.replace("/login");
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-gray-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-orange-100 bg-white lg:flex">
        <div className="border-b border-orange-100 px-6 py-6">
          <Link href="/admin/dashboard" className="block">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png.jpeg"
                alt="Sunrisers"
                className="h-12 w-auto"
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                  SRN
                </p>
                <h1 className="text-lg font-black text-gray-950">
                  Admin Panel
                </h1>
              </div>
            </div>
          </Link>
        </div>

        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-orange-100">
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-orange-600">
                  person
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {user.name}
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-orange-600">
                Administrator
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[21px] ${
                      active ? "text-orange-600" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <p className="px-3 pb-3 pt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
            System
          </p>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              pathname.startsWith("/admin/settings")
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-outlined text-[21px] text-gray-400">
              settings
            </span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-orange-100 bg-white/90 px-5 backdrop-blur-md lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Sunrise Runners Network
            </p>
            <h2 className="text-lg font-black text-gray-950">
              Administration
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 sm:block"
            >
              View Website
            </Link>

            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-orange-100">
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-orange-600">
                  person
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}