# The card lamp's animations, in Kindly Sent colours.
#
# Each animation is a function of t (seconds since it started) that returns
# 12 (r, g, b) colours, one per LED. LED 0 is the bottom of the ring and
# height(i) counts up both sides to the top (LED 6). Every animation starts
# and ends dark, so they chain and repeat without a flash.
#
# Keep in step with src/lib/lamp/animations.ts, which draws the same
# animations on the admin page so you can preview them.
import math

N = 12

OFF = (0, 0, 0)
RED = (229, 72, 77)  # --brand, the heart in the logo
ROSE = (255, 128, 140)  # the blush envelope, brighter so LEDs show it
PAPER = (255, 236, 220)  # warm card stock
BUTTER = (247, 196, 80)  # the butter envelope
SAGE = (110, 190, 120)  # the sage envelope
SKY = (70, 150, 255)  # the sky envelope
INK = (0, 113, 227)  # --blue
WHITE = (255, 255, 255)
AMBER = (255, 140, 0)


def clamp(x, lo=0.0, hi=1.0):
    return lo if x < lo else hi if x > hi else x


def ease(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def mix(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


def add(a, b, t=1.0):
    return (a[0] + b[0] * t, a[1] + b[1] * t, a[2] + b[2] * t)


def scale(a, t):
    return (a[0] * t, a[1] * t, a[2] * t)


def height(i):
    """0 at the bottom LED, 6 at the top, counting up both sides."""
    return min(i, N - i)


def behind(p, i):
    """How far LED i is behind position p, going round (0 to 12)."""
    return ((p - i) % N + N) % N


def around(i, p):
    """How many LEDs apart LED i and position p are, going the short way round."""
    k = behind(i, p)
    return min(k, N - k)


def env(t, d, fade=0.8):
    """Fades in at the start and out at the end of a d-second animation."""
    return ease(t / fade) * ease((d - t) / fade)


def hash01(n):
    """A fixed 'random' number from 0 to 1 for n (same on the admin page)."""
    return ((n * 2654435761) & 0xFFFFFFFF) / 4294967296


# ── Sealed: a card was bought ────────────────────────────────────────────
# Warm card stock fills the ring from the bottom, the red flap folds down
# over the top, the wax seal at the top glows twice, then it fades.
def sealed(t):
    fade = 1 - ease((t - 4.0) / 1.0)
    out = []
    for i in range(N):
        h = height(i)
        if t < 1.4:
            c = scale(PAPER, clamp(ease(t / 1.4) * 7 - h) * 0.55)
        else:
            k = clamp(ease((t - 1.4) / 0.9) * 4 - (6 - h))
            c = mix(scale(PAPER, 0.55), RED, k * 0.85)
        if t > 2.3:
            s = math.sin(math.pi * clamp((t - 2.3) / 1.6) * 2) ** 2
            if i == N // 2:
                c = add(c, WHITE, s * 0.45)
            elif i == N // 2 - 1 or i == N // 2 + 1:
                c = add(c, ROSE, s * 0.5)
        out.append(scale(c, fade))
    return out


# ── Heartbeat: the recipient opened their card ───────────────────────────
# The ring beats red, lub-dub, three times. The top lobes and the point at
# the bottom beat hardest, like the heart in the logo.
def heartbeat(t):
    e = env(t, 4.0, 0.4)
    u = t % 1.2
    beat = max(math.exp(-(((u - 0.15) / 0.08) ** 2)), 0.7 * math.exp(-(((u - 0.42) / 0.08) ** 2)))
    out = []
    for i in range(N):
        shape = 0.8 if i == 0 else 0.35 + 0.65 * clamp(1 - abs(height(i) - 4.5) / 2.5)
        c = add(scale(RED, 0.18), RED, beat * shape)
        c = add(c, ROSE, beat * beat * shape * 0.4)
        out.append(scale(c, e))
    return out


# ── Confetti: a group card was bought ────────────────────────────────────
# Pops of every envelope colour all over the ring, like a liner of confetti.
CONFETTI = (RED, BUTTER, SKY, SAGE, ROSE)


def confetti(t):
    e = env(t, 4.5, 0.4)
    out = []
    for i in range(N):
        c = OFF
        for k in range(3):
            n = i * 3 + k
            x = t - (0.2 + hash01(n + 7) * 3.6)
            if 0 <= x < 1.2:
                col = CONFETTI[int(hash01(n + 91) * 5)]
                c = add(c, col, math.exp(-x * 3) * clamp(x / 0.05))
        out.append(scale(c, e))
    return out


# ── Airmail: a card was delivered ────────────────────────────────────────
# A white letter flies round the ring twice with a red and blue airmail
# trail, slows down, lands at the top and gets a red postmark.
def airmail(t):
    p = 6 + 24 * ease(t / 3.2)
    head = ease(t / 0.3)
    trail = head * (1 - clamp((t - 3.0) / 0.6))
    letter = head * (1 - clamp((t - 3.1) / 0.3))
    mark = math.sin(math.pi * clamp((t - 3.1) / 0.9))
    out = []
    for i in range(N):
        b = behind(p, i)
        c = scale(RED if i % 2 == 0 else SKY, clamp(1 - b / 5) ** 2 * trail)
        c = add(c, WHITE, clamp(1 - min(b, N - b)) ** 2 * letter)
        c = add(c, RED, clamp(1 - around(i, 6) / 2) * mark)
        out.append(c)
    return out


# ── Bloom: a yearly card was renewed ─────────────────────────────────────
# A sage stem grows up from the bottom, then rose petals open from the top
# down, red at the heart, and sway before it fades. Another year.
def bloom(t):
    fade = 1 - ease((t - 4.3) / 1.2)
    o = ease((t - 1.2) / 1.8)
    out = []
    for i in range(N):
        h = height(i)
        if h < 3:
            c = scale(SAGE, clamp(ease(t / 1.2) * 4 - h) * 0.6)
        else:
            k = clamp(o * 4 - (6 - h))
            sway = 0.85 + 0.15 * math.sin(2 * math.pi * (t * 0.8 - h / 6))
            c = scale(mix(ROSE, RED, (h - 3) / 3), k * sway)
        out.append(scale(c, fade))
    return out


# ── Fresh ink: someone signed a group card ───────────────────────────────
# A pen nib writes one blue line round the ring, then the ink dries away.
def ink(t):
    p = 12 * ease(t / 2.2)
    nib = ease(t / 0.25) * (1 - ease((t - 2.0) / 0.4))
    dry = 1 - ease((t - 2.4) / 1.1)
    out = []
    for i in range(N):
        c = scale(INK, clamp(p - i) * 0.7 * dry)
        out.append(add(c, WHITE, clamp(1 - around(i, p)) ** 2 * nib))
    return out


# ── Fireworks: a milestone card (every 25th, by default) ─────────────────
# Three bursts in butter, red and sky, each flashing white and spreading
# both ways round the ring.
BURSTS = ((0.1, 6, BUTTER), (1.5, 2, RED), (2.9, 9, SKY))


def fireworks(t):
    e = env(t, 5.0, 0.4)
    out = []
    for i in range(N):
        c = OFF
        for t0, pos, col in BURSTS:
            x = t - t0
            if x < 0 or x > 2:
                continue
            d = around(i, pos)
            c = add(c, col, clamp(1 - abs(d - x * 4) / 1.2) * math.exp(-x * 1.6))
            c = add(c, WHITE, clamp(1 - d) * math.exp(-x * 8))
        out.append(scale(c, e))
    return out


ANIMS = {
    "sealed": (sealed, 5.0),
    "heartbeat": (heartbeat, 4.0),
    "confetti": (confetti, 4.5),
    "airmail": (airmail, 4.0),
    "bloom": (bloom, 5.5),
    "ink": (ink, 3.5),
    "fireworks": (fireworks, 5.0),
}


# ── Always-on looks (not one-shot) ───────────────────────────────────────
def glow(t):
    """Idle glow when the admin page's 'Between cards' is Glow. A dim red and rose drift. Never loops back, so never snaps."""
    out = []
    for i in range(N):
        c = mix(RED, ROSE, 0.5 + 0.5 * math.sin(2 * math.pi * (i / N - t / 10)))
        out.append(scale(c, 0.12 + 0.06 * math.sin(2 * math.pi * (t / 7 + i / N * 2))))
    return out


def connecting(t):
    """A rose dot going round: joining Wi-Fi or reaching the site."""
    p = t * 8
    return [scale(ROSE, clamp(1 - around(i, p) / 1.5) * 0.6) for i in range(N)]


def trouble(t):
    """The bottom LED breathes amber: wrong lamp key or the site can't be reached."""
    b = 0.5 - 0.5 * math.cos(2 * math.pi * t / 2.5)
    return [scale(AMBER, b * 0.5) if i == 0 else OFF for i in range(N)]


def hello(t):
    """One red lap when the lamp first reaches the site."""
    p = t / 1.2 * 12
    e = env(t, 1.2, 0.2)
    return [scale(RED, clamp(1 - around(i, p) / 2) * e) for i in range(N)]


ANIMS["hello"] = (hello, 1.2)
