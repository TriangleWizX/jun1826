import os
import re

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <img ...> or <iframe ...>
    # We use a function to determine if we should replace it.
    def replace_tag(match):
        tag = match.group(0)
        # If it already has a loading attribute, skip it
        if re.search(r'\bloading\s*=\s*["\'][^"\']*["\']', tag):
            return tag
        
        # If it's a hero image (has class hero, or inside something that might imply hero, though it's hard to tell)
        # Let's just add loading="lazy" before the closing bracket
        # Wait, if it has 'data-hero' or something we could skip, but let's just add it.
        # Actually, if it's the hero image, it's usually the first image. But a script is too dumb to know.
        # So we'll just check if it contains class=".*hero.*"
        if re.search(r'class\s*=\s*["\'][^"\']*hero[^"\']*["\']', tag, re.IGNORECASE):
            return tag

        # Inject loading="lazy"
        # We find the end of the tag opening (either > or />)
        if tag.endswith('/>'):
            new_tag = tag[:-2] + ' loading="lazy" />'
        else:
            new_tag = tag[:-1] + ' loading="lazy">'
        return new_tag

    # Replace <img ... >
    new_content = re.sub(r'<img\b[^>]*>', replace_tag, content, flags=re.IGNORECASE)
    # Replace <iframe ... >
    new_content = re.sub(r'<iframe\b[^>]*>', replace_tag, new_content, flags=re.IGNORECASE)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    # skip certain directories
    if any(d in root for d in ['.git', 'node_modules', 'scripts', '.gemini']):
        continue
    for file in files:
        if file.endswith('.html'):
            process_html_file(os.path.join(root, file))
