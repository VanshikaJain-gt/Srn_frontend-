"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/lib/api-client";
import { Challenge, getChallenges } from "@/services/challenge.service";
import {
  AwardType,
  createWinner,
  deleteWinner,
  getChallengeLeaderboard,
  getChallengeWinners,
  LeaderboardEntry,
  WinnerResponse,
} from "@/services/result.service";

/** Backend enum AwardType. */
const AWARD_TYPES: { value: AwardType; label: string }[] = [
  { value: "CATEGORY_WINNER", label: "Category Winner" },
  { value: "FINISHER", label: "Finisher" },
  { value: "SPECIAL_RECOGNITION", label: "Special Recognition" },
];

const EMPTY_FORM = {
  userId: "",
  rank: "",
  awardType: "CATEGORY_WINNER" as AwardType,
  awardNote: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function awardLabel(type: AwardType) {
  return AWARD_TYPES.find((item) => item.value === type)?.label ?? type;
}

export default function AdminResultsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeId, setChallengeId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<WinnerResponse[]>([]);

  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedChallenge = useMemo(
    () => challenges.find((challenge) => String(challenge.id) === challengeId) ?? null,
    [challenges, challengeId]
  );

  useEffect(() => {
    getChallenges()
      .then((data) => {
        setChallenges(data);
        if (data.length > 0) setChallengeId(String(data[0].id));
      })
      .catch((err) => setError(getErrorMessage(err, "Unable to load challenges.")))
      .finally(() => setLoadingChallenges(false));
  }, []);

  async function loadResults(id: string, category: string) {
    if (!id) {
      setLeaderboard([]);
      setWinners([]);
      return;
    }

    try {
      setLoadingResults(true);
      setError("");

      const [leaderboardData, winnersData] = await Promise.all([
        getChallengeLeaderboard(Number(id), category ? Number(category) : undefined),
        getChallengeWinners(Number(id)),
      ]);

      setLeaderboard(leaderboardData);
      setWinners(winnersData);
    } catch (err) {
      setLeaderboard([]);
      setWinners([]);
      setError(getErrorMessage(err, "Unable to load results."));
    } finally {
      setLoadingResults(false);
    }
  }

  useEffect(() => {
    loadResults(challengeId, categoryId);
  }, [challengeId, categoryId]);

  function pickRunner(entry: LeaderboardEntry) {
    setForm((previous) => ({
      ...previous,
      userId: String(entry.userId),
      rank: String(entry.rank),
    }));
    setSuccess("");
    document.getElementById("declare-winner")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleCreateWinner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSuccess("");

    const userId = Number(form.userId);
    const rank = form.rank.trim() ? Number(form.rank) : null;

    if (!selectedChallenge) {
      setError("Select a challenge first.");
      return;
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Pick a runner from the leaderboard or enter a valid User ID.");
      return;
    }

    if (rank !== null && (!Number.isInteger(rank) || rank <= 0)) {
      setError("Rank must be a positive whole number.");
      return;
    }

    try {
      setSubmitting(true);

      await createWinner({
        challengeId: selectedChallenge.id,
        categoryId: categoryId ? Number(categoryId) : null,
        userId,
        rank,
        awardType: form.awardType,
        awardNote: form.awardNote.trim() || null,
      });

      setSuccess("Winner declared.");
      setForm(EMPTY_FORM);
      await loadResults(challengeId, categoryId);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to declare winner."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWinner(winner: WinnerResponse) {
    if (deletingId != null) return;
    if (!window.confirm(`Remove ${winner.name} from the winners list?`)) return;

    try {
      setDeletingId(winner.id);
      setError("");
      setSuccess("");
      await deleteWinner(winner.id);
      await loadResults(challengeId, categoryId);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete winner."));
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-950">Results & Winners</h1>
        <p className="mt-2 text-sm text-gray-500">
          Review the verified-distance leaderboard and declare official winners.
        </p>
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
              Challenge
            </span>
            <select
              value={challengeId}
              onChange={(e) => {
                setChallengeId(e.target.value);
                setCategoryId("");
                setSuccess("");
              }}
              disabled={loadingChallenges || challenges.length === 0}
              className={inputClass}
            >
              {loadingChallenges ? (
                <option value="">Loading challenges...</option>
              ) : challenges.length === 0 ? (
                <option value="">No challenges available</option>
              ) : (
                challenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title} ({challenge.status})
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!selectedChallenge}
              className={inputClass}
            >
              <option value="">All categories</option>
              {selectedChallenge?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-950">Leaderboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Verified distance only. Pick a runner to prefill the winner form.
          </p>

          {loadingResults ? (
            <p className="py-10 text-center text-sm text-gray-500">Loading...</p>
          ) : leaderboard.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No verified activities yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Runner</th>
                    <th className="py-2 pr-3">KM</th>
                    <th className="py-2 pr-3">Days</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.userId} className="border-t border-gray-100">
                      <td className="py-3 pr-3 font-black">{entry.rank}</td>
                      <td className="py-3 pr-3">
                        <p className="font-bold text-gray-900">{entry.name}</p>
                        <p className="text-xs text-gray-400">User #{entry.userId}</p>
                      </td>
                      <td className="py-3 pr-3">{Number(entry.totalVerifiedKm).toFixed(2)}</td>
                      <td className="py-3 pr-3">{entry.activeDays}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => pickRunner(entry)}
                          className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-50"
                        >
                          Pick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-950">Declared Winners</h2>
          <p className="mt-1 text-sm text-gray-500">Shown publicly on the Leaderboard page.</p>

          {loadingResults ? (
            <p className="py-10 text-center text-sm text-gray-500">Loading...</p>
          ) : winners.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No winners declared yet.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {winners.map((winner) => (
                <li
                  key={winner.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {winner.rank != null ? `#${winner.rank} · ` : ""}
                      {winner.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {awardLabel(winner.awardType)}
                      {winner.categoryName ? ` · ${winner.categoryName}` : ""}
                      {` · ${formatDate(winner.announcedAt)}`}
                    </p>
                    {winner.awardNote && (
                      <p className="mt-1 text-sm text-gray-600">{winner.awardNote}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWinner(winner)}
                    disabled={deletingId != null}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === winner.id ? "Removing..." : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section id="declare-winner" className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-950">Declare Winner</h2>
        <p className="mt-1 text-sm text-gray-500">
          For {selectedChallenge?.title ?? "the selected challenge"}
          {categoryId
            ? ` · ${selectedChallenge?.categories.find((c) => String(c.id) === categoryId)?.name ?? ""}`
            : " · no specific category"}
        </p>

        <form onSubmit={handleCreateWinner} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                User ID
              </span>
              <input
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                placeholder="Pick from leaderboard"
                disabled={submitting}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                Rank (optional)
              </span>
              <input
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                disabled={submitting}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                Award Type
              </span>
              <select
                value={form.awardType}
                onChange={(e) => setForm({ ...form, awardType: e.target.value as AwardType })}
                disabled={submitting}
                className={inputClass}
              >
                {AWARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                Award Note (optional)
              </span>
              <input
                value={form.awardNote}
                onChange={(e) => setForm({ ...form, awardNote: e.target.value })}
                maxLength={255}
                disabled={submitting}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting || !selectedChallenge}
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Declaring..." : "Declare Winner"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
