"use client";

import { useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";

type AwardType =
  | "OVERALL_WINNER"
  | "CATEGORY_WINNER"
  | "RUNNER_UP"
  | "SPECIAL_AWARD"
  | string;

interface WinnerResponse {
  id: number;
  challengeId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  userId: number;
  name?: string | null;
  profilePhotoUrl?: string | null;
  rank: number;
  awardType: AwardType;
  awardNote?: string | null;
  announcedAt?: string | null;
}

interface CreateWinnerRequest {
  challengeId: number;
  categoryId?: number | null;
  userId: number;
  rank: number;
  awardType: string;
  awardNote?: string | null;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminResultsPage() {
  // IMPORTANT:
  // Keep this as STRING so the input never becomes NaN / locked.
  const [challengeIdInput, setChallengeIdInput] = useState("");

  const [winners, setWinners] = useState<WinnerResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [loadingWinners, setLoadingWinners] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // Declare winner form
  const [form, setForm] = useState({
    challengeId: "",
    categoryId: "",
    userId: "",
    rank: "1",
    awardType: "CATEGORY_WINNER",
    awardNote: "",
  });

  function handleChallengeIdChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return;
    }

    setChallengeIdInput(value);
  }

  async function loadWinners() {
    setError("");
    setHasSearched(false);

    const trimmed = challengeIdInput.trim();

    if (!trimmed) {
      setError("Challenge ID is required.");
      return;
    }

    const challengeId = Number(trimmed);

    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      setError("Please enter a valid Challenge ID.");
      return;
    }

    try {
      setLoadingWinners(true);

      const response = await apiClient.get<WinnerResponse[]>(
        `/api/challenges/${challengeId}/winners`
      );

      setWinners(Array.isArray(response) ? response : []);
      setHasSearched(true);
    } catch (err) {
      setWinners([]);
      setHasSearched(true);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load winners.");
      }
    } finally {
      setLoadingWinners(false);
    }
  }

  function handleFormChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateWinner(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const challengeId = Number(form.challengeId);
    const userId = Number(form.userId);
    const rank = Number(form.rank);

    const categoryId = form.categoryId.trim()
      ? Number(form.categoryId)
      : null;

    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      setError("Valid Challenge ID is required.");
      return;
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Valid User ID is required.");
      return;
    }

    if (!Number.isInteger(rank) || rank <= 0) {
      setError("Valid Rank is required.");
      return;
    }

    if (
      categoryId !== null &&
      (!Number.isInteger(categoryId) || categoryId <= 0)
    ) {
      setError("Category ID must be a valid number.");
      return;
    }

    const payload: CreateWinnerRequest = {
      challengeId,
      categoryId,
      userId,
      rank,
      awardType: form.awardType,
      awardNote: form.awardNote.trim() || null,
    };

    try {
      setSubmitting(true);

      await apiClient.post<WinnerResponse>(
        "/api/admin/winners",
        payload
      );

      // After successful creation, automatically load winners
      setChallengeIdInput(String(challengeId));

      setForm((previous) => ({
        ...previous,
        challengeId: String(challengeId),
        userId: "",
        awardNote: "",
      }));

      await loadWinners();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to declare winner.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWinner(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this winner?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiClient.delete(`/api/admin/winners/${id}`);

      // Refresh current challenge results
      if (challengeIdInput.trim()) {
        await loadWinners();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete winner.");
      }
    }
  }

  function useChallengeForWinnerForm() {
    if (!challengeIdInput.trim()) {
      setError("Enter a Challenge ID first.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      challengeId: challengeIdInput,
    }));

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-950">
            Results / Winners
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage challenge winners and publish final results.
          </p>
        </div>

        <button
          type="button"
          onClick={loadWinners}
          disabled={loadingWinners}
          className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingWinners ? "Loading..." : "Refresh Results"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* VIEW RESULTS */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-950">
            View Challenge Results
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Enter a challenge ID to load its published winners.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-64">
            <label
              htmlFor="results-challenge-id"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
            >
              Challenge ID
            </label>

            {/* FIXED INPUT */}
            <input
              id="results-challenge-id"
              name="challengeId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={challengeIdInput}
              onChange={handleChallengeIdChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  loadWinners();
                }
              }}
              placeholder="e.g. 1"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="button"
            onClick={loadWinners}
            disabled={loadingWinners}
            className="h-12 rounded-xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingWinners ? "Loading..." : "Load Winners"}
          </button>
        </div>

        {/* Results */}
        <div className="mt-6">
          {loadingWinners ? (
            <div className="rounded-xl bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              Loading winners...
            </div>
          ) : hasSearched && winners.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              No winners found for this challenge.
            </div>
          ) : winners.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Rank
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Winner
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Award
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Announced
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {winners.map((winner) => (
                    <tr key={winner.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">
                          {winner.rank}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-950">
                          {winner.name || `User #${winner.userId}`}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          User ID: {winner.userId}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {winner.categoryName ||
                          (winner.categoryId
                            ? `Category #${winner.categoryId}`
                            : "-")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                          {winner.awardType}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(winner.announcedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteWinner(winner.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 px-5 py-8 text-center text-sm text-gray-400">
              Enter a Challenge ID and click "Load Winners".
            </div>
          )}
        </div>

        {winners.length > 0 && (
          <button
            type="button"
            onClick={useChallengeForWinnerForm}
            className="mt-5 rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-50"
          >
            Use Challenge #{challengeIdInput} for Winner Form
          </button>
        )}
      </section>

      {/* DECLARE WINNER */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Administration
          </p>

          <h2 className="mt-2 text-2xl font-black text-gray-950">
            Declare Winner
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add a winner to a challenge.
          </p>
        </div>

        <form onSubmit={handleCreateWinner} className="mt-7 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Challenge ID */}
            <div>
              <label
                htmlFor="form-challenge-id"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                Challenge ID
              </label>

              <input
                id="form-challenge-id"
                name="challengeId"
                type="text"
                inputMode="numeric"
                value={form.challengeId}
                onChange={handleFormChange}
                placeholder="e.g. 1"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Category ID */}
            <div>
              <label
                htmlFor="category-id"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                Category ID
              </label>

              <input
                id="category-id"
                name="categoryId"
                type="text"
                inputMode="numeric"
                value={form.categoryId}
                onChange={handleFormChange}
                placeholder="e.g. 1"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* User ID */}
            <div>
              <label
                htmlFor="user-id"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                User ID
              </label>

              <input
                id="user-id"
                name="userId"
                type="text"
                inputMode="numeric"
                value={form.userId}
                onChange={handleFormChange}
                placeholder="e.g. 25"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Rank */}
            <div>
              <label
                htmlFor="rank"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                Rank
              </label>

              <input
                id="rank"
                name="rank"
                type="text"
                inputMode="numeric"
                value={form.rank}
                onChange={handleFormChange}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Award Type */}
            <div>
              <label
                htmlFor="award-type"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                Award Type
              </label>

              <select
                id="award-type"
                name="awardType"
                value={form.awardType}
                onChange={handleFormChange}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="CATEGORY_WINNER">
                  CATEGORY WINNER
                </option>
                <option value="OVERALL_WINNER">
                  OVERALL WINNER
                </option>
                <option value="RUNNER_UP">RUNNER UP</option>
                <option value="SPECIAL_AWARD">SPECIAL AWARD</option>
              </select>
            </div>

            {/* Award Note */}
            <div>
              <label
                htmlFor="award-note"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-gray-600"
              >
                Award Note
              </label>

              <input
                id="award-note"
                name="awardNote"
                type="text"
                value={form.awardNote}
                onChange={handleFormChange}
                placeholder="e.g. Outstanding performance"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
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