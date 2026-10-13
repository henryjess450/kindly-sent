# Card lamp

An ESP32-C3 and a 12-LED WS2812 ring that lights up when something happens on
Kindly Sent: a card is bought, a group card is signed, a card is delivered or
opened. It runs MicroPython (`main.py`, `anims.py`) and keeps a request open to
`/api/lamp`. The admin page at **/admin/lamp** plays animations, picks which one
each event gets, and makes the lamp key.

## Wiring

| Ring | ESP32-C3 |
| ---- | -------- |
| 5V / VCC | 5V |
| GND | GND |
| DIN / IN | GPIO 10 (any free pin; avoid 2, 8 and 9, they're boot pins) |

Keep the brightness at 40% or below when it runs off a laptop's USB port: 12 LEDs
at full white draw about 0.7 A.

## Setting it up

1. Deploy the site so /admin/lamp exists.
2. Plug the ESP32 into the Mac and run `bash scripts/lamp/flash.sh`.
3. It asks for the Wi-Fi (2.4 GHz only), the DIN pin, and a lamp key (make one at /admin/lamp).
4. It flashes MicroPython, copies the code and watches the lamp come online.

Then it runs from any USB charger.

- `bash scripts/lamp/flash.sh --update` copies new code and keeps the Wi-Fi and key.
- `bash scripts/lamp/flash.sh --watch` shows what the lamp is saying.
- `LAMP_SITE=http://<mac-ip>:3200 bash scripts/lamp/flash.sh` points it at a dev server instead.

## What the lights mean

- **Rose dot going round**: joining Wi-Fi or reaching the site.
- **One red lap**: connected, waiting for cards.
- **Bottom LED breathing amber**: no Wi-Fi, or the site doesn't know the lamp key.

## Animations

| Animation | Plays by default when |
| --------- | --------------------- |
| Sealed with love | a card is bought, or a free link is used |
| Confetti | a group card is bought |
| Bloom | a yearly card is renewed |
| Fresh ink | someone signs a group card |
| Airmail | a card is delivered |
| Heartbeat | a recipient opens their card |
| Fireworks | every 25th card, after the usual one |

They're in `anims.py` and copied line for line in `src/lib/lamp/animations.ts`
(the admin page preview), so change both. Each one must start and end dark.
If the ring is mounted rotated or the animations go the wrong way round, change
`OFFSET` or `REVERSE` in the lamp's `config.py` (`mpremote edit :config.py`, or re-run the script).
