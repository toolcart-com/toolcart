# ToolCart V1.11 — TEMPO Storefront

Based on the user-selected design 06 “Tempo — The modern goods counter” concept.

## Changes
- Replaces the signed-in ecosystem dashboard with a mobile-first, product-led ToolCart storefront.
- Replaces the signed-out landing page with the same ToolCart store identity.
- Rebuilds visual identity in warm ivory, black, and muted gold with bold typography.
- Adds an editorial hero and compact shopping-product tiles with live prices and actual stock.
- Keeps CallFocus, ChatFocus, LodgeFinder, and all Admin-defined tools, using actual D1 product/tool names. No invented sample inventory.
- Adds browsing filters for all finds, digital products, and working tools.
- Updates the signed-out public catalog to safely show active product listing metadata (not downloadable files or entitlements).
- Restyles the primary fixed mobile navigation; removes the legacy drifting animation.
- Preserves existing authentication, Admin, wallet, R2 file protection, checkout, requests, updates, subscriptions, and receipts.

## Deployment
- Upload Changes Only to root of your existing GitHub repository.
- No D1 migration is required for V1.11.
- Service worker cache version incremented and `tempo.css` included.
- The existing Cloudflare bindings and APP_ORIGIN remain unchanged.

## Visual reference limitation
The provided ChatGPT-hosted preview required authorization when retrieved. This build implements the known selected Tempo design direction, not a guaranteed pixel-perfect transcription of the inaccessible preview.
