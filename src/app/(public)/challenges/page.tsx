"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ApiError,
} from "@/lib/api-client";
import {
  Challenge,
  ChallengeCategory,
  getChallenges,
} from "@/services/challenge.service";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: Challenge["status"]) {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "ACTIVE":
      return "Live Now";
    case "RESULTS_PENDING":
      return "Results Pending";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function getStatusClasses(status: Challenge["status"]) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "UPCOMING":
      return "bg-orange-100 text-orange-700";
    case "RESULTS_PENDING":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatCategory(category: ChallengeCategory) {
  if (category.categoryType === "DISTANCE_TARGET") {
    return category.targetKm != null
      ? `${category.targetKm} KM`
      : "Distance challenge";
  }

  if (category.categoryType === "PACE_DURATION") {
    return category.maxDurationMinutes != null
      ? `${category.maxDurationMinutes} min`
      : "Pace challenge";
  }

  return category.name;
}

function formatFee(fee: number | null) {
  if (fee == null) {
    return null;
  }

  return fee === 0 ? "Free" : `₹${fee}`;
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const visibleCategories = challenge.categories.slice(0, 3);
  const extraCategoryCount = Math.max(
    challenge.categories.length - visibleCategories.length,
    0
  );

  return (
    <article className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
              challenge.status
            )}`}
          >
            {getStatusLabel(challenge.status)}
          </span>

          {challenge.stravaCaptionTag && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {challenge.stravaCaptionTag}
            </span>
          )}
        </div>

        <h2 className="mt-8 text-2xl font-bold leading-tight">
          {challenge.title}
        </h2>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/90">
          <span>
            {formatDate(challenge.startDate)} –{" "}
            {formatDate(challenge.endDate)}
          </span>

          <span>
            {challenge.categories.length}{" "}
            {challenge.categories.length === 1 ? "Category" : "Categories"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="min-h-[72px] text-sm leading-6 text-gray-600">
          {challenge.description || "Join this Sunrise Runners challenge."}
        </p>

        <div className="mt-6 space-y-3">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-orange-50 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {category.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {category.activityType || category.categoryType}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-orange-600">
                  {formatCategory(category)}
                </p>

                {formatFee(category.fee) && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatFee(category.fee)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {extraCategoryCount > 0 && (
            <p className="px-1 text-xs font-medium text-gray-500">
              +{extraCategoryCount} more{" "}
              {extraCategoryCount === 1 ? "category" : "categories"}
            </p>
          )}
        </div>

        <Link
          href={`/challenges/${challenge.id}`}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          View Challenge
        </Link>
      </div>
    </article>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadChallenges() {
      try {
        setLoading(true);
        setError("");

        const data = await getChallenges();

        if (!cancelled) {
          setChallenges(data);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load challenges.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.status === "ACTIVE"),
    [challenges]
  );

  const upcomingChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.status === "UPCOMING"),
    [challenges]
  );

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              Sunrise Runners Network
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
              Challenges that keep you moving.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Pick a challenge, choose your category, and run with the
              community.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Challenges</p>
              <p className="mt-2 text-3xl font-black text-gray-950">
                {challenges.length}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Live Now</p>
              <p className="mt-2 text-3xl font-black text-gray-950">
                {activeChallenges.length}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="mt-2 text-3xl font-black text-gray-950">
                {upcomingChallenges.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-orange-100 bg-white"
              >
                <div className="h-52 bg-orange-100" />
                <div className="space-y-4 p-6">
                  <div className="h-5 w-2/3 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-12 rounded-2xl bg-gray-200" />
                  <div className="h-12 rounded-2xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-900">
              Unable to load challenges
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && challenges.length === 0 && (
          <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              No challenges available
            </h2>
            <p className="mt-3 text-gray-600">
              There are no challenges available right now.
            </p>
          </div>
        )}

        {!loading && !error && challenges.length > 0 && (
          <>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
                  All challenges
                </p>
                <h2 className="mt-2 text-3xl font-black text-gray-950">
                  Find your next run
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                {challenges.length}{" "}
                {challenges.length === 1 ? "challenge" : "challenges"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}