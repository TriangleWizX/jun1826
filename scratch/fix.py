import re
from pathlib import Path

file_path = Path("local-bjj-tournaments-for-parents.html")
html_content = file_path.read_text(encoding="utf-8")

# 1. Remove the incorrectly placed includes
html_content = html_content.replace("""  </script>

<!--#include virtual="/cta-footer.html" -->
</main>

<!--#include virtual="/footer-include.html" -->

    "west-hempstead-ny": [""", """  const FOOD_BY_KEY = {
    "west-hempstead-ny": [""")

# Now the script tag should be open from `const TOURNAMENT_DATA` all the way to the end.
# Wait, the closing `</script>` tag is currently at the very end before the defer scripts.
# Let's check what's at the end of the script block.

