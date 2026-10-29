# ToolCart V1.12 — Tempo 06 Storefront

A production-oriented Cloudflare Worker/D1/R2 ToolCart build. The customer storefront has been redesigned to match the user-supplied Tempo 06 look, while retaining the prior secure purchasing and account backend.

### Update the existing website

Use **ToolCart-V1.12-Changes-Only.zip**. Extract it and upload the files inside to the root of your existing ToolCart repository, replacing same-named files.

Your Cloudflare build/deploy command remains:

`npm run db:migrate:remote && npx wrangler deploy`

This update has no new migrations; previously applied migrations will be skipped.

### Configuration remains unchanged

- D1 binding `DB` / database `toolcart`
- R2 binding `MEDIA` / bucket `toolcart-media`
- Site origin: `https://toolcart.mgt-toolcart.workers.dev`

### Security

Product files and entitlement checks remain server-side. Never use screenshots or frontend success messages as payment verification.

### Tests

Syntax/static validation and local Chromium layout checks were run; this is not a live production test.
