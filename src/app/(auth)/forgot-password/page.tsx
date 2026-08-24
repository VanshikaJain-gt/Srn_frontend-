"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1500);
  };

  return (
    
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background font-body-md text-on-background">
      {/* Atmospheric background */}
      <div className="fixed inset-0 z-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/20 via-transparent to-surface-container-low/60" />
      </div>

      <main className="relative z-10 flex w-full flex-grow items-center justify-center p-md md:p-lg">
        <div className="w-full max-w-[28rem]">
          {/* Brand */}
          <div className="mb-xl w-full text-center">
            <h1 className="mb-xs font-display-xl text-headline-lg tracking-tight text-primary">
              Sunrise Runners Network
            </h1>
            <div className="mx-auto h-1 w-12 rounded-full bg-primary-container" />
          </div>

          {/* Card */}
          <div className="glass-card w-full rounded-3xl p-lg shadow-xl transition-all duration-500 md:p-xl">
            {/* Icon */}
            <div className="mb-lg flex w-full justify-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-primary-container/20 bg-primary-container/10">
                <span
                  className="material-symbols-outlined text-[48px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-lg w-full text-center">
              <h2 className="mb-sm font-headline-md text-headline-md text-on-surface">
                Reset Your Password
              </h2>
              <p className="mx-auto max-w-[280px] font-body-md text-body-md text-on-surface-variant">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-lg">
              <div className="w-full space-y-sm">
                <label
                  htmlFor="email"
                  className="ml-1 block font-label-bold text-label-bold text-on-surface-variant"
                >
                  Email address
                </label>
                <div className="group relative w-full">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="runner@sunrise.com"
                    className="h-14 w-full rounded-lg border-b-2 border-outline-variant bg-white/50 px-md font-body-md outline-none transition-all duration-300 focus:border-primary-container focus:ring-0"
                  />
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
                    mail
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className={`flex h-14 w-full items-center justify-center gap-sm rounded-2xl font-label-bold text-body-md text-on-primary transition-all ${
                  status === "sent" ? "bg-tertiary" : "sunrise-gradient"
                } disabled:cursor-not-allowed disabled:opacity-80`}
              >
                {status === "sending" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Sending...
                  </>
                ) : status === "sent" ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Link Sent!
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {status === "sent" && (
                <p className="w-full text-center font-label-bold text-primary">
                  Please check your inbox for reset instructions.
                </p>
              )}
            </form>

            {/* Back to login */}
            <div className="mt-xl w-full text-center">
              <Link
                href="/login"
                className="group inline-flex items-center gap-xs font-label-bold text-label-bold text-primary transition-colors hover:text-on-primary-container"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Back to Login
              </Link>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="mt-lg flex w-full justify-center gap-md">
            <div className="h-2 w-2 rounded-full bg-primary-container/30" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary-container/60" />
            <div className="h-2 w-2 rounded-full bg-primary-container/30" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full p-lg text-center">
        <p className="font-label-bold text-label-bold text-on-surface-variant opacity-60">
          © 2026 Sunrise Runners Network. All rights reserved.
        </p>
      </footer>
    </div>
  );
}