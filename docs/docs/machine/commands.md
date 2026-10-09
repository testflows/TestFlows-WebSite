<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Commands

`machine --help` lists these commands, in this order. The options apply to every
command. Add `--help` after a command to list its own options. Where a command
takes further commands, those follow it, so each one has a heading.

## Options

| Option | Does |
|---|---|
| `-o`, `--output` | Output format: text, wide, raw, or json. The default is text. Wide adds columns to list output. |
| `--version` | Show version and license. |
| `--no-colors` | Disable terminal color highlighting. |
| `--debug` | Show the messages exchanged with the service. |
| `--api-url` | Cloud API base URL. Overrides `TESTFLOWS_MACHINE_API_URL` and the default. |
| `-s`, `--session` | Target session, by name, id, or unique prefix. Goes before the command, as every option here does. Commands that need no session ignore it. |
| `--timeout` | Give up after S seconds, for commands that wait. The default is no limit. 0 means check once. |
| `-q`, `--quiet` | No progress or spinners. |

## machine login

Sign in. See [Signing up](getting-started.md#signing-up).

A sign-in code is emailed. Use account signup if there is no account yet.

```
usage: machine login [-h]
```

Examples:

```
machine login  sign in
```

See also:

- [`machine account`](#machine-account)
- [`machine logout`](#machine-logout)
- [`machine sessions`](#machine-sessions)

## machine sessions

List and manage sessions. See [Sessions](sessions.md).

A session is a reserved machine in the cloud. It holds CPUs, memory and disk
space for runs. A run is created, started and stored in a session.

Create a session, then use it so later commands target it by default. The create
subcommand does not select the session. The use subcommand does.

Use -s to select a session for a single command. A session bills while it runs.

```
usage: machine sessions [-h] [-w] {list,create,use,show,delete,rename,connect,disconnect} ...
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |

Examples:

```
machine sessions                 list sessions
machine sessions create work     create a session
machine sessions use work        use it in this terminal
machine sessions show work       details of work
machine sessions delete work -y  stop it and delete it
```

See also:

- [`machine login`](#machine-login)
- [`machine disks`](#machine-disks)
- [`machine create`](#machine-create)
- [`machine ping`](#machine-ping)

### machine sessions list

List sessions. See [Sessions](sessions.md).

The current session is tagged.

```
usage: machine sessions list [-h] [-w]
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |

Examples:

```
machine sessions list     list sessions
machine sessions list -w  watch the list
```

See also:

- [`machine sessions create`](#machine-sessions-create)
- [`machine sessions show`](#machine-sessions-show)
- [`machine sessions use`](#machine-sessions-use)

### machine sessions create

Create a session. See [Sessions](sessions.md).

The command waits until the session is running. Use `--no-wait` to return once
the request is accepted.

```
usage: machine sessions create [-h] [--cpus n] [--mem size] [--storage size] [--class type]
                               [--no-wait]
                               [name]
```

| Argument | Does |
|---|---|
| `[name]` | Session name (default: auto-generated) |

| Option | Does |
|---|---|
| `--cpus n` | Number of vCPUs (default: 1) |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: class baseline) |
| `--storage size` | The session's storage, GB or with a K/M/G/T suffix (default: class baseline) |
| `--class type` | Hardware class (default: plan default) |
| `--no-wait` | Return without waiting |

Examples:

```
machine sessions create work            create the session work
machine sessions create work --cpus 4   with 4 CPUs
machine sessions create work --no-wait  return once accepted
```

See also:

- [`machine sessions use`](#machine-sessions-use)
- [`machine sessions list`](#machine-sessions-list)
- [`machine sessions delete`](#machine-sessions-delete)

### machine sessions use

Make a session the default for later commands. See [Sessions](sessions.md).

The command connects first if needed. It checks that the session responds before
switching. With `--no-wait` it fails if a connect is needed and the session is
not running yet.

```
usage: machine sessions use [-h] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `--no-wait` | Fail if a connect is needed and the session is not running yet |

Examples:

```
machine sessions use work  use work in this terminal
machine sessions use       use the only session
```

See also:

- [`machine sessions create`](#machine-sessions-create)
- [`machine sessions show`](#machine-sessions-show)
- [`machine sessions connect`](#machine-sessions-connect)

### machine sessions show

Show session details. See [Sessions](sessions.md).

```
usage: machine sessions show [-h] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session name, id, or prefix (default: the only one) |

Examples:

```
machine sessions show work  details of work
```

See also:

- [`machine sessions list`](#machine-sessions-list)
- [`machine sessions use`](#machine-sessions-use)
- [`machine ping`](#machine-ping)

### machine sessions delete

Delete a session. See [Sessions](sessions.md).

The first operand names the session. Use -a to delete every session.

The command stops the machine and discards its state. A session already gone
counts as success. The command waits until a named session is gone. Use
`--no-wait` to return once the request is accepted.

Storage prune is refused while any session is live. Use -a to delete every
session first.

```
usage: machine sessions delete [-h] [-a] [-y] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `-a, --all` | Delete every session |
| `-y, --yes` | Skip the confirmation prompt |
| `--no-wait` | Return without waiting |

Examples:

```
machine sessions delete work -y  stop and delete work
machine sessions delete -a -y    delete every session
```

See also:

- [`machine sessions create`](#machine-sessions-create)
- [`machine sessions list`](#machine-sessions-list)
- [`machine storage prune`](#machine-storage-prune)

### machine sessions rename

Rename a session. See [Sessions](sessions.md).

Only the name changes. The session keeps running.

```
usage: machine sessions rename [-h] session new-name
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix |
| `new-name` | New session name |

Examples:

```
machine sessions rename work build  rename work to build
```

See also:

- [`machine sessions list`](#machine-sessions-list)
- [`machine sessions show`](#machine-sessions-show)

### machine sessions connect

Connect to a session. See [Sessions](sessions.md).

The everyday verb is sessions use. The command waits until the session is
running, if it is still provisioning. With `--no-wait` it fails if the session
is not running yet.

```
usage: machine sessions connect [-h] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `--no-wait` | Fail if the session is not running yet |

Examples:

```
machine sessions connect work  connect to work
```

See also:

- [`machine sessions use`](#machine-sessions-use)
- [`machine sessions disconnect`](#machine-sessions-disconnect)
- [`machine sessions list`](#machine-sessions-list)

### machine sessions disconnect

Disconnect from a session. See [Sessions](sessions.md).

The session keeps running. The connection is shared on this computer, so every
terminal loses it.

```
usage: machine sessions disconnect [-h] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session (default: the current one) |

Examples:

```
machine sessions disconnect work  disconnect from work
```

See also:

- [`machine sessions connect`](#machine-sessions-connect)
- [`machine sessions use`](#machine-sessions-use)

## machine ping

Check reachability and latency. See [The client](getting-started.md#the-client).

The command pings the API and the connected sessions. It reports the state,
round-trip time, jitter, setup time and certificate lifetime of each target.

```
usage: machine ping [-h] [-c n]
```

| Option | Does |
|---|---|
| `-c, --count n` | Round-trips per target (default: 3) |

Examples:

```
machine ping       reachability and latency of the API and sessions
machine ping -c 5  five round-trips per target
```

Output:

```
text  TARGET STATE RTT JITTER SETUP CERT LEFT
```

See also:

- [`machine sessions`](#machine-sessions)
- [`machine login`](#machine-login)

## machine account

Show and manage the account. See [Account and billing](account-and-billing.md).

The account holds the plan, the usage credits, the API keys and the signed-in
devices. The subcommands buy credits or a plan, manage invoices and payment, and
close the account.

```
usage: machine account [-h]
                       {devices,buy,upgrade,downgrade,payment,portal,invoices,cancel,email,products,show,credits,activity,orders,api-keys,provision,signup,close} ...
```

Examples:

```
machine account           plan, credits and quotas
machine account signup    create an account
machine account credits   credit balance
machine account activity  charges and credits
```

See also:

- [`machine login`](#machine-login)
- [`machine logout`](#machine-logout)
- [`machine sessions`](#machine-sessions)
- [`machine storage`](#machine-storage)

### machine account devices

List signed-in devices. See [Account and billing](account-and-billing.md).

Use `--revoke` to sign out one device by id.

```
usage: machine account devices [-h] [--revoke id]
```

| Option | Does |
|---|---|
| `--revoke id` | Sign out one device by its id (or a unique id prefix) |

Examples:

```
machine account devices             signed-in devices
machine account devices --revoke 3  sign out device 3
```

See also:

- [`machine login`](#machine-login)
- [`machine logout`](#machine-logout)

### machine account buy

Buy usage credits or a plan. See [Account and billing](account-and-billing.md).

```
usage: machine account buy [-h] {usage,plan} ...
```

Examples:

```
machine account buy usage 10      buy 10 EUR of usage credits
machine account buy plan starter  subscribe to starter
```

See also:

- [`machine account buy usage`](#machine-account-buy-usage)
- [`machine account buy plan`](#machine-account-buy-plan)
- [`machine account products`](#machine-account-products)

### machine account buy usage

Buy usage credits.

The command opens checkout for the named pack size.

```
usage: machine account buy usage [-h] [-y] eur
```

| Argument | Does |
|---|---|
| `eur` | Pack size in euros, as account products lists it |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |

Examples:

```
machine account buy usage 10     buy 10 EUR of usage credits
machine account buy usage 10 -y  without asking
```

See also:

- [`machine account buy plan`](#machine-account-buy-plan)
- [`machine account credits`](#machine-account-credits)
- [`machine account products list`](#machine-account-products-list)

### machine account buy plan

Subscribe to a plan.

On a paid plan, the command upgrades or downgrades to the named tier instead.

```
usage: machine account buy plan [-h] [-y] tier
```

| Argument | Does |
|---|---|
| `tier` | Plan tier (e.g. starter, pro) |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |

Examples:

```
machine account buy plan starter     subscribe to starter
machine account buy plan starter -y  without asking
```

See also:

- [`machine account upgrade`](#machine-account-upgrade)
- [`machine account buy usage`](#machine-account-buy-usage)
- [`machine account products list`](#machine-account-products-list)

### machine account upgrade

Upgrade to a higher plan. See [Account and billing](account-and-billing.md).

An omitted tier is the next one up. Use `--link` to print the URL without
opening a browser.

```
usage: machine account upgrade [-h] [--link] [-y] [tier]
```

| Argument | Does |
|---|---|
| `[tier]` | Target tier (default: next up) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |
| `-y, --yes` | Skip the confirmation prompt |

Examples:

```
machine account upgrade      upgrade to the next plan
machine account upgrade pro  upgrade to pro
```

See also:

- [`machine account downgrade`](#machine-account-downgrade)
- [`machine account buy plan`](#machine-account-buy-plan)
- [`machine account show`](#machine-account-show)

### machine account downgrade

Downgrade to a lower plan. See [Account and billing](account-and-billing.md).

An omitted tier is the next one down. Use `--link` to print the URL without
opening a browser.

```
usage: machine account downgrade [-h] [--link] [-y] [tier]
```

| Argument | Does |
|---|---|
| `[tier]` | Target tier (default: next down) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |
| `-y, --yes` | Skip the confirmation prompt |

Examples:

```
machine account downgrade          downgrade to the previous plan
machine account downgrade starter  downgrade to starter
```

See also:

- [`machine account upgrade`](#machine-account-upgrade)
- [`machine account cancel`](#machine-account-cancel)
- [`machine account show`](#machine-account-show)

### machine account payment

Update the payment method. See [Account and billing](account-and-billing.md).

Use `--link` to print the URL without opening a browser.

```
usage: machine account payment [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

Examples:

```
machine account payment         update the payment method
machine account payment --link  print the link only
```

See also:

- [`machine account portal`](#machine-account-portal)
- [`machine account invoices`](#machine-account-invoices)

### machine account portal

Open billing settings. See [Account and billing](account-and-billing.md).

Use `--link` to print the URL without opening a browser.

```
usage: machine account portal [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

Examples:

```
machine account portal         open billing settings
machine account portal --link  print the link only
```

See also:

- [`machine account payment`](#machine-account-payment)
- [`machine account invoices`](#machine-account-invoices)

### machine account invoices

List and manage invoices. See [Account and billing](account-and-billing.md).

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account invoices [-h] [--since date|age] [--until date|age]
                                [--status {draft,open,paid,uncollectible,void}] [--limit n]
                                [--sort field] [--reverse]
                                {list,download} ...
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--status {draft,open,paid,uncollectible,void}` | Filter by invoice status |
| `--limit n` | Cap to most recent n (default: 25, max 100) |
| `--sort field` | Sort by created or amount |
| `--reverse` | Reverse sort order |

Examples:

```
machine account invoices                list invoices
machine account invoices --status paid  paid invoices only
```

See also:

- [`machine account invoices list`](#machine-account-invoices-list)
- [`machine account invoices download`](#machine-account-invoices-download)
- [`machine account activity`](#machine-account-activity)

### machine account invoices list

List invoices.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account invoices list [-h] [--since date|age] [--until date|age]
                                     [--status {draft,open,paid,uncollectible,void}] [--limit n]
                                     [--sort field] [--reverse]
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--status {draft,open,paid,uncollectible,void}` | Filter by invoice status |
| `--limit n` | Cap to most recent n (default: 25, max 100) |
| `--sort field` | Sort by created or amount |
| `--reverse` | Reverse sort order |

Examples:

```
machine account invoices list              list invoices
machine account invoices list --since 30d  the last 30 days
```

See also:

- [`machine account invoices download`](#machine-account-invoices-download)
- [`machine account activity`](#machine-account-activity)

### machine account invoices download

Open an invoice.

The hosted page has the PDF and receipt. Use `--link` to print the URL without
opening a browser.

```
usage: machine account invoices download [-h] [--link] invoice-id
```

| Argument | Does |
|---|---|
| `invoice-id` | Invoice id (in_…) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

Examples:

```
machine account invoices download in_123  open invoice in_123
```

See also:

- [`machine account invoices list`](#machine-account-invoices-list)
- [`machine account activity`](#machine-account-activity)

### machine account cancel

Cancel the subscription. See [Account and billing](account-and-billing.md).

The plan stays until renewal, then drops to Free. Usage credits stay. Use
`--link` to print the URL without opening a browser.

```
usage: machine account cancel [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

Examples:

```
machine account cancel         cancel the subscription
machine account cancel --link  print the link only
```

See also:

- [`machine account downgrade`](#machine-account-downgrade)
- [`machine account buy plan`](#machine-account-buy-plan)
- [`machine account show`](#machine-account-show)

### machine account email

Change the account email. See [Account and billing](account-and-billing.md).

A code goes to the current inbox. A link goes to the new one.

```
usage: machine account email [-h] [-y] email
```

| Argument | Does |
|---|---|
| `email` | New email address |

| Option | Does |
|---|---|
| `-y, --yes` | Skip confirmation prompts |

Examples:

```
machine account email me@example.com  change the email
```

See also:

- [`machine account show`](#machine-account-show)
- [`machine login`](#machine-login)

### machine account products

List products for sale. See [Account and billing](account-and-billing.md).

```
usage: machine account products [-h] {list} ...
```

Examples:

```
machine account products list  products for sale
```

See also:

- [`machine account products list`](#machine-account-products-list)
- [`machine account buy`](#machine-account-buy)

### machine account products list

List products for sale.

```
usage: machine account products list [-h]
```

Examples:

```
machine account products list  products for sale
```

See also:

- [`machine account buy usage`](#machine-account-buy-usage)
- [`machine account buy plan`](#machine-account-buy-plan)

### machine account show

Show the account. See [Account and billing](account-and-billing.md).

```
usage: machine account show [-h]
```

Examples:

```
machine account show  plan, credits and quotas
```

See also:

- [`machine account credits`](#machine-account-credits)
- [`machine account activity`](#machine-account-activity)
- [`machine account invoices`](#machine-account-invoices)

### machine account credits

Show usage credits. See [Account and billing](account-and-billing.md).

```
usage: machine account credits [-h]
```

Examples:

```
machine account credits  the credit balance
```

See also:

- [`machine account activity`](#machine-account-activity)
- [`machine account buy usage`](#machine-account-buy-usage)
- [`machine account show`](#machine-account-show)

### machine account activity

Show usage credit activity. See [Account and billing](account-and-billing.md).

The listing shows the newest 25. Use `--limit` for a different page size. Naming
a session focuses the listing on that session.

```
usage: machine account activity [-h] [--since date|age] [--until date|age] [--period date]
                                [--type {included,reserved,settled,expired,expired-removed,credit-purchase}]
                                [--credit-type {included,usage}] [--limit n] [--sort field]
                                [--reverse]
                                [session]
```

| Argument | Does |
|---|---|
| `[session]` | Show one session's transactions, by name, id or id prefix |

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--period date` | Show credit activity in the period containing DATE |
| `--type {included,reserved,settled,expired,expired-removed,credit-purchase}` | Filter by activity type |
| `--credit-type {included,usage}` | Filter by credit type (included or usage) |
| `--limit n` | Cap to most recent n (default: 25, max 500) |
| `--sort field` | Sort by sequence or amount |
| `--reverse` | Reverse sort order |

Examples:

```
machine account activity             charges and credits
machine account activity --since 7d  the last 7 days
```

See also:

- [`machine account credits`](#machine-account-credits)
- [`machine account invoices`](#machine-account-invoices)
- [`machine account show`](#machine-account-show)

### machine account orders

List and manage orders. See [Account and billing](account-and-billing.md).

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account orders [-h]
                              [--status {pending,processing,completed,cancelled,expired,failed}]
                              [--limit n]
                              {list,resume,cancel} ...
```

| Option | Does |
|---|---|
| `--status {pending,processing,completed,cancelled,expired,failed}` | Filter by status |
| `--limit n` | Cap to most recent n (default: 25, max 200) |

Examples:

```
machine account orders list    list orders
machine account orders resume  resume the pending order
machine account orders cancel  cancel the pending order
```

See also:

- [`machine account orders list`](#machine-account-orders-list)
- [`machine account buy`](#machine-account-buy)
- [`machine account activity`](#machine-account-activity)

### machine account orders list

List orders.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account orders list [-h]
                                   [--status {pending,processing,completed,cancelled,expired,failed}]
                                   [--limit n]
```

| Option | Does |
|---|---|
| `--status {pending,processing,completed,cancelled,expired,failed}` | Filter by status |
| `--limit n` | Cap to most recent n (default: 25, max 200) |

Examples:

```
machine account orders list                   list orders
machine account orders list --status pending  pending orders
```

See also:

- [`machine account orders resume`](#machine-account-orders-resume)
- [`machine account orders cancel`](#machine-account-orders-cancel)

### machine account orders resume

Resume a pending checkout.

The order defaults to the single pending order. Use `--link` to print the URL
without opening a browser.

```
usage: machine account orders resume [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

Examples:

```
machine account orders resume         resume the pending order
machine account orders resume --link  print the link only
```

See also:

- [`machine account orders list`](#machine-account-orders-list)
- [`machine account orders cancel`](#machine-account-orders-cancel)

### machine account orders cancel

Cancel a pending order so another buy can start.

The order defaults to the single pending order.

```
usage: machine account orders cancel [-h]
```

Examples:

```
machine account orders cancel  cancel the pending order
```

See also:

- [`machine account orders list`](#machine-account-orders-list)
- [`machine account buy`](#machine-account-buy)

### machine account api-keys

List and manage API keys. See [Account and billing](account-and-billing.md).

A key controls runs, disks and sessions. It cannot change billing or the
account.

```
usage: machine account api-keys [-h] {list,create,delete,update} ...
```

Examples:

```
machine account api-keys list       list API keys
machine account api-keys create ci  create the key ci
```

See also:

- [`machine account api-keys list`](#machine-account-api-keys-list)
- [`machine account api-keys create`](#machine-account-api-keys-create)
- [`machine login`](#machine-login)

### machine account api-keys list

List API keys.

```
usage: machine account api-keys list [-h]
```

Examples:

```
machine account api-keys list  list API keys
```

See also:

- [`machine account api-keys create`](#machine-account-api-keys-create)
- [`machine account api-keys delete`](#machine-account-api-keys-delete)

### machine account api-keys create

Create an API key.

The secret is shown once. A sign-in code is required.

```
usage: machine account api-keys create [-h] [--expiry days|never] name
```

| Argument | Does |
|---|---|
| `name` | Label to recognize this key later |

| Option | Does |
|---|---|
| `--expiry days\|never` | Expire after N days (e.g. 30), or "never" (default: never) |

Examples:

```
machine account api-keys create ci              create the key ci
machine account api-keys create ci --expiry 30  expire in 30 days
```

See also:

- [`machine account api-keys list`](#machine-account-api-keys-list)
- [`machine account api-keys update`](#machine-account-api-keys-update)

### machine account api-keys delete

Delete an API key.

A sign-in code is required.

```
usage: machine account api-keys delete [-h] id
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys lists it |

Examples:

```
machine account api-keys delete 3  delete key 3
```

See also:

- [`machine account api-keys list`](#machine-account-api-keys-list)
- [`machine account api-keys create`](#machine-account-api-keys-create)

### machine account api-keys update

Set the expiry of an API key.

A sign-in code is required.

```
usage: machine account api-keys update [-h] id days|never
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys lists it |
| `days\|never` | Number of days from now (e.g. 30) or "never" |

Examples:

```
machine account api-keys update 3 30     expire key 3 in 30 days
machine account api-keys update 3 never  never expire key 3
```

See also:

- [`machine account api-keys list`](#machine-account-api-keys-list)
- [`machine account api-keys create`](#machine-account-api-keys-create)

### machine account provision

Set up cloud storage. See [Signing up](getting-started.md#signing-up).

The command is safe to repeat while it is still working.

```
usage: machine account provision [-h]
```

Examples:

```
machine account provision  set up cloud storage
```

See also:

- [`machine account signup`](#machine-account-signup)
- [`machine sessions create`](#machine-sessions-create)

### machine account signup

Create an account. See [Signing up](getting-started.md#signing-up).

A link is emailed to finish signing up.

```
usage: machine account signup [-h]
```

Examples:

```
machine account signup  create an account
```

See also:

- [`machine login`](#machine-login)
- [`machine account provision`](#machine-account-provision)
- [`machine account show`](#machine-account-show)

### machine account close

Close the account. See [Account and billing](account-and-billing.md).

Closing takes two steps. The first starts the close. The second confirms it
after the machines stop. Use `--cancel` to abort a close in progress.

```
usage: machine account close [-h] [-y] [--cancel]
```

| Option | Does |
|---|---|
| `-y, --yes` | Skip confirmation prompts |
| `--cancel` | Abort closing and return the account to active |

Examples:

```
machine account close -y        close the account
machine account close --cancel  cancel a pending close
```

See also:

- [`machine logout`](#machine-logout)
- [`machine account show`](#machine-account-show)

## machine logout

Sign out. See [Signing up](getting-started.md#signing-up).

The command revokes the access token. Use `--everywhere` to sign out of every
device and browser.

```
usage: machine logout [-h] [--everywhere]
```

| Option | Does |
|---|---|
| `--everywhere` | Sign out of every device and browser, not just this one |

Examples:

```
machine logout               sign out
machine logout --everywhere  sign out of every device
```

See also:

- [`machine login`](#machine-login)
- [`machine account`](#machine-account)

## machine disks

List and manage disks. See [Disks](disks.md).

A disk is the filesystem image that a run is created from. Build one from a
static binary, a Docker image or a Compose project.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine disks [-h] [-q] [--no-trunc] [--deleted] [--label name=value] [--since date|age]
                     [--limit n] [--offset n] [-w]
                     {list,build,show,transfers,delete,rename,verify,cancel} ...
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show removed disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date or age |
| `--limit n` | Show at most n disks (default: 25) |
| `--offset n` | Skip the first n disks |
| `-w, --watch` | Watch for changes |

Examples:

```
machine disks                              list disks
machine disks build --binary ./prog hello  build a disk from a program
machine disks show hello                   details of hello
machine disks transfers                    uploads in progress
```

Refuses, and the way past:

```
a disk with runs  machine disks delete hello -f -y
```

See also:

- [`machine create`](#machine-create)
- [`machine preload`](#machine-preload)
- [`machine artifacts`](#machine-artifacts)
- [`machine storage`](#machine-storage)

### machine disks list

List disks. See [Disks](disks.md).

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine disks list [-h] [-q] [--no-trunc] [--deleted] [--label name=value]
                          [--since date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show removed disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date or age |
| `--limit n` | Show at most n disks (default: 25) |
| `--offset n` | Skip the first n disks |
| `-w, --watch` | Watch for changes |

Examples:

```
machine disks list                 list disks
machine disks list --label team=a  disks with a label
machine disks list -w              watch the list
```

See also:

- [`machine disks show`](#machine-disks-show)
- [`machine disks build`](#machine-disks-build)
- [`machine disks transfers`](#machine-disks-transfers)

### machine disks build

Build a disk from a binary, image or Compose project. See [Disks](disks.md).

Exactly one source is required. `--binary` wraps a static executable in an image
built around it. `--from` names a public image that the build pulls. No Docker
is needed for `--from`.

`--image` takes a Docker image as a save tar or a name in the local Docker.
`--compose` takes a project directory and the images its services name.

A binary or an image runs as one container. Use `--entrypoint` to set the
executable. Use `--env` to set a variable in its environment. Pass arguments
after --.

A project runs every service in it and takes none of the three. The disk holds
each `--env` value as written.

With `--from` or `--binary`, `--add` puts a file or a directory in the image, as
one more layer. Without a destination the path lands in the working directory of
the image, under its own name. Write path:dest to name another place. A dest
ending in / is a directory.

The name defaults to what the source is called. The size defaults to what the
pack holds loaded, plus a gigabyte, rounded up to a whole GB. Use `--dry-run` to
see those numbers without building anything.

The build writes the images into the Docker store of the disk. A machine created
from the disk has every image present and loads nothing. Use `--load-at-boot` to
keep them on the disk as save tars. Docker then loads them each time a machine
starts from the disk.

A guest that runs docker save or docker push on one of the images needs the save
tars. Such a disk holds each image twice and is sized for both.

```
usage: machine disks build [-h] (--binary path | --image ref | --from ref | --compose dir)
                           [--size size] [--dry-run] [--load-at-boot] [--entrypoint path]
                           [--add path[:dest]] [--env name=value] [--label name=value]
                           [name] [-- args ...]
```

| Argument | Does |
|---|---|
| `[name]` | Disk name |
| `[-- args ...]` | Arguments after -- become the service's command |

| Option | Does |
|---|---|
| `--binary path` | Static x86_64 executable to wrap |
| `--image ref` | Docker image, a save tar or a name |
| `--from ref` | Public image, pulled by the build |
| `--compose dir` | Compose project directory |
| `--size size` | Disk size, MB or with a K/M/G/T suffix (default: from the pack, rounded up to a GB) |
| `--dry-run` | Report what the disk would hold and build nothing |
| `--load-at-boot` | Keep the images as tars on the disk and load them each time a machine starts from the disk |
| `--entrypoint path` | Executable the service runs |
| `--add path[:dest]` | File or directory to put in the image, repeatable; dest defaults to the image's working directory |
| `--env name=value` | Environment variable the service runs with, repeatable |
| `--label name=value` | Attach a label, repeatable; an empty value removes one the name carried |

Examples:

```
machine disks build --binary ./prog hello            from a binary
machine disks build --image app:1 hello              from a Docker image
machine disks build --compose ./app app              from a Compose project
machine disks build --binary ./prog hello --dry-run  show name and size
```

See also:

- [`machine disks list`](#machine-disks-list)
- [`machine disks transfers`](#machine-disks-transfers)
- [`machine create`](#machine-create)

### machine disks show

Show disk details. See [Disks](disks.md).

```
usage: machine disks show [-h] name
```

| Argument | Does |
|---|---|
| `name` | Disk name |

Examples:

```
machine disks show hello  details of hello
```

See also:

- [`machine disks list`](#machine-disks-list)
- [`machine disks verify`](#machine-disks-verify)
- [`machine disks delete`](#machine-disks-delete)

### machine disks transfers

Show disk transfers. See [Disks](disks.md).

The listing shows the active transfers by default. Use `--since` to include
history. Use `--since` with `--active` for transfers in flight that started in
that window.

```
usage: machine disks transfers [-h] [--active] [--since date|age] [-w]
```

| Option | Does |
|---|---|
| `--active` | Only in-flight transfers |
| `--since date\|age` | Since a date or age |
| `-w, --watch` | Watch for changes |

Examples:

```
machine disks transfers           uploads and downloads
machine disks transfers --active  those in progress
```

See also:

- [`machine disks cancel`](#machine-disks-cancel)
- [`machine disks build`](#machine-disks-build)
- [`machine storage ops`](#machine-storage-ops)

### machine disks delete

Delete disks. See [Disks](disks.md).

Deletion is permanent. The name is free at once. The bytes count against the
storage quota until a prune removes them.

A disk that a run was created from is refused. Use `--force` to delete it
anyway. Those runs stay and can no longer start.

```
usage: machine disks delete [-h] [-y] [-f] name [name ...]
```

| Argument | Does |
|---|---|
| `name [name ...]` | Disk names |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |
| `-f, --force` | Delete even while runs were created from it |

Examples:

```
machine disks delete hello -y     delete hello
machine disks delete hello -f -y  delete it and its runs
```

See also:

- [`machine disks list`](#machine-disks-list)
- [`machine delete`](#machine-delete)
- [`machine storage prune`](#machine-storage-prune)

### machine disks rename

Rename a disk. See [Disks](disks.md).

```
usage: machine disks rename [-h] name new-name
```

| Argument | Does |
|---|---|
| `name` | Current disk name |
| `new-name` | New disk name |

Examples:

```
machine disks rename hello hello2  rename hello to hello2
```

See also:

- [`machine disks show`](#machine-disks-show)
- [`machine disks list`](#machine-disks-list)

### machine disks verify

Check a stored disk against its id. See [Disks](disks.md).

The command reads the disk back out of account storage. It computes the id,
which is what the disk is stored under. A disk that reads as stored is verified.
A disk that does not is reported as damaged.

The check is a storage operation and takes about as long as reading the disk. It
keeps running if the command is interrupted. Run machine storage ops to list it.
One check runs at a time for an account.

The command waits for the result. Use `--no-wait` to return once the request is
accepted.

```
usage: machine disks verify [-h] [--no-wait] name
```

| Argument | Does |
|---|---|
| `name` | Disk name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine disks verify hello  check hello against its id
```

See also:

- [`machine disks show`](#machine-disks-show)
- [`machine storage check`](#machine-storage-check)

### machine disks cancel

Cancel a transfer in progress. See [Disks](disks.md).

```
usage: machine disks cancel [-h] name
```

| Argument | Does |
|---|---|
| `name` | Disk name |

Examples:

```
machine disks cancel hello  cancel the transfer of hello
```

See also:

- [`machine disks transfers`](#machine-disks-transfers)
- [`machine disks build`](#machine-disks-build)

## machine preload

Fetch a run or a disk onto this session.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The operand is any run or disk of the account. A run fetched here starts later
without a fetch. A disk fetched here is ready before a run is created from it.

Use -a to fetch the ancestors and disks that this session's runs need. A copy
already here is skipped. A session is required.

```
usage: machine preload [-h] [-a] {run,disk} ...
```

| Option | Does |
|---|---|
| `-a, --all` | Everything this session's runs need |

Examples:

```
machine preload run run1    fetch run1 onto the session
machine preload disk hello  fetch the disk hello onto it
```

See also:

- [`machine offload`](#machine-offload)
- [`machine sync`](#machine-sync)
- [`machine start`](#machine-start)
- [`machine disks`](#machine-disks)

### machine preload run

Preload a run into a session.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command fetches the run from shared storage onto the session. The run is
there before it is needed. A run already there is skipped. The disk of the run
is fetched with it.

```
usage: machine preload run [-h] [-a] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Every data parent this session needs |

Examples:

```
machine preload run run1  fetch run1 onto this session
machine preload run -a    fetch every run this session needs
```

See also:

- [`machine preload disk`](#machine-preload-disk)
- [`machine offload run`](#machine-offload-run)
- [`machine start`](#machine-start)

### machine preload disk

Preload a disk into a session.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command fetches the account disk onto the session. The disk is there before
a start. A disk already there is skipped.

```
usage: machine preload disk [-h] [-a] [disk]
```

| Argument | Does |
|---|---|
| `[disk]` | Disk name or id |

| Option | Does |
|---|---|
| `-a, --all` | Every disk this session's runs need |

Examples:

```
machine preload disk hello  fetch the disk hello
machine preload disk -a     fetch every disk this session needs
```

See also:

- [`machine preload run`](#machine-preload-run)
- [`machine offload disk`](#machine-offload-disk)
- [`machine disks list`](#machine-disks-list)

## machine artifacts

List, copy or print files from a run's disk.
See [Reading the disk](reading-the-disk.md).

The command reads the disk from a checkpoint, never from the live machine. It
needs no guest agent and does not change how the machine executes. Name a
checkpoint or entry with run@ref. Without it the latest checkpoint is read, and
the command says which.

```
usage: machine artifacts [-h] {ls,cp,cat} ...
```

Examples:

```
machine artifacts ls run1 /etc                list a directory of run1
machine artifacts cat run1 /etc/hostname      print a file
machine artifacts cp run1 /etc/hostname .     copy a file out
machine artifacts cat run1@cp1 /etc/hostname  read it at checkpoint cp1
```

See also:

- [`machine disks`](#machine-disks)
- [`machine dump`](#machine-dump)
- [`machine console`](#machine-console)

### machine artifacts ls

List files in a run's disk. See [Reading the disk](reading-the-disk.md).

Pin the listing to a checkpoint or entry with run@ref.

```
usage: machine artifacts ls [-h] [-l] [-a] run[@ref] [path]
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `[path]` | Path (default: /) |

| Option | Does |
|---|---|
| `-l` | Long format (mode, size, mtime, name) |
| `-a, --all` | Include the current and parent directory entries |

Examples:

```
machine artifacts ls run1 /etc            list a directory of run1
machine artifacts ls -l -a run1@cp1 /etc  long form, at cp1
```

See also:

- [`machine artifacts cat`](#machine-artifacts-cat)
- [`machine artifacts cp`](#machine-artifacts-cp)
- [`machine disks show`](#machine-disks-show)

### machine artifacts cp

Copy a file or directory from a run's disk.
See [Reading the disk](reading-the-disk.md).

Pin the copy to a checkpoint or entry with run@ref. Use -r for directories.

```
usage: machine artifacts cp [-h] [-r] run[@ref] path [dest]
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `path` | Path to copy |
| `[dest]` | Local destination file or directory (default: .) |

| Option | Does |
|---|---|
| `-r, -R, --recursive` | Copy directories recursively |

Examples:

```
machine artifacts cp run1 /etc/hostname .  copy a file out
machine artifacts cp -r run1 /etc ./etc    copy a directory out
```

See also:

- [`machine artifacts ls`](#machine-artifacts-ls)
- [`machine artifacts cat`](#machine-artifacts-cat)

### machine artifacts cat

Print a file from a run's disk. See [Reading the disk](reading-the-disk.md).

Pin the read to a checkpoint or entry with run@ref.

```
usage: machine artifacts cat [-h] run[@ref] path
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `path` | File path |

Examples:

```
machine artifacts cat run1 /etc/hostname      print a file
machine artifacts cat run1@cp1 /etc/hostname  print it at cp1
```

See also:

- [`machine artifacts ls`](#machine-artifacts-ls)
- [`machine artifacts cp`](#machine-artifacts-cp)

## machine sync

Publish a run to shared storage.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Any session can then start the run. The command runs in the session that holds
the run.

```
usage: machine sync [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine sync run1  publish run1 to shared storage
```

See also:

- [`machine preload`](#machine-preload)
- [`machine offload`](#machine-offload)
- [`machine start`](#machine-start)

## machine offload

List or drop this session's local copies.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Offload alone lists the copies this session can drop. It counts the copies in
use.

The run and disk subcommands drop one kind. Use -a to drop every run and disk
not in use. The copy in shared storage stays.

Start or preload brings a run back. The next start fetches a disk again. A
session is required.

```
usage: machine offload [-h] [--runs] [--disks] [-a] {list,run,disk} ...
```

| Option | Does |
|---|---|
| `--runs` | Only session run folders |
| `--disks` | Only session disk files |
| `-a, --all` | Every run and disk not in use |

Examples:

```
machine offload             list the copies that can be dropped
machine offload run run1    drop the session's copy of run1
machine offload disk hello  drop its copy of the disk hello
```

See also:

- [`machine preload`](#machine-preload)
- [`machine sync`](#machine-sync)
- [`machine storage`](#machine-storage)

### machine offload list

List the copies that can be dropped.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The listing shows the copies on this session that are not in use. The rest are
counted below the table. Use `--runs` or `--disks` to show one kind. Omit both,
or pass both, to show both.

```
usage: machine offload list [-h] [--runs] [--disks]
```

| Option | Does |
|---|---|
| `--runs` | Only session run folders |
| `--disks` | Only session disk files |

Examples:

```
machine offload list         copies that can be dropped
machine offload list --runs  runs only
```

See also:

- [`machine offload run`](#machine-offload-run)
- [`machine offload disk`](#machine-offload-disk)
- [`machine storage show`](#machine-storage-show)

### machine offload run

Offload a run from a session.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command drops the session's copy of the run and frees its storage. The run
itself stays in shared storage. Stop does not drop the copy.

Start or preload brings the run back. The command does not drop the disk of the
run.

```
usage: machine offload run [-h] [-a] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Every run not in use |

Examples:

```
machine offload run run1  drop the copy of run1
machine offload run -a    drop every run not in use
```

See also:

- [`machine offload disk`](#machine-offload-disk)
- [`machine preload run`](#machine-preload-run)
- [`machine start`](#machine-start)

### machine offload disk

Offload a disk from a session.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command drops the session's copy of the disk. The account disk stays. A disk
in use by a live machine is refused. The next start fetches the disk again.

```
usage: machine offload disk [-h] [-a] [disk]
```

| Argument | Does |
|---|---|
| `[disk]` | Disk name or id |

| Option | Does |
|---|---|
| `-a, --all` | Every disk not in use |

Examples:

```
machine offload disk hello  drop the copy of the disk hello
machine offload disk -a     drop every disk not in use
```

See also:

- [`machine offload run`](#machine-offload-run)
- [`machine preload disk`](#machine-preload-disk)
- [`machine disks list`](#machine-disks-list)

## machine storage

Show and manage storage. See [Account and billing](account-and-billing.md).

Storage holds the runs and disks of the account. The subcommands report its use,
list its operations, reclaim space and read every object back.

```
usage: machine storage [-h] [--refresh] {show,ops,prune,check} ...
```

| Option | Does |
|---|---|
| `--refresh` | Measure again instead of using the last measurement |

Examples:

```
machine storage show   storage the account uses
machine storage ops    storage operations
machine storage prune  reclaim space held by deleted runs
machine storage check  check every object can be read
```

See also:

- [`machine disks`](#machine-disks)
- [`machine delete`](#machine-delete)
- [`machine offload`](#machine-offload)
- [`machine account`](#machine-account)

### machine storage show

Show the storage the account uses.
See [Account and billing](account-and-billing.md).

```
usage: machine storage show [-h] [--refresh]
```

| Option | Does |
|---|---|
| `--refresh` | Measure again instead of using the last measurement |

Examples:

```
machine storage show            storage the account uses
machine storage show --refresh  measure again
```

See also:

- [`machine storage ops`](#machine-storage-ops)
- [`machine storage prune`](#machine-storage-prune)
- [`machine disks list`](#machine-disks-list)

### machine storage ops

List operations on the account's storage.

The listing shows the newest 25 operations in every state. Use `--limit` for a
different page size. Use `--state` to show some states.

STATUS says why an operation failed. It also says how many objects a running
check has read.

These operations act on the account's storage, not on a run. Machine ops does
not list them. They answer with no session.

```
usage: machine storage ops [-h] [--op-id id] [--state [^]state] [--type [^]type]
                           [--since date|age] [--until date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `--op-id id` | Show one operation, by its id (ignores `--state` and `--type`) |
| `--state [^]state` | Filter by state: pending, running, done, failed (default: all; repeat = OR; ^ excludes) |
| `--type [^]type` | Filter by type: measure, prune, verify, check (default: all; repeat = OR; ^ excludes) |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--limit n` | Show at most n operations (default: 25) |
| `--offset n` | Skip the first n operations |
| `-w, --watch` | Watch for changes |

Examples:

```
machine storage ops                  the newest operations
machine storage ops --state running  those still running
```

See also:

- [`machine storage check`](#machine-storage-check)
- [`machine storage prune`](#machine-storage-prune)
- [`machine ops`](#machine-ops)

### machine storage prune

Reclaim space held by deleted runs and disks.
See [Account and billing](account-and-billing.md).

The command does nothing while unused data is below 5% of storage.

```
usage: machine storage prune [-h] [-y] [--status]
```

| Option | Does |
|---|---|
| `-y, --yes` | Do not ask for confirmation |
| `--status` | Show the current or last prune and exit |

Examples:

```
machine storage prune -y        reclaim space without asking
machine storage prune --status  the current or last prune
```

See also:

- [`machine storage ops`](#machine-storage-ops)
- [`machine storage show`](#machine-storage-show)
- [`machine delete`](#machine-delete)

### machine storage check

Check that every stored object can be read.
See [Account and billing](account-and-billing.md).

The command reads everything in the account's storage back and reports what
could not be read.

Nothing is written. The check can run while sessions and a prune run. An object
deleted while the check runs is counted apart, not as unreadable.

The command waits for the check. It shows the objects and bytes read as it goes.
Use `--no-wait` to return once the request is accepted.

The check is an operation. It goes on if the command is interrupted. Run machine
storage ops to list it.

The command fails when an object could not be read. It names each one with the
id of the failed request.

```
usage: machine storage check [-h] [--status] [--no-wait]
```

| Option | Does |
|---|---|
| `--status` | Show the current or last check and exit |
| `--no-wait` | Return once the check is started |

Examples:

```
machine storage check           read every stored object
machine storage check --status  the current or last check
```

See also:

- [`machine storage ops`](#machine-storage-ops)
- [`machine disks verify`](#machine-disks-verify)

## machine create

Create a run and start it.
See [Creating a run](running-a-machine.md#creating-a-run).

Options configure the machine: disk, memory, CPUs, devices and virtual time. The
RNG seed and the virtual time base, rate and costs fix the sources of
nondeterminism.

Use `--auto-checkpoints` to set how often checkpoints are taken. Use `--like` to
inherit the options of another run.

The machine waits for commands. Use `--no-daemon` to run it to completion
instead.

The run keeps its execution options. Start and fork repeat them unless given
others.

The command waits until the machine accepts commands. Use `--no-wait` to return
once the request is accepted.

```
usage: machine create [-h] [--like run] [--label name=value] [--no-wait] [--disk disk]
                      [--mem size] [--cpus n] [--mem-type {auto,hugepages}]
                      [--mem-mode {auto,map,lazy}] [--fs-sync | --no-fs-sync]
                      [--fs-dirsync | --no-fs-dirsync] [--fb type] [--rng | --no-rng]
                      [--rng-seed n] [--daemon | --no-daemon] [--single-step | --no-single-step]
                      [--rdtsc-exit | --no-rdtsc-exit] [--limit n] [--backstop-limit n]
                      [--pin-cpu n] [--vtime-base n] [--vtime-rate rate] [--vtime-io-cost ns]
                      [--vtime-rdtsc-cost ns] [--vtime-pause-cost ns] [--auto-checkpoints n]
                      [--side-dump | --no-side-dump] [--side-trace | --no-side-trace]
                      [name]
```

| Argument | Does |
|---|---|
| `[name]` | Name for the new run, defaulting to a generated one |

| Option | Does |
|---|---|
| `--like run` | Inherit options from another run, overridden by explicit ones |
| `--label name=value` | Attach a label, repeatable; an empty value removes an inherited one |
| `--no-wait` | Return without waiting |
| `--disk disk` | Disk to create the run from |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: 256) |
| `--cpus n` | Number of CPUs (default: 1) |
| `--mem-type {auto,hugepages}` | Machine RAM backing: auto (default) or hugepages (local only) |
| `--mem-mode {auto,map,lazy}` | Cold RAM restore: auto (default), map (4K pages only), or lazy (any backing) |
| `--fs-sync, --no-fs-sync` | Mount filesystem with sync (default: off) |
| `--fs-dirsync, --no-fs-dirsync` | Mount filesystem with dirsync (default: off) |
| `--fb type` | Framebuffer type: vnc, gtk, sdl, or none |
| `--rng, --no-rng` | Enable virtio RNG |
| `--rng-seed n` | RNG seed (default: 0) |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: on) |
| `--single-step, --no-single-step` | Step mode with `--no-daemon`. A run that waits takes its mode from run `--mode` |
| `--rdtsc-exit, --no-rdtsc-exit` | Record an entry for every RDTSC exit (applies only for non-daemon runs) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: 0) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--vtime-base n` | The vtime base (Unix timestamp, default: 2026-03-01) |
| `--vtime-rate rate` | The vtime rate (float or num/den, default: 10) |
| `--vtime-io-cost ns` | IO exit vtime cost in ns (default: 2000) |
| `--vtime-rdtsc-cost ns` | RDTSC exit vtime cost in ns (default: the IO cost) |
| `--vtime-pause-cost ns` | Vtime cost of each PAUSE in ns (default: 2000) |
| `--auto-checkpoints n` | Checkpoint every n entries, 0 for never (default: scaled by memory, 50000 per 512MB) |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump in the run log (default: off) |
| `--side-trace, --no-side-trace` | Record a per-entry execution trace in the run log (default: off) |

Examples:

```
machine create run1 --disk hello                      create run1 from hello
machine create run1 --disk hello --mem 512 --cpus 2   with 512 MB, 2 CPUs
machine create run1 --disk hello --rng --rng-seed 42  with a seeded RNG
machine create run1 --disk hello --no-daemon          run to completion
```

See also:

- [`machine disks`](#machine-disks)
- [`machine start`](#machine-start)
- [`machine run`](#machine-run)
- [`machine fork`](#machine-fork)

## machine start

Start an existing run.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Use `--at` to replay the tip from an earlier checkpoint. Use `--read-only` to
open a checkpoint that cannot run or record. Use -f to stop a running machine
first.

A stopped run resumes at its tip. A run that stopped past its last checkpoint
replays its recorded tail to reach the tip. The replay reports how many entries
it replayed. Use `--no-recover` to refuse instead.

A branch that never ran starts in its own machine. Its parent keeps running.

The machine runs with the execution options of the run. Options given here
replace them for this start only.

The command waits until the machine accepts commands. Use `--no-wait` to return
once the request is accepted.

```
usage: machine start [-h] [-f] [--read-only] [--recover | --no-recover] [--at checkpoint]
                     [--parents mode] [--daemon | --no-daemon] [--single-step | --no-single-step]
                     [--limit n] [--backstop-limit n] [--pin-cpu n] [--no-wait]
                     run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-f, --force` | Stop a running instance first, then start |
| `--read-only` | Start read-only at a checkpoint, unable to run or record |
| `--recover, --no-recover` | Replay a tip that was never checkpointed from the last checkpoint (default: on) |
| `--at checkpoint` | Checkpoint to replay to the tip from, or to open with `--read-only` |
| `--parents mode` | Read data parents from the session (local) or the published tree (remote) |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Step mode with `--no-daemon`. A run that waits takes its mode from run `--mode` (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--no-wait` | Return without waiting |

Examples:

```
machine start run1              resume run1 at its tip
machine start run1 --at 42      replay from checkpoint 42 to the tip
machine start run1 --read-only  open it at its last checkpoint
machine start run1 -f           stop a running one first, then start
```

Refuses, and the way past:

```
a run that is running  machine start run1 -f
```

See also:

- [`machine create`](#machine-create)
- [`machine stop`](#machine-stop)
- [`machine pause`](#machine-pause)
- [`machine sessions`](#machine-sessions)

## machine pause

Pause a running machine.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command waits until the machine is paused. Use `--no-wait` to return once
the request is accepted.

```
usage: machine pause [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine pause run1  pause run1
```

See also:

- [`machine resume`](#machine-resume)
- [`machine stop`](#machine-stop)
- [`machine kill`](#machine-kill)

## machine resume

Resume a paused machine.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The command waits until the machine accepts commands. Use `--no-wait` to return
once the request is accepted.

```
usage: machine resume [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine resume run1  resume the paused run1
```

See also:

- [`machine pause`](#machine-pause)
- [`machine stop`](#machine-stop)
- [`machine run`](#machine-run)

## machine stop

Stop a running machine gracefully.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Use -a to stop every running machine. Use `--dry-run` to list what would stop.

The command waits until the machine is gone. A machine that already exited
counts as success. Use `--no-wait` to return once the request is accepted.

```
usage: machine stop [-h] [-a] [--dry-run] [--no-wait] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Stop all running machines |
| `--dry-run` | List what would be stopped without stopping it |
| `--no-wait` | Return without waiting |

Examples:

```
machine stop run1            stop run1, wait until it is gone
machine stop run1 --no-wait  return once the request is accepted
machine stop -a              stop every running machine
machine stop -a --dry-run    list what would stop
```

See also:

- [`machine start`](#machine-start)
- [`machine kill`](#machine-kill)
- [`machine pause`](#machine-pause)
- [`machine delete`](#machine-delete)

## machine kill

Kill a machine. Save its state first when it still can.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The machine is asked to stop and save, as stop does. It is ended if it does not
stop.

The next start replays the tip of a machine that did not save. Kill says so.

The command waits until the machine is gone. A machine already gone counts as
success. Use `--no-wait` to return once the request is accepted.

```
usage: machine kill [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine kill run1            kill run1 at once
machine kill run1 --no-wait  return once the request is accepted
```

See also:

- [`machine stop`](#machine-stop)
- [`machine delete`](#machine-delete)
- [`machine cleanup`](#machine-cleanup)

## machine delete

Delete a run that is not running and its artifacts.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Use -r to delete a branch with its descendants. Use `--dry-run` to list what
would be deleted.

The first operand names the run to delete. Use -a to delete every run, or
`--disk` to delete every run created from one disk. Use -c -a to resume
interrupted deletes.

The command waits until the run is gone. Use -f to stop a running machine first.
The stop is waited for either way. Use `--no-wait` to return once the request is
accepted.

A delete is an operation. It goes on if the command is interrupted. Run machine
ops to list it.

```
usage: machine delete [-h] [-a] [--disk name|id] [-r] [-y] [--stop] [-f] [-c] [--full-scan]
                      [--dry-run] [--no-wait]
                      [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Delete all runs, or cleanup all interrupted deletes (with -c) |
| `--disk name\|id` | Delete every run created from this disk |
| `-r, --recursive` | Delete branch and all descendants |
| `-y, --yes` | Skip the confirmation prompt |
| `--stop` | Stop running machines before deleting |
| `-f, --force` | Implies `--stop`, and deletes a run whose machine is already gone or whose process was replaced |
| `-c, --cleanup` | Resume interrupted delete operations |
| `--full-scan` | Scan all branches instead of using index (with -c) |
| `--dry-run` | List what would be deleted/recovered without acting |
| `--no-wait` | Return once the delete of one run is accepted |

Examples:

```
machine delete run1                    delete a stopped run
machine delete run1 -r --dry-run       list what would go with it
machine delete run1 -r -f              stop and delete a tree
machine delete --disk hello --dry-run  list the runs on hello
```

Refuses, and the way past:

```
a run with branches    machine delete run1 -r
a run that is running  machine delete run1 --stop
```

See also:

- [`machine stop`](#machine-stop)
- [`machine cleanup`](#machine-cleanup)
- [`machine ops`](#machine-ops)
- [`machine runs`](#machine-runs)

## machine cleanup

Remove stale runs and their leftovers.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

A stale run has an entry but no machine. Use -f to hard-kill orphaned machines
and remove their entries too.

```
usage: machine cleanup [-h] [-f]
```

| Option | Does |
|---|---|
| `-f, --force` | Also hard-kill orphaned machines and remove entries whose machine is already gone |

Examples:

```
machine cleanup     remove stale runs
machine cleanup -f  also hard-kill orphaned machines
```

See also:

- [`machine delete`](#machine-delete)
- [`machine ops`](#machine-ops)
- [`machine runs`](#machine-runs)

## machine run

Run one or more vCPU iterations.
See [Driving it](running-a-machine.md#driving-it).

The machine executes and the run log records each iteration, so the run can be
replayed.

The mode sets how an iteration executes. Fast mode stops near the limit, a
little late. Step mode stops exactly. Step-into mode also steps into syscalls,
gates and injected events.

An iteration is one dispatch of a vCPU. It ends where the guest next exits to
the machine, or at the limit. Its length is not fixed. One may be five
instructions and the next a million.

The run stops after `--iters` iterations or when the `--until` predicate holds.
No count is right in advance, because how long a program runs is not known. Use
`--until` to stop where something happens, with `--iters` or a vtime predicate
as a bound.

A run that went too far is not lost. Use rewind or go to return to an earlier
point.

A vtime predicate holds once the clock of the machine reaches a time. vtime>=T
counts from the start of the run. vtime=+T counts from where the run is. The run
stops at the end of the iteration that reaches the time.

Options vary the run. They draw the mode, the limit and the virtual time rate.
They also draw a scheduling mark, slice and interrupt for a task. The same seed
draws the same values.

The `--until` predicates are those of wait. The console~ predicate signals that
boot is done. The halted and activity=idle predicates do not.

A console~ predicate takes a regular expression. The console is searched where a
batch ends. A batch is 1000 iterations, so the run stops up to one batch past
the text.

The run log records each iteration as an entry. It also records interrupts and
device input, so entries outnumber iterations.

The global timeout cancels the run in flight. Without one there is no limit. A
timeout of 0 checks once without batching. Exit 3 means the predicate was not
reached.

`--iters` is an upper bound, not a count. A batch ends at every context switch
of a focused task. A batch also ends where a task reaches its own code. The
response reports how many iterations ran.

Without `--until`, a batch that ends early ends the run. With `--until`, the
drive continues from the next batch.

Every parameter is drawn for one iteration. The mode, the limit, the task marks
and the interrupt apply to the task on that one vCPU.

Without `--vcpu`, a scheduling cycle dispatches every vCPU. It spends up to one
iteration for each. `--iters` 100 on four vCPUs buys 100 dispatches, not 400.

With `--until`, `--iters` and the predicate are both bounds. The first to fire
wins. `--iters` 500 `--until` on stops at 500 iterations or when a focused task
takes a vCPU.

Without `--iters`, only the timeout bounds the drive, so `--until` tasks runs a
whole boot. A span bounds nothing either. It draws a batch size per dispatch, so
`--iters` 100:500 `--until` on keeps going.

`--when` bounds nothing. It names what must be true for the clause to apply to a
dispatch. A dispatch it excludes runs free, up to the crossing into the subject.

So `--when` /test:on `--until` /test:exit perturbs that program while its own
code runs. It runs free while the program is in the kernel or off the CPU. It
stops when the program is gone. `--iters` counts every dispatch, the ones that
ran free too.

`--when` takes on, kernel and off. Each is a state, not an edge.

This one clause is the CLI. More than one clause is a plan file. Run machine
plan `<run>` `<file>` for each drive that uses it.

```
usage: machine run [-h] [--limit span] [--backstop-limit n] [--retry n] [--strategy name]
                   [--seed n] [--vcpu span] [--iters span] [--until predicate] [--irqblk]
                   [--rdtsc-exit] [--no-idle-skip] [--auto-checkpoints n] [--mode list]
                   [--fast span] [--step span] [--step-into span] [--vtime-rate span]
                   [--vtime-add span] [--task-sched choices] [--task-slice choices]
                   [--task-int choices] [--when predicate]
                   run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--limit span` | Default instructions per dispatch under fast, steps under step; fast takes 1000 or more and stops at or after it, late by an amount that depends on what the machine runs; step stops exactly; 0 means no limit under fast and one step under step; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true (same predicates as wait `--for`) |
| `--irqblk` | Block IRQs during run |
| `--rdtsc-exit` | Record an entry for every RDTSC exit |
| `--no-idle-skip` | Keep machine time crawling while every vCPU is idle |
| `--auto-checkpoints n` | Auto-checkpoint every N entries; 0 turns it off, default the machine's |
| `--mode list` | Execution mode: fast, step, step-into, free, or a comma list to draw among (default: fast) |
| `--fast span` | Limit fast draws when it wins (its member), overriding `--limit` |
| `--step span` | Limit step draws when it wins (its member), overriding `--limit` |
| `--step-into span` | Limit step-into draws when it wins (its member) |
| `--vtime-rate span` | Vtime rate for this run: n, n/d, or a span of either |
| `--vtime-add span` | Nanoseconds to push the clock forward before each dispatch |
| `--task-sched choices` | Draw a scheduler mark per dispatch for the task on that vCPU: keep, hold, yield, drain, drain-all |
| `--task-slice choices` | Draw that task's slice per dispatch: keep, default, or a duration range such as 10us:600us |
| `--task-int choices` | Draw an interrupt for that task per dispatch: none, preempt |
| `--when predicate` | Apply the clause only while this holds |

Examples:

```
machine run run1                           run one iteration
machine run run1 --iters 100               run 100 iterations
machine run run1 --mode step --iters 20    single-step 20 iterations
machine run run1 --until 'console~login:'  until the console prints login:
machine run run1 --until 'entry>=500'      until it reaches entry 500
machine run run1 --until vtime=+10ms       until its clock moves 10 ms
machine run run1 --until tasks             until its tasks can be listed
```

Output:

```
progress       <done>/<batch> vtime=<time> entry=<id> ic=<instructions>
summary        iterations: <n> run ic: <instructions in this run>
               vtime: +<how far the clock moved in this run>
last dispatch  VCPU EXIT ID RUN IC RCB TOTAL IC REGS HASH RIP RCX ITER
EXIT           why it ended: IO, MMIO, HYPERCALL, HLT, INSTR_LIMIT
               INSTR_LIMIT is the limit reached, or a cancel
               IO with EXIT_SHUTDOWN is the guest powering off
ID             the entry the dispatch wrote
RCB            conditional branches retired, which replay matches on
REGS HASH      a hash of the registers, which replay matches on
ITER           which iteration of this command it was
task:          the task event an --until predicate was met by
guest event    a stop the guest asked for, such as a task switch
matched <n>    with --when, how many dispatches it applied to
               the rest of the iterations ran free
```

See also:

- [`machine checkpoint`](#machine-checkpoint)
- [`machine plan`](#machine-plan)
- [`machine wait`](#machine-wait)
- [`machine cancel`](#machine-cancel)

## machine plan

Run a multi-clause plan from a file. See [Plans](steering-programs.md#plans).

A plan varies how the run executes. Its clauses draw the mode, the virtual time,
and the scheduling and interrupts of tasks. Use `--iters` and `--until` to bound
the run, as with run.

A plan file is a list of clauses. A clause is an optional when predicate and the
per-dispatch axes it draws for a dispatch it matches. Clauses are tried in
order. The last to match supplies each axis, so a later clause overrides an
earlier one.

The else clause applies to a dispatch that no when matched. It is the last
clause of the file.

Braces may group a clause. # begins a comment. Blank lines are ignored.

A file of - reads the plan from standard input. The plan applies to the run of
this command only. A later machine run runs without the plan. Run machine plan
again to go on with it.

Example: when /test:on mode step,fast fast=1:100k step=1:200 when /test:kernel
task-sched hold else mode fast

Example: place thread 56 on vCPU 2 or 3 when it wakes, 2 three times as often as
3: else task-pin 56=golden:2[3],3[1]

A clause names one when predicate, then any of these axes. An axis is a comma
list of choices, one drawn per dispatch. [N] is an optional weight on a choice.
The task-slice axis is the exception, a colon set that takes no weights:

when `<predicate>` apply the clause only while the predicate holds. A predicate
is [subject:]state. The state is on, kernel, off, syscall[=name] or int[=vec].
The subject is /path, tid=N, tgid=N, cgroup=P or none for any focused task.
vcpu=N[,N] ANDs a vCPU set onto it. mode `<mode>`[N],... the modes to draw
among: fast, step, step-into, free or keep. A mode may carry the limit it draws
when it wins, `<mode>`=`<span>`, as in mode step[3],fast[1] step=1:200. free
takes no limit. vtime-rate `<rate>`[N],... the machine-time rate: a number N, a
fraction N/D, a span of numerators such as 1:10, or keep. vtime-add
`<duration>`[N],... time added to the clock before each dispatch: a duration
such as 500 or 10us, a span such as 10us:2ms, or keep. task-sched
`<mark>`[N],... a mark for the task on the drawn vCPU: keep, hold, yield, drain,
drain-all. task-int `<int>`[N],... an interrupt for that task: none or preempt.
This axis has no keep: none is its do-nothing choice. task-slice
`<choice>`:`<choice>`:... that task's time slice, drawn from a colon set of
keep, default and a duration span, in any combination, as in
keep:default:10us:600us. task-pin [`<tid>`=]`<set>`[N],... where a thread is
placed when it next wakes, each choice a set of vCPUs: 1-3 is all three, 1,2,3
is three choices of one, free is any vCPU and none is no vCPU, which stops it
running. A placement policy, not confinement: a thread already queued elsewhere
keeps that vCPU until it wakes. `<tid>`= names the thread. Without it, the task
on the drawn vCPU is placed. none requires `<tid>`=.

A weight makes a choice win more often. mode step[3],fast[1] draws step three
times as often as fast. keep is the choice that draws nothing. It holds the last
value of the axis, so a clause can leave an axis alone part of the time.

A span is a range written lo:hi[:strategy[:step]]. The strategy is random,
golden or sweep. One value is drawn from the span per dispatch.

A span is accepted by the mode member limit, vtime-rate, vtime-add, task-slice
and the run-level `--limit`. The limit itself is not a clause axis. It is the
default for a mode with no member limit of its own.

The options of this command are plan-level. `--limit` and `--strategy` are the
defaults for a clause that names no span of its own. A clause axis overrides
them for the dispatches it matches. A dispatch that no clause matches runs free.

`--seed` seeds the draw strategies. `--until`, `--iters` and `--vcpu` bound and
steer the run as on run. The clause axes and when belong in the file, not here.

```
usage: machine plan [-h] [--limit span] [--backstop-limit n] [--retry n] [--strategy name]
                    [--seed n] [--vcpu span] [--iters span] [--until predicate] [--irqblk]
                    [--rdtsc-exit] [--no-idle-skip] [--auto-checkpoints n]
                    run file
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `file` | Plan file of when and else clauses, and their axes, or - to read standard input |

| Option | Does |
|---|---|
| `--limit span` | Default instructions per dispatch under fast, steps under step; fast takes 1000 or more and stops at or after it, late by an amount that depends on what the machine runs; step stops exactly; 0 means no limit under fast and one step under step; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true (same predicates as wait `--for`) |
| `--irqblk` | Block IRQs during run |
| `--rdtsc-exit` | Record an entry for every RDTSC exit |
| `--no-idle-skip` | Keep machine time crawling while every vCPU is idle |
| `--auto-checkpoints n` | Auto-checkpoint every N entries; 0 turns it off, default the machine's |

Examples:

```
machine plan run1 plan.txt                       run the clauses of plan.txt
machine plan run1 plan.txt --iters 100 --seed 7  100 iterations, seed 7
machine plan run1 -                              plan from standard input
```

Output:

```
tally         one line for each clause, numbered from 1
<choice>×<n>  how many times that choice of an axis was drawn
matched <n>   how many dispatches the clause applied to
marks held    threads a clause held that are still held at the end
              then what run prints
```

See also:

- [`machine run`](#machine-run)
- [`machine wait`](#machine-wait)
- [`machine control`](#machine-control)

## machine control

Control a run interactively.
See [Interactive mode](running-a-machine.md#interactive-mode).

The prompt takes slash commands. They map to the commands of machine, with a
syntax of their own.

Type /help at the prompt to list the commands. Use -c to send a slash command
from the command line, without opening the prompt. Use -c /help to list the
commands that way.

Use control log with a run to read the command history instead of driving the
machine. Use `--entries` to select the commands issued at given run entries. Use
-n to select commands by number.

```
usage: machine control [-h] [--entries range] [-n range] [-c cmd] run|log [run]
```

| Argument | Does |
|---|---|
| `run\|log` | Run name, or log to read history |
| `[run]` | With log: the run whose history to read |

| Option | Does |
|---|---|
| `--entries range` | With log: commands at one entry, or an inclusive range |
| `-n, --lines range` | With log: command N, A:B, A:, :B or :, or -N for the last N commands |
| `-c, --command cmd` | Slash command (e.g. "/s=0@10") |

Examples:

```
machine control run1                            open the prompt for run1
machine control run1 -c /help                   list the slash commands
machine control run1 -c /f@100                  run 100 iterations fast
machine control run1 -c '/checkpoint name cp1'  create checkpoint cp1
machine control run1 -c '/rewind to ^cp1'       put run1 back at cp1
machine control log run1                        the commands issued to run1
```

See also:

- [`machine run`](#machine-run)
- [`machine wait`](#machine-wait)
- [`machine entries`](#machine-entries)

## machine wait

Wait until a run satisfies a `--for` predicate.
See [Waiting](running-a-machine.md#waiting).

Use wait to script against a run. It waits for a state, an entry, a console line
or a task event. Several runs, or every run of the session, may be waited for.

The predicates are running, ready, tasks, stopped, paused, halted,
activity=`<name>`, entry>=N, entry=+N, vtime>=T, vtime=+T, console~REGEX and a
task predicate. The tasks predicate holds once the operating system is up and
its task table is readable. That is before it execs anything in userland.

A task predicate is [who:]what. The what is exec, exit, sched, desched, on,
kernel or off. The who is /path, cgroup=path, tgid=N or tid=N. Omitting it means
any focused task.

A path or a cgroup must already be focused. A path or cgroup subject means the
process. tgid=N means the process for exit and any of its threads for exec. Use
machine tasks `<run>` `--focused` to see which thread is on a vCPU.

Four of the seven are edges. exec fires where a task matching who entered the
task table. exit fires where one left it.

sched fires where a thread is given the CPU. desched fires where one gives it
up.

Three are states, and they partition time. on holds while the thread is on cpu
in its own code, at CPL 3. That is where a forced decision can land between two
of its own instructions.

kernel holds while that thread is on cpu in the kernel. off holds while it is
not the task on cpu at all.

Named runs must be in the current session. Use `--all` to wait for every run in
it.

The global timeout bounds the wait. Without one there is no limit. A timeout of
0 checks once.

Exit codes: 0 success, 2 error, 3 timeout.

```
usage: machine wait [-h] [--all] --for predicate [--interval s] [run ...]
```

| Argument | Does |
|---|---|
| `[run ...]` | One or more runs (omit with `--all`) |

| Option | Does |
|---|---|
| `--all` | Wait for every run in the session |
| `--for predicate` | Predicate such as running, stopped, entry=+N or console~REGEX |
| `--interval s` | Poll every S seconds (default: 1) |

Examples:

```
machine wait --for running run1               until run1 runs
machine wait --for stopped run1               until it stops
machine wait --for 'entry>=500' run1          until it reaches entry 500
machine --timeout 60 wait --for stopped run1  give up after 60 s
```

See also:

- [`machine run`](#machine-run)
- [`machine stop`](#machine-stop)
- [`machine state`](#machine-state)

## machine cancel

Cancel the active run or checkpoint operation.
See [Trying different schedules](running-a-machine.md#trying-different-schedules).

```
usage: machine cancel [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine cancel run1  cancel the active run or checkpoint
```

See also:

- [`machine run`](#machine-run)
- [`machine checkpoint`](#machine-checkpoint)
- [`machine wait`](#machine-wait)

## machine replay

Replay recorded entries from the parent lineage. See [Replay](replay.md).

The command executes the recorded entries again. It checks each against the
recording. A mismatch is a divergence. The command reports the entry, with the
expected and actual values.

Without a line, the parent's entries are replayed. A fork at an entry leaves
that entry with the parent. The branch starts at the next entry, so the entries
of the parent end at the fork. Replaying past them reports no forward entries.

Naming a line replays the entries that lead to that run, across every fork on
the way. The run must be in the same tree. A line that is not the own line of
this run is not refused. The replay diverges at the first entry that does not
reproduce.

An entry that diverges is replayed again from the newest checkpoint before it,
at most twice. It is not replayed again once it diverges the same way twice. An
entry that the host interrupted is replayed again the same way. It is not a
divergence.

Use `--retry` to set how many retries. `--retry` 0 replays each entry once. Use
`--skid` to set how early the replay stops before each recorded entry. A smaller
skid makes a miss more likely.

```
usage: machine replay [-h] [--to n] [--trace] [--retry n] [--skid n] run [line]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[line]` | Run whose line to replay, defaulting to the parent's |

| Option | Does |
|---|---|
| `--to n` | Replay to entry n, defaulting to the end of the line |
| `--trace` | Trace each iteration one by one |
| `--retry n` | Retries for an entry that diverges or the host interrupted, default 2; 0 does not retry |
| `--skid n` | Aim the interrupt n instructions short of each recorded stop |

Examples:

```
machine replay try2                reproduce the parent's entries on try2
machine replay try2 --to 300       replay up to entry 300
machine replay try2 run1 --to 420  replay the line that leads to run1
```

Output:

```
text          Replayed <n> entries to entry <id>. Converged.
              then the last dispatch, as run prints it
json          converged entry_id replayed diverged result misses
nothing left  Nothing to replay: already at entry <id>
```

See also:

- [`machine diff`](#machine-diff)
- [`machine rewind`](#machine-rewind)
- [`machine play`](#machine-play)
- [`machine go`](#machine-go)

## machine play

Play recorded entries without checking divergence. See [Replay](replay.md).

Use `--include` and `--exclude` to select the event types to play.

The source must be in the tree of this run. Divergence is not checked. A source
that is not the own line of this run is played, not refused.

```
usage: machine play [-h] [-n range] [--include type [type ...]] [--exclude type [type ...]]
                    run [source]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[source]` | Source run (default: parent) |

| Option | Does |
|---|---|
| `-n, --entries range` | Entry N, A:B, A:, :B or :, or -N for the last N entries |
| `--include type [type ...]` | Include only these event types: run, irq, exception, random, device_in, block_done, input, exit_shutdown, system_shutdown, system_reset, checkpoint, cpuid |
| `--exclude type [type ...]` | Exclude these event types |

Examples:

```
machine play run1 -n 295:300  play entries 295 to 300 of run1
machine play try2 run1        play run1's entries on try2
```

See also:

- [`machine replay`](#machine-replay)
- [`machine diff`](#machine-diff)
- [`machine entries`](#machine-entries)

## machine diff

Compare a run log entry against another. See [Replay](replay.md).

The command compares the state recorded at two entries. It breaks the combined
hash into machine state, memory and disk, with register detail, so the layer
that differs shows. It reads the recorded log, so no replay is needed. Use
`--show` to choose sections and `--context` to add the entries before.

With no second operand, the entry is compared against the run it was replayed
from. The answer says whether the replay converged. Naming a run compares
against that run, at its own entry when given as other:m. A difference between
two recordings says that they differ, not that a replay diverged.

```
usage: machine diff [-h] [--show sections] [--entry n] [--context n] run [other[:m]]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[other[:m]]` | Run to compare against, at its entry m; m defaults to `--entry` |

| Option | Does |
|---|---|
| `--show sections` | One or more, comma-separated: code, regs, stack, pt, instr, trace, events, timers, debug, xsave, irq, pic, ioapic, devs, mem, disk, hash, counts, entry, io, msrs, fullhash, all; default hash |
| `--entry n` | Compare specific entry N (0 = last entry) |
| `--context n` | Also show the N entries leading up to it, on both sides |

Examples:

```
machine diff try2                   compare try2 with the run it replayed
machine diff try2 --show code,regs  include code and registers
machine diff try2 run1              compare try2 with run1 instead
```

See also:

- [`machine replay`](#machine-replay)
- [`machine play`](#machine-play)
- [`machine entries`](#machine-entries)
- [`machine dump`](#machine-dump)

## machine checkpoint

Create a checkpoint of the current machine state.
See [Checkpoints](checkpoints-and-branches.md#checkpoints).

A checkpoint is a point to return to, written ^name. It saves the machine state.
Fork, go and rewind return to it.

The machine also checkpoints on its own, at the interval that create sets.

```
usage: machine checkpoint [-h] run [name]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[name]` | Checkpoint name (auto-generated if omitted) |

Examples:

```
machine checkpoint run1      checkpoint run1 under a generated name
machine checkpoint run1 cp1  checkpoint run1 as cp1
```

See also:

- [`machine checkpoints`](#machine-checkpoints)
- [`machine go`](#machine-go)
- [`machine fork`](#machine-fork)
- [`machine rewind`](#machine-rewind)

## machine fork

Fork a branch and start it alongside the parent.
See [Starting a branch](checkpoints-and-branches.md#starting-a-branch).

A branch shares the history of its parent up to the fork point. Then it runs on
its own path. Use `--rebase` to copy the data of the ancestors instead of
sharing it. Use `--no-start` to create the branch without starting it.

The parent keeps running. The terminal stays attached to the parent.

The branch forks at the current point and reuses a checkpoint there if one
exists. Use `--at` to fork at another point.

The branch keeps the execution options of the parent. Options given here replace
them for the branch.

The command waits until the branch accepts commands. Use `--no-wait` to return
once the request is accepted.

```
usage: machine fork [-h] [--at point [point ...]] [--name name] [--rebase] [--depth n] [--lean]
                    [--no-start] [--side-dump | --no-side-dump] [--side-trace | --no-side-trace]
                    [--no-wait] [--daemon | --no-daemon] [--single-step | --no-single-step]
                    [--limit n] [--backstop-limit n] [--pin-cpu n]
                    run
```

| Argument | Does |
|---|---|
| `run` | Run to fork from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new branch starts at: ^checkpoint, #entry, a time such as 10ms or -10ms, now, parent [n], root, or %mark |
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, drop the absorbed history so those runs become deletable |
| `--no-start` | Create the branch without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Step mode with `--no-daemon`. A run that waits takes its mode from run `--mode` (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

Examples:

```
machine fork run1                         fork here and start the branch
machine fork run1 --name probe            name the branch probe
machine fork run1 --at ^cp1               fork at checkpoint cp1
machine fork run1 --at -10ms              fork 10 ms before now
machine fork run1 --at '#120' --no-start  create the branch, do not start it
```

See also:

- [`machine go`](#machine-go)
- [`machine switch`](#machine-switch)
- [`machine detach`](#machine-detach)
- [`machine checkpoint`](#machine-checkpoint)

## machine go

Branch at a point and switch onto it.
See [Moving around](checkpoints-and-branches.md#moving-around).

Go starts another path from a point. The branch shares the history of the run up
to the point.

The machine moves onto the branch. The run it leaves is listed as switched. A
switched run keeps its history and has no machine.

Go is the only command that branches and switches in one step. The point is a
time, #entry, ^checkpoint, now, parent [n], root or a mark written %mark. Each
names a point on the own line of this run.

A time such as 10ms counts from the start of the run. A minus sign, as in -10ms,
counts back from now. A time may carry +N, as machine now prints it, to name one
entry among several at that time.

Go reaches a point that is not a checkpoint by branching at the nearest
checkpoint at or before it. It then replays the difference.

Every use creates a branch, also for a point gone to before. What runs from a
point is a path of its own. Use switch to return to a branch that exists. Use
rewind to put this run back at a point.

```
usage: machine go [options] <run> <point>
```

| Argument | Does |
|---|---|
| `run` | The running machine that moves |
| `[point ...]` | Where to branch: a time such as 10ms or -10ms, #entry, ^checkpoint, now, parent [n], root, or %mark |

| Option | Does |
|---|---|
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, drop the absorbed history so those runs become deletable |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |

Examples:

```
machine go run1 ^cp1                 branch at checkpoint cp1 and switch
machine go run1 '#120' --name probe  branch at entry 120 as probe
machine go run1 parent               branch where run1 left its parent
machine go run1 -10ms                branch 10 ms before now
```

Output:

```
result           Branched <parent>/<name> (<id>) at entry <n>
<parent>/<name>  how a branch is listed, under the run it left
                 every command takes the name alone
```

See also:

- [`machine fork`](#machine-fork)
- [`machine switch`](#machine-switch)
- [`machine rewind`](#machine-rewind)
- [`machine checkpoint`](#machine-checkpoint)

## machine switch

Switch a running machine onto a branch that exists.
See [Moving around](checkpoints-and-branches.md#moving-around).

The first operand names the run that switches, as with fork and detach. The
second names where it goes: a branch, a mark written %mark, parent or root.
Switch never creates a branch.

The run that the machine leaves is listed as switched. A switched run keeps its
history and has no machine.

Go forks a branch and switches onto it. Fork forks a branch without switching.

```
usage: machine switch [-h] [--no-wait] run [branch ...]
```

| Argument | Does |
|---|---|
| `run` | The running machine that switches |
| `[branch ...]` | Branch to switch onto: a name, a mark written %mark, parent [n], or root |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine switch run1 try2    switch run1's machine onto try2
machine switch run1 parent  switch it onto the parent branch
machine switch run1 %good   switch it onto the branch the mark names
```

See also:

- [`machine go`](#machine-go)
- [`machine fork`](#machine-fork)
- [`machine rewind`](#machine-rewind)
- [`machine branches`](#machine-branches)

## machine rewind

Put a run back at a point and discard what follows.
See [Moving around](checkpoints-and-branches.md#moving-around).

The run keeps its id and its name. The entries, checkpoints and console output
after the point are discarded.

The point is required. It is any entry from #0 to the tip. Write an entry id
after #, a checkpoint name after ^, or a machine time. The run lands on it
exactly.

The point becomes a checkpoint. Rewinding to the tip changes nothing unless a
replay diverged there. A point before the run was forked puts the run back along
the line it was forked from. A run with a branch forked after the point is
refused.

```
usage: machine rewind <run> to <point>
```

| Argument | Does |
|---|---|
| `run` | The machine that rewinds |
| `[point]` | Point to go back to, from #0 to the tip: ^checkpoint, #entry or a time |

Examples:

```
machine rewind run1 to ^cp1    put run1 back at checkpoint cp1
machine rewind run1 to '#120'  put run1 back at entry 120
```

Refuses, and the way past:

```
a branch forked after the point  machine delete try2
```

See also:

- [`machine checkpoint`](#machine-checkpoint)
- [`machine go`](#machine-go)
- [`machine replay`](#machine-replay)
- [`machine branches`](#machine-branches)

## machine detach

Detach a new root from a run and start it.
See [Moving around](checkpoints-and-branches.md#moving-around).

Without `--at`, the root is detached at the current point. The copy includes
everything the root still owns. It shares nothing with the origin tree. It is
slower than fork `--rebase`.

The new root is named for the run it copied and the point. A second copy of the
same point gets a suffix.

The new root keeps the execution options of the run it copied. Options given
here replace them for the root.

```
usage: machine detach [-h] [--at point [point ...]] [--name name] [--no-start]
                      [--side-dump | --no-side-dump] [--side-trace | --no-side-trace] [--no-wait]
                      [--daemon | --no-daemon] [--single-step | --no-single-step] [--limit n]
                      [--backstop-limit n] [--pin-cpu n]
                      run
```

| Argument | Does |
|---|---|
| `run` | Run to detach from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new branch starts at: ^checkpoint, #entry, a time such as 10ms or -10ms, now, parent [n], root, or %mark |
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--no-start` | Create the branch without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Step mode with `--no-daemon`. A run that waits takes its mode from run `--mode` (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

Examples:

```
machine detach run1 --at ^cp1                 copy run1 at cp1 to a new root
machine detach run1 --at '#120' --name copy1  name the new root copy1
```

See also:

- [`machine fork`](#machine-fork)
- [`machine go`](#machine-go)
- [`machine delete`](#machine-delete)

## machine checkpoints

List the checkpoints of a branch.
See [Checkpoints](checkpoints-and-branches.md#checkpoints).

Each checkpoint is a point for fork `--at`, go and rewind.

The listing shows the first 25 checkpoints. Use `--limit` for a different page
size. No running machine is needed.

The durable column says whether a checkpoint is synced to shared storage. Use -o
json for an object of run_id, hosted and checkpoints instead of a bare list.

```
usage: machine checkpoints [-h] [--durable] [--since date|age] [--until date|age] [--sort field]
                           [--reverse] [--limit n] [--offset n] [-w]
                           run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--durable` | Show only checkpoints synced to shared storage |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: entry) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n checkpoints (default: 25) |
| `--offset n` | Skip the first n checkpoints |
| `-w, --watch` | Watch for changes |

Examples:

```
machine checkpoints run1            list the checkpoints of run1
machine checkpoints run1 --durable  only those in shared storage
```

Output:

```
text      NAME ID VTIME DURABLE ANCESTOR
ID        the entry the checkpoint is at
VTIME     machine time there, with +N among entries at one time
DURABLE   ticked when it is in shared storage, no when it is not
ANCESTOR  the run that made it, for one a branch was forked with
```

See also:

- [`machine checkpoint`](#machine-checkpoint)
- [`machine go`](#machine-go)
- [`machine rewind`](#machine-rewind)
- [`machine marks`](#machine-marks)

## machine marks

List and manage marks. See [Marks](checkpoints-and-branches.md#marks).

A mark is a second name for a branch. It is unique within its tree. Written
%mark, it names the branch anywhere a run is named.

Without a command, marks of every tree are listed. Use list with a run for the
marks of that run's tree. No running machine is needed.

```
usage: machine marks [-h] {list,add,remove} ...
```

Examples:

```
machine marks list              list marks
machine marks add run1 good     put the mark good on run1
machine marks remove run1 good  take it off
```

See also:

- [`machine go`](#machine-go)
- [`machine switch`](#machine-switch)
- [`machine branches`](#machine-branches)

### machine marks list

List marks. See [Marks](checkpoints-and-branches.md#marks).

The listing covers every tree, or the tree of one run when a run is named.

```
usage: machine marks list [-h] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

Examples:

```
machine marks list       marks of every tree
machine marks list run1  marks of the tree of run1
```

See also:

- [`machine marks add`](#machine-marks-add)
- [`machine marks remove`](#machine-marks-remove)
- [`machine branches`](#machine-branches)

### machine marks add

Put a mark on a branch. See [Marks](checkpoints-and-branches.md#marks).

Marking a branch again with the same word succeeds. A word that another branch
in the tree already holds is refused. The mark stays with that branch.

```
usage: machine marks add [-h] run mark
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `mark` | The mark to add |

Examples:

```
machine marks add run1 good  put the mark good on run1
```

See also:

- [`machine marks list`](#machine-marks-list)
- [`machine marks remove`](#machine-marks-remove)
- [`machine switch`](#machine-switch)

### machine marks remove

Take a mark off a branch. See [Marks](checkpoints-and-branches.md#marks).

The command is refused when the branch does not carry the mark.

```
usage: machine marks remove [-h] run mark
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `mark` | The mark to remove |

Examples:

```
machine marks remove run1 good  take the mark good off
```

See also:

- [`machine marks add`](#machine-marks-add)
- [`machine marks list`](#machine-marks-list)

## machine branches

Show the branch tree.
See [Seeing the tree](checkpoints-and-branches.md#seeing-the-tree).

The tree shows how each branch forked from its parent. Use `--running` to show
only running branches.

The listing shows the newest 25 branches. Use `--limit` for a different page
size. Use `--depth` to keep one level of the tree, 0 for the roots. Naming any
run in a tree, root or branch, limits the listing to that tree.

```
usage: machine branches [-h] [--running] [--depth n] [--since date|age] [--until date|age]
                        [--sort field] [--reverse] [--limit n] [--offset n] [-w]
                        [run]
```

| Argument | Does |
|---|---|
| `[run]` | Show only this run's tree |

| Option | Does |
|---|---|
| `--running` | Show only running branches |
| `--depth n` | Show only branches at this depth from the root, 0 is the root |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: created) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n branches (default: 25) |
| `--offset n` | Skip the first n branches |
| `-w, --watch` | Watch for changes |

Examples:

```
machine branches            the branch tree
machine branches run1       only the tree of run1
machine branches --running  running branches only
```

Output:

```
each run     <run> (<id>) [<first entry>, <end>)
             the end is open while the run can still record
each branch  @<entry> <vtime> before it: where it was forked
this run     the run named on the command line
```

See also:

- [`machine lineage`](#machine-lineage)
- [`machine runs`](#machine-runs)
- [`machine fork`](#machine-fork)
- [`machine go`](#machine-go)

## machine lineage

Show the ancestors of a branch, from the root down.
See [Seeing the tree](checkpoints-and-branches.md#seeing-the-tree).

```
usage: machine lineage [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine lineage try2  the ancestors of try2
```

Output:

```
each ancestor  <run> (<id>) [<first entry>, <end>) <n> checkpoints
```

See also:

- [`machine branches`](#machine-branches)
- [`machine describe`](#machine-describe)

## machine entries

Show run log entries. See [Looking at it](running-a-machine.md#looking-at-it).

An entry is one recorded event of the run, such as a vCPU run, an interrupt or a
device input.

Use -n to select entries, and -f to follow new output.

```
usage: machine entries [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --entries range` | Entry N, A:B, A:, :B or :, or -N for the last N entries |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine entries run1 -n -20      the last 20 entries
machine entries run1 -n 100:120  entries 100 to 120
machine entries run1 -f          follow new entries
```

Output:

```
#<id>     the entry, then its fields as name=value
ic rcb    instructions and conditional branches of this entry
total_ic  instructions since the machine started
vtime     machine time in nanoseconds
RUN       one iteration: its mode, limit, exit and where it stopped
IRQ       an interrupt delivered, with its source and vector
          IPI is one sent to a vCPU, which is how machine irq arrives
flags     what else the entry carries, such as MEM_HASH
exit      why the iteration ended: IO, HYPERCALL, INSTR_LIMIT
```

See also:

- [`machine now`](#machine-now)
- [`machine play`](#machine-play)
- [`machine diff`](#machine-diff)
- [`machine dump`](#machine-dump)

## machine runs

List runs, newest first.
See [Looking at it](running-a-machine.md#looking-at-it).

Options filter by state, label, flag, disk, sync state and age.

The listing shows the newest 25. Use `--limit` for a different page size. Naming
a run limits the listing to its tree. Use `--roots` for one row per tree, and -o
wide or `--no-trunc` for full run ids.

```
usage: machine runs [-h] [--state [^]state] [--running] [--roots] [--label name=value]
                    [--flag name[=value]] [--disk name|id] [--parents mode] [--synced |
                    --not-synced] [--since date|age] [--until date|age] [--sort field] [--reverse]
                    [--limit n] [--offset n] [--no-trunc] [--size] [-w]
                    [root]
```

| Argument | Does |
|---|---|
| `[root]` | Show one tree, by its root |

| Option | Does |
|---|---|
| `--state [^]state` | Filter by state: running, paused, recovering, read-only, stopped, killed, terminated, died, failed (repeat = OR; ^ excludes) |
| `--running` | Show only running runs, the same as `--state` running |
| `--roots` | One row per tree instead of every run, with its running N/M |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--flag name[=value]` | Filter by a run flag (repeatable; matches all) |
| `--disk name\|id` | Filter by the disk a run was created from |
| `--parents mode` | Filter by where a run reads data parents: local, remote |
| `--synced` | Show only runs published to shared storage |
| `--not-synced` | Show only runs with nothing published |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: created) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n runs (default: 25) |
| `--offset n` | Skip the first n runs |
| `--no-trunc` | Show full run ids |
| `--size` | Measure and show size |
| `-w, --watch` | Watch for changes |

Examples:

```
machine runs                     the newest runs
machine runs --running           running runs only
machine runs --state '^stopped'  all but stopped runs
machine runs run1                the tree of run1
machine runs --roots             one row per tree
machine -o json runs --limit 5   five runs as JSON
```

Output:

```
text      NAME STATE CPUS MEMORY DISK OPTIONS SESSION CREATED ID
json      name run_id state home disk nrcpus ram_bytes created_at
states    running paused recovering read-only stopped
          killed terminated died failed switched
switched  the machine left this run for a branch
          no machine is on a switched run
```

See also:

- [`machine describe`](#machine-describe)
- [`machine state`](#machine-state)
- [`machine branches`](#machine-branches)
- [`machine sessions`](#machine-sessions)

## machine describe

Show the full configuration of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

The configuration covers the state, resources, options and lineage of the run.

```
usage: machine describe [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine describe run1  configuration and lineage of run1
machine describe try2  a branch is named like any run
```

Output:

```
text  Name ID State Started Resources Options Lineage
```

See also:

- [`machine state`](#machine-state)
- [`machine runs`](#machine-runs)
- [`machine lineage`](#machine-lineage)
- [`machine branches`](#machine-branches)

## machine state

Show the state of a running machine.
See [Looking at it](running-a-machine.md#looking-at-it).

The command shows the activity, virtual time, entry and resources of the
machine.

```
usage: machine state [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine state run1  state, activity and position of run1
```

Output:

```
running   state activity vtime entry cpus vcpu memory host cpu
stopped   state vtime entry cpus memory, and halted for a halted machine
activity  idle sched_wait guest io mmio halted stopping
          paused starting, where sched_wait is waiting for a command
switch    the task switch the machine stopped at, when at one
          <tid> -> <tid>, with in or out for the focused side
plan      the clauses of the plan and the tally of its last run
```

See also:

- [`machine now`](#machine-now)
- [`machine describe`](#machine-describe)
- [`machine runs`](#machine-runs)
- [`machine wait`](#machine-wait)

## machine now

Show where a run is. See [Looking at it](running-a-machine.md#looking-at-it).

The entry and the vtime are points for go, rewind, fork `--at` and detach
`--at`. Nothing moves.

Machine time does not move for work too short to count. A +N after the time
tells apart the entries that share it. 0.2s is the first entry at that time and
0.2s+2 is the third.

A time with +N is a point like any other. It names exactly one entry.

```
usage: machine now [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine now run1  entry, vtime and RIP of run1
```

Output:

```
text  vtime=<time> entry=<id> vcpu=<n> rip=<address>
json  entry_id vtime vtime_offset vcpu rip
      vtime in nanoseconds, rip as a decimal number
      vtime_offset is the N of +N
```

See also:

- [`machine state`](#machine-state)
- [`machine entries`](#machine-entries)
- [`machine checkpoints`](#machine-checkpoints)
- [`machine go`](#machine-go)

## machine console

Show the console of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

The console is the output of the machine.

Use `--entries` to select the output of given entries, -n to select lines, and
-f to follow new output. An entry that printed nothing contributes nothing.

```
usage: machine console [-h] [-n range] [--entries range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `--entries range` | Output of one entry, or of an inclusive range |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine console run1     console output of run1
machine console run1 -f  follow new output
```

See also:

- [`machine entries`](#machine-entries)
- [`machine debug`](#machine-debug)
- [`machine dump`](#machine-dump)

## machine dump

Dump the state of a machine.
See [Looking at it](running-a-machine.md#looking-at-it).

The sections cover vCPU code, registers, stack and page tables, timers,
interrupt controllers, devices, memory and hashes. Use `--show` to choose
sections. Use `--entry` to dump the state recorded at an entry.

Use -o json to emit one object per `--show` section. Omit `--show` for every
live section. Use `--mem` for the mem object. It is alone unless `--show` is
also set.

```
usage: machine dump [-h] [--entry n] [--show sections] [--mem addr] [--vcpu n] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--entry n` | Entry from run log |
| `--show sections` | One or more, comma-separated: code, regs, stack, pt, instr, trace, events, timers, debug, xsave, irq, pic, ioapic, devs, mem, disk, hash, entry, io, msrs, fullhash, all |
| `--mem addr` | Dump raw memory cluster: N (index), pADDR (physical), vADDR (machine address) |
| `--vcpu n` | The vCPU whose state and page tables are read (default: 0) |

Examples:

```
machine dump run1                      vCPU state at the current entry
machine dump run1 --entry 5            the state recorded at entry 5
machine dump run1 --show code,regs     only code and registers
machine -o json dump run1 --show regs  registers as JSON
```

See also:

- [`machine vcpu`](#machine-vcpu)
- [`machine diff`](#machine-diff)
- [`machine entries`](#machine-entries)

## machine vcpu

Show the current vCPU run state.

```
usage: machine vcpu [-h] [--vcpu n] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--vcpu n` | The vCPU (default: 0) |

Examples:

```
machine vcpu run1           run state of vCPU 0
machine vcpu run1 --vcpu 1  run state of vCPU 1
```

Output:

```
first line     entry ready pending iter
last dispatch  VCPU EXIT ID RUN IC RCB TOTAL IC REGS HASH RIP RCX ITER
```

See also:

- [`machine dump`](#machine-dump)
- [`machine state`](#machine-state)
- [`machine now`](#machine-now)

## machine ops

List operations on runs and how they finished.
See [Looking at it](running-a-machine.md#looking-at-it).

The listing shows the newest 25 operations in every state. Use `--limit` for a
different page size. Use `--state` to show some states.

An operation outlives the command that started it. One interrupted with Ctrl-C
is still listed here by its id. The next start of a run finishes its unfinished
rewind.

Operations on the account's storage are listed by machine storage ops.

```
usage: machine ops [-h] [--op-id id] [--state [^]state] [--type [^]type] [--since date|age]
                   [--until date|age] [--limit n] [--offset n] [--no-trunc] [-w]
                   [run]
```

| Argument | Does |
|---|---|
| `[run]` | Show operations on one run |

| Option | Does |
|---|---|
| `--op-id id` | Show one operation, by its id (ignores `--state` and `--type`) |
| `--state [^]state` | Filter by state: running, unfinished, done, failed (default: all; repeat = OR; ^ excludes) |
| `--type [^]type` | Filter by type: checkpoint, branch, switch, rewind, start, delete (default: all; repeat = OR; ^ excludes) |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--limit n` | Show at most n operations (default: 25) |
| `--offset n` | Skip the first n operations |
| `--no-trunc` | Show full run ids |
| `-w, --watch` | Watch for changes |

Examples:

```
machine ops       operations pending, unfinished or failed
machine ops run1  those of run1
```

See also:

- [`machine delete`](#machine-delete)
- [`machine runs`](#machine-runs)
- [`machine storage`](#machine-storage)

## machine debug

Show debug or error output from a run.
See [Looking at it](running-a-machine.md#looking-at-it).

The log subcommand shows the debug output. The err subcommand shows errors and
crashes.

```
usage: machine debug [-h] {log,err} ...
```

Examples:

```
machine debug log run1         the log of run1
machine debug log run1 -n -20  its last 20 lines
machine debug log run1 -f      follow it
machine debug err run1         its error log
```

See also:

- [`machine console`](#machine-console)
- [`machine entries`](#machine-entries)
- [`machine ops`](#machine-ops)

### machine debug log

Show the debug log of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

Use -n to select lines, and -f to follow new output.

```
usage: machine debug log [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine debug log run1         the log of run1
machine debug log run1 -n -20  its last 20 lines
machine debug log run1 -f      follow it
```

See also:

- [`machine debug err`](#machine-debug-err)
- [`machine console`](#machine-console)
- [`machine entries`](#machine-entries)

### machine debug err

Show the error and crash log of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

Use -n to select lines, and -f to follow new output.

```
usage: machine debug err [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine debug err run1         the error log of run1
machine debug err run1 -n -20  its last 20 lines
machine debug err run1 -f      follow it
```

See also:

- [`machine debug log`](#machine-debug-log)
- [`machine console`](#machine-console)
- [`machine state`](#machine-state)

## machine tasks

List the tasks running inside a machine.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

A task is a thread of a program in the machine. One row per task, keyed by tid.
The tgid is the process.

Use `--vcpu` to list the tasks of one vCPU. Use `--focused` to list the tasks
that focus steers.

The subcommands steer the scheduler, so a thread order can be tried. The hold,
yield and release subcommands control whether a thread runs.

The slice subcommand sets how long a thread runs. The pin subcommand places it
on a vCPU. The cgroups subcommand groups the list. The exits subcommand lists
the tasks that left.

```
usage: machine tasks [-h] [--vcpu n] [--focused]
                     run {cgroups,exits,hold,yield,release,slice,pin} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--vcpu n` | Only tasks on this vCPU |
| `--focused` | Only the tasks focus is steering |

Examples:

```
machine tasks run1            the tasks in run1's machine
machine tasks run1 --focused  only the focused tasks
```

Output:

```
TID TGID        the thread, and the process it belongs to
COMM EXE        the name of the task, and the path of its program
CPU             the vCPU the task is on, blank when it is on none
NEXT            whose code runs next on that vCPU: user or kernel
KIND            user for a program, kernel for a kernel thread
FOCUS           ticked for a task that focus steers
HOLD YIELD PIN  ticked for a mark set with hold, yield or pin
SLICE           the time set with slice
json            also cgroup, and exe under the same name
generation      a count that changes when the table does
truncated       true when the guest has more tasks than the table holds
paths_full      true when some program paths did not fit
```

Refuses, and the way past:

```
a machine not yet up  machine run run1 --until tasks
```

See also:

- [`machine focus`](#machine-focus)
- [`machine syscalls`](#machine-syscalls)
- [`machine ints`](#machine-ints)

### machine tasks cgroups

List the tasks grouped by cgroup.
See [Holding threads](steering-programs.md#holding-threads).

Use `--vcpu` to list the tasks of one vCPU.

```
usage: machine tasks run cgroups [-h] [--vcpu n]
```

| Option | Does |
|---|---|
| `--vcpu n` | Only tasks on this vCPU |

Examples:

```
machine tasks run1 cgroups           tasks grouped by cgroup
machine tasks run1 cgroups --vcpu 1  tasks of vCPU 1
```

See also:

- [`machine tasks`](#machine-tasks)
- [`machine tasks exits`](#machine-tasks-exits)
- [`machine focus add`](#machine-focus-add)

### machine tasks exits

List the tasks that exited and how each one ended.
See [Holding threads](steering-programs.md#holding-threads).

The list is kept across checkpoints and replays. It is bounded and says how many
it dropped.

```
usage: machine tasks run exits [-h]
```

Examples:

```
machine tasks run1 exits  tasks that left, newest last
```

Output:

```
text     TID TGID COMM OUTCOME
OUTCOME  status <n>, or killed by <signal>
json     tid tgid comm exit_code signal status outcome
head     how many tasks have exited since the machine started
lost     how many of the oldest are no longer kept
```

See also:

- [`machine tasks`](#machine-tasks)
- [`machine tasks cgroups`](#machine-tasks-cgroups)
- [`machine wait`](#machine-wait)

### machine tasks hold

Take a thread off the runqueue.
See [Holding threads](steering-programs.md#holding-threads).

The scheduler cannot pick a held thread. A hold takes effect at the next
scheduling decision of the vCPU. Holding the last runnable thread leaves nothing
to run and no decision coming.

```
usage: machine tasks run hold [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

Examples:

```
machine tasks run1 hold 56  hold thread 56
```

See also:

- [`machine tasks release`](#machine-tasks-release)
- [`machine tasks yield`](#machine-tasks-yield)
- [`machine irq`](#machine-irq)

### machine tasks yield

Put a thread behind its peers.
See [Holding threads](steering-programs.md#holding-threads).

The thread stays runnable. It does nothing when no peer is runnable.

```
usage: machine tasks run yield [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

Examples:

```
machine tasks run1 yield 56  put thread 56 behind its peers
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks release`](#machine-tasks-release)
- [`machine irq`](#machine-irq)

### machine tasks release

Undo a hold or a yield.
See [Holding threads](steering-programs.md#holding-threads).

A release needs a scheduling decision on the vCPU. Force one with irq preempt
`--vcpu` all.

```
usage: machine tasks run release [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

Examples:

```
machine tasks run1 release 56  undo hold and yield
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks yield`](#machine-tasks-yield)
- [`machine irq`](#machine-irq)

### machine tasks slice

Set how long a thread runs between decisions.
See [Holding threads](steering-programs.md#holding-threads).

A decision is a scheduling decision of the vCPU. Give a duration with a unit,
such as 10us, 0.6ms or 750000ns. Use default for the kernel's own. A slice
survives release.

```
usage: machine tasks run slice [-h] tid duration|default
```

| Argument | Does |
|---|---|
| `tid` | Thread id |
| `duration\|default` | Duration with a unit, or default |

Examples:

```
machine tasks run1 slice 56 600us    run thread 56 for 600 us
machine tasks run1 slice 56 default  the kernel's own slice
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks pin`](#machine-tasks-pin)
- [`machine irq`](#machine-irq)

### machine tasks pin

Place a thread on one or more vCPUs when it next wakes.
See [Holding threads](steering-programs.md#holding-threads).

Each choice is a set of vCPUs. The set 1-3 is all three. The set 1,2,3 is three
choices of one.

Free means any vCPU. None means no vCPU, which stops the thread running.

Pin is a placement policy, not confinement. A thread already queued elsewhere
keeps that vCPU until it wakes.

```
usage: machine tasks run pin [-h] tid set|free|none
```

| Argument | Does |
|---|---|
| `tid` | Thread id |
| `set\|free\|none` | Set of vCPUs to place the thread on, such as 1 or 0-2; free for any, none for no vCPU |

Examples:

```
machine tasks run1 pin 56 2     place thread 56 on vCPU 2
machine tasks run1 pin 56 free  place it on any vCPU
```

See also:

- [`machine tasks slice`](#machine-tasks-slice)
- [`machine tasks hold`](#machine-tasks-hold)
- [`machine plan`](#machine-plan)

## machine syscalls

List the system calls of the machine, by number.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

A name filters the list to calls whose name contains that text.

A task shows its syscall histogram instead. Name a task by tid, tgid, absolute
path or cgroup=path. The histogram counts calls made while the focus entry of
the task was armed with focus add `<path>` +syscalls.

```
usage: machine syscalls [-h] run [name|tid|tgid|path]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[name\|tid\|tgid\|path]` | Filter the list, or a task to show its histogram |

Examples:

```
machine syscalls run1        the system calls of the machine
machine syscalls run1 read   calls with read in the name
machine syscalls run1 /test  the calls counted for /test
```

See also:

- [`machine ints`](#machine-ints)
- [`machine focus`](#machine-focus)
- [`machine tasks`](#machine-tasks)

## machine ints

List the interrupt vectors of the machine.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

One row per IDT vector that the machine has a handler for. The vector is in hex,
as the table is indexed. A name filters to handlers whose name contains that
text.

A task shows its interrupt histogram instead. Name a task by tid, tgid, absolute
path or cgroup=path. The histogram counts interrupts taken while the focus entry
of the task was armed with focus add `<path>` +ints.

```
usage: machine ints [-h] run [name|tid|tgid|path]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[name\|tid\|tgid\|path]` | Filter the list, or a task to show its histogram |

Examples:

```
machine ints run1        the interrupt vectors of the machine
machine ints run1 timer  handlers with timer in the name
machine ints run1 /test  the interrupts counted for /test
```

See also:

- [`machine syscalls`](#machine-syscalls)
- [`machine focus`](#machine-focus)
- [`machine irq`](#machine-irq)

## machine focus

Show and change which tasks a machine steers.
See [Focus](steering-programs.md#focus).

A focused program is tracked. A batch of run iterations ends at each of its
context switches and where it reaches its own code.

An entry is the absolute path of a program, matched exactly. Write
cgroup=`<path>` to match the cgroup of a task. Write tgid=`<n>` to name a
process by id. The tgid of a task is shown by tasks.

Use add and remove to change the list. Use clear to empty it.

```
usage: machine focus [-h] run {add,remove,clear} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine focus run1                            what is focused
machine focus run1 add /test +syscalls +ints  count its calls and interrupts
machine focus run1 clear                      focus nothing
```

Output:

```
Focus     each program or cgroup named, and what is counted for it
Steering  the tgid of each process a focus entry matches now
          nothing yet, until a program that is named starts
Marks     how many threads are held, yield or have a slice
Switches  context switches of steered tasks since the start
          on I/O counts those where the task left to wait for I/O
```

See also:

- [`machine tasks`](#machine-tasks)
- [`machine syscalls`](#machine-syscalls)
- [`machine ints`](#machine-ints)

### machine focus add

Steer another program. See [Focus](steering-programs.md#focus).

The entry is a program path, cgroup=`<path>` or tgid=`<n>`. Add +syscalls or
+ints to count its system calls or interrupts.

```
usage: machine focus run add [-h] path|cgroup=path|tgid=n [+syscalls|+ints ...]
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|tgid=n` | Program path, cgroup, or process id to match |
| `[+syscalls\|+ints ...]` | Count this program's syscalls or interrupts |

Examples:

```
machine focus run1 add /test                  focus the program /test
machine focus run1 add /test +syscalls +ints  count its calls and interrupts
```

See also:

- [`machine focus remove`](#machine-focus-remove)
- [`machine focus clear`](#machine-focus-clear)
- [`machine tasks`](#machine-tasks)

### machine focus remove

Stop steering a program. See [Focus](steering-programs.md#focus).

Name the entry as it was added, by program path, cgroup=`<path>` or tgid=`<n>`.

```
usage: machine focus run remove [-h] path|cgroup=path|tgid=n
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|tgid=n` | Program path, cgroup, or process id to match |

Examples:

```
machine focus run1 remove /test  stop focusing /test
```

See also:

- [`machine focus add`](#machine-focus-add)
- [`machine focus clear`](#machine-focus-clear)
- [`machine tasks`](#machine-tasks)

### machine focus clear

Empty the list of steered programs. See [Focus](steering-programs.md#focus).

```
usage: machine focus run clear [-h]
```

Examples:

```
machine focus run1 clear  focus nothing
```

See also:

- [`machine focus add`](#machine-focus-add)
- [`machine focus remove`](#machine-focus-remove)
- [`machine tasks`](#machine-tasks)

## machine irq

Inject an interrupt into the vCPUs of a machine.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

Without a vector, the command lists the vector names. The option `--nmi` alone
delivers an NMI.

The vector is a number or a name from irq_vectors.h of the kernel. The name
preempt is 0xf5, the reschedule vector of the machine. The name reschedule is
0xfd, the reschedule vector of the kernel.

The vector is delivered as given. It reaches the handler that the kernel of the
machine installed for it. A vector with no handler is a spurious interrupt.
Vectors below 32 are CPU exceptions and are refused.

The interrupt is queued when the command returns. It is delivered and recorded
at the next dispatch boundary. A replay repeats it there. Step first to choose
that boundary.

```
usage: machine irq [-h] [--vcpu n] [--nmi] run [vector]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[vector]` | Vector: a name such as preempt, or a number 32-255 |

| Option | Does |
|---|---|
| `--vcpu n` | Which vCPU takes it, or all (default: the last entry's) |
| `--nmi` | Deliver as an NMI rather than a fixed interrupt |

Examples:

```
machine irq run1        list the interrupt vectors
machine irq run1 0xec   inject vector 0xec
machine irq run1 --nmi  inject an NMI
```

See also:

- [`machine ints`](#machine-ints)
- [`machine vcpu`](#machine-vcpu)
- [`machine vtime`](#machine-vtime)

## machine vtime

Show and change the clock of a machine.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

Machine time is derived from what the machine executes, not from the host clock.

Use rate to change how fast machine time passes. Use add to push the clock
forward without running the machine. The clock only goes forward. Use rewind to
put the run back at an earlier point.

```
usage: machine vtime [-h] run {rate,add} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine vtime run1           virtual time and rate
machine vtime run1 rate 5    set the rate to 5
machine vtime run1 add 1000  advance the clock 1000 ns
```

See also:

- [`machine run`](#machine-run)
- [`machine now`](#machine-now)
- [`machine state`](#machine-state)

### machine vtime rate

Set how fast machine time passes.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

The rate is the nanoseconds of machine time for each conditional branch the
guest retires. A run starts at 10 unless create was given `--vtime-rate`.

Give the rate as a number or as num/den.

```
usage: machine vtime run rate [-h] rate
```

| Argument | Does |
|---|---|
| `rate` | Rate, or num/den |

Examples:

```
machine vtime run1 rate 20   20 ns for each conditional branch
machine vtime run1 rate 1/2  1 ns for every two
```

See also:

- [`machine vtime add`](#machine-vtime-add)
- [`machine vtime`](#machine-vtime)
- [`machine run`](#machine-run)

### machine vtime add

Push the clock forward without running the machine.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

Give a time such as 1s or 250ms. A bare number is nanoseconds.

```
usage: machine vtime run add [-h] time
```

| Argument | Does |
|---|---|
| `time` | Time to add, such as 1s or 250ms; a bare number is nanoseconds |

Examples:

```
machine vtime run1 add 10us  advance the clock 10 us
```

See also:

- [`machine vtime rate`](#machine-vtime-rate)
- [`machine vtime`](#machine-vtime)
- [`machine fork`](#machine-fork)
