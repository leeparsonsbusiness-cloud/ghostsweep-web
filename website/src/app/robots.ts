import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/history"],
        disallow: ["/api/*", "/admin"],
      },
    ],
    sitemap: "https://ghostsweep.info/sitemap.xml",
  };
}
