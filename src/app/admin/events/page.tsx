"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api-client";
import {
  createAdminEvent,
  deleteAdminEvent,
  EventCreateRequest,
  EventResponse,
  EventStatus,
  EventUpdateRequest,
  getEvents,
  updateAdminEvent,
} from "@/services/event.service";

type EventForm = {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  bannerImageUrl: string;
  isExternal: boolean;
  registrationFee: string;
  organizerName: string;
  externalRegistrationUrl: string;
  status: EventStatus;
};

const EMPTY_FORM: EventForm = {
  title: "",
  description: "",
  eventDate: "",
  location: "",
  bannerImageUrl: "",
  isExternal: false,
  registrationFee: "0",
  organizerName: "",
  externalRegistrationUrl: "",
  status: "UPCOMING",
};

const STATUS_OPTIONS: EventStatus[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

function formatDate(date?: string | null) {
  if (!date) return "Date TBA";

  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFee(fee?: number | null) {
  if (fee == null) return "External";
  if (fee === 0) return "Free";

  return `₹${Number(fee).toLocaleString("en-IN")}`;
}

function statusClasses(status: EventStatus) {
  switch (status) {
    case "UPCOMING":
      return "bg-orange-100 text-orange-700";
    case "ONGOING":
      return "bg-green-100 text-green-700";
    case "COMPLETED":
      return "bg-gray-100 text-gray-600";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function eventToForm(event: EventResponse): EventForm {
  return {
    title: event.title,
    description: event.description ?? "",
    eventDate: event.eventDate ?? "",
    location: event.location ?? "",
    bannerImageUrl: event.bannerImageUrl ?? "",
    isExternal: event.isExternal,
    registrationFee:
      event.registrationFee == null ? "0" : String(event.registrationFee),
    organizerName: event.organizerName ?? "",
    externalRegistrationUrl: event.externalRegistrationUrl ?? "",
    status: event.status,
  };
}

function buildCreateRequest(form: EventForm): EventCreateRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    eventDate: form.eventDate || null,
    location: form.location.trim() || null,
    bannerImageUrl: form.bannerImageUrl.trim() || null,
    isExternal: form.isExternal,
    registrationFee: form.isExternal
      ? null
      : form.registrationFee.trim()
        ? Number(form.registrationFee)
        : 0,
    organizerName: form.isExternal
      ? form.organizerName.trim() || null
      : null,
    externalRegistrationUrl: form.isExternal
      ? form.externalRegistrationUrl.trim() || null
      : null,
  };
}

function buildUpdateRequest(form: EventForm): EventUpdateRequest {
  return {
    ...buildCreateRequest(form),
    status: form.status,
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EventStatus>(
    "ALL"
  );

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
  const [form, setForm] = useState<EventForm>({ ...EMPTY_FORM });

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        (event.location ?? "").toLowerCase().includes(query) ||
        (event.organizerName ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  function openCreateModal() {
    setEditingEvent(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(event: EventResponse) {
    setEditingEvent(event);
    setForm(eventToForm(event));
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
    setEditingEvent(null);
  }

  function updateField(field: keyof EventForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    if (!form.title.trim()) return "Event title is required.";

    if (!form.isExternal) {
      const fee = Number(form.registrationFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return "Registration fee must be a valid number greater than or equal to 0.";
      }
    }

    if (form.isExternal) {
      if (!form.organizerName.trim()) {
        return "Organizer name is required for an external event.";
      }

      if (!form.externalRegistrationUrl.trim()) {
        return "External registration URL is required for an external event.";
      }

      try {
        new URL(form.externalRegistrationUrl.trim());
      } catch {
        return "External registration URL must be a valid URL.";
      }
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingEvent) {
        await updateAdminEvent(editingEvent.id, buildUpdateRequest(form));
        setSuccess("Event updated successfully.");
      } else {
        await createAdminEvent(buildCreateRequest(form));
        setSuccess("Event created successfully.");
      }

      setShowModal(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to save event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: EventResponse) {
    const confirmed = window.confirm(
      event.status === "CANCELLED"
        ? `Delete event "${event.title}" permanently?`
        : `Delete event "${event.title}"? If it has registrations, the backend will cancel it instead of hard-deleting it.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(event.id);
      setError("");
      setSuccess("");

      await deleteAdminEvent(event.id);
      setSuccess("Event deleted or archived successfully.");
      await loadEvents();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to delete event."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Management
            </p>
            <h1 className="mt-2 text-4xl font-black text-gray-950">Events</h1>
            <p className="mt-2 text-gray-600">
              Create, edit and manage running events from the admin panel.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={loading}
              className="rounded-2xl border border-orange-200 bg-white px-5 py-3 font-bold text-primary disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-sm hover:opacity-90"
            >
              + Create Event
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, location or organizer..."
              className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-bold text-gray-900">No events found.</p>
              <p className="mt-2 text-sm text-gray-500">
                Create your first event or change the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#fff5ef] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Fee</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-orange-50/40">
                      <td className="px-5 py-5">
                        <div className="font-bold text-gray-950">{event.title}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {event.location ||
                            (event.isExternal
                              ? event.organizerName || "External event"
                              : "Location TBA")}
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm text-gray-700">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-gray-700">
                        {event.isExternal ? "External" : "Internal"}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-gray-700">
                        {formatFee(event.registrationFee)}
                      </td>
                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(event)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(event)}
                            disabled={deletingId === event.id}
                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === event.id ? "Deleting..." : "Delete"}
                          </button>
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

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {editingEvent ? "Edit event" : "Create event"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-950">
                  {editingEvent ? editingEvent.title : "New running event"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="text-sm font-bold text-gray-800">Title *</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    maxLength={200}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                    placeholder="Delhi Sunrise 10K"
                  />
                </label>

                <label>
                  <span className="text-sm font-bold text-gray-800">Event date</span>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(event) => updateField("eventDate", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                  />
                </label>

                <label>
                  <span className="text-sm font-bold text-gray-800">Location</span>
                  <input
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    maxLength={255}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                    placeholder="Noida"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-bold text-gray-800">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                    placeholder="Tell runners about the event..."
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-bold text-gray-800">Banner image URL</span>
                  <input
                    value={form.bannerImageUrl}
                    onChange={(event) => updateField("bannerImageUrl", event.target.value)}
                    maxLength={500}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={form.isExternal}
                  onChange={(event) => updateField("isExternal", event.target.checked)}
                  className="h-5 w-5 accent-orange-600"
                />
                <span>
                  <span className="block font-bold text-gray-900">External event</span>
                  <span className="block text-sm text-gray-500">
                    Registration happens on another website.
                  </span>
                </span>
              </label>

              {form.isExternal ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <label>
                    <span className="text-sm font-bold text-gray-800">Organizer name *</span>
                    <input
                      value={form.organizerName}
                      onChange={(event) => updateField("organizerName", event.target.value)}
                      maxLength={150}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                      placeholder="Event organizer"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-bold text-gray-800">Registration URL *</span>
                    <input
                      type="url"
                      value={form.externalRegistrationUrl}
                      onChange={(event) => updateField("externalRegistrationUrl", event.target.value)}
                      maxLength={500}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                      placeholder="https://example.com/register"
                    />
                  </label>
                </div>
              ) : (
                <label>
                  <span className="text-sm font-bold text-gray-800">Registration fee (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.registrationFee}
                    onChange={(event) => updateField("registrationFee", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                    placeholder="0"
                  />
                </label>
              )}

              {editingEvent && (
                <label>
                  <span className="text-sm font-bold text-gray-800">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-2xl border border-gray-200 px-5 py-3 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-primary px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
