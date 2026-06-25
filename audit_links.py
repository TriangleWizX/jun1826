import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

def crawl_and_audit(start_url):
    visited = set()
    to_visit = [start_url]
    base_domain = urlparse(start_url).netloc
    
    flagged_links = []
    
    print(f"Starting crawl of {start_url}...\n")
    
    while to_visit:
        current_url = to_visit.pop(0)
        if current_url in visited:
            continue
            
        visited.add(current_url)
        print(f"Crawling: {current_url}")
        
        try:
            response = requests.get(current_url, timeout=10)
            
            # If the page redirects, we want to note that
            if len(response.history) > 0:
                print(f"  Note: {current_url} redirected to {response.url}")
            
            # We only want to parse HTML pages
            if 'text/html' not in response.headers.get('Content-Type', ''):
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                full_url = urljoin(response.url, href)
                parsed_url = urlparse(full_url)
                
                # Check if it's an internal link
                if parsed_url.netloc == base_domain:
                    # Flag if it points to an .html page (which are legacy/redirected)
                    if parsed_url.path.endswith('.html'):
                        flagged_links.append({
                            'source': response.url,
                            'target': full_url,
                            'anchor_text': link.get_text(strip=True)
                        })
                        
                    # Add to queue if not visited and is an internal page
                    # Avoiding static assets
                    if full_url not in visited and full_url not in to_visit:
                        if not parsed_url.path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.css', '.js', '.pdf', '.zip', '.mp4')):
                            to_visit.append(full_url)
                            
        except Exception as e:
            print(f"  Error crawling {current_url}: {e}")
            
        # Be polite to the server
        time.sleep(0.5) 
        
    print("\n" + "="*50)
    print("--- Audit Complete ---")
    print("="*50)
    
    # De-duplicate flags
    unique_flags = []
    seen_flags = set()
    for flag in flagged_links:
        flag_tuple = (flag['source'], flag['target'])
        if flag_tuple not in seen_flags:
            seen_flags.add(flag_tuple)
            unique_flags.append(flag)
            
    if unique_flags:
        print(f"Found {len(unique_flags)} internal links pointing to old .html pages:\n")
        for issue in unique_flags:
            print(f"[!] Source Page: {issue['source']}")
            print(f"    Points to : {issue['target']}")
            print(f"    Link Text : '{issue['anchor_text']}'\n")
    else:
        print("No internal links pointing to .html pages found! Your internal web is clean.")

if __name__ == "__main__":
    crawl_and_audit("https://senseisandy.com/")
