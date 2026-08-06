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
  
  // Replace object returns containing error: with throws, attaching other properties to the error
  // We need to be careful with template literals and quotes.
  content = content.replace(/return\s*\{\s*([^}]*?),\s*error:\s*([^}\n]+)\s*\};/gs, (match, p1, p2) => {
    return `const err = new Error(${p2});
        Object.assign(err, {
          ${p1.trim()}
        });
        throw err;`;
  });
  
  // Update try-catch blocks that were expecting result.error to now expect the error object
  content = content.replace(/catch\s*\(\s*error\s*\)\s*\{([^}]*?)failures\s*\+=\s*1;/gs, (match, p1) => {
    return `catch (error) {
      result = error;
      ${p1.trim()}
      if (!result.error) result.error = error.message;
      failures += 1;`;
  });

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
