"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

/* ---------- Data ---------- */

type EventItem = {
  id: string;
  image: string;
  alt: string;
  badge?: { label: string; className: string };
  countdown?: string;
  title: string;
  location: string;
  distanceKm: number;
  distanceLabel: string;
  level: string;
  price: number;
  soldOut?: boolean;
  date: string; // ISO date, used for sorting
  category: "Marathon" | "Half Marathon" | "10K Run" | "5K Fun Run";
};

const EVENTS: EventItem[] = [
  {
    id: "coastline-ultra",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDY4U6uDj45njBKftP-vWWA13qc6ex_isyuoIO8zkkX_5M1z57TNibtUj3XltVvPRYK8uoxb00GphDiWJfFPDXqeBD3LvP8DujexxU6Mw4g_BwKzRitIbiPtNSVbuSwOR3DSlPE7MvJY8YLOpvGYgREwcjlpci0ZCD1YYqS17-ZZopzrs3zQ1VYpk2r0gjSoQPzCLuQYjLmrhrwzQR6W5GIa5W77tQk6kECDkh81YLP2wc6lvPO1h2nRH4ltYxoOQrucbTuJBYFSdFW",
    alt: "Elite marathon runners crossing a coastal bridge at dawn",
    badge: { label: "ELITE SERIES", className: "bg-primary text-white" },
    countdown: "Starts in 12 days",
    title: "Coastline Ultra Marathon",
    location: "San Francisco, CA",
    distanceKm: 42.2,
    distanceLabel: "42.2 KM",
    level: "Level: Pro",
    price: 120,
    date: "2026-08-15",
    category: "Marathon",
  },
  {
    id: "central-park-10k",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9EzkEuSwwUijB7aEjoa1JV_Qc2Oz001i-_q1NJxloKVca8JkJ4G6EPs2Y81wkI9-_bjWD-u6FHJtXQB-B4DoL-KcAx8MAU9JaukaJPpQ4F9kM-28C3EcRfsp56FXQp3u7NI0PmGLCdsun7HtEUmsklpusPQXtgmWB4L1s_LIN6GEoJtafUmZxREEw6AlETwQm0RGXquc0LTR7p_yQmgQRymzuFSO0smCegBko3vFbk_URhUzLiqLIWXjv9X1hh-Lt5Vl9EeUVPRrT",
    alt: "Community runners in a morning city park run",
    badge: { label: "COMMUNITY", className: "bg-tertiary-container text-on-tertiary-container" },
    title: "Central Park 10K Sprint",
    location: "New York, NY",
    distanceKm: 10,
    distanceLabel: "10 KM",
    level: "Level: Open",
    price: 45,
    date: "2026-08-02",
    category: "10K Run",
  },
  {
    id: "blue-peak-half",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7EES7GYTZzaWAcPlAgQuY5LUtO1O_Z0DWweBPsxDbT5dTPi31GAX3wjLkmywlIkCB0YqXGi2c4pE-91nr35xVFoEZIeMov4XKYJljxlgnMoGWJ9lubToYgUuTo3jzYVzyouDZRmSVGO6Fih2sdItQiZZASR7j7E5Rcwb2fklC52QaTEhkEYD9m1jn0gSgF26PBTFcfOE578VAzcgT5ebJjl_KWf07dMtdk0jPz7_HUiszPA1SKSnVLvRNBxeVhy2ckxjG2nV5o-22",
    alt: "Trail runner navigating a rocky mountain ridge at dawn",
    badge: { label: "EXTREME TRAIL", className: "bg-secondary text-white" },
    title: "Blue Peak Half Marathon",
    location: "Boulder, CO",
    distanceKm: 21.1,
    distanceLabel: "21.1 KM",
    level: "Level: Advanced",
    price: 85,
    soldOut: true,
    date: "2026-09-05",
    category: "Half Marathon",
  },
  {
    id: "sunrise-city-5k",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCDITrLi8hNnuzj7wHI2d8mt5ADPeYHOdiBtEPmpXGMJx7YTdHU8LeLDn7uFTFQ1SjrGTqLC8wMhqfJW9kMvFIi_WxTckEa-qMUEb06tj88883deIY-p7IZ9ImR4jMGIJ4nQpVaMkDPUw0rohlt078g1iyjp9W9DIFqMjzZlB8HgiyjY_mT5mahbVo9X8uQQaJyOgRsYonA4G2l9Vlc0yMheYnysaRV2jwtKYoJiTuNJfMKy7tSORGMcE57K7fGsqMu03nNOv54tsz",
    alt: "Close-up of running shoes hitting an urban pavement",
    title: "Sunrise City 5K",
    location: "Chicago, IL",
    distanceKm: 5,
    distanceLabel: "5 KM",
    level: "Level: All",
    price: 30,
    date: "2026-07-28",
    category: "5K Fun Run",
  },
  {
    id: "fall-foliage-marathon",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB86ZgtaixmLkgMcB4ldn8FQol9JYISZIzy20Z0ZiSGqRdWwyfMTJbcNWxe9UpsOrhU-zPF0RLcjdfVdedBPfY4yBhPb71VHA0Ww0YO67g7FtjIRk7B-y9OJkHu99Oj7I5uFJ0Df9_v5E3rFUli25FvC0VpT8nVQxdFLRWxFrn6NkOK02ocx-2-zbpTeRi50tB9IStmVnqAS300QdsDQmh1siiuH5kxz4nUD42LKuhn46US6ywtcrbJiVxv6MI0WWwR_Z4Itz5677Dp",
    alt: "Marathon pack snaking through an autumnal forest road",
    badge: { label: "MAJORS", className: "bg-tertiary text-white" },
    title: "Fall Foliage Marathon",
    location: "Burlington, VT",
    distanceKm: 42.2,
    distanceLabel: "42.2 KM",
    level: "Level: Advanced",
    price: 110,
    date: "2026-10-18",
    category: "Marathon",
  },
  {
    id: "sunset-desert-15k",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8OZ_dPfimpZ3LjJJqvNOzBWi1-mRdz1m6loqWdqLhSccfZdt0nqKUP5Mmt2pqjchu8hcd2py7iajWxqA3UbR2MYrg3zqHZwRwoeGnMuMQm3vWAdR_XJ3Ybkz4JF4cDmLAVZkOL5Xw1Et0ysK1DOzd3yD3U-eMKxHLHCABVQ71A0fYzL0FjTLjJ8qJKMqdVVv-ldKRBye-jFJTMsPRpQjo0nWaxrZQztE4RKOBG8vZsuvjWr_Te96dr8OKSUXK-OmG_AxCNo1pH4fb",
    alt: "Runner silhouettes against a massive setting sun in a desert landscape",
    title: "Sunset Desert 15K",
    location: "Scottsdale, AZ",
    distanceKm: 15,
    distanceLabel: "15 KM",
    level: "Level: Open",
    price: 55,
    date: "2026-09-20",
    category: "10K Run",
  },
];

const CATEGORIES = ["All Distances", "Marathon", "Half Marathon", "10K Run", "5K Fun Run"] as const;
const PAGE_SIZE = 6;

/* ---------- Page ---------- */

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All Distances");
  const [dateFilter, setDateFilter] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<"soonest" | "price-low" | "price-high">("soonest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = EVENTS.filter((event) => {
      const matchesSearch =
        search.trim() === "" ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All Distances" || event.category === category;
      const matchesLocation =
        location.trim() === "" || event.location.toLowerCase().includes(location.toLowerCase());
      const matchesDate = dateFilter === "" || event.date === dateFilter;
      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return list;
  }, [search, category, location, dateFilter, sortBy]);

  const visibleEvents = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <main className="min-h-screen">
      {/* Hero + Search/Filter */}
      <section className="relative px-lg py-xl">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 w-full max-w-3xl">
            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-primary md:text-7xl">
              Find Your Next Finish Line.
            </h1>
            <p className="mt-6 w-full max-w-2xl text-lg leading-8 text-on-surface-variant">
              Join the community in high-performance racing across scenic
              routes. From sunrise marathons to local 5Ks, discover the
              energy of movement.
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
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                className="w-full rounded-lg border-0 border-b-2 border-outline-variant bg-surface-variant/30 py-3 transition-all focus:border-primary focus:ring-0"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
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
                onChange={(e) => setDateFilter(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
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

      {/* Event Grid */}
      <section className="bg-surface-container-low/30 px-lg py-xl">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-lg flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Upcoming Runs</h2>
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

          {visibleEvents.length === 0 ? (
            <p className="py-xl text-center text-on-surface-variant">
              No events match your filters. Try broadening your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="group ambient-shadow flex flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest transition-all hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {event.badge && (
                      <div
                        className={`absolute top-4 ${event.countdown ? "right-4" : "left-4"} rounded-full px-3 py-1 font-label-bold text-xs ${event.badge.className}`}
                      >
                        {event.badge.label}
                      </div>
                    )}
                    {event.countdown && (
                      <div className="glass-card absolute bottom-4 left-4 flex items-center gap-2 rounded-xl px-4 py-2 text-white">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="font-label-bold text-xs uppercase">{event.countdown}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-grow flex-col gap-md p-lg">
                    <div>
                      <h3 className="font-headline-md text-headline-md leading-tight text-on-surface">
                        {event.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {event.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-sm">
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                        {event.distanceLabel}
                      </span>
                      <span className="rounded-full bg-surface-variant px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        {event.level}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 pt-md">
                      <div className="flex flex-col">
                        <span className="font-label-bold text-xs uppercase text-outline">Registration</span>
                        <span className="font-display-xl text-stat-value text-on-surface">
                          ${event.price.toFixed(2)}
                        </span>
                      </div>
                      {event.soldOut ? (
                        <div className="cursor-not-allowed rounded-2xl bg-surface-variant/50 px-lg py-3 font-label-bold text-on-surface-variant opacity-60">
                          Sold Out
                        </div>
                      ) : (
                        <button className="sunrise-gradient inner-glow rounded-2xl px-lg py-3 font-label-bold text-white transition-all active:scale-95">
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Newsletter CTA */}
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

      {/* Left */}

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

      {/* Right */}

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
    </main>
  );
}