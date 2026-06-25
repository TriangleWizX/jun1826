import re

with open('schedule.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove private lessons from schedule
content = re.sub(r'<div class="ss-cal-slot">\s*<span class="ss-cal-slot-time">6:30 AM</span>\s*<span class="ss-cal-slot-name">Private Lesson \(By Request\)</span>\s*</div>\s*', '', content)
content = re.sub(r'<div class="ss-cal-slot">\s*<span class="ss-cal-slot-time">10:00 AM</span>\s*<span class="ss-cal-slot-name">Private Lesson \(By Request\)</span>\s*</div>\s*', '', content)
content = re.sub(r'<div class="ss-cal-slot">\s*<span class="ss-cal-slot-time">All Day</span>\s*<span class="ss-cal-slot-name">Private Lessons / Closed</span>\s*</div>\s*', '<div class="ss-cal-slot">\n                <span class="ss-cal-slot-time">All Day</span>\n                <span class="ss-cal-slot-name">Closed</span>\n              </div>\n', content)

# For Thursday which had "Privates Only", we might just say "Closed" or remove the badge.
content = re.sub(r'<span class="ss-cal-day-badge">Privates Only</span>', '<span class="ss-cal-day-badge">Closed</span>', content)

# Change Reserve Free Intro to Book Free Goal Mapping
content = content.replace("Reserve Free Intro", "Book Free Goal Mapping")

# Change schema mention of private lessons
content = content.replace("and fixed morning private-lesson availability.", "")

# Add "First-time local student? Book Goal Mapping First" in some strategic place?
# "Class cards should say: First-time local student? Book Goal Mapping First"
# Let's insert it inside the anchor tags for Monday, Tuesday, Wednesday, Friday, Saturday?
# They are `<a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">`
content = re.sub(
    r'(<a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">)',
    r'\1\n              <div class="ss-cal-first-time" style="font-size: 0.8rem; color: var(--ss-green); margin-bottom: 0.5rem; text-align: center;">First-time local student? Book Goal Mapping First</div>',
    content
)

with open('schedule.html', 'w', encoding='utf-8') as f:
    f.write(content)

