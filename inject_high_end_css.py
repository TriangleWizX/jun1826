import os
import glob
import re

def inject_css(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # check if already injected
    if 'high-end-blog.css' in content:
        return

    # inject before </head>
    link_tag = '<link href="/assets/css/high-end-blog.css" rel="stylesheet"/>\n</head>'
    content = content.replace('</head>', link_tag)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

blog_files = glob.glob('blog/*/index.html')
for b in blog_files:
    inject_css(b)
print(f"Injected CSS into {len(blog_files)} files")
