"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  changePassword,
  getCurrentUser,
  User,
} from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
        setErrorMessage("Unable to load your account information.");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  const passwordAlreadySet = user?.passwordSet === true;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (passwordAlreadySet && !currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword: passwordAlreadySet
          ? currentPassword
          : undefined,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(
        passwordAlreadySet
          ? "Your password has been changed successfully."
          : "Your password has been set successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh user data.
      // Google user will now have passwordSet = true.
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error("Password update failed:", error);

      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Unable to update password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-[#fff8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#fde3db] border-t-[#ab3500]" />
          <p className="mt-4 text-sm text-[#594139]">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f6] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-bold text-[#ab3500] hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ab3500]">
            Account Settings
          </p>

          <h1 className="mt-2 font-[Sora] text-3xl font-bold text-[#261814]">
            Settings
          </h1>

          <p className="mt-2 text-sm text-[#594139]">
            Manage your account and password.
          </p>
        </div>

        {/* Profile summary */}
        <section className="mb-6 rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">

            <div className="h-16 w-16 overflow-hidden rounded-full bg-[#fde3db]">
              <img
                src={
                  user?.profilePhotoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "Runner"
                  )}&background=ab3500&color=ffffff&size=128`
                }
                alt={user?.name || "Runner"}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#261814]">
                {user?.name || "Runner"}
              </h2>

              <p className="text-sm text-[#594139]">
                {user?.email}
              </p>
            </div>
          </div>
        </section>

        {/* Password section */}
        <section className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#594139]">
              Security
            </p>

            <h2 className="mt-2 font-[Sora] text-2xl font-bold text-[#261814]">
              {passwordAlreadySet
                ? "Change Password"
                : "Set Password"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#594139]">
              {passwordAlreadySet
                ? "Enter your current password and create a new password."
                : "Your account currently does not have a password. Set one to enable email and password login."}
            </p>
          </div>

          {/* Success */}
          {successMessage && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {successMessage}
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Current password - only local/password users */}
            {passwordAlreadySet && (
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                showPassword={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((prev) => !prev)
                }
                autoComplete="current-password"
                disabled={loading}
              />
            )}

            {/* New password */}
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              showPassword={showNewPassword}
              onToggle={() =>
                setShowNewPassword((prev) => !prev)
              }
              autoComplete="new-password"
              disabled={loading}
            />

            {/* Confirm password */}
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              autoComplete="new-password"
              disabled={loading}
            />

            <div className="rounded-xl bg-[#fff1ed] px-4 py-3">
              <p className="text-xs leading-5 text-[#594139]">
                Your password must contain at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[#ab3500] to-[#ff6b35] py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : passwordAlreadySet
                  ? "Change Password"
                  : "Set Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
  autoComplete: "current-password" | "new-password";
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#594139]">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          disabled={disabled}
          className="w-full rounded-xl border border-[#e1bfb5] bg-[#fff8f6] px-4 py-3 pr-16 text-sm text-[#261814] outline-none transition focus:border-[#ab3500] focus:ring-2 focus:ring-[#ff6b35]/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#594139] hover:text-[#ab3500] disabled:opacity-50"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}