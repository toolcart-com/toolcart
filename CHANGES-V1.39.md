# ToolCart V1.39 — header wallet and hero frame refinements

- Moved the live header-wallet element from the signed-out header into the signed-in header. Its value is populated by the existing server-synced wallet state, so it responds to bootstrap, cart refresh and completed orders. The public header remains currency-only.
- Removed the duplicate Available Balance card from the Cart and Purchased Items views; the two-tab switch moves into the vacated space without changing wallet logic.
- Refined the hero's right border with a subtle white edge feather to soften the rectangular appearance of the photo at the rounded frame, retaining the full original hero dimensions.
- Updated storefront asset version and offline cache namespace so browsers refresh the changed CSS/HTML.

No SQL migration required. Customer accounts, payments, purchase access, wallet storage and protected downloads are unchanged.
