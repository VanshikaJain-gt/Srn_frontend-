"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: number;
  eventId?: number | null;
  imageUrl: string;
  caption?: string | null;
  category?: string | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type GalleryResponse = {
  content?: GalleryItem[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1121";

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load gallery (${response.status})`);
      }

      const data: GalleryResponse | GalleryItem[] = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      // Only show published gallery items publicly
      const publishedItems = items.filter(
        (item) => item.published !== false
      );

      setGallery(publishedItems);
    } catch (err) {
      console.error("Gallery loading error:", err);
      setError("Unable to load gallery right now.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = gallery
      .map((item) => item.category?.trim())
      .filter((category): category is string => Boolean(category));

    return ["All", ...Array.from(new Set(uniqueCategories))];
  }, [gallery]);

  const filteredGallery = useMemo(() => {
    if (activeCategory === "All") {
      return gallery;
    }

    return gallery.filter(
      (item) =>
        item.category?.trim().toLowerCase() ===
        activeCategory.toLowerCase()
    );
  }, [gallery, activeCategory]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#fff8f3]">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-8 lg:px-10 lg:pb-28 lg:pt-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-orange-600">
              Sunrise Runners Network
            </p>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Every Run Has
              <span className="block text-orange-600">A Story.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Explore the moments, races, celebrations and memories that
              bring the Sunrise Runners community together.
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-orange-600">
              Memories
            </p>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Our Gallery
            </h2>

            <p className="mt-4 max-w-2xl text-slate-500">
              Moments captured from our runs, marathons, challenges and
              community events.
            </p>
          </div>

          <button
            type="button"
            onClick={loadGallery}
            className="w-fit rounded-full border border-orange-200 px-5 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
          >
            Refresh Gallery
          </button>
        </div>

        {/* CATEGORY FILTER */}
        {!loading && !error && gallery.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-3">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center">
            <h3 className="text-xl font-bold text-red-700">
              Gallery unavailable
            </h3>

            <p className="mt-2 text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadGallery}
              className="mt-6 rounded-full bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && gallery.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
              📸
            </div>

            <h3 className="mt-5 text-2xl font-black">
              No gallery images yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Published images added from the admin panel will appear here.
            </p>
          </div>
        )}

        {/* GALLERY GRID */}
        {!loading && !error && filteredGallery.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGallery.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE */}
                <button
                  type="button"
                  onClick={() => setSelectedImage(item)}
                  className="relative block w-full overflow-hidden text-left"
                  aria-label={`Open ${item.caption || "gallery image"}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Sunrise Runners Network"}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/1200x900/f8fafc/64748b?text=Image+Unavailable";
                      }}
                    />
                  </div>

                  {/* OVERLAY */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                    <span className="translate-y-3 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-slate-900 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      View Image
                    </span>
                  </div>

                  {/* CATEGORY */}
                  {item.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-orange-600 shadow-md">
                      {item.category}
                    </span>
                  )}
                </button>

                {/* CONTENT */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sunrise Runners
                    </span>

                    {item.eventId && (
                      <span className="text-xs font-medium text-slate-400">
                        Event #{item.eventId}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-lg font-black leading-7 text-slate-900">
                    {item.caption || "Sunrise Runners Network Event"}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* FILTER EMPTY */}
        {!loading &&
          !error &&
          gallery.length > 0 &&
          filteredGallery.length === 0 && (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 px-6 py-16 text-center">
              <h3 className="text-2xl font-black">
                No images in this category
              </h3>

              <p className="mt-2 text-slate-500">
                Try selecting another category.
              </p>
            </div>
          )}
      </section>

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900 shadow-xl transition hover:scale-105"
              aria-label="Close image"
            >
              ×
            </button>

            <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.caption || "Gallery image"}
                className="max-h-[75vh] w-full object-contain"
              />

              <div className="bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedImage.category && (
                    <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
                      {selectedImage.category}
                    </span>
                  )}

                  {selectedImage.eventId && (
                    <span className="text-sm text-slate-400">
                      Event #{selectedImage.eventId}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {selectedImage.caption ||
                    "Sunrise Runners Network Event"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}