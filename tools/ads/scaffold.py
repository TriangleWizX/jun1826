#!/usr/bin/env python3
"""SSBJJ 10x Content & Ad Scaffolder (30 Assets / Week).
Generates a complete 7-day multi-platform production schedule across 6 buyer personas,
grounded in Mountaintop local news/events, the 1,929 k10k direct-response hooks,
and Coach Sandy's 4 proven Facebook performance archetypes (Viral Loop, Cash Converter,
Post-Comp Crucible, and Tactical Closed-Guard Clinic).
"""
import argparse, json, random, re
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PERSONAS_PATH = ROOT / 'personas.json'
SWIPE_PATH = ROOT / 'k10k-swipe-file.json'

DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

# 4 Proven Facebook Performance Archetypes (Sandy's real performance data)
PILLARS = {
    'cash_converter': {
        'name': 'The Cash Converter (Post #2 Model — 2 Conversions)',
        'description': 'Direct-response high-empathy post addressing "screen-free / energy burn / beginner safety" with comment trigger & room tour invitation.',
        'formula': 'Mountain Top Audience Callout -> Benefit Hook -> Comment Trigger ("Comment START") -> Class Times -> 3 Trust Checkmarks -> Address'
    },
    'tactical_clinic': {
        'name': 'Tactical Micro-Clinic (Opening Closed Guard Model)',
        'description': '15-20s tactical breakdown solving a universal grappling friction point with physics/leverage.',
        'formula': 'Common Mistake Hook -> Mechanical Physics Leverage -> "Jiu-jitsu is physics, not muscle" -> Bio Link CTA'
    },
    'crucible_proof': {
        'name': 'The Crucible / Tournament Proof (Reel #3 Model)',
        'description': 'Earned legitimacy, testing under uncooperative tournament pressure with humility, and bringing proven safety home.',
        'formula': 'Why Coach Still Competes -> Testing Real Pressure -> Zero McDojo Theory -> Tannersville Pride CTA'
    },
    'viral_loop': {
        'name': 'The Viral Reach Loop (Reel #1 Model — #1 Most Viewed)',
        'description': 'High-retention 10-15s visual loop with instant 0-3s contrast (leverage over size / unexpected technique).',
        'formula': '0-3s Visual Contrast -> Dynamic Re-Watch Movement -> Loopable Audio -> Top-of-Funnel Bio CTA'
    }
}

# The Exact Post #2 Proven Conversion Framework Tokenized Across Avatars
WINNING_CONVERTER_POSTS = {
    'carla': {
        'headline': "💚 Mountain Top Moms! Looking for a screen-free hour where the kids burn off energy and build confidence?",
        'body': (
            "First class is FREE at Sensei Sandy BJJ. Comment START and I’ll DM you the 30-second sign-up link. 👇\n\n"
            "Kids & Teens | Mon / Tue / Wed / Fri 5 PM\n"
            "Parents & Adults | 6 PM — jump in or cheer them on!\n\n"
            "✅ 1-hour, play-based lessons\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Stroller-friendly studio at 6045 Main St, Tannersville\n\n"
            "Comment START or DM START to claim your family’s spot. See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    },
    'ben': {
        'headline': "🥋 Mountain Top Adults! Looking for a safe 45-minute sweat where you rebuild energy, mobility, and confidence?",
        'body': (
            "First class is FREE at Sensei Sandy BJJ. Comment START and I’ll DM you the 30-second sign-up link. 👇\n\n"
            "Beginner Lane | Mon / Tue / Wed / Fri 6 PM\n"
            "Saturday No-Gi | 10:30 AM\n\n"
            "✅ Zero live sparring on Day 1 — cooperative coached movement\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Welcoming beginner room at 6045 Main St, Tannersville\n\n"
            "Comment START or DM START to claim your spot. See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    },
    'casey': {
        'headline': "🚨 Mountain Top Service Crews & Teachers! Looking for an hour to completely disconnect, decompress, and blow off shift stress?",
        'body': (
            "First class is FREE at Sensei Sandy BJJ. Comment START and I’ll DM you the 30-second sign-up link. 👇\n\n"
            "Adult Decompression | Mon / Tue / Wed / Fri 6 PM\n"
            "Saturday Reset | 10:30 AM\n\n"
            "✅ 45-minute safe sweat where work stress is impossible to hold\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Clean, welcoming studio at 6045 Main St, Tannersville\n\n"
            "Comment START or DM START to claim your spot. See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    },
    'tyler': {
        'headline': "🏂 Mountain Top Skiers & Snowboarders! Looking for off-season balance, core stability, and knee resilience before the snow falls?",
        'body': (
            "First class is FREE at Sensei Sandy BJJ. Comment START and I’ll DM you the 30-second sign-up link. 👇\n\n"
            "Teens & Athletes | Mon / Tue / Wed / Fri 5 PM\n"
            "Adult Open Training | 6 PM\n\n"
            "✅ Rotational strength & joint integrity for winter injury prevention\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Located at 6045 Main St, Tannersville (6 mins from Hunter Mountain)\n\n"
            "Comment START or DM START to claim your athletic spot. See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    },
    'frankie': {
        'headline': "👨‍👩‍👧‍👦 Mountain Top Families! Tired of dropping kids off and scrolling on your phone in the parking lot?",
        'body': (
            "First class is FREE at Sensei Sandy BJJ. Comment START and I’ll DM you the 30-second sign-up link. 👇\n\n"
            "Youth & Teens | 5 PM\n"
            "Adults & Parents | 6 PM — jump in or cheer them on!\n\n"
            "✅ Shared family martial arts journey without split driving\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Stroller-friendly studio at 6045 Main St, Tannersville\n\n"
            "Comment START or DM START to claim your family’s spot. See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    },
    'wendy': {
        'headline': "🍂 Visiting the Catskills this weekend? Don't break your training routine while enjoying the foliage and SkyRides.",
        'body': (
            "Visitor passes available at Sensei Sandy BJJ. Comment VISIT and I’ll DM you the pass link. 👇\n\n"
            "Saturday Adult No-Gi | 10:30 AM\n"
            "Weekday Evenings | 6 PM\n\n"
            "✅ Clean mats, zero ego, active competitors & visitors welcome\n"
            "✅ 1st-Degree Black-Belt coach & local\n"
            "✅ Located right on Main St in Tannersville (6 mins from Hunter)\n\n"
            "Comment VISIT or DM VISIT to claim your mat pass. See you on the mats! 🥋"
        ),
        'comment_trigger': 'VISIT'
    },
    'ian': {
        'headline': "🥋 Kid POV: Learn how to escape bear hugs and roll like a turtle!",
        'body': (
            "Fun games, safe balance drills, and real escapes at Sensei Sandy BJJ in Tannersville.\n\n"
            "Kids Class | Mon / Tue / Wed / Fri 5 PM\n\n"
            "✅ 100% play-based partner escapes\n"
            "✅ 1st-Degree Black Belt coach Sandy\n\n"
            "Ask mom or dad to comment START! See you on the mats! 🥋"
        ),
        'comment_trigger': 'START'
    }
}

# Real local mountaintop seasonal anchors
LOCAL_ANCHORS = [
    {
        'event': 'Back-to-School / HTC Routine',
        'location': 'Tannersville / Hunter (HTC District)',
        'persona': 'carla',
        'theme': 'Screen-free movement after 7 hours at a school desk',
        'context': 'HTC kids are back in school, spending hours on Chromebooks and sitting. Evening classes at 5:00 PM reset focus and body awareness.'
    },
    {
        'event': 'Ski & Snowboard Pre-Season Conditioning',
        'location': 'Hunter Mountain & Windham Mountain Club',
        'persona': 'tyler',
        'theme': 'Off-season balance, grip, and knee injury resilience before the snow falls',
        'context': 'Ski season is around the corner. Controlled grappling builds the rotational core stability, hip mobility, and balance athletes need on the slopes.'
    },
    {
        'event': 'Colors in the Catskills (Hunter Mountain Fall Festival)',
        'location': 'Hunter Mountain (6 mins from studio)',
        'persona': 'wendy',
        'theme': 'Keep training while visiting the mountaintop for foliage & SkyRides',
        'context': 'Visiting the Catskills for the autumn festivals? Dont skip your weekly training routine. Sensei Sandy BJJ offers easy visitor drop-in passes.'
    },
    {
        'event': 'Couch to Mats (Before Winter Hits)',
        'location': 'Mountaintop Adults (Tannersville, Hunter, Windham)',
        'persona': 'ben',
        'theme': 'Start training now before the dark, cold Catskills winter locks you inside',
        'context': 'Dont spend the next six months sedentary on the couch. The Beginner Lane lets ordinary adults learn grappling safely with zero meathead ego.'
    },
    {
        'event': 'Mountaintop Service & Shift Work Decompression',
        'location': 'Greene County Teachers, EMTs, Firefighters, & Hospitality',
        'persona': 'casey',
        'theme': 'Mental reset for the people who keep the mountaintop running',
        'context': 'Shift work and tourist seasons take a toll. 45 minutes on the mats gives local public servants a safe sweat where work stress is impossible to hold.'
    },
    {
        'event': 'Windham 32nd Annual Autumn Affair',
        'location': 'Windham & Tannersville Families',
        'persona': 'frankie',
        'theme': 'Shared family physical competence without sideline waiting',
        'context': 'Tired of dropping kids off and waiting in the parking lot? Family jiu-jitsu gives parents and children a shared martial arts journey.'
    }
]

# 30 Multi-Platform Slots (Mapped to 4 Facebook Pillars & Production Cues)
SCHEDULE_SLOTS = [
    # Monday (4 assets)
    ('Monday', '07:30 AM', 'carla', 'Static Feed Ad (4:5)', 'Problem-Aware', 'Instagram / Facebook',
     'cash_converter', 'Photo: Sandy welcoming parent & child at studio entrance. Warm natural lighting. Full text of Post #2 conversion copy with "Mountain Top Moms!" callout.'),
    ('Monday', '12:00 PM', 'ben', 'Short-Form Reel / TikTok', 'Contrarian', 'Reels / TikTok / Shorts',
     'viral_loop', 'Video (10s loop): Sandy calmly redirecting a heavy partner push with a simple angle step. Text overlay: "Don\'t meet force with force. Meet force with an angle."'),
    ('Monday', '03:30 PM', 'carla', 'Interactive Story Poll', 'Question', 'Instagram Stories',
     'cash_converter', 'Story Poll Sticker: "Does your child crash or melt down after 7 hours on Chromebooks at school? [Yes / Screen burnout is real]."'),
    ('Monday', '06:30 PM', 'casey', 'Static Feed Ad (1:1)', 'Story', 'Facebook / Meta',
     'cash_converter', 'Post #2 Structure for Service Crews: "Mountain Top Service Crews & Teachers! Looking for an hour to completely disconnect? Comment START."'),

    # Tuesday (5 assets)
    ('Tuesday', '08:00 AM', 'ben', 'Educational Carousel (3-Slide)', 'Curiosity', 'Instagram / LinkedIn',
     'cash_converter', 'Post #2 Adult Model: Slide 1: "Think you need to get in shape before trying BJJ?" Slide 2: "That\'s like needing to know math before school." Slide 3: "Comment START for 30-sec link."'),
    ('Tuesday', '11:30 AM', 'tyler', 'Short-Form Reel / TikTok', 'Aspirational', 'Reels / TikTok / Shorts',
     'tactical_clinic', 'Video (15s): Pre-ski conditioning. Sandy demonstrating rotational hip base and knee alignment during single-leg defense. "Skiers: build balance before the snow hits."'),
    ('Tuesday', '02:30 PM', 'carla', 'Short-Form Reel / TikTok', 'Social Proof', 'Reels / Facebook',
     'viral_loop', 'Video (12s loop): Coached youth partner drill. Two kids executing clean balance escapes, finishing with high fives and smiles. Zero aggression.'),
    ('Tuesday', '05:00 PM', 'ian', 'Behind-The-Scenes Story', 'POV/Relatable', 'Instagram Stories',
     'viral_loop', 'POV phone clip: Sandy setting out cones for the youth warm-up agility game right before 5:00 PM class. Text: "Fun begins at 5."'),
    ('Tuesday', '07:00 PM', 'wendy', 'Static Feed Ad (4:5)', 'Solution-Aware', 'Meta Local Ads',
     'crucible_proof', 'Exterior of 6045 Main St Tannersville. Post #2 Visitor Variant: "Visiting Hunter or Windham for foliage? Comment VISIT for your drop-in mat pass."'),

    # Wednesday (4 assets)
    ('Wednesday', '07:30 AM', 'ben', 'Static Feed Ad (4:5)', 'Classic DR', 'Instagram / Facebook',
     'cash_converter', 'Post #2 Adult Converter: "Mountain Top Adults! Looking for a safe 45-min sweat? Zero live sparring on Day 1. Comment START."'),
    ('Wednesday', '12:00 PM', 'carla', 'Short-Form Reel / TikTok', 'Pattern Interrupt', 'Reels / TikTok / Shorts',
     'tactical_clinic', 'Video (15s micro-clinic): Sandy demonstrates the "wrist twist escape" for kids. "How leverage beats grip strength without throwing a punch."'),
    ('Wednesday', '03:30 PM', 'tyler', 'Static Feed Ad (1:1)', 'Comparison', 'Instagram / Facebook',
     'tactical_clinic', 'Graphic: "Treadmill cardio vs. grappling endurance: Why ground mechanics build real athletic durability for winter sports."'),
    ('Wednesday', '06:30 PM', 'frankie', 'Interactive Story Q&A', 'Question', 'Instagram Stories',
     'cash_converter', 'Story Q&A: "Can parents and kids train on the same evening without splitting schedules? Ask Sandy how the schedule aligns."'),

    # Thursday (4 assets)
    ('Thursday', '08:00 AM', 'carla', 'Educational Carousel (3-Slide)', 'Proof', 'Instagram / Facebook',
     'cash_converter', 'Post #2 Reassurance: Slide 1: "Play-based lessons." Slide 2: "1st-Degree Black-Belt local coach." Slide 3: "Stroller-friendly studio on Main St."'),
    ('Thursday', '11:30 AM', 'casey', 'Short-Form Reel / TikTok', 'Authority', 'Reels / TikTok / Shorts',
     'tactical_clinic', 'Video (18s Tactical Clinic): "Opening the Closed Guard" breakdown. Sandy showing hip wedge, lapel control, and posture break. "Stop pulling elbows; use geometry."'),
    ('Thursday', '03:00 PM', 'ben', 'Interactive Story Poll', 'Curiosity', 'Instagram Stories',
     'cash_converter', 'Story Poll: "Biggest hesitation about starting martial arts? [Fear of injury / Out of shape / Intimidating gym]. Sandy replies directly to every vote."'),
    ('Thursday', '07:00 PM', 'frankie', 'Static Feed Ad (4:5)', 'Story', 'Instagram / Facebook',
     'cash_converter', 'Post #2 Family Model: "Mountain Top Families! Tired of scrolling in the car? Kids at 5 PM, adults at 6 PM. Comment START."'),

    # Friday (5 assets)
    ('Friday', '07:30 AM', 'wendy', 'Short-Form Reel / TikTok', 'Urgency', 'Reels / TikTok / Shorts',
     'crucible_proof', 'Video (15s): Sandy inviting Catskills weekend visitors to Saturday morning No-Gi. "Don\'t skip mat time on vacation. 5 visitor spots open for Saturday 10:30 AM."'),
    ('Friday', '11:00 AM', 'ben', 'Short-Form Reel / TikTok', 'POV/Relatable', 'Reels / TikTok / Shorts',
     'crucible_proof', 'Post-Tournament Crucible Reel: Sandy on camera after competition: "Why competing under active pressure keeps my beginner coaching safer and more honest."'),
    ('Friday', '02:00 PM', 'carla', 'Static Feed Ad (1:1)', 'Fear', 'Facebook / Instagram',
     'cash_converter', 'Parent reassurance: "Confidence without aggression. How play-based jiu-jitsu gives children quiet boundary protection without fighting."'),
    ('Friday', '04:30 PM', 'ian', 'Weekend Hype Story', 'Pattern Interrupt', 'Instagram Stories',
     'viral_loop', 'Boomerang / short 5s clip of Sandy giving a student a stripe or high five after a clean escape drill. Text: "Friday energy on the mats."'),
    ('Friday', '07:00 PM', 'tyler', 'Short-Form Reel / TikTok', 'Contrarian', 'Reels / TikTok / Shorts',
     'tactical_clinic', 'Video (15s): "Why bench press won\'t save your ACL on black diamond runs this winter—and how mat hip mobility will."'),

    # Saturday (4 assets)
    ('Saturday', '08:30 AM', 'wendy', 'Static Feed Ad (4:5)', 'Most-Aware', 'Meta Mountain Geotarget',
     'crucible_proof', 'Saturday Adult No-Gi reminder (10:30 AM). Clean mats, zero ego, active competitors and first-timers learning side-by-side.'),
    ('Saturday', '10:00 AM', 'ben', 'Live Mat Tour Story', 'Social Proof', 'Instagram Stories',
     'cash_converter', 'Live video walk-through: Sandy walking through the studio showing clean mats, stroller parking, and warm atmosphere right before Saturday class.'),
    ('Saturday', '01:00 PM', 'frankie', 'Short-Form Reel / TikTok', 'UGC', 'Reels / Facebook',
     'crucible_proof', 'Video (15s): Parent reaction clip: "Seeing my teen learn how to stay calm under physical pressure was the best decision we made this fall."'),
    ('Saturday', '05:00 PM', 'casey', 'Static Feed Ad (4:5)', 'Classic DR', 'Facebook / Instagram',
     'cash_converter', 'Weekend Decompression: "For the hospitality, emergency, and mountain service crews: sweat the week out safely. Comment START."'),

    # Sunday (4 assets)
    ('Sunday', '09:00 AM', 'ben', 'Educational Carousel (3-Slide)', 'Contrarian', 'Instagram / Facebook',
     'tactical_clinic', 'Slide 1: "Why passive stretching won\'t fix your stiff lower back." Slide 2: "Active hip escapes & bridge mechanics." Slide 3: "Rebuilding resilience over 35."'),
    ('Sunday', '12:00 PM', 'carla', 'Weekly Reset Story', 'Question', 'Instagram Stories',
     'cash_converter', 'Schedule Planning Sticker: "Holding 2 new student slots for Monday & Tuesday 5:00 PM youth classes. Comment START to reserve."'),
    ('Sunday', '03:30 PM', 'carla', 'Short-Form Reel / TikTok', 'UGC', 'Reels / TikTok / Shorts',
     'viral_loop', 'Video (15s): "What happens during a child\'s very first 5 minutes on the mats." Coached breakfall, turtle roll, high five. Pure warmth.'),
    ('Sunday', '06:00 PM', 'ben', 'Static Feed Ad (1:1)', 'Urgency', 'Meta Retargeting',
     'cash_converter', 'Retargeting Post (Model of Post #2): "Monday starts tomorrow. 2 spots left for the Beginner Lane. Comment START or DM START for the 30-sec link."')
]

def load_data():
    personas = json.loads(PERSONAS_PATH.read_text())
    hooks = json.loads(SWIPE_PATH.read_text())
    return personas, hooks

def parse_start_date(raw, default_year=2026):
    """Parse flexible start date string (e.g. 'September 15th', '2026-09-15', 'starting sept 15')."""
    if not raw:
        return None
    if isinstance(raw, date):
        return raw
    cleaned = str(raw).strip()
    cleaned = re.sub(r'^(starting|from)\s+', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bsept\b', 'sep', cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()

    try:
        return date.fromisoformat(cleaned)
    except ValueError:
        pass

    for fmt in ('%B %d %Y', '%b %d %Y', '%B %d', '%b %d', '%Y/%m/%d', '%m/%d/%Y'):
        try:
            dt = datetime.strptime(cleaned, fmt)
            yr = dt.year if '%Y' in fmt else default_year
            return date(yr, dt.month, dt.day)
        except ValueError:
            pass
    return None

def build_scaffold(week_label=None, start_date=None):
    if not week_label:
        week_label = date.today().strftime('%G-W%V')

    if isinstance(start_date, str):
        start_date = parse_start_date(start_date)

    if not start_date:
        m = re.match(r'^(\d{4})-W(\d{1,2})$', week_label)
        if m:
            start_date = date.fromisocalendar(int(m.group(1)), int(m.group(2)), 1)

    personas, hooks = load_data()

    # Organize hooks by category
    by_cat = {}
    for h in hooks:
        by_cat.setdefault(h['category'], []).append(h)

    # Organize base slots by day
    slots_by_day = {}
    for slot in SCHEDULE_SLOTS:
        slots_by_day.setdefault(slot[0], []).append(slot)

    # Determine 7-day sequence
    if start_date:
        start_day_name = start_date.strftime('%A')
        start_idx = DAYS_ORDER.index(start_day_name)
        ordered_days = [DAYS_ORDER[(start_idx + i) % 7] for i in range(7)]
        day_dates = {ordered_days[i]: start_date + timedelta(days=i) for i in range(7)}
    else:
        ordered_days = DAYS_ORDER
        day_dates = {}

    rng = random.Random(week_label)
    schedule = []
    idx = 1

    for day in ordered_days:
        curr_date = day_dates.get(day)
        day_slots = slots_by_day.get(day, [])

        for slot in day_slots:
            day_name, slot_time, persona_id, format_type, category, platforms = slot[:6]
            pillar_id = slot[6] if len(slot) > 6 else 'cash_converter'
            production_cue = slot[7] if len(slot) > 7 else 'Clear coached demonstration on pristine mat.'

            persona = personas.get(persona_id, personas['carla'])
            matching_hooks = by_cat.get(category, hooks)
            chosen_hook = rng.choice(matching_hooks)

            # Match local anchor if applicable
            matching_anchor = next((a for a in LOCAL_ANCHORS if a['persona'] == persona_id), None)
            local_context = matching_anchor['context'] if matching_anchor else "Mountaintop small-group martial arts in Tannersville, NY."

            cid = f"post-{idx:02d}-{persona_id}"
            utm_url = f"https://senseisandy.com{persona['destination']}?utm_source=social&utm_medium={platforms.split()[0].lower()}&utm_campaign=ssbjj_{week_label}&utm_content={cid}"

            pillar_info = PILLARS.get(pillar_id, PILLARS['cash_converter'])
            converter_post = WINNING_CONVERTER_POSTS.get(persona_id, WINNING_CONVERTER_POSTS['carla'])

            item = {
                'slot_number': idx,
                'day': day,
                'date': curr_date.isoformat() if curr_date else None,
                'date_formatted': curr_date.strftime('%A, %B %d, %Y') if curr_date else day,
                'time': slot_time,
                'persona_id': persona_id,
                'persona_name': persona['name'],
                'platform': platforms,
                'format_type': format_type,
                'winning_pillar_id': pillar_id,
                'winning_pillar': pillar_info['name'],
                'production_cue': production_cue,
                'converter_copy': converter_post if pillar_id == 'cash_converter' else None,
                'hook_category': category,
                'hook_id': chosen_hook['id'],
                'hook_template': chosen_hook['text'],
                'local_anchor': matching_anchor['event'] if matching_anchor else 'Tannersville Academy',
                'local_context': local_context,
                'cta': persona['cta'],
                'destination_url': utm_url
            }
            schedule.append(item)
            idx += 1

    return schedule

def generate_markdown(week_label, schedule):
    start_info = f" ({schedule[0]['date_formatted']} to {schedule[-1]['date_formatted']})" if schedule and schedule[0].get('date') else ""
    lines = [
        f"# SSBJJ 10x Weekly Multi-Platform Content Playbook ({week_label}){start_info}",
        "",
        "**Target Volume:** 30 high-impact assets per week (10 Short-Form Videos, 10 Static Ads, 7 Stories, 3 Carousels).",
        "**Proven Performance Foundation:** Grounded in Coach Sandy's 4 winning Facebook performance archetypes:",
        "  1. 💰 **The Cash Converter (Post #2 Model — Converted 2 Students):** High-empathy local callout + 30-sec link comment trigger (\"Comment START\").",
        "  2. 🥋 **Tactical Micro-Clinic (Opening Closed Guard Model):** 15-20s mechanical problem solver (physics over muscle).",
        "  3. 🏆 **The Crucible / Tournament Proof (Reel #3 Model):** Active pressure testing, humility & local pride (#3 in views).",
        "  4. ⚡ **The Viral Reach Loop (Reel #1 Model):** 0-3s high-contrast visual pattern interrupt (#1 most viewed).",
        "**Local Mountain Grounding:** HTC School routines, Hunter Mountain Colors in the Catskills, Windham Autumn Affair, Ski pre-season.",
        "",
        "## Weekly Persona Distribution",
        "- **Coach-Mom Carla (Parents):** 9 assets (Youth confidence, safe falling, screen-free routine)",
        "- **Beginner Ben (Adult First-Timers):** 7 assets (Beginner Lane, couch-to-mats, safe coaching)",
        "- **Cross-Training Tyler (Teens):** 3 assets (Off-season athletic edge, balance, ski prep)",
        "- **Community Casey (Service Adults):** 3 assets (Shift decompression, local mountaintop crew)",
        "- **Weekend Wendy (Visitors):** 3 assets (Catskills fall foliage visitors, drop-in passes)",
        "- **Family-Activity Frankie (Families):** 3 assets (Parents & kids shared martial arts)",
        "- **Independent Ian (Kids Lens):** 2 assets (Fun games, partner escapes, small wins)",
        "",
        "---",
        ""
    ]

    current_day_heading = None
    for item in schedule:
        heading = item.get('date_formatted', item['day'])
        if heading != current_day_heading:
            current_day_heading = heading
            lines.extend([f"## 📅 {heading.upper()}", ""])

        post_lines = [
            f"### #{item['slot_number']:02d} | {item['time']} — {item['format_type']}",
            f"- **Platform:** {item['platform']}",
            f"- **Target Avatar:** {item['persona_name']} (`{item['persona_id']}`)",
            f"- **Winning Archetype:** `{item['winning_pillar']}`",
            f"- **Production Cue:** {item['production_cue']}",
            f"- **Hook Category:** `{item['hook_category']}` (k10k Hook #{item['hook_id']})",
            f"- **Hook Template:** *\"{item['hook_template']}\"*",
            f"- **Local Mountain Context:** {item['local_anchor']} — *{item['local_context']}*",
            f"- **Direct Call to Action:** [{item['cta']}]({item['destination_url']})"
        ]

        if item.get('converter_copy'):
            cp = item['converter_copy']
            formatted_body = cp['body'].replace('\n', '\n> ')
            post_lines.extend([
                "",
                "> 📝 **Ready-to-Post Copy (Proven Post #2 Template):**",
                f"> **{cp['headline']}**",
                "> ",
                f"> {formatted_body}",
                "> ",
                f"> 👉 *DM Link:* {item['destination_url']}"
            ])

        post_lines.append("")
        lines.extend(post_lines)

    return '\n'.join(lines)

def main():
    p = argparse.ArgumentParser(description='SSBJJ 10x Weekly Content & Ad Scaffolder')
    p.add_argument('--week', default=date.today().strftime('%G-W%V'), help='ISO calendar week (YYYY-Www)')
    p.add_argument('--start', '--start-date', dest='start_date', help='Starting calendar date (YYYY-MM-DD or e.g. "September 15th")')
    p.add_argument('--output', help='Output markdown path')
    p.add_argument('--json', help='Output json path')
    p.add_argument('extra', nargs='*', help='Extra arguments e.g. "starting september 15th"')
    args = p.parse_args()

    start_raw = args.start_date
    if not start_raw and args.extra:
        start_raw = ' '.join(args.extra)

    default_year = 2026
    m = re.match(r'^(\d{4})-W', args.week)
    if m:
        default_year = int(m.group(1))

    start_date = parse_start_date(start_raw, default_year=default_year) if start_raw else None

    schedule = build_scaffold(args.week, start_date=start_date)
    md_text = generate_markdown(args.week, schedule)

    out_md = Path(args.output) if args.output else ROOT / f'week-10x-scaffold-{args.week}.md'
    out_md.write_text(md_text)
    print(f"Generated 30-post playbook: {out_md.resolve()}")
    if start_date:
        print(f"Schedule start date: {schedule[0]['date_formatted']} -> {schedule[-1]['date_formatted']}")

    if args.json:
        out_json = Path(args.json)
        out_json.write_text(json.dumps(schedule, indent=2))
        print(f"Saved JSON schedule: {out_json.resolve()}")

if __name__ == '__main__':
    main()
