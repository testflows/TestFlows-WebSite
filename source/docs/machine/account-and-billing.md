<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Account and billing

Most of what the account page on the website does, the client does too.

| Command | Does |
|---|---|
| [`machine account show`](commands.md#machine-account-show) | shows your account |
| [`machine account provision`](commands.md#machine-account-provision) | sets up account storage, which the first session needs |
| [`machine account credits`](commands.md#machine-account-credits) | shows your usage credits |
| [`machine account activity`](commands.md#machine-account-activity) | lists what they were spent on |
| [`machine account products list`](commands.md#machine-account-products-list) | lists what is for sale |
| [`machine account buy usage`](commands.md#machine-account-buy-usage) | opens checkout for a pack of usage credits, sized in euros as listed by `products` |
| [`machine account buy plan`](commands.md#machine-account-buy-plan) | subscribes to a plan, or switches tier if you already have a paid one |
| [`machine account upgrade`](commands.md#machine-account-upgrade), [`machine account downgrade`](commands.md#machine-account-downgrade) | moves you to a higher or lower plan |
| [`machine account cancel`](commands.md#machine-account-cancel) | cancels the subscription: the plan stays until it renews, then drops to Free, and your usage credits stay |
| [`machine account invoices`](commands.md#machine-account-invoices) | lists your invoices |
| [`machine account orders`](commands.md#machine-account-orders) | lists your purchases, and resumes or cancels a pending checkout |
| [`machine account payment`](commands.md#machine-account-payment) | updates your payment method |
| [`machine account portal`](commands.md#machine-account-portal) | opens your billing settings |
| [`machine account api-keys`](commands.md#machine-account-api-keys) | creates, lists, deletes and sets the expiry of API keys |
| [`machine account devices`](commands.md#machine-account-devices) | lists where you are signed in (`--revoke` signs one out) |
| [`machine account email`](commands.md#machine-account-email) | changes your email address |
| [`machine account close`](commands.md#machine-account-close) | closes the account, in two steps (`--cancel` stops it) |

`payment`, `portal` and `cancel` open a browser. Add `--link` to print the
address instead.

How credits are granted and used is in the
[usage credit terms](/machine/legal/usage-credit/).

Runs, logs and disks take up space in your account. [`machine storage show`](commands.md#machine-storage-show) says
how much, and [`machine storage prune`](commands.md#machine-storage-prune) frees the space that deleted runs and
disks left behind. [`machine storage prune`](commands.md#machine-storage-prune) `--status` shows the current or last
prune.

[`machine storage check`](commands.md#machine-storage-check) reads everything in your account's
storage back and reports what it could not read, showing its progress as it
goes. It writes nothing.

Your plan's storage quota counts TOTAL: what your runs and disks hold, and the
space deleted ones have not given back yet. [`machine account show`](commands.md#machine-account-show) shows the
same figure. Deleting a run or a disk moves its space to PRUNABLE, which still
counts until you prune. The figures are from the last measurement, and
`machine storage --refresh` measures again.

At the quota, a session starts no machine and creates no branch:
`machine create`, `machine start`, `machine fork`, `machine go`,
`machine detach`, `machine disks build` and `machine disks push` are refused.
A machine that is already running keeps recording and saving. To get under
the quota, delete runs or disks, stop your sessions, and prune.
