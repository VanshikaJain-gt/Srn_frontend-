"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { apiClient, getErrorMessage } from "@/lib/api-client";
import { EventResponse, getEventById } from "@/services/event.service";
import {
  getMyRegistrations,
  registerForEvent,
  RegistrationResponse,
  TSHIRT_SIZES,
  TshirtSize,
} from "@/services/registration.service";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1600&auto=format&fit=crop";

function formatDate(value?: string | null) {
  if (!value) return "Date TBA";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatFee(fee?: number | null) {
  if (fee == null || Number(fee) === 0) return "Free";
  return `₹${Number(fee).toLocaleString("en-IN")}`;
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [existingRegistration, setExistingRegistration] =
    useState<RegistrationResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [tshirtSize, setTshirtSize] = useState<TshirtSize>("M");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!Number.isInteger(eventId) || eventId <= 0) {
      setLoadError("Invalid event ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getEventById(eventId);
        if (cancelled) return;
        setEvent(data);

        const loggedIn = Boolean(apiClient.getToken());
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          try {
            const registrations = await getMyRegistrations();
            if (cancelled) return;
            setExistingRegistration(
              registrations.find(
                (registration) =>
                  registration.eventId === eventId &&
                  registration.registrationStatus !== "CANCELLED"
              ) ?? null
            );
          } catch {
            // Registration status is secondary; the event itself still shows.
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(getErrorMessage(err, "Unable to load event."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleRegister() {
    if (!event || registering) return;

    setError("");
    setSuccess("");

    try {
      setRegistering(true);

      const registration = await registerForEvent({
        eventId: event.id,
        tshirtSize,
      });

      setExistingRegistration(registration);
      setSuccess(
        registration.paymentStatus === "PENDING"
          ? "Registration created. Complete the payment from My Registrations."
          : "You are registered for this event."
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to register for this event."));
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-6 py-16">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-72 rounded-3xl bg-orange-100" />
          <div className="mt-8 h-10 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 h-5 w-1/2 rounded bg-gray-200" />
        </div>
      </main>
    );
  }

  if (loadError || !event) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <h1 className="text-2xl font-black text-red-950">
            Unable to load event
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-700">
            {loadError || "Event not found."}
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const closed = event.status === "COMPLETED" || event.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="relative h-72 overflow-hidden bg-orange-200 md:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element -- banner URLs come from admins and can be any host */}
        <img
          src={event.bannerImageUrl || DEFAULT_EVENT_IMAGE}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_EVENT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-8 md:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Events
          </Link>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
              {event.status}
            </span>
            {event.isExternal && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                External Event
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
            {event.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <Detail icon="calendar_month" label="Date" value={formatDate(event.eventDate)} />
              <Detail icon="location_on" label="Location" value={event.location || "Location TBA"} />
              <Detail
                icon="payments"
                label="Registration"
                value={event.isExternal ? "On organizer's site" : formatFee(event.registrationFee)}
              />
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                About the event
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 md:text-base">
                {event.description || "No additional description has been provided for this event."}
              </p>

              {event.isExternal && event.organizerName && (
                <p className="mt-6 text-sm text-gray-500">
                  Organised by{" "}
                  <span className="font-bold text-gray-800">
                    {event.organizerName}
                  </span>
                </p>
              )}
            </div>
          </div>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black text-gray-950">
                {event.isExternal ? "Register externally" : "Join this event"}
              </h2>

              {closed ? (
                <p className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600">
                  This event is {event.status === "CANCELLED" ? "cancelled" : "completed"} and
                  no longer accepts registrations.
                </p>
              ) : event.isExternal ? (
                event.externalRegistrationUrl ? (
                  <a
                    href={event.externalRegistrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700"
                  >
                    Register on organizer&apos;s site
                    <span className="material-symbols-outlined text-[18px]">
                      open_in_new
                    </span>
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Registration details will be shared by the organizer.
                  </p>
                )
              ) : existingRegistration ? (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="text-sm font-semibold text-green-700">
                    {success ||
                      (existingRegistration.paymentStatus === "PENDING"
                        ? "You are registered. Payment is pending."
                        : "You are registered for this event.")}
                  </p>
                  <Link
                    href="/dashboard/registrations"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Go to My Registrations
                  </Link>
                </div>
              ) : !isLoggedIn ? (
                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    Please log in to register for this event.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700"
                  >
                    Login to Register
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-6 rounded-2xl bg-orange-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Registration fee</span>
                      <span className="text-lg font-black text-gray-950">
                        {formatFee(event.registrationFee)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Payment can be completed from My Registrations.
                    </p>
                  </div>

                  <label
                    htmlFor="tshirt-size"
                    className="mt-6 mb-2 block text-sm font-bold text-gray-700"
                  >
                    T-Shirt Size
                  </label>
                  <select
                    id="tshirt-size"
                    value={tshirtSize}
                    onChange={(e) => setTshirtSize(e.target.value as TshirtSize)}
                    disabled={registering}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white"
                  >
                    {TSHIRT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>

                  {error && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={registering}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {registering ? "Registering..." : "Register Now"}
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <span className="material-symbols-outlined text-orange-600">{icon}</span>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
