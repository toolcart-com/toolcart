# ToolCart V1.43 — Faster Product and Tool Image Loading

## Overview
Improve visible catalog image priorities and repeat-visit caching without embedding dynamic customer/product content in the homepage or changing checkout, wallet, authentication, or product records.

## Changes
- **app.js:** Loads the first eight visible product/tool covers eagerly, assigning the first four highest request priority. Subsequent covers load lazily, while up to 20 upcoming public images warm in the background at browser idle using at most two concurrent requests. Data Saver avoids warm-ups. The approach applies to public and signed-in storefronts.
- **admin.js:** New product cover uploads are converted to a smaller 800px/82%-quality WebP rather than 900px/88%-quality, preserving clear two-column and product-detail imagery while reducing future image transfers. Existing covers are unchanged.
- **_worker.js:** Uses Cloudflare's Cache API as a best-effort shared edge cache for public `product-covers/` and `app-icons/` R2 objects. Supports graceful fallback on cache errors. Never edge-caches private avatars, protected product files, or noncatalog media.
- **sw.js:** Keeps up to 60 public catalog covers in persistent browser Cache Storage for fast repeat visits, leaving private media and all API responses uncached. The shell cache version is bumped.
- **index.html:** Updates the storefront JS cache-busting query so the new loading behavior activates after deployment.
- **VERSION, CHANGES-V1.43.md:** Version and documentation.

## Notes
- There is no automatic embedding of live product images, because uploaded inventory changes without deployment. First-time downloads still depend on the user's network and image sizes.
- Existing uploaded images are not recompressed or modified. Newly uploaded product covers use the smaller WebP settings described above.
- No SQL migration is needed.
- Deployment is not performed by the ZIP build.
