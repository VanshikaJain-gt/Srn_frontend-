"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  getChallengeLeaderboard,
  getChallengeWinners,
  LeaderboardEntry,
  WinnerResponse,
} from "@/services/result.service";

interface ChallengeOption {
  id: number;
  title: string;
  name?: string;
}

function formatKm(value: number) {
  return Number(value || 0).toFixed(2);
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ResultsPage() {
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<WinnerResponse[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChallenges() {
      try {
        setLoadingChallenges(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1121"}/api/challenges`
        );

        if (!response.ok) {
          throw new Error("Unable to load challenges.");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        const normalized: ChallengeOption[] = list.map(
          (challenge: {
            id: number;
            title?: string;
            name?: string;
          }) => ({
            id: challenge.id,
            title: challenge.title || challenge.name || `Challenge #${challenge.id}`,
            name: challenge.name,
          })
        );

        setChallenges(normalized);

        if (normalized.length > 0) {
          setSelectedChallengeId(String(normalized[0].id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load challenges."
        );
      } finally {
        setLoadingChallenges(false);
      }
    }

    loadChallenges();
  }, []);

  useEffect(() => {
    if (!selectedChallengeId) {
      setLeaderboard([]);
      setWinners([]);
      return;
    }

    async function loadResults() {
      try {
        setLoadingResults(true);
        setError("");

        const challengeId = Number(selectedChallengeId);

        const [leaderboardData, winnersData] = await Promise.all([
          getChallengeLeaderboard(challengeId),
          getChallengeWinners(challengeId),
        ]);

        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        setWinners(Array.isArray(winnersData) ? winnersData : []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setLeaderboard([]);
          setWinners([]);
          setError("Results are not available for this challenge yet.");
        } else {
          setError(
            err instanceof Error ? err.message : "Unable to load results."
          );
        }
      } finally {
        setLoadingResults(false);
      }
    }

    loadResults();
  }, [selectedChallengeId]);

  const topThree = useMemo(
    () => leaderboard.filter((entry) => entry.rank <= 3),
    [leaderboard]
  );

  const remainingLeaderboard = useMemo(
    () => leaderboard.filter((entry) => entry.rank > 3),
    [leaderboard]
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Sunrise Runners Network
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-950">
            Results & Winners
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
            View challenge leaderboards and officially announced winners.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <label
            htmlFor="challenge"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Select Challenge
          </label>

          <select
            id="challenge"
            value={selectedChallengeId}
            onChange={(event) => setSelectedChallengeId(event.target.value)}
            disabled={loadingChallenges || challenges.length === 0}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-orange-500 sm:max-w-xl"
          >
            {loadingChallenges ? (
              <option value="">Loading challenges...</option>
            ) : challenges.length === 0 ? (
              <option value="">No challenges available</option>
            ) : (
              challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title}
                </option>
              ))
            )}
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loadingResults ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center text-sm text-gray-500 shadow-sm">
            Loading results...
          </div>
        ) : (
          <>
            <section className="mb-10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                  Leaderboard
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Challenge Rankings
                </h2>
              </div>

              {leaderboard.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center text-sm text-gray-500 shadow-sm">
                  No leaderboard results available yet.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    {topThree.map((entry) => (
                      <div
                        key={`${entry.userId}-${entry.rank}`}
                        className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-lg font-black text-orange-700">
                          {entry.profilePhotoUrl ? (
                            <img
                              src={entry.profilePhotoUrl}
                              alt={entry.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(entry.name)
                          )}
                        </div>

                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-orange-600">
                          Rank #{entry.rank}
                        </p>

                        <h3 className="mt-1 text-lg font-black text-gray-950">
                          {entry.name}
                        </h3>

                        <p className="mt-3 text-2xl font-black text-gray-950">
                          {formatKm(entry.totalVerifiedKm)} KM
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {entry.activityCount} activities • {entry.activeDays} active days
                        </p>
                      </div>
                    ))}
                  </div>

                  {remainingLeaderboard.length > 0 && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div className="divide-y divide-gray-100">
                        {remainingLeaderboard.map((entry) => (
                          <div
                            key={`${entry.userId}-${entry.rank}`}
                            className="flex items-center justify-between gap-4 px-5 py-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="w-8 text-center text-sm font-black text-gray-400">
                                #{entry.rank}
                              </span>

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-black text-gray-600">
                                {entry.profilePhotoUrl ? (
                                  <img
                                    src={entry.profilePhotoUrl}
                                    alt={entry.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(entry.name)
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">
                                  {entry.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {entry.activityCount} activities • {entry.activeDays} active days
                                </p>
                              </div>
                            </div>

                            <p className="shrink-0 text-sm font-black text-gray-900">
                              {formatKm(entry.totalVerifiedKm)} KM
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                  Official Results
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Winners
                </h2>
              </div>

              {winners.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center text-sm text-gray-500 shadow-sm">
                  Winners have not been announced yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-black text-orange-700">
                          {winner.profilePhotoUrl ? (
                            <img
                              src={winner.profilePhotoUrl}
                              alt={winner.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(winner.name)
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-black text-gray-950">
                            {winner.name}
                          </h3>

                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                            {winner.awardType.replaceAll("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 text-sm">
                        {winner.rank != null && (
                          <p className="text-gray-600">
                            Rank:{" "}
                            <span className="font-bold text-gray-900">
                              #{winner.rank}
                            </span>
                          </p>
                        )}

                        {winner.categoryName && (
                          <p className="text-gray-600">
                            Category:{" "}
                            <span className="font-bold text-gray-900">
                              {winner.categoryName}
                            </span>
                          </p>
                        )}

                        {winner.awardNote && (
                          <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                            {winner.awardNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
