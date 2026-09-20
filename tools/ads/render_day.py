#!/usr/bin/env python3
"""Render all graphics for a specific day from the SSBJJ 10x weekly scaffold.
Outputs production-quality static ads, multi-slide carousels, story/reel title cards,
and Google Business Profile (GBP) square assets.
"""
import argparse, datetime, html, json, sys, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
FONT_PATH = ROOT / 'font.ttf'
OUTPUT_ROOT = ROOT / 'output'

def font(size):
    return ImageFont.truetype(str(FONT_PATH), size)

def wrap_text(draw, text, font_obj, max_width):
    lines = []
    for paragraph in text.split('\n'):
        if not paragraph.strip():
            lines.append('')
            continue
        words = paragraph.split()
        current_line = []
        for word in words:
            test_line = ' '.join(current_line + [word])
            if draw.textlength(test_line, font=font_obj) <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))
    return lines

def create_header(im, draw, logo_img, category_tag="SENSEI SANDY BJJ • TANNERSVILLE, NY"):
    logo_scaled = ImageOps.contain(logo_img, (100, 100))
    draw.rounded_rectangle((50, 50, 160, 160), radius=14, fill='#F3CF52')
    im.paste(logo_scaled, (55, 55), logo_scaled)

    draw.text((180, 68), 'SENSEI SANDY BJJ', font=font(34), fill='#F3CF52')
    draw.text((180, 114), category_tag.upper(), font=font(20), fill='#E0D9D1')

def create_footer(im, draw, w, h, cta_text="RESERVE FREE INTRO", url_text="SenseiSandy.com • Text (917) 736-8649"):
    btn_box = (60, h - 165, w - 60, h - 95)
    draw.rounded_rectangle(btn_box, radius=16, fill='#F3CF52')

    cta_font = font(32)
    cta_len = draw.textlength(cta_text, font=cta_font)
    draw.text(((w - cta_len) / 2, h - 146), cta_text, font=cta_font, fill='#151922')

    sub_font = font(22)
    sub_len = draw.textlength(url_text, font=sub_font)
    draw.text(((w - sub_len) / 2, h - 68), url_text, font=sub_font, fill='#A89F91')

def render_carousel_slide(out_dir, slide_num, total_slides, headline, body_paragraphs, photo_path, logo_img, badge_text="", slot_prefix="slot01"):
    w, h = 1080, 1350
    im = Image.new('RGB', (w, h), '#151922')
    draw = ImageDraw.Draw(im)

    tag_text = badge_text if badge_text else f"BEGINNER LANE • SLIDE {slide_num} OF {total_slides}"
    create_header(im, draw, logo_img, tag_text)

    draw.rounded_rectangle((w - 240, 65, w - 50, 125), radius=12, fill='#1E2836', outline='#F3CF52', width=2)
    draw.text((w - 215, 82), f"SWIPE ➡️ {slide_num}/{total_slides}", font=font(20), fill='#F3CF52')

    if photo_path and photo_path.exists():
        photo = Image.open(photo_path).convert('RGB')
        box = (960, 420)
        photo = ImageOps.fit(photo, box, centering=(0.5, 0.5))
        draw.rounded_rectangle((58, 198, 1022, 622), radius=12, fill='#F3CF52')
        im.paste(photo, (60, 200))

    y_text = 660
    head_font = font(48)
    head_lines = wrap_text(draw, headline, head_font, 940)
    for line in head_lines:
        draw.text((65, y_text), line, font=head_font, fill='#FFFFFF')
        y_text += 60

    y_text += 10
    draw.line((65, y_text, 220, y_text), fill='#F3CF52', width=4)
    y_text += 25

    body_font = font(28)
    for para in body_paragraphs:
        body_lines = wrap_text(draw, para, body_font, 940)
        for line in body_lines:
            draw.text((65, y_text), line, font=body_font, fill='#E0D9D1')
            y_text += 38
        y_text += 10

    create_footer(im, draw, w, h, "COMMENT START FOR 30-SEC LINK", "SenseiSandy.com • 6045 Main St, Tannersville")

    file_name = f"{slot_prefix}_carousel_slide_{slide_num}.png"
    im.save(out_dir / file_name)
    return file_name

def render_static_ad_portrait(out_dir, file_name, headline, body_text, photo_path, logo_img, tag, cta, sub_url):
    w, h = 1080, 1350
    im = Image.new('RGB', (w, h), '#151922')
    draw = ImageDraw.Draw(im)

    create_header(im, draw, logo_img, tag)

    if photo_path and photo_path.exists():
        photo = Image.open(photo_path).convert('RGB')
        box = (960, 460)
        photo = ImageOps.fit(photo, box, centering=(0.5, 0.5))
        draw.rounded_rectangle((58, 198, 1022, 662), radius=12, fill='#F3CF52')
        im.paste(photo, (60, 200))

    y_text = 700
    head_font = font(48)
    head_lines = wrap_text(draw, headline, head_font, 940)
    for line in head_lines:
        draw.text((65, y_text), line, font=head_font, fill='#FFFFFF')
        y_text += 58

    y_text += 10
    draw.line((65, y_text, 200, y_text), fill='#F3CF52', width=4)
    y_text += 25

    body_font = font(28)
    body_lines = wrap_text(draw, body_text, body_font, 940)
    for line in body_lines:
        draw.text((65, y_text), line, font=body_font, fill='#E0D9D1')
        y_text += 40

    create_footer(im, draw, w, h, cta, sub_url)
    im.save(out_dir / file_name)
    return file_name

def render_square_graphic(out_dir, file_name, headline, body_text, photo_path, logo_img, tag, cta, sub_url):
    w, h = 1080, 1080
    im = Image.new('RGB', (w, h), '#151922')
    draw = ImageDraw.Draw(im)

    create_header(im, draw, logo_img, tag)

    if photo_path and photo_path.exists():
        photo = Image.open(photo_path).convert('RGB')
        box = (960, 380)
        photo = ImageOps.fit(photo, box, centering=(0.5, 0.5))
        draw.rounded_rectangle((58, 188, 1022, 572), radius=12, fill='#F3CF52')
        im.paste(photo, (60, 190))

    y_text = 600
    head_font = font(42)
    head_lines = wrap_text(draw, headline, head_font, 940)
    for line in head_lines:
        draw.text((65, y_text), line, font=head_font, fill='#FFFFFF')
        y_text += 50

    y_text += 8
    draw.line((65, y_text, 190, y_text), fill='#F3CF52', width=4)
    y_text += 20

    body_font = font(26)
    body_lines = wrap_text(draw, body_text, body_font, 940)
    for line in body_lines:
        draw.text((65, y_text), line, font=body_font, fill='#E0D9D1')
        y_text += 36

    create_footer(im, draw, w, h, cta, sub_url)
    im.save(out_dir / file_name)
    return file_name

def render_story_card(out_dir, file_name, title, subtitle, photo_path, logo_img, badge=""):
    w, h = 1080, 1920
    im = Image.new('RGB', (w, h), '#0F1A15')
    draw = ImageDraw.Draw(im)

    create_header(im, draw, logo_img, "SSBJJ • STORIES & REELS")

    if badge:
        draw.rounded_rectangle((w - 300, 65, w - 50, 125), radius=12, fill='#116A42', outline='#F3CF52', width=2)
        draw.text((w - 280, 82), badge, font=font(22), fill='#FFFFFF')

    if photo_path and photo_path.exists():
        photo = Image.open(photo_path).convert('RGB')
        box = (960, 800)
        photo = ImageOps.fit(photo, box, centering=(0.5, 0.5))
        draw.rounded_rectangle((58, 218, 1022, 1022), radius=14, fill='#F3CF52')
        im.paste(photo, (60, 220))

    y_text = 1100
    head_font = font(56)
    head_lines = wrap_text(draw, title, head_font, 940)
    for line in head_lines:
        draw.text((65, y_text), line, font=head_font, fill='#FFFFFF')
        y_text += 70

    y_text += 15
    draw.line((65, y_text, 250, y_text), fill='#F3CF52', width=5)
    y_text += 35

    sub_font = font(34)
    sub_lines = wrap_text(draw, subtitle, sub_font, 940)
    for line in sub_lines:
        draw.text((65, y_text), line, font=sub_font, fill='#E0D9D1')
        y_text += 50

    create_footer(im, draw, w, h, "TAP LINK TO PLAN YOUR VISIT", "SenseiSandy.com • 6045 Main St, Tannersville")
    im.save(out_dir / file_name)
    return file_name

def write_review_html(out_dir, date_str, day_name, rendered_cards, title_desc):
    html_cards = []
    for c in rendered_cards:
        link_html = f'<div class="dest-link"><a href="{c.get("destination", "#")}" target="_blank">🔗 Destination / Offer Link</a></div>' if c.get("destination") else ''
        html_cards.append(f"""
        <div class="card">
            <div class="badge">Slot #{c['slot']} • {c['avatar']}</div>
            <a href="{c['file']}" target="_blank"><img src="{c['file']}" loading="lazy" alt="{html.escape(c['caption'])}"></a>
            <div class="desc">
                <strong>{c['type']}</strong><br>
                <span>{html.escape(c['caption'])}</span>
                {link_html}
            </div>
        </div>
        """)

    html_content = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SSBJJ {day_name} Render Gallery — {date_str}</title>
<style>
  body {{ background: #11161B; color: #F3CF52; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; }}
  h1 {{ margin: 0 0 8px; font-size: 28px; color: #FFFFFF; }}
  p.subhead {{ color: #A89F91; margin: 0 0 24px; font-size: 16px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }}
  .card {{ background: #1B222A; border-radius: 14px; overflow: hidden; border: 1px solid rgba(243, 207, 82, 0.2); display: flex; flex-direction: column; }}
  .card .badge {{ background: #116A42; color: #FFFFFF; padding: 8px 14px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }}
  .card img {{ width: 100%; height: auto; display: block; border-bottom: 1px solid rgba(255,255,255,0.08); }}
  .card .desc {{ padding: 14px 16px; font-size: 14px; color: #E0D9D1; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }}
  .card .desc strong {{ color: #F3CF52; font-size: 15px; display: inline-block; margin-bottom: 4px; }}
  .dest-link {{ margin-top: 10px; font-size: 12px; }}
  .dest-link a {{ color: #00DDE0; text-decoration: none; }}
  .dest-link a:hover {{ text-decoration: underline; }}
</style>
</head>
<body>
  <h1>🥋 Sensei Sandy BJJ — {day_name} Production Assets ({date_str})</h1>
  <p class="subhead">{title_desc}</p>
  <div class="grid">
    {''.join(html_cards)}
  </div>
</body>
</html>
"""
    (out_dir / 'review.html').write_text(html_content)

def render_tuesday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, fb_converter_orig):
    rendered_cards = []

    # Copy original FB winning asset for reference
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative that converted 2 students on Facebook'
        })

    # 1. SLOT #01: CAROUSEL SLIDES (Beginner Ben)
    s1 = render_carousel_slide(
        out_dir, 1, 3,
        "Think you need to get in shape before trying BJJ?",
        [
            "Most adults wait 6 months trying to 'get ready' for a martial arts gym.",
            "That's like waiting to know calculus before stepping into school.",
            "Swipe to see what Day 1 on the mats actually looks like."
        ],
        adult_photo, logo_img, slot_prefix="slot01"
    )
    rendered_cards.append({
        'slot': 1, 'type': 'Carousel Slide 1/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s1, 'caption': 'Slide 1: Breaking the "must get in shape first" objection'
    })

    s2 = render_carousel_slide(
        out_dir, 2, 3,
        "Day 1 is Coached Learning. Cooperative and Calm.",
        [
            "In our Beginner Lane, you practice with respectful partners and guided coaching.",
            "You learn how to fall safely, protect your balance, and move with leverage.",
            "We pair you with a cooperative partner who matches your exact pace."
        ],
        kids_photo, logo_img, slot_prefix="slot01"
    )
    rendered_cards.append({
        'slot': 1, 'type': 'Carousel Slide 2/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s2, 'caption': 'Slide 2: Safety reassurance and Beginner Lane breakdown'
    })

    s3 = render_carousel_slide(
        out_dir, 3, 3,
        "Comment START for the 30-Second Link.",
        [
            "We have 3 beginner spots open for Tuesday 6:00 PM in Tannersville.",
            "• Coached by 1st-Degree Black Belt Sandy (Clockwork NYC lineage)",
            "• Clean mats, supportive partners, stroller-friendly studio",
            "Comment START below or text (917) 736-8649 to reserve."
        ],
        exterior_photo, logo_img, slot_prefix="slot01"
    )
    rendered_cards.append({
        'slot': 1, 'type': 'Carousel Slide 3/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s3, 'caption': 'Slide 3: Direct conversion micro-commitment (Post #2 Model)'
    })

    # 2. SLOT #02: REEL COVER CARD (Cross-Training Tyler - Pre-Ski Season)
    r2 = render_story_card(
        out_dir, "slot02_reel_cover_tyler.png",
        "Skiers: Build Balance Before Snow Hits",
        "Off-season rotational core stability, knee resilience, and hip agility at Sensei Sandy BJJ in Tannersville.",
        adult_photo, logo_img, badge="PRE-SKI PREP"
    )
    rendered_cards.append({
        'slot': 2, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Cross-Training Tyler',
        'file': r2, 'caption': '11:30 AM Reel Thumbnail: Off-season ski conditioning & balance'
    })

    # 3. SLOT #03: REEL COVER CARD (Coach-Mom Carla - Youth Balance Games)
    r3 = render_story_card(
        out_dir, "slot03_reel_cover_carla.png",
        "Screen-Free Focus for Mountain Kids",
        "Coached youth partner games at 5:00 PM. Quiet confidence through structured drilling at 6045 Main St, Tannersville.",
        kids_photo, logo_img, badge="YOUTH 5 PM"
    )
    rendered_cards.append({
        'slot': 3, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Coach-Mom Carla',
        'file': r3, 'caption': '02:30 PM Reel Thumbnail: Coached youth movement'
    })

    # 4. SLOT #04: STORY CARD (Independent Ian - Behind The Scenes)
    r4 = render_story_card(
        out_dir, "slot04_story_card_ian.png",
        "Fun Begins at 5:00 PM on the Mats",
        "POV: Coach Sandy setting up the agility cones and balance rolls before class starts.",
        kids_photo, logo_img, badge="TODAY AT 5 PM"
    )
    rendered_cards.append({
        'slot': 4, 'type': 'Story Graphic (1080x1920)', 'avatar': 'Independent Ian',
        'file': r4, 'caption': '05:00 PM Instagram Story Card: Mat setup & hype'
    })

    # 5. SLOT #05: STATIC FEED AD (Weekend Wendy - Visitor Drop-in)
    r5 = render_static_ad_portrait(
        out_dir, "slot05_static_ad_wendy.png",
        "Visiting the Catskills? Keep Your Training Momentum.",
        "Visiting for foliage or Hunter Mountain SkyRides? Drop in for clean, respectful jiu-jitsu at 6045 Main St, Tannersville. Active competitors and visitors welcome. Saturday No-Gi 10:30 AM & Weekdays 6:00 PM.",
        exterior_photo, logo_img,
        "VISITOR PASSES • 6 MINS FROM HUNTER",
        "COMMENT VISIT FOR PASS LINK",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 5, 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Weekend Wendy',
        'file': r5, 'caption': '07:00 PM Static Ad: Fall foliage visitor passes'
    })

    desc = "All 8 visual exports for Tuesday: original conversion reference, 3-slide carousel for Beginner Ben, 2 reel title cards, 1 story graphic, and 1 static visitor feed ad."
    write_review_html(out_dir, date_str, "Tuesday", rendered_cards, desc)
    return rendered_cards

def render_thursday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig):
    rendered_cards = []

    # Copy original FB winning asset for reference
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative baseline that converted 2 students on Facebook (Post #2 Model)'
        })

    # 1. SLOT #10 / #14: CAROUSEL SLIDES (Coach-Mom Carla - HTC Screen Reset)
    c1 = render_carousel_slide(
        out_dir, 1, 3,
        "HTC Kids Spend 6 Hours on Screens. Reset Their Energy.",
        [
            "After hours sitting at school and staring at Chromebooks, kids need physical focus.",
            "Sensei Sandy BJJ in Tannersville teaches balance through coached partner games.",
            "Swipe to see why our mats stay calm and structured."
        ],
        kids_photo, logo_img,
        badge_text="KIDS & TEENS 5 PM • SLIDE 1 OF 3",
        slot_prefix="slot14"
    )
    rendered_cards.append({
        'slot': '10/14', 'type': 'Carousel Slide 1/3 (1080x1350)', 'avatar': 'Coach-Mom Carla',
        'file': c1, 'caption': 'Slide 1: HTC kids screen fatigue vs coached martial arts movement',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=slot-10-carla-enhanced'
    })

    c2 = render_carousel_slide(
        out_dir, 2, 3,
        "1st-Degree Black Belt Coaching. Built for Safety.",
        [
            "Coach Sandy brings 15+ years of Clockwork NYC lineage to Tannersville.",
            "Youth sessions teach safe falling, body leverage, and mat respect.",
            "Kids solve physical movement puzzles with cooperative partners. No roughhousing."
        ],
        adult_photo, logo_img,
        badge_text="COACHED SAFETY • SLIDE 2 OF 3",
        slot_prefix="slot14"
    )
    rendered_cards.append({
        'slot': '10/14', 'type': 'Carousel Slide 2/3 (1080x1350)', 'avatar': 'Coach-Mom Carla',
        'file': c2, 'caption': 'Slide 2: Safety reassurance, certified lineage, and cooperative partner games',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=slot-10-carla-enhanced'
    })

    c3 = render_carousel_slide(
        out_dir, 3, 3,
        "Reserve Your Child's Free Intro This Week.",
        [
            "• Kids & Teens (Ages 6–15): Mon / Tue / Wed / Fri at 5:00 PM",
            "• Parents: watch from our lounge or join the 6:00 PM Adult class",
            "• Clean studio located at 6045 Main Street, Tannersville",
            "Comment START, tap link in bio, or text (917) 736-8649 for the link."
        ],
        exterior_photo, logo_img,
        badge_text="FREE INTRO • SLIDE 3 OF 3",
        slot_prefix="slot14"
    )
    rendered_cards.append({
        'slot': '10/14', 'type': 'Carousel Slide 3/3 (1080x1350)', 'avatar': 'Coach-Mom Carla',
        'file': c3, 'caption': 'Slide 3: Micro-commitment conversion, schedule clarity, and Free Intro link',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=slot-10-carla-enhanced'
    })

    # 2. SLOT #15: REEL COVER CARD (Community Casey - Tactical Micro-Clinic)
    r15 = render_story_card(
        out_dir, "slot15_reel_cover_casey.png",
        "Passing Half Guard: Chest-to-Chest to North-South",
        "Keep your trapped leg planted. Drop heavy chest pressure and walk your hips backward to North-South. Gravity opens the lock using pure mechanical leverage.",
        adult_photo, logo_img, badge="HALF GUARD PASS • ADULT 6 PM"
    )
    rendered_cards.append({
        'slot': 15, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Community Casey',
        'file': r15, 'caption': '01:30 PM Tactical Reel: Passing half guard towards North-South with chest-to-chest pressure',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-15-casey'
    })

    # 3. SLOT #16: INTERACTIVE STORY POLL (Beginner Ben - Overcoming Hesitations)
    r16 = render_story_card(
        out_dir, "slot16_story_poll_ben.png",
        "What Holds You Back From Trying Martial Arts?",
        "[ A ] Fear of injury on Day 1\n[ B ] Need to build conditioning\n[ C ] Intimidating gym vibes\n\nBeginner Lane: cooperative movement, calm pacing, and a 1st-degree black belt coach.",
        mats_photo, logo_img, badge="INTERACTIVE POLL"
    )
    rendered_cards.append({
        'slot': 16, 'type': 'Interactive Story Graphic (1080x1920)', 'avatar': 'Beginner Ben',
        'file': r16, 'caption': '03:00 PM Story Poll: Overcoming beginner friction & couch-to-mat hesitation',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=post-16-ben'
    })

    # 4. SLOT #17: STATIC FEED AD (Family-Activity Frankie - Parking Lot Solution)
    r17 = render_static_ad_portrait(
        out_dir, "slot17_static_ad_frankie.png",
        "Mountain Families: Train Together Under One Roof.",
        "Tired of driving kids to practice and scrolling in a cold car? At Sensei Sandy BJJ, kids train at 5:00 PM and adults train at 6:00 PM. Build balance, discipline, and stamina under one roof at 6045 Main St, Tannersville. Coached beginner lane with structured partner drills and supportive coaches.",
        exterior_photo, logo_img,
        "FAMILY JIU-JITSU • 6045 MAIN ST, TANNERSVILLE",
        "COMMENT FAMILY FOR FREE INTRO LINK",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 17, 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Family-Activity Frankie',
        'file': r17, 'caption': '07:00 PM Static Feed Ad: Family martial arts journey with a unified schedule',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=post-17-frankie'
    })

    # 5. GBP-03: GOOGLE BUSINESS PROFILE GRAPHIC (Safety & Beginner Lane Focus)
    gbp3 = render_square_graphic(
        out_dir, "slot_gbp03_safety_lane.png",
        "Safety First: Coached Resistance at Your Pace",
        "Start calm. Train smart. Day 1 at Sensei Sandy BJJ provides guided technical coaching with cooperative partners. Learn balance, leverage, and safe falling in a clean, respectful room at 6045 Main St.",
        adult_photo, logo_img,
        "COACHED LEARNING • TANNERSVILLE, NY",
        "RESERVE FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'GBP-03', 'type': 'Google Business Profile Square (1080x1080)', 'avatar': 'Safety-Minded Adult/Parent',
        'file': gbp3, 'caption': 'Day 3 GBP Post: Technical coached graphic highlighting beginner safety and respectful learning',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=google&utm_medium=organic&utm_campaign=gbp_post_03'
    })

    desc = "All 8 visual exports for Thursday: Winning reference post, 3-slide educational carousel for Coach-Mom Carla (Screen-Free Routine), 1 Tactical Micro-Clinic Reel cover for Community Casey, 1 Beginner Hesitation Story Poll card for Beginner Ben, 1 Static Family Feed Ad for Family-Activity Frankie, and 1 Google Business Profile (GBP-03) Safety & Beginner Lane Graphic."
    write_review_html(out_dir, date_str, "Thursday", rendered_cards, desc)
    return rendered_cards

def render_friday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig):
    rendered_cards = []

    # 0. ORIGINAL WINNING FB POST #2 CONVERTER
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative baseline that converted 2 students on Facebook (Post #2 Model)'
        })

    # 1. SLOT #18: REEL COVER CARD (Weekend Wendy - Catskills Vacation Mat Time)
    r18 = render_story_card(
        out_dir, "slot18_reel_cover_wendy.png",
        "Colors in the Catskills: Keep Your Training Sharp",
        "Visiting Hunter or Windham for the autumn festivals? Maintain your training momentum. 5 visitor spots open for Saturday at 10:30 AM No-Gi. Clean mats, Clockwork NYC lineage, 6045 Main St.",
        exterior_photo, logo_img, badge="VISITOR PASS • SAT 10:30 AM"
    )
    rendered_cards.append({
        'slot': 18, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Weekend Wendy',
        'file': r18, 'caption': '07:30 AM Short-Form Reel: Catskills fall visitors & Saturday morning No-Gi visitor passes',
        'destination': 'https://senseisandy.com/options-pricing?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-18-wendy'
    })

    # 2. SLOT #19: REEL COVER CARD (Beginner Ben - Tournament Crucible Proof)
    r19 = render_story_card(
        out_dir, "slot19_reel_cover_ben.png",
        "Why Competition Makes Beginner Coaching Safer",
        "When a coach tests technique under live pressure, they know exactly what protects your joints. Enjoy cooperative partner pacing and guided coaching from day one.",
        adult_photo, logo_img, badge="CRUCIBLE PROOF • ADULT 6 PM"
    )
    rendered_cards.append({
        'slot': 19, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Beginner Ben',
        'file': r19, 'caption': '11:00 AM Short-Form Reel: Live tournament proof translates directly into safer beginner coaching',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-19-ben'
    })

    # 3. SLOT #20: STATIC FEED AD (Coach-Mom Carla - Screen-Free Energy Reset)
    r20 = render_static_ad_portrait(
        out_dir, "slot20_static_ad_carla.png",
        "Quiet Confidence and Balance: Coached Kids BJJ.",
        "Mountain Top Parents: Looking for a screen-free hour where your child builds balance and focus? Youth classes teach safe falling mechanics, body leverage, and calm confidence through structured partner drills. 1st-Degree Black-Belt coach at 6045 Main St, Tannersville.",
        kids_photo, logo_img,
        "YOUTH BJJ • 6045 MAIN ST, TANNERSVILLE",
        "COMMENT START FOR FREE INTRO LINK",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 20, 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Coach-Mom Carla',
        'file': r20, 'caption': '02:00 PM Static Feed Ad: Screen-free youth routine, calm discipline, and safe falling mechanics',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=facebook&utm_campaign=ssbjj_2026-W38&utm_content=post-20-carla'
    })

    # 4. SLOT #21: WEEKEND HYPE STORY (Independent Ian - Mat Energy)
    r21 = render_story_card(
        out_dir, "slot21_story_ian.png",
        "Friday Energy on the Mats",
        "Youth & Teens at 5:00 PM.\nAdult Beginner Lane at 6:00 PM.\n\nEnd your week with a clear head, healthy energy, and a clean sweat. Text Sandy at (917) 736-8649 to reserve your spot.",
        mats_photo, logo_img, badge="FRIDAY MAT ENERGY"
    )
    rendered_cards.append({
        'slot': 21, 'type': 'Weekend Hype Story Card (1080x1920)', 'avatar': 'Independent Ian',
        'file': r21, 'caption': '04:30 PM Weekend Story: Friday mat momentum, community energy, and weekend reset',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=post-21-ian'
    })

    # 5. SLOT #22: REEL COVER CARD (Cross-Training Tyler - Snow Season Conditioning)
    r22 = render_story_card(
        out_dir, "slot22_reel_cover_tyler.png",
        "Snow Season Pre-Conditioning: Rotational Stability",
        "Build rotational hip stability, joint resilience, and dynamic balance for black diamond ski runs this winter through ground grappling.",
        adult_photo, logo_img, badge="PRE-SEASON CONDITIONING"
    )
    rendered_cards.append({
        'slot': 22, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Cross-Training Tyler',
        'file': r22, 'caption': '07:00 PM Short-Form Reel: Ski & snowboard pre-season joint durability and core stability',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-22-tyler'
    })

    # 6. GBP-04: GOOGLE BUSINESS PROFILE GRAPHIC (Weekend Visitor Drop-In)
    gbp4 = render_square_graphic(
        out_dir, "slot_gbp04_weekend_pass.png",
        "Weekend Visitor Passes: Saturday No-Gi at 10:30 AM",
        "Visiting Hunter or Windham for the weekend? Drop in for our Saturday 10:30 AM No-Gi class. Clean mats, welcoming room, and expert Clockwork NYC lineage technique at 6045 Main St, Tannersville.",
        exterior_photo, logo_img,
        "VISITOR PASS • TANNERSVILLE, NY",
        "SEE VISITOR OPTIONS",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'GBP-04', 'type': 'Google Business Profile Square (1080x1080)', 'avatar': 'Weekend Visitors & Tourists',
        'file': gbp4, 'caption': 'Day 4 GBP Post: Weekend visitor pass and Saturday morning No-Gi drop-in invitation',
        'destination': 'https://senseisandy.com/options-pricing?utm_source=google&utm_medium=organic&utm_campaign=gbp_post_04'
    })

    desc = "All 7 visual exports for Friday: Winning reference post, 3 Reel cover/title cards (Wendy Catskills visitor, Ben tournament proof, Tyler snow conditioning), 1 Static Feed Ad for Coach-Mom Carla (Screen-Free Routine), 1 Friday Hype Story card for Independent Ian, and 1 Google Business Profile (GBP-04) Weekend Visitor Pass Graphic."
    write_review_html(out_dir, date_str, "Friday", rendered_cards, desc)
    return rendered_cards

def render_saturday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig):
    rendered_cards = []

    # 0. ORIGINAL WINNING FB POST #2 CONVERTER
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative baseline (Post #2 Model)'
        })

    # 1. SLOT #23: STATIC FEED AD (Weekend Wendy - Visitor Drop-in)
    r23 = render_static_ad_portrait(
        out_dir, "slot23_static_ad_wendy.png",
        "Catskills Visitor Pass: Train on Vacation",
        "Visiting Hunter or Windham for the autumn foliage? Maintain your weekly training momentum on vacation. Sensei Sandy BJJ offers easy visitor drop-in passes. Weekday classes Mon / Tue / Wed / Fri at 6 PM and Saturday No-Gi at 10:30 AM at 6045 Main St.",
        exterior_photo, logo_img,
        "VISITOR PASS • 6045 MAIN ST",
        "SEE VISITOR OPTIONS",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 23, 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Weekend Wendy',
        'file': r23, 'caption': 'Static Feed Ad: Catskills fall foliage visitor drop-in passes (Weekday 6 PM & Sat 10:30 AM)',
        'destination': 'https://senseisandy.com/options-pricing?utm_source=social&utm_medium=meta&utm_campaign=ssbjj_2026-W38&utm_content=post-23-wendy'
    })

    # 2. SLOT #24: STUDIO WALKTHROUGH STORY CARD (Beginner Ben - Room Walkthrough)
    r24 = render_story_card(
        out_dir, "slot24_mat_tour_ben.png",
        "Tour Our Clean Mountaintop Studio",
        "Pristine mats. Clean space. Welcoming team.\n\nAdult Beginner Lane runs Mon / Tue / Wed / Fri at 6:00 PM.\n\nStep in and experience what cooperative coached learning feels like.",
        mats_photo, logo_img, badge="STUDIO WALKTHROUGH"
    )
    rendered_cards.append({
        'slot': 24, 'type': 'Story Card (1080x1920)', 'avatar': 'Beginner Ben',
        'file': r24, 'caption': 'Studio Walkthrough Story: Clean mats, stroller parking, welcoming room',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=post-24-ben'
    })

    # 3. SLOT #25: REEL COVER CARD (Family-Activity Frankie - Teen CalmMind)
    r25 = render_story_card(
        out_dir, "slot25_reel_cover_frankie.png",
        "Teens Staying Calm Under Pressure",
        "How martial arts teaches teenagers quiet emotional resilience, breathing, and body control under gentle physical resistance.",
        kids_photo, logo_img, badge="FAMILY TRAINING"
    )
    rendered_cards.append({
        'slot': 25, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Family-Activity Frankie',
        'file': r25, 'caption': '01:00 PM Reel: Teen emotional resilience and shared family training under one roof',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-25-frankie'
    })

    # 4. SLOT #26: STATIC FEED AD (Community Casey - Weekend Shift Decompression)
    r26 = render_static_ad_portrait(
        out_dir, "slot26_static_ad_casey.png",
        "Weekend Decompression for Mountain Crews",
        "For mountaintop hospitality, EMTs, teachers, and municipal teams: shake off shift fatigue with 45 minutes of pure physical focus. Supportive room, calm coaching, 6045 Main St.",
        adult_photo, logo_img,
        "COMMUNITY DECOMPRESSION",
        "COMMENT START FOR FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 26, 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Community Casey',
        'file': r26, 'caption': '05:00 PM Static Feed Ad: Shift worker decompression and weekend sweat',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=facebook&utm_campaign=ssbjj_2026-W38&utm_content=post-26-casey'
    })

    # 5. GBP-05: GOOGLE BUSINESS PROFILE SQUARE GRAPHIC (Casey / Shift Reset)
    gbp5 = render_square_graphic(
        out_dir, "slot_gbp05_shift_reset.png",
        "Mountaintop Shift Decompression & Adult BJJ",
        "Recharge after busy mountain shifts. Sensei Sandy BJJ provides cooperative beginner coaching in a welcoming, respectful environment at 6045 Main St, Tannersville.",
        exterior_photo, logo_img,
        "COMMUNITY ADULTS • TANNERSVILLE, NY",
        "RESERVE FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'GBP-05', 'type': 'Google Business Profile Square (1080x1080)', 'avatar': 'Community Casey',
        'file': gbp5, 'caption': 'Day 5 GBP Post: Weekend shift decompression and adult community training',
        'destination': 'https://senseisandy.com/schedule?utm_source=google&utm_medium=organic&utm_campaign=gbp_post_05'
    })

    desc = "All 6 visual exports for Saturday: Reference post, Wendy visitor static ad, Ben mat tour story card, Frankie teen resilience reel cover, Casey shift decompression static ad, and GBP-05 weekend community graphic."
    write_review_html(out_dir, date_str, "Saturday", rendered_cards, desc)
    return rendered_cards

def render_sunday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig):
    rendered_cards = []

    # 0. ORIGINAL WINNING FB POST #2 CONVERTER
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative baseline (Post #2 Model)'
        })

    # 1. SLOT #27: CAROUSEL SLIDES (Beginner Ben - Lower Back Mobility)
    s1 = render_carousel_slide(
        out_dir, 1, 3,
        "How Ground Grappling Restores Lower Back Mobility",
        [
            "Desk work and mountain driving cause chronic hip tightness.",
            "Passive stretching provides only temporary relief.",
            "Swipe to see how active mat movement restores lasting mobility."
        ],
        adult_photo, logo_img, slot_prefix="slot27"
    )
    rendered_cards.append({
        'slot': 27, 'type': 'Carousel Slide 1/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s1, 'caption': 'Slide 1: Mobility mechanics over 35'
    })

    s2 = render_carousel_slide(
        out_dir, 2, 3,
        "Active Hip Escapes and Bridge Mechanics",
        [
            "BJJ movements strengthen deep spinal stabilizers naturally.",
            "Gentle hip bridges restore functional pelvic alignment.",
            "You move through full range of motion with cooperative coaching."
        ],
        mats_photo, logo_img, slot_prefix="slot27"
    )
    rendered_cards.append({
        'slot': 27, 'type': 'Carousel Slide 2/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s2, 'caption': 'Slide 2: Core stability and bridge mechanics'
    })

    s3 = render_carousel_slide(
        out_dir, 3, 3,
        "Rebuild Athletic Durability Over 35",
        [
            "Adult Beginner Lane runs Monday, Tuesday, Wednesday, Friday at 6 PM.",
            "Saturday morning No-Gi at 10:30 AM.",
            "First class is FREE. Comment START for the sign-up link."
        ],
        exterior_photo, logo_img, slot_prefix="slot27"
    )
    rendered_cards.append({
        'slot': 27, 'type': 'Carousel Slide 3/3 (1080x1350)', 'avatar': 'Beginner Ben',
        'file': s3, 'caption': 'Slide 3: Direct conversion micro-commitment'
    })

    # 2. SLOT #28: STORY POLL CARD (Coach-Mom Carla - Weekly Youth Reset)
    r28 = render_story_card(
        out_dir, "slot28_story_poll_carla.png",
        "Holding 2 Spots for This Week's Youth BJJ",
        "Monday & Tuesday at 5:00 PM.\n\nScreen-free movement, safe falling, and playful balance drills for ages 5-15.\n\nComment START to reserve your child's first visit.",
        kids_photo, logo_img, badge="WEEKLY RESET POLL"
    )
    rendered_cards.append({
        'slot': 28, 'type': 'Story Card (1080x1920)', 'avatar': 'Coach-Mom Carla',
        'file': r28, 'caption': '12:00 PM Story Poll: Holding 2 new student slots for youth classes',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W38&utm_content=post-28-carla'
    })

    # 3. SLOT #29: REEL COVER CARD (Coach-Mom Carla - First 5 Minutes)
    r29 = render_story_card(
        out_dir, "slot29_reel_cover_carla.png",
        "A Child's First Five Minutes on the Mat",
        "Safe breakfalls, the turtle roll game, and high fives. Warm, play-based coaching for mountain kids in Tannersville.",
        kids_photo, logo_img, badge="YOUTH INTRO"
    )
    rendered_cards.append({
        'slot': 29, 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Coach-Mom Carla',
        'file': r29, 'caption': '03:30 PM Reel: First five minutes on the mats walkthrough',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W38&utm_content=post-29-carla'
    })

    # 4. SLOT #30: STATIC FEED AD SQUARE (Beginner Ben Retargeting)
    r30 = render_square_graphic(
        out_dir, "slot30_static_ad_ben.png",
        "Monday Starts Tomorrow: Beginner Lane at 6 PM",
        "Two spots open for Monday's Adult Beginner Lane. Cooperative coached movement from day one with respectful partners at 6045 Main St. Comment START to reserve.",
        adult_photo, logo_img,
        "ADULT BEGINNER LANE • 6:00 PM",
        "COMMENT START FOR FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 30, 'type': 'Static Feed Ad (1080x1080)', 'avatar': 'Beginner Ben',
        'file': r30, 'caption': '06:00 PM Static Feed Ad: Monday starts tomorrow retargeting',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=meta&utm_campaign=ssbjj_2026-W38&utm_content=post-30-ben'
    })

    # 5. GBP-06: GOOGLE BUSINESS PROFILE SQUARE GRAPHIC (Ben / Beginner Schedule)
    gbp6 = render_square_graphic(
        out_dir, "slot_gbp06_monday_kickoff.png",
        "Step Into the Beginner Lane This Week",
        "Looking for a fresh fitness routine? Adult BJJ classes run Mon / Tue / Wed / Fri at 6:00 PM. Cooperative movement, pure leverage, clean mats. 6045 Main St, Tannersville.",
        mats_photo, logo_img,
        "WEEKLY SCHEDULE • TANNERSVILLE, NY",
        "RESERVE FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'GBP-06', 'type': 'Google Business Profile Square (1080x1080)', 'avatar': 'Beginner Ben',
        'file': gbp6, 'caption': 'Day 6 GBP Post: Weekly adult beginner schedule kickoff',
        'destination': 'https://senseisandy.com/schedule?utm_source=google&utm_medium=organic&utm_campaign=gbp_post_06'
    })

    desc = "All 8 visual exports for Sunday: Reference post, 3-slide mobility carousel for Beginner Ben, Carla youth reset story card, Carla first 5 mins reel cover, Ben Monday retargeting square ad, and GBP-06 schedule kickoff graphic."
    write_review_html(out_dir, date_str, "Sunday", rendered_cards, desc)
    return rendered_cards

def render_monday(out_dir, date_str, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig):
    rendered_cards = []

    # 0. ORIGINAL WINNING FB POST #2 CONVERTER
    if fb_converter_orig.exists():
        shutil.copy(fb_converter_orig, out_dir / 'reference_post2_converter.jpg')
        rendered_cards.append({
            'slot': 'REF', 'type': 'Original Winning Ad Asset', 'avatar': 'Coach Sandy',
            'file': 'reference_post2_converter.jpg', 'caption': 'The original winning creative baseline (Post #2 Model)'
        })

    # 1. SLOT W39-01: STATIC FEED AD (Coach-Mom Carla - HTC Screen Reset)
    w01 = render_static_ad_portrait(
        out_dir, "slot_w39_01_static_carla.png",
        "Mountain Top Moms: Afternoon Screen Reset at 5 PM",
        "After hours of Chromebooks and desk sitting, give your child a joyful physical outlet. Play-based lessons, safe falling drills, and quiet confidence at 6045 Main St, Tannersville.",
        kids_photo, logo_img,
        "HTC AFTER-SCHOOL RESET",
        "COMMENT START FOR FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'W39-01', 'type': 'Static Feed Ad (1080x1350)', 'avatar': 'Coach-Mom Carla',
        'file': w01, 'caption': '07:30 AM Static Feed Ad: Screen-free youth afternoon routine at 5 PM',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W39&utm_content=post-01-carla'
    })

    # 2. SLOT W39-02: REEL COVER CARD (Beginner Ben - Meet Pressure With Angle)
    w02 = render_story_card(
        out_dir, "slot_w39_02_reel_cover_ben.png",
        "Mechanical Leverage: Meet Pressure With an Angle",
        "Why redirecting force with an angle step beats pushing back. Master mechanical balance in our Beginner Lane.",
        adult_photo, logo_img, badge="PHYSICS OVER MUSCLE"
    )
    rendered_cards.append({
        'slot': 'W39-02', 'type': 'Reel Cover / Title Card (1080x1920)', 'avatar': 'Beginner Ben',
        'file': w02, 'caption': '12:00 PM Reel: Physics over muscle and angle redirection',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=reels&utm_campaign=ssbjj_2026-W39&utm_content=post-02-ben'
    })

    # 3. SLOT W39-03: STORY POLL CARD (Coach-Mom Carla - Screen Burnout)
    w03 = render_story_card(
        out_dir, "slot_w39_03_story_poll_carla.png",
        "Afternoon Screen Fatigue Check",
        "Does your child need an active energy reset after school?\n\n[ A ] Yes, screen fatigue is real\n[ B ] Need an active outlet\n\nYouth BJJ begins today at 5:00 PM!",
        kids_photo, logo_img, badge="AFTERNOON RESET POLL"
    )
    rendered_cards.append({
        'slot': 'W39-03', 'type': 'Story Card (1080x1920)', 'avatar': 'Coach-Mom Carla',
        'file': w03, 'caption': '03:30 PM Story Poll: Afternoon screen fatigue check and 5 PM class invite',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=instagram&utm_campaign=ssbjj_2026-W39&utm_content=post-03-carla'
    })

    # 4. SLOT W39-04: STATIC FEED AD SQUARE (Community Casey - Shift Reset)
    w04 = render_square_graphic(
        out_dir, "slot_w39_04_static_casey.png",
        "Monday Evening Decompression at 6 PM",
        "Clear your mental slate after Monday's shift. 45 minutes of cooperative grappling movement where work stress clears away. Respectful room, supportive coaching, 6045 Main St.",
        exterior_photo, logo_img,
        "SHIFT DECOMPRESSION • 6:00 PM",
        "COMMENT START FOR FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'W39-04', 'type': 'Static Feed Ad (1080x1080)', 'avatar': 'Community Casey',
        'file': w04, 'caption': '06:30 PM Static Feed Ad: Shift worker decompression at 6 PM',
        'destination': 'https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=social&utm_medium=facebook&utm_campaign=ssbjj_2026-W39&utm_content=post-04-casey'
    })

    # 5. GBP-07: GOOGLE BUSINESS PROFILE SQUARE GRAPHIC (Casey - Evening Schedule)
    gbp7 = render_square_graphic(
        out_dir, "slot_gbp07_evening_classes.png",
        "Evening Martial Arts Schedule in Tannersville",
        "Youth and Teens at 5:00 PM. Adults at 6:00 PM. Coached learning for families and beginners on Main Street. First class is free.",
        mats_photo, logo_img,
        "TANNERSVILLE MARTIAL ARTS",
        "RESERVE FREE INTRO",
        "SenseiSandy.com • Text (917) 736-8649"
    )
    rendered_cards.append({
        'slot': 'GBP-07', 'type': 'Google Business Profile Square (1080x1080)', 'avatar': 'Community Casey',
        'file': gbp7, 'caption': 'Day 7 GBP Post: Evening schedule for youth and adults under one roof',
        'destination': 'https://senseisandy.com/schedule?utm_source=google&utm_medium=organic&utm_campaign=gbp_post_07'
    })

    desc = "All 6 visual exports for Monday: Reference post, Carla screen reset static ad, Ben force-angle reel cover, Carla screen burnout story card, Casey shift decompression square ad, and GBP-07 evening schedule graphic."
    write_review_html(out_dir, date_str, "Monday", rendered_cards, desc)
    return rendered_cards

def main():
    parser = argparse.ArgumentParser(description="Render all graphics for a specific day")
    parser.add_argument('--day', default='auto', help="Day of the week (Monday, Tuesday, Thursday, Friday, Saturday, Sunday, or auto)")
    parser.add_argument('--date', default=datetime.date.today().strftime('%Y-%m-%d'), help="Calendar date YYYY-MM-DD")
    args = parser.parse_args()

    # Determine day name if auto
    if args.day.lower() == 'auto':
        parsed_date = datetime.datetime.strptime(args.date, '%Y-%m-%d').date()
        target_day = parsed_date.strftime('%A')
    else:
        target_day = args.day.capitalize()

    day_dir_name = f"{target_day.lower()}-{args.date}"
    out_dir = OUTPUT_ROOT / day_dir_name
    out_dir.mkdir(parents=True, exist_ok=True)

    # Load logo
    logo_path = ROOT / '../../src/assets/img/brand/sensei-sandy-bjj-logo-256.png'
    logo_img = Image.open(logo_path).convert('RGBA')

    # Photos
    adult_photo = ROOT / '../../src/assets/images/Screenshot_20260810_071208_YouTube-1600.webp'
    kids_photo = ROOT / '../../src/assets/images/class-kids-coaching-1600.webp'
    exterior_photo = ROOT / '../../src/assets/images/studio/sensei-sandy-bjj-6045-main-street-tannersville-1024.webp'
    mats_photo = ROOT / '../../src/assets/images/studio/sensei-sandy-bjj-clean-training-mats-1024.webp'
    fb_converter_orig = ROOT / '../../assets/579885906_122131036268978766_4971907295913738560_n.jpg'
    if not fb_converter_orig.exists():
        fb_converter_orig = ROOT / 'output/tuesday-2026-09-15/reference_post2_converter.jpg'

    day_lower = target_day.lower()
    if day_lower == 'monday':
        cards = render_monday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)
    elif day_lower == 'tuesday':
        cards = render_tuesday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, fb_converter_orig)
    elif day_lower == 'thursday':
        cards = render_thursday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)
    elif day_lower == 'friday':
        cards = render_friday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)
    elif day_lower == 'saturday':
        cards = render_saturday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)
    elif day_lower == 'sunday':
        cards = render_sunday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)
    else:
        print(f"Day '{target_day}' defaulting to Thursday production render.")
        cards = render_thursday(out_dir, args.date, logo_img, adult_photo, kids_photo, exterior_photo, mats_photo, fb_converter_orig)

    print(f"Successfully rendered {len(cards)} graphics for {target_day} ({args.date}): {out_dir.resolve()}")

if __name__ == '__main__':
    main()

