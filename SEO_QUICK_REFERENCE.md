# SEO Quick Reference - Loveway Logistics

## 🚀 Quick Start

### Add SEO to a New Page

```tsx
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO, generateWebPageSchema } from "@/lib/seo/seoData";

function MyNewPage() {
  return (
    <>
      <SEO
        title="My Page Title | Loveway Logistics"
        description="Page description for search engines"
        keywords="keyword1, keyword2, keyword3"
        url="/my-page"
        structuredData={generateWebPageSchema("Title", "Description", "/my-page")}
      />
      {/* Your content */}
    </>
  );
}
```

## 📝 Pre-configured Pages

Use these pre-configured SEO settings:

```tsx
// Landing/Home Page
PAGE_SEO.home

// Login Page
PAGE_SEO.login

// Register Page
PAGE_SEO.register

// Tracking Page
PAGE_SEO.tracking

// Create Cargo Page
PAGE_SEO.createCargo

// My Cargos Page
PAGE_SEO.myCargos

// History Page
PAGE_SEO.history

// Payment Page
PAGE_SEO.payment

// Invoices Page
PAGE_SEO.invoices
```

## 🎯 Schema Generators

### Web Page Schema
```tsx
generateWebPageSchema(name, description, url)
```

### FAQ Schema
```tsx
generateFAQSchema([
  { question: "Q?", answer: "A." },
  // ... more FAQs
])
```

### Service Schema
```tsx
generateServiceSchema(serviceName, description)
```

### Breadcrumb Schema
```tsx
generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Page", url: "/page" },
])
```

## 🔍 SEO Checklist

- [ ] Title tag (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Keywords included
- [ ] H1 with primary keyword
- [ ] Alt text on images
- [ ] Structured data added
- [ ] Canonical URL set
- [ ] Mobile-friendly

## 📊 Key Files

- `index.html` - Base SEO tags
- `src/components/seo/SEO.tsx` - SEO component
- `src/lib/seo/seoData.ts` - SEO data & utilities
- `public/sitemap.xml` - Sitemap
- `public/robots.txt` - Robots file

## 🌍 Rwanda SEO Keywords

Always include "Rwanda" or "Kigali" in keywords for local SEO:
- `logistics Rwanda`
- `cargo delivery Rwanda`
- `delivery services Kigali`
- etc.

## 📱 Base URL

All URLs should use: `https://lovelycargo.rw`

