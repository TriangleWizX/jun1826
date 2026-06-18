import fs from 'node:fs/promises';

const filePath = 'tools/build-glossary-pages.mjs';
let content = await fs.readFile(filePath, 'utf8');

// 1. Remove trailing ' +
content = content.replace(/' \+$/gm, '');

// 2. Fix the most obvious corruption in renderTermCta
const termCtaOld = `const renderTermCta = () => '<section id="learn-safely" class="glossary-term-cta glossary-term-cta--mid" aria-labelledby="learn-safely-title">'
  <div class="container">'
    <div class="cta-band ss-glossary-cta-band">'
      <div>'
        <h2 id="learn-safely-title">Glossary terms make more sense once you feel them on the mat.</h2>'
        <p>'
          Beginner Lane means calm coaching, a safety walkthrough, and skill-based resistance activities begin at the right pace from day one.'
          That is the easiest way to turn “I’ve heard the term” into “I understand it now.”'
        </p>'
      </div>'
      <div class="cta-actions glossary-term-cta__actions">
        <a class="btn btn-primary glossary-term-cta__button glossary-term-cta__button--primary" href="/book-free-intro">Reserve Free Intro</a>
        <a class="btn btn-secondary glossary-term-cta__button glossary-term-cta__button--secondary" href="/schedule">See Schedule</a>
        <a class="btn btn-outline-primary glossary-term-cta__button glossary-term-cta__button--outline" href="/student-hub#this-weeks-focus">Review This Week’s Class Focus</a>
      </div>
    </div>'
  </div>'
</section>';`;

const termCtaNew = `const renderTermCta = () => \`<section id="learn-safely" class="glossary-term-cta glossary-term-cta--mid" aria-labelledby="learn-safely-title">
  <div class="container">
    <div class="cta-band ss-glossary-cta-band">
      <div>
        <h2 id="learn-safely-title">Glossary terms make more sense once you feel them on the mat.</h2>
        <p>
          Beginner Lane means calm coaching, a safety walkthrough, and skill-based resistance activities begin at the right pace from day one.
          That is the easiest way to turn “I’ve heard the term” into “I understand it now.”
        </p>
      </div>
      <div class="cta-actions glossary-term-cta__actions">
        <a class="btn btn-primary glossary-term-cta__button glossary-term-cta__button--primary" href="/book-free-intro">Reserve Free Intro</a>
        <a class="btn btn-secondary glossary-term-cta__button glossary-term-cta__button--secondary" href="/schedule">See Schedule</a>
        <a class="btn btn-outline-primary glossary-term-cta__button glossary-term-cta__button--outline" href="/student-hub#this-weeks-focus">Review This Week’s Class Focus</a>
      </div>
    </div>
  </div>
</section>\`;`;

// content = content.replace(termCtaOld, termCtaNew);
// Since matching the whole block is hard, I'll just do it surgically.

// 3. Fix the CRO updates
content = content.replace(/138 terms/g, 'every term');

// 4. Fix the imports and constants that got messed up by my previous runs
content = content.replace(/import fs from 'node:fs\/promises;/, "import fs from 'node:fs/promises';");
content = content.replace(/import path from 'node:path;/, "import path from 'node:path';");
content = content.replace(/CANONICAL_ORIGIN = 'https:\/\/senseisandy.com;/, "CANONICAL_ORIGIN = 'https://senseisandy.com';");
content = content.replace(/CSS_VERSION = '20260420;/, "CSS_VERSION = '20260420';");
content = content.replace(/JS_VERSION = '20260420b;/, "JS_VERSION = '20260420b';");

// 5. Fix the variable interpolations
content = content.replace(/" \+ ([a-zA-Z0-9._()]+) \+ "/g, '${$1}');

// 6. Fix the render functions by converting to backticks
const renderFunctions = [
  'renderLayout', 'renderHubSchema', 'renderTermSchema', 'renderIndexCard',
  'renderBuyerPathsSection', 'renderHubPage', 'renderRelatedCards',
  'renderRelationshipLinks', 'renderReviewsSection',
  'renderTermPage', 'renderUpdatesPage'
];

for (const fn of renderFunctions) {
  const startPattern = new RegExp(`const ${fn} = \\(.*?\\) => '`);
  content = content.replace(startPattern, (m) => m.slice(0, -1) + '`');
}

// And the ends
content = content.replace(/';$/gm, '`;');

await fs.writeFile(filePath, content, 'utf8');
