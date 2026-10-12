# Kindly Sent

Schedule greeting cards to arrive at the exact minute you choose.

- Plan and roadmap: [PLAN.md](PLAN.md)
- Running it on the PC next to Coastline Prints: [DEPLOY.md](DEPLOY.md)

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3200. Emails aren't sent in development; read them at http://localhost:3200/dev/outbox.

## Stack

Next.js 16, React 19, Motion for animation, Node's built-in SQLite (`node:sqlite`, Node 24+), Nodemailer. The delivery scheduler starts with the server (`src/instrumentation.ts`).

| Where | What |
| --- | --- |
| `src/config/site.ts` | name, limits |
| `src/lib/designs.ts`, `src/components/CardArt.tsx` | card designs |
| `src/components/composer/` | the 4-step composer and send-off animation |
| `src/components/OpenCard.tsx` | the recipient's envelope opening |
| `src/lib/scheduler.ts` | delivery, retries, yearly repeats, backups |
| `src/lib/emails.ts` | every email |
