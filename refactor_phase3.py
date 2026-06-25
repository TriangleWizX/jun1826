import json
import os

filepath = 'data/near-decision-content.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for town_slug, town_data in data.items():
    # Attempt to derive town name from slug for the text. 
    # e.g. "hunter-ny" -> "Hunter"
    town_name = town_slug.replace('-ny', '').replace('-', ' ').title()
    
    new_proof_items = [
        {
            "title": "Where do families park?",
            "text": "Ample parking available right behind the building on Main Street."
        },
        {
            "title": "How long does the drive usually feel?",
            "text": f"A scenic drive up the mountain from {town_name}."
        },
        {
            "title": "Which class works best after school or work?",
            "text": "The Youth Class or Adult Class fits perfectly after a standard workday or school day."
        },
        {
            "title": "What happens when weather changes plans?",
            "text": "We text all students and update Instagram if mountain roads get too snowy."
        },
        {
            "title": "Can seasonal residents train intermittently?",
            "text": "Yes, our training structure accommodates seasonal visits. Standard drops-in or punch passes are ideal for weekenders."
        }
    ]
    
    # Check for specific wording for towns like Windham or Catskill if needed, but generic is fine for now
    town_data['proof_items'] = new_proof_items

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Updated data/near-decision-content.json")
