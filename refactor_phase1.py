import os
import re

replacements = [
    # Sparring
    (re.compile(r'(?i)no hard sparring required on day one'), 'skill-based resistance activities begin at the right pace from day one'),
    (re.compile(r'(?i)no hard sparring day one'), 'skill-based resistance activities begin at the right pace from day one'),
    (re.compile(r'(?i)no hard sparring required'), 'skill-based resistance activities begin at the right pace from day one'),
    (re.compile(r'(?i)no hard sparring'), 'skill-based resistance activities begin at the right pace from day one'),

    # Ego
    (re.compile(r'(?i)zero ego\.?'), 'Respectful, cooperative training.'),
    (re.compile(r'(?i)ego-free room'), 'Respectful, cooperative training'),

    # Fight-gym
    (re.compile(r'(?i)fight-gym environment'), 'calm, coach-led technical training'),
    (re.compile(r'(?i)fight-gym pressure'), 'calm, coach-led technical training'),

    # Nervous beginner
    (re.compile(r'(?i)nervous beginners'), 'first-time students'),
    (re.compile(r'(?i)nervous beginner'), 'first-time student'),

    # Low-chaos
    (re.compile(r'(?i)low-chaos indoor routine'), 'dependable weekly routine'),
    (re.compile(r'(?i)low-chaos routine'), 'dependable weekly routine'),

    # Intensity
    (re.compile(r'(?i)forced pressure'), 'You control your pace as coaching gradually adds challenge'),
    (re.compile(r'(?i)forced into intensity'), 'You control your pace as coaching gradually adds challenge'),

    # Test
    (re.compile(r'(?i)not a test'), 'a guided learning experience'),
]

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root or ".venv" in root or "tmp" in root or "archive" in root:
        continue
    for file in files:
        if file.endswith((".html", ".mjs", ".js", ".json", ".md")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception:
                continue
                
            original_content = content
            for regex, new_str in replacements:
                def repl_func(match):
                    matched = match.group(0)
                    if matched[0].isupper():
                        return new_str[0].upper() + new_str[1:]
                    return new_str
                content = regex.sub(repl_func, content)
                
            if content != original_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {path}")
