"""Audit Free Intro copy in source and built HTML using local CMU pronunciations.

Run after npm run build. This estimates readability; it does not certify comprehension.
The HTML parser and scoring code use the Python standard library only.
"""
import argparse
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = {
    'free-bjj-intro-tannersville-ny/index.html',
    'free-bjj-intro-tannersville-ny/confirmation/index.html',
    'free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny/index.html',
    'show-up-kit.html',
}
PROSE = {'p', 'li', 'dd', 'label', 'legend', 'summary', 'figcaption', 'blockquote'}
POLICY = re.compile(r'free (?:first|intro|class)|first[- ]visit|goal[- ]mapping|first (?:class|appointment)|normal clothes|no workout', re.I)
STALE = re.compile(r'On the general Free First Visit path, no|Return for the coached first class|Free First Visitductory|First Visit & first visit', re.I)
EXACT_EXCEPTIONS = {
    '\"A welcoming community with no big egos. That\'s rare in any martial art.\" - Adam M.': 'Verbatim third-party review; preserve the quoted words.',
    'Parent or guardian name': 'Short form label naming the responsible adult; guardian is the required legal role.',
    'Kids and Teens Ages 5–17 · Tannersville, NY': 'Age range and location label, not prose.',
    'Class: 45 minutes. Full visit: 60–75 minutes.': 'Duration values, not prose.',
}
OVERRIDES = {'jiu': 1, 'jitsu': 2, 'bjj': 3, 'gi': 1, 'sandy': 2,
             'tannersville': 3, 'coached': 1, 'rashguard': 2, 'no': 1,
             'ny': 2, 'sms': 3, 'faq': 3, 'core': 1, 'windham': 2,
             'prattsville': 2, 'saugerties': 3, 'haines': 1, 'loaner': 2}
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()


def number_words(match):
    n = int(match.group())
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + (' ' + ONES[n % 10] if n % 10 else '')
    # Dates, addresses, phone numbers and prices are not prose assertions.
    return ' '.join(ONES[int(x)] for x in str(n))


def lexicon():
    p = Path('/usr/share/pocketsphinx/model/en-us/cmudict-en-us.dict')
    if not p.exists(): raise SystemExit('Local CMU pronunciation dictionary required: ' + str(p))
    words = {}
    for line in p.read_text().splitlines():
        fields = line.split()
        word = re.sub(r'\(\d+\)$', '', fields[0]).lower()
        count = sum(bool(re.match(r'^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)\d?$', s)) for s in fields[1:])
        words[word] = max(words.get(word, 0), count)
    words.update(OVERRIDES)
    return words


LEX = lexicon()


def score(text):
    text = html.unescape(text).replace('’', "'")
    # A contact number is a value, not a word spoken one digit at a time.
    text = re.sub(r'\+?1?\s*\(917\)\s*736-8649', '', text)
    text = re.sub(r'\b2nd\b', 'second', text)
    text = re.sub(r'\d+', number_words, text)
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text.lower())
    unknown = sorted({w for w in words if w not in LEX})
    # Unknowns are reported explicitly for review, never silently treated as one syllable.
    syllables = sum(LEX.get(w, max(1, len(re.findall(r'[aeiouy]+', w)) - int(w.endswith('e')))) for w in words)
    sentences = max(1, sum(bool(re.search('[A-Za-z]', part)) for part in re.split(r'[.!?]+', text)))
    grade = .39 * len(words) / sentences + 11.8 * syllables / len(words) - 15.59 if words else 0
    return {'words': len(words), 'sentences': sentences, 'syllables': syllables, 'grade': round(grade, 2), 'unknown': unknown}


class Node:
    def __init__(self, tag, attrs=None, parent=None, line=0):
        self.tag, self.attrs, self.parent, self.line = tag, dict(attrs or []), parent, line
        self.children = []

    def text(self):
        return ' '.join(c if isinstance(c, str) else c.text() for c in self.children if isinstance(c, str) or c.tag not in {'script', 'style'})

    def under(self, tag):
        return self.tag == tag or bool(self.parent and self.parent.under(tag))


class Document(HTMLParser):
    VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node('document')
        self.nodes = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current, self.getpos()[0])
        self.current.children.append(n)
        self.nodes.append(n)
        if tag not in self.VOID: self.current = n

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID: self.handle_endtag(tag)

    def handle_endtag(self, tag):
        n = self.current
        while n.parent:
            if n.tag == tag:
                self.current = n.parent
                return
            n = n.parent

    def handle_data(self, data):
        self.current.children.append(data)


def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--report', default='/tmp/free-intro-copy-audit.json')
    args = parser.parse_args()
    rows, candidates, stale, exceptions = [], [], [], []
    def add(file, text, **location):
        text = normalize(text)
        row = {'file': file, **location, 'text': text, **score(text)}
        reason = EXACT_EXCEPTIONS.get(text)
        if re.fullmatch(r'6045 Main Street, 2nd Floor(?: Studio)?, Tannersville, NY 12485', text):
            reason = 'Canonical postal address, not prose.'
        if re.fullmatch(r'12 weeks: \$[\d /$]+', text): reason = 'Price table values, not prose.'
        if reason: exceptions.append(dict(row, reason=reason))
        else: rows.append(row)
    files = sorted((ROOT / 'dist').rglob('*.html'))
    if not files: raise SystemExit('Build the site before this check.')
    for path in files:
        rel = path.relative_to(ROOT / 'dist').as_posix()
        source = path.read_text()
        doc = Document(source)
        for node in doc.nodes:
            if node.under('script') or node.under('style'): continue
            marked = 'data-free-intro-copy' in node.attrs
            prose = node.tag in PROSE or (node.tag in {'div', 'span'} and any(s in node.attrs.get('class', '') for s in ['yi-note','ss-faq-content','showup-meta-value']))
            # Include short direct text in prep checklist spans.
            if node.tag == 'span' and node.parent and 'showup-check-item' in node.parent.attrs.get('class', ''): prose = True
            text = normalize(node.text())
            if not text or '{{' in text or '{%' in text: continue
            if marked or prose:
                if STALE.search(text): stale.append({'file': rel, 'line': node.line, 'text': text})
                result = score(text)
                row = {'file': rel, 'line': node.line, 'text': text, **result}
                core = rel in CORE and node.under('main') and not node.under('nav')
                if marked or (core and result['words'] >= 4): add(rel, text, line=node.line)
                elif prose and POLICY.search(text): candidates.append(row)
        for node in doc.nodes:
            if node.tag == 'meta' and node.attrs.get('name') == 'description' and rel in CORE:
                text = node.attrs.get('content', '')
                add(rel, text, line=node.line)
            if node.tag == 'script' and node.attrs.get('type') == 'application/ld+json':
                raw = ''.join(c for c in node.children if isinstance(c, str))
                try: structured = json.loads(raw)
                except ValueError: continue
                def answers(value):
                    if isinstance(value, list):
                        for item in value: yield from answers(item)
                    if isinstance(value, dict):
                        if value.get('@type') == 'Question':
                            answer = value.get('acceptedAnswer', {}).get('text', '')
                            if POLICY.search(value.get('name', '') + ' ' + answer): yield answer
                        else:
                            for item in value.values(): yield from answers(item)
                for text in answers(structured): add(rel, text, field='JSON-LD answer')

    data = json.loads((ROOT / 'src/_data/free-intro.json').read_text())
    for key, text in data['publicCopy'].items():
        add('src/_data/free-intro.json', text, field='publicCopy.' + key)
    for idx, step in enumerate(data['steps']):
        text = step['description']
        add('src/_data/free-intro.json', text, field=f'steps[{idx}].description')
    def strings(value, path=''):
        if isinstance(value, str): yield path, value
        elif isinstance(value, dict):
            for key, item in value.items(): yield from strings(item, path + '.' + key)
        elif isinstance(value, list):
            for idx, item in enumerate(value): yield from strings(item, path + f'[{idx}]')
    for field, text in strings(json.loads((ROOT / 'src/_data/visit-preparation.json').read_text())):
        if score(text)['words'] >= 4: add('src/_data/visit-preparation.json', text, field=field)
    # Templates are scored with neutral short stand-ins; actual names/dates and
    # staff-entered notes still need review before sending. STOP is an opt-out token.
    templates = json.loads((ROOT / 'config/youth-intro-message-templates.json').read_text())
    for key, template in templates['templates'].items():
        text = re.sub(r'\{\{\w+\}\}', 'the plan', template['body'])
        add('config/youth-intro-message-templates.json', text, field=key)
    for name in ['youth-intro-form.js', 'progressive-booking.js']:
        source = (ROOT / 'js' / name).read_text()
        patterns = [r"(?:textContent\s*=|message\()\s*'([^'\n]+)'", r"'DESCRIPTION:([^'\n]+)'"]
        for pattern in patterns:
            for match in re.finditer(pattern, source):
                if score(match[1])['words'] >= 4: add('js/' + name, match[1], field='UI string')
    unique = {}
    for row in rows:
        unique.setdefault(row['text'], dict(row, occurrences=[]))['occurrences'].append(row['file'])
    failures = [r for r in unique.values() if r['grade'] > 3]
    report = {'method':'Flesch-Kincaid; CMU maximum pronunciation; named overrides; numbers expanded; punctuation defines sentences.',
              'limits':'Estimate only. Short UI labels, addresses, official names and proper nouns require manual review. Candidate inventory requires contextual review; a CTA appended to unrelated editorial prose does not make the entire article an intro policy.',
              'files_scanned':len(files), 'measured_blocks':len(rows), 'unique_blocks':len(unique),
              'failures':failures, 'stale':stale, 'results':list(unique.values()), 'candidates':candidates, 'exceptions':exceptions,
              'overrides':OVERRIDES}
    Path(args.report).write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(f'Scanned {len(files)} HTML files; measured {len(rows)} blocks ({len(unique)} unique); {len(failures)} above grade 3; {len(stale)} stale policy blocks.')
    for r in failures: print(f'{r["grade"]}: {r["file"]}:{r.get("line", r.get("field"))} {r["text"]}')
    raise SystemExit(bool(failures or stale))


if __name__ == '__main__': main()
