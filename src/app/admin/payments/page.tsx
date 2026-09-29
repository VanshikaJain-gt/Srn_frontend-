"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  createManualPayment,
  getAdminPayments,
  refundPayment,
  PaymentResponse,
} from "@/services/payment.service";

const STATUS_OPTIONS = [
  "ALL",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
];

const MODE_OPTIONS = [
  "UPI",
  "PAYTM",
  "CASH",
  "OTHER",
];

function money(value?: number | null) {
  if (value == null) return "-";

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "VERIFIED":
      return "bg-green-100 text-green-700";
    case "REFUNDED":
      return "bg-red-100 text-red-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "SUBMITTED":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState("ALL");
  const [registrationId, setRegistrationId] = useState("");

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selected, setSelected] =
    useState<PaymentResponse | null>(null);

  const [refundTarget, setRefundTarget] =
    useState<PaymentResponse | null>(null);

  const [refundReference, setRefundReference] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const [manualOpen, setManualOpen] = useState(false);
  const [manualRegistrationId, setManualRegistrationId] =
    useState("");
  const [manualMode, setManualMode] = useState("UPI");
  const [manualTxnReference, setManualTxnReference] =
    useState("");
  const [manualScreenshotUrl, setManualScreenshotUrl] =
    useState("");

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminPayments(
        page,
        20,
        status,
        registrationId
          ? Number(registrationId)
          : undefined
      );

      setPayments(result.content ?? []);
      setTotalElements(result.totalElements ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (e) {
      setPayments([]);

      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to load payments."
      );
    } finally {
      setLoading(false);
    }
  }, [page, status, registrationId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function handleRefund() {
    if (!refundTarget) return;

    try {
      setWorking(true);
      setError("");
      setSuccess("");

      await refundPayment(refundTarget.id, {
        refundReference:
          refundReference.trim() || undefined,
        note: refundNote.trim() || undefined,
      });

      setSuccess(
        `Payment #${refundTarget.id} refunded successfully.`
      );

      setRefundTarget(null);
      setRefundReference("");
      setRefundNote("");

      await loadPayments();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Refund failed."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleManualPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const id = Number(manualRegistrationId);

    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter a valid registration ID.");
      return;
    }

    try {
      setWorking(true);
      setError("");
      setSuccess("");

      await createManualPayment({
        registrationId: id,
        mode: manualMode,
        txnReference:
          manualTxnReference.trim() || undefined,
        screenshotUrl:
          manualScreenshotUrl.trim() || undefined,
      });

      setSuccess(
        `Manual payment recorded for registration #${id}.`
      );

      setManualOpen(false);
      setManualRegistrationId("");
      setManualTxnReference("");
      setManualScreenshotUrl("");

      setPage(0);
      await loadPayments();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Manual payment failed."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="min-h-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-950">
            Payments
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage payment records, manual payments and refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setManualOpen(true);
          }}
          className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white"
        >
          + Manual Payment
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={registrationId}
            onChange={(event) => {
              setRegistrationId(event.target.value);
              setPage(0);
            }}
            placeholder="Registration ID"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-orange-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-[#fffaf7] text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Registration</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Mode</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Transaction</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-gray-500"
                  >
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-gray-500"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const currentStatus =
                    String(payment.status).toUpperCase();

                  return (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-5 py-5 font-bold">
                        #{payment.id}
                      </td>

                      <td className="px-5 py-5">
                        #{payment.registrationId}
                      </td>

                      <td className="px-5 py-5 font-bold">
                        {money(payment.amount)}
                      </td>

                      <td className="px-5 py-5">
                        {payment.mode}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        {payment.txnReference || "-"}
                      </td>

                      <td className="px-5 py-5 text-sm">
                        {formatDate(
                          payment.verifiedAt ||
                            payment.refundedAt
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(payment)
                            }
                            className="rounded-lg border px-3 py-2 text-xs font-bold"
                          >
                            View
                          </button>

                          {currentStatus === "VERIFIED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setRefundTarget(payment);
                                setRefundReference("");
                                setRefundNote("");
                              }}
                              className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-gray-500">
          <span>
            Total: <b>{totalElements}</b>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() =>
                setPage((current) =>
                  Math.max(0, current - 1)
                )
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span>
              Page {page + 1} / {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                totalPages === 0 ||
                page >= totalPages - 1
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <Modal
          title={`Payment #${selected.id}`}
          close={() => setSelected(null)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info
              label="Registration"
              value={`#${selected.registrationId}`}
            />

            <Info
              label="Amount"
              value={money(selected.amount)}
            />

            <Info
              label="Mode"
              value={selected.mode}
            />

            <Info
              label="Status"
              value={selected.status}
            />

            <Info
              label="Transaction reference"
              value={selected.txnReference || "-"}
            />

            <Info
              label="Verified at"
              value={formatDate(selected.verifiedAt)}
            />

            <Info
              label="Refund reference"
              value={selected.refundReference || "-"}
            />

            <Info
              label="Refunded at"
              value={formatDate(selected.refundedAt)}
            />

            <Info
              label="Refund note"
              value={selected.refundNote || "-"}
            />
          </div>
        </Modal>
      )}

      {refundTarget && (
        <Modal
          title={`Refund Payment #${refundTarget.id}`}
          close={() => {
            if (!working) {
              setRefundTarget(null);
            }
          }}
        >
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-bold">
              Amount: {money(refundTarget.amount)}
            </p>

            <p className="mt-1 text-sm">
              Mode: {refundTarget.mode}
            </p>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Refund reference

            <input
              value={refundReference}
              onChange={(event) =>
                setRefundReference(event.target.value)
              }
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Optional"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold">
            Note

            <textarea
              value={refundNote}
              onChange={(event) =>
                setRefundNote(event.target.value)
              }
              rows={4}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Refund note"
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={working}
              onClick={() => setRefundTarget(null)}
              className="rounded-xl border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={working}
              onClick={handleRefund}
              className="rounded-xl bg-orange-700 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {working
                ? "Processing..."
                : "Confirm Refund"}
            </button>
          </div>
        </Modal>
      )}

      {manualOpen && (
        <Modal
          title="Record Manual Payment"
          close={() => {
            if (!working) {
              setManualOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleManualPayment}
            className="space-y-4"
          >
            <label className="block text-sm font-semibold">
              Registration ID

              <input
                required
                type="number"
                min="1"
                value={manualRegistrationId}
                onChange={(event) =>
                  setManualRegistrationId(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </label>

            <label className="block text-sm font-semibold">
              Payment mode

              <select
                value={manualMode}
                onChange={(event) =>
                  setManualMode(event.target.value)
                }
                className="mt-2 w-full rounded-xl border px-4 py-3"
              >
                {MODE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Transaction reference

              <input
                value={manualTxnReference}
                onChange={(event) =>
                  setManualTxnReference(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border px-4 py-3"
                placeholder="Transaction ID"
              />
            </label>

            <label className="block text-sm font-semibold">
              Screenshot URL

              <input
                value={manualScreenshotUrl}
                onChange={(event) =>
                  setManualScreenshotUrl(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border px-4 py-3"
                placeholder="Optional"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={working}
                onClick={() => setManualOpen(false)}
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={working}
                className="rounded-xl bg-orange-700 px-5 py-3 font-bold text-white"
              >
                {working
                  ? "Saving..."
                  : "Record Payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex h-screen w-screen items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          width: "min(650px, calc(100vw - 32px))",
          minWidth: "320px",
          boxSizing: "border-box",
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-black text-gray-950">
            {title}
          </h2>

          <button
            type="button"
            onClick={close}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
