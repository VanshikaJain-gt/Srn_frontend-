"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
} from "@/lib/api-client";
import { getMyRegistrations, RegistrationResponse } from "@/services/registration.service";
import {
  ActivityResponse,
  createManualActivity,
  getActivityStatus,
  getDurationMinutes,
  getMyActivities,
} from "@/services/activity.service";

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

function statusClass(status?: string | null) {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function ActivitiesPage() {
  const router = useRouter();

  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [registrationId, setRegistrationId] = useState("");
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [caption, setCaption] = useState("");

  const activeChallengeRegistrations = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.challengeId &&
          registration.registrationStatus === "ACTIVE"
      ),
    [registrations]
  );

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [activityData, registrationData] = await Promise.all([
        getMyActivities(),
        getMyRegistrations(),
      ]);

      setActivities(activityData);
      setRegistrations(registrationData);

      if (!registrationId) {
        const firstActive = registrationData.find(
          (registration) =>
            registration.challengeId &&
            registration.registrationStatus === "ACTIVE"
        );
        if (firstActive) {
          setRegistrationId(String(firstActive.id));
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Unable to load activities."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // registrationId is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const selectedRegistrationId = Number(registrationId);
    const distance = Number(distanceKm);
    const duration = durationMinutes ? Number(durationMinutes) : null;

    if (!selectedRegistrationId) {
      setError("Please select an active challenge registration.");
      return;
    }

    if (!activityDate) {
      setError("Please select the activity date.");
      return;
    }

    if (!Number.isFinite(distance) || distance <= 0) {
      setError("Distance must be greater than 0 KM.");
      return;
    }

    if (
      duration !== null &&
      (!Number.isFinite(duration) || duration <= 0)
    ) {
      setError("Duration must be greater than 0 minutes.");
      return;
    }

    try {
      setSubmitting(true);

      const selectedRegistration = activeChallengeRegistrations.find(
        (registration) => Number(registration.id) === selectedRegistrationId
      );

      if (!selectedRegistration?.challengeId) {
        setError("Selected registration has no challenge ID.");
        return;
      }

      if (duration === null) {
        setError("Duration is required.");
        return;
      }

      await createManualActivity({
        challengeId: Number(selectedRegistration.challengeId),
        activityDate,
        distanceKm: distance,
        durationSec: Math.round(duration * 60),
        caption: caption.trim() || null,
      });

      setSuccess(
        "Activity submitted successfully. It is now waiting for verification."
      );
      setDistanceKm("");
      setDurationMinutes("");
      setCaption("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit activity."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] px-4 py-6 text-[#261814] sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ab3500]">
            Activities
          </p>
          <h1 className="mt-2 font-[Sora] text-3xl font-black sm:text-4xl">
            My Activities
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#594139] sm:text-base">
            Submit your manual running activity and track its verification
            status.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="h-fit rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-7">
            <h2 className="font-[Sora] text-xl font-bold">
              Submit Activity
            </h2>
            <p className="mt-1 text-sm text-[#594139]">
              Only an active challenge registration can be used.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Challenge Registration">
                <select
                  value={registrationId}
                  onChange={(event) => setRegistrationId(event.target.value)}
                  className="w-full rounded-xl border border-[#e1bfb5] bg-white px-4 py-3 text-sm outline-none focus:border-[#ab3500]"
                  disabled={!activeChallengeRegistrations.length}
                >
                  <option value="">Select registration</option>
                  {activeChallengeRegistrations.map((registration) => (
                    <option key={registration.id} value={registration.id}>
                      #{registration.id} — {registration.challengeTitle || "Challenge"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Activity Date">
                <input
                  type="date"
                  value={activityDate}
                  onChange={(event) => setActivityDate(event.target.value)}
                  className="w-full rounded-xl border border-[#e1bfb5] px-4 py-3 text-sm outline-none focus:border-[#ab3500]"
                />
              </Field>

              <Field label="Distance (KM)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={distanceKm}
                  onChange={(event) => setDistanceKm(event.target.value)}
                  placeholder="e.g. 5.25"
                  className="w-full rounded-xl border border-[#e1bfb5] px-4 py-3 text-sm outline-none focus:border-[#ab3500]"
                />
              </Field>

              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  placeholder="e.g. 32"
                  className="w-full rounded-xl border border-[#e1bfb5] px-4 py-3 text-sm outline-none focus:border-[#ab3500]"
                />
              </Field>

              <Field label="Activity Caption (optional)">
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="e.g. Morning 5K run at the park"
                  className="w-full resize-none rounded-xl border border-[#e1bfb5] px-4 py-3 text-sm outline-none focus:border-[#ab3500]"
                />
              </Field>

              {!activeChallengeRegistrations.length && !loading && (
                <div className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#594139]">
                  You need an active challenge registration before submitting
                  an activity.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting || loading || !activeChallengeRegistrations.length
                }
                className="w-full rounded-xl bg-[#ff5a1f] px-4 py-3 font-bold text-white transition hover:bg-[#e84b14] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Activity"}
              </button>
            </form>
          </section>

          <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-[Sora] text-xl font-bold">
                  Activity History
                </h2>
                <p className="mt-1 text-sm text-[#594139]">
                  Your submitted manual activities.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                className="rounded-xl border border-[#e1bfb5] px-4 py-2 text-sm font-bold text-[#ab3500] hover:bg-[#fff1ed]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[#594139]">
                Loading activities...
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-2xl bg-[#fff1ed] px-6 py-12 text-center">
                <div className="text-4xl">🏃</div>
                <h3 className="mt-3 font-bold">No activities yet</h3>
                <p className="mt-1 text-sm text-[#594139]">
                  Submit your first manual activity from the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-[#f0ded8] p-4 transition hover:bg-[#fffaf8]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffe9e3] text-xl">
                          🏃
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold">
                            {activity.challengeTitle || "Challenge Activity"}
                          </p>
                          <p className="mt-1 text-xs text-[#594139]">
                            {formatDate(activity.activityDate)}
                            {activity.caption ? ` • ${activity.caption}` : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          getActivityStatus(activity)
                        )}`}
                      >
                        {getActivityStatus(activity)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Stat label="Distance" value={`${activity.distanceKm} KM`} />
                      <Stat
                        label="Duration"
                        value={
                          `${getDurationMinutes(activity)} min`
                        }
                      />
                      <Stat
                        label="Source"
                        value={activity.source || "MANUAL"}
                      />
                      <Stat label="Activity ID" value={`#${activity.id}`} />
                    </div>

                    {activity.rejectionReason && (
                      <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                        Rejection reason: {activity.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#594139]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f9f9f8] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
