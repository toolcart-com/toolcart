# ToolCart V1.7

Upload the contents of the **Changes Only** package to the root of the existing ToolCart GitHub repository and replace matching files.

No D1 migration is required.

## First administrator

1. In Cloudflare, add a Worker secret named `ADMIN_BOOTSTRAP_TOKEN` with a long temporary random value.
2. Deploy/redeploy ToolCart.
3. Open `/admin` and choose **First-time administrator setup**.
4. Enter the same temporary bootstrap token, your administrator name, email and a password of at least 12 characters.
5. After the owner administrator is created, remove or rotate `ADMIN_BOOTSTRAP_TOKEN` in Cloudflare.
6. Use the normal `/admin` sign-in form from then on.
