import { siteConfig } from "@/lib/site-config";

const supportedProtocolVersions = ["2025-11-25", "2025-06-18", "2025-03-26"];

export function getMcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "com.saanwariyasethfashion/store",
    version: "1.0.0",
    title: "Saanwariya Seth Fashion Public Store Tools",
    description: "Read-only public product search and store information for Saanwariya Seth Fashion.",
    websiteUrl: siteConfig.url,
    repository: {
      url: "https://github.com/kingssofcyber-wq/saanwariyasethfashion",
      source: "github",
    },
    remotes: [
      {
        type: "streamable-http",
        url: `${siteConfig.url}/api/mcp`,
        supportedProtocolVersions,
      },
    ],
  };
}

export function getLegacyMcpServerCard() {
  return {
    version: "1.0",
    protocolVersion: "2025-03-26",
    serverInfo: {
      name: "com.saanwariyasethfashion/store",
      version: "1.0.0",
    },
    description: "Read-only public product search and store information for Saanwariya Seth Fashion.",
    mcp_endpoint: `${siteConfig.url}/api/mcp`,
    transport: {
      type: "streamable-http",
      endpoint: `${siteConfig.url}/api/mcp`,
    },
    capabilities: {
      tools: { listChanged: false },
    },
    authentication: {
      required: false,
      schemes: [],
    },
  };
}

export function getAiCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: siteConfig.name,
      identifier: siteConfig.url,
    },
    entries: [
      {
        identifier: "urn:air:saanwariyasethfashion.com:mcp:store",
        displayName: "Saanwariya Seth Fashion public store tools",
        type: "application/mcp-server-card+json",
        mediaType: "application/mcp-server-card+json",
        url: `${siteConfig.url}/api/mcp/server-card`,
        description: "Read-only public product search and store information.",
        version: "1.0.0",
        tags: ["fashion", "ecommerce", "products", "India", "INR", "read-only"],
      },
    ],
  };
}

export function discoveryJsonResponse(data: unknown, contentType: string) {
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
