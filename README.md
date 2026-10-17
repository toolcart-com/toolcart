# ToolCart V1.9

ToolCart V1.9 combines Tools and Products in one Admin workflow and adds multi-file digital products.

## Existing deployment
Use **ToolCart-V1.9-Changes-Only.zip** and upload its contents to the root of the existing GitHub repository.

## Required migration
V1.9 includes `0004_product_assets.sql`. Keep the deploy command:

`npm run db:migrate:remote && npx wrangler deploy`

After deployment, confirm `0004_product_assets.sql` shows as applied in the Cloudflare build log.
