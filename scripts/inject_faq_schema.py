import os
import json
import re

glossary_dir = 'bjj-glossary'
faq_files = []
for term_dir in os.listdir(glossary_dir):
    term_path = os.path.join(glossary_dir, term_dir)
    if os.path.isdir(term_path):
        index_path = os.path.join(term_path, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'FAQPage' not in content:
                faq_files.append(index_path)

for file_path in faq_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the JSON-LD script tag
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, flags=re.DOTALL)
    if not match:
        continue

    json_str = match.group(1)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        print(f"Error decoding JSON in {file_path}")
        continue

    # Extract the term name
    term_name = None
    if '@graph' in data:
        for item in data['@graph']:
            if item.get('@type') == 'DefinedTerm':
                term_name = item.get('name')
                break
    else:
        if data.get('@type') == 'DefinedTerm':
            term_name = data.get('name')

    if not term_name:
        print(f"Could not find term name in {file_path}")
        continue

    term_lower = term_name.lower()
    faq_schema = {
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"What does {term_lower} mean in BJJ?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"{term_name} is a common BJJ term used in class to describe a key position, movement, or concept."
                }
            },
            {
                "@type": "Question",
                "name": f"How should beginners train {term_lower} safely?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"Train {term_lower} with control, follow coach cues, and tap or reset early when needed."
                }
            }
        ]
    }

    if '@graph' in data:
        data['@graph'].append(faq_schema)
    else:
        # Wrap in graph if it isn't already
        data = {
            "@context": "https://schema.org",
            "@graph": [data, faq_schema]
        }
    
    new_json_str = json.dumps(data, separators=(',', ':'))
    new_content = content[:match.start(1)] + new_json_str + content[match.end(1):]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Injected FAQPage schema into {file_path}")
