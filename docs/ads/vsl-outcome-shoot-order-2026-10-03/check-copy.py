"""Check the saved student copy using a local pronunciation dictionary.

This is a readability estimate, not a comprehension or audience test.
Run: python3 docs/ads/vsl-outcome-shoot-order-2026-10-03/check-copy.py
"""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
DICTIONARY = Path('/usr/share/pocketsphinx/model/en-us/cmudict-en-us.dict')
VOWELS = set('AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW'.split())
lexicon = {}
for line in DICTIONARY.read_text().splitlines():
    fields = line.split()
    word = re.sub(r'\(\d+\)$', '', fields[0]).lower()
    count = sum(re.sub(r'\d', '', sound) in VOWELS for sound in fields[1:])
    lexicon[word] = max(lexicon.get(word, 0), count)
OVERRIDES = {'jiu': 1, 'jitsu': 2, 'tannersville': 3, 'mountaintop': 3,
             'sandy': 2, 'bjj': 3, 'coached': 1, "i'll": 1, "you'll": 1, 'fifteen': 2}
lexicon.update(OVERRIDES)


def estimate(text):
    normalized = text.replace('1', 'one').replace('3', 'three')
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", normalized)
    unknown = sorted({w.lower() for w in words if w.lower() not in lexicon})
    if unknown:
        raise ValueError('Review pronunciation for: ' + ', '.join(unknown))
    sentences = sum(bool(re.search('[A-Za-z]', s)) for s in re.split(r'[.!?]+', normalized))
    syllables = sum(lexicon[w.lower()] for w in words)
    return {'words': len(words), 'sentences': sentences, 'syllables': syllables,
            'fk_grade': round(.39 * len(words) / sentences + 11.8 * syllables / len(words) - 15.59, 2)}


copy = json.loads((BASE / 'copy.json').read_text())
results = {block['id']: estimate(block['spoken']) for block in copy['blocks']}
results['master'] = estimate(' '.join(block['spoken'] for block in copy['blocks']))
results.update({key: estimate(value) for key, value in copy['supporting_copy'].items()})
prohibited = re.compile(r"\b(?:zero|without|no|stop|don't|won't|never)\b", re.I)
for block in copy['blocks']:
    assert not prohibited.search(block['spoken']), block['id']
for key, value in copy['supporting_copy'].items():
    assert not prohibited.search(value), key
assert all(item['fk_grade'] <= 3 for item in results.values()), results
report = {'method': 'Flesch-Kincaid estimate; CMU pronunciations, maximum syllables for alternate pronunciations; explicit overrides; numbers 1 and 3 expanded; hyphenated words split; punctuation defines sentences.',
          'dictionary': str(DICTIONARY), 'overrides': OVERRIDES,
          'limits': 'Not certified comprehension. Names included. Short overlay labels checked manually. Message placeholders must be replaced and rechecked before use. Negative grades reflect formula behavior on short simple prose.',
          'results': results, 'all_prose_at_or_below_grade_3': True}
(BASE / 'readability.json').write_text(json.dumps(report, indent=2) + '\n')
for name, row in results.items():
    print(f"{name}: {row['words']} words; grade estimate {row['fk_grade']}")
