"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import { getCurrentUser, User } from "@/services/auth.service";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Challenges", href: "/challenges" },
  { label: "Gallery", href: "/gallery" },
  { label: "Leaderboard", href: "/results" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const token = localStorage.getItem("sunrisers_token");

      setIsLoggedIn(Boolean(token));

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to load current user in Navbar:", error);

        if (!cancelled) {
          setUser(null);
        }
      }
    }

    loadCurrentUser();

    const handleStorageChange = () => {
      loadCurrentUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname]);

  const isAdmin = user?.role === "ADMIN";
  const profileHref = isAdmin ? "/admin" : "/dashboard";
  const profileTitle = isAdmin ? "Admin Panel" : "Dashboard";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-lg py-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png.jpeg"
            alt="Sunrisers Running Squad"
            width={70}
            height={70}
            priority
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-lg md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "border-b-2 border-primary pb-1 font-bold text-primary transition-transform active:scale-95"
                    : "font-medium text-on-surface-variant transition-colors duration-200 hover:text-primary active:scale-95"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-md">
          {!isLoggedIn ? (
            <>
              {/* Login */}
              <Link
                href="/login"
                className="hidden rounded-xl px-md py-sm font-label-bold text-label-bold text-primary transition-all hover:bg-surface-container md:block"
              >
                Login
              </Link>

              {/* Join Community */}
              <Link
                href="/signup"
                className="btn-gradient rounded-full px-lg py-md font-label-bold text-label-bold text-on-primary transition-all active:scale-95"
              >
                Join Community
              </Link>
            </>
          ) : (
            /* Logged In Profile */
            <Link
              href={profileHref}
              aria-label={profileTitle}
              title={profileTitle}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-primary transition-all hover:bg-orange-100 hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">
                person
              </span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((open) => !open)}
            className="p-md text-on-surface-variant md:hidden"
          >
            <span className="material-symbols-outlined">
              {isMobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="flex flex-col gap-sm border-t border-outline-variant bg-surface px-lg py-md md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={
                pathname === link.href
                  ? "py-sm font-bold text-primary"
                  : "py-sm text-on-surface-variant"
              }
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="py-sm font-label-bold text-label-bold text-primary"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={() => setIsMobileOpen(false)}
                className="py-sm font-label-bold text-label-bold text-primary"
              >
                Join Community
              </Link>
            </>
          ) : (
            <Link
              href={profileHref}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2 py-sm font-label-bold text-label-bold text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
              {isAdmin ? "Admin Panel" : "Dashboard"}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
