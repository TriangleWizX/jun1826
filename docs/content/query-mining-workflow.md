# Conversational Query Mining Workflow

## Monthly Input Sources
- Google Search Console queries (page + query pairing)
- Google Business Profile Q&A and recent reviews
- Customer text and email questions
- Paid search terms (if ads are active)
- Internal site search terms (if available)

## Update Rules
- Keep answers plain-language, 2-4 sentences.
- Add or revise only visible HTML copy.
- If an FAQ question changes, update matching FAQPage JSON-LD in the same PR.
- Prioritize pages in this order: `/`, `/schedule`, `/kids`, `/teens`, `/private-lessons`, then `/near/*`.

## Data Contract
Store updates in `data/conversational-query-log.json` using:
- `question`
- `answer`
- `page_target`
- `status` (`queued`, `drafted`, `published`)
- `date_added` (YYYY-MM-DD)

## QA Before Publish
- `npm run qa:links:static`
- `npm run qa:schema`
- `npm run qa:seo`
