# Local Development Workflow

## Overview

This repository contains the plain static HTML, CSS, and JavaScript site for **SenseiSandy.com**.
No server-side framework or CMS (such as Eleventy, WordPress, PHP, or Next.js) is required for local previewing.

---

## Prerequisites

* **Node.js**: v18 or later (for running npm scripts and QA validators)
* **Python**: 3.x (used for the built-in HTTP dev server and build scripts)
* **Visual Studio Code**: Recommended editor

---

## 1. Quick Start

1. Open the repository root in VS Code:
   ```bash
   code .
   ```
2. Start the local preview HTTP server:
   ```bash
   npm run dev
   ```
   Or using Python directly:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser to:
   ```text
   http://localhost:8000
   ```

---

## 2. Previewing Pages & Assets

* Homepage: `http://localhost:8000/`
* Schedule: `http://localhost:8000/schedule` (or `schedule.html`)
* Pricing: `http://localhost:8000/options-pricing` (or `options-pricing.html`)
* Free Intro: `http://localhost:8000/free-bjj-intro-tannersville-ny/`
* Kids BJJ: `http://localhost:8000/kids`
* Teens BJJ: `http://localhost:8000/teens`
* Adults BJJ: `http://localhost:8000/adults`

---

## 3. Running Validation Checks

Before committing changes, run non-destructive local checks:

```bash
npm run validate
```

Sub-commands available:
* `npm run validate:html` — Validates HTML doctypes and structure
* `npm run validate:links` — Checks static internal links for broken paths
* `npm run qa:schedule` — Verifies schedule consistency across pages

---

## 4. Stopping the Dev Server

In your terminal or VS Code terminal window:
Press `Ctrl + C` to stop the local HTTP server.
