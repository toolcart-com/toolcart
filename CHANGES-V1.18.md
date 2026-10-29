# ToolCart V1.18 — Compact Right Menu & Single Toast

Base: ToolCart V1.17 Complete.

## Changes
1. Reduced the right-side menu drawer width from 86vw (max 365px) to 69vw (max 290px), with smaller padding, labels, and brand/header spacing. It stays right-aligned and remains vertically scrollable.
2. Long menu labels can wrap on narrow screens without horizontal overflow; all existing menu links remain unchanged.
3. Updated the in-page toast utility to replace the previous notification immediately, with a single resettable 3.6-second dismissal timer. Notifications no longer stack when a wishlist item is repeatedly saved/removed or when other cart actions occur.
4. Advanced version metadata and service-worker cache to 1.18.

No changes to authentication, payments, wallet, purchases, protected downloads, database schema, D1, or R2. No SQL required.
