# Sensei Sandy live copy correction

## Required wording

- `class` → `small-group class`
- `classes` → `small-group classes`
- `small class` → `small-group class`
- `small classes` → `small-group classes`
- `group class` → `small-group class`
- `group classes` → `small-group classes`

The patcher changes rendered text and accessibility-facing attributes only. It does not alter HTML `class=""` attributes, JavaScript, CSS, code samples, or the hyphenated adjective `first-class`.

## Run

```bash
python -m pip install beautifulsoup4
python fix_semiprivate_copy.py /path/to/current/public_html
```

The first command is a dry run and writes `semi_private_copy_changes.csv`.

After reviewing the report:

```bash
python fix_semiprivate_copy.py /path/to/current/public_html --write
```

Each edited page receives a one-time `.bak` backup.

## Deployment boundary

Run this against the current deployed-site folder or a fresh download of `public_html`. Do not run it against an older backup repository. The audit CSV lists the live URLs where the requested wording was found.

## Review note

Some affected text appears inside attributed customer testimonials. Changing quoted wording makes it a paraphrase. Remove quotation marks or obtain reviewer approval if exact quotation integrity matters.
