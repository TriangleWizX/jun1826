# Evidence thresholds

These are comparison guardrails, not promises of a passing score:

- Require at least three identical Lighthouse samples and report the median.
- Fail comparison if any route has a missing sample, invalid/error Lighthouse report, or missing screenshot/check output.
- Flag any regression in LCP, FCP, TBT, CLS, TTFB, transferred bytes, request count, or resource bytes; do not hide it behind a score improvement.
- Treat field, PSI, WebPageTest, and CrUX results as external evidence with their test date and URL, never as substitutes for controlled local evidence.
