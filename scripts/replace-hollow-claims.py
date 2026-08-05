import os
import re
from bs4 import BeautifulSoup, NavigableString

# Translation Matrix
matrix = {
    r'\bConfidence\b': 'Volunteers to try unfamiliar tasks without hesitation',
    r'\bFocus\b': 'Consistently follows multi-step coaching instructions',
    r'\bResilience\b': 'Immediately resets and tries again after losing a position',
    r'\bFitness\b': 'Participates longer on the mat with steady, controlled pacing',
    r'\bProblem-Solving\b': 'Recognizes a physical trap and dynamically changes strategy',
    r'\bCalm Under Pressure\b': 'Pauses, protects the centerline, and calculates the next action',
    r'\bSocial Development\b': 'Communicates clearly and safely with training partners',
    r'\bAccountability\b': 'Maintains a repeatable, unwavering weekly training routine',
    r'\bconfidence\b': 'volunteers to try unfamiliar tasks without hesitation',
    r'\bfocus\b': 'consistently follows multi-step coaching instructions',
    r'\bresilience\b': 'immediately resets and tries again after losing a position',
    r'\bfitness\b': 'participates longer on the mat with steady, controlled pacing',
    r'\bproblem-solving\b': 'recognizes a physical trap and dynamically changes strategy',
    r'\bcalm under pressure\b': 'pauses, protects the centerline, and calculates the next action',
    r'\bsocial development\b': 'communicates clearly and safely with training partners',
    r'\baccountability\b': 'maintains a repeatable, unwavering weekly training routine',
    r'\bdiscipline\b': 'follows a multi-step coaching instruction during complex drills',
    r'\bDiscipline\b': 'Follows a multi-step coaching instruction during complex drills',
    r'\bself-defense\b': 'the ability to pause, protect, and choose the next action under pressure',
    r'\bSelf-Defense\b': 'The ability to pause, protect, and choose the next action under pressure',
    r'\bSelf-defense\b': 'The ability to pause, protect, and choose the next action under pressure'
}

def replace_in_text(text):
    for pattern, replacement in matrix.items():
        text = re.sub(pattern, replacement, text)
    return text

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace only in text nodes, not in tags, classes, or URLs
    soup = BeautifulSoup(content, 'html.parser')
    changed = False
    
    for element in soup.find_all(['h1', 'h2', 'h3', 'p', 'span', 'li', 'strong', 'em', 'title']):
        for child in element.children:
            if isinstance(child, NavigableString):
                # Don't process script or style tags
                if element.name in ['script', 'style']:
                    continue
                original_text = str(child)
                new_text = replace_in_text(original_text)
                if new_text != original_text:
                    child.replace_with(new_text)
                    changed = True
                    
    # Also process meta descriptions and og:description
    for meta in soup.find_all('meta', attrs={'name': ['description', 'twitter:description']}):
        if meta.get('content'):
            new_content = replace_in_text(meta['content'])
            if new_content != meta['content']:
                meta['content'] = new_content
                changed = True

    for meta in soup.find_all('meta', attrs={'property': ['og:description', 'og:title']}):
        if meta.get('content'):
            new_content = replace_in_text(meta['content'])
            if new_content != meta['content']:
                meta['content'] = new_content
                changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Updated {filepath}")

if __name__ == '__main__':
    for root, dirs, files in os.walk('.'):
        # Exclude node_modules, .git, etc.
        if '.git' in root or 'node_modules' in root or '.venv' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                process_html_file(os.path.join(root, file))
