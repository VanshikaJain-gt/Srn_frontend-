"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-lg py-md">
        <Link
  href="/"
  className="flex items-center gap-3"
>
  <Image
    src="/logo.png.jpeg"
    alt="Sunrisers Running Squad"
    width={70}
    height={70}
    priority
    className="h-16 w-auto object-contain"
  />
</Link>

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

        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="hidden rounded-xl px-md py-sm font-label-bold text-label-bold text-primary transition-all hover:bg-surface-container md:block"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-gradient rounded-full px-lg py-md font-label-bold text-label-bold text-on-primary transition-all active:scale-95"
          >
            Join Community
          </Link>
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
          <Link
            href="/login"
            onClick={() => setIsMobileOpen(false)}
            className="py-sm font-label-bold text-label-bold text-primary"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}