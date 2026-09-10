import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const routes = [
  "index.html",
  "how-class-works.html",
  "bjj-faqs.html",
  "programs.html",
  "options-pricing/index.html",
  "schedule/index.html",
  "contact.html",
  "parent-resources.html",
  "show-up-kit.html",
  "bjj-classes/kids-tannersville-ny/index.html",
  "bjj-classes/teens-tannersville-ny/index.html",
  "bjj-classes/adults-tannersville-ny/index.html",
  "free-bjj-intro-tannersville-ny/index.html",
  "jiu-jitsu-safety-tannersville-ny.html",
  "success-stories.html",
  "bjj-stretches.html",
  "local-bjj-tournaments-for-parents.html",
  "bjj-tannersville-ny-directions.html",
  "after-school/index.html",
  "private-lessons.html",
  "near/hunter-ny/index.html",
  "near/windham-ny/index.html",
  "near/haines-falls-ny/index.html",
  "near/catskill-ny/index.html",
  "sensei-studio.html"
];

const visibleText = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
const legacy = /\bfree intro\b|reserve adult intro|free beginner intro|goal mapping session|book free goal mapping|choose lane/i;
const failures = [];

for (const route of routes) {
  const file = path.join(root, "dist", route);
  if (!fs.existsSync(file)) {
    failures.push(`missing ${route}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const rendered = visibleText(html);
  if (legacy.test(rendered)) failures.push(`legacy visible copy: ${route}`);
  if (!/free first visit/i.test(rendered)) failures.push(`missing Free First Visit: ${route}`);
  if (/Reserve Your Free First Visit/i.test(rendered)
      && !/href="\/free-bjj-intro-tannersville-ny(?:[/?#"][^"]*)?"/i.test(html)) {
    failures.push(`Free First Visit CTA has no booking destination: ${route}`);
  }
}

const booking = visibleText(fs.readFileSync(path.join(root, "dist/free-bjj-intro-tannersville-ny/index.html"), "utf8"));
if (!/15-minute[\s\S]*normal clothes[\s\S]*no workout/i.test(booking)) failures.push("adult First Visit contract is missing");
if (!/20 minutes[\s\S]*athletic clothes[\s\S]*may train/i.test(booking)) failures.push("youth First Visit contract is missing");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Terminology contract QA passed (${routes.length} rendered routes).`);
