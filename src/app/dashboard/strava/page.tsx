import Link from "next/link";

export const metadata = {
  title: "Strava Integration | Sunrise Runners Network",
};

export default function StravaPage() {
  return (
    <main className="min-h-screen bg-[#fff8f6] px-4 py-10 text-[#261814] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#ab3500] hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to Dashboard
        </Link>

        <div className="mt-6 rounded-[1.5rem] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffe9e3] text-[#ab3500]">
            <span className="material-symbols-outlined text-3xl">sync</span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#ab3500]">
            Coming Soon
          </p>

          <h1 className="mt-2 text-3xl font-black">Strava Integration</h1>

          <p className="mx-auto mt-4 max-w-[28rem] text-sm leading-6 text-[#594139]">
            Automatic syncing of your runs from Strava is not available yet.
            Until then, you can log your runs manually and they will be
            verified by the SRN team.
          </p>

          <Link
            href="/dashboard/activities"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ff5a1f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e84b14]"
          >
            <span className="material-symbols-outlined text-[18px]">
              directions_run
            </span>
            Log a Run Manually
          </Link>
        </div>
      </div>
    </main>
  );
}
