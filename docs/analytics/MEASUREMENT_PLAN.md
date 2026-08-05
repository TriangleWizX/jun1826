# Measurement Plan — SenseiSandy.com

## Conversion Funnel Mapping
```text
Website Visit
 → Program / Schedule / Pricing View
   → Free Intro CTA Click (free_intro_click)
     → Form Interaction (form_start)
       → Successful Submission (generate_lead) [GA4 Key Event]
         → 15-Minute Goal Mapping Appointment (Operational)
           → Coached First Class Free (Operational)
             → Core Culture Enrollment (Operational)
```

## Browser-Measurable Events & Triggers

| Event Name | Trigger Condition | Parameters | Key Event? |
| :--- | :--- | :--- | :--- |
| `free_intro_click` | User clicks any primary "Reserve Your Free Intro" CTA | `cta_location`, `page_type`, `program_interest` | No |
| `form_start` | First user input on the Free Intro lead form | `form_id`, `form_location`, `page_type` | No |
| `generate_lead` | Formspree confirms successful form submission | `form_id`, `form_location`, `page_type`, `program_interest` | **YES** |
| `phone_click` | User clicks `tel:` link | `link_location`, `page_type` | No |
| `email_click` | User clicks `mailto:` link | `link_location`, `page_type` | No |
| `visitor_option_click` | User selects Day Pass, Vacation Pass, or Class Pack | `offer_id`, `cta_location` | No |
| `private_coaching_click` | User selects Private Coaching CTA | `cta_location`, `page_type` | No |

## Strict PII Exclusion Rules
Under NO circumstances are personal data attributes (`name`, `phone`, `email`, `guardian_name`, `student_age`, `goals_text`) passed to `dataLayer.push()` or GA4 event parameters.
