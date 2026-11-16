const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL || "https://saanwariyasethfashion.com";
const siteUrl = /^https?:\/\//i.test(siteUrlRaw) ? siteUrlRaw : `https://${siteUrlRaw}`;

export const siteConfig = {
  name: "Saanwariya Seth Fashion",
  legalName: process.env.NEXT_PUBLIC_LEGAL_BUSINESS_NAME || "Saanwariya Seth Fashion",
  url: siteUrl.replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@saanwariyasethfashion.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  businessAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  currency: "INR",
};
