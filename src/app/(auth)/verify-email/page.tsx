"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleResend = () => {
    setStatus("sending");

    setTimeout(() => {
      setStatus("sent");

      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-surface relative">
      {/* Background Blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-secondary-container rounded-full blur-[100px]" />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[28rem] bg-surface-container-lowest rounded-3xl p-6 md:p-12 shadow-[0px_4px_20px_rgba(15,23,42,0.08)] text-center">
          {/* Logo */}
          <div className="mb-12">
            <span className="font-display-xl text-headline-md font-extrabold text-primary">
              Sunrise Runners Network
            </span>
          </div>

          {/* Mail Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center pulse-effect">
              <span className="material-symbols-outlined text-[40px] text-primary">
                mail
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4 mb-12">
            <h1 className="font-headline-lg text-headline-lg text-on-background">
              Verify Your Email
            </h1>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] mx-auto">
              We&apos;ve sent a verification link to your email. Please check
              your inbox to activate your account.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleResend}
              disabled={status === "sending"}
              className={`font-label-bold text-label-bold py-4 px-6 rounded-2xl active:scale-95 transition-transform shadow-md hover:shadow-lg text-on-primary ${
                status === "sent" ? "bg-green-600" : "sunrise-gradient"
              }`}
              style={{ opacity: status === "sending" ? 0.8 : 1 }}
            >
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                ? "Email Resent!"
                : "Resend Verification Email"}
            </button>

            <div className="flex flex-col gap-2 mt-2">
              {/* Change Email */}
              <Link
                href="/change-email"
                className="text-primary font-label-bold text-label-bold hover:underline transition-all"
              >
                Change email address
              </Link>

              {/* Back to Login */}
              <Link
                href="/login"
                className="text-on-surface-variant font-label-bold text-label-bold hover:text-primary transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back to Login
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="my-12 border-t border-outline-variant" />

          {/* Info */}
          <div className="flex items-start gap-4 bg-surface-container-low p-4 rounded-xl text-left">
            <span className="material-symbols-outlined text-primary">
              info
            </span>

            <p className="font-body-md text-body-md text-on-surface-variant">
              <span className="font-bold text-on-surface">
                Don&apos;t see it?
              </span>{" "}
              Check your spam folder. Sometimes our race invites get lost in
              the sprint!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center relative z-10">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant opacity-60">
            © 2024 Sunrise Runners Network. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-on-surface-variant font-label-bold text-label-bold hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/support"
              className="text-on-surface-variant font-label-bold text-label-bold hover:text-primary transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}