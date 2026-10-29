# ToolCart V1.22 — Gold cart left-to-right and plain-white background

- Replaced the V1.21 JPG hero cart with a transparent-background PNG derived from the same uploaded cart artwork, retaining its original colors. Removed the photographed floor/background shadow from the transparent cutout.
- Both public and signed-in hero sections use this PNG, keeping the white website background consistent behind it.
- Cart now travels only from left to right, exits on the right and re-enters from the left continuously. No swing, rotation, or mid-animation direction change.
- Removed CSS drop-shadow, shadows, and image effects from the cart and its hero artwork wrapper.
- Animation remains time-based and keeps moving during page scrolling. Reduced-motion devices use a slower pass.
- Updated version metadata and service worker cache to V1.22 to avoid stale hero assets.
- No payment, authentication, admin, D1, R2, or Workers backend changes. No SQL migration required.

## Apply
Upload only the paths in `ToolCart-V1.22-Changes-Only.zip` to the existing repository, preserving file paths. Full project backup is `ToolCart-V1.22-Complete.zip`.
