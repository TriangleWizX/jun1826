import os

replacements = [
    # bjj-classes-adults-tannersville-ny.html
    ("Safe &amp; Supportive", "Supportive"),
    ("Safe & Supportive", "Supportive"),
    ("Calm mind, strong body", "Strong body"),
    ("Calm mind. Strong body. Better life.", "Strong body. Better life."),
    ("moving safely before intensity", "moving before intensity"),
    ("cooperative partner learning and safety from day one", "cooperative partner learning from day one"),
    ("make training safer, calmer, and more connected", "make training more connected"),
    ("Beginner-Safe Coaching", "Beginner Coaching"),
    ("Safe, smart, and supportive", "Smart and supportive"),
    ("Calm Leader", "Leader"),
    ("calm pressure", "steady pressure"),
    
    # general pruning phrases (if found elsewhere)
    ("safe, calm environment", "welcoming environment"),
    ("safe and calm", "welcoming"),
    ("calm and safe", "welcoming"),
    ("beginner-safe", "beginner-friendly"),
]

target_files = [
    "bjj-classes-adults-tannersville-ny.html",
    "nervous-first-timers.html",
    "safety.html",
    "scribners.html"
]

for file in target_files:
    if os.path.exists(file):
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)
            
        if content != original_content:
            with open(file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {file}")
