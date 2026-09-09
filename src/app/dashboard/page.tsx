"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logoutUser, User } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const activities = [
  { title: "Sunrise Loop Trail", date: "Yesterday, 6:45 AM", distance: "8.4 km", pace: "5'12\"/km", heartRate: "158 bpm" },
  { title: "Evening Recovery", date: "Oct 24, 5:15 PM", distance: "5.2 km", pace: "6'04\"/km", heartRate: "142 bpm" },
  { title: "Hill Repeats", date: "Oct 22, 6:00 AM", distance: "10.1 km", pace: "5'45\"/km", heartRate: "165 bpm" },
];

const upcomingEvents = [
  { month: "Nov", day: "15", title: "Sunset Ridge 10K", location: "Silver Lake Park" },
  { month: "Dec", day: "03", title: "Holiday Half Marathon", location: "Downtown City Plaza" },
];

const chartBars = [40, 60, 30, 80, 50, 90, 45, 70, 55, 85, 65, 40];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    loadCurrentUser();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#261814]">
      <style jsx global>{`
        :root {
          --srn-primary: #ab3500;
          --srn-primary-container: #ff6b35;
          --srn-surface: #fff8f6;
          --srn-surface-low: #fff1ed;
          --srn-surface-high: #fde3db;
          --srn-surface-highest: #f7ddd5;
          --srn-outline: #8d7168;
          --srn-outline-variant: #e1bfb5;
          --srn-text: #261814;
          --srn-text-muted: #594139;
        }

        .srn-font-sora {
          font-family: Sora, Inter, ui-sans-serif, system-ui, sans-serif;
        }

        .srn-glass {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .srn-gradient {
          background: linear-gradient(135deg, #ff6b35 0%, #ba1724 100%);
        }

        .srn-scrollbar::-webkit-scrollbar {
          height: 4px;
        }

        .srn-scrollbar::-webkit-scrollbar-thumb {
          background: var(--srn-primary);
          border-radius: 10px;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#ffe9e3] py-6 shadow-md lg:flex">
        <div className="mb-12 px-4">
          <div className="srn-font-sora text-2xl font-extrabold tracking-tight text-[#ab3500]">SRN</div>
        </div>

        <div className="mb-8 flex items-center gap-3 px-4">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f7ddd5]">
            <img
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4rmgwQfqn8YFcnEFKqLX4GeWxVMnfL3-DGIDMfH6oqCF74TFXTTrVfjyLDKLLv0I1-bMPM4cuw5cwD8qD1hbrOdH35qg9lu4wcbKjDbb2nyWQrf-YaHTX-yARS5lPTWVZvKziGqB5VPLP4ZCPgVKyjqmxOxw2jh0cxW-COVYB7GSq5-wnbE0BbmQupCY9NJgXBqwXwU4FMHFAJf_bx98A9QGDF-8a5fZ912Oxxx-sNfZtuBVHDF8XAEyor1954IQPWDz4--dTUKLu"
              alt="Runner profile"
            />
          </div>
          <div>
            <p className="truncate text-sm font-bold">
              {loadingUser ? "Loading..." : user?.name || "Runner"}
            </p>
            <p className="text-xs text-[#594139]">
              {user?.role === "ADMIN" ? "Admin" : "Runner"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/" icon="⌂" label="Home" />
          <NavItem active href="/dashboard" icon="▣" label="Dashboard" />
          <NavItem href="/profile" icon="◉" label="Profile" />
          <NavItem
          href="/dashboard/registrations"
          icon="✓"
           label="My Registrations"
           />
          <NavItem href="/strava" icon="↻" label="Strava Sync" />
          <NavItem href="/achievements" icon="★" label="Achievements" />
          <NavItem href="/dashboard/settings" icon="⚙" label="Settings" />
        </nav>

        <div className="space-y-3 px-4">
          <button className="srn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95">
            <span className="text-base">▶</span>
            Start Run
          </button>

          <button
            type="button"
            onClick={() => {
              logoutUser();
              router.push("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e1bfb5] bg-white py-3 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] active:scale-[0.98]"
          >
            <span className="text-base">↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-[#e1bfb5]/30 bg-[#fff8f6]/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="srn-font-sora truncate text-xl font-bold sm:text-2xl">
                {mounted ? greeting : "Good morning"}, {user?.name?.split(" ")[0] || "Runner"}!
              </h1>
              <p className="mt-1 text-sm text-[#594139] sm:text-base">
                You&apos;re <span className="font-bold text-[#ab3500]">5km away</span> from your weekly goal.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#594139] transition hover:bg-[#f7ddd5]" aria-label="Notifications">
                <span className="text-lg">●</span>
              </button>
              <button className="hidden items-center gap-2 rounded-full bg-[#fde3db] px-4 py-2 text-sm font-bold text-[#ab3500] sm:flex">
                <span>⚡</span>
                Lvl 24
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Stats */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon="↗" label="Weekly Distance" value="24.5" unit="km" trend="12%" />
            <MetricCard icon="▣" label="Monthly Distance" value="98" unit="km" />
            <MetricCard icon="⌁" label="Total Runs" value="142" />
            <MetricCard gradient icon="🔥" label="Current Streak" value="12" unit="days" />
          </section>

          {/* Main grid */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              {/* Activity chart */}
              <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="srn-font-sora text-2xl font-bold">Running Activity</h2>
                    <p className="mt-1 text-sm text-[#594139] sm:text-base">Distance covered over the last 30 days</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full bg-[#ffe9e3] px-4 py-2 text-sm font-bold text-[#ab3500]">Monthly</button>
                    <button className="rounded-full px-4 py-2 text-sm font-bold text-[#594139] hover:bg-[#ffe9e3]">Yearly</button>
                  </div>
                </div>

                <div className="absolute inset-x-6 bottom-5 top-36 flex items-end gap-2 sm:inset-x-8 sm:gap-3">
                  {chartBars.map((height, index) => (
                    <div key={index} className="group flex h-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-[#ab3500]/20 transition-all duration-200 group-hover:bg-[#ab3500]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="absolute inset-x-8 bottom-5 flex justify-between text-[10px] text-[#8d7168] sm:text-xs">
                  <span>30d ago</span>
                  <span>20d</span>
                  <span>10d</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Activities */}
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="srn-font-sora text-2xl font-bold">Recent Activities</h2>
                  <Link href="/strava" className="hidden items-center gap-1 text-sm font-bold text-[#ab3500] hover:underline sm:flex">
                    View Strava <span>↗</span>
                  </Link>
                </div>

                <div className="divide-y divide-[#e1bfb5]/60">
                  {activities.map((activity) => (
                    <div key={activity.title} className="group flex items-center justify-between gap-4 rounded-xl px-2 py-4 transition hover:bg-[#fff1ed]">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ab3500]/10 text-lg text-[#ab3500]">🏃</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold sm:text-base">{activity.title}</p>
                          <p className="text-xs text-[#594139] sm:text-sm">{activity.date}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-5 text-right sm:gap-8">
                        <Stat label="Distance" value={activity.distance} />
                        <Stat label="Avg Pace" value={activity.pace} hiddenOnMobile />
                        <Stat label="Heart Rate" value={activity.heartRate} hiddenOnMobile />
                        <span className="text-lg text-[#594139] transition group-hover:text-[#ab3500]">›</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5 lg:col-span-4">
              {/* Goal */}
              <div className="flex flex-col items-center rounded-[1.5rem] bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#594139]">Progress to Weekly Goal</p>
                <div className="relative mb-6 h-48 w-48">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192" aria-label="80 percent complete">
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="#fde3db" strokeWidth="12" />
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="#ab3500" strokeWidth="12" strokeLinecap="round" strokeDasharray="502.6" strokeDashoffset="100.5" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="srn-font-sora text-3xl font-extrabold">80%</span>
                    <span className="text-xs text-[#594139]">Complete</span>
                  </div>
                </div>
                <p className="text-sm text-[#594139] sm:text-base">20km / 25km</p>
              </div>

              {/* Events */}
              <div className="rounded-[1.5rem] border border-[#e1bfb5]/30 bg-[#fff1ed] p-6 sm:p-8">
                <h2 className="srn-font-sora mb-6 text-2xl font-bold">Upcoming Events</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={event.title} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                      <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg ${index === 0 ? "bg-[#ab3500]/10 text-[#ab3500]" : "bg-[#ba1724]/10 text-[#ba1724]"}`}>
                        <span className="text-[10px] font-bold uppercase">{event.month}</span>
                        <span className="text-lg font-bold">{event.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight">{event.title}</p>
                        <p className="mt-1 truncate text-xs text-[#594139]">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/events" className="mt-6 block text-center text-sm font-bold text-[#ab3500] hover:underline">
                  Browse More Events
                </Link>
              </div>

              {/* Badges */}
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#594139]">Achievement Badges</p>
                <div className="srn-scrollbar flex gap-4 overflow-x-auto pb-3">
                  <Badge icon="🏆" label="100km Club" />
                  <Badge icon="🏔️" label="Hill King" />
                  <Badge icon="⚡" label="PB Smasher" />
                  <Badge icon="⏱️" label="Early Bird" locked />
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-[#e1bfb5] bg-[#f7ddd5] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="srn-font-sora text-2xl font-extrabold text-[#ab3500]">SRN</span>
              <p className="text-sm text-[#594139]">© 2024 Sunrise Runners Network. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-sm text-[#594139]">
              <Link href="#" className="hover:text-[#ab3500]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#ab3500]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#ab3500]">Contact Us</Link>
              <Link href="#" className="hover:text-[#ab3500]">Support</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ active, href, icon, label }: { active?: boolean; href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
        active ? "bg-[#ff6b35] text-[#5f1900]" : "text-[#594139] hover:bg-[#f7ddd5]"
      }`}
    >
      <span className="w-5 text-center">{icon}</span>
      {label}
    </Link>
  );
}

function MetricCard({ icon, label, value, unit, trend, gradient }: { icon: string; label: string; value: string; unit?: string; trend?: string; gradient?: boolean }) {
  return (
    <div className={`group rounded-[1.5rem] p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${gradient ? "srn-gradient text-white shadow-lg" : "bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.08)]"}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${gradient ? "bg-white/20" : "bg-[#ab3500]/10 text-[#ab3500]"}`}>{icon}</div>
        {trend && <span className="flex items-center text-xs font-bold text-green-600">↗ {trend}</span>}
      </div>
      <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${gradient ? "text-white/80" : "text-[#594139]"}`}>{label}</p>
      <p className="srn-font-sora mt-2 text-3xl font-extrabold">
        {value}
        {unit && <span className="ml-1 font-sans text-base font-normal">{unit}</span>}
      </p>
    </div>
  );
}

function Stat({ label, value, hiddenOnMobile }: { label: string; value: string; hiddenOnMobile?: boolean }) {
  return (
    <div className={hiddenOnMobile ? "hidden md:block" : "block"}>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-[#594139] sm:text-xs">{label}</p>
    </div>
  );
}

function Badge({ icon, label, locked }: { icon: string; label: string; locked?: boolean }) {
  return (
    <div className={`group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-[#fde3db] text-2xl ${locked ? "grayscale opacity-40" : "border-[#ab3500]/20"}`} title={label}>
      <span>{icon}</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#261814] px-2 py-1 text-[10px] text-white group-hover:block">
        {label}
      </span>
    </div>
  );
}
