import { siteConfig } from "@/lib/site-config";
import { resolveProductImage, type Product } from "@/lib/catalog";

type ReviewSummary = { rating: number; count: number };

function absoluteUrl(pathOrUrl: string): string {
  try { return new URL(pathOrUrl, `${siteConfig.url}/`).toString(); }
  catch { return `${siteConfig.url}/`; }
}

export function getOrganizationSchema() {
  const organization: Record<string, unknown> = {
    "@type": ["Organization", "OnlineStore"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: "An Indian online fashion and lifestyle store featuring sarees, suits and sets, jewellery, watches, bags, footwear, accessories and home finds.",
    url: siteConfig.url,
    logo: absoluteUrl("/brand/saanwariya-seth-fashion-logo.png"),
    image: absoluteUrl("/brand/saanwariya-seth-fashion-logo.png"),
    currenciesAccepted: "INR",
    areaServed: { "@type": "Country", name: "India" },
  };

  // Only publish a registered legal name or real business profiles explicitly supplied by the owner.
  const registeredLegalName = process.env.NEXT_PUBLIC_LEGAL_BUSINESS_NAME?.trim();
  if (registeredLegalName) organization.legalName = registeredLegalName;
  if (siteConfig.sameAsUrls.length > 0) organization.sameAs = siteConfig.sameAsUrls;

  const contactPoint: Record<string, string> = { "@type": "ContactPoint", contactType: "customer support" };
  const configuredEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const configuredPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  if (configuredEmail) contactPoint.email = configuredEmail;
  if (configuredPhone) contactPoint.telephone = configuredPhone;
  if (configuredEmail || configuredPhone) organization.contactPoint = contactPoint;

  const configuredAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim();
  if (configuredAddress) {
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: configuredAddress,
      addressCountry: "IN",
    };
  }

  return organization;
}

export function getWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: `${siteConfig.url}/`,
    name: siteConfig.name,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProductSchema(product: Product, reviewSummary?: ReviewSummary) {
  const productUrl = `${siteConfig.url}/product/${encodeURIComponent(product.slug)}`;
  const image = absoluteUrl(resolveProductImage(product));
  const schema: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    url: productUrl,
    name: product.name,
    description: product.description,
    image: [image],
    category: product.category,
    brand: { "@type": "Brand", name: product.brand || siteConfig.name },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: Number(product.price),
      priceCurrency: siteConfig.currency,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteConfig.url}/#organization` },
    },
  };

  if (reviewSummary && reviewSummary.count > 0 && Number.isFinite(reviewSummary.rating)) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(reviewSummary.rating.toFixed(1)),
      reviewCount: reviewSummary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return schema;
}

export function getHomepageSchema(products: Product[]) {
  const ownProducts = products.filter((product) => product.source !== "FLIPKART" && Number.isFinite(Number(product.price)) && Number(product.price) >= 0);
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/#home`,
        url: `${siteConfig.url}/`,
        name: `${siteConfig.name} | Indian Fashion and Lifestyle Store`,
        description: "Browse sarees, suits and sets, jewellery, watches, bags, footwear and lifestyle products.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: ownProducts.length,
          itemListElement: ownProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteConfig.url}/product/${encodeURIComponent(product.slug)}`,
            item: getProductSchema(product),
          })),
        },
      },
    ],
  };
}

export function getProductPageSchema(product: Product, reviewSummary?: ReviewSummary) {
  const productUrl = `${siteConfig.url}/product/${encodeURIComponent(product.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      getProductSchema(product, reviewSummary),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${siteConfig.url}/shop` },
          { "@type": "ListItem", position: 3, name: product.category, item: `${siteConfig.url}/shop?category=${encodeURIComponent(product.category)}` },
          { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
        ],
      },
    ],
  };
}


export function getFaqPageSchema(faqs: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}/faq#faq`,
        url: `${siteConfig.url}/faq`,
        name: "Frequently Asked Questions | Saanwariya Seth Fashion",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

export type JournalArticleSchemaInput = {
  id: string;
  category: string;
  title: string;
  intro: string;
  paragraphs: string[];
};

export function getStyleJournalSchema(articles: JournalArticleSchemaInput[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "Blog",
        "@id": `${siteConfig.url}/style-journal#blog`,
        url: `${siteConfig.url}/style-journal`,
        name: "Saanwariya Seth Fashion Style Journal",
        description: "Practical, original guides to Indian fashion, product information and accessory care.",
        publisher: { "@id": `${siteConfig.url}/#organization` },
        blogPost: articles.map((article) => ({
          "@type": "BlogPosting",
          "@id": `${siteConfig.url}/style-journal#${article.id}`,
          headline: article.title,
          description: article.intro,
          articleSection: article.category,
          articleBody: article.paragraphs.join("\n\n"),
          mainEntityOfPage: `${siteConfig.url}/style-journal#${article.id}`,
          author: { "@id": `${siteConfig.url}/#organization` },
          publisher: { "@id": `${siteConfig.url}/#organization` },
          inLanguage: "en-IN",
        })),
      },
    ],
  };
}

export function getStaticContentPageSchema(input: {
  type: "AboutPage" | "ContactPage";
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": input.type,
        "@id": `${siteConfig.url}${input.path}#page`,
        url: `${siteConfig.url}${input.path}`,
        name: input.name,
        description: input.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };
}
