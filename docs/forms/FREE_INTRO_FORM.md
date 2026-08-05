# Free Intro Form Documentation — SenseiSandy.com

## Form Component
- Location: `src/_includes/components/form-free-intro.njk`
- Endpoint: `https://formspree.io/f/mqazqozk`

## Form Fields & Behavior
- `student_lane`: Required select dropdown (Child 5–9, Teen 10–17, Adult 18+).
- `guardian_name`: Dynamically shown and required for Child / Teen selections.
- `name`: Required text.
- `phone`: Required telephone.
- `email`: Required email.
- `schedule_pref`: Preferred class day select (populates from active schedule).
- `experience`: Prior experience level.
- `goals`: Optional free-text area.

## Privacy & Data Safeguards
- Form fields are sent exclusively to Formspree.
- Zero form field input values are passed to `dataLayer` or Google Analytics.
