const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL || "https://saanwariyasethfashion.com";
const siteUrl = /^https?:\/\//i.test(siteUrlRaw) ? siteUrlRaw : `https://${siteUrlRaw}`;

function validPublicProfile(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const sameAsUrls = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  process.env.NEXT_PUBLIC_PINTEREST_URL,
  process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL,
].map(validPublicProfile).filter((url): url is string => Boolean(url));

export const siteConfig = {
  name: "Saanwariya Seth Fashion",
  legalName: process.env.NEXT_PUBLIC_LEGAL_BUSINESS_NAME || "Saanwariya Seth Fashion",
  url: siteUrl.replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  businessAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  sameAsUrls,
  currency: "INR",
};
