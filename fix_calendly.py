import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace href="https://calendly.com/senseisandy/bjj-goal-mapping-session"
    # with href="/book-free-intro#booking-flow"
    # Wait, inside book-free-intro/index.html, there is:
    # data-calendly-url="https://calendly.com/senseisandy/bjj-goal-mapping-session"
    # We should NOT replace data-calendly-url or the JS fallback. We should only replace href.
    
    new_content = re.sub(
        r'href=["\']https://calendly\.com/senseisandy/bjj-goal-mapping-session["\']',
        'href="/book-free-intro#booking-flow"',
        content
    )

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
