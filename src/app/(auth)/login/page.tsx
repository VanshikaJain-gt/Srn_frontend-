"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/providers/GoogleSignInButton";
import { getErrorMessage } from "@/lib/api-client";
import { GOOGLE_LOGIN_ENABLED } from "@/lib/site-config";
import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  /**
   * Email / Password Login
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password,
      });

      if (response.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to login. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* =========================
          LEFT SIDE - BRANDING
      ========================== */}
      <section className="hidden lg:flex relative w-[48%] h-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200"
            alt="Runners at sunrise"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
          />

          <div className="absolute inset-0 bg-black/35 z-10" />
        </div>

        <div className="absolute top-12 left-12 z-[999]">
          <img
            src="/logo.png.jpeg"
            alt="SRN Logo"
            className="h-12 w-auto"
          />
        </div>

        <div className="absolute bottom-12 left-12 z-20">
          <div className="glass-card rounded-3xl p-8 w-[380px]">
            <h1 className="text-white text-6xl font-black leading-[1.05] mt-2">
              The only run you regret is the one you didn&apos;t start.
            </h1>

            <p className="mt-8 text-lg text-white/90 leading-relaxed">
              Join 50,000+ runners chasing the dawn every morning.
            </p>

            <div className="mt-md flex items-center gap-sm">
              <span className="text-white font-label-bold text-xs">
                Active in your area
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          RIGHT SIDE - LOGIN
      ========================== */}
      <section className="flex-1 h-full flex flex-col justify-center items-center p-md md:p-xl bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-lg">

          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-md">
            <img
              alt="SRN Logo"
              className="h-10 w-auto"
              src="/logo.png.jpeg"
            />
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">
              Welcome Back, Runner
            </h2>

            <p className="font-body-md text-sm text-on-surface-variant">
              Access your dashboard and sync your latest stats.
            </p>
          </div>

          {/* =========================
              SOCIAL LOGIN (only when Google is configured)
          ========================== */}
          {GOOGLE_LOGIN_ENABLED && (
            <>
              <GoogleSignInButton onError={setError} />

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-outline-variant" />

                <span className="flex-shrink mx-md text-on-surface-variant font-label-bold text-xs">
                  OR LOGIN WITH EMAIL
                </span>

                <div className="flex-grow border-t border-outline-variant" />
              </div>
            </>
          )}

          {/* API Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* =========================
              EMAIL LOGIN FORM
          ========================== */}
          <form
            className="space-y-md"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="space-y-1">
              <label
                className="font-label-bold text-xs text-on-surface"
                htmlFor="email"
              >
                EMAIL ADDRESS
              </label>

              <input
                className="w-full px-md py-sm bg-surface-container border-0 border-b-2 border-transparent rounded-lg input-focus-effect font-body-md transition-all"
                id="email"
                name="email"
                placeholder="runner@sunrise.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className="font-label-bold text-xs text-on-surface"
                  htmlFor="password"
                >
                  PASSWORD
                </label>

                <Link
                  className="font-label-bold text-xs text-primary hover:underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  className="w-full px-md py-sm bg-surface-container border-0 border-b-2 border-transparent rounded-lg input-focus-effect font-body-md transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword
                      ? "visibility_off"
                      : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sunrise-gradient text-white font-label-bold text-sm py-sm rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    sync
                  </span>

                  Authenticating...
                </>
              ) : (
                <>
                  Login to Network

                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="text-center font-body-md text-sm text-on-surface-variant">
            New to the network?{" "}
            <Link
              className="text-primary font-label-bold hover:underline"
              href="/register"
            >
              Create a runner profile
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-on-surface-variant/60 font-body-md">
            © {new Date().getFullYear()} Sunrise Runners Network. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}