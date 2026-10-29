# ToolCart V1.20 — continuous gold bag carousel-slide animation

- The existing gold shopping bag in the white “Scroll. Spot. Shop.” hero now glides left and right with a smooth 3D carousel-slide tilt.
- The animation loops continuously, independently of scroll, on both logged-out and signed-in homepages.
- The bag drawing itself, white hero background, text, size, actions, logos and storefront layout are unchanged.
- The old one-time bag fade-in is bypassed so the illustration is never hidden between loops.
- Reduced-motion device settings receive a subtler continuous movement.
- Bumped shell cache and version to 1.20.0.
- No database migrations or Worker/API/payment/auth/R2 changes.

## Deployment
Upload the contents of ToolCart-V1.20-Changes-Only.zip to the existing GitHub repository, preserving paths. No SQL required. The complete ZIP is the authoritative next base.
