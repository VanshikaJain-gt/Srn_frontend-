"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityResponse,
  getAdminActivities,
  rejectActivity,
  verifyActivity,
} from "@/services/activity.service";
import { ApiError } from "@/lib/api-client";

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

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  async function loadActivities() {
    try {
      setLoading(true);
      setError("");
      setActivities(await getAdminActivities());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Admin session expired. Please login again.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("You do not have permission to access activity moderation.");
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to load activities."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((activity) => activity.status === filter);
  }, [activities, filter]);

  async function handleVerify(id: number) {
    try {
      setWorkingId(id);
      setError("");
      await verifyActivity(id);
      await loadActivities();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify activity."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt("Reason for rejecting this activity:", "");
    if (reason === null) return;

    try {
      setWorkingId(id);
      setError("");
      await rejectActivity(id, { reason: reason.trim() || undefined });
      await loadActivities();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject activity."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Management
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">
            Activities
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review manual activities submitted by runners.
          </p>
        </div>

        <button
          type="button"
          onClick={loadActivities}
          className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === value
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-orange-50"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No activities found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity) => {
              const isWorking = workingId === activity.id;
              const status = activity.status || "PENDING";

              return (
                <div key={activity.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl">
                        🏃
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-gray-950">
                            {activity.challengeTitle || "Challenge Activity"}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              status === "VERIFIED"
                                ? "bg-green-100 text-green-700"
                                : status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Activity #{activity.id}
                          {activity.registrationId
                            ? ` • Registration #${activity.registrationId}`
                            : ""}
                          {" • "}
                          {formatDate(activity.activityDate)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Info
                            label="Distance"
                            value={`${activity.distanceKm} KM`}
                          />
                          <Info
                            label="Duration"
                            value={
                              activity.durationMinutes
                                ? `${activity.durationMinutes} min`
                                : "-"
                            }
                          />
                          <Info
                            label="Type"
                            value={activity.activityType || "-"}
                          />
                          <Info
                            label="Source"
                            value={activity.source || "MANUAL"}
                          />
                        </div>
                      </div>
                    </div>

                    {status === "PENDING" && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleReject(activity.id)}
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isWorking ? "Working..." : "Reject"}
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleVerify(activity.id)}
                          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isWorking ? "Working..." : "Verify"}
                        </button>
                      </div>
                    )}
                  </div>

                  {activity.rejectionReason && (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                      Rejection reason: {activity.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-gray-400">{label}: </span>
      <span className="font-bold text-gray-700">{value}</span>
    </span>
  );
}
