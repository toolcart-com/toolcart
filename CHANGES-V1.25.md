# ToolCart V1.25 — Fast Cart & Refresh Resilience

- Authenticated bootstrap includes the user’s current cart items, wallet snapshot, total, and count; removes repeated load-screen wait on every Cart open.
- Cart opens synchronously from current session data, with silent background server reconciliation; no cached checkout authorizations or protected file contents.
- Cart quantity changes use the server’s authoritative PATCH response; remove/add update the visible cart from confirmed mutations, then reconcile in the background.
- Public homepage header and hero are visible before slow initial session calls complete; signed-in UI swaps in only after bootstrap data is ready.
- Service worker caches public static shell assets by release and uses a short network fallback for slow navigations; authenticated APIs and R2 media are not cached.
- Eagerly loads the first two visible storefront covers instead of deferring these images on mobile.
- Avoids unneeded redraws on Safari back/forward cache restoration.
- No SQL migration; payment, authentication, D1, and R2 permission implementations are unchanged.
