# Contact Form Delivery Runbook

## Scope
- Contact form endpoint: `https://formspree.io/f/myzpdvay`
- Source page: `/contact`
- Success redirect: `/thanks`

## Weekly checks
1. Submit a live test from `https://senseisandy.com/contact` with a unique subject marker, for example: `RUNBOOK TEST YYYY-MM-DD`.
2. Confirm redirect to `https://senseisandy.com/thanks`.
3. Confirm the message arrives in primary inbox.
4. Confirm the same message is not trapped in spam/junk.
5. Confirm phone and email values render correctly in the delivered message.

## Mail routing validation
1. Verify mailbox forwarding rules are still active.
2. Verify fallback mailbox receives a copy.
3. Verify SPF/DKIM/DMARC are healthy in mail provider diagnostics.

## Spam and abuse checks
1. Confirm honeypot field submissions are not delivered.
2. Review Formspree spam dashboard and false-positive queue.
3. If abuse spikes, enable stricter Formspree filtering and add temporary keyword rules.

## Failure handling
- Trigger condition: no contact emails received in 24 hours during normal traffic.
- Immediate steps:
  1. Submit a manual test from `/contact`.
  2. Check Formspree dashboard delivery logs.
  3. Check target mailbox quota and spam folder.
  4. If still failing, switch to fallback intake:
     - Publish temporary contact instruction: `Call/Text (917) 736-8649`.
     - Add banner to `/contact` until delivery is restored.

## Escalation contacts
- Primary owner: Sensei Sandy ops
- Technical backup: web dev maintainer
- Fallback intake channel: `tel:+19177368649` and `mailto:me@senseisandy.com`
