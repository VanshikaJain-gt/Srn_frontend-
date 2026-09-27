"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import {
  getCurrentUser,
  logoutUser,
  updateCurrentUser,
  User,
} from "@/services/auth.service";

const EMPTY_FORM = {
  name: "",
  phone: "",
  dateOfBirth: "",
  profilePhotoUrl: "",
};

type ProfileForm = typeof EMPTY_FORM;

function formatJoinedDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRole(role?: string) {
  if (!role) return "Runner";
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(name?: string) {
  if (!name?.trim()) return "R";

  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getInputDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function Sidebar({ user }: { user: User | null }) {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#ffe9e3] py-6 shadow-md lg:flex">
      <div className="mb-12 px-4">
        <Link
          href="/dashboard"
          className="font-[Sora] text-2xl font-extrabold tracking-tight text-[#ab3500]"
        >
          SRN
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7ddd5] font-[Sora] font-bold text-[#ab3500]">
          {user?.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={user.name || "Runner profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user?.name || "Runner"}</p>
          <p className="text-xs text-[#594139]">
            {user?.role === "ADMIN" ? "Admin" : "Runner"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem href="/" icon="⌂" label="Home" />
        <NavItem href="/dashboard" icon="▣" label="Dashboard" />
        <NavItem active href="/dashboard/profile" icon="◉" label="Profile" />
        <NavItem href="/dashboard/registrations" icon="✓" label="My Registrations" />
        <NavItem href="/dashboard/strava" icon="↻" label="Strava Sync" />
        <NavItem href="/dashboard/achievements" icon="★" label="Achievements" />
        <NavItem href="/dashboard/settings" icon="⚙" label="Settings" />
      </nav>

      <div className="space-y-3 px-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ab3500] py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95"
        >
          <span className="text-base">▶</span>
          Start Run
        </button>

        <button
          type="button"
          onClick={() => {
            logoutUser();
            router.push("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e1bfb5] bg-white py-3 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] active:scale-[0.98]"
        >
          <span className="text-base">↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mx-2 flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-[#ff6b35] text-[#261814] shadow-sm"
          : "text-[#594139] hover:bg-[#f7ddd5]"
      }`}
    >
      <span className="w-5 text-center text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const currentUser = await getCurrentUser();

        if (cancelled) return;

        setUser(currentUser);
        setForm({
          name: currentUser.name ?? "",
          phone: currentUser.phone ?? "",
          dateOfBirth: getInputDate(currentUser.dateOfBirth),
          profilePhotoUrl: currentUser.profilePhotoUrl ?? "",
        });
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          logoutUser();
          router.replace("/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
    setError("");
  }

  function startEditing() {
    if (!user) return;

    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      dateOfBirth: getInputDate(user.dateOfBirth),
      profilePhotoUrl: user.profilePhotoUrl ?? "",
    });
    setEditing(true);
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        dateOfBirth: getInputDate(user.dateOfBirth),
        profilePhotoUrl: user.profilePhotoUrl ?? "",
      });
    }

    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        profilePhotoUrl: form.profilePhotoUrl.trim() || null,
      });

      setUser(updatedUser);
      setForm({
        name: updatedUser.name ?? "",
        phone: updatedUser.phone ?? "",
        dateOfBirth: getInputDate(updatedUser.dateOfBirth),
        profilePhotoUrl: updatedUser.profilePhotoUrl ?? "",
      });
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutUser();
        router.replace("/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f6] text-[#261814] lg:pl-64">
        <Sidebar user={null} />
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#f7ddd5] border-t-[#ab3500]" />
            <p className="mt-4 text-sm font-semibold text-[#594139]">
              Loading your profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#261814] lg:pl-64">
      <Sidebar user={user} />

      <main>
        <header className="sticky top-0 z-40 border-b border-[#e1bfb5]/30 bg-[#fff8f6]/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-12">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ab3500]">
                Runner profile
              </p>
              <h1 className="mt-1 font-[Sora] text-2xl font-bold sm:text-3xl">
                Your Profile
              </h1>
            </div>

            <Link
              href="/dashboard"
              className="hidden rounded-full border border-[#e1bfb5] bg-white px-4 py-2 text-sm font-bold text-[#ab3500] transition hover:bg-[#fff1ed] sm:block"
            >
              ← Dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1180px] space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          {/* Profile hero */}
          <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
            <div className="h-32 bg-gradient-to-r from-[#ff6b35] via-[#d94420] to-[#ab3500] sm:h-40" />

            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="-mt-12 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#f7ddd5] font-[Sora] text-3xl font-extrabold text-[#ab3500] shadow-lg sm:h-32 sm:w-32">
                    {user?.profilePhotoUrl ? (
                      <img
                        src={user.profilePhotoUrl}
                        alt={user.name || "Runner profile"}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-[Sora] text-2xl font-bold sm:text-3xl">
                        {user?.name || "Runner"}
                      </h2>
                      <span className="rounded-full bg-[#ffe9e3] px-3 py-1 text-xs font-bold text-[#ab3500]">
                        {formatRole(user?.role)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#594139]">
                      Member since {formatJoinedDate(user?.createdAt)}
                    </p>
                  </div>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="w-full rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ab3500] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Personal information */}
            <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ab3500]">
                    Account details
                  </p>
                  <h2 className="mt-1 font-[Sora] text-xl font-bold sm:text-2xl">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-[#594139]">
                    Keep your runner information up to date.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ProfileField
                  label="Full Name"
                  value={editing ? form.name : user?.name || "—"}
                  editing={editing}
                  onChange={(value) => updateField("name", value)}
                  required
                />

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#594139]">
                    Email
                  </label>
                  <div className="rounded-2xl border border-[#ead8d2] bg-[#fff8f6] px-4 py-3.5 text-sm font-semibold text-[#594139]">
                    {user?.email || "—"}
                  </div>
                  <p className="mt-2 text-xs text-[#8d7168]">
                    Email is managed by your account and cannot be changed here.
                  </p>
                </div>

                <ProfileField
                  label="Phone"
                  type="tel"
                  value={editing ? form.phone : user?.phone || "—"}
                  editing={editing}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="Enter phone number"
                />

                <ProfileField
                  label="Date of Birth"
                  type="date"
                  value={editing ? form.dateOfBirth : getInputDate(user?.dateOfBirth) || "—"}
                  editing={editing}
                  onChange={(value) => updateField("dateOfBirth", value)}
                />

                {editing && (
                  <div className="sm:col-span-2">
                    <ProfileField
                      label="Profile Photo URL"
                      type="url"
                      value={form.profilePhotoUrl}
                      editing
                      onChange={(value) => updateField("profilePhotoUrl", value)}
                      placeholder="https://..."
                    />
                    <p className="mt-2 text-xs text-[#8d7168]">
                      Phase 1 uses an image URL. We can add real image upload/storage later.
                    </p>
                  </div>
                )}
              </div>

              {editing && (
                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#f1dfd9] pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="rounded-full border border-[#e1bfb5] bg-white px-6 py-3 text-sm font-bold text-[#594139] transition hover:bg-[#fff1ed] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ab3500] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </section>

            {/* Account status */}
            <div className="space-y-6">
              <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-7">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ab3500]">
                    Connected services
                  </p>
                  <h2 className="mt-1 font-[Sora] text-xl font-bold">Strava</h2>
                </div>

                <div className="rounded-2xl bg-[#fff8f6] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        user?.stravaConnected ? "bg-green-100" : "bg-[#f7ddd5]"
                      }`}
                    >
                      <span className="text-lg">{user?.stravaConnected ? "✓" : "↻"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {user?.stravaConnected ? "Connected" : "Not Connected"}
                      </p>
                      <p className="text-xs text-[#594139]">
                        {user?.stravaConnected
                          ? "Activity sync is enabled."
                          : "Connect Strava to sync activities."}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard/strava"
                  className="mt-4 block text-center text-sm font-bold text-[#ab3500] hover:underline"
                >
                  Manage Strava →
                </Link>
              </section>

              <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ab3500]">
                  Account
                </p>
                <h2 className="mt-1 font-[Sora] text-xl font-bold">Account Information</h2>

                <dl className="mt-5 space-y-4">
                  <AccountRow label="Member ID" value={user?.id ? `#${user.id}` : "—"} />
                  <AccountRow label="Role" value={formatRole(user?.role)} />
                  <AccountRow label="Password" value={user?.passwordSet ? "Set" : "Not set"} />
                  <AccountRow label="Joined" value={formatJoinedDate(user?.createdAt)} />
                </dl>

                <Link
                  href="/dashboard/settings"
                  className="mt-6 block rounded-full border border-[#e1bfb5] bg-[#fff8f6] px-4 py-3 text-center text-sm font-bold text-[#ab3500] transition hover:bg-[#ffe9e3]"
                >
                  Account Settings
                </Link>
              </section>
            </div>
          </form>

          {/* Mobile dashboard shortcut */}
          <div className="pb-4 lg:hidden">
            <Link
              href="/dashboard"
              className="block rounded-full bg-[#261814] px-5 py-3 text-center text-sm font-bold text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#594139]">
        {label}
        {required && <span className="ml-1 text-[#ab3500]">*</span>}
      </label>

      {editing ? (
        <input
          type={type}
          value={value === "—" ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={type === "tel" ? 15 : undefined}
          className="w-full rounded-2xl border border-[#e1bfb5] bg-white px-4 py-3.5 text-sm font-semibold text-[#261814] outline-none transition focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10"
        />
      ) : (
        <div className="rounded-2xl border border-[#ead8d2] bg-[#fff8f6] px-4 py-3.5 text-sm font-semibold text-[#261814]">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f1dfd9] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold text-[#8d7168]">{label}</dt>
      <dd className="text-right text-sm font-bold text-[#261814]">{value}</dd>
    </div>
  );
}