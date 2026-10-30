# ToolCart V1.41 — Clean Hero Right Edge

## Scope and source
- Built directly from `ToolCart-V1.40-Complete(1).zip`.
- Homepage hero only, plus minimal cache/version metadata. No backend, admin, database, or checkout changes.

## Changes made
- Replaced the two embedded WebP backgrounds in `index.html` with the already-included, matching `hero-mobile-fixed.webp` and `hero-desktop-fixed.webp` artwork. The originals used in V1.40 had an actual white fringe inside the rightmost edge of the image; the fixed assets use a warm dark-brown photographic edge, rather than a painted white blur overlay.
- The original photograph, left white-to-photo transition, embedded-on-first-paint approach, headline, hero dimensions, border, radius, shadow, button, and content remain unchanged.
- No new image network request: the corrected mobile and desktop art remains embedded inside the initial HTML.
- Incremented service worker shell cache namespace to `toolcart-shell-v1-41` so installed browsers can receive fresh markup. The existing service worker logic is unchanged.
- Updated `VERSION` metadata to `1.41.0` (V1.40's metadata still said 1.39.0).

## Modified files
- `index.html`
- `sw.js`
- `VERSION`
- `CHANGES-V1.41.md` (new)

## SQL required
- None.

## Deployment
- Not deployed. Upload changes via the normal GitHub / Cloudflare process.
