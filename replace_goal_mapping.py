import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Case-insensitive replacement
    new_content = re.sub(r'(?i)Book Your Goal Mapping Session', 'Reserve Free Intro', content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    for ext in ['html', 'md', 'json', 'txt', 'js', 'css']:
        files = glob.glob(f'**/*.{ext}', recursive=True)
        for f in files:
            if any(ignore in f for ignore in ['tmp/', 'archive/', 'node_modules/', '.git/']):
                continue
            process_file(f)
