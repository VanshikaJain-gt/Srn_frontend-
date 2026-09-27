"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ApiError, apiClient } from "@/lib/api-client";
import { getEvents, EventResponse } from "@/services/event.service";
import {
  registerForEvent,
  TshirtSize,
} from "@/services/registration.service";

type EventCategory = "Marathon" | "Half Marathon" | "10K Run" | "5K Fun Run" | "Other";

const CATEGORIES = [
  "All Distances",
  "Marathon",
  "Half Marathon",
  "10K Run",
  "5K Fun Run",
  "Other",
] as const;

const PAGE_SIZE = 6;
const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1600&auto=format&fit=crop";

function getCategory(event: EventResponse): EventCategory {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (/\bhalf\b/.test(text)) return "Half Marathon";
  if (/\b10k\b|10\s*km/.test(text)) return "10K Run";
  if (/\b5k\b|5\s*km/.test(text)) return "5K Fun Run";
  if (/marathon/.test(text)) return "Marathon";

  return "Other";
}

function getDistanceLabel(event: EventResponse) {
  const text = `${event.title} ${event.description ?? ""}`;
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*(?:km|k)\b/i);

  if (match) {
    return `${match[1]} KM`;
  }

  const category = getCategory(event);
  if (category === "Marathon") return "MARATHON";
  if (category === "Half Marathon") return "HALF MARATHON";
  if (category === "10K Run") return "10 KM";
  if (category === "5K Fun Run") return "5 KM";

  return "EVENT";
}

function getLevel(event: EventResponse) {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (text.includes("elite") || text.includes("pro")) return "Level: Pro";
  if (text.includes("advanced")) return "Level: Advanced";

  return "Level: Open";
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("All Distances");
  const [dateFilter, setDateFilter] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<"soonest" | "price-low" | "price-high">(
    "soonest"
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [tshirtSize, setTshirtSize] = useState<TshirtSize>("L");
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents();

        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load events.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = events.filter((event) => {
      const searchable = `${event.title} ${event.description ?? ""} ${
        event.location ?? ""
      }`.toLowerCase();
      const matchesSearch =
        search.trim() === "" || searchable.includes(search.trim().toLowerCase());
      const matchesCategory =
        category === "All Distances" || getCategory(event) === category;
      const matchesLocation =
        location.trim() === "" ||
        (event.location ?? "").toLowerCase().includes(location.trim().toLowerCase());
      const matchesDate = dateFilter === "" || event.eventDate === dateFilter;

      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.registrationFee) - Number(b.registrationFee);
      }

      if (sortBy === "price-high") {
        return Number(b.registrationFee) - Number(a.registrationFee);
      }

      return (
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
    });

    return list;
  }, [events, search, category, location, dateFilter, sortBy]);

  const visibleEvents = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function openRegistration(event: EventResponse) {
    setSelectedEvent(event);
    setTshirtSize("L");
    setRegistrationError("");
    setRegistrationSuccess("");
  }

  function closeRegistration() {
    if (registering) return;
    setSelectedEvent(null);
    setRegistrationError("");
    setRegistrationSuccess("");
  }

  async function handleRegister() {
    if (!selectedEvent) return;

    const token = apiClient.getToken();
    if (!token) {
      setRegistrationError("Please login first to register for this event.");
      return;
    }

    try {
      setRegistering(true);
      setRegistrationError("");
      setRegistrationSuccess("");

      const response = await registerForEvent({
        eventId: selectedEvent.id,
        tshirtSize,
      });

      setRegisteredEventIds((previous) => {
        const next = new Set(previous);
        next.add(selectedEvent.id);
        return next;
      });

      setRegistrationSuccess(
        `Registration #${response.id} created successfully. Payment is ${
          response.paymentStatus || "PENDING"
        }. You can complete payment from My Registrations.`
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setRegistrationError(err.message);
      } else if (err instanceof Error) {
        setRegistrationError(err.message);
      } else {
        setRegistrationError("Unable to register for this event.");
      }
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="relative px-lg py-xl">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 w-full max-w-3xl">
            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-primary md:text-7xl">
              Find Your Next Finish Line.
            </h1>
            <p className="mt-6 w-full max-w-2xl text-lg leading-8 text-on-surface-variant">
              Join the community in high-performance racing across scenic
              routes. From sunrise marathons to local 5Ks, discover the energy
              of movement.
            </p>
          </div>

          <div className="ambient-shadow grid grid-cols-1 items-end gap-md rounded-3xl border border-outline-variant bg-surface-container-lowest p-md md:grid-cols-12 md:p-lg">
            <div className="flex flex-col gap-xs md:col-span-4">
              <label htmlFor="search" className="font-label-bold text-label-bold text-on-surface-variant">
                SEARCH EVENTS
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Race name or keyword"
                  className="w-full rounded-lg border-0 border-b-2 border-outline-variant bg-surface-variant/30 py-3 pl-10 transition-all focus:border-primary focus:ring-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs md:col-span-2">
              <label htmlFor="category" className="font-label-bold text-label-bold text-on-surface-variant">
                CATEGORY
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as (typeof CATEGORIES)[number]);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full rounded-lg border-0 border-b-2 border-outline-variant bg-surface-variant/30 py-3 transition-all focus:border-primary focus:ring-0"
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-xs md:col-span-2">
              <label htmlFor="date" className="font-label-bold text-label-bold text-on-surface-variant">
                DATE
              </label>
              <input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full rounded-lg border-0 border-b-2 border-outline-variant bg-surface-variant/30 py-3 transition-all focus:border-primary focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-xs md:col-span-2">
              <label htmlFor="location" className="font-label-bold text-label-bold text-on-surface-variant">
                LOCATION
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="City"
                className="w-full rounded-lg border-0 border-b-2 border-outline-variant bg-surface-variant/30 py-3 transition-all focus:border-primary focus:ring-0"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="sunrise-gradient inner-glow w-full rounded-2xl py-4 font-label-bold text-white shadow-md transition-all active:scale-95"
              >
                FIND RACES
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low/30 px-lg py-xl">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Upcoming Runs
              </h2>
              {!loading && !error && (
                <p className="mt-1 text-sm text-on-surface-variant">
                  {filtered.length} event{filtered.length === 1 ? "" : "s"} from the live backend
                </p>
              )}
            </div>

            <div className="flex items-center gap-sm">
              <span className="font-label-bold text-on-surface-variant">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex items-center gap-1 border-0 bg-transparent font-label-bold text-primary focus:ring-0"
              >
                <option value="soonest">Soonest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest"
                >
                  <div className="h-64 bg-surface-variant" />
                  <div className="space-y-4 p-lg">
                    <div className="h-6 w-3/4 rounded bg-surface-variant" />
                    <div className="h-4 w-1/2 rounded bg-surface-variant" />
                    <div className="h-8 w-2/3 rounded-full bg-surface-variant" />
                    <div className="h-12 rounded-2xl bg-surface-variant" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <h2 className="text-xl font-bold text-red-900">Unable to load events</h2>
              <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
              <h2 className="text-2xl font-bold text-on-surface">No events found</h2>
              <p className="mt-3 text-on-surface-variant">
                No backend events match your current filters.
              </p>
            </div>
          )}

          {!loading && !error && visibleEvents.length > 0 && (
            <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => {
                const categoryValue = getCategory(event);
                const isRegistered = registeredEventIds.has(event.id);
                const isCompleted = event.status === "COMPLETED";
                const isCancelled = event.status === "CANCELLED";
                const isExternal = event.isExternal;

                return (
                  <article
                    key={event.id}
                    className="group ambient-shadow flex flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-64 overflow-hidden bg-surface-variant">
                      <img
                        src={event.bannerImageUrl || DEFAULT_EVENT_IMAGE}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                        }}
                      />

                      <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 font-label-bold text-xs text-white">
                        {event.status || "UPCOMING"}
                      </div>

                      {categoryValue !== "Other" && (
                        <div className="absolute bottom-4 left-4 rounded-xl bg-black/55 px-4 py-2 text-xs font-bold uppercase text-white backdrop-blur-sm">
                          {categoryValue}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-grow flex-col gap-md p-lg">
                      <div>
                        <h3 className="font-headline-md text-headline-md leading-tight text-on-surface">
                          {event.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {event.location || "Location TBA"}
                        </p>
                        <p className="mt-2 text-sm text-on-surface-variant">
                          {formatDate(event.eventDate)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-sm">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                          {getDistanceLabel(event)}
                        </span>
                        <span className="rounded-full bg-surface-variant px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          {getLevel(event)}
                        </span>
                      </div>

                      {event.description && (
                        <p className="line-clamp-2 text-sm leading-6 text-on-surface-variant">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-end justify-between gap-4 border-t border-outline-variant/30 pt-md">
                        <div className="flex flex-col">
                          <span className="font-label-bold text-xs uppercase text-outline">
                            Registration
                          </span>
                          <span className="font-display-xl text-stat-value text-on-surface">
                            {formatPrice(event.registrationFee)}
                          </span>
                        </div>

                        {isCompleted || isCancelled ? (
                          <div className="cursor-not-allowed rounded-2xl bg-surface-variant/50 px-lg py-3 font-label-bold text-on-surface-variant">
                            {isCancelled ? "Cancelled" : "Completed"}
                          </div>
                        ) : isRegistered ? (
                          <Link
                            href="/dashboard/registrations"
                            className="rounded-2xl bg-green-600 px-lg py-3 font-label-bold text-white transition-all hover:bg-green-700"
                          >
                            Registered
                          </Link>
                        ) : isExternal && event.externalRegistrationUrl ? (
                          <a
                            href={event.externalRegistrationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="sunrise-gradient inner-glow rounded-2xl px-lg py-3 font-label-bold text-white transition-all active:scale-95"
                          >
                            Register Now
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRegistration(event)}
                            className="sunrise-gradient inner-glow rounded-2xl px-lg py-3 font-label-bold text-white transition-all active:scale-95"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {hasMore && (
            <div className="mt-xl flex flex-col items-center gap-md">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-full border-2 border-primary bg-white px-xl py-4 font-label-bold text-primary transition-all hover:bg-primary-container/10 active:scale-95"
              >
                LOAD MORE RACES
              </button>
              <p className="text-sm text-on-surface-variant">
                Showing {visibleEvents.length} of {filtered.length} upcoming events
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24">
        <div className="relative mx-auto w-[96%] max-w-[1600px] overflow-hidden rounded-[40px] bg-gradient-to-r from-[#ab3500] via-[#ff6b35] to-[#ffb39b] shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0 100 L20 0 L40 100 L60 0 L80 100 L100 0"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-12 px-10 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-20">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black leading-tight text-white lg:text-6xl">
                Never miss
                <br />
                a starting gun.
              </h2>
              <p className="mt-6 text-xl leading-9 text-white/85">
                Get notified about early-bird registrations, limited edition gear
                drops and exclusive community events.
              </p>
            </div>

            <div className="flex w-full max-w-[520px] flex-col gap-4 sm:flex-row lg:justify-end">
              <input
                type="email"
                placeholder="runner@email.com"
                className="h-16 flex-1 rounded-2xl border border-white/30 bg-white/20 px-6 text-lg text-white placeholder:text-white/60 outline-none backdrop-blur-md"
              />
              <button className="h-16 rounded-2xl bg-white px-10 font-bold text-[#ab3500] transition hover:bg-gray-100">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeRegistration();
          }}
        >
          <div
            className="relative min-w-0 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
            style={{
              width: "min(92vw, 560px)",
              maxWidth: "560px",
              maxHeight: "90vh",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Event Registration
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-950">
                  {selectedEvent.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {formatDate(selectedEvent.eventDate)} · {selectedEvent.location || "Location TBA"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRegistration}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close registration"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-7 rounded-2xl bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registration fee</span>
                <span className="text-lg font-black text-gray-950">
                  {formatPrice(selectedEvent.registrationFee)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Registration creates the entry first. Payment can be completed from your dashboard.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="tshirt-size"
                className="text-sm font-bold text-gray-900"
              >
                T-Shirt Size
              </label>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(["XS", "S", "M", "L", "XL", "XXL"] as TshirtSize[]).map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTshirtSize(size)}
                      className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                        tshirtSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>

            {registrationError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {registrationError}
                {registrationError.toLowerCase().includes("login") && (
                  <Link
                    href="/login"
                    className="ml-1 font-bold underline"
                    onClick={closeRegistration}
                  >
                    Login
                  </Link>
                )}
              </div>
            )}

            {registrationSuccess && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {registrationSuccess}
                <Link
                  href="/dashboard/registrations"
                  className="mt-2 inline-block font-bold underline"
                >
                  Open My Registrations
                </Link>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRegistration}
                disabled={registering}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>
              {!registrationSuccess && (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={registering}
                  className="sunrise-gradient rounded-2xl px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering ? "Registering..." : "Confirm Registration"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
