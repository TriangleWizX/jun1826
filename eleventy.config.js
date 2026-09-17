import path from "node:path";
import fs from "node:fs";

const urlRegistry = JSON.parse(fs.readFileSync("data/url-registry.json", "utf8"));
const seoRobots = {};
const normalizePath = (value) => String(value || "/").replace(/\/$/, "") || "/";
for (const entry of urlRegistry) {
  const canonicalMismatch = entry.canonicalPath && normalizePath(entry.canonicalPath) !== normalizePath(entry.path);
  if ((!entry.indexable || canonicalMismatch) && !entry.redirectTarget) {
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
  eleventyConfig.addPassthroughCopy({
    "assets/730dd3cb-0f20-425a-8771-431897ef21d9.png":
      "assets/730dd3cb-0f20-425a-8771-431897ef21d9.png",
    "assets/730dd3cb-0f20-425a-8771-431897ef21d9.webp":
      "assets/730dd3cb-0f20-425a-8771-431897ef21d9.webp",
  });

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
  eleventyConfig.addPassthroughCopy({ "src/manifest-daily-checkin.json": "manifest-daily-checkin.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw-daily-checkin.js": "sw-daily-checkin.js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  // Apache expands these root-relative SSI targets after deployment. They are
  // deployment artifacts, so copy the canonical partial fragments into dist.
  eleventyConfig.addPassthroughCopy({ "src/partials/nav-include.html": "nav-include.html" });
  eleventyConfig.addPassthroughCopy({ "src/partials/footer-include.html": "footer-include.html" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-core.xml": "sitemap-core.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-programs.xml": "sitemap-programs.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-locations.xml": "sitemap-locations.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-blog.xml": "sitemap-blog.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap-glossary.xml": "sitemap-glossary.xml" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });

  // Editorial articles historically carried a duplicated acquisition rail.
  // Normalize that exact legacy shell at the shared build boundary so every
  // consuming route gets the same First-Visit Contract and SSI payload.
  eleventyConfig.addTransform("normalize-acquisition-rail", function (content) {
    if (typeof content !== "string" || !content.includes('class="ss-article-rail"')) {
      return content;
    }
    return content.replace(/<aside[^>]*class="ss-article-rail"[\s\S]*?<\/aside>/gi, (rail) => {
      if (!/Free Intro Class|Free Intro Small-group class|Try This In|learn the basics with calm instruction|href="\/student-hub"/i.test(rail)) {
        return rail;
      }
      return '<!--#include virtual="/partials/acquisition-editorial-rail.html" -->';
    });
  });

  // Custom Nunjucks/liquid filters if needed
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj, null, 2));
  eleventyConfig.addFilter("metaDescription", (value) => {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    const expanded = text.length < 120
      ? `${text} Learn the basics and how the term fits a calm, beginner-friendly first class.`
      : text;
    if (expanded.length <= 160) return expanded;
    const shortened = expanded.slice(0, 157).replace(/\s+\S*$/, "").trim();
    return `${shortened}...`;
  });
  eleventyConfig.addFilter("stripDocumentShell", (content) => {
    if (typeof content !== "string" || !/<html\b/i.test(content)) return content;
    return content.replace(
      /(?:<!doctype\s+html\s*>\s*)?<html[^>]*>\s*<head>([\s\S]*?)<\/head>\s*<body[^>]*>([\s\S]*?)(?:<\/body>\s*<\/html>)?\s*$/i,
      (_shell, head, body) => {
        // Glossary definitions and their FAQs belong to the article. Preserve
        // those graphs while the shared layout owns document metadata and CSS.
        const glossaryGraphs = [...head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
          .filter((script) => {
            const graph = JSON.parse(script[1]);
            return (graph["@graph"] || [graph]).some((node) => node["@type"] === "DefinedTerm");
          })
          .map((script) => script[0]);
        return [...glossaryGraphs, body].join("\n");
      }
    );
  });

  // Keep the wellness referral page within ordinary fitness/coaching claims
  // until provider testimonials and credentials have been source-verified.
  eleventyConfig.addTransform("wellness-claims-safety", function (content) {
    const outputPath = this.page?.outputPath;
    if (typeof outputPath !== "string" || !outputPath.endsWith("/partners-wellness-pt-referrals.html")) {
      return content;
    }
    return content
      .replace(/<section aria-labelledby="testimonials-heading"[\s\S]*?<\/section>/i, "")
      .replace(/Best for cautious or rehab-adjacent clients\./gi, "Best for clients who want private, beginner-friendly coaching.")
      .replace(/Is this appropriate for complete beginners\?/gi, "Is this appropriate for complete beginners?")
      .replace(/Can sessions be modified for injuries or limitations\?/gi, "Can sessions be adjusted for comfort and pace?")
      .replace(/Yes\. Pace and focus are adjusted to the client\. Private-first options are ideal for cautious clients or those recovering from injuries, allowing for tailor-made, safe progression\./gi, "Yes. Pace and focus can be adjusted to the client, with private-first options available for a gradual, coached experience.");
  });

  // Glossary/source entries own article body content, not document shells.
  // Strip legacy embedded <html>/<head> wrappers so base.njk remains the
  // single owner of title, description, canonical, robots, and social tags.
  eleventyConfig.addTransform("strip-embedded-document-shell", function (content) {
    const doctypeRe = /<!doctype\s+html\s*>/gi;
    const firstDoctype = doctypeRe.exec(content);
    const secondDoctype = firstDoctype && doctypeRe.exec(content);
    if (!secondDoctype) return content;
    const shellOpenEnd = content.search(/<body[^>]*>/i, secondDoctype.index);
    if (shellOpenEnd < 0) return content;
    const shellClose = content.search(/<\/body>\s*<\/html>\s*$/i);
    if (shellClose < 0) return content;
    return content.slice(0, secondDoctype.index) +
      content.slice(shellOpenEnd + content.slice(shellOpenEnd).search(/>/) + 1, shellClose);
  });

  // Describe the historical student count without implying a current-member total.
  eleventyConfig.addTransform("success-stories-claim-clarity", function (content) {
    const outputPath = this.page?.outputPath;
    if (typeof outputPath !== "string" || !outputPath.endsWith("/success-stories.html")) return content;
    return content.replace("Happy Members", "Students Coached");
  });



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
