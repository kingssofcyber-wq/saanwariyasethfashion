export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const clientId = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "").trim();
  const publisherId = clientId.startsWith("ca-") ? clientId.slice(3) : clientId;
  const body = /^pub-\d{16}$/.test(publisherId)
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : "# Configure NEXT_PUBLIC_ADSENSE_CLIENT_ID with your real ca-pub- publisher ID in Hostinger to publish the authorized seller line.\n";
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
