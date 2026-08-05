import path from "node:path";

export default function (eleventyConfig) {
  // Ignore archive and temporary build/qa directories
  eleventyConfig.ignores.add("_archive/**");
  eleventyConfig.ignores.add("archive/**");
  eleventyConfig.ignores.add("tmp/**");
  eleventyConfig.ignores.add("crawl-reports/**");
  eleventyConfig.ignores.add("playwright-report/**");

  // Passthrough copy static assets to output
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/downloads": "downloads" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
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
