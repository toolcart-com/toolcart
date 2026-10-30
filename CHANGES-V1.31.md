# ToolCart V1.31 — Product Price Typography

- Reduced **digital-product card price** font size to `clamp(13px, 3.45vw, 15.5px)` for more compact mobile cards.
- Changed product price lettering to muted warm grey `#817d74`, a slightly darker readable match to the user-supplied inactive category labels.
- Preserved the existing regular Arial/Helvetica font family, normal font weight, product titles, card layouts, product images, actual prices and add-to-cart behavior.
- Updated the static service-worker cache key so the new stylesheet is picked up after deployment.

No SQL migration. No live deployment.
