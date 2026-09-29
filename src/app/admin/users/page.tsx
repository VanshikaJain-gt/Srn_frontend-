"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  AdminUserResponse,
  getAdminUserById,
  getAdminUsers,
} from "@/services/user.service";

const PAGE_SIZE = 10;

function formatDate(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function display(value?: string | null): string {
  return value?.trim() || "-";
}

function roleClass(role?: string | null): string {
  return String(role ?? "").toUpperCase() === "ADMIN"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700";
}

function providerClass(provider?: string | null): string {
  return String(provider ?? "").toUpperCase() === "GOOGLE"
    ? "bg-gray-100 text-gray-700"
    : "bg-orange-100 text-orange-700";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminUserResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminUsers();
      setUsers(response.users);
      setTotalUsers(response.totalUsers);
      setPage(0);
    } catch (error) {
      setUsers([]);
      setTotalUsers(0);
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          user.name,
          user.email,
          user.phone,
          String(user.id),
          user.role,
          user.authProvider,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      const matchesRole =
        roleFilter === "ALL" || String(user.role).toUpperCase() === roleFilter;

      const matchesProvider =
        providerFilter === "ALL" ||
        String(user.authProvider).toUpperCase() === providerFilter;

      return matchesQuery && matchesRole && matchesProvider;
    });
  }, [users, query, roleFilter, providerFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleUsers = filteredUsers.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const openUser = async (user: AdminUserResponse) => {
    setSelected(user);
    setDetailLoading(true);
    setError("");

    try {
      const freshUser = await getAdminUserById(user.id);
      setSelected(freshUser);
    } catch (error) {
      // The list response is already complete, so keep it visible if the detail call fails.
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to load user details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setRoleFilter("ALL");
    setProviderFilter("ALL");
    setPage(0);
  };

  return (
    <main className="min-h-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Management
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Users</h1>
          <p className="mt-2 text-sm text-gray-500">
            View registered users and their account details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={loading}
          className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 xl:flex-row">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search name, email, phone or user ID..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          >
            <option value="ALL">All roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={providerFilter}
            onChange={(event) => {
              setProviderFilter(event.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          >
            <option value="ALL">All providers</option>
            <option value="LOCAL">Local</option>
            <option value="GOOGLE">Google</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 text-sm text-gray-500">
          <span>
            Total users: <b className="text-gray-950">{totalUsers}</b>
          </span>
          <span>
            Showing <b className="text-gray-950">{filteredUsers.length}</b> matching users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b bg-[#fffaf7] text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Provider</th>
                <th className="px-5 py-4">Strava</th>
                <th className="px-5 py-4">Password</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <p className="text-base font-bold text-gray-900">No users found.</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50/70">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        {user.profilePhotoUrl ? (
                          <img
                            src={user.profilePhotoUrl}
                            alt={user.name || "User"}
                            className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">
                            {(user.name || "U").trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-gray-950">{display(user.name)}</p>
                          <p className="text-xs text-gray-500">User #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="max-w-[260px] truncate text-sm font-semibold text-gray-800">
                        {display(user.email)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{display(user.phone)}</p>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${roleClass(user.role)}`}
                      >
                        {String(user.role || "UNKNOWN").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${providerClass(user.authProvider)}`}
                      >
                        {String(user.authProvider || "UNKNOWN").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <StatusPill active={user.stravaConnected} yes="Connected" no="Not connected" />
                    </td>

                    <td className="px-5 py-5">
                      <StatusPill active={user.passwordSet} yes="Set" no="Not set" />
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        onClick={() => void openUser(user)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 hover:border-orange-300 hover:text-orange-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page <b className="text-gray-950">{safePage + 1}</b> of{" "}
            <b className="text-gray-950">{pageCount}</b>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={safePage === 0 || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-lg border px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={safePage >= pageCount - 1 || loading}
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              className="rounded-lg border px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <UserModal
          user={selected}
          loading={detailLoading}
          close={() => setSelected(null)}
        />
      )}
    </main>
  );
}

function StatusPill({
  active,
  yes,
  no,
}: {
  active: boolean;
  yes: string;
  no: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? yes : no}
    </span>
  );
}

function UserModal({
  user,
  loading,
  close,
}: {
  user: AdminUserResponse;
  loading: boolean;
  close: () => void;
}) {
  const fields: Array<[string, string]> = [
    ["User ID", `#${user.id}`],
    ["Full name", display(user.name)],
    ["Email", display(user.email)],
    ["Phone", display(user.phone)],
    ["Date of birth", formatDate(user.dateOfBirth)],
    ["Role", String(user.role || "UNKNOWN").toUpperCase()],
    ["Auth provider", String(user.authProvider || "UNKNOWN").toUpperCase()],
    ["Strava", user.stravaConnected ? "Connected" : "Not connected"],
    ["Password", user.passwordSet ? "Set" : "Not set"],
    ["Joined", formatDateTime(user.createdAt)],
    ["Profile photo", user.profilePhotoUrl ? "Available" : "Not available"],
  ];

  return (
    <div
      className="fixed inset-0 z-[10000] flex h-screen w-screen items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
        className="max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          width: "min(720px, calc(100vw - 32px))",
          minWidth: "320px",
          maxWidth: "calc(100vw - 32px)",
          boxSizing: "border-box",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={user.name || "User"}
                className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-black text-orange-700">
                {(user.name || "U").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 id="user-modal-title" className="truncate text-2xl font-black text-gray-950">
                {display(user.name)}
              </h2>
              <p className="mt-1 text-sm text-gray-500">User #{user.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {loading && (
          <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Refreshing user details...
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {user.profilePhotoUrl && (
          <div className="mt-4 rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profile photo URL</p>
            <p className="mt-1 break-all text-sm text-gray-700">{user.profilePhotoUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
