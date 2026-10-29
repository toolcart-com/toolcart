# ToolCart V1.17 — Right-side Menu and Stable Storefront Covers

Based strictly on the supplied ToolCart V1.16 Complete ZIP.

- Menu drawer now opens from the **right** with a matching right-to-left entrance animation, right-edge position, and reversed border/shadow direction. Existing menu links, modal behaviors and account actions are unchanged.
- Wishlist heart taps now update all matching buttons in place instead of rebuilding every product and tool card. A wishlist view refresh occurs only when that view is actually active.
- Returning to the Shop tab from Cart, Categories, Wishlist, or Account no longer recreates the home grids and their loaded R2 cover images. Actual list updates, sorting, and filters still render through their original dedicated calls.
- Service worker cache key bumped to V1.17 so browsers pick up these frontend changes.

No edits to the Cloudflare Worker, D1 migrations, R2, payment processing, authentication, or protected downloads. No SQL execution required.
