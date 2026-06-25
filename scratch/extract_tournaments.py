import bs4
import json
import re
from pathlib import Path

file_path = Path("local-bjj-tournaments-for-parents.html")
soup = bs4.BeautifulSoup(file_path.read_text(encoding="utf-8"), "html.parser")

events = []

for row in soup.find_all("article", class_="ss-event-row"):
    event = {}
    event["type"] = row.get("data-type", "")
    event["foodKey"] = row.get("data-food-key", "")
    
    title_el = row.find(class_="tournament-title")
    event["title"] = title_el.get_text(strip=True) if title_el else ""
    
    desc_el = row.find(class_="tournament-desc")
    event["description"] = desc_el.get_text(strip=True) if desc_el else ""
    
    badge_el = row.find(class_="badge-tag")
    if badge_el:
        event["badgeText"] = badge_el.get_text(strip=True)
        event["badgeClass"] = " ".join([c for c in badge_el.get("class", []) if c != "badge-tag"])
    
    date_el = row.find("i", class_="bi-calendar-event")
    if date_el and date_el.parent:
        event["dateString"] = date_el.parent.get_text(strip=True)
        
    loc_el = row.find("i", class_="bi-geo-alt")
    if loc_el and loc_el.parent:
        event["location"] = loc_el.parent.get_text(strip=True)
        
    verify_el = row.find("a", class_="btn-verify-event")
    if verify_el:
        event["url"] = verify_el.get("href", "")
        
    events.append(event)

with open("scratch/tournaments.json", "w", encoding="utf-8") as f:
    json.dump(events, f, indent=2)

print(f"Extracted {len(events)} events.")
