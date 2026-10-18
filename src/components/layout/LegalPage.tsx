import Link from "next/link";

import { LEGAL_PLACEHOLDER_NOTICE, SITE_NAME } from "@/lib/site-config";

export default function LegalPage({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-20">
        <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          {SITE_NAME}
        </span>

        <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
          {title}
        </h1>

        <div className="mt-8 rounded-3xl border border-dashed border-orange-300 bg-white p-6 text-base leading-7 text-gray-700 shadow-sm md:p-8">
          <p className="font-semibold">{LEGAL_PLACEHOLDER_NOTICE}</p>

          <p className="mt-4">
            For questions in the meantime, please{" "}
            <Link href="/contact" className="font-bold text-orange-700 underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
