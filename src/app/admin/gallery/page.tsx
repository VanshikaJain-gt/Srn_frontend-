"use client";

import { useEffect, useState } from "react";
import {
  createGallery,
  deleteGallery,
  getAdminGallery,
  updateGallery,
  type GalleryResponse,
} from "@/services/gallery.service";

const emptyForm = {
  eventId: "",
  imageUrl: "",
  caption: "",
  category: "",
  published: true,
};

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadGallery() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminGallery();
      setGallery(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePublishedChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((previous) => ({
      ...previous,
      published: e.target.checked,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(item: GalleryResponse) {
    setEditingId(item.id);

    setForm({
      eventId: String(item.eventId ?? ""),
      imageUrl: item.imageUrl ?? "",
      caption: item.caption ?? "",
      category: item.category ?? "",
      published: item.published ?? false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const eventId = Number(form.eventId);

    if (!form.eventId || Number.isNaN(eventId)) {
      setError("Event ID is required.");
      return;
    }

    if (!form.imageUrl.trim()) {
      setError("Image URL is required.");
      return;
    }

    if (!form.caption.trim()) {
      setError("Caption is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    const payload = {
      eventId,
      imageUrl: form.imageUrl.trim(),
      caption: form.caption.trim(),
      category: form.category.trim(),
      published: form.published,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await updateGallery(editingId, payload);
        setSuccess("Gallery item updated successfully.");
      } else {
        await createGallery(payload);
        setSuccess("Gallery item created successfully.");
      }

      resetForm();
      await loadGallery();
    } catch (err) {
      console.error(err);
      setError(
        editingId !== null
          ? "Failed to update gallery item."
          : "Failed to create gallery item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteGallery(id);

      setSuccess("Gallery item deleted successfully.");

      await loadGallery();
    } catch (err) {
      console.error(err);
      setError("Failed to delete gallery item.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
              Management
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              Gallery
            </h1>

            <p className="mt-2 text-slate-500">
              Manage event photos and published gallery content.
            </p>
          </div>

          <button
            type="button"
            onClick={loadGallery}
            disabled={loading}
            className="rounded-xl border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Gallery"}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-600">
            {success}
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Administration
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {editingId !== null
                ? "Edit Gallery Item"
                : "Add Gallery Item"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add an image to the Sunrise Runners Network gallery.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Event ID */}
              <div>
                <label
                  htmlFor="eventId"
                  className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600"
                >
                  Event ID
                </label>

                <input
                  id="eventId"
                  name="eventId"
                  type="number"
                  min="1"
                  value={form.eventId}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600"
                >
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Marathon"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600"
                >
                  Image URL
                </label>

                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Caption */}
              <div className="md:col-span-2">
                <label
                  htmlFor="caption"
                  className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600"
                >
                  Caption
                </label>

                <textarea
                  id="caption"
                  name="caption"
                  rows={3}
                  value={form.caption}
                  onChange={handleChange}
                  placeholder="Describe this gallery image..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Published */}
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={handlePublishedChange}
                    className="h-5 w-5 accent-orange-600"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Publish this gallery item
                  </span>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {form.imageUrl.trim() && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  Preview
                </p>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={form.imageUrl}
                    alt={form.caption || "Gallery preview"}
                    className="h-64 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Gallery"
                    : "Add Gallery"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Gallery List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Gallery Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {gallery.length} item
                {gallery.length === 1 ? "" : "s"} found.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl bg-slate-50 px-6 py-12 text-center text-slate-500">
              Loading gallery...
            </div>
          ) : gallery.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">
              <p className="font-semibold text-slate-600">
                No gallery items found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add your first gallery image using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Gallery image"}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />

                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.published
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                        {item.category || "General"}
                      </span>

                      <span className="text-xs text-slate-400">
                        Event #{item.eventId}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 font-bold text-slate-900">
                      {item.caption || "Untitled Gallery Item"}
                    </h3>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="flex-1 rounded-lg border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}