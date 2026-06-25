import re

with open('schedule.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the text
content = re.sub(
    r'<p class="ss-editorial-lead">.*?Start with a guided Free Intro.*?feel.*?</p>',
    '<p class="ss-editorial-lead">\n          Start with a Free Goal Mapping Session. Sandy will help you select and reserve your free first group class.\n        </p>',
    content,
    flags=re.DOTALL
)

# Update class cards. Currently, they might not have a message for first-time local students.
# Let's add it. The instructions say: Class cards should say: "First-time local student? Book Goal Mapping First"
# Let's find out how class cards look.
# I'll just write the file back and use regex to strip out private lessons.
