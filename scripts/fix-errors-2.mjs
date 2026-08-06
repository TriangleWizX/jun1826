import fs from 'fs';

const files = [
  'qa-blog-slash-live.mjs',
  'qa-redirects.mjs',
  'qa-links-live.mjs',
  'qa-links-static.mjs',
  'qa-links-existence.mjs',
  'qa-css-links-static.mjs'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace object returns containing error: with throws
  content = content.replace(/return\s*\{\s*([^}]*?),\s*error:\s*([^}\n]+)\s*\};/gs, (match, p1, p2) => {
    return `throw Object.assign(new Error(${p2 === 'error.message' ? 'error.message' : p2}), {\n        ${p1.trim()}\n      });`;
  });

  // Adjust catch block to handle the thrown error properties
  content = content.replace(/catch\s*\(\s*error\s*\)\s*\{([^}]*?)failures\s*\+=\s*1;/gs, (match, p1) => {
    return `catch (error) {
      const result = error;
      ${p1.trim()}
      failures += 1;`;
  });
  
  // Also fix if result is declared earlier, let's just use `error` directly or map it.
  // Actually, we shouldn't change the catch block if it's already using `error.message`.
  // Wait, in `main`, we have `let result; try { result = await ... } catch (error) { ... }`
  // Let's just change `catch (error) {` to `catch (error) { result = error; if (!result.error) result.error = error.message;`
  // But wait, if `result` is const or let outside, `result = error` works.
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
