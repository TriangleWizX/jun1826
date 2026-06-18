# SenseiSandy.com Architecture

Static-first site with a small PHP utility backend.

- Static content and landing pages remain at repository root.
- Utility API handles non-static concerns:
  - `POST /api/leads`
  - `POST /api/webhook/booking`
  - `GET /api/reviews`
  - `GET /api/health`
  - `GET /api/students`
  - `GET/POST /api/sessions`
  - `GET/POST /api/attendance` (`/api/attendance/checkin` alias)
  - `GET/POST /api/waivers`
  - `GET /api/exports/attendance.csv`
- SQLite stores lead intake, canonical SwiftAttend ops data, review cache, and event logs.
- Cron jobs:
  - `php jobs/refresh_reviews.php`
  - `bash jobs/backup_db.sh`
  - Example cron template: `jobs/cron.example`

## Runtime Shape

1. Browser requests static pages from Apache.
2. Browser calls `/api/*` for forms/reviews/health.
3. API writes to SQLite in `data/senseisandy.sqlite`.
   - Core ops tables: `person`, `household`, `program`, `plan`, `enrollment`, `booking`, `session`, `attendance`, `waiver`.
4. External booking provider may send webhook payloads to `/api/webhook/booking`.

## Security Baselines Included

- Input validation on POST endpoints
- Honeypot spam check on leads
- IP-based rate limiting on all API endpoints
- Optional CORS allowlist via `.env`
- Webhook shared-secret verification
- Owner-only ops route authentication (`OPS_API_KEY`)
- Hashed IP storage (`IP_HASH_SALT`)
