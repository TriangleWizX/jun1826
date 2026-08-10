import path from "node:path";
import fs from "node:fs";

const urlRegistry = JSON.parse(fs.readFileSync("data/url-registry.json", "utf8"));
const seoRobots = {};
const normalizePath = (value) => String(value || "/").replace(/\/$/, "") || "/";
for (const entry of urlRegistry) {
  const canonicalMismatch = entry.canonicalPath && normalizePath(entry.canonicalPath) !== normalizePath(entry.path);
  if (entry.status === "active" && (!entry.indexable || canonicalMismatch) && !entry.redirectTarget) {
    const pathName = entry.path || "/";
    seoRobots[pathName] = "noindex, follow";
    seoRobots[`${pathName.replace(/\/$/, "")}/`] = "noindex, follow";
    seoRobots[`${pathName}.html`] = "noindex, follow";
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addGlobalData("seoRobots", seoRobots);
  // Ignore archive and temporary build/qa directories
  eleventyConfig.ignores.add("_archive/**");
  eleventyConfig.ignores.add("archive/**");
  eleventyConfig.ignores.add("tmp/**");
  eleventyConfig.ignores.add("crawl-reports/**");
  eleventyConfig.ignores.add("playwright-report/**");
  // Keep editor, private tooling, and include-only fragments out of production.
  eleventyConfig.ignores.add(".tmb/**");
  eleventyConfig.ignores.add(".vscode/**");
  eleventyConfig.ignores.add(".venv/**");
  eleventyConfig.ignores.add("_drafts/**");
  eleventyConfig.ignores.add("admin/**");
  eleventyConfig.ignores.add("partials/**");
  eleventyConfig.ignores.add("snippets/**");
  eleventyConfig.ignores.add("assets/**");

  // Partials are Apache SSI payloads, not standalone Eleventy pages.
  eleventyConfig.addPassthroughCopy({ "src/partials": "partials" });

  // Passthrough copy static assets to output
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/tokens.css": "tokens.css" });
  // The booking bridge is maintained in the repository-level js/ directory.
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/downloads": "downloads" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  // Apache expands these root-relative SSI targets after deployment. They are
  // deployment artifacts, so copy the canonical root fragments into dist.
  eleventyConfig.addPassthroughCopy("nav-include.html");
  eleventyConfig.addPassthroughCopy("footer-include.html");
  eleventyConfig.addPassthroughCopy({ "src/pages-sitemap.xml": "pages-sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-core.xml": "sitemap-core.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-programs.xml": "sitemap-programs.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-locations.xml": "sitemap-locations.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-blog.xml": "sitemap-blog.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-glossary.xml": "sitemap-glossary.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });

  // Custom Nunjucks/liquid filters if needed
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj, null, 2));

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
