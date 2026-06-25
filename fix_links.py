import json
import glob
import re

with open("config/legacy-redirects.json", "r") as f:
    redirects = json.load(f)["redirects"]

files = glob.glob("**/*.html", recursive=True) + glob.glob("**/*.py", recursive=True)

for f in files:
    if "node_modules" in f or ".venv" in f: continue
    try:
        with open(f, "r") as file:
            content = file.read()
            
        original_content = content
        
        # fix legacy redirects
        for old, new in redirects.items():
            content = content.replace(f'href="{old}"', f'href="{new}"')
            content = content.replace(f'href="{old}#', f'href="{new}#')
            content = content.replace(f"href='{old}'", f"href='{new}'")
            content = content.replace(f"href='{old}#", f"href='{new}#")
            
        # fix trailing slash non-root (e.g. href="/blog/" -> href="/blog")
        content = re.sub(r'href="(/[^/]+(?:/[^/]+)*)"', r'href="\1"', content)
        content = re.sub(r"href='(/[^/]+(?:/[^/]+)*)/'", r"href='\1'", content)
        
        if content != original_content:
            with open(f, "w") as file:
                file.write(content)
            print(f"Updated {f}")
    except Exception as e:
        print(f"Failed on {f}: {e}")
