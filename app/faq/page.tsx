import type { Metadata } from "next";
import Link from "next/link";
import { AdUnit } from "@/components/adsense";
import { JsonLd } from "@/components/json-ld";
import { getFaqPageSchema } from "@/lib/structured-data";
export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Answers about shopping, orders, Cash on Delivery, shipping, returns, product information and marketplace purchases.", alternates: { canonical: "/faq" } };
const faqs: Array<[string, string]> = [
  ["How do I place an order?", "Browse the shop, open a product page, check its details and availability, then add it to your bag. Continue to checkout and sign in or create an account when prompted. Confirm that your address and order summary are correct before placing the order."],
  ["Which payment method is currently available?", "The current store checkout is configured for Cash on Delivery. Online payment methods should only be used when an official payment gateway is displayed in the checkout."],
  ["How much does shipping cost?", "The current checkout applies ₹79 shipping on orders below ₹999 and complimentary standard shipping on eligible orders of ₹999 or more. The final amount is displayed in the order summary before you place an order."],
  ["How can I track my order?", "Sign in and open My Orders to see the order history and status available in your account. If you need help, contact support with the order number."],
  ["Can I cancel an order?", "Contact customer support as soon as possible with your order number. A cancellation may not be possible once an order has been packed or handed to the courier. The store will confirm whether the cancellation has been accepted."],
  ["Can every product be returned or exchanged?", "Return and exchange eligibility can vary by product. Check the product page and the Returns & Exchanges Policy before ordering. Contact support and wait for return instructions before sending an item back."],
  ["What should I do if an item arrives damaged or incorrect?", "Contact customer support promptly. Include your order number and clear photographs of the product and outer packaging where relevant. Keep the packaging until the issue has been reviewed."],
  ["Why does a product open on Flipkart?", "Marketplace picks are external listings. If you continue to Flipkart, the marketplace or seller handles the purchase, delivery, payment, cancellation and returns under its own terms."],
  ["What is Quick View?", "The Quick View icon opens the full product detail page, where you can read the description, check availability, add the item to your bag, save it or compare it with other products."],
  ["How does the wishlist and compare feature work?", "Use the heart icon to save a product and the compare icon to add it to your comparison list. These selections are stored in your browser on that device. The compare page supports up to four products."],
  ["How can I contact the store?", "Use the contact form or email the support address displayed on the Contact Us page. Include your order number for order-related questions and never send passwords, OTPs or card PINs."],
  ["Are product photos always the exact item?", "Some catalogue photographs may be illustrative. Review each product's specific description and product information, and contact support if you need clarification before ordering."],
];
export default function FAQPage() {
  return <div className="container page-wrap content-page faq-page"><JsonLd data={getFaqPageSchema(faqs)}/><div className="breadcrumbs"><Link href="/">Home</Link> / <span>FAQs</span></div><span className="eyebrow">GOOD TO KNOW</span><h1>Questions, <i>answered.</i></h1><p className="contact-intro">Find helpful information about shopping with Saanwariya Seth Fashion. If you cannot find an answer, <Link href="/contact">contact our support team</Link>.</p><div className="faq-list">{faqs.map(([question, answer], index) => <details className="faq-item" key={question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{question}</summary><p>{answer}</p></details>)}</div><AdUnit slotKey="content" className="legal-ad-slot"/></div>;
}
