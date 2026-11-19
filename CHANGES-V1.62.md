# ToolCart V1.62 — Secure Service Delivery, Watermarked Review & Customer Acceptance

Built from V1.61 Complete ZIP. The existing purchase/wallet/debit and product-download code was not modified.

## New workflow
- Approved assigned providers with **in-progress** orders upload a final PDF/JPEG/PNG/WebP file and a watermarked JPEG preview. Provider browser generates the reduced-size raster watermark before upload. For PDF originals, a separate screenshot/preview image must be selected. Uploaded originals and previews are private R2 objects; final originals are never displayed to customers during review.
- Each order gets a monotonically increasing delivery revision, with one active delivery at a time. Customers see their marked preview and can accept (permanently unlock original within ToolCart) or request a correction with a reason.
- Providers can submit a replacement **only after** the previous delivery was marked revision_requested. Customer actions are authenticated and conditional; duplicate decisions return conflicts.
- Customers with accepted deliveries can download the original securely. In-progress or rejected deliveries do not grant original-file access. Admin can inspect the latest delivery and feedback; providers see their own request status and correction feedback.
- Provider balances, withdrawals, refunds, and external payouts **remain disabled**. Acceptance records the customer's decision but does not automatically transfer or release money. Future dispute/refund controls must be implemented before full commercial launch.

## Security boundaries
- Provider routes require active approved identity and assignment to the order; customer routes require matching owner; admin file review requires owner admin authorization.
- New migration `0014_service_deliveries.sql` adds a separate deliveries table and append-only event log, not a rewrite of `service_orders` (which has a restrictive status CHECK). A D1 trigger blocks deliveries from unapproved providers and duplicates/out-of-order revisions.
- Files are kept in private `MEDIA` R2 paths. All delivery endpoints are authenticated with private, no-store responses and safe content disposition. The original is never publicly routed.
- Raster watermark is generated in the provider's browser, not server-side. A malicious provider could substitute an incorrect image or alter the preview before submitting; ownership of original bytes and accuracy of screenshot still need admin review and moderation. This is a **deterrent**, not cryptographic or DRM protection. Do not claim previews are impossible to reproduce.
- Only PDF and raster-image completed work is supported in this release. Provider must use an up-to-date browser with canvas encoding support. A PDF original requires a separate image preview because PDF-to-image conversion is not bundled.

## Deployment
- Apply migration using existing `npm run db:migrate:remote && npx wrangler deploy`; back up D1. Do not run SQL manually first.
- No new secrets required. Production Cloudflare D1/R2, browser watermark generation, accepted-original privacy, and iPhone Safari behavior require live testing with **non-sensitive test files**.
- Do not open the paid service workflow to real clients until end-to-end delivery, refunds/disputes, and provider payouts are verified.
