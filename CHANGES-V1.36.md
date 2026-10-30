# ToolCart V1.36 — Integrated hero artwork

- Used the user-supplied original photo to pre-blend the right side of the homepage hero into a pure white left side.
- Preserved the live Scroll. Spot. Shop. headline, its colors and layout, original hero height, category strip, button and product grid.
- Rendered the same artwork on public and signed-in homepages.
- Removed the old separately loading cart illustration on both heroes.
- Embedded compressed mobile and desktop WebP hero artwork as CSS data URLs directly in index.html, so the image is available with the initial document without a separate image fetch or after-load swap. Reusable WebP source assets are included.
- Updated the service worker cache name. No SQL or backend changes.
