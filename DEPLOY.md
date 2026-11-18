# Putting the website online

The site runs on the studio's own server in two small containers, and reaches the
internet through the same Cloudflare tunnel the apps already use.

```
visitor → Cloudflare → tunnel (cloudflared) → zaylolabs-web (nginx) → the site
                                                        └→ /api/inquiry → zaylolabs-inquiry → email
```

Nothing here changes the apps, their addresses, or email delivery for the domain.

## 1. Get the code onto the server

```bash
cd /srv/server/repos/Zaylolabs-Web
```

```bash
git pull
```

## 2. Settings

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Setting | What to put |
| --- | --- |
| `INQUIRY_TO` | The inbox that should receive inquiries. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | The mail account that sends them. My Expenses uses the same names, so copy the values from its `.env`. |
| `WEB_PORT` | Leave `8510` unless something already uses it. |

`.env` stays on the server. It is ignored by git.

## 3. Start it

```bash
docker compose up -d --build
```

## 4. Check it on the server

```bash
curl -s http://127.0.0.1:8510/api/health
```

It should answer `{"ok": true, "mail": true}`. If `mail` is `false`, a mail setting is missing.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8510/work/estatelab
```

It should answer `200`.

## 5. Give it its address (this is the DNS step)

In the Cloudflare dashboard: **Zero Trust → Networks → Tunnels →** the server's tunnel **→ Public Hostnames → Add a public hostname**.

| Field | Value |
| --- | --- |
| Subdomain | leave empty |
| Domain | `zaylolabs.com` |
| Service type | `HTTP` |
| URL | `zaylolabs-web:80` |

Save. Cloudflare adds the DNS record for `zaylolabs.com` by itself.

Add a second one the same way with Subdomain `www`, so `www.zaylolabs.com` works too
(the site sends it on to `zaylolabs.com`).

If the tunnel is managed from a config file on the server instead of the dashboard, add
the same two hostnames to its ingress rules and run
`cloudflared tunnel route dns <tunnel> zaylolabs.com` for each name.

## 6. Check it from outside

1. Open `https://zaylolabs.com` on a phone that is not on the home network.
2. Open `https://zaylolabs.com/work/my-expenses-does-not-exist` — it should show the not-found page.
3. Send a test message through the contact form. It should arrive in the inbox within a minute,
   and replying to it should address the person who wrote.

## Updating the site later

```bash
git pull && docker compose up -d --build
```

## Taking it offline

Remove the two public hostnames from the tunnel, then:

```bash
docker compose down
```

## If something is wrong

| What you see | Where to look |
| --- | --- |
| The address does not open | The tunnel's public hostname, then `docker ps` for `zaylolabs-web`. |
| The site opens but a form says it did not go through | `docker logs zaylolabs-inquiry`. It says why sending failed. It never logs names, emails or messages. |
| "too many, try later" in that log | More than five inquiries from one address in ten minutes. It clears by itself. |
