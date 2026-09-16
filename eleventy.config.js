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

eleventyConfig.addTransform("copy-integrity-normalization", function (content) {
  const outputPath = this.page?.outputPath || "";
  if (typeof content !== "string" || !outputPath.endsWith(".html")) return content;
    content = content.replace(/home-class/gi, "class");
  let output = content.replace(/\bvisit\s+visit\b/gi, "visit").replace(/\bclass\s+class\b/gi, "class").replace(/\bprogram\s+program\b/gi, "program").replace(/\b12-week\s+12-week\b/gi, "12-week");
  if (outputPath.endsWith("/fall-practice-reset/index.html")) {
    output = output.replace(/School starts September 3\. placement begins September 8; the full weekly format begins September 14\. Fall Placement Week runs September 8–12\. Four youth classes meet at 5 PM\. Choose three recurring regular class times for the fall schedule\./gi, "Fall Placement Week runs September 8–12. Fall classes begin September 14. Choose 3 class days: Monday No-Gi, Tuesday Gi, Wednesday No-Gi, or Friday Gi.").replace(/Four youth (?:class )?options 5 PM/gi, "Choose 3 class days").replace(/Friday Gi Lab/gi, "Gi").replace(/Reserve three recurring regular class times by September 12; make-up (?:classes? is|classes are) available(?: by text when plans change| when space is open)\./gi, "Make-up classes are available when space is open.");
  }
  return output.replace(/Four youth class options 5 PM/gi, "Choose 3 class days").replace(/Reserve three recurring regular class times by September 12; make-up class available by text when plans change\./gi, "Make-up classes are available when space is open.");
});
eleventyConfig.addTransform("acquisition-page-subtraction", function (content) {
  const outputPath = this.page?.outputPath || "";
  if (typeof content !== "string" || !outputPath.endsWith(".html")) return content;
  let output = content;
  if (outputPath.endsWith("/schedule/index.html")) {
  output = output.replace(/<section[^>]*aria-labelledby="faq-title"[\s\S]*?<\/section>/i, "").replace(/<section[^>]*aria-labelledby="schedule-local-planning-title"[\s\S]*?<\/section>/i, "").replace(/<section[^>]*aria-label="12-week program Schedule Rescheduling Policy"[\s\S]*?<\/section>/i, "").replace(/<section[^>]*aria-labelledby="saturday-nogi"[\s\S]*?<\/section>/i, "").replace(/<section[^>]*aria-labelledby="free-intro-flow"[\s\S]*?<\/section>/i, "");
  }

  if (outputPath.endsWith("/bjj-classes/adults-tannersville-ny/index.html")) {
    for (const id of ["adults-aeo-title", "private-classes", "program-faq", "nearby-title", "adult-agency-title"]) {
      output = output.replace(new RegExp(`<section[^>]*(?:id="${id}"|aria-labelledby="${id}")[\\s\\S]*?<\\/section>`, "i"), "");
    }
    output = output.replace(/<section[^>]*ss-culture-explanation[\s\S]*?<\/section>/i, "");
  }
  if (outputPath.endsWith("/bjj-classes/teens-tannersville-ny/index.html")) {
    output = output.replace(/<section[^>]*id="teen-culture-title"[\s\S]*?<\/section>/i, "").replace(/<section[^>]*ss-culture-explanation[\s\S]*?<\/section>/i, "");
  }
  if (outputPath.endsWith("/bjj-classes/kids-tannersville-ny/index.html")) {
    output = output.replace(/<section[^>]*ss-culture-explanation[\s\S]*?<\/section>/i, "");
  }
  const acquisitionRoute = /\/(?:index\.html|schedule\/index\.html|options-pricing(?:\/index)?\.html|contact\.html|free-bjj-intro-tannersville-ny\/index\.html|fall-practice-reset\/index\.html|holiday-schedule\.html|bjj-classes\/(?:kids|teens|adults)-tannersville-ny\/index\.html|show-up-kit\.html)$/.test(outputPath);
  if (acquisitionRoute) {
    output = output.replace(/recurring regular class timees?/gi, "class days").replace(/home-class reservations?/gi, "class reservations").replace(/home-class schedules?/gi, "weekly class plans").replace(/home-class seats?/gi, "weekly class places").replace(/open-seat rescheduling/gi, "make-up classes when space is open").replace(/\bUp 36\b/gi, "Up to 36").replace(/\bOne uniform first\b/gi, "One uniform for first").replace(/Starting easier\. first uniform included/gi, "Starting easier. One uniform is included").replace(/first visit\s+Visit/gi, "First Visit");
  }
  output = output.replace(/<section[^>]*class="[^"]*ss-culture-explanation[^"]*"[\s\S]*?<\/section>/gi, "").replace(/<section[^>]*aria-labelledby="teen-culture-title"[\s\S]*?<\/section>/i, "");
  return output;
});
eleventyConfig.addTransform("plain-language-copy-cleanup", function (content) {
    const outputPath = this.page?.outputPath || "";
if (typeof content !== "string" || !outputPath.endsWith(".html")) return content;
    return content.replaceAll("timees", "times").replaceAll("12-week program is organized as a 12-week", "the program is organized as a 12-week").replace(/12-week 12-week program/gi, "12-week program").replace(/class class/gi, "class").replace(/starting lane/gi, "first class").replace(/beginner lane/gi, "beginner class").replace(/Fall formats begin Monday, September 14\. View (?:the )?current schedule through September 5; (?:the )?academy is closed September 7\./gi, "Fall Placement Week runs September 8–12. The full Fall Practice Schedule begins September 14; the academy is closed Monday, September 7 for Labor Day.").replaceAll("Labor Day No-Gi / Open Mat runs September 7 at 5:00 PM youth and 6:00 PM adults.", "the academy is closed Monday, September 7 for Labor Day.").replace(/Labor Day No-Gi \/ Open Mat runs September 7(?: at 5:00 PM youth 6:00 PM adults)?/gi, "the academy is closed Monday, September 7 for Labor Day").replace(/Labor Day No-Gi \/ Open Mat at 5:00 PM youth and 6:00 PM adults/gi, "Labor Day closure").replace(/Labor Day classes run Monday, September 7 as (?:a )?No-Gi \/ Open Mat schedule/gi, "The academy is closed Monday, September 7 for Labor Day").replace(/academy is closed Monday, September 7 for Labor Day at 5:00 PM youth 6:00 PM adults/gi, "the academy is closed Monday, September 7 for Labor Day").replace(/<span class="ss-status ss-status-special">No-Gi \/ Open Mat<\/span>/gi, "<span class=\"ss-status ss-status-closed\">Closed</span>").replace(/<li>August 24: closed<\/li>/gi, "").replace(/Last reviewed:<\/strong> August 19, 2026/gi, "Last reviewed:</strong> August 25, 2026").replace(/Why live problems matter\??/gi, "Practice that changes with you");
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
