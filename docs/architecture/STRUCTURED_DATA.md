# Structured Data Records — SenseiSandy.com

## Overview
All business details, schedules, pricing tiers, offer hierarchies, campaign promotions, program parameters, and location data are maintained in `src/_data/`.

## Data File Specifications

### 1. `business.json` & `contact.json`
* **Purpose**: Single source of truth for studio name, legal entity, address, phone number, email, map coordinates, and primary call to action.
* **Consumers**: Header, footer, contact pages, Schema.org LocalBusiness JSON-LD markup.

### 2. `schedule.json`
* **Purpose**: Master group class schedule and private coaching availability.
* **Official Group Schedule**:
  * Monday, Tuesday, Friday: 5:00 PM Youth/Teen Gi, 6:00 PM Adult Gi
  * Wednesday: 5:00 PM Youth/Teen No-Gi, 6:00 PM Adult No-Gi
  * Saturday: 10:30 AM Adult No-Gi
* **Private Coaching**: Tuesday 6:30 AM, Wednesday/Friday mid-morning.
* **Consumers**: Homepage, Schedule page, program cards, visitor resources.

### 3. `pricing.json`
* **Purpose**: Approved membership, visitor, and private coaching pricing.
* **Core Tiers**:
  * Core Culture Youth: $550 / 12 weeks
  * Core Culture Adult: $715 / 12 weeks
  * Core Culture Community Service Adult: $600 / 12 weeks
  * Annual Track Youth: $2,100 / 12 months
  * Annual Track Adult: $2,650 / 12 months
  * Annual Track Community Service Adult: $2,250 / 12 months
  * Day Pass: $35 | Vacation Week: $99 | Private Session: $195
* **Consumers**: `/options-pricing`, program pages, private coaching pages.

### 4. `offers.json`
* **Purpose**: Hierarchy of studio entry points (Primary: Free Intro, Goal Mapping, Core Culture; Secondary: Day Pass, Vacation Week; Support: Private Coaching).

### 5. `promotions.json`
* **Purpose**: Campaign management with build-time activation checks (`active: false` for expired Christmas in July promotion).

### 6. `programs.json` & `locations.json`
* **Purpose**: Centralized metadata for Kids, Teens, and Adults programs and primary town pages (Tannersville, Hunter, Windham, Haines Falls).
