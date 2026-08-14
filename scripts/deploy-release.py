#!/usr/bin/env python3
"""Deploy only generated files changed by a commit, atomically and resumably."""
import argparse, json, pathlib, posixpath, shlex, subprocess, tarfile, time
import paramiko

ROOT = pathlib.Path(__file__).resolve().parents[1]
SKIP_PREFIXES = ('.agents/', 'artifacts/', 'reports/', 'scripts/', 'docs/', '.vscode/', 'package', 'src/')
DEPLOYABLE_ROOTS = ('assets/', 'admin/', 'bjj-classes/', 'bjj-glossary/', 'blog/', 'near/', 'partials/', 'js/', 'images/', 'img/', 'fonts/', 'downloads/', 'youtube/', 'yam/', 'yams/', 'external/', 'partners/', 'social/', 'snippets/', '413/')
ROOT_FILES = {'.htaccess', 'index.html', 'robots.txt', 'sitemap.xml', 'site-shell.html'}

def changed_outputs(commit):
    names = subprocess.check_output(['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit], cwd=ROOT, text=True).splitlines()
    outputs = set()
    for name in names:
        if name.startswith('src/'):
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

def remote_run(client, command):
    _, stdout, stderr = client.exec_command(command, timeout=600)
    channel = stdout.channel
    deadline = time.monotonic() + 600
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

def backup_remote(client, cfg):
    home = '/home/' + cfg['username']; remote = cfg['remotePath']; stamp = time.strftime('%Y%m%dT%H%M%SZ', time.gmtime()); backup = f'{home}/senseisandy-predeploy-{stamp}.tar.gz'
    listing = remote_run(client, f"find {shlex.quote(home)} -maxdepth 1 -type f -name 'senseisandy-predeploy-*.tar.gz' -printf '%T@ %p\\n' | sort -n")
    archives = [line.split(' ', 1)[1].strip() for line in listing.splitlines() if ' ' in line]
    while len(archives) >= 2:
        oldest = archives.pop(0); remote_run(client, f"rm -- {shlex.quote(oldest)}"); print(f'removed_oldest_backup={oldest}', flush=True)
    archive_cmd = f"timeout --signal=TERM --kill-after=30s 300s tar -czf {shlex.quote(backup)} -C {shlex.quote(remote)} ."
    remote_run(client, f"{archive_cmd} && gzip -t {shlex.quote(backup)}")
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
    parser = argparse.ArgumentParser(); parser.add_argument('--commit', default='HEAD'); parser.add_argument('--config', default='.vscode/sftp.json'); parser.add_argument('--dry-run', action='store_true'); parser.add_argument('--retries', type=int, default=3); parser.add_argument('--local-backup', help='use an independently verified full backup when remote quota prevents a second copy'); args = parser.parse_args()
    cfg = json.loads((ROOT / args.config).read_text()); files = changed_outputs(args.commit)
    print(f'payload_files={len(files)} commit={args.commit}')
    for _, rel in files: print(rel)
    if args.dry_run: return
    if not files: raise SystemExit('No deployable generated outputs changed by commit.')
    client = None; backup_done = False
    if args.local_backup:
        verify_local_backup(args.local_backup)
        backup_done = True
    try:
        for local, rel in files:
            for attempt in range(1, args.retries + 1):
                try:
                    if client is None or not client.get_transport() or not client.get_transport().is_active():
                        client = connect(cfg)
                        if not backup_done:
                            backup_remote(client, cfg); backup_done = True
                    print(f'upload {rel} attempt={attempt}', flush=True); print(f'remote_bytes={upload_one(client, cfg, local, rel)}', flush=True); break
                except Exception as error:
                    if client: client.close()
                    client = None
                    if attempt == args.retries: raise
                    print(f'retry {rel}: {error}', flush=True); time.sleep(2)
    finally:
        if client: client.close()

if __name__ == '__main__': main()
