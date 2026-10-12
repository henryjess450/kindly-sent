# Running Kindly Sent next to Coastline Prints

Everything below happens on the Windows PC in PowerShell. coastlineprints.ca is offline for about a minute in step 4.

## How it fits together

Only one program can use ports 80 and 443, so a single Caddy (the `edge` folder in this repo) answers for every domain and passes each one to the right app over a shared Docker network called `web`:

```
router :80/:443 → edge (Caddy) ─┬─ coastlineprints.ca → Coastline app (port 3100)
                                └─ kindlysent.ca      → Kindly Sent app (port 3200)
```

## 1. Point the domain at the PC

In WordPress.com → Upgrades → Domains → kindlysent.ca → DNS records, copy what coastlineprints.ca has:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | your home IP (the same one coastlineprints.ca uses) |
| CNAME | www | kindlysent.ca |

Delete WordPress's own A records (they start with `192.0.78.`). Your router already forwards 80 and 443 to the PC.

## 2. Download it

```powershell
cd C:\
git clone https://github.com/henryjess450/kindly-sent.git
cd C:\kindly-sent
copy .env.example .env
notepad .env
```

For the first start you only need `SITE_URL=https://kindlysent.ca`. Leave the rest blank: the site loads, and email and payments get switched on in the settings round.

## 3. Create the shared network (once)

```powershell
docker network create web
```

## 4. Hand ports 80/443 to the shared Caddy

```powershell
cd C:\coastline-prints
git pull
docker compose up -d --build --remove-orphans
cd C:\kindly-sent\edge
docker compose up -d
```

`--remove-orphans` stops Coastline's old Caddy so the shared one can take the ports. It gets HTTPS certificates in a few seconds. Check https://coastlineprints.ca works before going on.

## 5. Start Kindly Sent

```powershell
cd C:\kindly-sent
docker compose up -d --build
```

Check http://localhost:3200 on the PC, then https://kindlysent.ca from your phone with Wi-Fi off.

## Everyday commands

| What | Command |
| --- | --- |
| Update Kindly Sent | `cd C:\kindly-sent; git pull; docker compose up -d --build` |
| Update Coastline | `cd C:\coastline-prints; git pull; docker compose up -d --build` |
| Kindly Sent logs | `cd C:\kindly-sent; docker compose logs -f` |
| Caddy logs | `cd C:\kindly-sent\edge; docker compose logs -f` |
| Reload Caddy after editing `edge\Caddyfile` | `cd C:\kindly-sent\edge; docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |
| Backups | `C:\kindly-sent\backups` (one a day, last 14 kept) |

## If something goes wrong

- **"network web not found"**: run `docker network create web`.
- **"port is already allocated" for 80/443**: Coastline's old Caddy is still running. `docker ps`, find the one named like `coastline-prints-caddy-1`, then `docker stop <name>` and start the edge again.
- **coastlineprints.ca down after step 4**: `cd C:\kindly-sent\edge; docker compose logs caddy`. "connection refused" for `coastline-app` means Coastline didn't join the network; run `docker compose up -d` again in `C:\coastline-prints`.
- **kindlysent.ca shows a certificate error**: DNS hasn't switched yet. Caddy keeps retrying; give it up to an hour after the DNS change.
- **Going back to how it was**: `cd C:\kindly-sent\edge; docker compose down`, then in `C:\coastline-prints` run `git checkout HEAD~1 -- docker-compose.yml; docker compose up -d`.

## Settings (after it's running)

Fill these into `C:\kindly-sent\.env`, then `docker compose up -d` to apply:

- **Email**: `SMTP_*` and `MAIL_FROM`. A Gmail App Password works, like Coastline.
- **Payments**: a separate Square app (same Square account is fine). Copy the Application ID, Access token and Location ID into `SQUARE_*`. Test with `SQUARE_ENV=sandbox` and Square's test card `4111 1111 1111 1111`, then switch to production values. For Apple Pay, register `kindlysent.ca` in the app's Apple Pay settings.
- **Admin**: `ADMIN_EMAILS` (your email).
