#!/usr/bin/env python3
"""SSBJJ Swipe File CLI & Integration Engine.
Enriches SSBJJ Ad Studio with 1,929 direct-response hooks from k10k.com/swipe-file.
"""
import argparse, json, random, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SWIPE_PATH = ROOT / 'k10k-swipe-file.json'
PERSONAS_PATH = ROOT / 'personas.json'

SLOT_MAP = {
    'ben': {
        'AUDIENCE': 'adults in the Catskills',
        'TARGET AUDIENCE': 'adults who have thought about martial arts for years',
        'PROBLEM': 'feeling out of shape and intimidated by gym culture',
        'ASSUMED_PROBLEM': 'not being fit enough to start',
        'ROOT_CAUSE': 'not having a structured, ego-free Beginner Lane',
        'PRODUCT': 'coached beginner jiu-jitsu',
        'OUTCOME': 'learn practical grappling without getting wrecked',
        'TIMEFRAME': '4 weeks',
        'TOPIC': 'starting jiu-jitsu as an adult',
        'INDUSTRY': 'martial arts',
        'GOAL': 'get in shape while learning a real skill',
        'COMMON TASK': 'going to an ordinary gym',
        'PROFESSIONAL': 'coach',
    },
    'carla': {
        'AUDIENCE': 'local parents',
        'TARGET AUDIENCE': 'moms looking for a safe after-school activity',
        'PROBLEM': 'too much screen time and low physical confidence',
        'ASSUMED_PROBLEM': 'kids being naturally uncoordinated or shy',
        'ROOT_CAUSE': 'activities that lecture instead of coaching through games',
        'PRODUCT': 'small-group youth jiu-jitsu',
        'OUTCOME': 'confidence, focus, and safe falling skills',
        'TIMEFRAME': '6 weeks',
        'TOPIC': 'kids martial arts without aggression',
        'INDUSTRY': 'youth sports',
        'GOAL': 'help your child become capable and resilient',
        'COMMON TASK': 'sitting on the bench in youth sports',
        'PROFESSIONAL': 'instructor',
    },
    'tyler': {
        'AUDIENCE': 'teen athletes',
        'TARGET AUDIENCE': 'high school athletes looking for an off-season edge',
        'PROBLEM': 'getting pushed around or losing balance in games',
        'ASSUMED_PROBLEM': 'needing to lift heavier weights',
        'ROOT_CAUSE': 'lacking balance, leverage, and grip control under resistance',
        'PRODUCT': 'teen grappling and movement training',
        'OUTCOME': 'become harder to control and physically dominant',
        'TIMEFRAME': 'one sports season',
        'TOPIC': 'off-season athletic cross-training',
        'INDUSTRY': 'athletics',
        'GOAL': 'level up physical confidence and grit',
        'COMMON TASK': 'doing basic cardio drills',
        'PROFESSIONAL': 'coach',
    },
    'casey': {
        'AUDIENCE': 'teachers, EMTs, and first responders',
        'TARGET AUDIENCE': 'shift workers who need a healthy release',
        'PROBLEM': 'carrying work stress and tension home',
        'ASSUMED_PROBLEM': 'not having enough downtime',
        'ROOT_CAUSE': 'not having a physical activity that requires 100% mental presence',
        'PRODUCT': 'coached adult jiu-jitsu',
        'OUTCOME': 'a complete mental decompression on the mats',
        'TIMEFRAME': '45 minutes',
        'TOPIC': 'stress relief for public servants',
        'INDUSTRY': 'health and wellness',
        'GOAL': 'stay capable and mentally refreshed',
        'COMMON TASK': 'scrolling after a long shift',
        'PROFESSIONAL': 'instructor',
    },
    'wendy': {
        'AUDIENCE': 'visitors in the Catskills',
        'TARGET AUDIENCE': 'travelers staying near Hunter or Windham',
        'PROBLEM': 'breaking your training routine while traveling',
        'ASSUMED_PROBLEM': 'finding a friendly place to train without high drop-in friction',
        'ROOT_CAUSE': 'academies that force sales pitches on drop-ins',
        'PRODUCT': 'visitor passes and private coaching',
        'OUTCOME': 'keep training with clean mats and welcoming partners',
        'TIMEFRAME': 'this weekend',
        'TOPIC': 'training while on vacation',
        'INDUSTRY': 'grappling',
        'GOAL': 'stay sharp without missing training days',
        'COMMON TASK': 'skipping workouts on ski trips',
        'PROFESSIONAL': 'host coach',
    },
    'frankie': {
        'AUDIENCE': 'active mountain families',
        'TARGET AUDIENCE': 'parents tired of sitting in the car during kids practice',
        'PROBLEM': 'family activities where parents just watch from the sidelines',
        'ASSUMED_PROBLEM': 'kids and adults needing completely separate sports',
        'ROOT_CAUSE': 'traditional sports isolating parents from the learning process',
        'PRODUCT': 'family jiu-jitsu programs',
        'OUTCOME': 'a shared family routine that builds resilience together',
        'TIMEFRAME': '12 weeks',
        'TOPIC': 'family fitness and connection',
        'INDUSTRY': 'family recreation',
        'GOAL': 'learn a lifelong discipline together',
        'COMMON TASK': 'waiting in the parking lot during soccer practice',
        'PROFESSIONAL': 'family coach',
    }
}

AWARENESS_CATEGORIES = {
    'Unaware': 'Audience does not know they have a problem or need yet.',
    'Problem-Aware': 'Audience recognizes the pain point or symptom.',
    'Solution-Aware': 'Audience knows solutions exist (e.g. martial arts), evaluating options.',
    'Most-Aware': 'Audience knows Sensei Sandy BJJ, ready for the final offer/nudge.'
}

def load_hooks():
    if not SWIPE_PATH.exists():
        raise FileNotFoundError(f"Swipe file not found at {SWIPE_PATH}")
    return json.loads(SWIPE_PATH.read_text())

def filter_hooks(hooks, category=None, search=None, slots=None):
    results = hooks
    if category:
        cat_lower = category.lower()
        results = [h for h in results if h['category'].lower() == cat_lower]
    if search:
        s_lower = search.lower()
        results = [h for h in results if s_lower in h['text'].lower() or s_lower in h['category'].lower()]
    if slots:
        results = [h for h in results if any(s in h['slots'] for s in slots)]
    return results

def adapt_hook_for_persona(hook, persona_id):
    text = hook['text']
    mapping = SLOT_MAP.get(persona_id, {})
    for slot_name, replacement in mapping.items():
        pattern = re.compile(re.escape(f'[{slot_name}]'), re.IGNORECASE)
        text = pattern.sub(replacement, text)
    return text

def format_hook_markdown(hook, persona_id=None):
    cat = hook['category']
    raw_text = hook['text']
    lines = [f"### [{cat}] Hook #{hook['id']}"]
    lines.append(f"- **Swipe Template:** `{raw_text}`")
    if persona_id:
        adapted = adapt_hook_for_persona(hook, persona_id)
        lines.append(f"- **Adapted for {persona_id.capitalize()}:** *\"{adapted}\"*")
    if hook.get('slots'):
        lines.append(f"- **Variables:** {', '.join(hook['slots'])}")
    return '\n'.join(lines)

def main():
    p = argparse.ArgumentParser(description='SSBJJ Swipe File CLI & Concept Integrator')
    sub = p.add_subparsers(dest='command', required=True)

    # list-categories
    sub.add_parser('categories', help='List all 21 hook categories and counts')

    # sample
    ps = sub.add_parser('sample', help='Sample hooks with optional filters')
    ps.add_argument('--category', help='Filter by category (e.g., Curiosity, Contrarian, Problem-Aware)')
    ps.add_argument('--search', help='Search text in hooks')
    ps.add_argument('--count', type=int, default=5, help='Number of hooks to show')
    ps.add_argument('--persona', choices=['ben', 'carla', 'tyler', 'casey', 'wendy', 'frankie'], help='Adapt for persona')

    # adapt
    pa = sub.add_parser('adapt', help='Adapt top hooks for a given buyer persona')
    pa.add_argument('--persona', required=True, choices=['ben', 'carla', 'tyler', 'casey', 'wendy', 'frankie'], help='Persona to adapt for')
    pa.add_argument('--category', help='Filter by category')
    pa.add_argument('--count', type=int, default=5, help='Number of hooks to generate')

    # export-reference
    pe = sub.add_parser('export-reference', help='Export full markdown reference guide')
    pe.add_argument('--output', default='tools/ads/SWIPE-FILE-REFERENCE.md', help='Output file path')

    args = p.parse_args()
    hooks = load_hooks()

    if args.command == 'categories':
        cats = {}
        for h in hooks:
            c = h['category']
            cats[c] = cats.get(c, 0) + 1
        print(f"Total Hooks: {len(hooks)} across {len(cats)} categories\n")
        for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
            note = f" ({AWARENESS_CATEGORIES[cat]})" if cat in AWARENESS_CATEGORIES else ""
            print(f"- {cat}: {cnt}{note}")

    elif args.command == 'sample':
        filtered = filter_hooks(hooks, category=args.category, search=args.search)
        if not filtered:
            print("No hooks matched criteria.")
            return
        selected = random.sample(filtered, min(args.count, len(filtered)))
        print(f"Sampled {len(selected)} hooks (from {len(filtered)} matches):\n")
        for h in selected:
            print(format_hook_markdown(h, args.persona))
            print()

    elif args.command == 'adapt':
        filtered = filter_hooks(hooks, category=args.category)
        if not filtered:
            print("No hooks matched criteria.")
            return
        selected = random.sample(filtered, min(args.count, len(filtered)))
        print(f"Adapted {len(selected)} hooks for {args.persona.upper()}:\n")
        for h in selected:
            print(format_hook_markdown(h, args.persona))
            print()

    elif args.command == 'export-reference':
        out_file = Path(args.output)
        cats = {}
        for h in hooks:
            cats.setdefault(h['category'], []).append(h)
        lines = [
            "# SSBJJ Direct-Response Swipe File Reference (1,929 Hooks)",
            "",
            "Archived and adapted from `https://k10k.com/swipe-file` for Sensei Sandy BJJ.",
            "",
            "## Table of Contents",
            ""
        ]
        for c, hlist in sorted(cats.items()):
            slug = c.lower().replace('/', '-').replace(' ', '-')
            lines.append(f"- [{c} ({len(hlist)} hooks)](#{slug})")
        lines.append("")
        for c, hlist in sorted(cats.items()):
            slug = c.lower().replace('/', '-').replace(' ', '-')
            lines.extend([f"<a id=\"{slug}\"></a>", f"## {c} ({len(hlist)} hooks)", ""])
            for h in hlist:
                lines.append(f"**#{h['id']}**: `{h['text']}`")
                if h['slots']:
                    lines.append(f"*Variables: {', '.join(h['slots'])}*")
                lines.append("")
        out_file.write_text('\n'.join(lines))
        print(f"Exported {len(hooks)} hooks reference to {out_file.resolve()}")

if __name__ == '__main__':
    main()
