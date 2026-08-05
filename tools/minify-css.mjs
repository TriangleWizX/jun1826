import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CSS_BUNDLE_REGISTRY,
  resolveWorkspacePath,
} from "./css-bundle-registry.mjs";

const THIS_FILE = fileURLToPath(import.meta.url);

const baseJobs = [
  ["assets/css/styles.css", "assets/css/styles.min.css"],
  ["assets/css/ss.css", "assets/css/ss.min.css"],
  ["assets/css/bjj-glossary.css", "assets/css/bjj-glossary.min.css"],
  ["assets/css/global.css", "assets/css/global.min.css"],
  ["assets/css/components.css", "assets/css/components.min.css"],
  ["assets/css/pages/home.css", "assets/css/pages/home.min.css"],
  ["assets/css/pages/book-free-intro.css", "assets/css/pages/book-free-intro.min.css"],
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

const jobs = Object.freeze([
  ...baseJobs,
  ...CSS_BUNDLE_REGISTRY.bundles.map((bundle) => [bundle.canonicalPath, bundle.minifiedPath]),
].map((job) => Object.freeze(job)));

const parseArgs = () => {
  const args = new Set(process.argv.slice(2));
  for (const arg of args) {
    if (arg !== "--check") throw new Error(`Unknown argument: ${arg}`);
  }
  return { check: args.has("--check") };
};

const stripComments = (text) => {
  let out = "";
  let quote = null;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      out += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
      out += character;
      continue;
    }

    if (character === "/" && text[index + 1] === "*") {
      const close = text.indexOf("*/", index + 2);
      if (close < 0) {
        out += text.slice(index);
        break;
      }
      index = close + 1;
      continue;
    }

    out += character;
  }

  return out;
};

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

const minifyCss = (css) => {
  // CSS selector whitespace is semantic (`.a :is(...)`, `:is(...) .b`,
  // `.a [data-x]`). Keep one safe separator instead of using punctuation
  // regexes that cannot distinguish selectors, declarations, and strings.
  return collapseWhitespace(stripComments(css)).trim();
};

const main = async () => {
  const { check } = parseArgs();
  const stale = [];

  for (const [source, target] of jobs) {
    const src = resolveWorkspacePath(source);
    const dst = resolveWorkspacePath(target);
    const css = await fs.readFile(src, "utf8");
    const minified = minifyCss(css);

    if (check) {
      let current = null;
      try {
        current = await fs.readFile(dst, "utf8");
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
      if (current !== minified) stale.push(target);
      continue;
    }

    await fs.writeFile(dst, minified, "utf8");
    console.log(`Wrote ${dst} (${minified.length} bytes)`);
  }

  if (check) {
    if (stale.length) {
      throw new Error(
        `Stale minified CSS (${stale.length}):\n- ${stale.join("\n- ")}\n` +
        "Run npm run styles:min to regenerate it."
      );
    }
    console.log(`Minified CSS is current (${jobs.length} source/target pairs).`);
  }
};

export { jobs, minifyCss };

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
