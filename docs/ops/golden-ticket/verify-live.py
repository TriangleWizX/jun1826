"""Read-only release check. Keep private server paths out of public reports."""
from pathlib import Path
import importlib.util
import json
import posixpath
import hashlib
import shlex
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[3]
out = root / '.tmb/shiney-st-release/full-policy-check'
out.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('release', root / 'scripts/deploy-release.py')
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)
paths = json.loads((root / 'docs/ops/golden-ticket/release-paths.json').read_text())
cfg = json.loads((root / '.vscode/sftp.json').read_text())
verified = []
client = release.connect(cfg)
try:
    sftp = client.open_sftp()
    for rel in paths:
        expected = (root / 'dist' / rel).read_bytes()
        with sftp.open(posixpath.join(cfg['remotePath'], rel), 'rb') as source:
            actual = source.read()
        assert actual == expected, rel
        verified.append({'path':rel,'bytes':len(actual),'sha256':hashlib.sha256(actual).hexdigest()})
    sftp.close()
    inventory = release.backup_inventory(client, cfg)
    backups = sorted((b for b in inventory if b['location']=='home'), key=lambda b:b['mtime'], reverse=True)
    assert backups, 'A retained production backup is required'
    backup = backups[0]
    release.remote_run(client, 'gzip -t '+shlex.quote(backup['path']))
    members = set(release.remote_run(client, 'tar -tzf '+shlex.quote(backup['path'])).splitlines())
    required = {'./.htaccess','./index.html','./robots.txt','./sitemap.xml'}
    assert required <= members
    missing_rollback = [rel for rel in paths if './'+rel not in members]
    backup_proof = {'name':Path(backup['path']).name,'mtime':backup['mtime'],'bytes':backup['size'],'gzip_and_required_roots_valid':True,'payload_paths_absent_from_older_backup':missing_rollback}
    (out/'private-backup-pointer.json').write_text(json.dumps({'path':backup['path'],'proof':backup_proof},indent=2))
finally:
    client.close()

query = '?utm_source=member_referral&utm_medium=offline&utm_campaign=shiney_ticket&utm_content=st01'
routes = ['/', '/bring-a-friend'+query, '/bring-a-friend.html'+query]
for name in ['programs','contact','show-up-kit','how-class-works','options-pricing']:
    routes += ['/'+name,'/'+name+'.html']
routes += ['/options-pricing/', '/free-bjj-intro-tannersville-ny/', '/free-bjj-intro-tannersville-ny/index.html', '/free-bjj-intro-tannersville-ny/confirmation/', '/free-bjj-intro-tannersville-ny/confirmation/index.html']
for town in ['adults-tannersville','haines-falls','hunter','tannersville','windham']:
    prefix = '/bjj-classes/'+town+'-ny/'
    routes += [prefix,prefix+'index.html']
http = []
for route in routes:
    url = 'https://senseisandy.com'+route
    with urlopen(Request(url,headers={'User-Agent':'ShineyTicket-release-check','Cache-Control':'no-cache'}),timeout=30) as response:
        assert response.status == 200
        html = response.read().decode('utf-8')
        final = response.geturl()
    assert '[an error occurred while processing this directive]' not in html, route
    assert '{{ freeIntro.' not in html, route
    soup = BeautifulSoup(html,'html.parser')
    assert soup.title and soup.title.get_text(strip=True), route
    assert soup.find('meta',attrs={'name':'description'}), route
    assert soup.find('link',attrs={'rel':'canonical'}), route
    text = soup.get_text(' ',strip=True)
    assert 'Adult First Visits are not training' not in text, route
    if 'bring-a-friend' in route:
        assert 'utm_campaign=shiney_ticket' in final and 'utm_content=st01' in final
        for marker in ['Shiney Ticket','Four free classes in two weeks','day 14','The Sandy Challenge']:
            assert marker.lower() in text.lower(), (route,marker)
        assert 'Golden Ticket' not in text
        for name,value in [('offer_id','shiney_ticket'),('offer_classes','4'),('activation_event','first_attended_class')]:
            assert soup.find('input',attrs={'name':name})['value']==value
        assert soup.find('link',attrs={'rel':'canonical'})['href']=='https://senseisandy.com/bring-a-friend'
        assert soup.find('main')['data-shiney-release']=='2026-10-02'
        assert soup.find('form',id='friend-pass-form-shell')['action']=='https://formspree.io/f/myzpdvay'
    if route in ['/how-class-works','/how-class-works.html','/free-bjj-intro-tannersville-ny/','/free-bjj-intro-tannersville-ny/index.html']:
        assert 'The Sandy Challenge' in text and 'Sparring is live practice' in text, route
    if 'confirmation' not in route:
        assert any(marker in text for marker in ['Adults can choose to train that day','Then choose to train that day','Adults can choose to train after the visit']), route
    http.append({'route':route,'status':200,'final_url':final,'metadata':True,'expected_policy':True})
css = [p for p in paths if p.endswith('.css')]
for rel in css:
    with urlopen('https://senseisandy.com/'+rel,timeout=30) as response:
        assert response.status == 200
        assert response.read() == (root / 'dist' / rel).read_bytes()
result={'original_policy_release_commit':'d2a551ae','checked_card_prefix':'ST','remote_exact_bytes':verified,'http_routes':http,'css_exact_http_bytes':css,'backup':backup_proof,'real_form_submissions':0}
(out/'live-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'remote_files_verified':len(verified),'http_routes_passed':len(http),'css_http_verified':len(css),'retained_backup':backup_proof['name'],'real_form_submissions':0},indent=2))
