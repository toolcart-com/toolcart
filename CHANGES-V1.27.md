# ToolCart V1.27 — Root-cause load and navigation repair

- Removed the inherited 680ms view fade animation across customer tabs, preventing existing content from appearing blank after navigation.
- Repaired the cart bootstrap response/object mismatch; initial account data now includes actual verified cart contents and wallet data instead of an HTTP Response object.
- Combined two serial account startup requests into one authenticated bootstrap, preserving CSRF authentication.
- Moved optional notifications, updates, recent history and promotions out of the critical storefront startup path into an authenticated deferred endpoint.
- Cart opens immediately from the current verified cart data. Background cart refresh is rate-limited on repeat opens, with checkout still verified server-side.
- Existing static app shell loads from service-worker cache first on refresh while newer static files are refreshed in the background. API requests and private media remain uncached.
- No schema migrations; payments, purchases, provider credentials and R2 download permissions unchanged.
