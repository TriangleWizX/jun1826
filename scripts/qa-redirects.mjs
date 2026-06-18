import { loadJson, normalizePath, normalizeUrlForCompare } from './url-qa-lib.mjs';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    baseUrl: '',
    maxHops: 1,
    timeoutMs: 12000
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--base-url') {
      out.baseUrl = args[i + 1] || out.baseUrl;
      i += 1;
      continue;
    }
    if (arg === '--max-hops') {
      out.maxHops = Number.parseInt(args[i + 1] || String(out.maxHops), 10);
      i += 1;
      continue;
    }
    if (arg === '--timeout-ms') {
      out.timeoutMs = Number.parseInt(args[i + 1] || String(out.timeoutMs), 10);
      i += 1;
    }
  }

  return out;
};

const isRedirectStatus = (status) => [301, 302, 303, 307, 308].includes(status);

const fetchNoFollow = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: 'manual',
      method: 'GET',
      signal: controller.signal,
      headers: {
        'user-agent': 'senseisandy-qa-redirects/1.0'
      }
    });
  } finally {
    clearTimeout(timeout);
  }
};

const followRedirects = async ({ startUrl, maxHops, timeoutMs }) => {
  let current = startUrl;
  let hops = 0;
  const chain = [];
  const seen = new Set([startUrl]);

  while (true) {
    const response = await fetchNoFollow(current, timeoutMs);
    const status = response.status;
    const locationHeader = response.headers.get('location') || '';

    chain.push({ url: current, status, location: locationHeader });

    if (!isRedirectStatus(status)) {
      return {
        hops,
        finalUrl: current,
        finalStatus: status,
        chain
      };
    }

    hops += 1;
    if (hops > maxHops) {
      return {
        hops,
        finalUrl: current,
        finalStatus: status,
        chain,
        error: `redirect hop limit exceeded (max ${maxHops})`
      };
    }

    if (!locationHeader) {
      return {
        hops,
        finalUrl: current,
        finalStatus: status,
        chain,
        error: 'redirect missing Location header'
      };
    }

    let next;
    try {
      next = new URL(locationHeader, current).toString();
    } catch {
      return {
        hops,
        finalUrl: current,
        finalStatus: status,
        chain,
        error: `invalid redirect location: ${locationHeader}`
      };
    }

    if (seen.has(next)) {
      return {
        hops,
        finalUrl: next,
        finalStatus: status,
        chain,
        error: 'redirect loop detected'
      };
    }

    seen.add(next);
    current = next;
  }
};

const expectedPathToUrl = (base, targetPath) => {
  const path = normalizePath(targetPath);
  return new URL(path, `${base.replace(/\/$/, '')}/`).toString();
};

const checkLegacyRedirect = async ({ sourcePath, targetPath, baseUrl, maxHops, timeoutMs }) => {
  const sourceUrl = expectedPathToUrl(baseUrl, sourcePath);
  const expectedFinalPath = normalizePath(targetPath);

  const outcome = await followRedirects({ startUrl: sourceUrl, maxHops, timeoutMs });
  const first = outcome.chain[0];

  const issues = [];
  if (!first || !isRedirectStatus(first.status)) {
    issues.push(`expected redirect, got status ${first ? first.status : 'unknown'}`);
  }

  if (outcome.error) issues.push(outcome.error);

  let finalPath = '';
  try {
    finalPath = normalizePath(new URL(outcome.finalUrl).pathname);
  } catch {
    // handled below via final status checks
  }

  if (outcome.finalStatus !== 200) {
    issues.push(`final status ${outcome.finalStatus} (expected 200)`);
  }

  if (finalPath && finalPath !== expectedFinalPath) {
    issues.push(`final path ${finalPath} (expected ${expectedFinalPath})`);
  }

  return {
    sourcePath,
    sourceUrl,
    expectedFinalPath,
    outcome,
    issues
  };
};

const checkCanonicalization = async ({ startUrl, expectedFinalUrl, maxHops, timeoutMs }) => {
  const outcome = await followRedirects({ startUrl, maxHops, timeoutMs });
  const issues = [];

  if (outcome.error) issues.push(outcome.error);
  if (outcome.finalStatus !== 200) {
    issues.push(`final status ${outcome.finalStatus} (expected 200)`);
  }

  const finalComparable = normalizeUrlForCompare(outcome.finalUrl);
  const expectedComparable = normalizeUrlForCompare(expectedFinalUrl);
  if (finalComparable !== expectedComparable) {
    issues.push(`final URL ${finalComparable} (expected ${expectedComparable})`);
  }

  return {
    startUrl,
    expectedFinalUrl,
    outcome,
    issues
  };
};

const validateRedirectMap = (redirects) => {
  const issues = [];
  const keys = new Set(Object.keys(redirects));

  for (const sourcePath of keys) {
    let current = sourcePath;
    const seen = new Set([sourcePath]);

    while (keys.has(current)) {
      const next = redirects[current];
      if (!next) break;

      if (seen.has(next)) {
        issues.push(`redirect loop in config: ${sourcePath} -> ... -> ${next}`);
        break;
      }

      if (keys.has(next)) {
        issues.push(`redirect chain in config: ${sourcePath} -> ${next} -> ${redirects[next]}`);
      }

      seen.add(next);
      current = next;
    }
  }

  return [...new Set(issues)];
};

const main = async () => {
  const args = parseArgs();
  const [contract, legacy] = await Promise.all([
    loadJson('config/url-contract.json'),
    loadJson('config/legacy-redirects.json')
  ]);

  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const canonicalHost = String(contract.canonicalHost || '').trim();
  const baseUrl = (args.baseUrl || canonicalOrigin).replace(/\/$/, '');

  if (!canonicalOrigin || !canonicalHost) {
    throw new Error('config/url-contract.json must include canonicalOrigin and canonicalHost.');
  }

  const redirects = legacy && typeof legacy.redirects === 'object' ? legacy.redirects : {};
  const redirectEntries = Object.entries(redirects).sort((a, b) => a[0].localeCompare(b[0]));

  const failures = [];
  const mapIssues = validateRedirectMap(redirects);
  mapIssues.forEach((issue) => failures.push(`FAIL redirect-map: ${issue}`));

  for (const [sourcePath, targetPath] of redirectEntries) {
    const result = await checkLegacyRedirect({
      sourcePath,
      targetPath,
      baseUrl,
      maxHops: args.maxHops,
      timeoutMs: args.timeoutMs
    });

    if (result.issues.length) {
      failures.push(`FAIL ${result.sourcePath} -> ${result.expectedFinalPath}: ${result.issues.join('; ')}`);
      continue;
    }

    console.log(`PASS ${result.sourcePath} -> ${result.expectedFinalPath} (${result.outcome.hops} hop)`);
  }

  const canonicalWwwHost = canonicalHost.startsWith('www.') ? canonicalHost : `www.${canonicalHost}`;
  const canonicalChecks = [
    {
      startUrl: `http://${canonicalHost}/`,
      expectedFinalUrl: `${canonicalOrigin}/`
    },
    {
      startUrl: `https://${canonicalWwwHost}/`,
      expectedFinalUrl: `${canonicalOrigin}/`
    },
    {
      startUrl: `http://${canonicalWwwHost}/`,
      expectedFinalUrl: `${canonicalOrigin}/`
    }
  ];

  for (const check of canonicalChecks) {
    const result = await checkCanonicalization({
      ...check,
      maxHops: args.maxHops,
      timeoutMs: args.timeoutMs
    });

    if (result.issues.length) {
      failures.push(`FAIL ${check.startUrl}: ${result.issues.join('; ')}`);
      continue;
    }

    console.log(`PASS ${check.startUrl} -> ${check.expectedFinalUrl} (${result.outcome.hops} hop)`);
  }

  if (failures.length) {
    console.error(`qa-redirects failed with ${failures.length} issue(s):`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`qa-redirects passed (${redirectEntries.length} legacy redirects + canonicalization checks).`);
};

main().catch((error) => {
  console.error(`qa-redirects failed: ${error.message}`);
  process.exit(1);
});
