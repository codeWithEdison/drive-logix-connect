/**
 * SEO data and utilities for Rwanda logistics platform
 */

export const BASE_URL = "https://lovelycargo.rw";

export const DEFAULT_SEO = {
  title: "Lovely Cargo - Best Logistics Solutions in Rwanda | Cargo Tracking & Delivery Services",
  description: "Leading logistics and cargo delivery services in Rwanda. Real-time tracking, fleet management, and reliable transportation solutions across Kigali and all districts. Fast, secure, and affordable cargo delivery in Rwanda.",
  keywords: "logistics Rwanda, cargo delivery Rwanda, freight services Rwanda, transportation Rwanda, cargo tracking Rwanda, delivery services Kigali, logistics company Rwanda, cargo management Rwanda, fleet management Rwanda, shipping Rwanda, courier services Rwanda, express delivery Rwanda, cargo transport Rwanda, logistics solutions Rwanda, freight forwarding Rwanda, parcel delivery Rwanda, same day delivery Rwanda, intercity delivery Rwanda, cargo tracking system Rwanda, transport services Rwanda",
  image: `${BASE_URL}/lovewaylogistic.png`,
};

// Page-specific SEO configurations
export const PAGE_SEO: Record<string, {
  title: string;
  description: string;
  keywords: string;
  path: string;
}> = {
  home: {
    title: "Lovely Cargo - Best Logistics Solutions in Rwanda | Cargo Tracking & Delivery",
    description: "Leading logistics and cargo delivery services in Rwanda. Real-time tracking, fleet management, and reliable transportation solutions across Kigali and all districts.",
    keywords: "logistics Rwanda, cargo delivery Rwanda, freight services Rwanda, transportation Rwanda, cargo tracking Rwanda, delivery services Kigali",
    path: "/",
  },
  login: {
    title: "Login - Lovely Cargo | Access Your Logistics Dashboard",
    description: "Login to your Lovely Cargo account to track shipments, manage deliveries, and access your logistics dashboard in Rwanda.",
    keywords: "logistics login Rwanda, cargo tracking login, delivery management login Rwanda",
    path: "/login",
  },
  register: {
    title: "Register - Lovely Cargo | Start Shipping in Rwanda",
    description: "Create your Lovely Cargo account and start shipping across Rwanda. Fast, reliable, and secure cargo delivery services.",
    keywords: "register logistics Rwanda, sign up cargo delivery, create account logistics Rwanda",
    path: "/register",
  },
  tracking: {
    title: "Track Your Cargo - Real-time Tracking | Lovely Cargo Rwanda",
    description: "Track your cargo in real-time across Rwanda. Get live updates on your shipment location, delivery status, and estimated arrival time.",
    keywords: "cargo tracking Rwanda, real-time tracking, shipment tracking Rwanda, package tracking, delivery status Rwanda",
    path: "/tracking",
  },
  createCargo: {
    title: "Create Cargo Shipment - Lovely Cargo Rwanda",
    description: "Create a new cargo shipment with Lovely Cargo. Fast, secure, and reliable delivery services across Rwanda. Book your shipment today.",
    keywords: "create cargo Rwanda, book shipment Rwanda, cargo booking, delivery booking Rwanda, ship cargo Rwanda",
    path: "/create-cargo",
  },
  myCargos: {
    title: "My Cargos - Manage Your Shipments | Lovely Cargo",
    description: "View and manage all your cargo shipments in one place. Track status, view history, and manage deliveries with Lovely Cargo.",
    keywords: "my cargo Rwanda, manage shipments, cargo management, delivery management Rwanda",
    path: "/my-cargos",
  },
  history: {
    title: "Delivery History - Lovely Cargo Rwanda",
    description: "View your complete delivery history with Lovely Cargo. Track past shipments, invoices, and delivery records in Rwanda.",
    keywords: "delivery history Rwanda, shipment history, cargo history, past deliveries Rwanda",
    path: "/history",
  },
  payment: {
    title: "Payment - Secure Payment Gateway | Lovely Cargo",
    description: "Make secure payments for your cargo shipments. Multiple payment options available for Lovely Cargo services in Rwanda.",
    keywords: "cargo payment Rwanda, logistics payment, delivery payment, secure payment Rwanda",
    path: "/payment",
  },
  invoices: {
    title: "Invoices - View Your Bills | Lovely Cargo",
    description: "View and download your invoices for all cargo shipments. Complete billing history and payment records with Lovely Cargo.",
    keywords: "cargo invoices Rwanda, logistics invoices, delivery bills, shipment invoices Rwanda",
    path: "/invoices",
  },
};

// Structured data generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lovely Cargo",
  alternateName: "Lovely Cargo Platform",
  url: BASE_URL,
  logo: `${BASE_URL}/lovewaylogistic.png`,
  description: "Leading logistics and cargo delivery services in Rwanda. Real-time tracking, fleet management, and reliable transportation solutions across Kigali and all districts of Rwanda.",
  foundingDate: "2024",
  industry: "Logistics and Transportation",
  serviceType: [
    "Cargo Tracking",
    "Fleet Management",
    "Transportation Management",
    "Real-time Logistics Tracking",
    "Supply Chain Management",
    "Freight Management",
    "Express Delivery",
    "Courier Services",
    "Parcel Delivery",
    "Intercity Transportation",
  ],
  areaServed: {
    "@type": "Country",
    name: "Rwanda",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "RW",
    addressRegion: "Kigali",
    addressLocality: "Kigali",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    availableLanguage: ["English", "Kinyarwanda", "French"],
    areaServed: "RW",
  },
  sameAs: [
    "https://twitter.com/lovelycargo",
    "https://facebook.com/lovelycargo",
    "https://linkedin.com/company/lovelycargo",
  ],
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${BASE_URL}${item.url}`,
  })),
});

export const generateServiceSchema = (serviceName: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Logistics and Transportation",
  name: serviceName,
  description,
  provider: {
    "@type": "Organization",
    name: "Lovely Cargo",
  },
  areaServed: {
    "@type": "Country",
    name: "Rwanda",
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const generateWebPageSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  url: `${BASE_URL}${url}`,
  inLanguage: ["en", "rw", "fr"],
  isPartOf: {
    "@type": "WebSite",
    name: "Lovely Cargo",
    url: BASE_URL,
  },
  about: {
    "@type": "Thing",
    name: "Logistics Services in Rwanda",
  },
});

