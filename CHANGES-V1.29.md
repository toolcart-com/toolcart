# ToolCart V1.29 — Add-to-cart action + navigation drawer refinement

- Fixed a delegated click handler in the product-detail modal that swallowed Add to cart, Buy now, and quantity changes by treating every tap as a product selection.
- Added immediate Add to cart processing feedback, retaining server-authoritative cart and stock verification.
- Widened the established right-side drawer, rounded its leading edge, softened menu typography and improved line spacing for iPhone.
- Replaced inconsistent menu text glyphs with uniform outline SVG icons, preserving every menu destination.
- Rotated the service-worker static cache for updated frontend resources.

No SQL migration required. No changes to authentication, wallet, purchases, Cloudflare bindings or protected downloads.
