import os
import glob
import re

def clean_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove START_TRAINING_LINKS section
    content = re.sub(r'<!-- START_TRAINING_LINKS_START -->.*?<!-- START_TRAINING_LINKS_END -->\n?', '', content, flags=re.DOTALL)

    # Remove RELATED_POSTS section
    content = re.sub(r'<!-- RELATED_POSTS_START -->.*?<!-- RELATED_POSTS_END -->\n?', '', content, flags=re.DOTALL)

    # Remove CLUSTER_LINKS_START and the section following it
    content = re.sub(r'<!-- CLUSTER_LINKS_START -->\s*<section[^>]*aria-label="Related topic links"[^>]*>.*?</section>\n?', '', content, flags=re.DOTALL)

    # Remove the orphaned CLUSTER_LINKS_END
    content = re.sub(r'<!-- CLUSTER_LINKS_END -->\n?', '', content)

    # Remove external style sheets bleeding behavior
    content = re.sub(r'<link href="/assets/css/evidence[^>]*>\n?', '', content)
    content = re.sub(r'<link href="/assets/css/schedule-consistency[^>]*>\n?', '', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

blog_files = glob.glob('blog/*/index.html')
for b in blog_files:
    clean_file(b)
print(f"Cleaned {len(blog_files)} files")
