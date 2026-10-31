# ToolCart V1.53 — Safari Icon & Branding Refresh

## Scope
Make Safari use ToolCart’s existing, approved black-and-gold symbol instead of the legacy cyan-cart favicon in address-bar suggestions, Safari tab cards, bookmarks and iOS add-to-home-screen metadata.

## Changes
- Kept existing on-page black/gold wordmark and symbol untouched.
- Added new versioned icon assets copied from the *already approved* official black/gold icon. The old stable icons are kept for backwards compatibility.
- Added a standard `/favicon.ico` for browsers that automatically request it, and a versioned `.ico` for browsers retaining the old icon.
- Updated index and admin HTML to reference new versioned favicon and Apple touch icon URLs.
- Updated `manifest.webmanifest` icons and versioned its link in storefront HTML.
- Bumped the Service Worker static shell cache to `v1-53` and precached the new brand assets. Public cover caching and private-file rules are otherwise unchanged.

## Updated files
- `index.html`, `admin.html`, `manifest.webmanifest`, `sw.js`, `VERSION`

## Added files
- `favicon.ico`, `toolcart-v153-favicon.ico`, `toolcart-v153-favicon-32.png`, `toolcart-v153-favicon-48.png`, `toolcart-v153-icon-192.png`, `toolcart-v153-icon-512.png`, `toolcart-v153-touch-180.png`, `CHANGES-V1.53.md`

## Notes
- Safari may retain older icons in browsing history, bookmarks, or saved Home Screen shortcuts until it refreshes them. Updating the website cannot immediately wipe Safari's local icon cache.
- Existing payment, webhook, checkout, D1, R2, administration, and UI were not modified.
- No SQL or environment variable changes required. Not deployed.
