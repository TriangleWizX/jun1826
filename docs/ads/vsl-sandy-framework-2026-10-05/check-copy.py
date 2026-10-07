"""Check the Sandy Jose Nunez VSL copy using CMU pronunciation dictionary and Flesch-Kincaid formula.

Validates:
1. Spoken prose, overlays, and supporting copy are at or below Grade 3.0.
2. Zero prohibited negative tokens (zero, without, no, stop, don't, won't, never).
3. All words exist in CMUDict or explicitly approved pronunciation overrides.

Run:
  python3 docs/ads/vsl-sandy-framework-2026-10-05/check-copy.py
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

OVERRIDES = {
    'jiu': 1,
    'jitsu': 2,
    'tannersville': 3,
    'mountaintop': 3,
    'sandy': 2,
    'bjj': 3,
    'coached': 1,
    "i'll": 1,
    "you'll": 1,
    'fifteen': 2,
    'clockwork': 2,
    'catskills': 2,
    'leverage': 2
}
lexicon.update(OVERRIDES)


def estimate(text):
    normalized = text.replace('1', 'one').replace('3', 'three')
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", normalized)
    unknown = sorted({w.lower() for w in words if w.lower() not in lexicon})
    if unknown:
        raise ValueError('Review pronunciation for: ' + ', '.join(unknown))
    sentences = sum(bool(re.search('[A-Za-z]', s)) for s in re.split(r'[.!?]+', normalized))
    syllables = sum(lexicon[w.lower()] for w in words)
    fk_grade = round(.39 * len(words) / sentences + 11.8 * syllables / len(words) - 15.59, 2)
    return {
        'words': len(words),
        'sentences': sentences,
        'syllables': syllables,
        'fk_grade': fk_grade
    }


def main():
    copy = json.loads((BASE / 'copy.json').read_text())
    results = {block['id']: estimate(block['spoken']) for block in copy['blocks']}
    results['master'] = estimate(' '.join(block['spoken'] for block in copy['blocks']))
    results.update({key: estimate(value) for key, value in copy['supporting_copy'].items()})
    results.update({block['id'] + '_overlay': estimate(block['overlay']) for block in copy['blocks']})
    results['social_overlay'] = estimate('Comment START for the link.')

    assert [b['id'] for b in copy['blocks']] == [f'S{i:02d}' for i in range(1, 12)]
    assert sum(b['target_seconds'] for b in copy['blocks']) == 240
    for filename in ('SCRIPT.md', 'SHOOT-ORDER.md', 'SANDY-TAKES.txt', 'WALKTHROUGH.md'):
        artifact = (BASE / filename).read_text()
        for block in copy['blocks']:
            assert block['spoken'] in artifact, f'{filename} has stale/missing {block["id"]} copy'
        for key, value in copy['supporting_copy'].items():
            assert value in artifact, f'{filename} has stale/missing {key} copy'
    for filename in ('SCRIPT.md', 'WALKTHROUGH.md'):
        artifact = (BASE / filename).read_text()
        for block in copy['blocks']:
            assert block['overlay'] in artifact, f'{filename} has stale/missing {block["id"]} overlay'

    prohibited = re.compile(r"\b(?:zero|without|no|stop|don't|won't|never)\b", re.I)
    for block in copy['blocks']:
        match = prohibited.findall(block['spoken'])
        assert not match, f"Prohibited word found in {block['id']}: {match}"
        assert not prohibited.findall(block['overlay']), f"Prohibited overlay in {block['id']}"
        assert '\u2014' not in block['spoken'] + block['overlay'], f"Em dash in {block['id']}"
    for key, value in copy['supporting_copy'].items():
        match = prohibited.findall(value)
        assert not match, f"Prohibited word found in supporting_copy[{key}]: {match}"

    for key, item in results.items():
        assert item['fk_grade'] <= 3.0, f"{key} exceeds Grade 3: {item['fk_grade']}"

    report = {
        'method': 'Flesch-Kincaid grade estimate using CMU pronunciations and explicit local overrides.',
        'dictionary': str(DICTIONARY),
        'overrides': OVERRIDES,
        'framework': copy.get('framework'),
        'results': results,
        'all_prose_at_or_below_grade_3': True,
        'zero_prohibited_tokens': True,
        'artifacts_match_structured_copy': True,
        'edit_allocation_seconds': 240,
        'recorded_duration_verified': False
    }
    (BASE / 'readability.json').write_text(json.dumps(report, indent=2) + '\n')
    for name, row in results.items():
        print(f"{name}: {row['words']} words, {row['sentences']} sentences; grade {row['fk_grade']}")
    print("\nSpoken copy, overlays, and supporting text passed; recording artifacts match. Duration is an edit target.")


if __name__ == '__main__':
    main()
