import os

replacements = {
    "There is skill-based resistance activities begin at the right pace from day one.": "Skill-based resistance activities begin at the right pace from day one.",
    "leadership,more than skill": "leadership, more than skill",
    "What should I expect on my first class?": "What should I expect in my first class?",
    "Confident Starts Here": "Confidence Starts Here",
    "bring yourself.": "Bring yourself.",
    "no hard sparring day one": "skill-based resistance activities begin at the right pace from day one"
}

for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith((".html", ".mjs", ".json", ".md")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception:
                continue
                
            original_content = content
            for old, new in replacements.items():
                content = content.replace(old, new)
                
            if content != original_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {path}")
