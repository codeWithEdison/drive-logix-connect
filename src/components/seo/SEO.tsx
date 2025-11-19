import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

const BASE_URL = "https://lovelycargo.rw";
const DEFAULT_TITLE = "Lovely Cargo - Best Logistics Solutions in Rwanda | Cargo Tracking & Delivery Services";
const DEFAULT_DESCRIPTION = "Leading logistics and cargo delivery services in Rwanda. Real-time tracking, fleet management, and reliable transportation solutions across Kigali and all districts. Fast, secure, and affordable cargo delivery in Rwanda.";
const DEFAULT_KEYWORDS = "logistics Rwanda, cargo delivery Rwanda, freight services Rwanda, transportation Rwanda, cargo tracking Rwanda, delivery services Kigali, logistics company Rwanda, cargo management Rwanda, fleet management Rwanda, shipping Rwanda, courier services Rwanda, express delivery Rwanda, cargo transport Rwanda, logistics solutions Rwanda, freight forwarding Rwanda, parcel delivery Rwanda, same day delivery Rwanda, intercity delivery Rwanda, cargo tracking system Rwanda, transport services Rwanda";
const DEFAULT_IMAGE = `${BASE_URL}/lovewaylogistic.png`;

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Lovely Cargo - Logistics Solutions in Rwanda`
      : DEFAULT_TITLE;
    const fullDescription = description || DEFAULT_DESCRIPTION;
    const fullKeywords = keywords || DEFAULT_KEYWORDS;
    const fullImage = image || DEFAULT_IMAGE;
    const fullUrl = url || `${BASE_URL}${window.location.pathname}`;

    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update or create property tags (for Open Graph)
    const updatePropertyTag = (property: string, content: string) => {
      updateMetaTag(property, content, "property");
    };

    // Basic meta tags
    updateMetaTag("description", fullDescription);
    updateMetaTag("keywords", fullKeywords);
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");
    updateMetaTag("googlebot", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph tags
    updatePropertyTag("og:title", fullTitle);
    updatePropertyTag("og:description", fullDescription);
    updatePropertyTag("og:image", fullImage);
    updatePropertyTag("og:url", fullUrl);
    updatePropertyTag("og:type", type);
    updatePropertyTag("og:site_name", "Lovely Cargo");
    updatePropertyTag("og:locale", "en_RW");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", fullDescription);
    updateMetaTag("twitter:image", fullImage);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Structured Data
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach((script) => {
        // Only remove if it's not in the base index.html (we'll keep those)
        const scriptContent = script.textContent || "";
        if (scriptContent.includes('"@type": "Organization"') || 
            scriptContent.includes('"@type": "LocalBusiness"') ||
            scriptContent.includes('"@type": "SoftwareApplication"')) {
          // Keep base structured data
          return;
        }
        script.remove();
      });

      // Add new structured data
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }
  }, [title, description, keywords, image, url, type, noindex, structuredData]);

  return null;
}

