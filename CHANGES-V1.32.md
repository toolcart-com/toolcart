# ToolCart V1.32 — Instant Cart Quantity Controls

- Quantity plus/minus buttons update quantity, total, and header cart badge immediately, without waiting for D1.
- Consecutive taps on the same product collapse into the latest requested quantity, with sequential server writes to prevent out-of-order quantity updates.
- Cart refresh waits until optimistic edits complete; on API failure an authoritative cart refresh restores the server value and an error is shown.
- Checkout waits for pending cart updates to finish so the server verifies the intended quantities before charging.
- No schema migrations, payment-provider changes, or adjustments to product data or styling.

The visible response is immediate; Cloudflare confirmation remains network-dependent.
