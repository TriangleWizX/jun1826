# Analytics Event Map

Source-of-truth mapping for on-site event names and properties.

## Canonical Events
- `starter_plan_click` (location: top | inline | nav)
- `starter_plan_submit`
- `admissions_call_booked`
- `quiz_start`
- `quiz_answer` (question_id + answer)
- `quiz_complete` (segment + primary_pain)
- `variant_view` (confidence | mental_clarity | default)
- `hero_primary_reserve_free_intro` (homepage hero primary CTA click)
- `hero_secondary_text_pick_lane` (homepage hero SMS assist CTA click)

## Law Enforcement Page Events
- `leo_individual_service_rate_click` (`/law-enforcement-bjj` individual service-rate CTAs)
- `leo_department_proposal_click` (`/law-enforcement-bjj` department pilot proposal CTAs)
- `leo_text_sandy_click` (`/law-enforcement-bjj` SMS CTAs)
- `leo_call_click` (`/law-enforcement-bjj` phone CTAs)
- `leo_schedule_click` (`/law-enforcement-bjj` adult schedule links)
- `leo_full_curriculum_expand` (`/law-enforcement-bjj` full curriculum disclosure)
- `leo_pricing_click` (`/law-enforcement-bjj` community service-rate pricing link)

## Show-Up Kit Events
- `showup_desktop_waiver_click` (Hero, Support Card, or Sticky Bar waiver clicks)
- `showup_desktop_maps_click` (Google Maps opens from Show-Up Kit)
- `showup_desktop_text_click` (SMS clicks to Text Sandy)
- `showup_desktop_calendar_private_click` (Calendar addition for Private Lessons)
- `showup_desktop_calendar_youth_click` (Calendar addition for Youth Class)
- `showup_desktop_calendar_adult_click` (Calendar addition for Adult Class)
- `showup_desktop_calendar_saturday_click` (Calendar addition for Saturday Block)
- `showup_desktop_reschedule_text_click` (Reschedule intent via Text Sandy)
- `showup_desktop_manage_booking_click` (Reschedule intent via Calendly)
- `showup_desktop_preview_video_click` (Optional video preview link clicks)
- `showup_desktop_student_hub_click` (Student Hub bridge clicks)

## Hospitality Partner Events
- `partner_qr_kit_click` (Partner requests QR code kit via SMS)
- `partner_refer_guest_click` (Partner initiates guest referral via Calendly)
- `partner_text_click` (Partner contacts Sandy via generic SMS CTA)
- `partner_private_session_click` (Partner views private guest session details)
- `partner_small_group_click` (Partner inquires about small group sessions)
- `partner_schedule_click` (Partner views regular class schedule)
- `partner_toolkit_click` (Partner requests toolkit from inline toolkit section)
- `partner_directions_click` (Partner clicks directions in footer)

## Offer Page Events
- `friend_pass_submit` (`/bring-a-friend` Formspree submit intent)
- `friday_fanatics_submit` (`/friday-night-fanatics` Formspree submit intent)

## Required Properties (all events)
- `page_id`
- `variant`
- `audience_segment`
- `spots_left`
- `month_label`

## Legacy Mapping (transition)
- `apply_click` -> `starter_plan_click`
- `application_submit` -> `starter_plan_submit`
- `application_to_show_rate` -> `starter_plan_to_show_rate`

## Notes
- "Click" events are intent signals, not conversions.
- Conversion is a completed Free Intro step (form submit or scheduler completion).
- Hero-specific events fire only when `data-cta-placement="hero"` or `data-cta-src="home-hero"` is present.
- Keep using canonical `cta_click`, `book_intro_click`, and `text_click` for rollup reporting; use hero events for before/after homepage CTR comparisons.
