import os
import glob
import re

def remove_schedule_include(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the include
    content = re.sub(r'<!--#include virtual="/partials/schedule-consistency\.html" -->\n?', '', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

blog_files = glob.glob('blog/*/index.html')
for b in blog_files:
    remove_schedule_include(b)
print(f"Removed schedule-consistency include from {len(blog_files)} files")
