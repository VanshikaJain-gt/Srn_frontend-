"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  ActivityResponse,
  getMyActivities,
} from "@/services/activity.service";
import { getCurrentUser, logoutUser, User } from "@/services/auth.service";
import { useRouter } from "next/navigation";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
  progress: number;
  target: number;
  progressLabel: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVerifiedActivities(activities: ActivityResponse[]) {
  return activities.filter(
    (activity) =>
      activity.verified === true &&
      Number(activity.distanceKm) > 0 &&
      activity.activityDate
  );
}

function getUniqueActivityDays(activities: ActivityResponse[]) {
  return new Set(
    activities
      .filter((activity) => activity.activityDate)
      .map((activity) => activity.activityDate)
  ).size;
}

function buildAchievements(activities: ActivityResponse[]): Achievement[] {
  const verified = getVerifiedActivities(activities);

  const totalDistance = verified.reduce(
    (sum, activity) => sum + Number(activity.distanceKm || 0),
    0
  );

  const longestRun = verified.reduce(
    (max, activity) => Math.max(max, Number(activity.distanceKm || 0)),
    0
  );

  const activeDays = getUniqueActivityDays(verified);

  const firstRun = verified.length >= 1;
  const fiveKmRun = longestRun >= 5;
  const tenKmRun = longestRun >= 10;

  return [
    {
      id: "first-run",
      title: "First Run",
      description: "Complete and get your first activity verified.",
      icon: "🏃",
      requirement: "1 verified activity",
      unlocked: firstRun,
      progress: Math.min(verified.length, 1),
      target: 1,
      progressLabel: `${Math.min(verified.length, 1)} / 1 activity`,
    },
    {
      id: "5k-run",
      title: "5K Runner",
      description: "Complete a single verified activity of at least 5 km.",
      icon: "🔥",
      requirement: "5 km in one activity",
      unlocked: fiveKmRun,
      progress: Math.min(longestRun, 5),
      target: 5,
      progressLabel: `${Math.min(longestRun, 5).toFixed(1)} / 5 km`,
    },
    {
      id: "10k-run",
      title: "10K Hero",
      description: "Complete a single verified activity of at least 10 km.",
      icon: "🏅",
      requirement: "10 km in one activity",
      unlocked: tenKmRun,
      progress: Math.min(longestRun, 10),
      target: 10,
      progressLabel: `${Math.min(longestRun, 10).toFixed(1)} / 10 km`,
    },
    {
      id: "25k-total",
      title: "25K Club",
      description: "Accumulate 25 km across verified activities.",
      icon: "⚡",
      requirement: "25 km total",
      unlocked: totalDistance >= 25,
      progress: Math.min(totalDistance, 25),
      target: 25,
      progressLabel: `${Math.min(totalDistance, 25).toFixed(1)} / 25 km`,
    },
    {
      id: "50k-total",
      title: "50K Club",
      description: "Accumulate 50 km across verified activities.",
      icon: "🥇",
      requirement: "50 km total",
      unlocked: totalDistance >= 50,
      progress: Math.min(totalDistance, 50),
      target: 50,
      progressLabel: `${Math.min(totalDistance, 50).toFixed(1)} / 50 km`,
    },
    {
      id: "100k-total",
      title: "100K Club",
      description: "Accumulate 100 km across verified activities.",
      icon: "🏆",
      requirement: "100 km total",
      unlocked: totalDistance >= 100,
      progress: Math.min(totalDistance, 100),
      target: 100,
      progressLabel: `${Math.min(totalDistance, 100).toFixed(1)} / 100 km`,
    },
    {
      id: "seven-days",
      title: "Consistent Runner",
      description: "Run on at least 7 different days.",
      icon: "📅",
      requirement: "7 active days",
      unlocked: activeDays >= 7,
      progress: Math.min(activeDays, 7),
      target: 7,
      progressLabel: `${Math.min(activeDays, 7)} / 7 days`,
    },
    {
      id: "150k-total",
      title: "Distance Legend",
      description: "Accumulate 150 km across verified activities.",
      icon: "👑",
      requirement: "150 km total",
      unlocked: totalDistance >= 150,
      progress: Math.min(totalDistance, 150),
      target: 150,
      progressLabel: `${Math.min(totalDistance, 150).toFixed(1)} / 150 km`,
    },
  ];
}

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadAchievements(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [currentUser, myActivities] = await Promise.all([
        getCurrentUser(),
        getMyActivities(),
      ]);

      setUser(currentUser);
      setActivities(myActivities);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load your achievements."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAchievements();
  }, []);

  const verifiedActivities = useMemo(
    () => getVerifiedActivities(activities),
    [activities]
  );

  const stats = useMemo(() => {
    const totalDistance = verifiedActivities.reduce(
      (sum, activity) => sum + Number(activity.distanceKm || 0),
      0
    );

    const totalDuration = verifiedActivities.reduce(
      (sum, activity) => sum + Number(activity.durationSec || 0),
      0
    );

    const longestRun = verifiedActivities.reduce(
      (max, activity) => Math.max(max, Number(activity.distanceKm || 0)),
      0
    );

    const activeDays = getUniqueActivityDays(verifiedActivities);

    return {
      totalDistance,
      totalDuration,
      longestRun,
      activeDays,
      totalRuns: verifiedActivities.length,
    };
  }, [verifiedActivities]);

  const achievements = useMemo(
    () => buildAchievements(activities),
    [activities]
  );

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  const recentVerified = useMemo(
    () => verifiedActivities.slice(0, 5),
    [verifiedActivities]
  );

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#261814]">
      <style jsx global>{`
        :root {
          --srn-primary: #ab3500;
          --srn-primary-container: #ff6b35;
          --srn-surface: #fff8f6;
          --srn-surface-low: #fff1ed;
          --srn-surface-high: #fde3db;
          --srn-outline: #8d7168;
          --srn-outline-variant: #e1bfb5;
          --srn-text: #261814;
          --srn-text-muted: #594139;
        }

        .srn-font-sora {
          font-family: Sora, Inter, ui-sans-serif, system-ui, sans-serif;
        }

        .srn-gradient {
          background: linear-gradient(135deg, #ff6b35 0%, #ba1724 100%);
        }
      `}</style>

      {/* Desktop Sidebar — kept identical to the main Dashboard sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#ffe9e3] py-6 shadow-md lg:flex">
        <div className="mb-12 px-4">
          <div className="srn-font-sora text-2xl font-extrabold tracking-tight text-[#ab3500]">
            SRN
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3 px-4">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f7ddd5]">
            {user?.profilePhotoUrl ? (
              <img
                className="h-full w-full object-cover"
                src={user.profilePhotoUrl}
                alt="Runner profile"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-[#ab3500]">
                {(user?.name?.charAt(0) || "R").toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {loading ? "Loading..." : user?.name || "Runner"}
            </p>
            <p className="text-xs text-[#594139]">
              {user?.role === "ADMIN" ? "Admin" : "Runner"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/" icon="⌂" label="Home" />
          <NavItem href="/dashboard" icon="▣" label="Dashboard" />
          <NavItem href="/dashboard/profile" icon="◉" label="Profile" />
          <NavItem href="/dashboard/registrations" icon="✓" label="My Registrations" />
          <NavItem href="/dashboard/activities" icon="🏃" label="My Activities" />
          <NavItem href="/dashboard/strava" icon="↻" label="Strava Sync" />
          <NavItem active href="/dashboard/achievements" icon="★" label="Achievements" />
          <NavItem href="/dashboard/settings" icon="⚙" label="Settings" />
        </nav>

        <div className="space-y-3 px-4">
          <button
            type="button"
            className="srn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95"
          >
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

      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 border-b border-[#e1bfb5]/30 bg-[#fff8f6]/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ab3500]">
                Progress
              </p>
              <h1 className="srn-font-sora mt-1 text-xl font-bold sm:text-2xl">
                Achievements
              </h1>
            </div>

            <button
              type="button"
              onClick={() => loadAchievements(true)}
              disabled={refreshing || loading}
              className="rounded-full border border-[#e1bfb5] bg-white px-4 py-2 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section className="srn-gradient overflow-hidden rounded-[1.5rem] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80">
                  {user?.name ? `${user.name}'s` : "Your"} running journey
                </p>
                <h2 className="srn-font-sora mt-2 text-3xl font-extrabold sm:text-4xl">
                  Keep running. Keep unlocking.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                  Achievements are calculated from your verified activities
                  returned by the backend. Pending or rejected activities do
                  not count toward achievement progress.
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-6 py-5 text-center backdrop-blur-sm">
                <p className="text-4xl font-extrabold">
                  {loading ? "—" : `${unlockedCount}/${achievements.length}`}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/80">
                  Achievements unlocked
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Verified Runs" value={loading ? "—" : stats.totalRuns.toString()} />
            <StatCard
              label="Total Distance"
              value={loading ? "—" : `${stats.totalDistance.toFixed(1)} km`}
            />
            <StatCard
              label="Longest Run"
              value={loading ? "—" : `${stats.longestRun.toFixed(1)} km`}
            />
            <StatCard
              label="Active Days"
              value={loading ? "—" : stats.activeDays.toString()}
            />
          </section>

          <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="srn-font-sora text-2xl font-bold">
                Achievement Badges
              </h2>
              <p className="mt-1 text-sm text-[#594139]">
                Unlock badges by completing the requirements below.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-52 animate-pulse rounded-2xl bg-[#fff1ed]"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="srn-font-sora text-2xl font-bold">
                  Verified Activity History
                </h2>
                <p className="mt-1 text-sm text-[#594139]">
                  These activities are the source of your achievement progress.
                </p>
              </div>

              <Link
                href="/dashboard/activities"
                className="text-sm font-bold text-[#ab3500] hover:underline"
              >
                View all →
              </Link>
            </div>

            {recentVerified.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e1bfb5] bg-[#fff8f6] p-8 text-center">
                <div className="text-4xl">🏃</div>
                <h3 className="mt-3 font-bold">No verified activities yet</h3>
                <p className="mt-1 text-sm text-[#594139]">
                  Submit an activity and wait for verification to start
                  unlocking achievements.
                </p>
                <Link
                  href="/dashboard/activities"
                  className="mt-5 inline-flex rounded-full bg-[#ab3500] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Add Activity
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#e1bfb5]/60">
                {recentVerified.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ab3500]/10 text-lg">
                        🏃
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {activity.challengeTitle || "Running Activity"}
                        </p>
                        <p className="text-xs text-[#594139]">
                          {formatDate(activity.activityDate)} ·{" "}
                          {activity.source || "MANUAL"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="font-bold">
                          {Number(activity.distanceKm).toFixed(1)} km
                        </p>
                        <p className="text-xs text-[#594139]">Distance</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
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
      className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
        active
          ? "bg-[#ff6b35] text-[#5f1900]"
          : "text-[#594139] hover:bg-[#f7ddd5]"
      }`}
    >
      <span className="w-5 text-center">{icon}</span>
      {label}
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#594139]">
        {label}
      </p>
      <p className="srn-font-sora mt-2 text-2xl font-extrabold text-[#261814]">
        {value}
      </p>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const percent = Math.min(
    100,
    Math.round((achievement.progress / achievement.target) * 100)
  );

  return (
    <div
      className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
        achievement.unlocked
          ? "border-[#ffb49a] bg-[#fff8f6]"
          : "border-[#ead9d3] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            achievement.unlocked
              ? "bg-[#fde3db]"
              : "bg-[#f2eeec] grayscale opacity-60"
          }`}
        >
          {achievement.icon}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
            achievement.unlocked
              ? "bg-green-100 text-green-700"
              : "bg-[#f2eeec] text-[#8d7168]"
          }`}
        >
          {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <h3 className="mt-5 font-bold">{achievement.title}</h3>
      <p className="mt-1 min-h-[42px] text-xs leading-5 text-[#594139]">
        {achievement.description}
      </p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[#594139]">
          <span>{achievement.requirement}</span>
          <span>{achievement.progressLabel}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#f1e4df]">
          <div
            className={`h-full rounded-full transition-all ${
              achievement.unlocked ? "bg-[#ab3500]" : "bg-[#d4bdb5]"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
