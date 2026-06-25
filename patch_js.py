import re

for filename in ['js/progressive-booking.js', 'js/progressive-booking.35bd48.js']:
    with open(filename, 'r') as f:
        content = f.read()
    
    # Update Audience click
    content = content.replace(
        "state.audience = e.currentTarget.getAttribute('data-audience');",
        "e.preventDefault(); const target = e.currentTarget; state.audience = target.getAttribute('data-audience');"
    )
    
    # Update Lane click
    content = content.replace(
        "state.lane = e.currentTarget.getAttribute('data-lane');",
        "e.preventDefault(); const target = e.currentTarget; state.lane = target.getAttribute('data-lane');"
    )
    
    # Update Back click
    content = content.replace(
        "const stepNum = parseInt(e.currentTarget.getAttribute('data-back-to'), 10);",
        "e.preventDefault(); const stepNum = parseInt(e.currentTarget.getAttribute('data-back-to'), 10);"
    )
    
    with open(filename, 'w') as f:
        f.write(content)
    print(f"Patched {filename}")
