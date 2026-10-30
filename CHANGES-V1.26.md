# ToolCart V1.26 — Static Hero & Immediate Taps

- Stopped the gold delivery cart animation on both public and signed-in homepage heroes. Same transparent art, original colors and white background.
- Product details display immediately from the already loaded catalog; the detailed API response updates current stock, wallet, and verified ownership/download permissions without reopening the modal or replacing the cover image.
- Working-tool taps now show an immediate opening state while the existing server-side access/availability check completes. External navigation still waits for the verified response.
- Add-to-cart buttons immediately indicate the pending action; the cart and success notice update only after the backend confirms it.
- No payment/auth/database/R2 changes; no SQL migration.
