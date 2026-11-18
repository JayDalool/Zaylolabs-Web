"""Inquiry endpoint for the ZayloLabs website.

Receives the contact form and the request-access forms (POST /api/inquiry, JSON)
and emails each one to the studio's inbox. Python standard library only.

Settings come from the environment (see .env.example). Nothing is stored: an
inquiry is sent on and forgotten, and the log records only that one arrived.
"""
from __future__ import annotations

import json
import os
import re
import smtplib
import ssl
import sys
import threading
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MAX_BODY = 16 * 1024
EMAIL = re.compile(r"^[^@\s<>\"',;]+@[^@\s<>\"',;]+\.[^@\s<>\"',;]{2,}$")
SLUG = re.compile(r"^[a-z0-9-]{1,40}$")
LIMITS = {"name": 120, "email": 254, "message": 5000}

# How many inquiries one address may send in a window, and how many in total.
PER_SENDER, PER_SENDER_WINDOW = 5, 10 * 60
OVERALL, OVERALL_WINDOW = 60, 60 * 60


def setting(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


class Throttle:
    """Counts recent inquiries per sender and overall, in memory."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.by_sender: dict[str, deque[float]] = defaultdict(deque)
        self.overall: deque[float] = deque()

    def allow(self, sender: str) -> bool:
        now = time.monotonic()
        with self.lock:
            mine = self.by_sender[sender]
            while mine and now - mine[0] > PER_SENDER_WINDOW:
                mine.popleft()
            while self.overall and now - self.overall[0] > OVERALL_WINDOW:
                self.overall.popleft()
            if len(mine) >= PER_SENDER or len(self.overall) >= OVERALL:
                return False
            mine.append(now)
            self.overall.append(now)
            # forget senders with nothing recent, so the table cannot grow without end
            if len(self.by_sender) > 5000:
                for key in [k for k, v in self.by_sender.items() if not v]:
                    del self.by_sender[key]
            return True


THROTTLE = Throttle()


def clean(value: object, limit: int, one_line: bool = True) -> str:
    """Text as the visitor typed it, trimmed, without control characters."""
    text = str(value if value is not None else "")[: limit * 2]
    text = "".join(ch for ch in text if ch in "\n\t" or ord(ch) >= 32)
    if one_line:
        text = " ".join(text.split())
    return text.strip()[:limit]


def read_inquiry(data: object) -> tuple[dict[str, str] | None, str]:
    """Returns the checked inquiry, or None and the reason it was refused."""
    if not isinstance(data, dict):
        return None, "not an inquiry"
    kind = data.get("kind")
    if kind not in ("contact", "access"):
        return None, "unknown kind"
    about = clean(data.get("about"), 40)
    if not SLUG.match(about):
        return None, "unknown topic"
    name = clean(data.get("name"), LIMITS["name"])
    email = clean(data.get("email"), LIMITS["email"])
    message = clean(data.get("message"), LIMITS["message"], one_line=False)
    if not name:
        return None, "name is required"
    if not EMAIL.match(email):
        return None, "a valid email is required"
    if kind == "contact" and not message:
        return None, "a message is required"
    return {"kind": kind, "about": about, "name": name, "email": email, "message": message}, ""


def mail_ready() -> bool:
    return bool(setting("SMTP_HOST") and setting("SMTP_FROM") and setting("INQUIRY_TO"))


def build_email(inq: dict[str, str]) -> EmailMessage:
    what = "Access request" if inq["kind"] == "access" else "Contact"
    msg = EmailMessage()
    msg["Subject"] = f"[ZayloLabs] {what} - {inq['about']} - {inq['name']}"
    msg["From"] = setting("SMTP_FROM")
    msg["To"] = setting("INQUIRY_TO")
    msg["Reply-To"] = inq["email"]
    lines = [
        f"{what} from the ZayloLabs website",
        "",
        f"About:  {inq['about']}",
        f"Name:   {inq['name']}",
        f"Email:  {inq['email']}",
    ]
    if inq["message"]:
        lines += ["", "Message:", inq["message"]]
    lines += ["", "Reply to this email to answer them directly."]
    msg.set_content("\n".join(lines))
    return msg


def send(msg: EmailMessage) -> None:
    host, port = setting("SMTP_HOST"), int(setting("SMTP_PORT", "587"))
    user, password = setting("SMTP_USER"), os.environ.get("SMTP_PASSWORD", "")
    context = ssl.create_default_context()
    if setting("SMTP_SECURE", "false").lower() == "true":
        server: smtplib.SMTP = smtplib.SMTP_SSL(host, port, timeout=20, context=context)
    else:
        server = smtplib.SMTP(host, port, timeout=20)
    with server:
        if not isinstance(server, smtplib.SMTP_SSL) and setting("SMTP_STARTTLS", "true").lower() != "false":
            server.starttls(context=context)
        if user:
            server.login(user, password)
        server.send_message(msg)


def log(text: str) -> None:
    print(time.strftime("%Y-%m-%dT%H:%M:%S"), text, file=sys.stderr, flush=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "inquiry"
    sys_version = ""

    def answer(self, status: int, body: dict[str, object]) -> None:
        raw = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def sender(self) -> str:
        # behind the tunnel and the web server, the visitor's address is in these headers
        for header in ("CF-Connecting-IP", "X-Real-IP"):
            value = self.headers.get(header, "").strip()
            if value:
                return value[:64]
        return self.client_address[0]

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/health":
            return self.answer(200, {"ok": True, "mail": mail_ready()})
        self.answer(404, {"ok": False})

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/inquiry":
            return self.answer(404, {"ok": False})
        if "json" not in self.headers.get("Content-Type", ""):
            return self.answer(415, {"ok": False, "error": "send JSON"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = -1
        if length <= 0 or length > MAX_BODY:
            return self.answer(413, {"ok": False, "error": "too large"})
        try:
            data = json.loads(self.rfile.read(length))
        except (ValueError, UnicodeDecodeError):
            return self.answer(400, {"ok": False, "error": "not JSON"})

        # The hidden field: people leave it empty. An automated sender is told "ok" and nothing is sent.
        if isinstance(data, dict) and clean(data.get("website"), 200):
            log("dropped: hidden field was filled in")
            return self.answer(200, {"ok": True})

        inquiry, why = read_inquiry(data)
        if inquiry is None:
            return self.answer(422, {"ok": False, "error": why})
        if not THROTTLE.allow(self.sender()):
            log("refused: too many inquiries")
            return self.answer(429, {"ok": False, "error": "too many, try later"})
        if not mail_ready():
            log("cannot send: mail is not configured")
            return self.answer(503, {"ok": False, "error": "mail is not configured"})
        try:
            send(build_email(inquiry))
        except Exception as error:  # the visitor is told it failed; the reason goes to the log
            log(f"send failed: {type(error).__name__}: {error}")
            return self.answer(502, {"ok": False, "error": "could not send"})
        log(f"sent: {inquiry['kind']} about {inquiry['about']}")
        self.answer(200, {"ok": True})

    def log_message(self, *_: object) -> None:  # requests are not logged; see log()
        return


def main() -> None:
    port = int(setting("PORT", "8080"))
    log(f"listening on {port}; mail {'ready' if mail_ready() else 'NOT configured'}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    main()
