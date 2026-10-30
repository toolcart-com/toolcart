# ToolCart V1.23 — Visible Gold Cart Animation

- Fixed the homepage cart animation clipping at the edges of the hero. The full gold cart stays visible throughout the loop, including at the leftmost and rightmost frames.
- Replaced the offscreen entrance with a short blur on the in-place return to the left, fading back to a crisp cart as it moves toward the right. No image opacity or shadow changes.
- Preserved the transparent original-color cart artwork, plain white background, both signed-in and signed-out layouts, and all other website functionality.
- Bumped the service worker cache key for updated Safari assets.

No SQL migration required.
