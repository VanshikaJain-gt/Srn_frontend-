"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiClient } from "@/lib/api-client";
import { cancelAdminRegistration } from "@/services/registration.service";
import { refundRegistration } from "@/services/payment.service";

type AdminRegistration = {
  id: number;
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  eventId?: number | null;
  eventTitle?: string | null;
  challengeId?: number | null;
  challengeTitle?: string | null;
  registrationStatus?: string | null;
  paymentStatus?: string | null;
  feePaid?: number | null;
  registrationFee?: number | null;
  registeredAt?: string | null;
  registrationSource?: string | null;
  tshirtSize?: string | null;
  [key: string]: unknown;
};

type RegistrationPageResponse = {
  content?: AdminRegistration[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};

function normalizeRegistrations(
  response: AdminRegistration[] | RegistrationPageResponse
): AdminRegistration[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.content) ? response.content : [];
}

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

function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getTitle(registration: AdminRegistration) {
  return (
    registration.eventTitle ||
    registration.challengeTitle ||
    (registration.eventId ? `Event #${registration.eventId}` : null) ||
    (registration.challengeId ? `Challenge #${registration.challengeId}` : null) ||
    "Registration"
  );
}

function getParticipantName(registration: AdminRegistration) {
  return (
    registration.userName ||
    (typeof registration["name"] === "string"
      ? registration["name"]
      : null) ||
    (typeof registration["user"] === "object" &&
    registration["user"] &&
    "name" in (registration["user"] as Record<string, unknown>)
      ? String((registration["user"] as Record<string, unknown>).name)
      : null) ||
    `User #${registration.userId ?? "-"}`
  );
}

function statusClass(status?: string | null) {
  const value = (status || "UNKNOWN").toUpperCase();

  if (value === "ACTIVE" || value === "PAID" || value === "VERIFIED") {
    return "bg-green-100 text-green-700";
  }

  if (value === "PENDING") {
    return "bg-orange-100 text-orange-700";
  }

  if (value === "CANCELLED" || value === "REJECTED" || value === "FAILED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<AdminRegistration | null>(null);
  const [refundTarget, setRefundTarget] = useState<AdminRegistration | null>(null);
  const [refundReference, setRefundReference] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get<
        AdminRegistration[] | RegistrationPageResponse
      >("/api/admin/registrations");

      setRegistrations(normalizeRegistrations(response));
    } catch (err) {
      setRegistrations([]);

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Admin session expired. Please login again.");
        } else if (err.status === 403) {
          setError("You do not have permission to access registrations.");
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load registrations.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function handleCancel(registration: AdminRegistration) {
    if (
      String(registration.registrationStatus || "").toUpperCase() !== "ACTIVE"
    ) {
      return;
    }

    const paymentStatus = String(
      registration.paymentStatus || "UNKNOWN"
    ).toUpperCase();

    if (paymentStatus === "PAID" || paymentStatus === "VERIFIED") {
      setRefundTarget(registration);
      setRefundReference("");
      setRefundNote("");
      setActionError("");
      setActionSuccess("");
      return;
    }

    const confirmed = window.confirm(
      `Cancel registration #${registration.id} for ${getParticipantName(
        registration
      )}?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(registration.id);
      setActionError("");
      setActionSuccess("");

      await cancelAdminRegistration(registration.id);

      setActionSuccess(
        `Registration #${registration.id} was cancelled successfully.`
      );

      setSelected(null);
      await loadRegistrations();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to cancel registration."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRefundAndCancel() {
    if (!refundTarget) return;

    try {
      setActionLoadingId(refundTarget.id);
      setActionError("");
      setActionSuccess("");

      await refundRegistration(refundTarget.id, {
        refundReference: refundReference.trim() || undefined,
        note: refundNote.trim() || undefined,
      });

      /*
       * Backend intentionally keeps a refunded registration ACTIVE.
       * Cancellation is a separate state transition, so complete both
       * operations in sequence.
       */
      await cancelAdminRegistration(refundTarget.id);

      setActionSuccess(
        `Registration #${refundTarget.id} was refunded and cancelled successfully.`
      );

      setRefundTarget(null);
      setRefundReference("");
      setRefundNote("");
      setSelected(null);
      await loadRegistrations();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Refund/cancellation failed."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function openDetails(registration: AdminRegistration) {
    setSelected(registration);
    setActionError("");
    setActionSuccess("");
  }

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const status =
        String(registration.registrationStatus || "UNKNOWN").toUpperCase();

      const searchable = [
        registration.id,
        registration.userId,
        getParticipantName(registration),
        registration.userEmail,
        registration.eventTitle,
        registration.challengeTitle,
        registration.eventId,
        registration.challengeId,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, search, statusFilter]);

  const statuses = useMemo(() => {
    const values = new Set<string>();

    registrations.forEach((registration) => {
      if (registration.registrationStatus) {
        values.add(String(registration.registrationStatus).toUpperCase());
      }
    });

    return Array.from(values).sort();
  }, [registrations]);

  return (
    <main className="min-h-screen bg-[#faf9f7] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Management
            </p>
            <h1 className="mt-2 text-4xl font-bold text-gray-950">
              Registrations
            </h1>
            <p className="mt-2 text-gray-600">
              View event and challenge registrations from the admin panel.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRegistrations}
            disabled={loading}
            className="rounded-xl border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {actionSuccess}
          </div>
        )}

        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search participant, event, challenge..."
              className="min-w-[280px] flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-400"
            >
              <option value="ALL">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-20 text-center">
              <p className="text-lg font-semibold text-gray-800">
                No registrations found.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                The admin API returned no registrations matching your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-4">Participant</th>
                    <th className="px-3 py-4">Event / Challenge</th>
                    <th className="px-3 py-4">Registered</th>
                    <th className="px-3 py-4">Fee</th>
                    <th className="px-3 py-4">Payment</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-3 py-5">
                        <div className="font-semibold text-gray-900">
                          {getParticipantName(registration)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.userEmail || `User #${registration.userId ?? "-"}`}
                        </div>
                      </td>

                      <td className="px-3 py-5">
                        <div className="font-medium text-gray-900">
                          {getTitle(registration)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Registration #{registration.id}
                        </div>
                      </td>

                      <td className="px-3 py-5 text-sm text-gray-600">
                        {formatDate(registration.registeredAt)}
                      </td>

                      <td className="px-3 py-5 font-semibold text-gray-800">
                        {formatMoney(
                          registration.feePaid ?? registration.registrationFee
                        )}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            registration.paymentStatus
                          )}`}
                        >
                          {registration.paymentStatus || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            registration.registrationStatus
                          )}`}
                        >
                          {registration.registrationStatus || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(registration)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          {String(registration.registrationStatus || "").toUpperCase() ===
                            "ACTIVE" && (
                            <button
                              type="button"
                              disabled={actionLoadingId === registration.id}
                              onClick={() => handleCancel(registration)}
                              className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                ["PAID", "VERIFIED"].includes(
                                  String(registration.paymentStatus || "").toUpperCase()
                                )
                                  ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                  : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
                              }`}
                            >
                              {actionLoadingId === registration.id
                                ? "Processing..."
                                : ["PAID", "VERIFIED"].includes(
                                    String(registration.paymentStatus || "").toUpperCase()
                                  )
                                  ? "Refund & Cancel"
                                  : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-modal-title"
            style={{
              width: "min(720px, calc(100vw - 32px))",
              minWidth: "320px",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              flexShrink: 0,
            }}
            className="rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-gray-100 pb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Registration #{selected.id}
                </p>
                <h2
                  id="registration-modal-title"
                  className="mt-2 break-words text-2xl font-bold leading-tight text-gray-950"
                >
                  {getParticipantName(selected)}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Registration details
                </p>
              </div>

              <button
                type="button"
                aria-label="Close registration details"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Event / Challenge
                </p>
                <p className="mt-2 break-words font-semibold text-gray-900">
                  {getTitle(selected)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  User ID
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {selected.userId ?? "-"}
                </p>
              </div>

              <div className="min-w-0 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </p>
                <p className="mt-2 break-all font-semibold text-gray-900">
                  {selected.userEmail || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {selected.userPhone || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payment
                </p>
                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      selected.paymentStatus
                    )}`}
                  >
                    {selected.paymentStatus || "UNKNOWN"}
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Registration Status
                </p>
                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      selected.registrationStatus
                    )}`}
                  >
                    {selected.registrationStatus || "UNKNOWN"}
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fee Paid
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {formatMoney(selected.feePaid)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  T-Shirt Size
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {selected.tshirtSize || "-"}
                </p>
              </div>
            </div>

            {String(selected.registrationStatus || "").toUpperCase() ===
              "ACTIVE" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={actionLoadingId === selected.id}
                  onClick={() => handleCancel(selected)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    ["PAID", "VERIFIED"].includes(
                      String(selected.paymentStatus || "").toUpperCase()
                    )
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {actionLoadingId === selected.id
                    ? "Processing..."
                    : ["PAID", "VERIFIED"].includes(
                        String(selected.paymentStatus || "").toUpperCase()
                      )
                      ? "Refund & Cancel Registration"
                      : "Cancel Registration"}
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Cancellation & refund
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Pending or free registrations can be cancelled directly.
                Paid/verified registrations must be refunded first and are
                then cancelled automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {refundTarget && (
        <div
          className="fixed inset-0 z-[10000] flex h-screen w-screen items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (actionLoadingId == null) {
                setRefundTarget(null);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-modal-title"
            style={{
              width: "min(560px, calc(100vw - 32px))",
              minWidth: "320px",
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              boxSizing: "border-box",
              flexShrink: 0,
            }}
            className="rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Refund & Cancellation
                </p>
                <h2
                  id="refund-modal-title"
                  className="mt-2 text-2xl font-bold text-gray-950"
                >
                  Registration #{refundTarget.id}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {getParticipantName(refundTarget)} · {getTitle(refundTarget)}
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoadingId != null}
                onClick={() => setRefundTarget(null)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              <p className="font-semibold">
                Refund amount: {formatMoney(refundTarget.feePaid)}
              </p>
              <p className="mt-1 leading-6">
                Razorpay payments are refunded through Razorpay. For manual
                payments, enter the offline refund reference below.
              </p>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-800">
                Refund reference
              </span>
              <input
                value={refundReference}
                onChange={(event) => setRefundReference(event.target.value)}
                placeholder="Required for manual/offline refunds"
                maxLength={100}
                style={{ width: "100%", boxSizing: "border-box" }}
                className="mt-2 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-800">
                Refund note
              </span>
              <textarea
                value={refundNote}
                onChange={(event) => setRefundNote(event.target.value)}
                placeholder="Optional admin note"
                maxLength={255}
                rows={3}
                style={{ width: "100%", boxSizing: "border-box" }}
                className="mt-2 resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoadingId != null}
                onClick={() => setRefundTarget(null)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={actionLoadingId != null}
                onClick={handleRefundAndCancel}
                className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoadingId != null
                  ? "Processing..."
                  : "Refund & Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
