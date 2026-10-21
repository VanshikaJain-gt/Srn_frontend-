/**
 * Unsigned browser upload of activity proof screenshots to Cloudinary.
 * The upload preset (configured in Cloudinary) stores files in the srn-proofs folder.
 * Both values are public (NEXT_PUBLIC_*), not secrets. When either is missing the
 * upload option is hidden and runners can only paste a proof link.
 */
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";

export const PROOF_UPLOAD_ENABLED =
  CLOUDINARY_CLOUD_NAME.length > 0 && CLOUDINARY_UPLOAD_PRESET.length > 0;

export const PROOF_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PROOF_MAX_BYTES = 5 * 1024 * 1024;

/** Error message for a file that may not be uploaded, or null when it is fine. */
export function validateProofImage(file: File): string | null {
  if (!PROOF_IMAGE_TYPES.includes(file.type)) {
    return "Screenshot must be a JPG, PNG or WEBP image.";
  }

  if (file.size > PROOF_MAX_BYTES) {
    return "Screenshot must be 5 MB or smaller.";
  }

  return null;
}

/** Uploads the image and returns its https URL (secure_url). */
export async function uploadProofImage(file: File): Promise<string> {
  if (!PROOF_UPLOAD_ENABLED) {
    throw new Error("Screenshot upload is not available. Please paste a link instead.");
  }

  const invalid = validateProofImage(file);
  if (invalid) {
    throw new Error(invalid);
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let response: Response;

  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
      { method: "POST", body }
    );
  } catch {
    throw new Error("Could not upload the screenshot. Please check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as {
    secure_url?: unknown;
    error?: { message?: unknown };
  } | null;

  if (!response.ok) {
    const message = data?.error?.message;
    throw new Error(
      typeof message === "string" && message
        ? `Screenshot upload failed: ${message}`
        : "Screenshot upload failed. Please try again."
    );
  }

  if (typeof data?.secure_url !== "string" || !data.secure_url.startsWith("https://")) {
    throw new Error("Screenshot upload failed. Please try again.");
  }

  return data.secure_url;
}
