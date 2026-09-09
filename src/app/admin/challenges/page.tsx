"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api-client";
import {
  Challenge,
  ChallengeCategory,
  ChallengeStatus,
  ActivityType,
  CategoryType,
  getChallenges,
} from "@/services/challenge.service";

import {
  createAdminChallenge,
  updateAdminChallenge,
  updateAdminChallengeStatus,
  deleteAdminChallenge,
  ChallengeRequest,
  AdminCategoryRequest,
} from "@/services/admin-challenge.service";

type FormCategory = {
  id?: number;
  name: string;
  categoryType: CategoryType;
  targetKm: string;
  maxDurationMinutes: string;
  minDaysForFinisher: string;
  fee: string;
  activityType: ActivityType;
  minDistancePerActivityKm: string;
  maxPaceMinPerKm: string;
};

type ChallengeForm = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  stravaCaptionTag: string;
  categories: FormCategory[];
};

const EMPTY_CATEGORY: FormCategory = {
  name: "",
  categoryType: "DISTANCE_TARGET",
  targetKm: "",
  maxDurationMinutes: "",
  minDaysForFinisher: "",
  fee: "0",
  activityType: "RUN",
  minDistancePerActivityKm: "",
  maxPaceMinPerKm: "",
};

const EMPTY_FORM: ChallengeForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  stravaCaptionTag: "",
  categories: [{ ...EMPTY_CATEGORY }],
};

function formatDate(date: string) {
  if (!date) return "-";

  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: ChallengeStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "UPCOMING":
      return "Upcoming";
    case "RESULTS_PENDING":
      return "Results Pending";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function getStatusClasses(status: ChallengeStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "UPCOMING":
      return "bg-orange-100 text-orange-700";
    case "RESULTS_PENDING":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function categoryToForm(category: ChallengeCategory): FormCategory {
  return {
    id: category.id,
    name: category.name,
    categoryType: category.categoryType,
    targetKm:
      category.targetKm == null ? "" : String(category.targetKm),
    maxDurationMinutes:
      category.maxDurationMinutes == null
        ? ""
        : String(category.maxDurationMinutes),
    minDaysForFinisher:
      category.minDaysForFinisher == null
        ? ""
        : String(category.minDaysForFinisher),
    fee: category.fee == null ? "0" : String(category.fee),
    activityType: category.activityType ?? "RUN",
    minDistancePerActivityKm:
      category.minDistancePerActivityKm == null
        ? ""
        : String(category.minDistancePerActivityKm),
    maxPaceMinPerKm:
      category.maxPaceMinPerKm == null
        ? ""
        : String(category.maxPaceMinPerKm),
  };
}

function challengeToForm(challenge: Challenge): ChallengeForm {
  return {
    title: challenge.title,
    description: challenge.description ?? "",
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    stravaCaptionTag: challenge.stravaCaptionTag ?? "",
    categories:
      challenge.categories.length > 0
        ? challenge.categories.map(categoryToForm)
        : [{ ...EMPTY_CATEGORY }],
  };
}

function buildRequest(form: ChallengeForm): ChallengeRequest {
  const categories: AdminCategoryRequest[] = form.categories.map(
    (category) => ({
      ...(category.id ? { id: category.id } : {}),
      name: category.name.trim(),
      categoryType: category.categoryType,
      targetKm:
        category.categoryType === "DISTANCE_TARGET" &&
        category.targetKm.trim()
          ? Number(category.targetKm)
          : null,
      maxDurationMinutes:
        category.categoryType === "PACE_DURATION" &&
        category.maxDurationMinutes.trim()
          ? Number(category.maxDurationMinutes)
          : null,
      minDaysForFinisher:
        category.minDaysForFinisher.trim()
          ? Number(category.minDaysForFinisher)
          : null,
      fee: category.fee.trim() ? Number(category.fee) : 0,
      activityType: category.activityType,
      minDistancePerActivityKm: Number(
        category.minDistancePerActivityKm
      ),
      maxPaceMinPerKm: Number(category.maxPaceMinPerKm),
    })
  );

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    stravaCaptionTag: form.stravaCaptionTag.trim(),
    categories,
  };
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ChallengeStatus
  >("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] =
    useState<Challenge | null>(null);

  const [form, setForm] = useState<ChallengeForm>({
    ...EMPTY_FORM,
    categories: [{ ...EMPTY_CATEGORY }],
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  async function loadChallenges() {
    try {
      setLoading(true);
      setError("");

      const data = await getChallenges();
      setChallenges(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load challenges.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, []);

  const filteredChallenges = useMemo(() => {
    const query = search.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const matchesSearch =
        !query ||
        challenge.title.toLowerCase().includes(query) ||
        (challenge.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        challenge.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [challenges, search, statusFilter]);

  function openCreateModal() {
    setEditingChallenge(null);
    setForm({
      ...EMPTY_FORM,
      categories: [{ ...EMPTY_CATEGORY }],
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(challenge: Challenge) {
    setEditingChallenge(challenge);
    setForm(challengeToForm(challenge));
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingChallenge(null);
  }

  function updateFormField(
    field: keyof Omit<ChallengeForm, "categories">,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCategory(
    index: number,
    field: keyof FormCategory,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      categories: current.categories.map((category, categoryIndex) => {
        if (categoryIndex !== index) return category;

        return {
          ...category,
          [field]: value,
          ...(field === "categoryType" &&
          value === "DISTANCE_TARGET"
            ? { maxDurationMinutes: "" }
            : {}),
          ...(field === "categoryType" &&
          value === "PACE_DURATION"
            ? { targetKm: "" }
            : {}),
        };
      }),
    }));
  }

  function addCategory() {
    setForm((current) => ({
      ...current,
      categories: [
        ...current.categories,
        { ...EMPTY_CATEGORY },
      ],
    }));
  }

  function removeCategory(index: number) {
    setForm((current) => {
      if (current.categories.length === 1) {
        return current;
      }

      return {
        ...current,
        categories: current.categories.filter(
          (_, categoryIndex) => categoryIndex !== index
        ),
      };
    });
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Challenge title is required.";
    }

    if (!form.startDate || !form.endDate) {
      return "Start date and end date are required.";
    }

    if (form.endDate < form.startDate) {
      return "End date cannot be before start date.";
    }

    if (form.categories.length === 0) {
      return "At least one category is required.";
    }

    for (let index = 0; index < form.categories.length; index++) {
      const category = form.categories[index];

      if (!category.name.trim()) {
        return `Category ${index + 1}: name is required.`;
      }

      if (
        category.categoryType === "DISTANCE_TARGET" &&
        !category.targetKm.trim()
      ) {
        return `Category ${index + 1}: target KM is required.`;
      }

      if (
        category.categoryType === "PACE_DURATION" &&
        !category.maxDurationMinutes.trim()
      ) {
        return `Category ${index + 1}: max duration is required.`;
      }

      if (!category.minDistancePerActivityKm.trim()) {
        return `Category ${index + 1}: minimum distance is required.`;
      }

      if (!category.maxPaceMinPerKm.trim()) {
        return `Category ${index + 1}: maximum pace is required.`;
      }

      if (Number(category.fee) < 0) {
        return `Category ${index + 1}: fee cannot be negative.`;
      }
    }

    return "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const request = buildRequest(form);

      if (editingChallenge) {
        const updated = await updateAdminChallenge(
          editingChallenge.id,
          request
        );

        setChallenges((current) =>
          current.map((challenge) =>
            challenge.id === updated.id ? updated : challenge
          )
        );

        setSuccess("Challenge updated successfully.");
      } else {
        const created = await createAdminChallenge(request);

        setChallenges((current) => [
          created,
          ...current,
        ]);

        setSuccess("Challenge created successfully.");
      }

      setShowModal(false);
      setEditingChallenge(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to save challenge.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    challenge: Challenge,
    status: ChallengeStatus
  ) {
    if (challenge.status === status) return;

    try {
      setUpdatingStatusId(challenge.id);
      setError("");
      setSuccess("");

      const updated = await updateAdminChallengeStatus(
        challenge.id,
        status
      );

      setChallenges((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSuccess(
        `"${challenge.title}" status changed to ${getStatusLabel(
          status
        )}.`
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to update challenge status.");
      }
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(challenge: Challenge) {
    const confirmed = window.confirm(
      `Delete "${challenge.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(challenge.id);
      setError("");
      setSuccess("");

      await deleteAdminChallenge(challenge.id);

      setChallenges((current) =>
        current.filter((item) => item.id !== challenge.id)
      );

      setSuccess("Challenge deleted successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to delete challenge.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
            Challenge Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
            Challenges
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Create, update, publish and manage challenge categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
        >
          <span className="material-symbols-outlined text-[20px]">
            add
          </span>
          Add Challenge
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div>
            <p className="font-bold">Something went wrong</p>
            <p className="mt-1">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-700"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          <div>
            <p className="font-bold">Success</p>
            <p className="mt-1">{success}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-400 hover:text-green-700"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Total
          </p>
          <p className="mt-2 text-3xl font-black text-gray-950">
            {challenges.length}
          </p>
        </div>

        <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Active
          </p>
          <p className="mt-2 text-3xl font-black text-green-600">
            {
              challenges.filter(
                (challenge) => challenge.status === "ACTIVE"
              ).length
            }
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Upcoming
          </p>
          <p className="mt-2 text-3xl font-black text-orange-600">
            {
              challenges.filter(
                (challenge) =>
                  challenge.status === "UPCOMING"
              ).length
            }
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Categories
          </p>
          <p className="mt-2 text-3xl font-black text-gray-950">
            {challenges.reduce(
              (total, challenge) =>
                total + challenge.categories.length,
              0
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search challenges..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | ChallengeStatus
              )
            }
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-orange-400"
          >
            <option value="ALL">All statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="RESULTS_PENDING">
              Results Pending
            </option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  Challenge
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  Duration
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  Categories
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading &&
                [1, 2, 3].map((item) => (
                  <tr key={item}>
                    <td
                      colSpan={5}
                      className="px-6 py-5"
                    >
                      <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredChallenges.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <span className="material-symbols-outlined text-5xl text-gray-300">
                        emoji_events
                      </span>

                      <h3 className="mt-4 text-lg font-black text-gray-900">
                        No challenges found
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Create your first challenge to get
                        started.
                      </p>

                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
                      >
                        Add Challenge
                      </button>
                    </td>
                  </tr>
                )}

              {!loading &&
                filteredChallenges.map((challenge) => (
                  <tr
                    key={challenge.id}
                    className="transition hover:bg-orange-50/40"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-gray-950">
                          {challenge.title}
                        </p>

                        <p className="mt-1 line-clamp-2 max-w-md text-sm text-gray-500">
                          {challenge.description ||
                            "No description"}
                        </p>

                        {challenge.stravaCaptionTag && (
                          <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            {challenge.stravaCaptionTag}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(challenge.startDate)}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        to {formatDate(challenge.endDate)}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        {challenge.categories
                          .slice(0, 3)
                          .map((category) => (
                            <p
                              key={category.id}
                              className="text-sm text-gray-700"
                            >
                              <span className="font-semibold">
                                {category.name}
                              </span>{" "}
                              <span className="text-gray-400">
                                ·{" "}
                                {category.categoryType ===
                                "DISTANCE_TARGET"
                                  ? `${category.targetKm ?? "-"} KM`
                                  : `${category.maxDurationMinutes ?? "-"} min`}
                              </span>
                            </p>
                          ))}

                        {challenge.categories.length > 3 && (
                          <p className="text-xs font-semibold text-orange-600">
                            +
                            {challenge.categories.length - 3}{" "}
                            more
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={challenge.status}
                        disabled={
                          updatingStatusId === challenge.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            challenge,
                            event.target.value as ChallengeStatus
                          )
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold outline-none ${getStatusClasses(
                          challenge.status
                        )}`}
                      >
                        <option value="UPCOMING">
                          Upcoming
                        </option>
                        <option value="ACTIVE">Active</option>
                        <option value="RESULTS_PENDING">
                          Results Pending
                        </option>
                        <option value="COMPLETED">
                          Completed
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(challenge)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-orange-100 hover:text-orange-700"
                          title="Edit challenge"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            edit
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId === challenge.id
                          }
                          onClick={() =>
                            handleDelete(challenge)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete challenge"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  {editingChallenge
                    ? "Edit Challenge"
                    : "New Challenge"}
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  {editingChallenge
                    ? editingChallenge.title
                    : "Create a challenge"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-8 p-6">
                {/* Basic details */}
                <section>
                  <div className="mb-5">
                    <h3 className="text-lg font-black text-gray-900">
                      Basic details
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Set the challenge name, dates and public
                      description.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Challenge Title
                      </label>

                      <input
                        value={form.title}
                        onChange={(event) =>
                          updateFormField(
                            "title",
                            event.target.value
                          )
                        }
                        placeholder="e.g. September Sunrise Challenge"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Start Date
                      </label>

                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          updateFormField(
                            "startDate",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        End Date
                      </label>

                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(event) =>
                          updateFormField(
                            "endDate",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Description
                      </label>

                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          updateFormField(
                            "description",
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe the challenge..."
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Strava Caption Tag
                      </label>

                      <input
                        value={form.stravaCaptionTag}
                        onChange={(event) =>
                          updateFormField(
                            "stravaCaptionTag",
                            event.target.value
                          )
                        }
                        placeholder="#SunrisersChallenge"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </section>

                {/* Categories */}
                <section>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Categories
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Configure distance, pace, fee and
                        activity requirements.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addCategory}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                      Add Category
                    </button>
                  </div>

                  <div className="space-y-5">
                    {form.categories.map(
                      (category, index) => (
                        <div
                          key={
                            category.id ??
                            `new-${index}`
                          }
                          className="rounded-3xl border border-orange-100 bg-orange-50/40 p-5"
                        >
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                Category {index + 1}
                              </span>

                              <p className="mt-1 text-sm text-gray-500">
                                Define the rules for this
                                category.
                              </p>
                            </div>

                            {form.categories.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeCategory(index)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-red-100 hover:text-red-600"
                                title="Remove category"
                              >
                                <span className="material-symbols-outlined text-[19px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Category Name
                              </label>

                              <input
                                value={category.name}
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "name",
                                    event.target.value
                                  )
                                }
                                placeholder="e.g. Novice"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Category Type
                              </label>

                              <select
                                value={
                                  category.categoryType
                                }
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "categoryType",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              >
                                <option value="DISTANCE_TARGET">
                                  Distance Target
                                </option>
                                <option value="PACE_DURATION">
                                  Pace / Duration
                                </option>
                              </select>
                            </div>

                            {category.categoryType ===
                              "DISTANCE_TARGET" && (
                              <div>
                                <label className="mb-2 block text-xs font-bold text-gray-700">
                                  Target KM
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={
                                    category.targetKm
                                  }
                                  onChange={(event) =>
                                    updateCategory(
                                      index,
                                      "targetKm",
                                      event.target.value
                                    )
                                  }
                                  placeholder="50"
                                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                                />
                              </div>
                            )}

                            {category.categoryType ===
                              "PACE_DURATION" && (
                              <div>
                                <label className="mb-2 block text-xs font-bold text-gray-700">
                                  Max Duration (minutes)
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    category.maxDurationMinutes
                                  }
                                  onChange={(event) =>
                                    updateCategory(
                                      index,
                                      "maxDurationMinutes",
                                      event.target.value
                                    )
                                  }
                                  placeholder="240"
                                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                                />
                              </div>
                            )}

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Min Days for Finisher
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  category.minDaysForFinisher
                                }
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "minDaysForFinisher",
                                    event.target.value
                                  )
                                }
                                placeholder="10"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Fee (₹)
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={category.fee}
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "fee",
                                    event.target.value
                                  )
                                }
                                placeholder="499"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Activity Type
                              </label>

                              <select
                                value={
                                  category.activityType
                                }
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "activityType",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              >
                                <option value="RUN">
                                  Run
                                </option>
                                <option value="WALK">
                                  Walk
                                </option>
                                <option value="RIDE">
                                  Ride
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Min Distance / Activity (KM)
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={
                                  category.minDistancePerActivityKm
                                }
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "minDistancePerActivityKm",
                                    event.target.value
                                  )
                                }
                                placeholder="2"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold text-gray-700">
                                Max Pace (min/km)
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={
                                  category.maxPaceMinPerKm
                                }
                                onChange={(event) =>
                                  updateCategory(
                                    index,
                                    "maxPaceMinPerKm",
                                    event.target.value
                                  )
                                }
                                placeholder="8"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        save
                      </span>
                      {editingChallenge
                        ? "Update Challenge"
                        : "Create Challenge"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}