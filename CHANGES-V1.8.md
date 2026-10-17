# ToolCart V1.8 — Digital Products Marketplace

V1.8 adds a secure digital-product marketplace to ToolCart while preserving the existing Tools ecosystem.

## Admin product controls

Administrators can now create and edit products with:

- Product name
- Display image
- Protected PDF or image file upload
- Short description
- Full explanation
- Free or Paid access
- Price and currency
- Active / inactive status
- Premium status
- Featured status
- Limited or unlimited stock
- Quantity in stock
- Display order

Product display images are stored in R2 and shown in the ToolCart launcher. Actual product files are stored under a private R2 prefix and cannot be opened through the normal public media route.

## Customer product experience

Products appear alongside existing Tools in the launcher. A product tile shows its name and stock state. Opening a product shows:

- Available ToolCart balance
- Controlled-size display image
- Product name and description
- Price or Free status
- Current stock / unlimited stock
- Quantity + / - controls
- Add to cart
- Buy now / Get now
- Secure Open Product action after entitlement

## Purchase protection

Paid product files are not delivered until a successful server-authoritative purchase. Free products create an entitlement without charging the customer. Successful Paystack product payments are fulfilled through the same server verification/webhook system already used by ToolCart.

## ToolCart balance

V1.8 introduces a ToolCart wallet balance. Admin can adjust a customer's balance from Customer Management. Product checkout uses sufficient wallet balance first. If the balance is insufficient and Paystack is configured, checkout initializes a real Paystack transaction.

## Database

Adds migration `0003_products_marketplace.sql` for products, carts, product orders, entitlements, wallet accounts and wallet ledger data. It also adds `product_order_id` to the existing payments table.

## Current Cloudflare configuration preserved

- D1 database ID: `ef8f71eb-dd5a-41dd-b049-bfe85066aa98`
- APP_ORIGIN: `https://toolcart.mgt-toolcart.workers.dev`
- R2 binding: `MEDIA`
- R2 bucket: `toolcart-media`
