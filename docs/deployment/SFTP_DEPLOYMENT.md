# SFTP Deployment Guide

## Overview

SenseiSandy.com is hosted on Namecheap shared hosting via cPanel and deployed via SFTP.
Deploys must only occur after explicit authorization from Sandy following local testing and backup verification.

---

## Safety Requirements

* **No Automatic Upload-on-Save**: `uploadOnSave` MUST remain `false` in `.vscode/sftp.json`.
* **No Remote Deletion by Default**: Synchronization with remote deletion enabled by default is prohibited.
* **Credentials Kept Local**: Do NOT commit `.vscode/sftp.json` or host credentials to Git. Use `.vscode/sftp.example.json` as a reference template.

---

## Configuration Setup (Local Only)

1. Copy `.vscode/sftp.example.json` to `.vscode/sftp.json`.
2. Fill in the SFTP host, port, username, password, and remote path (`/home/username/public_html`).
3. Verify `.vscode/sftp.json` is listed in `.gitignore`.

---

## Upload & Deployment Procedure

1. **Verify Backup**: Confirm a full production backup exists in `/home/twizss/SenseiSandy-Backups/` (see `docs/deployment/BACKUP_AND_ROLLBACK.md`).
2. **Owner Authorization**: Ensure explicit authorization from Sandy is received.
3. **Select Active Source Files**: Upload active static files (HTML, CSS, JS, assets) to `/home/username/public_html`.
4. **Exclusions**: Do NOT upload:
   * `.git/` directory
   * `node_modules/`
   * `_archive/` directory
   * `.env` or `.vscode/`
   * Temporary scripts or scratch python files
5. **Post-Deploy Smoke Test**: Test live URLs, responsive design, forms, navigation, and schedule.
