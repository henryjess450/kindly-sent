# Running Kindly Sent next to Coastline Prints

Everything below happens on the Windows PC in PowerShell. It takes about 15 minutes, and coastlineprints.ca is offline for about a minute in step 4.

## 1. Point the domain at the PC

At your domain registrar, add the same records Coastline uses:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 24.68.229.116 |
| CNAME | www | kindlysent.ca |

Your router already forwards ports 80 and 443 to the PC, so nothing changes there.

## 2. Copy the folders to the PC

You need two new folders:

- `C:\kindly-sent` (this project)
- `C:\edge` (the shared Caddy, from `../edge`)

## 3. Fill in settings

```powershell
cd C:\kindly-sent
copy .env.example .env
notepad .env
```

Set `SITE_URL=https://kindlysent.ca` and the email settings. A Gmail App Password works the same way as Coastline's.

**Payments (Square).** Use a separate Square application from Coastline so the money and reports stay apart (same Square account is fine). In the Square Developer Dashboard: create an app, copy the **Application ID**, **Access token** and **Location ID** into `.env`. Start with `SQUARE_ENV=sandbox` and the sandbox values, buy a card with Square's test card `4111 1111 1111 1111`, then switch to production values. For Apple Pay, register `kindlysent.ca` under the app's Apple Pay settings.

**Gift cards (Tango Card).** Tango is used because its API hands back the actual card number and PIN, which the site prints inside the card. (Tremendous only gives a redeem link; set `GIFT_PROVIDER=tremendous` if you'd ever rather use it.)
1. Sign up for Tango Card's API ("Rewards as a Service") and ask for a sandbox. Tell them you're in Canada and need CAD cards with codes returned in the API, not emailed by Tango.
2. Fund your Tango account (gift cards are paid from that balance).
3. Put the platform name, platform key, account ID and customer ID in `.env` (`TANGO_*`).
4. Run `node scripts/gift-catalog.mjs amazon` (and tim, starbucks...) and paste each `tangoUtid` into `src/config/gifts.ts`. Brands without one are hidden on the live site.
5. Make the encryption key for card numbers and PINs and put it in `GIFT_SECRET_KEY`:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   **Save a copy somewhere safe** (a password manager). If it's lost, gift codes that haven't been opened yet can't be read.
6. Test a sandbox order end to end, then set `TANGO_ENV=production` with the production values.

## 4. Switch to the shared Caddy

This is the only step that touches Coastline. Its `docker-compose.yml` no longer starts its own Caddy; it joins the shared `web` network instead.

```powershell
docker network create web
cd C:\coastline-prints
git pull
docker compose up -d --build --remove-orphans
cd C:\edge
docker compose up -d
```

`--remove-orphans` stops Coastline's old Caddy so the new one can take ports 80 and 443. Caddy gets fresh certificates in a few seconds. Check https://coastlineprints.ca loads before moving on.

## 5. Start Kindly Sent

```powershell
cd C:\kindly-sent
docker compose up -d --build
```

Check http://localhost:3200 on the PC, then https://kindlysent.ca from your phone (off Wi-Fi).

## Everyday commands

| What | Command |
| --- | --- |
| Update Kindly Sent | `cd C:\kindly-sent; docker compose up -d --build` |
| Update Coastline | `cd C:\coastline-prints; git pull; docker compose up -d --build` |
| See Kindly Sent logs | `cd C:\kindly-sent; docker compose logs -f` |
| Reload Caddy after editing the Caddyfile | `cd C:\edge; docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |
| Backups | `C:\kindly-sent\backups` (one per day, last 14) |

## If something goes wrong

- **Coastline down after step 4**: run `cd C:\edge; docker compose logs caddy`. "connection refused" for `coastline-app` means Coastline didn't join the network; rerun `docker compose up -d` in `C:\coastline-prints`.
- **"network web not found"**: run `docker network create web` once.
- **Port 80 already in use**: the old Coastline Caddy is still running. `docker ps`, then `docker stop <name>`.
- **Going back to the old setup**: `cd C:\edge; docker compose down`, then in `C:\coastline-prints` run `git checkout HEAD~1 -- docker-compose.yml; docker compose up -d`.
