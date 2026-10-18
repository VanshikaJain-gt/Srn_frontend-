"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

import { getErrorMessage } from "@/lib/api-client";
import { GOOGLE_LOGIN_ENABLED } from "@/lib/site-config";
import { loginWithGoogle } from "@/services/auth.service";

/**
 * Google sign-in / sign-up via POST /api/auth/google.
 * Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.
 */
export default function GoogleSignInButton({
  text = "signin_with",
  onError,
}: {
  text?: "signin_with" | "signup_with" | "continue_with";
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!GOOGLE_LOGIN_ENABLED) {
    return null;
  }

  async function handleSuccess(credentialResponse: CredentialResponse) {
    onError("");

    if (!credentialResponse.credential) {
      onError("Google login failed. No credential received.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const response = await loginWithGoogle({
        idToken: credentialResponse.credential,
      });

      router.push(response.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      onError(getErrorMessage(err, "Unable to login with Google. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError("Google login failed. Please try again.")}
        useOneTap={false}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width="210"
      />

      {loading && (
        <p className="text-center text-sm text-on-surface-variant">
          Signing in with Google...
        </p>
      )}
    </div>
  );
}
