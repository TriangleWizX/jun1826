import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(THIS_FILE), '..');
const REGISTRY_PATH = path.join(ROOT, 'config/css-bundle-registry.json');
const EXPECTED_SOURCE_PATH = 'assets/css/components.css';
const EXPECTED_OUTPUT_DIRECTORY = 'assets/css/bundles';
const EXPECTED_OUTPUT_PATH = path.join(ROOT, ...EXPECTED_OUTPUT_DIRECTORY.split('/'));
const BUNDLE_KEYS = new Set([
  'name',
  'pageTokens',
  'canonicalPath',
  'minifiedPath',
  'manifestKey',
]);

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
};

const assertWorkspaceRelativePath = (value, label) => {
  if (typeof value !== 'string' || !value || value.includes('\\')) {
    throw new Error(`${label} must be a non-empty workspace-relative POSIX path.`);
  }
  if (
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value === '..' ||
    value.startsWith('../')
  ) {
    throw new Error(`${label} must be a normalized workspace-relative path: ${value}`);
  }
  return value;
};

const assertBundleOutputPath = (value, label) => {
  const relativePath = assertWorkspaceRelativePath(value, label);
  const absolutePath = path.resolve(ROOT, ...relativePath.split('/'));
  const relativeToOutput = path.relative(EXPECTED_OUTPUT_PATH, absolutePath);
  if (
    !relativeToOutput ||
    path.isAbsolute(relativeToOutput) ||
    relativeToOutput === '..' ||
    relativeToOutput.startsWith(`..${path.sep}`) ||
    path.dirname(absolutePath) !== EXPECTED_OUTPUT_PATH
  ) {
    throw new Error(`${label} must be a file directly inside ${EXPECTED_OUTPUT_DIRECTORY}: ${value}`);
  }
  return relativePath;
};

const validateCssBundleRegistry = (registry, sourceLabel = 'CSS bundle registry') => {
  if (!isPlainObject(registry)) throw new Error(`${sourceLabel} must be a JSON object.`);
  if (registry.version !== 1) throw new Error(`${sourceLabel} version must be 1.`);

  assertWorkspaceRelativePath(registry.sourcePath, `${sourceLabel} sourcePath`);
  if (registry.sourcePath !== EXPECTED_SOURCE_PATH) {
    throw new Error(`${sourceLabel} sourcePath must be ${EXPECTED_SOURCE_PATH}: ${registry.sourcePath}`);
  }
  assertWorkspaceRelativePath(registry.outputDirectory, `${sourceLabel} outputDirectory`);
  if (registry.outputDirectory !== EXPECTED_OUTPUT_DIRECTORY) {
    throw new Error(
      `${sourceLabel} outputDirectory must be ${EXPECTED_OUTPUT_DIRECTORY}: ${registry.outputDirectory}`
    );
  }
  if (!Array.isArray(registry.bundles) || registry.bundles.length === 0) {
    throw new Error(`${sourceLabel} bundles must be a non-empty array.`);
  }

  const names = new Set();
  const canonicalPaths = new Set();
  const minifiedPaths = new Set();
  const manifestKeys = new Set();

  for (const [index, bundle] of registry.bundles.entries()) {
    const label = `${sourceLabel} bundles[${index}]`;
    if (!isPlainObject(bundle)) throw new Error(`${label} must be an object.`);
    const unknownKeys = Object.keys(bundle).filter((key) => !BUNDLE_KEYS.has(key));
    if (unknownKeys.length) throw new Error(`${label} has unknown keys: ${unknownKeys.join(', ')}`);

    if (typeof bundle.name !== 'string' || !/^[a-z0-9-]+$/.test(bundle.name)) {
      throw new Error(`${label} has an invalid name: ${bundle.name}`);
    }
    if (names.has(bundle.name)) throw new Error(`${label} has duplicate name: ${bundle.name}`);
    names.add(bundle.name);

    if (!Array.isArray(bundle.pageTokens)) throw new Error(`${label} pageTokens must be an array.`);
    const tokens = new Set();
    for (const token of bundle.pageTokens) {
      if (typeof token !== 'string' || !/^(?:ss-)?page-[a-z0-9_-]+$/i.test(token)) {
        throw new Error(`${label} has an invalid page token: ${token}`);
      }
      if (tokens.has(token)) throw new Error(`${label} has duplicate page token: ${token}`);
      tokens.add(token);
    }

    assertBundleOutputPath(bundle.canonicalPath, `${label} canonicalPath`);
    assertBundleOutputPath(bundle.minifiedPath, `${label} minifiedPath`);
    const expectedCanonicalPath = `${registry.outputDirectory}/components-${bundle.name}.css`;
    const expectedMinifiedPath = `${registry.outputDirectory}/components-${bundle.name}.min.css`;
    if (bundle.canonicalPath !== expectedCanonicalPath) {
      throw new Error(`${label} canonicalPath must be ${expectedCanonicalPath}: ${bundle.canonicalPath}`);
    }
    if (bundle.minifiedPath !== expectedMinifiedPath) {
      throw new Error(`${label} minifiedPath must be ${expectedMinifiedPath}: ${bundle.minifiedPath}`);
    }
    if (canonicalPaths.has(bundle.canonicalPath)) {
      throw new Error(`${label} has duplicate canonicalPath: ${bundle.canonicalPath}`);
    }
    if (minifiedPaths.has(bundle.minifiedPath)) {
      throw new Error(`${label} has duplicate minifiedPath: ${bundle.minifiedPath}`);
    }
    if (canonicalPaths.has(bundle.minifiedPath) || minifiedPaths.has(bundle.canonicalPath)) {
      throw new Error(`${label} reuses a canonical/minified output path.`);
    }
    canonicalPaths.add(bundle.canonicalPath);
    minifiedPaths.add(bundle.minifiedPath);

    const expectedManifestKey = `/${bundle.minifiedPath}`;
    if (bundle.manifestKey !== expectedManifestKey) {
      throw new Error(`${label} manifestKey must be ${expectedManifestKey}: ${bundle.manifestKey}`);
    }
    if (manifestKeys.has(bundle.manifestKey)) {
      throw new Error(`${label} has duplicate manifestKey: ${bundle.manifestKey}`);
    }
    manifestKeys.add(bundle.manifestKey);
  }

  return deepFreeze(registry);
};

const loadCssBundleRegistry = async () => {
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to load ${path.relative(ROOT, REGISTRY_PATH)}: ${error.message}`, {
      cause: error,
    });
  }
  return validateCssBundleRegistry(parsed, path.relative(ROOT, REGISTRY_PATH));
};

const resolveWorkspacePath = (relativePath) =>
  path.resolve(ROOT, ...assertWorkspaceRelativePath(relativePath, 'Workspace path').split('/'));

const CSS_BUNDLE_REGISTRY = await loadCssBundleRegistry();
const CSS_BUNDLE_OUTPUT_DIRECTORY = resolveWorkspacePath(CSS_BUNDLE_REGISTRY.outputDirectory);

export {
  CSS_BUNDLE_OUTPUT_DIRECTORY,
  CSS_BUNDLE_REGISTRY,
  REGISTRY_PATH,
  ROOT,
  loadCssBundleRegistry,
  resolveWorkspacePath,
  validateCssBundleRegistry,
};
