import os
import re

html_files = []
for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

# Replaces instances of "Book Free Intro", "Reserve Free Intro (No Pressure)", "Reserve Free Intro", "Book Your 15-Min Intro", "Start Training", "Book First Class"
# with "Book Free Goal Mapping"

patterns_to_replace = [
    r'Book Free Intro',
    r'Reserve Free Intro \(No Pressure\)',
    r'Reserve Free Intro',
    r'Book Your 15-Min Intro',
    r'Start Training',
    r'Book First Class',
    r'Book Adults Free Intro',
    r'Book Kids Free Intro',
    r'Book Teens Free Intro'
]

# We need to be careful with "Reserve Free Intro (No Pressure)" since it might be split across lines or inside tags.
def replace_ctas():
    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Replace occurrences inside data-cta-label
        content = re.sub(r'data-cta-label="[^"]*(?:Free Intro|Start Training|First Class)[^"]*"', 'data-cta-label="Book Free Goal Mapping"', content, flags=re.IGNORECASE)
        
        # Replace occurrences inside tags >...<
        def tag_replacer(match):
            text = match.group(1)
            # if it matches any pattern
            for p in patterns_to_replace:
                if re.search(p, text, re.IGNORECASE):
                    # Replace it
                    text = re.sub(p, 'Book Free Goal Mapping', text, flags=re.IGNORECASE)
            # Remove any trailing parenthetical like (No Pressure) if it got missed
            text = re.sub(r'\s*\(\s*No Pressure\s*\)', '', text, flags=re.IGNORECASE)
            text = re.sub(r'\s*\(\s*Reserved Spot\s*\)', '', text, flags=re.IGNORECASE)
            
            return f">{text}<"
        
        content = re.sub(r'>([^<]+)<', tag_replacer, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

replace_ctas()
