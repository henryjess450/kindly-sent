# Kindly Sent: plan

Write a card today, choose the exact minute it arrives, and we deliver it.

## Name

Working name **Kindly Sent** (kindlysent.ca was unregistered on 2026-10-11). The name lives in one place, `src/config/site.ts`, so it's easy to change.

Other names that had a free .ca domain that day:

| Name | Domain | Feel |
| --- | --- | --- |
| **Kindly Sent** | kindlysent.ca | warm, says what it does |
| Fondly | sendfondly.ca | soft, personal |
| Tuck & Send | tuckandsend.ca | playful, papery |
| Sealed With Care | sealedwithcare.ca | classic, a bit long |
| On Time Cards | ontimecards.ca | plain, very clear |

Taken: dearly.ca, fondly.ca, sealed.ca, wellsent.ca, postscript.ca, papermoon.ca.

## How both sites share one IP

Ports 80 and 443 can only belong to one program. Today Coastline's Caddy holds them. The fix is to move Caddy out into its own small stack, the **edge**, which serves every domain:

```
Internet ── router :80/:443 ── PC 10.0.0.51
                                  │
                         edge (Caddy, HTTPS for every domain)
                                  │  Docker network "web"
                 ┌────────────────┴────────────────┐
     coastlineprints.ca → coastline-app:3100   kindlysent.ca → kindly-sent:3200
```

Each app runs in its own folder with its own `docker compose`. Adding a third site later means one more block in `edge/Caddyfile`. Step-by-step setup is in [DEPLOY.md](DEPLOY.md).

## Phase 1: built (this folder)

- **Home page** with a card that opens as you scroll, the card gallery, how it works, yearly repeats, and delivery notes.
- **8 hand-drawn card designs** (SVG, some animated: flickering candle, beating heart, turning sun, twinkling stars).
- **Composer** in 4 steps: card, message (live preview with handwriting, classic or modern lettering), delivery (date, time, time zone, "send right away", yearly repeat), review.
- **Seal and send animation**: the card slides into its envelope, the flap folds, the wax seal presses down, and the envelope flies away.
- **Recipient experience**: email with a "Open your card" button, then a sealed envelope they tap. The seal pops, the card slides out, turns upright, opens, and a design-matched celebration plays (confetti, hearts, snow, sparkles, petals).
- **Accounts without passwords**: email sign-in links. First-time senders confirm their email before anything goes out, which stops people using the site to spam strangers.
- **Your cards**: upcoming and delivered, with status (Scheduled, Delivered, Opened), preview, edit, cancel.
- **Scheduler** inside the app: checks every 15 seconds, retries failed sends 5 times over about 4 hours, never double-sends, tells the sender when a card is delivered, opened, or bounced.
- **Yearly cards**: after each delivery, next year's copy is scheduled automatically (Feb 29 falls back to Feb 28).
- **Limits**: 25 cards per sender per day, 1,200-character messages, up to 5 years ahead, 6 sign-in links per hour.
- **Daily database backups** to `./backups`, last 14 kept.
- **Docker**: small standalone image, health check, SQLite built into Node (nothing native to compile).

## Phase 2: next up

1. **Name and domain**: pick the name, register the domain, point DNS at the home IP (same as Coastline).
2. **Real email sending**: a sending address on the new domain with SPF, DKIM and DMARC so cards don't land in spam. Gmail works to start; a sending service (Postmark, Amazon SES) is better once volume grows.
3. **Email card image**: show the card cover in the email itself, not just the envelope.
4. **Address book**: save people with their birthdays, get a reminder a week before.
5. **Reply card**: "Send one back" pre-fills the recipient.
6. **Text message delivery** (Twilio) as an option alongside email.
7. **More designs** and seasonal drops (Halloween, Thanksgiving, Christmas, Valentine's, Mother's/Father's Day).
8. **Admin page**: counts, failed sends, block abusive senders.

## Phase 3: making money

- **Free**: 3 scheduled cards at a time, all basic designs.
- **Premium** (around $3/month or $24/year, via Square like Coastline): unlimited scheduling, premium designs, photo cards, voice notes, custom handwriting font.
- **Printed cards by mail**: real paper cards printed and posted on the day (Canada Post), around $5.99 each. This is the bigger business and pairs with Coastline's shipping code.
- **Gift cards inside cards**: attach a Coastline/LightLab gift card or a partner gift card.

## Open questions for you

- Which name?
- Free to start, or charge from day one?
- Digital only for now (built), or add printed mailed cards soon?
