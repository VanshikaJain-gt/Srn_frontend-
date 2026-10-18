import Link from "next/link";

import { CONTACT, SITE_NAME } from "@/lib/site-config";

const CONTACT_ITEMS = [
  { icon: "mail", label: "Email", value: CONTACT.email },
  { icon: "call", label: "Phone / WhatsApp", value: CONTACT.phone },
  { icon: "location_on", label: "Address", value: CONTACT.address },
  { icon: "schedule", label: "Support Hours", value: CONTACT.hours },
];

export const metadata = {
  title: `Contact Us | ${SITE_NAME}`,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-20">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            {SITE_NAME}
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
            Contact Us
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Questions about a challenge, an event, a payment or your account?
            Reach out to the SRN team using the details below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACT_ITEMS.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                {item.label}
              </p>

              <p className="mt-1 break-words text-lg font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-gray-950">
            Looking for something else?
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/challenges"
              className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Browse Challenges
            </Link>

            <Link
              href="/events"
              className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
            >
              Upcoming Events
            </Link>

            <Link
              href="/dashboard/registrations"
              className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
            >
              My Registrations
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
