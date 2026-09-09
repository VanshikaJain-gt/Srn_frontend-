"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";

import {
  getMyRegistrations,
  RegistrationResponse,
  PaymentStatus,
} from "@/services/registration.service";

import {
  createPaymentOrder,
  CreatePaymentOrderResponse,
  verifyPayment,
} from "@/services/payment.service";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

function getPaymentLabel(status: PaymentStatus) {
  switch (status) {
    case "NOT_REQUIRED":
      return "Not Required";
    case "PENDING":
      return "Payment Pending";
    case "PAID":
      return "Paid";
    case "VERIFIED":
      return "Verified";
    default:
      return status;
  }
}

function getPaymentClasses(status: PaymentStatus) {
  switch (status) {
    case "NOT_REQUIRED":
      return "bg-gray-100 text-gray-700";
    case "PENDING":
      return "bg-orange-100 text-orange-700";
    case "PAID":
      return "bg-green-100 text-green-700";
    case "VERIFIED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "-";
  }

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

function getRegistrationTitle(registration: RegistrationResponse) {
  if (registration.challengeTitle) {
    return registration.challengeTitle;
  }

  if (registration.eventTitle) {
    return registration.eventTitle;
  }

  if (registration.challengeId) {
    return `Challenge #${registration.challengeId}`;
  }

  if (registration.eventId) {
    return `Event #${registration.eventId}`;
  }

  return "Registration";
}

function isChallengeRegistration(registration: RegistrationResponse) {
  return registration.challengeId != null;
}

function formatOrderAmount(amountInPaise: number) {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(!!window.Razorpay);
      });

      existingScript.addEventListener("error", () => {
        resolve(false);
      });

      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(!!window.Razorpay);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentLoadingId, setPaymentLoadingId] = useState<number | null>(
    null
  );

  const [paymentOrder, setPaymentOrder] =
    useState<CreatePaymentOrderResponse | null>(null);

  const [paymentRegistrationId, setPaymentRegistrationId] = useState<
    number | null
  >(null);

  const [paymentMessage, setPaymentMessage] = useState("");

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyRegistrations();

      setRegistrations(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Please login to view your registrations.");
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

  const challengeRegistrations = useMemo(
    () =>
      registrations.filter((registration) =>
        isChallengeRegistration(registration)
      ),
    [registrations]
  );

  const eventRegistrations = useMemo(
    () =>
      registrations.filter(
        (registration) => !isChallengeRegistration(registration)
      ),
    [registrations]
  );

  const pendingPayments = registrations.filter(
    (registration) => registration.paymentStatus === "PENDING"
  ).length;

  async function handlePayNow(registrationId: number) {
    try {
      setPaymentLoadingId(registrationId);
      setError("");
      setPaymentMessage("");
      setPaymentSuccess(false);
      setPaymentOrder(null);
      setPaymentRegistrationId(null);

      const order = await createPaymentOrder(registrationId);

      setPaymentOrder(order);
      setPaymentRegistrationId(registrationId);
      setPaymentMessage("Payment order created successfully.");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        setError(
          "Unable to load Razorpay Checkout. Please check your internet connection and try again."
        );
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "Sunrise Runners Network",
        description: "Challenge Registration Payment",
        order_id: order.razorpayOrderId,

        handler: async (response: RazorpaySuccessResponse) => {
          try {
            setPaymentLoadingId(registrationId);
            setError("");
            setPaymentMessage("Verifying your payment...");
            setPaymentSuccess(false);

            await verifyPayment({
              registrationId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setPaymentSuccess(true);
            setPaymentMessage(
              "Payment successful and verified successfully."
            );

            setPaymentOrder(null);
            setPaymentRegistrationId(null);

            await loadRegistrations();
          } catch (err) {
            if (err instanceof ApiError) {
              if (err.status === 401) {
                setError(
                  "Your session has expired. Please login again."
                );
              } else {
                setError(err.message);
              }
            } else if (err instanceof Error) {
              setError(err.message);
            } else {
              setError("Payment verification failed.");
            }

            setPaymentSuccess(false);
          } finally {
            setPaymentLoadingId(null);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoadingId(null);
            setPaymentMessage("Payment window closed.");
          },
        },

        theme: {
          color: "#ea580c",
        },
      });

      razorpay.open();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to start payment.");
      }
    } finally {
      setPaymentLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Runner Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
              My Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Track your challenge and event registrations, payment status
              and participation details.
            </p>
          </div>

          <Link
            href="/challenges"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            <span className="material-symbols-outlined text-[19px]">
              emoji_events
            </span>
            Browse Challenges
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-bold text-red-800">{error}</p>

            <button
              type="button"
              onClick={loadRegistrations}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Payment Success */}
        {paymentSuccess && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <span className="material-symbols-outlined">
                  check_circle
                </span>
              </div>

              <div>
                <p className="font-bold text-green-800">
                  {paymentMessage}
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Your registration is now marked as paid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Order Info */}
        {!paymentSuccess && paymentMessage && paymentOrder && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <span className="material-symbols-outlined">
                  check_circle
                </span>
              </div>

              <div>
                <p className="font-bold text-green-800">
                  {paymentMessage}
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Registration #{paymentRegistrationId} payment order is
                  ready.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <PaymentInfo
                label="Order ID"
                value={paymentOrder.razorpayOrderId}
              />

              <PaymentInfo
                label="Amount"
                value={formatOrderAmount(paymentOrder.amountInPaise)}
              />

              <PaymentInfo
                label="Currency"
                value={paymentOrder.currency}
              />
            </div>
          </div>
        )}

        {/* Payment Verifying */}
        {!paymentSuccess &&
          paymentMessage === "Verifying your payment..." && (
            <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-orange-600">
                  progress_activity
                </span>

                <p className="text-sm font-bold text-orange-800">
                  Verifying payment with Sunrisers...
                </p>
              </div>
            </div>
          )}

        {/* Stats */}
        {!error && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Registrations"
              value={registrations.length}
              icon="how_to_reg"
            />

            <StatCard
              label="Challenges"
              value={challengeRegistrations.length}
              icon="emoji_events"
            />

            <StatCard
              label="Payment Pending"
              value={pendingPayments}
              icon="payments"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-3xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          registrations.length === 0 && (
            <div className="mt-8 rounded-3xl border border-orange-100 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined text-3xl">
                  assignment
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black text-gray-950">
                No registrations yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                You have not registered for any challenge or event yet.
              </p>

              <Link
                href="/challenges"
                className="mt-6 inline-flex rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700"
              >
                Explore Challenges
              </Link>
            </div>
          )}

        {/* Challenge registrations */}
        {!loading &&
          !error &&
          challengeRegistrations.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Challenges
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Your Challenge Registrations
                </h2>
              </div>

              <div className="space-y-4">
                {challengeRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    type="challenge"
                    paymentLoadingId={paymentLoadingId}
                    onPayNow={handlePayNow}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Event registrations */}
        {!loading &&
          !error &&
          eventRegistrations.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Events
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Your Event Registrations
                </h2>
              </div>

              <div className="space-y-4">
                {eventRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    type="event"
                    paymentLoadingId={paymentLoadingId}
                    onPayNow={handlePayNow}
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

function RegistrationCard({
  registration,
  type,
  paymentLoadingId,
  onPayNow,
}: {
  registration: RegistrationResponse;
  type: "challenge" | "event";
  paymentLoadingId: number | null;
  onPayNow: (registrationId: number) => void;
}) {
  const title = getRegistrationTitle(registration);

  const paymentLoading = paymentLoadingId === registration.id;

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Main info */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <span className="material-symbols-outlined text-2xl">
              {type === "challenge" ? "emoji_events" : "event"}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
              {type === "challenge" ? "Challenge" : "Event"}
            </p>

            <h3 className="mt-1 text-xl font-black text-gray-950">
              {title}
            </h3>

            {registration.categoryName && (
              <p className="mt-1 text-sm text-gray-500">
                Category:{" "}
                <span className="font-semibold text-gray-700">
                  {registration.categoryName}
                </span>
              </p>
            )}

            {registration.tshirtSize && (
              <p className="mt-1 text-sm text-gray-500">
                T-Shirt:{" "}
                <span className="font-semibold text-gray-700">
                  {registration.tshirtSize}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Status + action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold ${getPaymentClasses(
              registration.paymentStatus
            )}`}
          >
            {getPaymentLabel(registration.paymentStatus)}
          </div>

          {registration.paymentStatus === "PENDING" && (
            <button
              type="button"
              disabled={paymentLoading}
              onClick={() => onPayNow(registration.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    payments
                  </span>
                  Pay Now
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
        <InfoItem
          label="Registration ID"
          value={`#${registration.id}`}
        />

        <InfoItem
          label="Amount"
          value={
            registration.amount != null
              ? `₹${registration.amount}`
              : "-"
          }
        />

        <InfoItem
          label="Registered On"
          value={formatDate(registration.createdAt)}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>

      <p className="mt-4 text-3xl font-black text-gray-950">{value}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

function PaymentInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}