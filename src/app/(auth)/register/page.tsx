"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { registerUser } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");

      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      console.log("Registration successful:", response);

      setStatus("done");

      // JWT is already saved inside registerUser().
      // Redirect user to dashboard after successful registration.
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      console.error("Registration failed:", err);

      setStatus("idle");

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    }
  };

  return (
    <main className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding */}
      <section className="hidden lg:flex relative w-[48%] h-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200"
            alt="Runners at sunrise"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 z-10 bg-black/35" />
        </div>

        {/* Logo */}
        <div className="absolute top-12 left-12 z-[999]">
          <img
            src="/logo.png.jpeg"
            alt="SRN Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Branding Card */}
        <div className="absolute bottom-12 left-12 z-20">
          <div className="glass-card w-[380px] rounded-3xl p-8">
            <span className="text-5xl leading-none text-white">
              <span
                className="material-symbols-outlined text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                fitness_center
              </span>
            </span>

            <h1 className="mt-2 text-5xl font-black leading-[1.05] text-white">
              Every mile starts with a single step forward.
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-white/90">
              Sunrise Runners Network — empowering your journey from the
              first light.
            </p>

            <div className="mt-md flex items-center gap-sm">
              <span className="font-label-bold text-xs text-white">
                Join 50,000+ runners already on the network
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Register Form */}
      <section className="flex h-full flex-1 flex-col items-center justify-center overflow-y-auto bg-surface-container-lowest p-md md:p-xl">
        <div className="w-full max-w-[440px] space-y-lg">
          {/* Mobile Logo */}
          <div className="mb-md flex justify-center md:hidden">
            <img
              alt="SRN Logo"
              className="h-10 w-auto"
              src="/logo.png.jpeg"
            />
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">
              Join the Community
            </h2>

            <p className="font-body-md text-sm text-on-surface-variant">
              Create your runner profile and start your fitness journey.
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-md"
            onSubmit={handleSubmit}
          >
            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="full_name"
                className="font-label-bold text-xs text-on-surface"
              >
                FULL NAME
              </label>

              <div className="relative">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Alex Runner"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "loading"}
                  className="input-focus-effect w-full rounded-lg border-0 border-b-2 border-transparent bg-surface-container px-md py-sm font-body-md transition-all"
                />

                <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                  person
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="font-label-bold text-xs text-on-surface"
              >
                EMAIL ADDRESS
              </label>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="runner@sunrise.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="input-focus-effect w-full rounded-lg border-0 border-b-2 border-transparent bg-surface-container px-md py-sm font-body-md transition-all"
                />

                <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                  mail
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="font-label-bold text-xs text-on-surface"
              >
                PHONE NUMBER
              </label>

              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={status === "loading"}
                  className="input-focus-effect w-full rounded-lg border-0 border-b-2 border-transparent bg-surface-container px-md py-sm font-body-md transition-all"
                />

                <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                  phone
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="font-label-bold text-xs text-on-surface"
              >
                PASSWORD
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === "loading"}
                  className="input-focus-effect w-full rounded-lg border-0 border-b-2 border-transparent bg-surface-container px-md py-sm font-body-md transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={status === "loading"}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword
                      ? "visibility_off"
                      : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label
                htmlFor="confirm_password"
                className="font-label-bold text-xs text-on-surface"
              >
                CONFIRM PASSWORD
              </label>

              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={status === "loading"}
                  className="input-focus-effect w-full rounded-lg border-0 border-b-2 border-transparent bg-surface-container px-md py-sm font-body-md transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  disabled={status === "loading"}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirm
                      ? "visibility_off"
                      : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-sm">
              <input
                id="terms"
                type="checkbox"
                required
                disabled={status === "loading"}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />

              <label
                htmlFor="terms"
                className="cursor-pointer font-body-md text-xs text-on-surface-variant"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-label-bold text-primary hover:underline"
                >
                  Terms &amp; Conditions
                </a>
              </label>
            </div>

            {/* API Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-sm rounded-full bg-gradient-to-r from-[#ab3500] to-[#ff6b35] py-sm font-label-bold text-sm text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    sync
                  </span>
                  Creating Account...
                </>
              ) : status === "done" ? (
                <>
                  Account Created!
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Social Signup */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-outline-variant" />

            <span className="mx-md flex-shrink font-label-bold text-xs text-on-surface-variant">
              OR SIGN UP WITH
            </span>

            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-center gap-sm rounded-xl border-2 border-outline-variant px-lg py-sm font-label-bold text-sm text-on-surface transition-all hover:bg-surface-container active:scale-[0.98]"
            >
              Google
            </button>

            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-sm rounded-xl border-2 border-outline-variant px-lg py-sm font-label-bold text-sm text-on-surface/50 transition-all cursor-not-allowed"
              title="Strava integration will be available later"
            >
              Strava
            </button>
          </div>

          {/* Login */}
          <p className="text-center font-body-md text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-label-bold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>

          {/* Footer */}
          <p className="font-body-md text-center text-xs text-on-surface-variant/60">
            © 2026 Sunrise Runners Network. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}