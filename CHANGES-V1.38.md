# ToolCart V1.38 — Hero frame, empty cart and header balance

- Keep the pre-blended photo and original hero height while adding a subtle rounded frame and neutral-gold shadow for the public and member storefronts.
- Remove the diamond glyph from the **empty cart** placeholder. Other empty states remain as before.
- Display the authenticated customer’s current wallet balance immediately after `NGN ₦` in the top-right header, using the original tagline font and color. Initial balance comes from the existing authenticated bootstrap; refreshed balance updates on server-confirmed cart and purchase responses. Signed-out visitors see only the currency label.
- Bump the service-worker shell cache and app script query to avoid stale Safari styling.

No D1 migrations or payment changes.
