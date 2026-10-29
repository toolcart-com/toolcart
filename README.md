# ToolCart V1.11 — Tempo Storefront

Premium mobile-first ToolCart storefront based on the selected “06 Tempo” concept.

All actual products and tools are read from the existing D1 tables. No hardcoded demo products are shipped. ToolCart accounts, protected digital downloads, cart, wallet, subscriptions, notifications, updates, support, and Admin remain in place.

## Install this update

Extract **ToolCart-V1.11-Changes-Only.zip**, select the files **inside** its folder and upload to the **root of your current ToolCart GitHub repository**, replacing matching files. Cloudflare will run the existing build/deploy pipeline. No new migration is required.

## Existing configuration retained

- D1 binding: `DB` (`toolcart`)
- D1 database ID: `ef8f71eb-dd5a-41dd-b049-bfe85066aa98`
- R2 binding: `MEDIA` (`toolcart-media`)
- APP_ORIGIN: `https://toolcart.mgt-toolcart.workers.dev`
- Admin: `/admin` or `/admin.html`

## Security

Public product browse only reveals public listing metadata; it does **not** expose protected product files or download entitlements. Downloads remain gated by the existing backend purchase checks.

## Reference fidelity

The shared `chatgpt.site` reference returned an access error for unauthenticated retrieval. This implementation draws on the saved design description of **06 Tempo — The modern goods counter** (bold letterforms, compact shopping cards, white, black and gold), and is not a guaranteed exact visual export of the reference.
