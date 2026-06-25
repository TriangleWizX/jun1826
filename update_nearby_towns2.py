with open("nearby-towns.html", "r") as f:
    content = f.read()

replacements = {
    "/assets/images/hero_exterior_1782405460053.jpg": "/assets/images/sensei-sandy-bjj-building-main-street.webp",
    "/assets/images/arrival_across_street_1782405470509.jpg": "/assets/images/sensei-sandy-bjj-building-main-street.webp",
    "/assets/images/arrival_front_door_1782405481275.jpg": "/assets/images/sensei-sandy-bjj-front-entrance.webp",
    "/assets/images/arrival_hallway_1782405493033.jpg": "/assets/images/sensei-sandy-bjj-second-floor-hallway.webp",
    "/assets/images/studio_interior_1782405513642.jpg": "/assets/images/sensei-sandy-bjj-clean-room-rebuilt.webp",
    "/assets/images/cleaning_poster_1782405534541.jpg": "/assets/images/sensei-sandy-bjj-mat-cleaning-poster.webp",
    "/assets/images/parking_view_1782405522745.jpg": "/assets/images/sensei-sandy-bjj-parking-tannersville.webp"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open("nearby-towns.html", "w") as f:
    f.write(content)
