"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";

import {
  Challenge,
  ChallengeCategory,
  getChallengeById,
} from "@/services/challenge.service";

import {
  registerForChallenge,
  TshirtSize,
  RegistrationResponse,
} from "@/services/registration.service";

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

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
    case "ACTIVE":
      return "Live Now";
    case "UPCOMING":
      return "Upcoming";
    case "RESULTS_PENDING":
      return "Results Pending";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function getStatusClass(status: Challenge["status"]) {
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

function formatCategoryTarget(category: ChallengeCategory) {
  if (category.categoryType === "DISTANCE_TARGET") {
    return category.targetKm != null
      ? `${category.targetKm} KM`
      : "Distance target";
  }

  return category.maxDurationMinutes != null
    ? `${category.maxDurationMinutes} minutes`
    : "Duration target";
}

function formatFee(fee: number | null) {
  if (fee == null || fee === 0) {
    return "Free";
  }

  return `₹${fee}`;
}

function getPaymentMessage(registration: RegistrationResponse) {
  switch (registration.paymentStatus) {
    case "NOT_REQUIRED":
      return "Registration completed successfully.";

    case "PENDING":
      return "Registration created. Payment is pending.";

    case "PAID":
      return "Payment received successfully.";

    case "VERIFIED":
      return "Registration and payment verified.";

    default:
      return "Registration completed.";
  }
}

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const challengeId = Number(params.id);

  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [registrationCreated, setRegistrationCreated] =
    useState(false);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [tshirtSize, setTshirtSize] =
    useState<TshirtSize>("M");

  useEffect(() => {
    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      setError("Invalid challenge ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadChallenge() {
      try {
        setLoading(true);
        setError("");

        const data = await getChallengeById(challengeId);

        if (cancelled) {
          return;
        }

        setChallenge(data);

        if (data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0].id);
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
          setError("Unable to load challenge.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChallenge();

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  const selectedCategory = useMemo(() => {
    if (!challenge || selectedCategoryId == null) {
      return null;
    }

    return (
      challenge.categories.find(
        (category) => category.id === selectedCategoryId
      ) ?? null
    );
  }, [challenge, selectedCategoryId]);

  async function handleRegister() {
    setError("");
    setSuccess("");

    if (!challenge) {
      return;
    }

    if (!selectedCategoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      setRegistering(true);

      const registration =
        await registerForChallenge({
          challengeId: challenge.id,
          categoryId: selectedCategoryId,
          tshirtSize,
        });

      setRegistrationCreated(true);
      setSuccess(getPaymentMessage(registration));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(
            "Please login before registering for a challenge."
          );
          return;
        }

        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to register for this challenge.");
      }
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-6 py-16">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-6 w-32 rounded bg-orange-100" />
          <div className="mt-6 h-14 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 h-5 w-1/2 rounded bg-gray-200" />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-3xl bg-gray-100 lg:col-span-2" />
            <div className="h-72 rounded-3xl bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !challenge) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-red-400">
            error
          </span>

          <h1 className="mt-4 text-2xl font-black text-red-950">
            Unable to load challenge
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-700">
            {error}
          </p>

          <Link
            href="/challenges"
            className="mt-6 inline-flex rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            Back to Challenges
          </Link>
        </div>
      </main>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      {/* Hero */}
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Challenges
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${getStatusClass(
                  challenge.status
                )}`}
              >
                {getStatusLabel(challenge.status)}
              </span>

              {challenge.stravaCaptionTag && (
                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                  {challenge.stravaCaptionTag}
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
              {challenge.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium text-white/90">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
                {formatDate(challenge.startDate)} –{" "}
                {formatDate(challenge.endDate)}
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  category
                </span>
                {challenge.categories.length}{" "}
                {challenge.categories.length === 1
                  ? "Category"
                  : "Categories"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                About the challenge
              </p>

              <h2 className="mt-2 text-2xl font-black text-gray-950">
                Challenge Overview
              </h2>

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600 md:text-base">
                {challenge.description ||
                  "No additional description has been provided for this challenge."}
              </p>
            </div>

            {/* Categories */}
            <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Participation options
                </p>

                <h2 className="mt-2 text-2xl font-black text-gray-950">
                  Choose Your Category
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {challenge.categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    selected={
                      selectedCategoryId === category.id
                    }
                    onSelect={() =>
                      setSelectedCategoryId(category.id)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                Challenge requirements
              </p>

              <h2 className="mt-2 text-2xl font-black text-gray-950">
                Your selected category
              </h2>

              {selectedCategory ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Requirement
                    label="Category"
                    value={selectedCategory.name}
                  />

                  <Requirement
                    label="Activity"
                    value={
                      selectedCategory.activityType ?? "-"
                    }
                  />

                  <Requirement
                    label={
                      selectedCategory.categoryType ===
                      "DISTANCE_TARGET"
                        ? "Target"
                        : "Duration"
                    }
                    value={formatCategoryTarget(
                      selectedCategory
                    )}
                  />

                  <Requirement
                    label="Minimum Distance / Activity"
                    value={
                      selectedCategory.minDistancePerActivityKm !=
                      null
                        ? `${selectedCategory.minDistancePerActivityKm} KM`
                        : "-"
                    }
                  />

                  <Requirement
                    label="Maximum Pace"
                    value={
                      selectedCategory.maxPaceMinPerKm !=
                      null
                        ? `${selectedCategory.maxPaceMinPerKm} min/km`
                        : "-"
                    }
                  />

                  <Requirement
                    label="Minimum Finisher Days"
                    value={
                      selectedCategory.minDaysForFinisher !=
                      null
                        ? `${selectedCategory.minDaysForFinisher} days`
                        : "-"
                    }
                  />
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Select a category to see its requirements.
                </p>
              )}
            </div>
          </div>

          {/* Registration */}
          <aside>
            <div className="sticky top-24 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                Ready to participate?
              </p>

              <h2 className="mt-2 text-2xl font-black text-gray-950">
                Join this challenge
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Select your category and T-shirt size to
                register.
              </p>

              {selectedCategory && (
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                        Selected category
                      </p>

                      <p className="mt-1 text-lg font-black text-gray-950">
                        {selectedCategory.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {selectedCategory.activityType ??
                          "Activity"}
                      </p>
                    </div>

                    <p className="text-lg font-black text-orange-600">
                      {formatFee(selectedCategory.fee)}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-orange-100 pt-4">
                    <p className="text-xs text-gray-500">
                      {formatCategoryTarget(
                        selectedCategory
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  T-Shirt Size
                </label>

                <select
                  value={tshirtSize}
                  onChange={(event) =>
                    setTshirtSize(
                      event.target.value as TshirtSize
                    )
                  }
                  disabled={registrationCreated}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="text-sm font-medium text-green-700">
                    {success}
                  </p>

                  {registrationCreated && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/dashboard/registrations"
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Go to My Registrations

                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleRegister}
                disabled={
                  registering ||
                  registrationCreated ||
                  !selectedCategory ||
                  challenge.status === "COMPLETED"
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {registrationCreated ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    Registered
                  </>
                ) : registering ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    Registering...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      how_to_reg
                    </span>
                    Register Now
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                Registration requires an authenticated
                Sunrise Runners account.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function CategoryCard({
  category,
  selected,
  onSelect,
}: {
  category: ChallengeCategory;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-3xl border p-6 text-left transition ${
        selected
          ? "border-orange-500 bg-orange-50 shadow-sm"
          : "border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-950">
            {category.name}
          </h3>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {category.activityType || "Activity"}
          </p>
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-sm font-black shadow-sm ${
            selected
              ? "bg-orange-600 text-white"
              : "bg-white text-orange-600"
          }`}
        >
          {selected ? "Selected" : formatFee(category.fee)}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <DetailItem
          label={
            category.categoryType ===
            "DISTANCE_TARGET"
              ? "Target"
              : "Duration"
          }
          value={formatCategoryTarget(category)}
        />

        <DetailItem
          label="Min / Activity"
          value={
            category.minDistancePerActivityKm !=
            null
              ? `${category.minDistancePerActivityKm} KM`
              : "-"
          }
        />

        <DetailItem
          label="Max Pace"
          value={
            category.maxPaceMinPerKm != null
              ? `${category.maxPaceMinPerKm} min/km`
              : "-"
          }
        />

        <DetailItem
          label="Finisher Days"
          value={
            category.minDaysForFinisher != null
              ? `${category.minDaysForFinisher} days`
              : "-"
          }
        />
      </div>
    </button>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Requirement({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}