# Release 5 Automated Checks

The deployment gate is:

```bash
npm run build
npm run validate
```

`npm run validate` runs the existing schedule, static-link, link-existence,
and doctype checks, followed by `validate:release5`.

The Release 5 gate blocks on missing or duplicate page metadata, invalid
landmarks, multiple H1 elements, duplicate IDs, missing internal targets,
forbidden local/staging links, archive leakage, sitemap hostname and URL
policy violations, and credential-like patterns in generated output.

Asset-reference findings are warnings because CSS and JavaScript can build
URLs dynamically; they require human review before deployment.

The checks are read-only and return a nonzero exit code on blocking findings.
They do not clean, rewrite, or delete source or generated files.
