import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("dist/bjj-faqs.html", "utf8");
const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");
for (const stale of [
  "Kanō Jigorō → Mitsuyo Maeda → Carlos Gracie → Hélio Gracie → Carlos Gracie Jr. → Roberto Maia → Kenny Florian → Josh Griffiths → Sandy",
  "Do I have to spar?</span>\n</summary>\n<div class=\"faq-answer-content\">\n<p>\n              No.",
  "Annual options are available for families and adults who want the best value.",
  "structured age-appropriate groups"
]) assert.equal(visible.includes(stale), false, `FAQ contains stale policy copy: ${stale.slice(0, 60)}`);
for (const required of [
  "Do I train during my Free First Visit?",
  "Do kids and teens train together?",
  "Is there a first-term guarantee?",
  "Youth + Teen class",
  "/sensei-jiu-jitsu",
  "/guarantee-terms",
  "/schedule",
  "coached resistance"
]) assert.equal(visible.includes(required), true, `FAQ missing required summary/link: ${required}`);
assert.equal(visible.includes("Lineage &amp; Identity"), false, "FAQ rendered duplicate lineage section");
const faqSchema = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join("\n");
if (faqSchema.includes('"@type":"FAQPage"')) {
  assert.equal(faqSchema.includes("Kanō Jigorō"), false, "FAQ schema contains historical chain");
  assert.equal(faqSchema.includes("Annual options are available"), false, "FAQ schema contains stale pricing");
}
console.log("FAQ summary-layer QA passed.");
