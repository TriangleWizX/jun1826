# Production Backup and Rollback Procedure

## Overview

This document outlines the standard production backup and rollback procedure for **SenseiSandy.com**.
Before performing any SFTP deployment or major live site changes, follow this procedure to ensure zero downtime and total recoverability.

> [!IMPORTANT]
> Never deploy to production without first verifying that a production snapshot backup exists and passes the verification checklist below.

---

## 1. Backup Scope & Requirements

The production backup must preserve:

* Complete `public_html` contents (all HTML, CSS, JS, images, assets, subdirectories)
* Hidden files (`.htaccess`)
* Crawl files (`robots.txt`, `sitemap.xml`, `sitemap-*.xml`)
* Server configuration & redirects
* Formspree / endpoint integration configs
* File permissions (where applicable)
* SFTP destination path (`/home/username/public_html`)
* Relevant cPanel/Namecheap settings snapshot

---

## 2. Local Backup Directory Structure

Production backup archives MUST be stored outside the active Git repository to avoid committing large binary snapshot files into source control.

Recommended Local Path:

```text
/home/twizss/SenseiSandy-Backups/
  YYYY-MM-DD-pre-deployment-description/
    public_html/
      .htaccess
      index.html
      ... (complete website mirror)
    configuration-notes/
      cpanel-settings.txt
      sftp-path.txt
    verification.txt
```

---

## 3. Step-by-Step Backup Procedure

1. **Connect to Server**:
   Establish SFTP connection or open cPanel File Manager on Namecheap shared hosting.

2. **Record Target Path**:
   Confirm production path (typically `public_html` or domain web root).

3. **Download Live Site Mirror**:
   Download the entire live web root to the timestamped local backup directory (`/home/twizss/SenseiSandy-Backups/YYYY-MM-DD-pre-stabilization/`).

4. **Include Hidden Files**:
   Ensure hidden files (especially `.htaccess`) are downloaded.

5. **Record Metadata**:
   Create `verification.txt` recording:
   * Date and time of backup (ISO timestamp)
   * Operating user / engineer
   * Target Git commit hash corresponding to intended release
   * Total file count and size (in MB/GB)

6. **Verify Local Snapshot**:
   Run the verification checklist below before making any server changes.

---

## 4. Backup Verification Checklist

Verify all of the following in the downloaded snapshot before authorizing deployment:

```text
[ ] index.html exists and opens correctly in local browser
[ ] .htaccess exists (preserving server redirects and headers)
[ ] robots.txt exists
[ ] sitemap.xml and nested sitemaps exist
[ ] CSS files exist (/css, assets, etc.)
[ ] JavaScript files exist (/js, assets, etc.)
[ ] Major image directories exist (/images, /assets/img, etc.)
[ ] /free-bjj-intro-tannersville-ny page exists
[ ] /options-pricing page exists
[ ] /schedule page exists
[ ] Total file count recorded in verification.txt
[ ] Total backup folder size recorded in verification.txt
```

---

## 5. Emergency Rollback Procedure

If a deployment produces critical errors, broken layout, failing forms, or 5xx server errors:

1. **Halt Deployment**: Immediately stop ongoing file transfers or build scripts.
2. **Snapshot Broken State**: Download the failed state to `/home/twizss/SenseiSandy-Backups/YYYY-MM-DD-failed-deployment/` for post-mortem analysis.
3. **Restore Last Known Good Backup**:
   * Upload all files from the latest verified backup directory back into `public_html`.
   * Re-upload the verified `.htaccess` file.
4. **Post-Rollback Sanity Check**:
   * Test Homepage (`index.html`)
   * Test Free Intro form and Goal Mapping appointment link
   * Test Pricing page (`/options-pricing`)
   * Test Schedule page (`/schedule`)
   * Test navigation and mobile view
5. **Log Incident**: Record the rollback event, root cause, affected files, and commit hash. Repair the local Git repository before attempting re-deployment.

---

## 6. Helper Script Reference

A helper Python or Bash script may be used locally to verify downloaded backup file counts:

```bash
# Example backup verification count check:
find /home/twizss/SenseiSandy-Backups/2026-08-05-pre-stabilization/public_html -type f | wc -l
```
