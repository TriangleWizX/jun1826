# SSI Isolation Playbook

Use this when production renders a visible SSI fallback like:

`[an error occurred while processing this directive]`

## Preconditions

- `.htaccess` keeps SSI enabled for `.html`:
  - `Options +IncludesNOEXEC`
  - `SSIErrorMsg ""`
  - `AddOutputFilter INCLUDES .html`

## Fast Audit Commands

```bash
npm run qa:ssi
rg -n '<!--#' -S .
rg -n 'config errmsg|include virtual|include file' -S .
```

## Deterministic Isolation (Homepage)

Run in render order and isolate one include at a time.

1. In `index.html`, temporarily comment out:
   - `<!--#include virtual="/nav-include.html" -->`
2. Reload page. If error disappears, failure is in `nav-include.html` subtree.
3. Restore that include, then comment out:
   - `<!--#include virtual="/partials/nearby-areas-links.html" -->`
4. Reload page. If error disappears, failure is in that fragment.
5. Restore, then comment out:
   - `<!--#include virtual="/footer-include.html" -->`
6. Reload page. If error disappears, failure is in `footer-include.html` subtree.

If no first-level include isolates it, recurse in the failing subtree:

- `nav-include.html` -> `/cta-header.html`
- `footer-include.html` -> `/cta-footer.html`, `/partials/location-and-reviews.html`

Always restore commented includes after each step.

## SSI Rules (Enforced by QA)

- `include virtual` must be local, rooted paths (example: `"/partials/header.html"`).
- Do not use `include virtual="https://..."`.
- Do not use `include file=...`.
- `#config errmsg` is only allowed as empty string (`errmsg=""`) or omitted.

## Optional: Playwright MCP for Browser QA

Use this only when a QA pass needs real browser interaction on live or preview pages.

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest", "--headless"]
default_tools_approval_mode = "prompt"
startup_timeout_sec = 30
tool_timeout_sec = 90
enabled = true
```

Use intent:
- Mobile behavior checks
- Nav interactions
- Layout verification
- Form checks

Safety scope:
- Keep `default_tools_approval_mode = "prompt"` (not `"approve"`) because browser tools can interact with live pages.

When to use:
- When static checks pass but behavior needs runtime validation in a real browser session.

When not to use:
- When the task is limited to static SSI, markup, or grep-based validation that does not require browser execution.
