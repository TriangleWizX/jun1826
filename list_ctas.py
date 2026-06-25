import os
import re
from collections import Counter

html_files = []
for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

ctas = Counter()
for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            # Match data-cta-label="..." or similar, or standard Free Intro phrases
            matches = re.findall(r'Book [^<]*Free Intro|Reserve Free Intro[^\"]*|Claim Free Intro', content, re.IGNORECASE)
            for match in matches:
                ctas[match] += 1
            # Also text inside tags like <span>Book Free Intro</span>
            matches2 = re.findall(r'>([^<]*Free Intro[^<]*)<', content, re.IGNORECASE)
            for match in matches2:
                ctas[match.strip()] += 1
    except Exception as e:
        pass

for cta, count in ctas.most_common():
    print(f"{count}: {cta}")
