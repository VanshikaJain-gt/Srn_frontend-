/**
 * Site-wide business content.
 *
 * Every value marked PLACEHOLDER below is NOT real content. It must be replaced
 * with information supplied by the SRN team before going live. Placeholders are
 * rendered with a visible "[... to be provided]" text so they are never mistaken
 * for real details during a demo.
 */

export const SITE_NAME = "Sunrise Runners Network";

// PLACEHOLDER: real support contact details are not available yet.
export const CONTACT = {
  email: "[Support email — to be provided]",
  phone: "[Phone / WhatsApp — to be provided]",
  address: "[Address / city — to be provided]",
  hours: "[Support hours — to be provided]",
};

// PLACEHOLDER: real social media URLs are not available yet.
// Links with an empty url are hidden in the UI.
export const SOCIAL_LINKS: { label: string; icon: string; url: string }[] = [
  { label: "Facebook", icon: "facebook", url: "" },
  { label: "Instagram", icon: "camera_alt", url: "" },
  { label: "YouTube", icon: "play_circle", url: "" },
  { label: "Email", icon: "alternate_email", url: "" },
];

// PLACEHOLDER: legal pages need text approved by the SRN team / legal advisor.
export const LEGAL_PLACEHOLDER_NOTICE =
  "[Final text to be provided by Sunrise Runners Network. This page is a placeholder and is not a legal document.]";

/**
 * Google Sign-In is only shown when a client id is configured at build time.
 * NEXT_PUBLIC_* variables are inlined by Next.js, so this must stay a direct
 * process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID reference.
 */
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

export const GOOGLE_LOGIN_ENABLED = GOOGLE_CLIENT_ID.length > 0;
