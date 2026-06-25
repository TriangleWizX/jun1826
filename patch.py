import re

with open('free-bjj-intro-tannersville-ny/index.html', 'r') as f:
    content = f.read()

style_block = """
    <style>
      .ss-progressive-booking {
        padding: 4rem 0;
        background: linear-gradient(180deg, rgba(251, 250, 248, 0.98), rgba(255, 255, 255, 0.96));
        border-top: 1px solid rgba(54, 43, 36, 0.08);
      }
      .pb-step { transition: opacity 0.3s ease, transform 0.3s ease; }
      .pb-step-hidden { opacity: 0; transform: translateY(10px); pointer-events: none; }
      .pb-step-active { opacity: 1; transform: translateY(0); pointer-events: auto; }
      .pb-card-btn {
        background: #FFFFFF; border: 1px solid rgba(54, 43, 36, 0.12);
        border-radius: 20px; padding: 2rem 1.5rem; text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: pointer; box-shadow: 0 10px 30px rgba(54, 43, 36, 0.04);
        display: block; width: 100%; height: 100%;
      }
      .pb-card-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(54, 43, 36, 0.08); border-color: var(--ss-green); }
      .pb-card-icon {
        width: 64px; height: 64px; margin: 0 auto 1.5rem; border-radius: 50%;
        background: rgba(40, 159, 161, 0.08); display: flex; align-items: center; justify-content: center;
        color: var(--ss-teal);
      }
      .pb-card-btn h3 { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: 1.25rem; color: var(--ss-ink); margin-bottom: 0.25rem; }
      .pb-card-btn p { color: var(--ss-muted); font-size: 0.9rem; margin: 0; }
      .pb-back-btn { color: var(--ss-slate); font-weight: 600; padding: 0; border: none; background: transparent; cursor: pointer; margin-bottom: 1rem; }
      .pb-back-btn:hover { color: var(--ss-green); }
      .pb-lanes { display: flex; flex-wrap: wrap; }
    </style>
"""

# Insert right before </head>
if '</head>' in content:
    content = content.replace('</head>', style_block + '</head>')
    with open('free-bjj-intro-tannersville-ny/index.html', 'w') as f:
        f.write(content)
    print("Patched index.html")
else:
    print("Could not find </head>")
