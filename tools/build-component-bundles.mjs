import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import {
  CSS_BUNDLE_OUTPUT_DIRECTORY,
  CSS_BUNDLE_REGISTRY,
  resolveWorkspacePath,
} from './css-bundle-registry.mjs';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(THIS_FILE), '..');
const SOURCE_PATH = resolveWorkspacePath(CSS_BUNDLE_REGISTRY.sourcePath);
const OUTPUT_DIR = CSS_BUNDLE_OUTPUT_DIRECTORY;
const SOURCE_LABEL = CSS_BUNDLE_REGISTRY.sourcePath;
const BUNDLES = CSS_BUNDLE_REGISTRY.bundles;
const REGISTERED_PAGE_TOKENS = new Set(BUNDLES.flatMap((bundle) => bundle.pageTokens));

const RECURSIVE_AT_RULES = new Set(['media', 'supports', 'container', 'layer']);

const parseArgs = () => {
  const args = new Set(process.argv.slice(2));
  for (const arg of args) {
    if (arg !== '--check') throw new Error(`Unknown argument: ${arg}`);
  }
  return { check: args.has('--check') };
};

const syntaxError = (source, index, message) => {
  const before = source.slice(0, index);
  const line = before.split('\n').length;
  const lastNewline = before.lastIndexOf('\n');
  const column = index - lastNewline;
  return new Error(`${message} at ${line}:${column}.`);
};

const isCssWhitespace = (character) =>
  character === ' ' ||
  character === '\n' ||
  character === '\r' ||
  character === '\t' ||
  character === '\f' ||
  character === '\uFEFF';

const skipComment = (source, start, end) => {
  const close = source.indexOf('*/', start + 2);
  if (close < 0 || close + 2 > end) {
    throw syntaxError(source, start, 'Unclosed CSS comment');
  }
  return close + 2;
};

const skipString = (source, start, end) => {
  const quote = source[start];
  let index = start + 1;

  while (index < end) {
    const character = source[index];
    if (character === quote) return index + 1;
    if (character === '\\') {
      index += source[index + 1] === '\r' && source[index + 2] === '\n' ? 3 : 2;
      continue;
    }
    index += 1;
  }

  throw syntaxError(source, start, 'Unclosed CSS string');
};

const skipTrivia = (source, start, end) => {
  let index = start;
  while (index < end) {
    if (isCssWhitespace(source[index])) {
      index += 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end);
      continue;
    }
    break;
  }
  return index;
};

const scanPrelude = (source, start, end) => {
  let parentheses = 0;
  let brackets = 0;

  for (let index = start; index < end; index += 1) {
    const character = source[index];

    if (character === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end) - 1;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipString(source, index, end) - 1;
      continue;
    }
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === '(') {
      parentheses += 1;
      continue;
    }
    if (character === ')') {
      if (parentheses === 0) throw syntaxError(source, index, 'Unexpected ")"');
      parentheses -= 1;
      continue;
    }
    if (character === '[') {
      brackets += 1;
      continue;
    }
    if (character === ']') {
      if (brackets === 0) throw syntaxError(source, index, 'Unexpected "]"');
      brackets -= 1;
      continue;
    }
    if (parentheses === 0 && brackets === 0 && (character === '{' || character === ';')) {
      return { delimiter: character, index };
    }
    if (parentheses === 0 && brackets === 0 && character === '}') {
      throw syntaxError(source, index, 'Unexpected "}"');
    }
  }

  if (parentheses > 0) throw syntaxError(source, start, 'Unclosed "(" in CSS prelude');
  if (brackets > 0) throw syntaxError(source, start, 'Unclosed "[" in CSS prelude');
  throw syntaxError(source, start, 'CSS rule is missing "{" or ";"');
};

const findMatchingBrace = (source, open, end) => {
  let depth = 1;

  for (let index = open + 1; index < end; index += 1) {
    const character = source[index];

    if (character === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end) - 1;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipString(source, index, end) - 1;
      continue;
    }
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === '{') {
      depth += 1;
      continue;
    }
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw syntaxError(source, open, 'Unclosed "{"');
};

const findMatchingParenthesis = (source, open, end) => {
  let depth = 1;

  for (let index = open + 1; index < end; index += 1) {
    const character = source[index];

    if (character === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end) - 1;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipString(source, index, end) - 1;
      continue;
    }
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === '(') {
      depth += 1;
      continue;
    }
    if (character === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw syntaxError(source, open, 'Unclosed "("');
};

const splitSelectorList = (source, start, end) => {
  const selectors = [];
  let selectorStart = start;
  let parentheses = 0;
  let brackets = 0;

  for (let index = start; index < end; index += 1) {
    const character = source[index];

    if (character === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end) - 1;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipString(source, index, end) - 1;
      continue;
    }
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === '(') {
      parentheses += 1;
      continue;
    }
    if (character === ')') {
      if (parentheses === 0) throw syntaxError(source, index, 'Unexpected ")" in selector');
      parentheses -= 1;
      continue;
    }
    if (character === '[') {
      brackets += 1;
      continue;
    }
    if (character === ']') {
      if (brackets === 0) throw syntaxError(source, index, 'Unexpected "]" in selector');
      brackets -= 1;
      continue;
    }
    if (character === ',' && parentheses === 0 && brackets === 0) {
      selectors.push([selectorStart, index]);
      selectorStart = index + 1;
    }
  }

  if (parentheses > 0) throw syntaxError(source, start, 'Unclosed "(" in selector');
  if (brackets > 0) throw syntaxError(source, start, 'Unclosed "[" in selector');
  selectors.push([selectorStart, end]);
  return selectors;
};

const consumeCssEscape = (source, start, end) => {
  let index = start + 1;
  if (index >= end) return { end: index, value: '' };

  if (source[index] === '\n' || source[index] === '\f') {
    return { end: index + 1, value: '' };
  }
  if (source[index] === '\r') {
    return { end: index + (source[index + 1] === '\n' ? 2 : 1), value: '' };
  }

  let hexadecimal = '';
  while (index < end && hexadecimal.length < 6 && /[0-9a-f]/i.test(source[index])) {
    hexadecimal += source[index];
    index += 1;
  }

  if (hexadecimal) {
    if (isCssWhitespace(source[index])) {
      index += source[index] === '\r' && source[index + 1] === '\n' ? 2 : 1;
    }
    const codePoint = Number.parseInt(hexadecimal, 16);
    const value =
      codePoint === 0 || codePoint > 0x10ffff
        ? '\uFFFD'
        : String.fromCodePoint(codePoint);
    return { end: index, value };
  }

  return { end: index + 1, value: source[index] };
};

const isCssNameCharacter = (character) => {
  if (!character) return false;
  const codePoint = character.codePointAt(0);
  return /[a-z0-9_-]/i.test(character) || codePoint >= 0x80;
};

const readCssIdentifier = (source, start, end) => {
  let index = start;
  let value = '';

  while (index < end) {
    if (source[index] === '\\') {
      const escaped = consumeCssEscape(source, index, end);
      if (escaped.end <= index + 1 || !escaped.value) break;
      value += escaped.value;
      index = escaped.end;
      continue;
    }
    if (!isCssNameCharacter(source[index])) break;
    value += source[index];
    index += 1;
  }

  return { end: index, value };
};

const pageTokensInSelector = (source, start, end, registeredPageTokens) => {
  const tokens = new Set();
  let brackets = 0;

  for (let index = start; index < end; index += 1) {
    const character = source[index];

    if (character === '/' && source[index + 1] === '*') {
      index = skipComment(source, index, end) - 1;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipString(source, index, end) - 1;
      continue;
    }
    if (character === '\\') {
      index = consumeCssEscape(source, index, end).end - 1;
      continue;
    }
    if (character === '[') {
      brackets += 1;
      continue;
    }
    if (character === ']') {
      brackets = Math.max(0, brackets - 1);
      continue;
    }
    if (character === ':' && brackets === 0) {
      const pseudoElement = source[index + 1] === ':';
      const nameStart = index + (pseudoElement ? 2 : 1);
      const identifier = readCssIdentifier(source, nameStart, end);
      if (identifier.value && source[identifier.end] === '(') {
        const close = findMatchingParenthesis(source, identifier.end, end);
        const name = identifier.value.toLowerCase();
        if (!pseudoElement && (name === 'is' || name === 'where')) {
          const alternatives = splitSelectorList(source, identifier.end + 1, close);
          const alternativeTokens = alternatives.map(([alternativeStart, alternativeEnd]) =>
            pageTokensInSelector(source, alternativeStart, alternativeEnd, registeredPageTokens)
          );
          if (alternativeTokens.length && alternativeTokens.every((value) => value.size > 0)) {
            for (const value of alternativeTokens) {
              for (const token of value) tokens.add(token);
            }
          }
        }
        index = close;
        continue;
      }
    }
    if (character === '(' && brackets === 0) {
      index = findMatchingParenthesis(source, index, end);
      continue;
    }
    if (character !== '.' || brackets > 0) continue;

    const identifier = readCssIdentifier(source, index + 1, end);
    const token = identifier.value;
    if (registeredPageTokens.has(token)) tokens.add(token);
    index = Math.max(index, identifier.end - 1);
  }

  return tokens;
};

const atRuleName = (source, start, end) => {
  if (source[start] !== '@') return '';
  return readCssIdentifier(source, start + 1, end).value.toLowerCase();
};

const shouldDropStyleRule = (source, start, open, enabledTokens, registeredPageTokens) => {
  const selectors = splitSelectorList(source, start, open);
  if (!selectors.length) return false;

  let hasEnabledToken = false;
  for (const [selectorStart, selectorEnd] of selectors) {
    if (!source.slice(selectorStart, selectorEnd).trim()) return false;
    const tokens = pageTokensInSelector(
      source,
      selectorStart,
      selectorEnd,
      registeredPageTokens
    );
    if (tokens.size === 0) return false;
    for (const token of tokens) {
      if (enabledTokens.has(token)) hasEnabledToken = true;
    }
  }

  return !hasEnabledToken;
};

const filterRuleList = (source, start, end, enabledTokens, registeredPageTokens) => {
  const output = [];
  let keptNodes = 0;
  let index = start;

  while (index < end) {
    const nodeStart = skipTrivia(source, index, end);
    output.push(source.slice(index, nodeStart));
    index = nodeStart;
    if (index >= end) break;

    const prelude = scanPrelude(source, index, end);
    if (prelude.delimiter === ';') {
      output.push(source.slice(index, prelude.index + 1));
      if (source.slice(index, prelude.index).trim()) keptNodes += 1;
      index = prelude.index + 1;
      continue;
    }

    const close = findMatchingBrace(source, prelude.index, end);
    const name = atRuleName(source, index, prelude.index);

    if (name && RECURSIVE_AT_RULES.has(name)) {
      const child = filterRuleList(
        source,
        prelude.index + 1,
        close,
        enabledTokens,
        registeredPageTokens
      );
      if (child.keptNodes > 0) {
        output.push(source.slice(index, prelude.index + 1), child.css, '}');
        keptNodes += 1;
      }
    } else if (
      name ||
      !shouldDropStyleRule(source, index, prelude.index, enabledTokens, registeredPageTokens)
    ) {
      output.push(source.slice(index, close + 1));
      keptNodes += 1;
    }

    index = close + 1;
  }

  return { css: output.join(''), keptNodes };
};

const filterCss = (source, pageTokens = [], registeredPageTokens = REGISTERED_PAGE_TOKENS) => {
  const enabledTokens = new Set(pageTokens);
  const registeredTokens = new Set(registeredPageTokens);
  return filterRuleList(source, 0, source.length, enabledTokens, registeredTokens).css;
};

const generatedHeader = (bundle) => {
  const tokens = bundle.pageTokens.length
    ? bundle.pageTokens.map((token) => `.${token}`).join(', ')
    : 'none';
  return `/* Generated by tools/build-component-bundles.mjs from ${SOURCE_LABEL}.\n` +
    `   Bundle: ${bundle.name}; enabled page tokens: ${tokens}.\n` +
    '   Do not edit directly. */\n';
};

const buildBundleCss = (source, bundle) =>
  generatedHeader(bundle) + filterCss(source, bundle.pageTokens);

const outputPathFor = (bundle) => resolveWorkspacePath(bundle.canonicalPath);

const byteMetrics = (contents) => ({
  bytes: Buffer.byteLength(contents),
  gzipBytes: gzipSync(Buffer.from(contents), { level: 9 }).byteLength,
});

const savingsText = (sourceBytes, bundleBytes) => {
  const saved = sourceBytes - bundleBytes;
  const percent = sourceBytes === 0 ? 0 : (saved / sourceBytes) * 100;
  return `${saved} B, ${percent.toFixed(1)}%`;
};

const printMetrics = (source, outputs) => {
  const sourceMetrics = byteMetrics(source);
  console.log(`Source: ${sourceMetrics.bytes} B; gzip ${sourceMetrics.gzipBytes} B`);
  for (const { bundle, css } of outputs) {
    const metrics = byteMetrics(css);
    console.log(
      `${bundle.name}: ${metrics.bytes} B (saved ${savingsText(sourceMetrics.bytes, metrics.bytes)}); ` +
      `gzip ${metrics.gzipBytes} B (saved ${savingsText(sourceMetrics.gzipBytes, metrics.gzipBytes)})`
    );
  }
};

const validateBundleConfig = () => {
  if (BUNDLES.length === 0) throw new Error('CSS bundle registry has no bundles.');
};

const checkOutputs = async (outputs) => {
  const stale = [];
  const expectedNames = new Set(
    outputs.flatMap(({ bundle }) => [
      path.basename(outputPathFor(bundle)),
      path.basename(resolveWorkspacePath(bundle.minifiedPath)),
    ])
  );
  for (const { bundle, css } of outputs) {
    const outputPath = outputPathFor(bundle);
    let current;
    try {
      current = await fs.readFile(outputPath, 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      stale.push(`${path.relative(ROOT, outputPath)} (missing)`);
      continue;
    }
    if (current !== css) stale.push(`${path.relative(ROOT, outputPath)} (stale)`);
  }

  let entries = [];
  try {
    entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  for (const entry of entries) {
    if (
      entry.isFile() &&
      // Fingerprinted siblings in this directory belong to the asset
      // fingerprinter and can legitimately reflect the previous build until
      // its final --clean pass. This check owns only canonical/minified files.
      /^components-[a-z0-9-]+(?:\.min)?\.css$/.test(entry.name) &&
      !expectedNames.has(entry.name)
    ) {
      stale.push(`${path.relative(ROOT, path.join(OUTPUT_DIR, entry.name))} (unexpected)`);
    }
  }

  if (stale.length) {
    throw new Error(`Component bundles are not current:\n- ${stale.join('\n- ')}\nRun node tools/build-component-bundles.mjs.`);
  }
};

const writeOutputs = async (outputs) => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all(
    outputs.map(({ bundle, css }) => fs.writeFile(outputPathFor(bundle), css, 'utf8'))
  );
};

const main = async () => {
  const { check } = parseArgs();
  validateBundleConfig();
  const source = await fs.readFile(SOURCE_PATH, 'utf8');
  const outputs = BUNDLES.map((bundle) => ({
    bundle,
    css: buildBundleCss(source, bundle),
  }));

  if (check) {
    await checkOutputs(outputs);
    console.log(`Component bundles are current (${outputs.length} files).`);
  } else {
    await writeOutputs(outputs);
    console.log(`Wrote ${outputs.length} component bundles to assets/css/bundles/.`);
  }
  printMetrics(source, outputs);
};

export { BUNDLES, buildBundleCss, filterCss };

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
