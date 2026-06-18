import re
import os

base_dir = "/home/twizss/Documents/ssbjjweb/tmb"
files = [
    "index.html",
    "programs.html",
    "kids.html",
    "teens.html",
    "adult-bjj.html",
    "schedule.html",
    "options-pricing.html",
    "book-free-intro/index.html"
]

def add_class(tag_str, new_classes):
    # Check if class attribute exists
    if re.search(r'class=["\']', tag_str):
        # Insert new classes
        return re.sub(r'(class=["\'])([^"\']*)', r'\1' + new_classes + r' \2', tag_str, count=1)
    else:
        # Add class attribute before the closing bracket
        return re.sub(r'(/?>)$', r' class="' + new_classes + r'" \1', tag_str)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add d-flex flex-column to main
    def main_repl(match):
        tag = match.group(0)
        if 'd-flex' not in tag:
            return add_class(tag, "d-flex flex-column")
        return tag
    
    content = re.sub(r'<main[^>]*>', main_repl, content)

    # Dictionary of order classes
    # Mobile: Hero (1), FirstClass (2), Lanes (3), Schedule (4), Proof (5), Pricing (6), Helper (7), CTA (8)
    # Desktop: Hero (1), Lanes (2), FirstClass (3), Schedule (4), Proof (5), Pricing (6), Helper (7), CTA (8)
    
    # We will identify sections by matching certain strings or classes
    
    # Let's do a heuristic replacement
    # Split the main content to process top-level tags? Too hard with regex.
    # We will just search for section tags that contain specific identifiers and add classes to them.
    
    identifiers = {
        'hero': ('order-1 w-100', [r'<section[^>]*ss-hero[^>]*>', r'<header[^>]*ss-hero[^>]*>']),
        'lanes': ('order-3 order-md-2 w-100', [r'<section[^>]*ss-section-soft[^>]*ss-lanes-title', r'<section[^>]*id="program-cards"', r'<section[^>]*ss-lane-chooser', r'<section[^>]*ss-link-bridge']),
        'first_class': ('order-2 order-md-3 w-100', [r'<section[^>]*ss-first-class[^>]*>', r'<section[^>]*day-one-title', r'<section[^>]*ss-first-class-steps']),
        'schedule': ('order-4 w-100', [r'<section[^>]*weekly-times-title', r'<section[^>]*ss-weekly-schedule']),
        'pricing': ('order-6 w-100', [r'<section[^>]*ss-pricing', r'<section[^>]*program-pricing-title', r'<section[^>]*core-culture']),
        'helper': ('order-7 w-100', [r'<section[^>]*ss-local-learn', r'<section[^>]*ss-book-location', r'<section[^>]*ss-local-guides', r'<section[^>]*ss-faq', r'<section[^>]*ss-local-block', r'<section[^>]*program-objections-title']),
        'misc': ('order-last w-100', [r'<section[^>]*ss-saturday-feature', r'<section[^>]*ss-free-intro-flow', r'<section[^>]*ss-book-intro', r'<section[^>]*ss-book-form-section', r'<section[^>]*ss-calendly-section', r'<section[^>]*ss-book-flow'])
    }
    
    for key, (classes, patterns) in identifiers.items():
        for pattern in patterns:
            def repl(m):
                tag = m.group(0)
                if 'order-' not in tag:
                    return add_class(tag, classes)
                return tag
            content = re.sub(pattern, repl, content)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        process_file(path)
        print(f"Processed {f}")

# Now update the includes
includes = [
    ("schedule-block.html", "order-4 w-100", r'<section[^>]*schedule-block[^>]*>'),
    ("partials/reviews-village.html", "order-5 w-100", r'<section[^>]*ss-reviews-village[^>]*>'),
    ("cta-footer.html", "order-8 w-100", r'<section[^>]*ss-cta-footer[^>]*>')
]

for inc, classes, pattern in includes:
    path = os.path.join(base_dir, inc)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        def repl(m):
            tag = m.group(0)
            if 'order-' not in tag:
                return add_class(tag, classes)
            return tag
        content = re.sub(pattern, repl, content)
        # cta-footer might not have section? Let's check it.
        # It's an article inside a section? Let's verify.
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed include {inc}")

