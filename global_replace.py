import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Case-insensitive replacements
    new_content = re.sub(r'(?i)semester', '12-Week Core Culture Program', content)
    new_content = re.sub(r'(?i)program agreement', '12-Week Core Culture Program', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    html_files = glob.glob('**/*.html', recursive=True)
    for f in html_files:
        if 'tmp/' in f or 'archive/' in f or 'node_modules/' in f:
            continue
        process_file(f)
