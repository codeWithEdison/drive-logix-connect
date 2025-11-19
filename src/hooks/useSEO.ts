import { useEffect } from "react";
import { SEOProps } from "@/components/seo/SEO";
import { SEO } from "@/components/seo/SEO";

/**
 * Custom hook for managing SEO on pages
 * Usage: useSEO({ title: "Page Title", description: "Page description" })
 */
export function useSEO(props: SEOProps) {
  useEffect(() => {
    // The SEO component handles all the logic
    // This hook is just a convenience wrapper
  }, []);

  return <SEO {...props} />;
}

