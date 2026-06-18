import re
import os

files = [
    "index.html",
    "programs.html",
    "kids.html",
    "teens.html",
    "adults.html",
    "schedule.html",
    "options-pricing.html",
    "book-free-intro/index.html"
]

base_dir = "/home/twizss/Documents/ssbjjweb/tmb"

for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        print(f"File {f} not found.")
        continue
        
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
        
    main_match = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL | re.IGNORECASE)
    if not main_match:
        print(f"No <main> tag found in {f}")
        continue
        
    main_content = main_match.group(1)
    
    # Find all top level sections and includes inside main
    # We will just do a rough extraction of direct children if possible, or all sections/includes
    elements = re.findall(r'(<section[^>]*>|<!--#include[^>]*-->|<header[^>]*>)', main_content, re.IGNORECASE)
    
    print(f"--- {f} ---")
    for el in elements:
        # try to get class or id
        match = re.search(r'(class|id)="([^"]*)"', el, re.IGNORECASE)
        ident = match.group(0) if match else "No class/id"
        if "include" in el:
            print(f"  {el}")
        else:
            tag = el.split()[0].replace('<', '')
            print(f"  <{tag} {ident}>")
            
print("Done.")
