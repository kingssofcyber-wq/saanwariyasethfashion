import { getMcpServerCard, discoveryJsonResponse } from "@/lib/mcp-discovery";

export function GET() {
  return discoveryJsonResponse(getMcpServerCard(), "application/mcp-server-card+json");
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
    },
  });
}
