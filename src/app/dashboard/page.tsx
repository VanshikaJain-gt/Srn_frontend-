"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, logoutUser, User } from "@/services/auth.service";
import {
  ActivityResponse,
  getActivityStatus,
  getDurationMinutes,
  getMyActivities,
} from "@/services/activity.service";
import { EventResponse, getEvents } from "@/services/event.service";

const WEEKLY_GOAL_KM = 25;

function dateOnly(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatActivityDate(value?: string | null) {
  const date = dateOnly(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEventDate(value?: string | null) {
  if (!value) {
    return {
      month: "TBA",
      day: "—",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      month: "TBA",
      day: "—",
    };
  }

  return {
    month: date.toLocaleDateString("en-IN", {
      month: "short",
    }),
    day: date.toLocaleDateString("en-IN", {
      day: "2-digit",
    }),
  };
}

/**
 * Activity verification comes from the backend's verified field.
 * We use the helper from activity.service.ts so the dashboard
 * stays synchronized with the API contract.
 */
function isVerified(activity: ActivityResponse) {
  return getActivityStatus(activity) === "VERIFIED";
}

function getDistance(activity: ActivityResponse) {
  return Number(activity.distanceKm || 0);
}

function getActivityTitle(activity: ActivityResponse) {
  if (activity.challengeTitle) {
    return activity.challengeTitle;
  }

  if (activity.source === "STRAVA") {
    return "Strava Activity";
  }

  return "Running Activity";
}

function getUniqueDayKeys(activities: ActivityResponse[]) {
  return new Set(
    activities
      .map((activity) => dateOnly(activity.activityDate))
      .filter(Boolean)
      .map((date) => date!.toISOString().slice(0, 10))
  );
}

function calculateCurrentStreak(activities: ActivityResponse[]) {
  const days = getUniqueDayKeys(activities);

  if (!days.size) {
    return 0;
  }

  const today = new Date();

  let cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const todayKey = cursor.toISOString().slice(0, 10);

  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getStartOfWeek() {
  const today = new Date();

  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  start.setDate(start.getDate() + diff);

  return start;
}

function getVerifiedActivities(activities: ActivityResponse[]) {
  return activities
    .filter(
      (activity) =>
        isVerified(activity) &&
        getDistance(activity) > 0
    )
    .sort((a, b) => {
      const aDate =
        dateOnly(a.activityDate)?.getTime() || 0;

      const bDate =
        dateOnly(b.activityDate)?.getTime() || 0;

      return bDate - aDate;
    });
}

function getPace(activity: ActivityResponse) {
  const distance = getDistance(activity);

  const minutes = getDurationMinutes(activity);

  if (!distance || !minutes) {
    return "—";
  }

  const pace = minutes / distance;

  const whole = Math.floor(pace);

  const seconds = Math.round(
    (pace - whole) * 60
  );

  const safeSeconds =
    seconds === 60 ? 0 : seconds;

  const safeMinutes =
    seconds === 60 ? whole + 1 : whole;

  return `${safeMinutes}'${String(
    safeSeconds
  ).padStart(2, "0")}"/km`;
}

function getChartBars(activities: ActivityResponse[]) {
  const verified = getVerifiedActivities(activities);

  const today = new Date();

  const values: number[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset
    );

    const key = day.toISOString().slice(0, 10);

    const distance = verified
      .filter(
        (activity) =>
          dateOnly(activity.activityDate)
            ?.toISOString()
            .slice(0, 10) === key
      )
      .reduce(
        (sum, activity) =>
          sum + getDistance(activity),
        0
      );

    values.push(distance);
  }

  const max = Math.max(...values, 1);

  return values.map((value) =>
    Math.max(
      value > 0 ? 8 : 3,
      (value / max) * 100
    )
  );
}

export default function DashboardPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [activities, setActivities] =
    useState<ActivityResponse[]>([]);

  const [events, setEvents] =
    useState<EventResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          currentUser,
          myActivities,
          allEvents,
        ] = await Promise.all([
          getCurrentUser(),
          getMyActivities(),
          getEvents(),
        ]);

        if (cancelled) {
          return;
        }

        setUser(currentUser);

        setActivities(
          Array.isArray(myActivities)
            ? myActivities
            : []
        );

        setEvents(
          Array.isArray(allEvents)
            ? allEvents
            : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError) {
          setError(
            err.status === 401
              ? "Your session has expired. Please login again."
              : err.message
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Unable to load your dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  const verifiedActivities = useMemo(
    () => getVerifiedActivities(activities),
    [activities]
  );

  const stats = useMemo(() => {
    const now = new Date();

    const weekStart =
      getStartOfWeek().getTime();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();

    const weeklyDistance =
      verifiedActivities
        .filter(
          (activity) =>
            (dateOnly(
              activity.activityDate
            )?.getTime() || 0) >= weekStart
        )
        .reduce(
          (sum, activity) =>
            sum + getDistance(activity),
          0
        );

    const monthlyDistance =
      verifiedActivities
        .filter(
          (activity) =>
            (dateOnly(
              activity.activityDate
            )?.getTime() || 0) >= monthStart
        )
        .reduce(
          (sum, activity) =>
            sum + getDistance(activity),
          0
        );

    const totalDistance =
      verifiedActivities.reduce(
        (sum, activity) =>
          sum + getDistance(activity),
        0
      );

    const longestRun =
      verifiedActivities.reduce(
        (max, activity) =>
          Math.max(
            max,
            getDistance(activity)
          ),
        0
      );

    const streak =
      calculateCurrentStreak(
        verifiedActivities
      );

    const goalProgress = Math.min(
      (weeklyDistance / WEEKLY_GOAL_KM) * 100,
      100
    );

    return {
      weeklyDistance,
      monthlyDistance,
      totalDistance,
      longestRun,
      streak,
      goalProgress,
    };
  }, [verifiedActivities]);

  const chartBars = useMemo(
    () => getChartBars(activities),
    [activities]
  );

  const recentActivities = useMemo(
    () =>
      verifiedActivities.slice(0, 4),
    [verifiedActivities]
  );

  const upcomingEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event) => {
        const time = event.eventDate
          ? new Date(
              event.eventDate
            ).getTime()
          : Number.POSITIVE_INFINITY;

        return (
          (event.status === "UPCOMING" ||
            !event.status) &&
          time >= now
        );
      })
      .sort((a, b) => {
        const aTime = a.eventDate
          ? new Date(
              a.eventDate
            ).getTime()
          : Number.POSITIVE_INFINITY;

        const bTime = b.eventDate
          ? new Date(
              b.eventDate
            ).getTime()
          : Number.POSITIVE_INFINITY;

        return aTime - bTime;
      })
      .slice(0, 2);
  }, [events]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

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
          font-family:
            Sora,
            Inter,
            ui-sans-serif,
            system-ui,
            sans-serif;
        }

        .srn-gradient {
          background:
            linear-gradient(
              135deg,
              #ff6b35 0%,
              #ba1724 100%
            );
        }

        .srn-scrollbar::-webkit-scrollbar {
          height: 4px;
        }

        .srn-scrollbar::-webkit-scrollbar-thumb {
          background: var(--srn-primary);
          border-radius: 10px;
        }
      `}</style>

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#ffe9e3] py-6 shadow-md lg:flex">
        <div className="mb-12 px-4">
          <Link
            href="/dashboard"
            className="srn-font-sora text-2xl font-extrabold tracking-tight text-[#ab3500]"
          >
            SRN
          </Link>
        </div>

        <div className="mb-8 px-4">
          <p className="truncate text-sm font-bold">
            {loading
              ? "Loading..."
              : user?.name || "Runner"}
          </p>

          <p className="mt-1 text-xs text-[#594139]">
            {user?.role === "ADMIN"
              ? "Admin"
              : "Runner"}
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem
            href="/"
            icon="⌂"
            label="Home"
          />

          <NavItem
            active
            href="/dashboard"
            icon="▣"
            label="Dashboard"
          />

          <NavItem
            href="/dashboard/profile"
            icon="◉"
            label="Profile"
          />

          <NavItem
            href="/dashboard/registrations"
            icon="✓"
            label="My Registrations"
          />

          <NavItem
            href="/dashboard/activities"
            icon="🏃"
            label="My Activities"
          />

          <NavItem
            href="/dashboard/strava"
            icon="↻"
            label="Strava Sync"
          />

          <NavItem
            href="/dashboard/achievements"
            icon="★"
            label="Achievements"
          />

          <NavItem
            href="/dashboard/settings"
            icon="⚙"
            label="Settings"
          />
        </nav>

        <div className="space-y-3 px-4">
          <Link
            href="/dashboard/activities"
            className="srn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95"
          >
            <span>🏃</span>
            Start Run
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e1bfb5] bg-white py-3 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] active:scale-[0.98]"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 border-b border-[#e1bfb5]/30 bg-[#fff8f6]/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="srn-font-sora truncate text-xl font-bold sm:text-2xl">
                {greeting},{" "}
                {user?.name?.split(" ")[0] ||
                  "Runner"}
                !
              </h1>

              <p className="mt-1 text-sm text-[#594139] sm:text-base">
                You&apos;re{" "}
                <span className="font-bold text-[#ab3500]">
                  {Math.max(
                    WEEKLY_GOAL_KM -
                      stats.weeklyDistance,
                    0
                  ).toFixed(1)}{" "}
                  km away
                </span>{" "}
                from your weekly goal.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <span className="hidden rounded-full bg-[#fde3db] px-4 py-2 text-sm font-bold text-[#ab3500] sm:inline-flex">
                ⚡ Runner
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon="↗"
              label="Weekly Distance"
              value={
                loading
                  ? "—"
                  : stats.weeklyDistance.toFixed(
                      1
                    )
              }
              unit="km"
              trend={`${Math.round(
                stats.goalProgress
              )}%`}
            />

            <MetricCard
              icon="▣"
              label="Monthly Distance"
              value={
                loading
                  ? "—"
                  : stats.monthlyDistance.toFixed(
                      1
                    )
              }
              unit="km"
            />

            <MetricCard
              icon="⌁"
              label="Total Runs"
              value={
                loading
                  ? "—"
                  : String(
                      verifiedActivities.length
                    )
              }
            />

            <MetricCard
              gradient
              icon="🔥"
              label="Current Streak"
              value={
                loading
                  ? "—"
                  : String(stats.streak)
              }
              unit="days"
            />
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="srn-font-sora text-2xl font-bold">
                      Running Activity
                    </h2>

                    <p className="mt-1 text-sm text-[#594139] sm:text-base">
                      Distance covered over
                      the last 30 days
                    </p>
                  </div>

                  <span className="rounded-full bg-[#ffe9e3] px-4 py-2 text-sm font-bold text-[#ab3500]">
                    Monthly
                  </span>
                </div>

                {verifiedActivities.length ===
                0 ? (
                  <div className="absolute inset-x-8 bottom-20 top-36 flex items-center justify-center text-center text-sm text-[#8d7168]">
                    No verified activities
                    yet. Start a run and get
                    it verified to see your
                    progress here.
                  </div>
                ) : (
                  <div className="absolute inset-x-6 bottom-5 top-36 flex items-end gap-2 sm:inset-x-8 sm:gap-3">
                    {chartBars.map(
                      (height, index) => (
                        <div
                          key={index}
                          className="group flex h-full flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t-lg bg-[#ab3500]/20 transition-all duration-200 group-hover:bg-[#ab3500]"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="absolute inset-x-8 bottom-5 flex justify-between text-[10px] text-[#8d7168] sm:text-xs">
                  <span>30d ago</span>
                  <span>20d</span>
                  <span>10d</span>
                  <span>Today</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="srn-font-sora text-2xl font-bold">
                    Recent Activities
                  </h2>

                  <Link
                    href="/dashboard/activities"
                    className="text-sm font-bold text-[#ab3500] hover:underline"
                  >
                    View all ↗
                  </Link>
                </div>

                {recentActivities.length ===
                0 ? (
                  <div className="rounded-xl bg-[#fff1ed] p-6 text-sm text-[#594139]">
                    No verified activities
                    found for your account.
                  </div>
                ) : (
                  <div className="divide-y divide-[#e1bfb5]/60">
                    {recentActivities.map(
                      (activity) => (
                        <div
                          key={activity.id}
                          className="group flex items-center justify-between gap-4 rounded-xl px-2 py-4 transition hover:bg-[#fff1ed]"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ab3500]/10 text-lg text-[#ab3500]">
                              🏃
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold sm:text-base">
                                {getActivityTitle(
                                  activity
                                )}
                              </p>

                              <p className="text-xs text-[#594139] sm:text-sm">
                                {formatActivityDate(
                                  activity.activityDate
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-5 text-right sm:gap-8">
                            <Stat
                              label="Distance"
                              value={`${getDistance(
                                activity
                              ).toFixed(1)} km`}
                            />

                            <Stat
                              label="Avg Pace"
                              value={getPace(
                                activity
                              )}
                              hiddenOnMobile
                            />

                            <Stat
                              label="Status"
                              value="Verified"
                              hiddenOnMobile
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5 lg:col-span-4">
              <div className="flex flex-col items-center rounded-[1.5rem] bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#594139]">
                  Progress to Weekly Goal
                </p>

                <div className="relative mb-6 h-48 w-48">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 192 192"
                    aria-label={`${Math.round(
                      stats.goalProgress
                    )} percent complete`}
                  >
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="transparent"
                      stroke="#fde3db"
                      strokeWidth="12"
                    />

                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="transparent"
                      stroke="#ab3500"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="502.6"
                      strokeDashoffset={`${
                        502.6 -
                        (502.6 *
                          stats.goalProgress) /
                          100
                      }`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="srn-font-sora text-3xl font-extrabold">
                      {Math.round(
                        stats.goalProgress
                      )}
                      %
                    </span>

                    <span className="text-xs text-[#594139]">
                      Complete
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#594139] sm:text-base">
                  {stats.weeklyDistance.toFixed(
                    1
                  )}{" "}
                  km / {WEEKLY_GOAL_KM} km
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#e1bfb5]/30 bg-[#fff1ed] p-6 sm:p-8">
                <h2 className="srn-font-sora mb-6 text-2xl font-bold">
                  Upcoming Events
                </h2>

                {upcomingEvents.length ===
                0 ? (
                  <p className="rounded-xl bg-white p-4 text-sm text-[#594139]">
                    No upcoming events
                    available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map(
                      (event, index) => {
                        const date =
                          formatEventDate(
                            event.eventDate
                          );

                        return (
                          <Link
                            href={`/events/${event.id}`}
                            key={event.id}
                            className="flex gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div
                              className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg ${
                                index === 0
                                  ? "bg-[#ab3500]/10 text-[#ab3500]"
                                  : "bg-[#ba1724]/10 text-[#ba1724]"
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase">
                                {date.month}
                              </span>

                              <span className="text-lg font-bold">
                                {date.day}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold leading-tight">
                                {event.title}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#594139]">
                                {event.location ||
                                  "Location TBA"}
                              </p>
                            </div>
                          </Link>
                        );
                      }
                    )}
                  </div>
                )}

                <Link
                  href="/events"
                  className="mt-6 block text-center text-sm font-bold text-[#ab3500] hover:underline"
                >
                  Browse More Events
                </Link>
              </div>

              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#594139]">
                  Running Summary
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <SummaryItem
                    label="Total Distance"
                    value={`${stats.totalDistance.toFixed(
                      1
                    )} km`}
                  />

                  <SummaryItem
                    label="Longest Run"
                    value={`${stats.longestRun.toFixed(
                      1
                    )} km`}
                  />

                  <SummaryItem
                    label="Active Days"
                    value={String(
                      getUniqueDayKeys(
                        verifiedActivities
                      ).size
                    )}
                  />

                  <SummaryItem
                    label="Verified Runs"
                    value={String(
                      verifiedActivities.length
                    )}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-[#e1bfb5] bg-[#f7ddd5] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="srn-font-sora text-2xl font-extrabold text-[#ab3500]">
                SRN
              </span>

              <p className="text-sm text-[#594139]">
                © 2024 Sunrise Runners Network.
                All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-sm text-[#594139]">
              <Link
                href="#"
                className="hover:text-[#ab3500]"
              >
                Privacy Policy
              </Link>

              <Link
                href="#"
                className="hover:text-[#ab3500]"
              >
                Terms of Service
              </Link>

              <Link
                href="#"
                className="hover:text-[#ab3500]"
              >
                Contact Us
              </Link>

              <Link
                href="#"
                className="hover:text-[#ab3500]"
              >
                Support
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({
  active,
  href,
  icon,
  label,
}: {
  active?: boolean;
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
        active
          ? "bg-[#ff6b35] text-[#5f1900]"
          : "text-[#594139] hover:bg-[#f7ddd5]"
      }`}
    >
      <span className="w-5 text-center">
        {icon}
      </span>

      {label}
    </Link>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  trend,
  gradient,
}: {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  gradient?: boolean;
}) {
  return (
    <div
      className={`group rounded-[1.5rem] p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        gradient
          ? "srn-gradient text-white shadow-lg"
          : "bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
            gradient
              ? "bg-white/20"
              : "bg-[#ab3500]/10 text-[#ab3500]"
          }`}
        >
          {icon}
        </div>

        {trend && (
          <span className="flex items-center text-xs font-bold text-green-600">
            ↗ {trend}
          </span>
        )}
      </div>

      <p
        className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
          gradient
            ? "text-white/80"
            : "text-[#594139]"
        }`}
      >
        {label}
      </p>

      <p className="srn-font-sora mt-2 text-3xl font-extrabold">
        {value}

        {unit && (
          <span className="ml-1 font-sans text-base font-normal">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hiddenOnMobile,
}: {
  label: string;
  value: string;
  hiddenOnMobile?: boolean;
}) {
  return (
    <div
      className={
        hiddenOnMobile
          ? "hidden md:block"
          : "block"
      }
    >
      <p className="text-sm font-bold">
        {value}
      </p>

      <p className="text-[10px] text-[#594139] sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fff1ed] p-4 text-left">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#594139]">
        {label}
      </p>

      <p className="mt-1 text-lg font-extrabold">
        {value}
      </p>
    </div>
  );
}