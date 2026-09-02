#!/usr/bin/env python3
"""Deploy only generated files changed by a commit, atomically and resumably."""
import argparse, json, pathlib, posixpath, re, shlex, subprocess, tarfile, time
import paramiko

ROOT = pathlib.Path(__file__).resolve().parents[1]
SKIP_PREFIXES = ('.agents/', 'artifacts/', 'reports/', 'scripts/', 'docs/', '.vscode/', 'package')
DEPLOYABLE_ROOTS = ('assets/', 'admin/', 'athlete-cross-training/', 'back-to-school-bjj-tannersville/', 'fall-practice-reset/', 'bjj-classes/', 'bjj-glossary/', 'blog/', 'near/', 'partials/', 'js/', 'images/', 'img/', 'fonts/', 'downloads/', 'youtube/', 'yam/', 'yams/', 'external/', 'partners/', 'social/', 'snippets/', 'sources/', 'schedule/', 'free-bjj-intro-tannersville-ny/', 'options-pricing/', 'evidence/', 'hyphen-weekend/', '413/', 'api/')
ROOT_FILES = {'law-enforcement-bjj.html', 'tactical-longevity.html', 'phoenicia-diner.html', 'scribners.html', 'deer-mountain-inn.html', 'elite-concierge.html','.htaccess', 'index.html', 'robots.txt', 'sitemap.xml', 'sitemap-core.xml', 'sitemap-programs.xml', 'site-shell.html', 'nav-include.html', 'footer-include.html', 'report-card.html', 'weekly-audit.html', 'after-booking-promise.html', 'after-school.html', 'show-up-kit.html', 'contact.html', 'bjj_anatomy_game.html', 'core-promise-full.html', 'core-promise-short.html', 'birthday-parties.html', 'private-lessons.html', 'programs.html', 'options-pricing.html', 'bjj-faqs.html', 'how-class-works.html', 'parent-resources.html', 'hyphen-weekend.html', 'core-culture-parent-guide.html', 'core-culture-review.html', 'student-hub.html', 'catskills-home-base.html', 'friday-night-fanatics.html', 'holiday-schedule.html', 'reviews-village.html', 'bjj-stretches.html', 'bjj-tannersville-ny-directions.html', 'jiu-jitsu-safety-tannersville-ny.html', 'local-bjj-tournaments-for-parents.html', 'success-stories.html'}
BACKUP_NAME = re.compile(r'^senseisandy-predeploy-[0-9TZ-]+\.tar\.gz$')

def changed_outputs(commit):
    names = subprocess.check_output(['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit], cwd=ROOT, text=True).splitlines()
    outputs = set()
    if 'data/url-registry.json' in names:
        candidate = ROOT / 'dist' / 'sources' / 'kodokan-etiquette' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'sources/kodokan-etiquette/index.html'))
    # Asset fingerprint policy changes rewrite generated HTML sitewide. Include
    # the resulting deployable HTML and JS payload even though dist/ is ignored.
    fingerprint_release = 'tools/fingerprint-assets.cjs' in names or 'src/assets/data/asset-hash-manifest.json' in names
    sitewide_release = ('eleventy.config.js' in names or
                        'footer-include.html' in names or
                        'src/_includes/layouts/base.njk' in names or
                        'src/_includes/components/footer.njk' in names or
                        'src/_includes/components/free-intro-process.njk' in names or
                        'src/_includes/footer-high-intent.html' in names)
    for name in names:
        if name.startswith('api/'):
            candidate = ROOT / name
            if candidate.is_file():
                outputs.add((candidate, name))
            continue
        if name.startswith('src/'):
            if name == 'src/evidence.html':
                candidate = ROOT / 'dist' / 'evidence' / 'index.html'
            elif name == 'src/athlete-cross-training.html':
                candidate = ROOT / 'dist' / 'athlete-cross-training' / 'index.html'
            elif name == 'src/athlete-cross-training/evidence.html':
                candidate = ROOT / 'dist' / 'athlete-cross-training' / 'evidence' / 'index.html'
            elif name == 'src/schedule.html':
                candidate = ROOT / 'dist' / 'schedule' / 'index.html'
            elif name == 'src/fall-practice-reset.html':
                candidate = ROOT / 'dist' / 'fall-practice-reset' / 'index.html'
            elif name == 'src/hyphen-weekend.html':
                candidate = ROOT / 'dist' / 'hyphen-weekend' / 'index.html'
            elif name == 'src/_includes/schedule-master.html':
                candidate = ROOT / 'dist' / 'schedule' / 'index.html'
            elif name in ('src/_data/tournaments.js', 'src/_includes/partials/tournament-grid.html'):
                candidate = ROOT / 'dist' / 'local-bjj-tournaments-for-parents.html'
            elif name.startswith('src/') and name.endswith('.njk'):
                relative = name[4:]
                if relative.endswith('/index.njk'):
                    relative = relative[:-10]
                else:
                    relative = relative[:-4]
                candidate = ROOT / 'dist' / relative / 'index.html'
            else:
                candidate = ROOT / 'dist' / name[4:]
        elif name in ROOT_FILES:
            candidate = ROOT / 'dist' / name
        elif name.startswith(DEPLOYABLE_ROOTS):
            candidate = ROOT / 'dist' / name
        else:
            continue
        rel = candidate.relative_to(ROOT / 'dist').as_posix()
        if rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS):
            if candidate.is_file(): outputs.add((candidate, rel))
    if fingerprint_release or sitewide_release:
        for candidate in (ROOT / 'dist').rglob('*'):
            if not candidate.is_file(): continue
            rel = candidate.relative_to(ROOT / 'dist').as_posix()
            is_js = rel.startswith('js/') or rel.startswith('assets/js/')
            is_css = rel.startswith('assets/css/')
            is_site_html = rel.endswith('.html') and (rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS))
            if is_site_html or is_js or is_css or rel == 'assets/data/asset-hash-manifest.json':
                outputs.add((candidate, rel))
    return sorted(outputs, key=lambda item: item[1])

def connect(cfg):
    client = paramiko.SSHClient(); client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(cfg['host'], port=int(cfg['port']), username=cfg['username'], password=cfg['password'], timeout=45, banner_timeout=45, auth_timeout=45)
    return client

def upload_one(client, cfg, local, rel):
    remote = posixpath.join(cfg['remotePath'], rel); temp = remote + '.codex-upload'
    parent = posixpath.dirname(remote)
    command = f"mkdir -p {shlex.quote(parent)} && cat > {shlex.quote(temp)} && mv -f {shlex.quote(temp)} {shlex.quote(remote)} && stat -c %s {shlex.quote(remote)}"
    stdin, stdout, stderr = client.exec_command(command, timeout=180)
    stdin.write(local.read_bytes()); stdin.close(); out = stdout.read().decode(errors='replace'); err = stderr.read().decode(errors='replace')
    if stdout.channel.recv_exit_status() != 0: raise RuntimeError(err or out)
    return out.strip()

def remote_run(client, command, timeout=600):
    _, stdout, stderr = client.exec_command(command, timeout=600)
    channel = stdout.channel
    deadline = time.monotonic() + timeout
    chunks = []
    while True:
        if channel.recv_ready(): chunks.append(channel.recv(65536))
        if channel.exit_status_ready() and not channel.recv_ready(): break
        if time.monotonic() >= deadline:
            channel.close()
            raise TimeoutError(f'remote command timed out: {command}')
        time.sleep(0.2)
    out = b''.join(chunks).decode(errors='replace')
    err = stderr.read().decode(errors='replace')
    if stdout.channel.recv_exit_status() != 0: raise RuntimeError(err or out)
    return out

def backup_inventory(client, cfg):
    home = '/home/' + cfg['username']
    commands = {
        'home': f"find {shlex.quote(home)} -maxdepth 1 -type f -name 'senseisandy-predeploy-*.tar.gz' -printf '%T@ %s %p\\n' | sort -n",
        'tmp': f"find {shlex.quote(home + '/.cagefs/tmp')} -maxdepth 1 -type f -name 'senseisandy-predeploy-*.tar.gz' -printf '%T@ %s %p\\n' | sort -n",
    }
    inventory = []
    for location, command in commands.items():
        for line in remote_run(client, command).splitlines():
            parts = line.split(' ', 2)
            if len(parts) != 3:
                continue
            mtime, size, path = parts
            if not BACKUP_NAME.fullmatch(pathlib.PurePosixPath(path).name):
                continue
            inventory.append({'location': location, 'mtime': float(mtime), 'size': int(size), 'path': path})
    return inventory

def cleanup_remote_backups(client, cfg, cleanup=False, stale_seconds=86400):
    now = time.time(); inventory = backup_inventory(client, cfg)
    invalid = []
    for item in inventory:
        try:
            remote_run(client, f"gzip -t {shlex.quote(item['path'])} && tar -tzf {shlex.quote(item['path'])} >/dev/null")
        except RuntimeError:
            invalid.append(item)
    home = sorted((x for x in inventory if x['location'] == 'home'), key=lambda x: x['mtime'], reverse=True)
    remove = []
    for item in invalid:
        remove.append((item, 'invalid-archive'))
    # The provider temp directory is not part of the active web root. Its old
    # predeploy archives are staging leftovers and are safe to clear exactly.
    for item in inventory:
        if item['location'] == 'tmp' and now - item['mtime'] >= stale_seconds:
            remove.append((item, 'stale-provider-temp'))
    # Keep one newest top-level archive as the prior rollback point. The next
    # fresh backup will restore the two-archive rotation after deployment.
    for item in home[1:]:
        remove.append((item, 'older-top-level-rotation'))
    print(f'backup_qa_found={len(inventory)} backup_qa_invalid={len(invalid)} backup_qa_remove={len(remove)} cleanup={cleanup}', flush=True)
    for item, reason in remove:
        print(f"backup_qa_{'removed' if cleanup else 'candidate'}={item['path']} reason={reason} bytes={item['size']}", flush=True)
        if cleanup:
            home_root = '/home/' + cfg['username']
            allowed = (home_root + '/', home_root + '/.cagefs/tmp/')
            if not item['path'].startswith(allowed):
                raise RuntimeError(f"refusing backup path outside account: {item['path']}")
            remote_run(client, f"rm -- {shlex.quote(item['path'])}")
    return inventory, remove

def backup_remote(client, cfg):
    home = '/home/' + cfg['username']; remote = cfg['remotePath']; stamp = time.strftime('%Y%m%dT%H%M%SZ', time.gmtime()); backup = f'{home}/senseisandy-predeploy-{stamp}.tar.gz'; temp = f'{home}/.senseisandy-predeploy-{stamp}.tar.gz.part'
    cleanup_remote_backups(client, cfg, cleanup=True)
    archive_cmd = f"rm -f {shlex.quote(temp)} && trap 'rm -f {shlex.quote(temp)}' EXIT && timeout --signal=TERM --kill-after=30s 900s tar --exclude=./.venv -I 'gzip -1' -cf {shlex.quote(temp)} -C {shlex.quote(remote)} . && gzip -t {shlex.quote(temp)} && tar -tzf {shlex.quote(temp)} >/dev/null && mv -f {shlex.quote(temp)} {shlex.quote(backup)}"
    remote_run(client, archive_cmd, timeout=1200)
    archive_listing = remote_run(client, f"tar -tzf {shlex.quote(backup)}")
    required = {'./.htaccess', './index.html', './robots.txt', './sitemap.xml'}
    present = set(archive_listing.splitlines())
    missing = sorted(required - present)
    if missing: raise RuntimeError(f'backup missing required files: {", ".join(missing)}')
    print(f'backup_verified={backup} files={len(archive_listing.splitlines())}', flush=True)

def verify_local_backup(path):
    backup = pathlib.Path(path).expanduser().resolve()
    if not backup.is_file():
        raise RuntimeError(f'local backup not found: {backup}')
    required_sets = ({'./.htaccess', './index.html', './robots.txt', './sitemap.xml'},
                     {'public_html/.htaccess', 'public_html/index.html', 'public_html/robots.txt', 'public_html/sitemap.xml'})
    with tarfile.open(backup, mode='r:gz') as archive:
        present = set(archive.getnames())
    if not any(required <= present for required in required_sets):
        raise RuntimeError('local backup missing required production root files')
    print(f'local_backup_verified={backup} bytes={backup.stat().st_size}', flush=True)

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--commit', default='HEAD'); parser.add_argument('--config', default='.vscode/sftp.json'); parser.add_argument('--dry-run', action='store_true'); parser.add_argument('--retries', type=int, default=3); parser.add_argument('--local-backup', help='use an independently verified full backup when remote quota prevents a second copy'); parser.add_argument('--reuse-existing-backup', action='store_true'); parser.add_argument('--qa-backups', action='store_true'); parser.add_argument('--cleanup', action='store_true'); parser.add_argument('--only', action='append', default=[], help='limit upload to these exact deploy-relative paths; repeatable'); args = parser.parse_args()
    cfg = json.loads((ROOT / args.config).read_text())
    if args.qa_backups:
        client = connect(cfg)
        try:
            cleanup_remote_backups(client, cfg, cleanup=args.cleanup)
        finally:
            client.close()
        return
    files = changed_outputs(args.commit)
    if args.only:
        allowed = set(args.only)
        files = [item for item in files if item[1] in allowed]
    print(f'payload_files={len(files)} commit={args.commit}')
    for _, rel in files: print(rel)
    if args.dry_run: return
    if not files: raise SystemExit('No deployable generated outputs changed by commit.')
    client = None; backup_done = False
    if args.local_backup:
        verify_local_backup(args.local_backup)
        backup_done = True
    elif args.reuse_existing_backup:
        backup_done = True
        print('backup_reuse_requested=true', flush=True)
    try:
        for local, rel in files:
            for attempt in range(1, args.retries + 1):
                try:
                    if client is None or not client.get_transport() or not client.get_transport().is_active():
                        client = connect(cfg)
                        if not backup_done:
                            inventory, removed = cleanup_remote_backups(client, cfg, cleanup=True)
                            removed_paths = {item['path'] for item, _ in removed}
                            valid = [item for item in inventory if item['path'] not in removed_paths]
                            if valid:
                                print(f"backup_reused={max(valid, key=lambda item: item['mtime'])['path']}", flush=True)
                            else:
                                backup_remote(client, cfg)
                            backup_done = True
                    print(f'upload {rel} attempt={attempt}', flush=True); print(f'remote_bytes={upload_one(client, cfg, local, rel)}', flush=True); break
                except Exception as error:
                    if client: client.close()
                    client = None
                    if attempt == args.retries: raise
                    print(f'retry {rel}: {error}', flush=True); time.sleep(2)
    finally:
        if client: client.close()

if __name__ == '__main__': main()
