"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
} from "@/lib/api-client";
import {
  changePassword,
  getCurrentUser,
  logoutUser,
  updateCurrentUser,
  User,
} from "@/services/auth.service";

const DEFAULT_NOTIFICATIONS = {
  registrations: true,
  payments: true,
  system: true,
};

function initials(name?: string | null) {
  if (!name?.trim()) return "A";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function AdminSettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const currentUser = await getCurrentUser();
        if (cancelled) return;

        if (currentUser.role !== "ADMIN") {
          router.replace("/admin");
          return;
        }

        setUser(currentUser);
        setProfileForm({
          name: currentUser.name ?? "",
          phone: currentUser.phone ?? "",
        });

        const stored = localStorage.getItem("srn_admin_notifications");
        if (stored) {
          try {
            setNotifications({
              ...DEFAULT_NOTIFICATIONS,
              ...JSON.parse(stored),
            });
          } catch {
            setNotifications(DEFAULT_NOTIFICATIONS);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load admin settings."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileForm.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const updated = await updateCurrentUser({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
      });

      setUser(updated);
      setProfileForm({
        name: updated.name ?? "",
        phone: updated.phone ?? "",
      });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update profile."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setSuccess("");

      await changePassword(passwordForm);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to change password."));
    } finally {
      setChangingPassword(false);
    }
  }

  function toggleNotification(key: keyof typeof DEFAULT_NOTIFICATIONS) {
    setNotifications((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem("srn_admin_notifications", JSON.stringify(next));
      return next;
    });
  }

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  return (
    <main className="min-h-full bg-[#fffaf7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Administration
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-950">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Manage your administrator account, security preferences and panel settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-orange-200 bg-white px-5 py-3 font-bold text-orange-700 shadow-sm hover:bg-orange-50"
          >
            Refresh
          </button>
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

        {loading ? (
          <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-12 text-center text-gray-500 shadow-sm">
            Loading settings...
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Profile */}
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Administrator Profile</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the account details used by the admin panel.
                  </p>
                </div>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-700">
                  {user?.role || "ADMIN"}
                </span>
              </div>

              <form onSubmit={handleProfileSave} className="grid gap-6 lg:grid-cols-[auto_1fr]">
                <div className="flex justify-center lg:justify-start">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-2xl font-black text-orange-700 ring-4 ring-orange-50">
                    {initials(user?.name)}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-700">Full name</span>
                    <input
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="Administrator name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-700">Email</span>
                    <input
                      value={user?.email || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-700">Phone</span>
                    <input
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="Phone number"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-bold text-gray-700">Joined</span>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
                      {formatDate(user?.createdAt)}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-2xl bg-[#c2410c] px-6 py-3 font-bold text-white shadow-sm transition hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Security */}
              <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-950">Security</h2>
                  <p className="mt-1 text-sm text-gray-500">Change the password for this administrator account.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    placeholder="Current password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    placeholder="New password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 font-bold text-orange-800 hover:bg-orange-100 disabled:opacity-50"
                  >
                    {changingPassword ? "Changing password..." : "Change Password"}
                  </button>
                </form>
              </section>

              {/* Notifications */}
              <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-950">Notifications</h2>
                  <p className="mt-1 text-sm text-gray-500">Control notification preferences for this browser.</p>
                </div>

                <div className="space-y-3">
                  <SettingToggle
                    label="Registration notifications"
                    description="New event and challenge registrations."
                    checked={notifications.registrations}
                    onChange={() => toggleNotification("registrations")}
                  />
                  <SettingToggle
                    label="Payment notifications"
                    description="Payment and refund activity."
                    checked={notifications.payments}
                    onChange={() => toggleNotification("payments")}
                  />
                  <SettingToggle
                    label="System notifications"
                    description="Important admin and system messages."
                    checked={notifications.system}
                    onChange={() => toggleNotification("system")}
                  />
                </div>
              </section>
            </div>

            {/* Platform */}
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-950">Platform</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Current SRN platform configuration. These values are informational until a dedicated settings API is added.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="Website" value="Sunrise Runners Network" />
                <InfoCard label="Environment" value={process.env.NODE_ENV === "production" ? "Production" : "Development"} />
                <InfoCard label="Authentication" value="JWT" />
                <InfoCard label="Payments" value="Razorpay" />
              </div>
            </section>

            {/* Account */}
            <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Admin Session</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Sign out from the current administrator session.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-red-200 bg-white px-6 py-3 font-bold text-red-700 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:bg-orange-50"
    >
      <span>
        <span className="block text-sm font-bold text-gray-900">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-orange-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#fffaf7] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-2 font-bold text-gray-900">{value}</p>
    </div>
  );
}
