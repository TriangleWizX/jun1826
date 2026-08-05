import os
import json
import re

def verify_schema(filepath):
    print(f"Verifying schema in {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    schema_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    
    if not schema_matches:
        print(f"  Warning: No schema found in {filepath}")
        return

    def extract_types(data):
        types = set()
        if isinstance(data, dict):
            if '@type' in data:
                types.add(data['@type'])
            for v in data.values():
                types.update(extract_types(v))
        elif isinstance(data, list):
            for item in data:
                types.update(extract_types(item))
        return types

    for idx, schema_str in enumerate(schema_matches):
        try:
            parsed = json.loads(schema_str.strip())
            types = extract_types(parsed)
            print(f"  [OK] Schema {idx+1} valid JSON. Types found: {', '.join(types) if types else 'None'}")
        except json.JSONDecodeError as e:
            print(f"  [ERROR] Schema {idx+1} invalid JSON: {e}")

files_to_check = [
    'near/windham-ny/index.html',
    'near/cairo-ny/index.html',
    'bjj-glossary/guard/index.html',
    'bjj-glossary/americana-lock/index.html',
    'law-enforcement-bjj.html',
    'show-up-kit.html'
]

for file in files_to_check:
    if os.path.exists(file):
        verify_schema(file)
    else:
        print(f"File not found: {file}")
