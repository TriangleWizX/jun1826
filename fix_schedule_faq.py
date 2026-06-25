import re
with open('schedule.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Most first visits start at 5:00 PM for youth or 6:00 PM for adults, with Private Lesson on Tuesday and Thursday at 6:30 AM, Private Lesson on Wednesday and Friday at 10:00 AM, and Saturday Adult No-Gi at 10:30 AM.", "Most first visits start at 5:00 PM for youth or 6:00 PM for adults. Saturday Adult No-Gi is at 10:30 AM.")
content = content.replace("Morning availability is private lessons only on Tuesday and Thursday at 6:30 AM and Wednesday and Friday at 10:00 AM.", "Morning availability is reserved for private lessons.")

with open('schedule.html', 'w', encoding='utf-8') as f:
    f.write(content)
