import fs from "node:fs/promises";
import path from "node:path";

const jobs = [
  ["assets/css/styles.css", "assets/css/styles.min.css"],
  ["assets/css/ss.css", "assets/css/ss.min.css"],
  ["assets/css/bjj-glossary.css", "assets/css/bjj-glossary.min.css"],
  ["assets/css/global.css", "assets/css/global.min.css"],
  ["assets/css/components.css", "assets/css/components.min.css"],
  ["assets/css/pages/home.css", "assets/css/pages/home.min.css"],
  ["assets/css/pages/schedule.css", "assets/css/pages/schedule.min.css"],
  ["assets/css/pages/kids.css", "assets/css/pages/kids.min.css"],
  ["assets/css/pages/teens.css", "assets/css/pages/teens.min.css"],
  ["assets/css/pages/adults.css", "assets/css/pages/adults.min.css"],
  ["assets/css/pages/student-hub.css", "assets/css/pages/student-hub.min.css"],
  ["assets/css/pages/glossary.css", "assets/css/pages/glossary.min.css"],
  ["assets/css/pages/pricing.css", "assets/css/pages/pricing.min.css"],
  ["assets/css/pages/private-lessons.css", "assets/css/pages/private-lessons.min.css"],
  ["assets/css/pages/near.css", "assets/css/pages/near.min.css"],
  ["assets/css/pages/directions.css", "assets/css/pages/directions.min.css"],
  ["assets/css/pages/tannersville.css", "assets/css/pages/tannersville.min.css"],
  ["assets/css/evidence.css", "assets/css/evidence.min.css"],
  ["assets/css/near-cro.css", "assets/css/near-cro.min.css"],
  ["assets/css/blog.css", "assets/css/blog.min.css"],
  ["assets/css/blog-cro.css", "assets/css/blog-cro.min.css"],
  ["assets/css/school-families-cro.css", "assets/css/school-families-cro.min.css"],
  ["assets/css/schedule-consistency.css", "assets/css/schedule-consistency.min.css"],
  ["assets/css/partner-pages.css", "assets/css/partner-pages.min.css"],
  ["assets/css/pages/partners-hospitality-hunter-windham.css", "assets/css/pages/partners-hospitality-hunter-windham.min.css"],
];

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");

const collapseWhitespace = (text) => {
  let out = "";
  let inStr = null;
  let escape = false;

  for (const ch of text) {
    if (inStr) {
      out += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }

    if (ch === "\"" || ch === "'") {
      inStr = ch;
      out += ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (out && out[out.length - 1] !== " ") {
        out += " ";
      }
      continue;
    }

    out += ch;
  }

  return out;
};

for (const [source, target] of jobs) {
  const src = path.resolve(source);
  const dst = path.resolve(target);
  const css = await fs.readFile(src, "utf8");
  let minified = collapseWhitespace(stripComments(css));
  // Keep spaces around `+` so `calc(a + b)` stays valid after minification.
  minified = minified.replace(/\s*([{}:;,>~()\[=])\s*/g, "$1");
  minified = minified.replace(/;}/g, "}").trim();
  await fs.writeFile(dst, minified, "utf8");
  console.log(`Wrote ${dst} (${minified.length} bytes)`);
}
