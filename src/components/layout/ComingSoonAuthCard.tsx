import Link from "next/link";

import { CONTACT, SITE_NAME } from "@/lib/site-config";

/**
 * Shown for account features that have no backend support yet
 * (password reset, email verification). Never fakes a success state.
 */
export default function ComingSoonAuthCard({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-background">
      <main className="flex w-full flex-grow items-center justify-center p-md md:p-lg">
        <div className="w-full max-w-[28rem]">
          <div className="mb-xl w-full text-center">
            <h1 className="mb-xs font-display-xl text-headline-lg tracking-tight text-primary">
              {SITE_NAME}
            </h1>
            <div className="mx-auto h-1 w-12 rounded-full bg-primary-container" />
          </div>

          <div className="w-full rounded-3xl bg-surface-container-lowest p-lg text-center shadow-xl md:p-xl">
            <div className="mb-lg flex w-full justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary-container/20 bg-primary-container/10">
                <span className="material-symbols-outlined text-[44px] text-primary">
                  {icon}
                </span>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Coming Soon
            </p>

            <h2 className="mt-2 font-headline-md text-headline-md text-on-surface">
              {title}
            </h2>

            <p className="mx-auto mt-sm max-w-[320px] text-body-md text-on-surface-variant">
              {message}
            </p>

            <div className="mt-lg rounded-xl bg-surface-container-low p-md text-left text-sm text-on-surface-variant">
              <p className="font-bold text-on-surface">Contact support</p>
              <p className="mt-1 break-words">{CONTACT.email}</p>
              <p className="break-words">{CONTACT.phone}</p>
            </div>

            <div className="mt-lg flex flex-col gap-3">
              <Link
                href="/contact"
                className="sunrise-gradient rounded-2xl px-6 py-3 font-label-bold text-on-primary"
              >
                Contact Support
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1 font-label-bold text-label-bold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
