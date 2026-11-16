import type { ReactNode } from "react";

/** Safely serialize JSON-LD so user/catalog text cannot terminate the script element. */
export function JsonLd({ data }: { data: unknown }): ReactNode {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
