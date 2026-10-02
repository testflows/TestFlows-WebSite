<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Account and billing

Most of what the account page on the website does, the client does too.

| Command | Does |
|---|---|
| `machine account show` | shows your account |
| `machine account credits` | shows your usage credits |
| `machine account activity` | lists what they were spent on |
| `machine account products list` | lists what is for sale |
| `machine account buy usage` | opens checkout for a pack of usage credits, sized in euros as listed by `products` |
| `machine account buy plan` | subscribes to a plan, or switches tier if you already have a paid one |
| `machine account upgrade`, `downgrade` | moves you to a higher or lower plan |
| `machine account cancel` | cancels the subscription: the plan stays until it renews, then drops to Free, and your usage credits stay |
| `machine account invoices` | lists your invoices |
| `machine account orders` | lists your purchases, and resumes or cancels a pending checkout |
| `machine account payment` | updates your payment method |
| `machine account portal` | opens your billing settings |
| `machine account api-keys` | creates, lists, deletes and sets the expiry of API keys |
| `machine account devices` | lists where you are signed in (`--revoke` signs one out) |
| `machine account email` | changes your email address |
| `machine account close` | closes the account, in two steps (`--cancel` stops it) |

`payment`, `portal` and `cancel` open a browser. Add `--link` to print the
address instead.

How credits are granted and used is in the
[usage credit terms](/machine/legal/usage-credit/).

Runs, logs and disks take up space in your account. `machine storage show` says
how much, and `machine storage prune` frees the space that deleted runs and
disks left behind. `machine storage prune --status` shows the current or last
prune.
