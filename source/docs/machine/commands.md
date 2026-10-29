<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Commands

`machine --help` lists these commands, in this order. The options apply to every
command. Add `--help` after a command to list its own options. Where a command
takes further commands, those follow it, so each one has a heading.

## Options

| Option | Does |
|---|---|
| `-o`, `--format` | Output format: text, raw, or json. The default is text. JSON carries every field. |
| `--version` | Show version and license. |
| `--no-colors` | Disable terminal color highlighting. |
| `--signatures` | Name functions by their whole signature, parameters included. Without it a C++ function is named short, as GDB names it: `DB::executeQuery`. |
| `--debug` | Show the messages exchanged with the service. |
| `--api-url` | Cloud API base URL. Overrides `TESTFLOWS_MACHINE_API_URL` and the default. |
| `-s`, `--session` | Target session, by name, id, or unique prefix. Goes before the command, as every option here does. Commands that need no session ignore it. |
| `--timeout` | Give up after S seconds, for commands that wait. The default is no limit. 0 means check once. |
| `-q`, `--quiet` | No progress or spinners. |

## machine login

Sign in. See [Signing up](getting-started.md#signing-up).

A sign-in code is emailed. Use the account signup command if there is no account
yet.

Or set TESTFLOWS_MACHINE_API_KEY instead.

```
machine login [-h]
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

The create subcommand creates a session and uses it, so later commands in this
terminal go to it. The use subcommand switches to another session.

Use -s to select a session for a single command. A session bills while it runs.

```
machine sessions [-h] [-w] command ...
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |

Examples:

```
machine sessions                 list sessions
machine sessions create work     create a session and use it
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

The current session is tagged. A session that stopped shows how it stopped. Use
`--all` to list the stopped sessions of the account as well.

```
machine sessions list [-h] [-w] [-a]
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |
| `-a, --all` | List stopped sessions as well, the newest 50 |

Examples:

```
machine sessions list        list sessions
machine sessions list --all  with the stopped ones, and how each stopped
machine sessions list -w     watch the list
```

See also:

- [`machine sessions create`](#machine-sessions-create)
- [`machine sessions show`](#machine-sessions-show)
- [`machine sessions use`](#machine-sessions-use)
- [`machine sessions keep`](#machine-sessions-keep)

### machine sessions create

Create a session and use it. See [Sessions](sessions.md).

The command uses the new session in this terminal, as sessions use does. Use
`--no-use` to keep using the session in use before.

The command waits until the session is running. Use `--no-wait` to return once
the request is accepted. A session created with `--no-wait` is not used.

```
machine sessions create [-h] [--cpus n] [--mem size] [--storage size] [--class type]
                        [--no-wait] [--no-use]
                        [name]
```

| Argument | Does |
|---|---|
| `[name]` | Session name (default: auto-generated) |

| Option | Does |
|---|---|
| `--cpus n` | Number of vCPUs (default: 1) |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: the class's memory for each vCPU, as sessions classes lists it) |
| `--storage size` | The session's storage, GB or with a K/M/G/T suffix (default: the class's storage for the session's size, up to the plan's limit) |
| `--class type` | Hardware class, as sessions classes lists it (default: the plan's class) |
| `--no-wait` | Return without waiting |
| `--no-use` | Create the session without using it |

Examples:

```
machine sessions create work            create the session work and use it
machine sessions create work --cpus 4   with 4 vCPUs
machine sessions create work --no-use   keep the session in use
machine sessions create work --no-wait  return once accepted
```

Refuses, and the way past:

```
a class with no capacity now  machine sessions classes
```

See also:

- [`machine sessions use`](#machine-sessions-use)
- [`machine sessions list`](#machine-sessions-list)
- [`machine sessions classes`](#machine-sessions-classes)

### machine sessions use

Make a session the default for later commands. See [Sessions](sessions.md).

The command connects first if needed. It checks that the session responds before
switching. With `--no-wait` it fails if a connect is needed and the session is
not running yet.

```
machine sessions use [-h] [--no-wait] [session]
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
machine sessions show [-h] [session]
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

### machine sessions classes

List the hardware classes a session can be created on.

Each class names its CPU architecture. A run starts only in a session of the
architecture it was recorded on. Use the class name with create `--class`.

```
machine sessions classes [-h]
```

Examples:

```
machine sessions classes          list the classes
machine -o json sessions classes  with every field, for a script
```

See also:

- [`machine sessions create`](#machine-sessions-create)
- [`machine sessions list`](#machine-sessions-list)

### machine sessions delete

Delete a session. See [Sessions](sessions.md).

The first operand names the session. Use -a to delete every session.

The command stops the machines of the session and syncs their runs to shared
storage. The runs start again in another session. A session already gone counts
as success. Its connection on this computer is cleared.

The command waits until a named session is gone. Use `--no-wait` to return once
the request is accepted.

```
machine sessions delete [-h] [-a] [-y] [--no-wait] [session]
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
machine sessions rename [-h] session new-name
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

### machine sessions keep

Keep a session running while it is idle.

A session is idle while it serves no command. An idle session stops after the
plan's idle time. Keep holds it for the duration, up to the plan's limit. A
later keep replaces the hold.

```
machine sessions keep [-h] session duration
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix |
| `duration` | How long to keep it, such as 30m or 1h |

Examples:

```
machine sessions keep work 30m  keep work running idle for 30 minutes
machine sessions keep work 1h   keep it for an hour
```

See also:

- [`machine sessions list`](#machine-sessions-list)
- [`machine sessions show`](#machine-sessions-show)
- [`machine account show`](#machine-account-show)

### machine sessions connect

Connect to a session. See [Sessions](sessions.md).

The command connects this computer to the session and uses it in this terminal.
The use subcommand does the same and also checks a connection already open. Use
sessions use instead.

The command waits until the session is running. Use `--no-wait` to return once
the request is accepted.

```
machine sessions connect [-h] [--no-wait] [session]
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
terminal loses it. Use -a to disconnect every session.

```
machine sessions disconnect [-h] [-a] [session]
```

| Argument | Does |
|---|---|
| `[session]` | Session (default: the current one) |

| Option | Does |
|---|---|
| `-a, --all` | Disconnect every session |

Examples:

```
machine sessions disconnect work  disconnect from work
machine sessions disconnect -a    disconnect every session
```

See also:

- [`machine sessions connect`](#machine-sessions-connect)
- [`machine sessions use`](#machine-sessions-use)

## machine ping

Check reachability and latency. See [The client](getting-started.md#the-client).

The command pings the API and the connected sessions. It reports the state,
round-trip time, jitter, setup time and certificate lifetime of each target.

```
machine ping [-h] [-c n]
```

| Option | Does |
|---|---|
| `-c, --count n` | Round-trips per target (default: 3) |

Examples:

```
machine ping       reachability and latency of the API and sessions
machine ping -c 5  five round-trips per target
```

Prints:

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
machine account [-h] command ...
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
machine account devices [-h] [--revoke id]
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
machine account buy [-h] command ...
```

Examples:

```
machine account buy usage 10      buy 10 usage credits for €10
machine account buy plan starter  subscribe to starter
```

See also:

- [`machine account buy usage`](#machine-account-buy-usage)
- [`machine account buy plan`](#machine-account-buy-plan)
- [`machine account products`](#machine-account-products)

### machine account buy usage

Buy usage credits.

The command opens checkout for the pack of the named number of credits. A credit
costs one euro. A credit has no cash value.

```
machine account buy usage [-h] [-y] credits
```

| Argument | Does |
|---|---|
| `credits` | Credits to buy, one of the amounts account products list shows. A credit costs one euro |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |

Examples:

```
machine account buy usage 10     buy 10 usage credits for €10
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
machine account buy plan [-h] [-y] plan
```

| Argument | Does |
|---|---|
| `plan` | Plan to subscribe to: starter or pro |

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
machine account upgrade [-h] [--link] [-y] [plan]
```

| Argument | Does |
|---|---|
| `[plan]` | Plan to move to (default: the next plan up) |

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
machine account downgrade [-h] [--link] [-y] [plan]
```

| Argument | Does |
|---|---|
| `[plan]` | Plan to move to (default: the next plan down) |

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
machine account payment [-h] [--link]
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
machine account portal [-h] [--link]
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
machine account invoices [-h] [--since date|age] [--until date|age]
                         [--status {draft,open,paid,uncollectible,void}] [--limit n]
                         [--sort field] [--reverse]
                         command ...
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
machine account invoices list [-h] [--since date|age] [--until date|age]
                              [--status {draft,open,paid,uncollectible,void}] [--limit n]
                              [--sort field] [--reverse]
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
machine account invoices download [-h] [--link] invoice-id
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
machine account cancel [-h] [--link]
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
machine account email [-h] [-y] email
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
machine account products [-h] command ...
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
machine account products list [-h]
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
machine account show [-h]
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
machine account credits [-h]
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

A session is charged an hour ahead, as Charged rows. When it stops, a Settled
row gives back the unused part of its last hour. Naming a session ends the
listing with what the session used over all of its rows.

The listing shows the newest 25. Use `--limit` for a different page size.

```
machine account activity [-h] [--since date|age] [--until date|age] [--period date]
                         [--type {included,charged,settled,expired,expired-removed,credit-purchase}]
                         [--credit-type {included,usage}] [--limit n] [--sort field]
                         [--reverse]
                         [session]
```

| Argument | Does |
|---|---|
| `[session]` | Show one session's transactions, by name, id or id prefix |

| Option | Does |
|---|---|
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--period date` | Show the plan period that contains this date, such as 2026-10-01 |
| `--type {included,charged,settled,expired,expired-removed,credit-purchase}` | Filter by activity type |
| `--credit-type {included,usage}` | Filter by credit type (included or usage) |
| `--limit n` | Cap to most recent n (default: 25, max 500) |
| `--sort field` | Sort by sequence or amount |
| `--reverse` | Reverse sort order |

Examples:

```
machine account activity             charges and credits
machine account activity idle-check  one session's bill
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
machine account orders [-h]
                       [--status {pending,processing,completed,cancelled,expired,failed}]
                       [--limit n]
                       command ...
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
machine account orders list [-h]
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

The command resumes the pending order. An account has one at most. Use `--link`
to print the URL without opening a browser.

```
machine account orders resume [-h] [--link]
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

The command cancels the pending order. An account has one at most.

```
machine account orders cancel [-h]
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

Set TESTFLOWS_MACHINE_API_KEY to use one.

```
machine account api-keys [-h] command ...
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
machine account api-keys list [-h]
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
machine account api-keys create [-h] [--expiry days|never] name
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
machine account api-keys delete [-h] id
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys list shows it |

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
machine account api-keys update [-h] id days|never
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys list shows it |
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

Set up the account's shared storage.
See [Signing up](getting-started.md#signing-up).

The first session create or disk build sets up storage itself. This command sets
it up ahead of them. The command is safe to repeat while it is still working.

```
machine account provision [-h]
```

Examples:

```
machine account provision  set up shared storage
```

See also:

- [`machine account signup`](#machine-account-signup)
- [`machine sessions create`](#machine-sessions-create)

### machine account signup

Create an account. See [Signing up](getting-started.md#signing-up).

The command shows the Terms of Service and the Client EULA in full and asks for
their acceptance. The account is made accepting them. A link is emailed to
finish signing up.

```
machine account signup [-h]
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

The command emails a code that starts the close. It waits until the machines of
every session stop. It then emails a second code that confirms the close.

A close that is not confirmed stays in progress. Run the command again to finish
it. Use `--cancel` to stop it.

```
machine account close [-h] [-y] [--cancel]
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
machine logout [-h] [--everywhere]
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

## machine completion

Print the shell completion script.
See [The client](getting-started.md#the-client).

The script completes commands, options and their values as the client reads
them. The client answers each Tab itself, so a newer client needs no newer
script.

Add the line for the shell to its startup file:

```text
bash  eval "$(machine completion bash)"   in ~/.bashrc
zsh   eval "$(machine completion zsh)"    in ~/.zshrc
fish  machine completion fish | source    in ~/.config/fish/config.fish
```

Run the same line in a shell to complete in that shell alone. The completion
lasts until the shell exits.

machine-env loads the script itself. On macOS, machine outside machine-env is
the system's command. There the line belongs in no startup file.

```
machine completion [-h] {bash,zsh,fish}
```

| Argument | Does |
|---|---|
| `{bash,zsh,fish}` | Shell to print the script for: bash, zsh or fish |

Examples:

```
machine completion bash  the script for bash
machine completion zsh   the script for zsh
machine completion fish  the script for fish
```

See also:

- [`machine login`](#machine-login)

## machine disks

List and manage disks. See [Disks](disks.md).

A disk is the filesystem image that a run is created from. Build one from a
static binary, a Docker image or a Compose project.

The listing shows the newest 25. Use `--limit` for a different page size.

```
machine disks [-h] [-q] [--no-trunc] [--deleted] [--label name=value] [--since date|age]
              [--limit n] [--offset n] [-w]
              command ...
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show deleted disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
- [`machine fs`](#machine-fs)
- [`machine storage`](#machine-storage)

### machine disks list

List disks. See [Disks](disks.md).

The listing shows the newest 25. Use `--limit` for a different page size.

```
machine disks list [-h] [-q] [--no-trunc] [--deleted] [--label name=value]
                   [--since date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show deleted disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
executable. Pass arguments after --.

Use `--env` to set a variable in the environment of the container. The disk
holds each `--env` value as written.

A project runs every service in it. It takes no `--entrypoint`, no `--env` and
no arguments after --.

With `--from` or `--binary`, `--add` puts a file or a directory in the image, as
one more layer. Without a destination the path lands in the working directory of
the image, under its own name. Write path:dest to name another place. A dest
ending in / is a directory.

The name defaults to what the source is called. The size defaults to the size of
the images once loaded, plus 1 GB, rounded up to a whole GB. Use `--dry-run` to
see those numbers without building anything.

The build writes the images into the Docker store of the disk. A machine created
from the disk has every image present and loads nothing. Use `--load-at-boot` to
keep them on the disk as save tars. Docker then loads them each time a machine
starts from the disk.

A guest that runs docker save or docker push on one of the images needs the save
tars. Such a disk holds each image twice and is sized for both.

```
machine disks build [-h] (--binary path | --image ref | --from ref | --compose dir)
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
| `--size size` | Disk size, MB or with a K/M/G/T suffix (default: the loaded images plus 1 GB, rounded up to a GB) |
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
machine disks show [-h] name
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
machine disks transfers [-h] [--active] [--since date|age] [-w]
```

| Option | Does |
|---|---|
| `--active` | Only in-flight transfers |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
machine disks delete [-h] [-y] [-f] name [name ...]
```

| Argument | Does |
|---|---|
| `name [name ...]` | Disk names |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |
| `-f, --force` | Delete a disk that runs were created from |

Examples:

```
machine disks delete hello -y     delete hello
machine disks delete hello -f -y  delete it though runs boot it
```

See also:

- [`machine disks list`](#machine-disks-list)
- [`machine delete`](#machine-delete)
- [`machine storage prune`](#machine-storage-prune)

### machine disks rename

Rename a disk. See [Disks](disks.md).

```
machine disks rename [-h] name new-name
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

The command reads the disk back out of shared storage. It computes the id, which
is what the disk is stored under. A disk that reads as stored is verified. A
disk that does not is reported as damaged.

The check is a storage operation and takes about as long as reading the disk. It
keeps running if the command is interrupted. Run machine storage ops to list it.
One check runs at a time for an account.

The command waits for the result. Use `--no-wait` to return once the request is
accepted.

```
machine disks verify [-h] [--no-wait] name
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
machine disks cancel [-h] name
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

Use -a to fetch every run that this session's runs branched from, and their
disks. A copy already here is skipped. A session is required.

```
machine preload [-h] [-a] command ...
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
machine preload run [-h] [-a] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name, required without -a |

| Option | Does |
|---|---|
| `-a, --all` | Every run this session's runs branched from |

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
machine preload disk [-h] [-a] [disk]
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

## machine fs

List, copy or print files of a run's disk.

The command reads the filesystem on the disk as a checkpoint saved it. It never
reads the live machine. It needs no program in the machine and does not change
how the machine executes.

Every read names its checkpoint with `--at`. A point that is not a checkpoint is
refused, and the refusal names the checkpoint before it. The point now is the
checkpoint the run stands at, until the machine runs again.

Data the machine has not synced to its disk is not visible. A file a program
wrote a moment before the checkpoint can be missing, short or empty.

To read the files as they are, execute sync in the machine with exec. Then take
a checkpoint and read with `--at` now. Use exec run with cat to read a file of
the live machine.

A run created with `--fs-sync` writes every change of a file to the disk as it
is made. A run created with `--fs-dirsync` does so for every change of a
directory. Both are options of create and are off by default.

```
machine fs [-h] command ...
```

Examples:

```
machine fs ls run1 /etc --at ^cp1             list a directory at cp1
machine fs cat run1 /etc/hostname --at ^cp1   print a file
machine fs cp run1 /etc/hostname . --at ^cp1  copy a file out
machine fs ls run1 / --at '#300'              at the checkpoint at entry 300
machine fs ls run1 / --at now                 at the checkpoint just taken
```

Refuses, and the way past:

```
a read with no checkpoint named   machine checkpoints run1
a point with no checkpoint at it  machine checkpoint run1
```

See also:

- [`machine checkpoints`](#machine-checkpoints)
- [`machine checkpoint`](#machine-checkpoint)
- [`machine exec`](#machine-exec)
- [`machine disks`](#machine-disks)

### machine fs ls

List files on a run's disk at a checkpoint.

The files are read from the disk as a checkpoint saved it, not from the live
machine. Use `--at` to name the checkpoint. Data the machine has not synced to
its disk is not visible.

```
machine fs ls [-h] [--at point] [-l] [-a] run [path]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[path]` | Path (default: /) |

| Option | Does |
|---|---|
| `--at point` | Required. The checkpoint to read the disk at: ^name, '#entry' of a checkpoint, or now |
| `-l` | Long format (mode, size, mtime, name) |
| `-a, --all` | Include the current and parent directory entries |

Examples:

```
machine fs ls run1 /etc --at ^cp1        list a directory at cp1
machine fs ls -l -a run1 /etc --at ^cp1  long form
```

Prints:

```
text  checkpoint <entry> path <path>, then a name a line
json  checkpoint path entries
```

See also:

- [`machine fs cat`](#machine-fs-cat)
- [`machine fs cp`](#machine-fs-cp)
- [`machine checkpoints`](#machine-checkpoints)

### machine fs cp

Copy a file or directory from a run's disk at a checkpoint.

The files are read from the disk as a checkpoint saved it, not from the live
machine. Use `--at` to name the checkpoint. Data the machine has not synced to
its disk is not visible. Use -r to copy a directory.

```
machine fs cp [-h] [--at point] [-r] run path [dest]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `path` | Path to copy |
| `[dest]` | Local destination file or directory (default: .) |

| Option | Does |
|---|---|
| `--at point` | Required. The checkpoint to read the disk at: ^name, '#entry' of a checkpoint, or now |
| `-r, --recursive` | Copy directories recursively |

Examples:

```
machine fs cp run1 /etc/hostname . --at ^cp1  copy a file out
machine fs cp -r run1 /etc ./etc --at ^cp1    copy a directory out
```

See also:

- [`machine fs ls`](#machine-fs-ls)
- [`machine fs cat`](#machine-fs-cat)
- [`machine checkpoints`](#machine-checkpoints)

### machine fs cat

Print a file from a run's disk at a checkpoint.

The files are read from the disk as a checkpoint saved it, not from the live
machine. Use `--at` to name the checkpoint. Data the machine has not synced to
its disk is not visible.

```
machine fs cat [-h] [--at point] run path
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `path` | File path |

| Option | Does |
|---|---|
| `--at point` | Required. The checkpoint to read the disk at: ^name, '#entry' of a checkpoint, or now |

Examples:

```
machine fs cat run1 /etc/hostname --at ^cp1    print a file
machine fs cat run1 /etc/hostname --at '#300'  at entry 300
```

See also:

- [`machine fs ls`](#machine-fs-ls)
- [`machine fs cp`](#machine-fs-cp)
- [`machine checkpoints`](#machine-checkpoints)

## machine sync

Publish a run to shared storage.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Any session can then start the run. The command runs in the session that holds
the run.

```
machine sync [-h] run
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
machine offload [-h] [--runs] [--disks] [-a] command ...
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
machine offload list [-h] [--runs] [--disks]
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
machine offload run [-h] [-a] [run]
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
machine offload disk [-h] [-a] [disk]
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
machine storage [-h] [--refresh] command ...
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
machine storage show [-h] [--refresh]
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

These operations act on the account's storage, not on a run. The ops command
does not list them. The command needs no session.

```
machine storage ops [-h] [--op-id id] [--state [^]state] [--type [^]type]
                    [--since date|age] [--until date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `--op-id id` | Show one operation, by its id (ignores `--state` and `--type`) |
| `--state [^]state` | Filter by state: pending, running, done, failed (default: all; repeat = OR; ^ excludes) |
| `--type [^]type` | Filter by type: measure, prune, verify, check (default: all; repeat = OR; ^ excludes) |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
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
machine storage prune [-h] [-y] [--status]
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
machine storage check [-h] [--status] [--no-wait]
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

A source is a device the machine prints on, such as ttyS1, or a file under
/output. Use `--keep-output` to store a source that would be dropped. Use
`--drop-output` to store less. The run keeps both lists for its whole life, and
the describe command shows them.

A run stores every source but the files under /output/drop. A file there has a
name and no bytes. A program writes under /output/drop through
MACHINE_DROP_OUTPUT_DIR. It writes under /output/keep through
MACHINE_OUTPUT_DIR.

A name given to either option may be a pattern, such as /output/drop/*/*.log. A
star matches within one directory name, a leading dot included, and never a
slash. Two stars match any number of directories.

A name given to `--keep-output` or `--drop-output` decides before the directory
does. When a kept name and a dropped name cover one source, a name spelled out
decides over a pattern. Of two names spelled out, the longer decides, and a tie
keeps the source. Of two patterns, the kept one decides.

The name none, given alone, is an empty list. Use it to keep or to drop nothing
where the run would have the names of another run.

The command waits until the machine accepts commands. Use `--no-wait` to return
once the request is accepted.

```
machine create [-h] [--like run] [--label name=value] [--no-wait] [--keep-output name]
               [--drop-output name] [--disk disk] [--mem size] [--cpus n]
               [--console {serial,virtio}] [--mem-type {auto,hugepages}]
               [--mem-mode {auto,map,lazy}] [--fs-sync | --no-fs-sync]
               [--fs-dirsync | --no-fs-dirsync] [--fb type] [--rng | --no-rng]
               [--rng-seed n] [--daemon | --no-daemon] [--single-step | --no-single-step]
               [--rdtsc-exit | --no-rdtsc-exit] [--repeatable | --no-repeatable]
               [--limit-margin n] [--timer-slack duration] [--limit n] [--backstop-limit n]
               [--pin-cpu n] [--vtime-base n] [--vtime-rate rate] [--vtime-io-cost ns]
               [--vtime-rdtsc-cost ns] [--vtime-pause-cost ns] [--auto-checkpoints n]
               [--side-dump | --no-side-dump] [--side-trace | --no-side-trace]
               [--mem-hash | --no-mem-hash] [--disk-hash | --no-disk-hash]
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
| `--keep-output name` | Source that the run stores though it is dropped: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--drop-output name` | Source that the run does not store: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--disk disk` | Disk to create the run from |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: 256) |
| `--cpus n` | Number of CPUs (default: 1) |
| `--console {serial,virtio}` | Device the console is: serial for ttyS0 (default) or virtio for hvc0 |
| `--mem-type {auto,hugepages}` | Machine RAM backing: auto (default) or hugepages (local only) |
| `--mem-mode {auto,map,lazy}` | How memory loads when the run starts from a checkpoint: auto (default), map to load it first, lazy to load each page at first use |
| `--fs-sync, --no-fs-sync` | Mount filesystem with sync (default: off) |
| `--fs-dirsync, --no-fs-dirsync` | Mount filesystem with dirsync (default: off) |
| `--fb type` | Framebuffer type: vnc, gtk, sdl, or none |
| `--rng, --no-rng` | Give the guest an RNG device, whose seed a branch can change (default: on) |
| `--rng-seed n` | Seed of the RNG device, 0 to 2^64-1 (default: 0) |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: on) |
| `--single-step, --no-single-step` | Run in step mode, with `--no-daemon`. A run that waits for commands takes its mode from machine run `--mode` |
| `--rdtsc-exit, --no-rdtsc-exit` | Record an entry for every RDTSC exit, with `--no-daemon` only |
| `--repeatable, --no-repeatable` | Stop fast exactly at the limit, so recording again gives the same entries (default: the session's) |
| `--limit-margin n` | Conditional branches short of a stop where the CPU's counter interrupts (default: the host's) |
| `--timer-slack duration` | How late a timer may be in code that takes no exit, 0 for none (default: 20ms) |
| `--limit n` | Conditional branches per dispatch in fast mode, steps in step mode, 0 to leave it to the machine (default: 0) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--vtime-base n` | The vtime base (Unix timestamp, default: 2026-03-01) |
| `--vtime-rate rate` | Nanoseconds of machine time for each conditional branch the guest retires, a number or num/den (default: 10) |
| `--vtime-io-cost ns` | IO exit vtime cost in ns (default: 2000) |
| `--vtime-rdtsc-cost ns` | RDTSC exit vtime cost in ns (default: the IO cost) |
| `--vtime-pause-cost ns` | Vtime cost of each PAUSE in ns (default: 2000) |
| `--auto-checkpoints n` | Checkpoint every n entries, 0 for never (default: scaled by memory, 50000 per 512MB) |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump in the run log (default: off) |
| `--side-trace, --no-side-trace` | Record the hypervisor's trace of each entry, for diagnosis (default: off) |
| `--mem-hash, --no-mem-hash` | Hash guest memory at every entry, for a replay to compare (default: off) |
| `--disk-hash, --no-disk-hash` | Hash the guest's disk at every entry, for a replay to compare (default: off) |

Examples:

```
machine create run1 --disk hello                      create run1 from hello
machine create run1 --disk hello --mem 512 --cpus 2   with 512 MB, 2 CPUs
machine create run1 --disk hello --rng-seed 42        its RNG seeded from 42
machine create run1 --disk hello --no-daemon          run to completion
machine create run1 --disk hello --repeatable         so recording repeats
machine create run1 --disk hello --timer-slack 0      no timer late
machine create run1 --disk hello --drop-output ttyS1  store none of ttyS1
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
machine start [-h] [-f] [--read-only] [--recover | --no-recover] [--at checkpoint]
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
| `--at checkpoint` | Checkpoint to replay to the tip from, or to open with `--read-only`: ^name, or #entry of a checkpoint |
| `--parents mode` | Where to read the runs it branched from: local for this session, remote for shared storage |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, with `--no-daemon`. A run that waits for commands takes its mode from machine run `--mode` (default: the run's) |
| `--limit n` | Conditional branches per dispatch in fast mode, steps in step mode, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--no-wait` | Return without waiting |

Examples:

```
machine start run1              resume run1 at its tip
machine start run1 --at ^cp1    replay from cp1 to the tip
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
machine pause [-h] [--no-wait] run
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
machine resume [-h] [--no-wait] run
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

Use -r to stop a branch with its descendants. Use -a to stop every running
machine. Use `--dry-run` to list what would stop.

A machine that refuses to stop stays up and is reported. A machine that does not
stop in time stays up too. Use -f with -a or -r to kill those machines.

With -f, the command lists the machines it would kill and asks first. Use -y to
kill without asking.

The command waits until the machine is gone. A machine that already exited
counts as success. Use `--no-wait` to return once the request is accepted.

```
machine stop [-h] [-a] [-r] [-f] [-y] [--dry-run] [--no-wait] [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Stop all running machines |
| `-r, --recursive` | Stop branch and all descendants |
| `-f, --force` | With -a or -r, kill a machine that refuses to stop or does not stop in time |
| `-y, --yes` | With -f, kill without asking first |
| `--dry-run` | List what would be stopped without stopping it |
| `--no-wait` | Return without waiting |

Examples:

```
machine stop run1               stop run1, wait until it is gone
machine stop run1 --no-wait     return once the request is accepted
machine stop run1 -r            stop run1 and every branch under it
machine stop run1 -r --dry-run  list the machines of its tree
machine stop -a                 stop every running machine
machine stop -a --dry-run       list what would stop
machine stop -afy               stop all, kill any that do not stop
```

See also:

- [`machine start`](#machine-start)
- [`machine kill`](#machine-kill)
- [`machine pause`](#machine-pause)
- [`machine delete`](#machine-delete)

## machine kill

Stop a machine, and end it if it does not stop.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

The machine is asked to stop and save, as stop does. It is ended if it does not
stop.

The next start replays the tip of a machine that did not save. The command says
when the machine did not save.

The command waits until the machine is gone. A machine already gone counts as
success. Use `--no-wait` to return once the request is accepted.

```
machine kill [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

Examples:

```
machine kill run1            stop run1, end it if it hangs
machine kill run1 --no-wait  return once the request is accepted
```

See also:

- [`machine stop`](#machine-stop)
- [`machine delete`](#machine-delete)
- [`machine cleanup`](#machine-cleanup)

## machine delete

Delete a run that is not running, with its log and checkpoints.
See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Use -r to delete a branch with its descendants. Use `--dry-run` to list what
would be deleted.

The first operand names the run to delete. Use -a to delete every run, or
`--disk` to delete every run created from one disk. Use `--cleanup` -a to resume
interrupted deletes.

The command waits until the run is gone. Use `--stop` to stop a running machine
first. Use -f to also delete a run whose machine is gone. Use `--no-wait` to
return once the request is accepted.

A delete is an operation. It goes on if the command is interrupted. Run machine
ops to list it.

```
machine delete [-h] [-a] [--disk name|id] [-r] [-y] [--stop] [-f] [--cleanup] [--full-scan]
               [--dry-run] [--no-wait]
               [run]
```

| Argument | Does |
|---|---|
| `[run]` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Delete all runs, or cleanup all interrupted deletes (with `--cleanup`) |
| `--disk name\|id` | Delete every run created from this disk |
| `-r, --recursive` | Delete branch and all descendants |
| `-y, --yes` | Skip the confirmation prompt |
| `--stop` | Stop running machines before deleting |
| `-f, --force` | Implies `--stop`, and deletes a run whose machine is already gone |
| `--cleanup` | Resume interrupted delete operations |
| `--full-scan` | With `--cleanup`, check every run, not only those recorded as interrupted |
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

A stale run is listed as running but has no machine. Use -f to kill machines
that belong to no run, and to remove those runs from the list.

```
machine cleanup [-h] [-f]
```

| Option | Does |
|---|---|
| `-f, --force` | Also kill machines that belong to no run, and remove runs whose machine is already gone |

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

The `--until` predicates are those of wait. The console\~ predicate signals that
boot is done. The halted and activity=idle predicates do not.

A console\~ predicate takes a regular expression. The run stops at the entry
that ends the line the match is on. A match on a line with no end, such as a
prompt, stops the run where the machine goes idle.

The match is within a line, as output search finds it, and has at least one
character. Use the point console\~REGEX to go to the entry that printed the
first byte of the match.

The name of another source takes the place of console, as in ttyS1\~REGEX. The
run then stops for a line that source prints. A line another source prints does
not stop it.

The path of an output file takes the same place, as in
/output/drop/app/debug.log\~REGEX. A file that is dropped stops the run the same
way. The run stores none of the file. A path that holds a \~ is quoted, as in
'"/output/keep/app.log\~"\~ERROR'.

Only text the run prints from its start ends it. A line printed before does not.
Use machine wait `--for` to ask whether text was printed.

tid=N:at=LOC runs until tid N reaches LOC in its own code. tgid=N:at=LOC runs
until any thread of the process does. The address is resolved when the run
starts. The stop takes one of the run's 3 breakpoints and watchpoints.

tid=N:write=LOC runs until an instruction writes the bytes LOC names while tid N
is on a vCPU. tid=N:access=LOC runs until one reads or writes them.
tgid=N:write=LOC and tgid=N:access=LOC stop for any thread of the process.

The run stops after the access. A write the kernel makes for the task counts. A
variable or an expression is watched at its size of 1, 2, 4 or 8 bytes. The
watch takes one of the run's 3 breakpoints and watchpoints.

An address is watched through a cast that gives it a type, as GDB's watch takes
one. The address is a multiple of the size. tgid=N also stops for a kernel
thread that works in the process's memory.

A run that stops at LOC says the tid that reached it and where it stands. A
watch also says the value the access left in the bytes. The machine records both
at the stop, so a task in the kernel still shows them.

LOC is one of these, in the task's process:

```text
0x401136            an address
*0x401136           an address, as GDB writes it
main                a function or a variable, by its name
libc.so.6:malloc    a name in one file, by its path or file name
init.c:106          a source line, from the line tables
$rip                a register of the task, as it is now
main+4, $rsp-8      any of these moved by +N or -N
```

The run log records each iteration as an entry. It also records interrupts and
device input, so entries outnumber iterations.

The global timeout cancels the run in flight. Without one there is no limit. A
timeout of 0 checks once without batching. Exit 3 means the predicate was not
reached.

`--iters` is an upper bound, not a count. A batch is the iterations one request
of the command runs. It ends at every context switch of a focused task, a task
the focus command names. It also ends where a task reaches its own code.

Without `--until`, a batch that ends early ends the run. With `--until`, the run
goes on with the next batch. The response reports how many iterations ran.

Every parameter is drawn for one iteration. The mode, the limit, the task marks
and the interrupt apply to the task on that one vCPU.

Without `--vcpu`, a scheduling cycle dispatches every vCPU. It spends up to one
iteration for each. `--iters` 100 on four vCPUs buys 100 dispatches, not 400.

With `--until`, `--iters` and the predicate are both bounds. The first to fire
wins. `--iters` 500 `--until` on stops at 500 iterations or when a focused task
takes a vCPU.

Use `--within` to bound the run by the machine's clock. The machine checks the
bound at every iteration, so a slow host does not end the run sooner. With
`--until`, the first of the two to hold ends it. Without `--until`, the run goes
on until the clock has moved that far.

Without `--iters`, only the timeout bounds the run, so `--until` tasks runs a
whole boot. A span is lo:hi, a range one value is drawn from for each dispatch.
A span bounds nothing either, so `--iters` 100:500 `--until` on keeps going.

`--when` bounds nothing. It names what must be true for the clause to apply to a
dispatch. A dispatch it excludes runs free, up to the crossing into the subject.

So `--when` /test:on `--until` /test:exit perturbs that program while its own
code runs. It runs free while the program is in the kernel or off the CPU. It
stops when the program is gone. `--iters` counts every dispatch, the ones that
ran free too.

`--when` takes on, kernel and off. Each is a state, not an edge.

The options of run make one clause of a plan. Use machine plan `<run>` `<file>`
for a run of more than one clause.

A hit of a breakpoint, watchpoint or catchpoint ends the run. Use `--iters` 0 to
run until one does, as GDB's continue does.

Use `--back` to go back to the newest breakpoint, watchpoint or catchpoint hit
before now, as reverse-continue does. The machine switches onto a branch at that
entry, as go does. The branch keeps the run's stops as they are now. The run
stays as it was.

```
machine run [-h] [--back] [--limit span] [--backstop-limit n] [--retry n] [--strategy name]
            [--seed n] [--vcpu span] [--iters span] [--until predicate] [--within duration]
            [--irqblk] [--rdtsc-exit] [--no-idle-skip] [--auto-checkpoints n] [--mode list]
            [--fast span] [--step span] [--step-into span] [--fence span]
            [--vtime-rate span] [--vtime-add span] [--timer-slack span]
            [--irq-delay [target=]span,...] [--task-sched choices] [--task-slice choices]
            [--task-int choices] [--when predicate]
            run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--back` | Go back to the newest hit before now, onto a branch |
| `--limit span` | Default branches per dispatch under fast and fence, steps under step; 0 means no limit under fast, one step under step and the machine's fence under fence; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true: a predicate of wait `--for`, or tid=N:at=LOC, tid=N:write=LOC or tid=N:access=LOC, or the same with tgid=N |
| `--within duration` | End the run when the machine's clock has moved this far, such as 10s |
| `--irqblk` | Block IRQs during run |
| `--rdtsc-exit` | Record an entry for every RDTSC exit |
| `--no-idle-skip` | Keep machine time crawling while every vCPU is idle |
| `--auto-checkpoints n` | Auto-checkpoint every N entries; 0 turns it off, default the machine's |
| `--mode list` | Execution mode: fast, step, step-into, free, fence, or a comma list to draw among (default: fast) |
| `--fast span` | Limit fast draws when it wins (its member), overriding `--limit` |
| `--step span` | Limit step draws when it wins (its member), overriding `--limit` |
| `--step-into span` | Limit step-into draws when it wins (its member) |
| `--fence span` | Conditional branches to stop at when fence mode is drawn, overriding `--limit` |
| `--vtime-rate span` | Vtime rate for this run: n, n/d, or a span of either |
| `--vtime-add span` | Nanoseconds to push the clock forward before each dispatch |
| `--timer-slack span` | How late a timer may be in code that takes no exit, drawn per dispatch, at most 1s |
| `--irq-delay [target=]span,...` | Hold each interrupt a time drawn from its target's span, at most 1s. A target is timer, ipi, init, blk, rng, console, serial, keyboard, device or all, and a bare span is all |
| `--task-sched choices` | Draw a scheduler mark per dispatch for the task on that vCPU: keep, hold, yield, drain, drain-all |
| `--task-slice choices` | Draw that task's slice per dispatch: keep, default, or a duration range such as 10us:600us |
| `--task-int choices` | Draw an interrupt for that task per dispatch: none, preempt |
| `--when predicate` | Apply the clause only while this holds |

Examples:

```
machine run run1                             run one iteration
machine run run1 --iters 100                 run 100 iterations
machine run run1 --iters 0                   continue to the next hit
machine run run1 --mode step --iters 20      single-step 20 iterations
machine run run1 --mode fence --limit 50000  stop on 50000 branches
machine run run1 --until 'console~login:'    until the console prints login:
machine run run1 --until 'entry>=500'        until it reaches entry 500
machine run run1 --until vtime=+10ms         until its clock moves 10 ms
machine run run1 --until tasks               until its tasks can be listed
machine run run1 --until tid=41:at=main      until tid 41 is at main
machine run run1 --until tgid=7:at=a.c:9     until tgid 7 reaches a.c:9
machine run run1 --until tid=41:write=sum    until tid 41 writes sum
machine run run1 --until tgid=7:access=buf   until tgid 7 touches buf
machine run run1 --within 10s                until its clock has moved 10 s
machine run run1 --until tasks --within 9s   the first of the two
machine run run1 --irq-delay 0:2ms           hold each interrupt up to 2 ms
machine run run1 --irq-delay blk=1ms         hold disk interrupts 1 ms
machine run run1 --timer-slack 0:20ms        draw the timer slack
```

Prints:

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

Example:

```text
when /test:on       mode step,fast   fast=1:100k step=1:200
when /test:kernel   task-sched hold
else                mode fast
```

Example: place tid 56 on vCPU 2 or 3 when it wakes, 2 three times as often as 3:

```text
else  task-pin 56=golden:2[3],3[1]
```

A clause names one when predicate, then any of these axes. An axis is a comma
list of choices, one drawn per dispatch. [N] is an optional weight on a choice.
The task-slice axis is the exception, a colon set that takes no weights:

```text
when <predicate>
    apply the clause only while the predicate holds. A
    predicate is [subject:]state. The state is on, kernel,
    off, syscall[=name] or int[=vec]. The subject is /path,
    tid=N, tgid=N, cgroup=P, comm=NAME or none for any
    focused task.
    vcpu=N[,N] ANDs a vCPU set onto it.
mode <mode>[N],...
    the modes to draw among: fast, step, step-into, free, fence
    or keep. A mode may carry the limit it draws when it wins,
    <mode>=<span>, as in mode step[3],fast[1] step=1:200.
    free takes no limit.
vtime-rate <rate>[N],...
    the machine-time rate: a number N, a fraction N/D, a span
    of numerators such as 1:10, or keep.
vtime-add <duration>[N],...
    time added to the clock before each dispatch: a duration
    such as 500 or 10us, a span such as 10us:2ms, or keep.
task-sched <mark>[N],...
    a mark for the task on the drawn vCPU: keep, hold, yield,
    drain, drain-all.
task-int <int>[N],...
    an interrupt for that task: none or preempt. This axis has
    no keep: none is its do-nothing choice.
task-slice <choice>:<choice>:...
    that task's time slice, drawn from a colon set of keep,
    default and a duration span, in any combination, as in
    keep:default:10us:600us.
task-pin [<tid>=]<set>[N],...
    where a task is placed when it next wakes, each choice a
    set of vCPUs: 1-3 is all three, 1,2,3 is three choices of
    one, free is any vCPU and none is no vCPU, which stops it
    running. A placement policy, not confinement: a task
    already queued elsewhere keeps that vCPU until it wakes.
    <tid>= names the task. Without it, the task on the
    drawn vCPU is placed. none requires <tid>=.
timer-slack <duration>
    how late a timer may be in code that takes no exit, drawn
    per dispatch: a duration or a span such as 0:20ms, at
    most 1s. keep repeats the last slack drawn; with none
    drawn yet, the run's own --timer-slack.
irq-delay [<target>=]<duration>,...
    how long each interrupt is held before it is injected,
    drawn per interrupt: a duration or a span such as 0:2ms,
    at most 1s. A target is timer, ipi, init, blk, rng,
    console, serial, keyboard, device or all. A bare span is
    all. The most specific target wins. An interrupt never
    overtakes one held before it on its line, its MSI vector,
    or its vCPU's timer, IPI vector or INIT and SIPI.
```

A weight makes a choice win more often. mode step[3],fast[1] draws step three
times as often as fast. keep is the choice that draws nothing. It holds the last
value of the axis, so a clause can leave an axis alone part of the time.

A span is a range written lo:hi[:strategy[:step]]. The strategy is random,
golden or sweep. One value is drawn from the span per dispatch.

A span is accepted by the mode member limit, vtime-rate, vtime-add, task-slice,
timer-slack, irq-delay and the run-level `--limit`. The limit itself is not a
clause axis. It is the default for a mode with no member limit of its own.

The options of this command are plan-level. `--limit` and `--strategy` are the
defaults for a clause that names no span of its own. A clause axis overrides
them for the dispatches it matches. A dispatch that no clause matches runs free.

`--seed` seeds the draw strategies. `--until`, `--iters` and `--vcpu` bound and
steer the run as on run. The clause axes and when belong in the file, not here.

```
machine plan [-h] [--limit span] [--backstop-limit n] [--retry n] [--strategy name]
             [--seed n] [--vcpu span] [--iters span] [--until predicate]
             [--within duration] [--irqblk] [--rdtsc-exit] [--no-idle-skip]
             [--auto-checkpoints n]
             run file
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `file` | Plan file of when and else clauses, and their axes, or - to read standard input |

| Option | Does |
|---|---|
| `--limit span` | Default branches per dispatch under fast and fence, steps under step; 0 means no limit under fast, one step under step and the machine's fence under fence; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true: a predicate of wait `--for`, or tid=N:at=LOC, tid=N:write=LOC or tid=N:access=LOC, or the same with tgid=N |
| `--within duration` | End the run when the machine's clock has moved this far, such as 10s |
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

Prints:

```
tally         one line for each clause, numbered from 1
<choice>×<n>  how many times that choice of an axis was drawn
matched <n>   how many dispatches the clause applied to
marks held    tasks a clause held that are still held at the end
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

A semicolon between two slash commands runs the second after the first, and
stops when the first fails. The prompt reads quotes as a shell reads them. A
semicolon inside quotes is part of the word.

Use control log with a run to read the command history instead of driving the
machine. Use `--entries` to select the commands issued at given run entries. Use
-n to select commands by number.

```
machine control [-h] [--entries range] [--wide] [-n range] [-c cmd] run|log [run]
```

| Argument | Does |
|---|---|
| `run\|log` | Run name, or log to read history |
| `[run]` | With log: the run whose history to read |

| Option | Does |
|---|---|
| `--entries range` | With log: commands at one entry, or an inclusive range |
| `--wide` | With log: show the entries, vCPU, opcode and size of each command |
| `-n, --lines range` | With log: commands: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `-c, --command cmd` | Slash command to run without opening the prompt, such as "/f@100" |

Examples:

```
machine control run1                            open the prompt for run1
machine control run1 -c /help                   list the slash commands
machine control run1 -c '/help output'          the help of /output
machine control run1 -c /f@100                  run 100 iterations fast
machine control run1 -c '/checkpoint name cp1'  create checkpoint cp1
machine control run1 -c '/rewind to ^cp1'       put run1 back at cp1
machine control run1 -c '/send ls -la'          type ls -la and Enter
machine control run1 -c '/send "a;b"'           send a;b and Enter
machine control run1 -c '/exec run ls -la /'    execute ls -la /
machine control run1 -c '/exec run -c echo $0'  a line for the shell
machine control run1 -c '/exec start sleep 5'   send it, get its id
machine control run1 -c /exec                   the processes of run1
machine control run1 -c '/fs ls / at ^cp1'      the disk's files at cp1
machine control run1 -c '/f;/d'                 run, then dump
machine control log run1                        the commands issued to run1
```

See also:

- [`machine run`](#machine-run)
- [`machine wait`](#machine-wait)
- [`machine entries`](#machine-entries)
- [`machine send`](#machine-send)
- [`machine exec`](#machine-exec)
- [`machine fs`](#machine-fs)

## machine wait

Wait until a run satisfies a predicate.
See [Waiting](running-a-machine.md#waiting).

Use wait to script against a run. It waits for a state, an entry, a console line
or a task event. Several runs, or every run of the session, may be waited for.

The predicates are running, ready, tasks, stopped, paused, halted,
activity=`<name>`, entry>=N, entry=+N, vtime>=T, vtime=+T, console\~REGEX and a
task predicate. The tasks predicate holds once the operating system is up and
its task table is readable. That is before it execs anything in userland.

A console\~REGEX predicate holds once the console prints a match. The name of
another source takes the place of console, as in ttyS1\~REGEX.

A task predicate is [who:]what. The what is exec, exit, sched, desched, on,
kernel or off. The who is /path, cgroup=path, comm=name, tgid=N or tid=N.
Omitting it means any focused task.

A path, a cgroup or a comm must already be focused. Such a subject means its
tgid. tgid=N means the tgid for exit and any of its tasks for exec. Use machine
tasks `<run>` `--focused` to see which task is on a vCPU.

Four of the seven are edges. exec fires where a task matching who entered the
task table. exit fires where one left it.

sched fires where a task is given the CPU. desched fires where one gives it up.

Three are states, and they partition time. on holds while the task is on cpu in
its own code, at CPL 3. That is where a forced decision can land between two of
its own instructions.

kernel holds while that task is on cpu in the kernel. off holds while it is not
the task on cpu at all.

Named runs must be in the current session. Use `--all` to wait for every run in
it.

The global timeout bounds the wait. Without one there is no limit. A timeout of
0 checks once.

Exit codes: 0 success, 2 error, 3 timeout.

```
machine wait [-h] [--all] --for predicate [--interval s] [run ...]
```

| Argument | Does |
|---|---|
| `[run ...]` | One or more runs (omit with `--all`) |

| Option | Does |
|---|---|
| `--all` | Wait for every run in the session |
| `--for predicate` | Predicate such as running, stopped, entry=+N or console\~REGEX |
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

Cancel the run or replay in progress.
See [Trying different schedules](running-a-machine.md#trying-different-schedules).

A run stops where it is. A replay stops before its next entry.

```
machine cancel [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine cancel run1  cancel what run1 is running
```

Refuses, and the way past:

```
a run with nothing in progress  machine state run1
```

See also:

- [`machine run`](#machine-run)
- [`machine replay`](#machine-replay)
- [`machine wait`](#machine-wait)

## machine replay

Replay recorded entries from the parent lineage. See [Replay](replay.md).

The command executes the recorded entries again. It checks each against the
recording. A mismatch is a divergence. The command reports the entry, with the
expected and actual values.

Without a line, the parent's entries are replayed. A fork at an entry leaves
that entry with the parent. The branch starts at the next entry, so the entries
of the parent end at the fork. Replaying past them reports no forward entries.

Use `--to` to stop at a point of the line that is replayed. The point is an
entry, a checkpoint or a time of that line. A checkpoint the parent took after
the fork is such a point.

The line of a run is its entries from the root on, across every fork. Naming a
run replays the entries of its line. The run must be in the same tree. The entry
this run stands on must be on the line replayed.

An entry that diverges is replayed again from the newest checkpoint before it,
at most twice. It is not replayed again once it diverges the same way twice. An
entry that the host interrupted is replayed again the same way. It is not a
divergence.

Use `--retry` to set how many retries. `--retry` 0 replays each entry once. Use
`--limit-margin` to set how many conditional branches short of each recorded
entry the CPU's counter interrupts. A smaller margin makes a miss more likely.

The replay stores what the branch keeps of its output. A branch that keeps an
output file its parent dropped is how the file is read. Use fork with
`--keep-output` to make one. What is stored does not change what the machine
executes.

```
machine replay [-h] [--to point [point ...]] [--trace] [--retry n] [--limit-margin n]
               run [line]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[line]` | Run whose line to replay, defaulting to the parent's |

| Option | Does |
|---|---|
| `--to point [point ...]` | Point of the line to replay to: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, now, parent [n], root, or %mark (default: the end of the line) |
| `--trace` | Trace each iteration one by one |
| `--retry n` | Retries for an entry that diverges or the host interrupted, default 2; 0 does not retry |
| `--limit-margin n` | Conditional branches short of each recorded stop where the CPU's counter interrupts (default: the host's) |

Examples:

```
machine replay try2                     replay the parent's entries
machine replay try2 --to '#300'         replay up to entry 300
machine replay try2 --to ^cp2           replay up to checkpoint cp2
machine replay try2 run1 --to '#420'    replay the line to run1
machine replay try2 --limit-margin 100  100 branches short of each stop
```

Prints:

```
text          Replayed <n> entries to entry <id>. Converged.
              then the last dispatch, as run prints it
json          converged entry_id replayed diverged result misses
nothing left  Nothing to replay: already at entry <id>
```

Refuses, and the way past:

```
a run off the line it would replay  machine replay try2 run1
```

See also:

- [`machine diff`](#machine-diff)
- [`machine rewind`](#machine-rewind)
- [`machine play`](#machine-play)
- [`machine go`](#machine-go)

## machine play

Play recorded entries without checking divergence. See [Replay](replay.md).

Use `--include` and `--exclude` to select the event types to play. The entries
no type names are always played. They are the clock's rate and steps, the focus,
the stops and the debugger's writes. The RUN entries after them need them.

A play that leaves out irq delivers the interrupts the machine raises itself, as
a recording does. The run records them as its own.

The line of a run is its entries from the root on, as replay says. The run named
must be in the tree of this run, and need not be on its line. Divergence is not
checked.

```
machine play [-h] [-n range] [--include type [type ...]] [--exclude type [type ...]]
             run [line]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[line]` | Run whose line to play, defaulting to the parent's |

| Option | Does |
|---|---|
| `-n, --entries range` | Entries: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `--include type [type ...]` | Play only these event types: run, irq, exception, random, device_in, block_done, input, exit_shutdown, system_shutdown, system_reset, checkpoint, cpuid, rng_seed |
| `--exclude type [type ...]` | Leave these event types out |

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
machine diff [-h] [--show sections] [--entry n] [--context n] run [other[:m]]
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

Create a checkpoint of the machine's state.
See [Checkpoints](checkpoints-and-branches.md#checkpoints).

A checkpoint is a point to return to, written ^name. It saves the machine state.
Fork, go and rewind return to it.

The machine also checkpoints on its own, at the interval that create sets.

```
machine checkpoint [-h] run [name]
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

The new run keeps and drops the output that the run it comes from does. Use
`--keep-output` to replace the names it keeps. Use `--drop-output` to replace
the names it drops. Each option changes its own list only.

Use `--from` to replay the new run from an earlier point to its point. The new
run stores the output of that stretch by its own names. It is forked at the
checkpoint at or before the earlier point.

A run stores every source but the files under /output/drop. A file there has a
name and no bytes. A program writes under /output/drop through
MACHINE_DROP_OUTPUT_DIR. It writes under /output/keep through
MACHINE_OUTPUT_DIR.

A name given to either option may be a pattern, such as /output/drop/*/*.log. A
star matches within one directory name, a leading dot included, and never a
slash. Two stars match any number of directories.

A name given to `--keep-output` or `--drop-output` decides before the directory
does. When a kept name and a dropped name cover one source, a name spelled out
decides over a pattern. Of two names spelled out, the longer decides, and a tie
keeps the source. Of two patterns, the kept one decides.

The name none, given alone, is an empty list. Use it to keep or to drop nothing
where the run would have the names of another run.

The command waits until the branch accepts commands. Use `--no-wait` to return
once the request is accepted.

```
machine fork [-h] [--at point [point ...]] [--from point [point ...]] [--name name]
             [--rebase] [--depth n] [--lean] [--no-start] [--side-dump | --no-side-dump]
             [--side-trace | --no-side-trace] [--mem-hash | --no-mem-hash]
             [--repeatable | --no-repeatable] [--limit-margin n] [--timer-slack duration]
             [--disk-hash | --no-disk-hash] [--rng-seed n] [--keep-output name]
             [--drop-output name] [--no-wait] [--daemon | --no-daemon]
             [--single-step | --no-single-step] [--limit n] [--backstop-limit n]
             [--pin-cpu n]
             run
```

| Argument | Does |
|---|---|
| `run` | Run to fork from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new run is at: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, now, parent [n], root, or %mark |
| `--from point [point ...]` | Earlier point to replay the new run from: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, parent [n] or root. The new run starts at the checkpoint at or before it |
| `--name name` | Name for the new run (default: a name made from where it starts) |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, keep no history shared with the ancestors, so they can be deleted |
| `--no-start` | Create the new run without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record the hypervisor's trace of each entry, for diagnosis, whatever the run it comes from records |
| `--mem-hash, --no-mem-hash` | Hash guest memory at every entry, whatever the run it comes from records |
| `--repeatable, --no-repeatable` | Stop fast exactly at the limit, so recording again gives the same entries, whatever the run it comes from does |
| `--limit-margin n` | Conditional branches short of a stop where the CPU's counter interrupts (default: the run's) |
| `--timer-slack duration` | How late a timer may be in code that takes no exit, 0 for none (default: the run's) |
| `--disk-hash, --no-disk-hash` | Hash the guest's disk at every entry, whatever the run it comes from records |
| `--rng-seed n` | Seed the new run's RNG device from n once it is up, so its guest draws other random numbers |
| `--keep-output name` | Source that the run stores though it is dropped: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--drop-output name` | Source that the run does not store: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, with `--no-daemon`. A run that waits for commands takes its mode from machine run `--mode` (default: the run's) |
| `--limit n` | Conditional branches per dispatch in fast mode, steps in step mode, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

Examples:

```
machine fork run1                         fork here and start the branch
machine fork run1 --name probe            name the branch probe
machine fork run1 --at ^cp1               fork at checkpoint cp1
machine fork run1 --at -10ms              fork 10 ms before now
machine fork run1 --at '#120' --no-start  create the branch, do not start it
machine fork run1 --keep-output /output   store what is dropped
machine fork run1 --drop-output ttyS1     store none of ttyS1
machine fork run1 --from ^cp1             replay the branch from cp1 to now
machine fork run1 --at ^cp1 --rng-seed 7  a branch seeded from 7
machine fork run1 --no-repeatable         a branch without exact stops
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

Go is the only command that branches and switches in one step. The point operand
lists the forms a point takes. Each names a point on the own line of this run.

console\~REGEX is where the console first printed a match. It is the entry that
printed the first byte of the match. The name of another source takes the place
of console, as in ttyS1\~REGEX.

A time such as 10ms counts from the start of the run. A minus sign, as in -10ms,
counts back from now. A time may carry +N, as machine now prints it, to name one
entry among several at that time.

A minus sign before a number with no unit counts entries back from now. The
point -10 is #-10, 10 entries before now.

Go reaches a point that is not a checkpoint by branching at the nearest
checkpoint at or before it. It then replays the difference.

Every use creates a branch, also for a point gone to before. What runs from a
point is a path of its own. Use switch to return to a branch that exists. Use
rewind to put this run back at a point.

The new run keeps and drops the output that the run it comes from does. Use
`--keep-output` to replace the names it keeps. Use `--drop-output` to replace
the names it drops. Each option changes its own list only.

Use `--from` to replay the new run from an earlier point to its point. The new
run stores the output of that stretch by its own names. It is forked at the
checkpoint at or before the earlier point.

A run stores every source but the files under /output/drop. A file there has a
name and no bytes. A program writes under /output/drop through
MACHINE_DROP_OUTPUT_DIR. It writes under /output/keep through
MACHINE_OUTPUT_DIR.

A name given to either option may be a pattern, such as /output/drop/*/*.log. A
star matches within one directory name, a leading dot included, and never a
slash. Two stars match any number of directories.

A name given to `--keep-output` or `--drop-output` decides before the directory
does. When a kept name and a dropped name cover one source, a name spelled out
decides over a pattern. Of two names spelled out, the longer decides, and a tie
keeps the source. Of two patterns, the kept one decides.

The name none, given alone, is an empty list. Use it to keep or to drop nothing
where the run would have the names of another run.

```
machine go [options] <run> <point>
```

| Argument | Does |
|---|---|
| `run` | The running machine that moves |
| `[point ...]` | Where to branch: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, now, parent [n], root, or %mark |

| Option | Does |
|---|---|
| `--from point [point ...]` | Earlier point to replay the new run from: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, parent [n] or root. The new run starts at the checkpoint at or before it |
| `--name name` | Name for the new run (default: a name made from where it starts) |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, keep no history shared with the ancestors, so they can be deleted |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record the hypervisor's trace of each entry, for diagnosis, whatever the run it comes from records |
| `--mem-hash, --no-mem-hash` | Hash guest memory at every entry, whatever the run it comes from records |
| `--repeatable, --no-repeatable` | Stop fast exactly at the limit, so recording again gives the same entries, whatever the run it comes from does |
| `--limit-margin n` | Conditional branches short of a stop where the CPU's counter interrupts (default: the run's) |
| `--timer-slack duration` | How late a timer may be in code that takes no exit, 0 for none (default: the run's) |
| `--disk-hash, --no-disk-hash` | Hash the guest's disk at every entry, whatever the run it comes from records |
| `--rng-seed n` | Seed the new run's RNG device from n once it is up, so its guest draws other random numbers |
| `--keep-output name` | Source that the run stores though it is dropped: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--drop-output name` | Source that the run does not store: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--no-wait` | Return without waiting |

Examples:

```
machine go run1 ^cp1                 branch at checkpoint cp1 and switch
machine go run1 '#120' --name probe  branch at entry 120 as probe
machine go run1 parent               branch where run1 left its parent
machine go run1 -10ms                branch 10 ms before now
machine go run1 -10                  branch 10 entries before now
machine go run1 console:120          branch where line 120 was printed
machine go run1 now --from ^cp1      replay the branch from cp1
```

Prints:

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
machine switch [-h] [--no-wait] run [branch ...]
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

The point is required. It is any entry from #1 to the tip. Write an entry id
after #, a checkpoint name after ^, or a machine time. The run lands on it
exactly.

The point becomes a checkpoint. Rewinding to the tip changes nothing unless a
replay diverged there. A point before the run was forked puts the run back along
the line it was forked from. A run with a branch forked after the point is
refused.

```
machine rewind <run> to <point>
```

| Argument | Does |
|---|---|
| `run` | The machine that rewinds |
| `[point ...]` | Point to go back to, from #1 to the tip: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, now, parent [n], root, or %mark |

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

The new run keeps and drops the output that the run it comes from does. Use
`--keep-output` to replace the names it keeps. Use `--drop-output` to replace
the names it drops. Each option changes its own list only.

Use `--from` to replay the new run from an earlier point to its point. The new
run stores the output of that stretch by its own names. It is forked at the
checkpoint at or before the earlier point.

A run stores every source but the files under /output/drop. A file there has a
name and no bytes. A program writes under /output/drop through
MACHINE_DROP_OUTPUT_DIR. It writes under /output/keep through
MACHINE_OUTPUT_DIR.

A name given to either option may be a pattern, such as /output/drop/*/*.log. A
star matches within one directory name, a leading dot included, and never a
slash. Two stars match any number of directories.

A name given to `--keep-output` or `--drop-output` decides before the directory
does. When a kept name and a dropped name cover one source, a name spelled out
decides over a pattern. Of two names spelled out, the longer decides, and a tie
keeps the source. Of two patterns, the kept one decides.

The name none, given alone, is an empty list. Use it to keep or to drop nothing
where the run would have the names of another run.

```
machine detach [-h] [--at point [point ...]] [--from point [point ...]] [--name name]
               [--no-start] [--side-dump | --no-side-dump] [--side-trace | --no-side-trace]
               [--mem-hash | --no-mem-hash] [--repeatable | --no-repeatable]
               [--limit-margin n] [--timer-slack duration] [--disk-hash | --no-disk-hash]
               [--rng-seed n] [--keep-output name] [--drop-output name] [--no-wait]
               [--daemon | --no-daemon] [--single-step | --no-single-step] [--limit n]
               [--backstop-limit n] [--pin-cpu n]
               run
```

| Argument | Does |
|---|---|
| `run` | Run to detach from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new run is at: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, now, parent [n], root, or %mark |
| `--from point [point ...]` | Earlier point to replay the new run from: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, parent [n] or root. The new run starts at the checkpoint at or before it |
| `--name name` | Name for the new run (default: a name made from where it starts) |
| `--no-start` | Create the new run without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record the hypervisor's trace of each entry, for diagnosis, whatever the run it comes from records |
| `--mem-hash, --no-mem-hash` | Hash guest memory at every entry, whatever the run it comes from records |
| `--repeatable, --no-repeatable` | Stop fast exactly at the limit, so recording again gives the same entries, whatever the run it comes from does |
| `--limit-margin n` | Conditional branches short of a stop where the CPU's counter interrupts (default: the run's) |
| `--timer-slack duration` | How late a timer may be in code that takes no exit, 0 for none (default: the run's) |
| `--disk-hash, --no-disk-hash` | Hash the guest's disk at every entry, whatever the run it comes from records |
| `--rng-seed n` | Seed the new run's RNG device from n once it is up, so its guest draws other random numbers |
| `--keep-output name` | Source that the run stores though it is dropped: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--drop-output name` | Source that the run does not store: a path under /output, a device such as ttyS1, a pattern, or none (repeatable) |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, with `--no-daemon`. A run that waits for commands takes its mode from machine run `--mode` (default: the run's) |
| `--limit n` | Conditional branches per dispatch in fast mode, steps in step mode, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

Examples:

```
machine detach run1 --at ^cp1                 copy run1 at cp1 to a new root
machine detach run1 --at '#120' --name copy1  name the new root copy1
machine detach run1 --from ^cp1               replay the root from cp1
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
machine checkpoints [-h] [--durable] [--since date|age] [--until date|age] [--sort field]
                    [--reverse] [--limit n] [--offset n] [-w]
                    run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--durable` | Show only checkpoints synced to shared storage |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--sort field` | Sort field: entry, date, name (default: entry) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n checkpoints (default: 25) |
| `--offset n` | Skip the first n checkpoints |
| `-w, --watch` | Watch for changes |

Examples:

```
machine checkpoints run1            list the checkpoints of run1
machine checkpoints run1 --durable  only those in shared storage
```

Prints:

```
text      NAME ID VTIME DURABLE ANCESTOR
ID        the entry the checkpoint is at
VTIME     machine time there, with +N among entries at one time
DURABLE   ticked when it is in shared storage, no when it is not
ANCESTOR  the ancestor that took it, for a checkpoint this run did not take
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
machine marks [-h] command ...
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
machine marks list [-h] [run]
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
machine marks add [-h] run mark
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
machine marks remove [-h] run mark
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
machine branches [-h] [--running] [--depth n] [--since date|age] [--until date|age]
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
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--sort field` | Sort field: created, name (default: created) |
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

Prints:

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
machine lineage [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine lineage try2  the ancestors of try2
```

Prints:

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
machine entries [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --entries range` | Entries: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine entries run1 -n -20      the last 20 entries
machine entries run1 -n 100:120  entries 100 to 120
machine entries run1 -f          follow new entries
```

Prints:

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
a run limits the listing to its tree. Use `--roots` for one row per tree, and
`--wide` for more columns.

```
machine runs [-h] [--state [^]state] [--running] [--roots] [--label name=value]
             [--flag name[=value]] [--disk name|id] [--parents mode] [--synced |
             --not-synced] [--since date|age] [--until date|age] [--sort field] [--reverse]
             [--limit n] [--offset n] [--no-trunc] [--wide] [--size] [-w]
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
| `--flag name[=value]` | Filter by an option the run was created with, such as daemon or rng; name=0 for one it was not (repeatable; matches all) |
| `--disk name\|id` | Filter by the disk a run was created from |
| `--parents mode` | Filter by where a run reads the runs it branched from: local for this session, remote for shared storage |
| `--synced` | Show only runs published to shared storage |
| `--not-synced` | Show only runs with nothing published |
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--sort field` | Sort field: created, name, cpus, memory, rng-seed, limit (default: created) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n runs (default: 25) |
| `--offset n` | Skip the first n runs |
| `--no-trunc` | Show full run ids |
| `--wide` | Show the DEPTH, DURABLE and PIN columns |
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

Prints:

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
machine describe [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine describe run1  configuration and lineage of run1
machine describe try2  a branch is named like any run
```

Prints:

```
text  Name ID State Started Resources Options Lineage
```

See also:

- [`machine state`](#machine-state)
- [`machine runs`](#machine-runs)
- [`machine lineage`](#machine-lineage)
- [`machine branches`](#machine-branches)

## machine state

Show the state of a run and of its machine.
See [Looking at it](running-a-machine.md#looking-at-it).

The command shows the activity, machine time, entry and resources of the
machine.

```
machine state [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine state run1  state, activity and position of run1
```

Prints:

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
machine now [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine now run1  entry, vtime and RIP of run1
```

Prints:

```
text  vtime=<time> entry=<id> vcpu=<n> rip=<address> <event> hash=<hash>
      the event as entries names it, IO_OUT, and its state hash
json  entry_id vtime vtime_offset vcpu rip event state_hash
      vtime in nanoseconds, rip as a decimal number
      vtime_offset is the N of +N
```

See also:

- [`machine state`](#machine-state)
- [`machine entries`](#machine-entries)
- [`machine checkpoints`](#machine-checkpoints)
- [`machine go`](#machine-go)

## machine output

Show the output of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

The output is everything the machine printed, in the order it was printed. Each
line has a source. The console is one source, and it is the one shown.

The serial ports ttyS1 to ttyS3 are sources too. A program in the guest that
writes to /dev/ttyS1 prints on ttyS1. Use `--source` to read another source. The
sources subcommand lists the sources that printed.

An output file is a source, named by its path. A program in the guest writes its
files under the directory that MACHINE_OUTPUT_DIR names. A file events.jsonl
that the service app writes there is /output/keep/app/events.jsonl. The path of
a directory is every file under it.

The directory that MACHINE_DROP_OUTPUT_DIR names is for output too large to
store. A file under it has a name and no bytes. A branch forked with
`--keep-output` stores the file when replayed.

The name all is every source in the order printed, each line after the name of
its source. A source that prints ends a line another source left unfinished.

Use `--entries` to select the output of given entries, -n to select lines, and
-f to follow new output. An entry that printed nothing contributes nothing.

The command prints lines and does not search them. Pipe it to grep to find text,
or to less to page through it. Use -n : to hand them every line.

On a terminal each line shows the entries and the source that printed it, and
its number. ENTRIES is the first and the last entry of the line. Into a pipe or
a file the lines are printed alone. Use `--wide` or `--plain` to choose.

The entry subcommand gives the one entry that printed a byte. Use it for the
exact entry of a match.

```
machine output [-h] [-n range] [--entries range] [-f] [--wide] [--plain] [--source name]
               run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Lines: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `--entries range` | Output of entry N, or of entries A:B, both ends included |
| `-f, --follow` | Follow new output (like tail -f) |
| `--wide` | Show the entries and the source that printed each line, and its number (default on a terminal) |
| `--plain` | Print the lines alone (default into a pipe or a file) |
| `--source name` | Source to read: console, all, ttyS0 to ttyS3, hvc0, debugcon, or the path of an output file or directory under /output (default: console) |

Examples:

```
machine output run1                                    the last lines
machine output run1 --plain                            the lines alone
machine output run1 -f                                 follow new output
machine output run1 -n : | grep -n login               find text
machine output run1 -n : | less -RN                    page through it
machine output run1 -n : | grep -bo login              find an offset
machine output run1 -n : --wide | grep login           text and its entries
machine output run1 --source ttyS1                     what ttyS1 printed
machine output run1 --source all                       every source
machine output run1 --source /output/keep/app/app.log  an output file
machine output run1 --source /output/keep              every file under it
```

Prints:

```
text              ENTRIES SOURCE LINE OUTPUT on a terminal
                  the lines as the machine printed them into a pipe or a file
no output stored  No output stored for <path>, for a file with a name and no bytes
--source all      each line after its source, such as ttyS0
--plain           the lines alone, on a terminal too
ENTRIES           <first>:<last>, the entries that printed the line
SOURCE            the source that printed the line, such as ttyS0
LINE              the line's number, as -n counts them
json              lines entry_ranges sources start_line total_lines partial_last
                  with -f, an object a line: line text and its labels
```

See also:

- [`machine output sources`](#machine-output-sources)
- [`machine output bytes`](#machine-output-bytes)
- [`machine output entry`](#machine-output-entry)
- [`machine replay`](#machine-replay)
- [`machine entries`](#machine-entries)
- [`machine go`](#machine-go)
- [`machine debug`](#machine-debug)

### machine output entry

Show the entry that printed a byte of the output.
See [Finding where something was printed](running-a-machine.md#finding-where-something-was-printed).

A line is printed over a range of entries. A byte is printed by one. The command
takes the offset of a byte and prints its entry.

The offset counts bytes from 0 over what the console printed. The grep option -b
prints the offset of a match. The first number of its output is the operand.

Use `--source` for a byte another source printed. The offset then counts within
the output of that source.

The entry is a point. Use it with go, fork, rewind and the other commands that
take an entry.

```
machine output run entry [-h] [--source name] offset
```

| Argument | Does |
|---|---|
| `offset` | Byte offset in the output of the source, counted from 0 |

| Option | Does |
|---|---|
| `--source name` | Source to read: console, all, ttyS0 to ttyS3, hvc0, debugcon, or the path of an output file or directory under /output (default: console) |

Examples:

```
machine output run1 entry 48213             the entry of byte 48213
machine output run1 entry 0                 the entry of the first byte
machine output run1 entry 0 --source ttyS1  the first byte ttyS1 printed
```

Prints:

```
text  the entry, alone
json  entry_id source offset line
```

Refuses, and the way past:

```
an offset past the end  machine output run1 -n :
```

See also:

- [`machine output`](#machine-output)
- [`machine output search`](#machine-output-search)
- [`machine go`](#machine-go)
- [`machine rewind`](#machine-rewind)

### machine output sources

List the sources that printed and how much each printed.

A source is a serial port such as ttyS1, the virtio console, or an output file.
The command prints a row for each source that printed, in the order each first
printed.

The lines of a source are counted in its own output. Use the name with
`--source` to read that source.

An output file with nothing stored is listed after them with 0 bytes. It is a
file the run drops, or a file that was not written. Use its name with
`--keep-output` on a fork to store it.

The list is made where the output is kept, so the output is not downloaded. The
output of the ancestors of the run is counted.

```
machine output run sources [-h]
```

Examples:

```
machine output run1 sources          each source that printed
machine -o json output run1 sources  the same as JSON
```

Prints:

```
text     SOURCE BYTES LINES ENTRIES, a row for each source
SOURCE   the name --source takes, such as ttyS1
LINES    the lines of the source in its own output
ENTRIES  <first>:<last>, the entries of its first and last byte
         - for an output file with nothing stored
json     source bytes lines entry_id last_entry_id stored
```

See also:

- [`machine output`](#machine-output)
- [`machine output search`](#machine-output-search)
- [`machine output entry`](#machine-output-entry)

### machine output bytes

Write the bytes a source printed, exactly as printed.

The command writes the bytes to standard output and changes none. Use it for an
output file that is not text.

With the json format the command prints a row for each write instead of the
bytes. A row has the entry that wrote, the source, the offset and the length.
The offset counts within the output of the source of the row. A row also names
the task that wrote.

The bytes are read where the output is kept. The output of the ancestors of the
run comes first.

```
machine output run bytes [-h] [--source name]
```

| Option | Does |
|---|---|
| `--source name` | Source to read: console, all, ttyS0 to ttyS3, hvc0, debugcon, or the path of an output file or directory under /output (default: console) |

Examples:

```
machine output run1 bytes --source /output/keep/app/a.bin  a file
machine -o json output run1 bytes --source /output/keep    each write
```

Prints:

```
text  the bytes, unchanged
json  entry_id source offset length tgid tid task
      a row for each write, with the task that wrote it
```

See also:

- [`machine output`](#machine-output)
- [`machine output sources`](#machine-output-sources)
- [`machine output entry`](#machine-output-entry)

### machine output search

Find a pattern in the output and the entry of each match.
See [Finding where something was printed](running-a-machine.md#finding-where-something-was-printed).

The pattern is a regular expression. A match is within a line. Each match is
printed with the entry that printed its first byte and the time of that entry.

A match has at least one character, since an entry printed it. A pattern that
matches without any text is refused. The pattern 6* is one, and 6+ is not.

The search is done where the output is kept, so a large output is not
downloaded. Its lineage is searched, from the first line an ancestor printed.

Use `--from` and `--to` to search the output between two points. A match begins
at `--from` or after it and ends at `--to` or before it.

Use -f to go on with what is printed next. Use `--max` to stop after a number of
matches.

The console is searched. Use `--source` to search another source. With all,
every source is searched and a match is still within the line of one source.

The entry and the time are points. Use either with go, fork, rewind and the
other commands that take a point.

```
machine output run search [-h] [-f] [--max n] [--from point [point ...]]
                          [--to point [point ...]] [--source name]
                          regex
```

| Argument | Does |
|---|---|
| `regex` | Regular expression to find |

| Option | Does |
|---|---|
| `-f, --follow` | Go on with new output (like tail -f) |
| `--max n` | Stop after n matches |
| `--from point [point ...]` | Point the search begins at: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, parent [n] or root (default: the start of the output) |
| `--to point [point ...]` | Point the search ends at, as `--from` takes one (default: the end of the output) |
| `--source name` | Source to read: console, all, ttyS0 to ttyS3, hvc0, debugcon, or the path of an output file or directory under /output (default: console) |

Examples:

```
machine output run1 search login                each match and its entry
machine output run1 search 'error|panic' -f     go on, live
machine output run1 search login --max 1        the first match
machine output run1 search x --from ^a --to 1s  between two points
machine output run1 search x --from '#42'       from an entry on
machine -o json output run1 search login        matches as JSON
machine output run1 search ready --source all   search every source
```

Prints:

```
text    ENTRY TIME SOURCE LINE:COL TEXT, a row for each match
ENTRY   the entry that printed the first byte of the match
TIME    the time of that entry, a point such as 1.194000000s+2
SOURCE  the source that printed the match, such as ttyS0
TEXT    the whole line: the match bold, the part past --to dim
json    entry_id last_entry_id vtime vtime_offset point recorder
        source line offset length text column column_end in_range
        with -f, an object a line
```

Refuses, and the way past:

```
a pattern that matches no text, as 6*  machine output run1 search '6+'
-f with --to                           machine output run1 search x -f
--from after --to                      machine output run1 search x --to 1s
```

See also:

- [`machine output`](#machine-output)
- [`machine output entry`](#machine-output-entry)
- [`machine go`](#machine-go)
- [`machine wait`](#machine-wait)

## machine dump

Dump the state of a machine.
See [Looking at it](running-a-machine.md#looking-at-it).

The sections cover vCPU code, registers, stack and page tables, timers,
interrupt controllers, devices, memory and hashes. Use `--show` to choose
sections. Use `--entry` to dump the state recorded at an entry.

Without `--show`, every section the machine has is printed. Use `--mem` to print
memory alone, or with `--show` beside other sections. Use -o json for one object
per section.

The hash section is what the entry recorded, before its exit was handled. Memory
and the disk are 0 there unless the run hashes them. Use machine hash for the
hashes after the entry, with its exit handled.

```
machine dump [-h] [--entry n] [--show sections] [--mem addr] [--vcpu n] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--entry n` | Entry whose recorded state to dump, instead of the state now |
| `--show sections` | One or more, comma-separated: code, regs, stack, pt, instr, trace, events, timers, debug, xsave, irq, pic, ioapic, devs, mem, disk, hash, entry, io, msrs, fullhash, all |
| `--mem addr` | Dump guest memory at an address: pADDR physical, vADDR virtual in the page tables of the vCPU |
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
- [`machine hash`](#machine-hash)

## machine hash

Show the state hashes of the machine. Each is computed as it stands.

The command prints a hash of memory. It prints a hash of the disk. Each device
has a hash too. The interrupts run `--irq-delay` holds have a hash, irq_pending.

Each vCPU has a hash of each part of its state. Each vCPU also has a hash of the
whole machine. Each hash compares with another machine's at the same point, such
as a replay's.

A hash is not the one dump `--show` hash prints. Dump prints the hashes the
newest entry recorded, before its exit was handled. This command computes them
after that entry, with its exit handled. Memory and the disk are in its hashes
even when the entry hashed neither.

The hashes are computed whether or not the run hashes memory and the disk at
each entry. Memory is read from all of RAM.

The vCPU hashes are of each vCPU now on a host kernel that computes them.
Elsewhere they are of each vCPU's last exit. The command then says so.

The command changes nothing. The run records nothing, and the machine stays
where it is.

The command waits until every hash is computed, however long reading RAM takes.
The machine refuses commands that would change it until then. Use Ctrl-C or
machine cancel to stop it.

```
machine hash [-h] [--vcpu n] run [hashes]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `[hashes]` | One or more, comma-separated: vcpu, devices, mem, disk, irq_pending, or a component such as regs or rtc (default: all) |

| Option | Does |
|---|---|
| `--vcpu n` | Show the hashes of this vCPU alone |

Examples:

```
machine hash run1                every hash of the machine now
machine hash run1 mem,disk       memory and the disk
machine hash run1 vcpu --vcpu 1  the hashes of vCPU 1
machine -o json hash run1        the hashes as JSON
```

See also:

- [`machine dump`](#machine-dump)
- [`machine diff`](#machine-diff)
- [`machine replay`](#machine-replay)

## machine vcpu

Show what a vCPU is doing and how its last dispatch ended.

A dispatch is one entry into the machine. It runs until its limit or until the
machine exits to the host.

```
machine vcpu [-h] [--vcpu n] run
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

Prints:

```
first line     entry ready pending iter
ready          the machine accepts commands
pending        a run is in progress
last dispatch  VCPU EXIT ID RUN IC RCB TOTAL IC REGS HASH RIP RCX ITER
RUN IC, RCB    instructions and conditional branches of the dispatch
TOTAL IC       instructions since the run started
ITER           the iteration the dispatch was
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
machine ops [-h] [--op-id id] [--state [^]state] [--type [^]type] [--since date|age]
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
| `--since date\|age` | Since a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--until date\|age` | Until a date such as 2026-06-01, or an age such as 7d, 24h or 30m |
| `--limit n` | Show at most n operations (default: 25) |
| `--offset n` | Skip the first n operations |
| `--no-trunc` | Show full run ids |
| `-w, --watch` | Watch for changes |

Examples:

```
machine ops       the newest operations
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
machine debug [-h] command ...
```

Examples:

```
machine debug log run1         the log of run1
machine debug log run1 -n -20  its last 20 lines
machine debug log run1 -f      follow it
machine debug err run1         its error log
```

See also:

- [`machine output`](#machine-output)
- [`machine entries`](#machine-entries)
- [`machine ops`](#machine-ops)

### machine debug log

Show the debug log of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

Use -n to select lines, and -f to follow new output.

```
machine debug log [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Lines: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine debug log run1         the log of run1
machine debug log run1 -n -20  its last 20 lines
machine debug log run1 -f      follow it
```

See also:

- [`machine debug err`](#machine-debug-err)
- [`machine output`](#machine-output)
- [`machine entries`](#machine-entries)

### machine debug err

Show the error and crash log of a run.
See [Looking at it](running-a-machine.md#looking-at-it).

Use -n to select lines, and -f to follow new output.

```
machine debug err [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Lines: N for one, A:B for A through B, A: from A on, :B up to B, : for all, -N or -N: for the last N, and -A:-B counted from the end |
| `-f, --follow` | Follow new output (like tail -f) |

Examples:

```
machine debug err run1         the error log of run1
machine debug err run1 -n -20  its last 20 lines
machine debug err run1 -f      follow it
```

See also:

- [`machine debug log`](#machine-debug-log)
- [`machine output`](#machine-output)
- [`machine state`](#machine-state)

## machine tasks

List the tasks the guest runs.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

A task is what the guest kernel schedules: a thread of a program, or the
kernel's own. Each task has a tid. Its tgid names its thread group, the process
it belongs to.

Each row is one task, by its tid, the thread id ps -L shows. Its tgid is the pid
of its process. Use `--vcpu` to list the tasks of one vCPU. Use `--focused` to
list the tasks that focus steers.

The subcommands steer the scheduler, so an order of tasks can be tried. The
hold, yield and release subcommands control whether a task runs.

The slice subcommand sets how long a task runs. The pin subcommand places it on
a vCPU. The cgroups subcommand groups the list. The exits subcommand lists the
tasks that left.

```
machine tasks [-h] [--vcpu n] [--focused] run command ...
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

Prints:

```
TID TGID        the task, and the tgid it belongs to
PID             the tgid as its container names it, blank for the machine's own
COMM EXE        the name of the task, and the path of its program
CPU             the vCPU the task is on, blank when it is on none
NEXT            whose code runs next on that vCPU: user or kernel
KIND            user for a program, kernel for the kernel's own
FOCUS           ticked for a task that focus steers
HOLD YIELD PIN  ticked when hold, yield or pin is set on the task
SLICE           the time set with slice
json            also cgroup, and exe under the same name
generation      a count that changes when the tasks do
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
machine tasks run cgroups [-h] [--vcpu n]
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
machine tasks run exits [-h]
```

Examples:

```
machine tasks run1 exits  tasks that left, newest last
```

Prints:

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

### machine tasks exist

Assert that the machine runs a program, a comm, a tid or a tgid.

The command lists the tasks that match and is refused when none does. It takes
the words fault add takes for `--in`, except all.

A program is the absolute path of the file it runs, the EXE that tasks shows. A
symlink's path matches no task.

The command reads the task table. It changes nothing in the machine and the run
records nothing.

```
machine tasks run exist [-h] path|comm=name|tid=n|tgid=n
```

| Argument | Does |
|---|---|
| `path\|comm=name\|tid=n\|tgid=n` | Program by absolute path, comm, tid or tgid |

Examples:

```
machine tasks run1 exist /usr/bin/app  is /usr/bin/app running
machine tasks run1 exist comm=cat      a task named cat
machine tasks run1 exist tgid=412      tgid 412
```

See also:

- [`machine tasks`](#machine-tasks)
- [`machine fault add`](#machine-fault-add)
- [`machine focus add`](#machine-focus-add)

### machine tasks hold

Take a task off the runqueue.
See [Holding threads](steering-programs.md#holding-threads).

The scheduler cannot pick a held task. A hold takes effect at the next
scheduling decision of the vCPU. Holding the last runnable task leaves nothing
to run. Release it, then use the irq command with preempt to go on.

```
machine tasks run hold [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |

Examples:

```
machine tasks run1 hold 56  hold tid 56
```

See also:

- [`machine tasks release`](#machine-tasks-release)
- [`machine tasks yield`](#machine-tasks-yield)
- [`machine irq`](#machine-irq)

### machine tasks yield

Put a task behind its peers.
See [Holding threads](steering-programs.md#holding-threads).

The task stays runnable. It does nothing when no peer is runnable.

```
machine tasks run yield [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |

Examples:

```
machine tasks run1 yield 56  put tid 56 behind its peers
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks release`](#machine-tasks-release)
- [`machine irq`](#machine-irq)

### machine tasks release

Undo a hold or a yield.
See [Holding threads](steering-programs.md#holding-threads).

A release takes effect at the next scheduling decision of the vCPU. Use the irq
command with preempt to force one.

```
machine tasks run release [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |

Examples:

```
machine tasks run1 release 56  undo hold and yield
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks yield`](#machine-tasks-yield)
- [`machine irq`](#machine-irq)

### machine tasks slice

Set how long a task runs between decisions.
See [Holding threads](steering-programs.md#holding-threads).

A decision is a scheduling decision of the vCPU. Give a duration with a unit,
such as 10us, 0.6ms or 750000ns. Use default for the kernel's own. A slice
survives release.

```
machine tasks run slice [-h] tid duration|default
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |
| `duration\|default` | Duration with a unit, or default |

Examples:

```
machine tasks run1 slice 56 600us    run tid 56 for 600 us
machine tasks run1 slice 56 default  the kernel's own slice
```

See also:

- [`machine tasks hold`](#machine-tasks-hold)
- [`machine tasks pin`](#machine-tasks-pin)
- [`machine irq`](#machine-irq)

### machine tasks pin

Place a task on one or more vCPUs when it next wakes.
See [Holding threads](steering-programs.md#holding-threads).

A set of vCPUs is one number, 1, or a range, 1-3, both ends included.

Free means any vCPU. None means no vCPU, which stops the task running.

Pin is a placement policy, not confinement. A task already queued elsewhere
keeps that vCPU until it wakes.

```
machine tasks run pin [-h] tid set|free|none
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |
| `set\|free\|none` | Set of vCPUs to place the task on, such as 1 or 0-2; free for any, none for no vCPU |

Examples:

```
machine tasks run1 pin 56 2     place tid 56 on vCPU 2
machine tasks run1 pin 56 free  place it on any vCPU
```

See also:

- [`machine tasks slice`](#machine-tasks-slice)
- [`machine tasks hold`](#machine-tasks-hold)
- [`machine plan`](#machine-plan)

### machine tasks signal

Send a task a signal.

The guest sends the signal at its next entry from user mode, as GDB's signal
command delivers one. The task acts on it when it next runs. The run log keeps
the request, so a replay sends it at the same instruction.

```
machine tasks run signal [-h] tid signal
```

| Argument | Does |
|---|---|
| `tid` | Task, by its tid |
| `signal` | Signal by name, such as SIGTERM or TERM, or by number |

Examples:

```
machine tasks run1 signal 56 SIGTERM  send tid 56 SIGTERM
machine tasks run1 signal 56 USR1     the name without SIG
```

See also:

- [`machine catch`](#machine-catch)
- [`machine tasks`](#machine-tasks)
- [`machine run`](#machine-run)

## machine syscalls

List the system calls, by number.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

A name filters the list to calls whose name contains that text.

A task shows its syscall histogram instead. Name a task by tid, tgid, absolute
path, cgroup=path or comm=name. The histogram counts calls made while the focus
entry of the task was armed with focus add `<path>` +syscalls.

```
machine syscalls [-h] run [name|tid|tgid|path]
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

List the interrupt vectors.
See [Looking at tasks](steering-programs.md#looking-at-tasks).

One row per IDT vector that the machine has a handler for. The vector is in hex,
as the table is indexed. A name filters to handlers whose name contains that
text.

A task shows its interrupt histogram instead. Name a task by tid, tgid, absolute
path, cgroup=path or comm=name. The histogram counts interrupts taken while the
focus entry of the task was armed with focus add `<path>` +ints.

```
machine ints [-h] run [name|tid|tgid|path]
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

The focus list names the programs the machine steers. A run stops at each
context switch of a focused program, and where the program reaches its own code.
The tasks subcommands then decide which task runs next.

A program is named by its absolute path, matched exactly. Write cgroup=`<path>`
to match the cgroup of a task. Write tgid=`<n>` to name a tgid. The tgid of a
task is shown by tasks.

Write comm=`<name>` to focus each process with a task of that comm, as fault add
and tasks exist read it. A comm names a busybox applet or a script, which a path
cannot. A task renamed after exec is seen at the next fork, exec or exit.

Use add and remove to change the list. Use clear to empty it.

```
machine focus [-h] run command ...
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

Prints:

```
Focus     each program or cgroup named, and what is counted for it
Steering  each tgid a focus entry matches now
          nothing yet, until a program that is named starts
Marks     how many tasks are held, yield or have a slice
Switches  context switches of steered tasks since the start
          on I/O counts those where the task left to wait for I/O
```

See also:

- [`machine tasks`](#machine-tasks)
- [`machine syscalls`](#machine-syscalls)
- [`machine ints`](#machine-ints)

### machine focus add

Steer another program. See [Focus](steering-programs.md#focus).

The entry is a program path, cgroup=`<path>`, comm=`<name>` or tgid=`<n>`. Add
+syscalls or +ints to count its system calls or interrupts.

```
machine focus run add [-h] path|cgroup=path|comm=name|tgid=n [+syscalls|+ints ...]
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|comm=name\|tgid=n` | Program path, cgroup, comm, or tgid to match |
| `[+syscalls\|+ints ...]` | Count this program's syscalls or interrupts |

Examples:

```
machine focus run1 add /test                  focus the program /test
machine focus run1 add /test +syscalls +ints  count its calls and interrupts
machine focus run1 add comm=cat               processes whose comm is cat
```

See also:

- [`machine focus remove`](#machine-focus-remove)
- [`machine focus clear`](#machine-focus-clear)
- [`machine tasks`](#machine-tasks)
- [`machine tasks exist`](#machine-tasks-exist)

### machine focus remove

Stop steering a program. See [Focus](steering-programs.md#focus).

Name the entry as it was added, by program path, cgroup=`<path>`, comm=`<name>`
or tgid=`<n>`.

```
machine focus run remove [-h] path|cgroup=path|comm=name|tgid=n
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|comm=name\|tgid=n` | Program path, cgroup, comm, or tgid to match |

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
machine focus run clear [-h]
```

Examples:

```
machine focus run1 clear  focus nothing
```

See also:

- [`machine focus add`](#machine-focus-add)
- [`machine focus remove`](#machine-focus-remove)
- [`machine tasks`](#machine-tasks)

## machine send

Send input to a device of a run.

The command writes bytes to a serial port, the virtio console or the keyboard of
a run. A program in the guest reads them from the device, as it reads what a
person types.

The text is sent as written, and a newline follows it, which is Enter. Use -n to
send no newline. Use -e to read escapes in the text, so that Ctrl-C is \x03.

The text - sends standard input as it is. The command adds no newline to it and
reads no escape in it.

At the control prompt the command is /send. The text is the rest of the line
after the options, with its quotes. A semicolon inside quotes does not end the
command. A pair of quotes around the whole text keeps the spaces at its ends.

The keyboard takes text and types it on a US keyboard. The machine presses and
releases a key for each character. It holds Shift or Ctrl where the character
needs one.

A device that begins with a slash is the path of a file in the machine. The
bytes go at the end of the file. A pipe is such a file. A program that reads its
input from a pipe is sent input this way.

A process of the machine writes the file, and the command prints its id. The
exec proc subcommand says whether the bytes were written.

The command does not run the machine. It queues the bytes and returns. The
device takes them the next time the run executes, and the run records them
there. A replay reproduces them.

Use fork to send other input than a run recorded. The branch takes its own.

```
machine send [-h] [-n] [-e] [--device name] run text
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `text` | Text to send, or - to send standard input as it is |

| Option | Does |
|---|---|
| `-n` | Send no newline after the text |
| `-e` | Read the escapes \n, \r, \t, \b, \e, \0, \\ and \xNN in the text |
| `--device name` | Device to send to: console, ttyS0 to ttyS3, hvc0 or keyboard, or the path of a file in the machine (default: console) |

Examples:

```
machine send run1 ls                        type ls and Enter on the console
machine send run1 ls --device ttyS1         the same on ttyS1
machine send -n run1 y                      send y with no newline
machine send -n -e run1 '\x03'              send Ctrl-C
machine send run1 -                         send standard input as it is
machine send run1 ls --device keyboard      type it on the keyboard
machine send run1 -- -la                    a text that begins with a dash
machine send run1 c --device /dev/gdb_pipe  write a pipe
```

Prints:

```
text     Queued <n> bytes for <device> of <run> (<id>)
json     queued device run_id name process
process  the id of the write to a path, empty for a device
```

Refuses, and the way past:

```
a machine that is replaying  machine fork run1 --name try2
a device with no room        machine run run1
```

See also:

- [`machine run`](#machine-run)
- [`machine output`](#machine-output)
- [`machine wait`](#machine-wait)
- [`machine irq`](#machine-irq)
- [`machine control`](#machine-control)

## machine exec

Execute a command in the guest.

A command is a program of the machine's disk and its arguments, written after
two dashes. No shell reads it. Use -c to give a line to the shell of the disk,
with its pipes and redirections.

The run subcommand executes it and runs the machine until it exits. The start
subcommand sends it and returns.

Each command is a process with an id. The run records what the process prints
and how it ends, each line at its entry. A replay reproduces them, and a branch
has the processes of its parent.

Without a subcommand the command lists the processes of the run. The proc
subcommand shows one.

The id is the entry the command was sent at and the process number, 23090p1. In
the machine, its output is in /.machine/output/exec/ID/stdout and stderr. Its
events are in /.machine/output/exec/ID/status. The output source
/output/exec/ID/stdout names the first in output and run `--until`.

The machine's disk runs the agent that executes the commands,
/sbin/machine-exec. A disk without it executes none.

```
machine exec [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine exec run1                   the processes of run1
machine exec run1 run -- ls -la /   execute ls and print its output
machine exec run1 start -- sleep 5  send it and return its id
machine exec run1 proc 40787p1      one process
```

Prints:

```
text     ID PID STATE ENTRIES COMMAND
STATE    pending, running, exited <code>, killed <signal>
ENTRIES  <started>:<ended>, the entries of the two events
json     id state command pid exit_code signal started_entry
```

See also:

- [`machine exec run`](#machine-exec-run)
- [`machine exec start`](#machine-exec-start)
- [`machine exec proc`](#machine-exec-proc)
- [`machine send`](#machine-send)
- [`machine output`](#machine-output)

### machine exec run

Execute a command and run the machine until it exits.

The command prints what the command printed, its standard output and its
standard error each on its own. The exit status is that of the command.

Use `--container` to execute it in a container. The command then has the
environment of the container. Use `--user` to choose the user it runs as there.

The machine runs until the command ends. Other programs of the machine run with
it.

A command gets 30 minutes of machine time to end. Use `--within` to give it
another. A command that has not ended by then stays, and the refusal names its
id.

```
machine exec run run [-h] [-c line] [--container name] [--user user] [--within duration]
                     [command ...]
```

| Argument | Does |
|---|---|
| `[command ...]` | The command and its arguments, after -- |

| Option | Does |
|---|---|
| `-c line` | A line for the shell of the machine's disk, in place of a command |
| `--container name` | Container to execute it in, by its name or its Compose service (default: the machine itself) |
| `--user user` | User the command runs as in the container, such as root or 1000:1000 |
| `--within duration` | Machine time the command gets to end in, such as 10s (default: 30m) |

Examples:

```
machine exec run1 run -- ls -la /           execute ls and print its output
machine exec run1 run -c 'echo $PATH'       a line for the shell
machine exec run1 run --container db -- ls  in a container
machine -o json exec run1 run -- ls         the process and its events
```

Prints:

```
text  what the command printed, and its exit status
json  the process, with stdout stderr events
```

Refuses, and the way past:

```
a machine that is replaying           machine fork run1 --name try2
a command that has not ended in time  machine exec run1 proc 40787p1
a container that is not running       machine exec run1 run -- docker ps
```

See also:

- [`machine exec start`](#machine-exec-start)
- [`machine exec proc`](#machine-exec-proc)
- [`machine run`](#machine-run)
- [`machine put`](#machine-put)
- [`machine get`](#machine-get)

### machine exec start

Send a command to execute and return.

The command prints the id of the process. The machine does not run. The process
starts the next time the run executes.

Use the proc subcommand with the id to read the process.

```
machine exec run start [-h] [-c line] [--container name] [--user user] [command ...]
```

| Argument | Does |
|---|---|
| `[command ...]` | The command and its arguments, after -- |

| Option | Does |
|---|---|
| `-c line` | A line for the shell of the machine's disk, in place of a command |
| `--container name` | Container to execute it in, by its name or its Compose service (default: the machine itself) |
| `--user user` | User the command runs as in the container, such as root or 1000:1000 |

Examples:

```
machine exec run1 start -- sleep 5               send it and return its id
machine exec run1 start -- /app/load --rows 9    options after --
machine exec run1 start -c 'gdb -p 36 < /dev/p'  input on a pipe
```

Prints:

```
text  Sent <id> to <run> (<id>)
json  id state command
```

Refuses, and the way past:

```
a machine that is replaying  machine fork run1 --name try2
```

See also:

- [`machine exec run`](#machine-exec-run)
- [`machine exec proc`](#machine-exec-proc)
- [`machine run`](#machine-run)

### machine exec proc

Show a process: its state, its output and its events.

The summary has the command, the pid, the state and how the process ended. A
process is pending until the machine runs and the guest takes the request.

The events view lists every line the process printed and every change of its
state, each with its entry. The stdout and stderr views print one stream. The
exits view prints how the process ended.

In the machine, the streams are /.machine/output/exec/ID/stdout and
/.machine/output/exec/ID/stderr.

```
machine exec run proc [-h] id [{summary,events,stdout,stderr,exits}]
```

| Argument | Does |
|---|---|
| `id` | Process id |
| `[{summary,events,stdout,stderr,exits}]` | What to show: summary, events, stdout, stderr or exits (default: summary) |

Examples:

```
machine exec run1 proc 40787p1         its state and how it ended
machine exec run1 proc 40787p1 events  every line and its entry
machine exec run1 proc 40787p1 stdout  its standard output
machine exec run1 proc 40787p1 stderr  its standard error
machine exec run1 proc 40787p1 exits   how it ended, and where
```

Prints:

```
summary  Process Run Command Pid State Entries Stdout Stderr
events   ENTRY STREAM TEXT, the stream stdout, stderr or status
exits    ENTRY and exited <code> or killed <signal>
json     the process, or the events of the view
```

Refuses, and the way past:

```
a process the guest has not taken  machine run run1
```

See also:

- [`machine exec`](#machine-exec)
- [`machine exec run`](#machine-exec-run)
- [`machine output`](#machine-output)
- [`machine go`](#machine-go)

## machine put

Put a file into the guest or a container.

The command copies a file on this computer to a path in the running machine. Use
`--container` to put it in a container instead. A file of any size is put. The
directories on the way to the path are made.

The file has its name only once all of it is written, so a program never reads
part of it. A file already at the path is replaced.

The machine runs while the file goes in. Other programs of the machine run with
it. The bytes are a recorded input, so a replay puts the same file.

The file is written to the disk before the command returns. A checkpoint taken
after it has the file, and fs reads it there.

```
machine put [-h] [--container name] [--mode mode] [--owner uid:gid] [--no-pipe]
            [--within duration]
            run file path
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `file` | File on this computer to put, or - for standard input |
| `path` | Path the file gets in the machine or in the container |

| Option | Does |
|---|---|
| `--container name` | Container to put the file in, by its name or its Compose service (default: the machine itself) |
| `--mode mode` | Mode of the file, as octal digits (default: 644) |
| `--owner uid:gid` | Owner of the file, as numbers (default: root) |
| `--no-pipe` | Send the file over the serial port instead of the faster data channel |
| `--within duration` | Machine time allowed each time the command runs the machine, such as 10s (default: 30m) |

Examples:

```
machine put run1 ./a.conf /etc/a.conf      into the machine
machine put run1 ./t.sh /t.sh --mode 755   with a mode
machine put run1 ./d /d --container db     into a container
machine put run1 ./d /d --owner 1000:1000  with an owner
machine put run1 - /tmp/in                 standard input
```

Prints:

```
text  Put <n> bytes at <path> of <run> (<id>)
json  size path container mode owner process run_id name entry_id
```

Refuses, and the way past:

```
a machine that is replaying      machine fork run1 --name try2
a container that is not running  machine exec run1 run -- docker ps
```

See also:

- [`machine get`](#machine-get)
- [`machine exec`](#machine-exec)
- [`machine send`](#machine-send)
- [`machine fs`](#machine-fs)
- [`machine checkpoint`](#machine-checkpoint)

## machine get

Get a file from the guest or a container.

The command copies a file of the running machine to a file on this computer. Use
`--container` to get it from a container instead. A file of any size is copied.

The file is read as it is now, with what programs wrote and the disk does not
have yet. The fs command reads the disk at a checkpoint instead.

The machine runs while the file comes out. Other programs of the machine run
with it, so a file a program is writing can change on the way.

```
machine get [-h] [--container name] [--within duration] run path file
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `path` | Path of the file in the machine or in the container |
| `file` | File on this computer to write, or - for standard output |

| Option | Does |
|---|---|
| `--container name` | Container to get the file from, by its name or its Compose service (default: the machine itself) |
| `--within duration` | Machine time allowed each time the command runs the machine, such as 10s (default: 30m) |

Examples:

```
machine get run1 /etc/a.conf ./a.conf   from the machine
machine get run1 /d ./d --container db  from a container
machine get run1 /var/log/app.log -     to standard output
```

Prints:

```
text  Got <n> bytes from <path> of <run> (<id>)
json  size path container file mode owner process run_id name entry_id
```

Refuses, and the way past:

```
a machine that is replaying      machine fork run1 --name try2
a container that is not running  machine exec run1 run -- docker ps
```

See also:

- [`machine put`](#machine-put)
- [`machine exec`](#machine-exec)
- [`machine fs`](#machine-fs)
- [`machine output`](#machine-output)

## machine containers

List the containers. Each row names its service.

The command prints each container with its Compose service, its state and its
image. Stopped containers are listed too. A container that no service started
has no service.

The exec, put and get commands take either name with `--container`. A service
name stands for its container when the service has one.

The machine runs until Docker has answered. The list is of the machine as it is
then. The listing runs a process in the machine, and the run records it.

```
machine containers [-h] [--within duration] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--within duration` | Machine time the listing gets to end in, such as 10s (default: 30m) |

Examples:

```
machine containers run1          the containers of run1
machine -o json containers run1  every field of each
```

Prints:

```
text   SERVICE CONTAINER STATE IMAGE
STATE  running, exited, created, paused
json   name service project state status image id
```

Refuses, and the way past:

```
a machine that is replaying  machine fork run1 --name try2
```

See also:

- [`machine exec`](#machine-exec)
- [`machine put`](#machine-put)
- [`machine get`](#machine-get)

## machine core

Get a core dump of a process.

The command has a process dump a core and copies the core to a file on this
computer. A debugger reads the core with the program of the process. Use
`--container` for a process of a container, by the pid it has there.

Taking a core ends the process. The process dies of the signal. Use fork first
to keep the run as it is, and take the core on the branch.

A process that handles the signal dumps no core. Use `--signal` to name another.
The first process of a container dumps none.

The machine runs until the core is written and copied. Other programs of the
machine run with it.

```
machine core [-h] [--container name] [--signal signal] [--within duration] run pid file
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `pid` | Pid of the process in the machine or in the container |
| `file` | File on this computer to write the core to |

| Option | Does |
|---|---|
| `--container name` | Container the process is in, by its name or its Compose service (default: the machine itself) |
| `--signal signal` | Signal the process dies of, by name or number (default: ABRT) |
| `--within duration` | Machine time allowed each time the command runs the machine, such as 10s (default: 30m) |

Examples:

```
machine core run1 412 ./app.core              a core of pid 412
machine core run1 7 ./db.core --container db  of a container
machine core run1 412 ./c --signal SEGV       by another signal
```

Prints:

```
text  Core of <pid> of <run> (<id>): <n> bytes in <file>
json  size pid container signal file process run_id name entry_id
```

Refuses, and the way past:

```
a machine that is replaying      machine fork run1 --name try2
a container that is not running  machine containers run1
```

See also:

- [`machine exec`](#machine-exec)
- [`machine get`](#machine-get)
- [`machine containers`](#machine-containers)
- [`machine fork`](#machine-fork)

## machine profile

Profile what the guest runs.

The machine samples each CPU at every timer interrupt, 250 times a second.
Nothing runs in the guest for it. The command prints the functions that ran.
Each has the share of samples it ran in and the share it was on the stack of.

Use `--from` to profile a stretch the run already recorded. The stretch is
replayed on a branch, which is deleted after. The run is not changed and need
not be running. A stretch profiled twice gives the same samples.

Use `--pid` or `--container` to show one process or one container. Use
`--folded` to print every stack with its count, one a line. That text is what
flame graph tools read. Use `--flame` to draw a flame graph in the terminal.

The names come from the program files of the machine's disk as it stands when
the stretch ends. No checkpoint is taken. A function in a file that is not on
the disk is shown by the file's name.

Time in the kernel is one frame for each system call, named like read_[k].

Without `--from` the machine runs for the time sampled. A machine that is idle
has no samples.

Use `--in-guest` to sample with a program in the guest, which the exec agent of
the disk runs. It names the functions of the kernel, and programs not yet
written to the disk. The run records that program like any other.

```
machine profile [-h] [--for duration | --from point [point ...]] [--to point [point ...]]
                [--pid pid] [--container name] [--in-guest] [--folded | --flame] [--top n]
                [--within duration]
                run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--for duration` | Machine time to run and sample for, such as 500ms (default: 1s) |
| `--from point [point ...]` | Point a recorded stretch begins at: ^checkpoint, #entry, -N for N entries back, a time such as 10ms or -10ms, console\~regex, console:N where line N was printed, parent [n] or root. The stretch is replayed on a branch |
| `--to point [point ...]` | Point the recorded stretch ends at, as `--from` takes one (default: the run's last entry) |
| `--pid pid` | Process to show, by its pid in the machine or in the container (default: every process) |
| `--container name` | Container to show, by its name or its Compose service (default: the machine itself) |
| `--in-guest` | Sample with the profiler of the exec agent, a process of the guest: kernel functions by name, at the cost of changing the run |
| `--folded` | Print the stacks, one a line with its count, for another tool to draw |
| `--flame` | Draw a flame graph in the terminal |
| `--top n` | Functions the table shows (default: 20) |
| `--within duration` | Machine time allowed to find the container, such as 10s (default: 30m) |

Examples:

```
machine profile run1                          where a second of run1 went
machine profile run1 --for 5s --container db  one container
machine profile run1 --from ^slow --to ^done  a recorded stretch
machine profile run1 --flame                  a flame graph in the terminal
machine profile run1 --in-guest               kernel functions by name
machine profile run1 --folded                 the stacks, for another tool
```

Prints:

```
text      SELF TOTAL FUNCTION
SELF      the share of samples the function was running in
TOTAL     the share it was on the stack of
--folded  comm;outer;...;inner <count>
json      samples hz stacks left run_id name
```

Refuses, and the way past:

```
a container the run does not have  machine containers run1
--in-guest with --from             machine profile run1 --from ^slow
```

See also:

- [`machine replay`](#machine-replay)
- [`machine fork`](#machine-fork)
- [`machine tasks`](#machine-tasks)
- [`machine syscalls`](#machine-syscalls)
- [`machine containers`](#machine-containers)

## machine irq

Inject an interrupt into the vCPUs.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

The command takes a vector, or `--nmi` alone for an NMI. Use irqs to list the
vector names.

The vector is a number, or a name from irq_vectors.h of the guest kernel. The
name preempt is 0xf5, the vector Machine preempts a task with. The name
reschedule is 0xfd, the reschedule vector of the guest kernel.

The vector is delivered as given. It reaches the handler that the kernel of the
machine installed for it. A vector with no handler is a spurious interrupt.
Vectors below 32 are CPU exceptions and are refused.

The interrupt is queued when the command returns. It is delivered and recorded
when the machine next runs. A replay delivers it at the same instruction. Step
first to choose that instruction.

```
machine irq [-h] [--vcpu n] [--nmi] run [vector]
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
machine irq run1 0xec     inject vector 0xec
machine irq run1 preempt  inject the vector Machine preempts with
machine irq run1 --nmi    inject an NMI
```

See also:

- [`machine irqs`](#machine-irqs)
- [`machine ints`](#machine-ints)
- [`machine vcpu`](#machine-vcpu)

## machine irqs

List the interrupts of a machine.

The command lists every interrupt the machine owes or holds now, then the
vectors irq injects.

An owed interrupt was raised by a device or a timer and is injected at the next
dispatch. A held interrupt waits for its due, which run `--irq-delay` drew. The
state hash irq_pending is of the held ones, and dump `--show` irq keeps the
first 32 of them.

The command changes nothing. Use ints for the interrupts the guest took, by
vector.

```
machine irqs [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine irqs run1          the pending interrupts and the vectors
machine -o json irqs run1  the same as JSON
```

See also:

- [`machine irq`](#machine-irq)
- [`machine ints`](#machine-ints)
- [`machine run`](#machine-run)
- [`machine hash`](#machine-hash)

## machine fault

Make system calls of the guest fail with an error.

A fault names a system call and a set of errors. The task's calls of it return
one of the errors without running. The guest kernel decides at each call, so a
replay fails the same calls with the same errors.

Use `--in` to say whose calls fail. It is required. A program is the absolute
path of the file it runs, the EXE that tasks shows. It takes the tasks running
that file, and the processes they fork without exec.

A comm is the name the kernel gives a task at exec, and comm=name takes the
tasks of that comm. A script runs as its interpreter, so its comm names it.
tid=n takes one task, tgid=n the tasks of one tgid, and all every task in the
machine.

A fault lets a number of matching calls through first. It then fails each call
by a chance, up to a number of calls or without end.

Each fault counts the calls it matches on its own. A call fails with the error
of the first fault that fails it.

A program's fault can be added before the program starts. Its calls match from
its exec on, and the commands that start it match none.

A dynamic program's loader opens and reads its libraries after the exec too. A
fault on openat or read added first fails the loader. Add such a fault once the
program is up.

A fault on a tgid applies to whatever that tgid runs, exec's setup of it first.
Use tasks exist to check that what `--in` names is running.

The faults are part of the machine. A checkpoint keeps them, and a fork has its
parent's. The run records each change, and a replay makes it at the same point.

An error is any Linux error, by name or number. Without a verb the command lists
the faults.

```
machine fault [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine fault run1                                      the faults, counted
machine fault run1 add connect ECONNREFUSED --in /app   every connect
machine fault run1 add openat valid --pick 1 --in /app  one documented
machine fault run1 add read EINTR --prob 0.1 --in /app  a read in ten
machine fault run1 delete 2                             the second fault
machine fault run1 clear                                every fault
```

See also:

- [`machine fault add`](#machine-fault-add)
- [`machine tasks`](#machine-tasks)
- [`machine syscalls`](#machine-syscalls)
- [`machine catch`](#machine-catch)

### machine fault add

Fail calls of system calls with errors.

The calls return an error without running. Each system call gets its own fault.
A failing call returns one error of the set, drawn at random.

The set holds names or numbers. Use valid for the errors the system call's man
page documents, and all for every error Linux names. A -ERRNO in the set takes
that error out.

Use `--pick` to take a number of the set at random when the fault is added. Each
system call picks its own. A run then fails with its own few errors, as swarm
testing does.

A fault fails every matching call by default. Use `--prob` to fail a call by
chance instead. A `--prob` of 0 fails no call and counts the matches.

The fault draws from its seed which calls fail and with which error. A replay
draws the same. Use `--seed` to draw as another run did.

```
machine fault run add [-h] [--prob p] [--pick n] [--seed n] --in who [--after n]
                      [--times n]
                      syscall[,syscall...] errors
```

| Argument | Does |
|---|---|
| `syscall[,syscall...]` | System calls, by name or number |
| `errors` | Errors: ENOENT, a number, valid or all, comma-separated; -ERRNO takes one out |

| Option | Does |
|---|---|
| `--prob p` | Chance a matching call fails, 0 to 1, such as 0.1 (default: 1) |
| `--pick n` | Pick n of the errors at random when the fault is added (default: all of them) |
| `--seed n` | Seed the draws of the fault (default: a random seed) |
| `--in who` | Whose calls fail: a program by the absolute path of its file, comm=name, tid=n, tgid=n, or all for every task |
| `--after n` | Let n matching calls through first (default: 0) |
| `--times n` | Fail at most n calls, then let the rest through (default: no end) |

Examples:

```
machine fault run1 add connect ECONNREFUSED --in /app       every connect
machine fault run1 add openat ENOENT,EACCES --in /app       one of two
machine fault run1 add openat valid --in /app               documented
machine fault run1 add openat valid,-EINTR --in /app        but not EINTR
machine fault run1 add read,write valid --pick 1 --in /app  one each
machine fault run1 add openat all --pick 3 --in /app        three of all
machine fault run1 add read EINTR --prob 0.1 --in /app      one in ten
machine fault run1 add read EIO --prob 0 --in /app          count only
machine fault run1 add read EIO --after 9 --in /app         past the 9th
machine fault run1 add read EIO --times 2 --in /app         two at most
machine fault run1 add open,openat EIO --in comm=cat        a cat applet
machine fault run1 add write EIO --in tgid=412              one tgid
machine fault run1 add accept4 EMFILE --in tid=41           one task
machine fault run1 add openat valid --seed 7 --in /app      as seed 7
machine fault run1 add getrandom EAGAIN --in all            any task
```

See also:

- [`machine fault`](#machine-fault)
- [`machine tasks`](#machine-tasks)
- [`machine syscalls`](#machine-syscalls)

### machine fault delete

Delete a fault.

The fault's calls run again from here.

```
machine fault run delete [-h] n
```

| Argument | Does |
|---|---|
| `n` | Fault number, as the listing shows it |

Examples:

```
machine fault run1 delete 2  the second fault
```

See also:

- [`machine fault`](#machine-fault)
- [`machine fault clear`](#machine-fault-clear)

### machine fault clear

Delete every fault.

```
machine fault run clear [-h]
```

Examples:

```
machine fault run1 clear  every fault
```

See also:

- [`machine fault`](#machine-fault)
- [`machine fault delete`](#machine-fault-delete)

## machine vtime

Show and change machine time.
See [Interrupts and time](steering-programs.md#interrupts-and-time).

Machine time is the guest's clock. It is derived from what the machine executes,
not from the host clock.

Use rate to change how fast machine time passes. Use add to push the clock
forward without running the machine. The clock only goes forward. Use rewind to
put the run back at an earlier point.

```
machine vtime [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine vtime run1           machine time and its rate
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
machine vtime run rate [-h] rate
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
machine vtime run add [-h] time
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

## machine rng

Show and seed the RNG device of a machine.

The RNG device gives the guest its random bytes from a seed. A run takes the
seed from create `--rng-seed`.

Use seed to seed it again here. The run records the seed, and a replay seeds the
device at the same point. A guest kernel that reads the seed reseeds its own
generator at once. Another reseeds at its next reseed.

A run created with `--no-rng` has no RNG device, and the command refuses it.

```
machine rng [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine rng run1         the seed and whether the guest reseeds at once
machine rng run1 seed 7  seed the RNG device from 7
```

See also:

- [`machine rng seed`](#machine-rng-seed)
- [`machine fork`](#machine-fork)
- [`machine create`](#machine-create)

### machine rng seed

Seed the RNG device again.

The device gives its bytes from the new seed, as from create `--rng-seed`. The
run records the seed, so a replay seeds the device at the same point.

```
machine rng run seed [-h] n
```

| Argument | Does |
|---|---|
| `n` | Seed, 0 to 2^64-1 |

Examples:

```
machine rng run1 seed 7  seed the RNG device from 7
```

See also:

- [`machine rng`](#machine-rng)
- [`machine fork`](#machine-fork)
- [`machine go`](#machine-go)

## machine regs

Show the registers of a task.

The registers are the user registers of a task of the guest, by its tid. A task
on a vCPU has them in the vCPU. A task off every vCPU has them where it saved
them. A task in the kernel has the ones it entered with.

Without names the general registers are shown. Use `--all` to show the x87, SSE
and AVX registers as well. Name registers to show those alone.

NAME=VALUE writes a register. A value is a number or a location as mem takes
one, such as main+4. The write is part of the run, and a replay makes it again.
The selectors and the x87, SSE and AVX registers are not written.

```
machine regs [-h] [--all] run tid [register ...]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `[register ...]` | Register to show, such as rip or xmm0, or NAME=VALUE to write one (default: the general registers) |

| Option | Does |
|---|---|
| `--all` | Show the x87, SSE and AVX registers as well |

Examples:

```
machine regs run1 412                   the general registers of tid 412
machine regs run1 412 rip rsp           two of them
machine regs run1 412 --all             with x87, SSE and AVX
machine regs run1 412 rax=0 rip=main+4  write two of them
```

Prints:

```
text  REGISTER VALUE NATURAL, then where they were read
json  tid tgid start where cpu values, each value in hex
```

Refuses, and the way past:

```
a tid the machine does not have  machine tasks run1
```

See also:

- [`machine mem`](#machine-mem)
- [`machine backtrace`](#machine-backtrace)
- [`machine tasks`](#machine-tasks)
- [`machine dump`](#machine-dump)

## machine mem

Show the memory of a tgid.

The memory is the tgid's own, through its page tables. The task names its tgid.
Guest kernel memory is not shown.

A location names an address in the task's process. Every command that takes a
location takes one of these:

```text
0x401136            an address
*0x401136           an address, as GDB writes it
main                a function or a variable, by its name
libc.so.6:malloc    a name in one file, by its path or file name
init.c:106          a source line, at its first code
$rsp                a register of the task, as it is now
main+4, $rsp-8      any of these moved by +N or -N
```

A format after the location shows the memory as GDB's x command does. A format
is a count, a letter and a unit, such as 8xg, 4i or s. The letters are x, d, u,
o, t, a, c, f, s, i and z. The units are b, h, w and g.

Each line begins with its address and the symbol the address is in. A read that
reaches an address that is not mapped ends there.

LOCATION=VALUE writes there, and the write is part of the run. A quoted string
writes its bytes. A number takes the size of the variable it is written to, or
of a unit after it. A page the tgid cannot write is not written.

```
machine mem [-h] [--find pattern] [--dump file] [--restore file] [--length n] [--mapped]
            run tid [location] [format]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `[location]` | Address to read at: a number, *ADDR, $register, NAME, PATH:NAME or FILE:LINE, moved by +N or -N. LOCATION=VALUE writes there |
| `[format]` | Count, format letter and unit, as GDB's x takes them, such as 8xg, 4i or s (default: 8xg) |

| Option | Does |
|---|---|
| `--find pattern` | Find a pattern in `--length` bytes: text, or 0x and hex bytes |
| `--dump file` | Write `--length` bytes to a file on this computer |
| `--restore file` | Write the bytes of a file on this computer at the location |
| `--length n` | Bytes a find or a dump reaches over |
| `--mapped` | List the pages the tgid maps, with their access and file |

Examples:

```
machine mem run1 412 '$sp'                  eight 8-byte words at the stack
machine mem run1 412 '$pc' 4i               the next four instructions
machine mem run1 412 main 16xb              sixteen bytes of main
machine mem run1 412 environ a              what environ points at
machine mem run1 412 counter=42             write counter, at its size
machine mem run1 412 '$sp+8=-1' w           write a word at the stack
machine mem run1 412 --mapped               the pages the tgid maps
machine mem run1 412 b --find x --length 9  find x
machine mem run1 412 b --dump f --length 8  into file f
machine mem run1 412 b --restore f          file f back
```

Prints:

```
text  <address> <symbol+offset>: units, as GDB's x
json  tid address format unit lines unmapped
```

Refuses, and the way past:

```
a symbol no file names           machine symbols run1 412 --regex name
a tid the machine does not have  machine tasks run1
```

See also:

- [`machine regs`](#machine-regs)
- [`machine symbols`](#machine-symbols)
- [`machine libs`](#machine-libs)
- [`machine dump`](#machine-dump)

## machine backtrace

Show the stack of a task.

Each frame is a function the task is in, the innermost first. The frames are
walked by the call frame rules of the program files. Code with no rules is
walked by its frame pointer.

The names come from the program files on the machine's disk as it stands. A
frame of a file the disk does not have is named by its file. A frame of a
program built with debug information names its source line.

```
machine backtrace [-h] [--frame n] run tid
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |

| Option | Does |
|---|---|
| `--frame n` | Describe one frame, as GDB's info frame: where it is and what called it |

Examples:

```
machine backtrace run1 412  the stack of tid 412
```

Prints:

```
text  # ADDRESS FUNCTION SOURCE FILE
json  tid frames
```

Refuses, and the way past:

```
a tid the machine does not have  machine tasks run1
```

See also:

- [`machine regs`](#machine-regs)
- [`machine mem`](#machine-mem)
- [`machine symbols`](#machine-symbols)
- [`machine profile`](#machine-profile)

## machine call

Call a function in a task.

The task runs the function from where it stands. The arguments go in the
registers the x86-64 ABI passes them in. An argument is an integer or a pointer.
The value returned is printed by the function's return type.

The task's registers are put back after the call. What the function wrote in
memory stays written. The call is part of the run, and a replay makes it again.

A breakpoint the call reaches ends it there. The registers are put back then
too, and the call is abandoned.

```
machine call [-h] run tid function [arguments ...]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `function` | Function to call: a name or a location |
| `[arguments ...]` | Arguments: expressions as print takes them, integers or pointers |

Examples:

```
machine call run1 412 square 3  square of 3, by its type
machine call run1 412 fflush 0  flush every stream
```

Prints:

```
text  FUNCTION(ARGUMENTS) = VALUE
json  tid function returned abandoned hits
```

Refuses, and the way past:

```
a tid the machine does not have  machine tasks run1
```

See also:

- [`machine print`](#machine-print)
- [`machine return`](#machine-return)
- [`machine step`](#machine-step)

## machine return

Return from a task's innermost function.

The task goes on at the instruction after the call, in its caller. The caller's
stack pointer and the registers the function saved are restored, as GDB's return
does. A value goes in rax.

The registers come from the call frame rules of the program files on the
machine's disk. A function with no rules is refused.

The write is part of the run, and a replay makes it again. Memory is not
changed.

```
machine return [-h] run tid [value]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `[value]` | Value the function returns in rax: a number or a location |

Examples:

```
machine return run1 412    leave the function, rax as it is
machine return run1 412 0  leave it, returning 0
```

Prints:

```
text  Returned from FUNCTION to PLACE, in tid TID
json  tid from address function offset source line rax
```

Refuses, and the way past:

```
a tid the machine does not have  machine tasks run1
```

See also:

- [`machine backtrace`](#machine-backtrace)
- [`machine step`](#machine-step)
- [`machine regs`](#machine-regs)

## machine print

Print the value of an expression.

An expression is a variable of the frame, a global or a $register. A member, an
arrow, an index, a star and an ampersand apply to it as in C. The value is
printed by its type.

The types and the variables come from the program's debug information on the
machine's disk. Use `--frame` to print in a frame of a caller, as backtrace
numbers them.

A format after the expression prints each number in it, as print/x does. The
letters are x, d, u, o, t, c and z. Use `--type` to print the type instead, as
whatis and ptype do.

TARGET = VALUE writes VALUE at TARGET and prints TARGET after the write. The
write is part of the run, and a replay makes it again.

```
machine print [-h] [--frame n] [--type] run tid expression [format]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `expression` | A variable or $register, with .m, ->m, [i], * and & |
| `[format]` | Format letter for each number, as print/x takes one: x, d, u, o, t, c or z |

| Option | Does |
|---|---|
| `--frame n` | Frame of the stack, as backtrace numbers it (default: 0) |
| `--type` | Print its type instead, as GDB's whatis and ptype do |

Examples:

```
machine print run1 412 counter          a global or a local
machine print run1 412 'shape->at.x'    a member through a pointer
machine print run1 412 'squares[2]'     an element of an array
machine print run1 412 '*(int *)arg'    through a cast
machine print run1 412 index --frame 1  in the caller's frame
machine print run1 412 counter x        in hexadecimal
machine print run1 412 shape --type     its type
machine print run1 412 'counter = 3'    write it
```

Prints:

```
text  EXPRESSION = VALUE
json  tid frame expression type value address
```

Refuses, and the way past:

```
a name the frame and the globals do not have  machine locals run1 412
```

See also:

- [`machine locals`](#machine-locals)
- [`machine backtrace`](#machine-backtrace)
- [`machine mem`](#machine-mem)
- [`machine symbols`](#machine-symbols)

## machine locals

List the local variables of a frame.

Each local of the function is printed with its value, by its type. Use `--args`
to list the function's arguments instead. Use `--frame` to list a frame of a
caller.

The variables come from the program's debug information on the machine's disk. A
variable the debug information places where it is not read is listed with why.

```
machine locals [-h] [--frame n] [--args] run tid
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |

| Option | Does |
|---|---|
| `--frame n` | Frame of the stack, as backtrace numbers it (default: 0) |
| `--args` | The function's arguments instead |

Examples:

```
machine locals run1 412            the locals of the innermost frame
machine locals run1 412 --args     the arguments instead
machine locals run1 412 --frame 1  the caller's locals
```

Prints:

```
text  NAME = VALUE, a line each
json  tid frame function variables
```

See also:

- [`machine print`](#machine-print)
- [`machine backtrace`](#machine-backtrace)

## machine symbols

Find the symbols of a tgid.

A name finds the address of each symbol of that name. An address finds the
symbol it is in. A symbol of one file is written PATH:NAME. A source line
written FILE:LINE finds its code.

Use `--regex` to find each function whose name matches a pattern. The symbols
come from the program files on the machine's disk.

```
machine symbols [-h] [--regex pattern] [--variables] [--types] [--scope] [--sources]
                [--file path]
                run tid [name|address|file:line]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `[name\|address\|file:line]` | Symbol to find the address of, address to find the symbol of, or source line to find the code of |

| Option | Does |
|---|---|
| `--regex pattern` | Find each function whose name the regular expression matches |
| `--variables` | Find variables with `--regex`, not functions |
| `--types` | Find the types the debug information names with `--regex`, as info types |
| `--scope` | List the variables in scope at a location, as info scope |
| `--sources` | Find the source files the line tables name with `--regex`, as info sources |
| `--file path` | File to look in with `--regex`, by its path or its file name (default: every file the tgid maps) |

Examples:

```
machine symbols run1 412 main                         where main is
machine symbols run1 412 0x401ac6                     what is at an address
machine symbols run1 412 data-race.c:56               a source line's code
machine symbols run1 412 --regex ^wait                functions that match
machine symbols run1 412 --regex env --variables      variables
machine symbols run1 412 --regex ^m --file libc.so.6  of one file
```

Prints:

```
text  ADDRESS SIZE KIND NAME SOURCE FILE
json  tid symbols, or tid lines for a source line
```

See also:

- [`machine mem`](#machine-mem)
- [`machine libs`](#machine-libs)
- [`machine backtrace`](#machine-backtrace)

## machine libs

List the program and the libraries a tgid maps.

Each row is a file the tgid maps executable, at its range of addresses. The
first row is the program. A file the machine's disk does not have has no
symbols.

```
machine libs [-h] run tid
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |

Examples:

```
machine libs run1 412  the program and libraries of 412
```

Prints:

```
text  START END OFFSET FILE
json  tid libraries
```

See also:

- [`machine symbols`](#machine-symbols)
- [`machine mem`](#machine-mem)
- [`machine tasks`](#machine-tasks)

## machine step

Step a task.

A step is one instruction of the task. Use `--line` to step a source line. Use
`--over` to step over a call, so the function and all it calls are one step. Use
`--out` to run until the function returns.

The machine runs whichever task the guest schedules. A step of one task runs the
machine until that task is in its own code, then steps it. Other tasks run
meanwhile.

Each step runs the machine, and the run records it, so a replay makes it again.
A breakpoint the step reaches ends it. A line step steps out of a function that
has no line tables.

Use `--skip` NAME with `--line` to step out of a function or a source file of
that name. It does as GDB's skip does. Give it once for each name.

Use `--back` to go back over dispatches of the vCPU the task is on, as
reverse-stepi does. A dispatch is one entry into the machine, one instruction
where the run stepped. The machine switches onto a new branch there, as go does.

With `--line`, `--over` or `--out`, `--back` goes back over the task's own code.
It does as reverse-step, reverse-next, reverse-nexti and reverse-finish do. It
goes back over what the run recorded one instruction at a time. Past that it
stops, and says the history ends there.

```
machine step [-h] [--line] [--over] [--out] [--back [n]] [--skip name] run tid [count]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `tid` | Task of the machine, by its tid, the thread id ps -L shows. Its tgid is the pid of its process |
| `[count]` | Steps to make (default: 1) |

| Option | Does |
|---|---|
| `--line` | Step a source line, not an instruction |
| `--over` | Step over a call, the function it calls and all it calls being one step |
| `--out` | Run until the function returns to the one that called it |
| `--back [n]` | Go back n steps over dispatches of the task's vCPU, onto a branch |
| `--skip name` | Step out of a function or a source file of this name in a line step (repeatable) |

Examples:

```
machine step run1 412                one instruction, as stepi
machine step run1 412 5 --over       five, a call being one, as nexti
machine step run1 412 --line         a source line, as step
machine step run1 412 --line --over  a line over calls, as next
machine step run1 412 --out          until the function returns, as finish
machine step run1 412 --back --line  back a line, as reverse-step
machine step run1 412 --back --out   back to the call, as reverse-finish
```

Prints:

```
text         Stepped N instructions to WHERE, in tid TID
json         tid steps address symbol source hits
back         Stepped back N lines to WHERE, in tid TID, on BRANCH
history end  No more history before entry N
```

See also:

- [`machine break`](#machine-break)
- [`machine run`](#machine-run)
- [`machine backtrace`](#machine-backtrace)

## machine points

List the breakpoints, watchpoints and catchpoints.

The three share one table and its numbers. Each row has its number and its kind.
Use break, watch or catch to change the row of its kind.

```
machine points [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine points run1  every breakpoint, watchpoint and catchpoint
```

Prints:

```
text  # KIND ADDRESS SIZE WHERE TGID HITS WHEN
json  breakpoints
```

See also:

- [`machine break`](#machine-break)
- [`machine watch`](#machine-watch)
- [`machine catch`](#machine-catch)

## machine break

List and manage breakpoints.

A breakpoint stops the run when a task of its tgid reaches its location. The
listing has the run's breakpoints, each by its number. Use points to list them
with the watchpoints and catchpoints.

The run keeps them in its run log. A branch has the ones its parent had where it
was forked. A run holds 3 breakpoints and watchpoints together.

A run that reaches one ends there, and says which. The breakpoints are armed
while the run records, and not while it replays.

```
machine break [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine break run1               the breakpoints of run1
machine break run1 add 412 main  stop the tgid of 412 at main
machine break run1 delete 2      delete breakpoint 2
```

Prints:

```
text  # KIND ADDRESS SIZE WHERE TGID HITS WHEN
json  breakpoints
```

See also:

- [`machine watch`](#machine-watch)
- [`machine run`](#machine-run)
- [`machine symbols`](#machine-symbols)

### machine break add

Add a breakpoint.

The breakpoint stops the run before the instruction at its location runs. It
stops the tgid of the task alone. Another tgid that runs the same address goes
on.

The location is resolved now, from the tgid's program files. The run log keeps
the breakpoint, and a branch has its parent's.

```
machine break run add [-h] [--disabled] [--ignore count] [--temporary]
                      [--condition condition] [--print format] [--regex pattern]
                      tid [location]
```

| Argument | Does |
|---|---|
| `tid` | Task whose tgid the stop is in |
| `[location]` | Location, as mem takes one: an address, *ADDR, NAME, PATH:NAME, FILE:LINE or $reg, moved by +N or -N |

| Option | Does |
|---|---|
| `--disabled` | Add it and do not arm it |
| `--ignore count` | Pass this many hits where the condition holds (default: 0) |
| `--temporary` | Delete it at its first hit where the condition holds |
| `--condition condition` | Count a hit only where this expression holds, as print takes one, such as '$rax == 0' |
| `--print format` | Print this at a hit and go on. {EXPR} prints an expression as print takes one, {EXPR:x} in a print format letter: 'n={counter} p={$rdi:x}' |
| `--regex pattern` | Add one at each function whose name matches, in place of a location |

Examples:

```
machine break run1 add 412 main           at the start of main
machine break run1 add 412 init.c:104     at a source line
machine break run1 add 412 '*0x401ca9'    at an address
machine break run1 add 412 --regex '^tc'  at each function that matches
```

Prints:

```
text          Breakpoint N at WHERE, in tgid TGID
json          number kind address size tgid program location
json --regex  breakpoints: each added, as break lists them
```

See also:

- [`machine break`](#machine-break)
- [`machine run`](#machine-run)
- [`machine symbols`](#machine-symbols)

### machine break delete

Delete breakpoints.

The run log keeps the delete, so a branch forked before it keeps the breakpoint.

```
machine break run delete [-h] number [number ...]
```

| Argument | Does |
|---|---|
| `number [number ...]` | Number of a breakpoint |

Examples:

```
machine break run1 delete 2  delete breakpoint 2
```

See also:

- [`machine break`](#machine-break)
- [`machine break add`](#machine-break-add)

### machine break clear

Delete the breakpoints at a location.

Each breakpoint at the address the location names in the tgid of the task is
deleted.

```
machine break run clear [-h] tid location
```

| Argument | Does |
|---|---|
| `tid` | Task whose tgid the breakpoints are in |
| `location` | Location, as mem takes one |

Examples:

```
machine break run1 clear 412 main  delete the stops at main
```

See also:

- [`machine break`](#machine-break)
- [`machine break delete`](#machine-break-delete)

### machine break save

Save the breakpoints as the commands that add them.

Each line is a machine command that adds one breakpoint again. The command keeps
its condition, ignore count and flags. A location written by a register is saved
as its address.

```
machine break run save [-h] file
```

| Argument | Does |
|---|---|
| `file` | File to write, or - for the standard output |

Examples:

```
machine break run1 save stops.sh  write the commands to a file
machine break run1 save -         print them
```

See also:

- [`machine break`](#machine-break)
- [`machine break add`](#machine-break-add)

### machine break hits

List the hits of breakpoints.

A hit is a breakpoint that stopped the run. It has the entry it stopped at, its
machine time and the number of the breakpoint. The run log keeps each one, so a
branch lists its parent's hits before it.

Use the run command with `--back` to switch onto a branch at the newest hit.

```
machine break run hits [-h] [-n range]
```

| Option | Does |
|---|---|
| `-n, --entries range` | Hits to list, by the entry each stopped at: N, A:B, A:, :B; or -N for the last N hits, -A:-B counted from the end (default: the last 20) |

Examples:

```
machine break run1 hits       the last 20 hits
machine break run1 hits -n :  every hit
```

Prints:

```
text  ENTRY VTIME # KIND EVENT
json  hits
```

See also:

- [`machine break`](#machine-break)
- [`machine run`](#machine-run)

### machine break enable

Enable a breakpoint.

The machine arms an enabled breakpoint and not a disabled one. The run log keeps
the change.

```
machine break run enable [-h] [--once | --count n] number
```

| Argument | Does |
|---|---|
| `number` | Number of the breakpoint |

| Option | Does |
|---|---|
| `--once` | Disable it again after its next hit, as GDB's enable once |
| `--count n` | Disable it again after N hits, as GDB's enable count |

Examples:

```
machine break run1 enable 2  arm stop 2 again
```

See also:

- [`machine break`](#machine-break)
- [`machine break disable`](#machine-break-disable)

### machine break disable

Disable a breakpoint.

The machine arms an enabled breakpoint and not a disabled one. The run log keeps
the change.

```
machine break run disable [-h] number
```

| Argument | Does |
|---|---|
| `number` | Number of the breakpoint |

Examples:

```
machine break run1 disable 2  keep stop 2 and do not arm it
```

See also:

- [`machine break`](#machine-break)
- [`machine break enable`](#machine-break-enable)

### machine break condition

Set the condition of a breakpoint.

A hit where the condition does not hold does not end the run. Without a
condition the breakpoint has none.

```
machine break run condition [-h] number [condition]
```

| Argument | Does |
|---|---|
| `number` | Number of the breakpoint |
| `[condition]` | Condition, such as '$rax == 0' or 'counter > 3' (default: none) |

Examples:

```
machine break run1 condition 2 '$rax == 0'  where rax is 0
machine break run1 condition 2 'n > 3'      where n is above 3
machine break run1 condition 2              no condition
```

See also:

- [`machine break`](#machine-break)
- [`machine break ignore`](#machine-break-ignore)

### machine break ignore

Pass the next hits of a breakpoint.

Each hit where the condition holds is counted. A counted hit is passed while the
ignore count lasts. A count of 0 stops at the next.

```
machine break run ignore [-h] number count
```

| Argument | Does |
|---|---|
| `number` | Number of the breakpoint |
| `count` | Hits to pass |

Examples:

```
machine break run1 ignore 2 5  pass the next 5 hits
```

See also:

- [`machine break`](#machine-break)
- [`machine break condition`](#machine-break-condition)

## machine watch

List and manage watchpoints.

A watchpoint stops the run after a task of its tgid writes its bytes, or reads
them with `--on` access. The listing has the run's watchpoints, each by its
number. Use points to list them with the breakpoints and catchpoints.

The run keeps them in its run log, as it keeps its breakpoints. A run holds 3
breakpoints and watchpoints together.

```
machine watch [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine watch run1 add 412 counter  a write of counter
machine watch run1                  the watchpoints of run1
```

Prints:

```
text  # KIND ADDRESS SIZE WHERE TGID HITS WHEN
json  breakpoints
```

See also:

- [`machine break`](#machine-break)
- [`machine run`](#machine-run)
- [`machine mem`](#machine-mem)

### machine watch add

Add a watchpoint.

The watchpoint stops the run after an instruction writes its bytes. Use `--on`
change to stop only where the bytes change, as GDB's watch does. Use `--on`
access to stop at a read as well. It watches the tgid of the task alone.

A variable is watched at its size. So is an expression, as a local, a member or
an element, at the bytes it names when added. A local's watch stays after its
function returns. Any other location takes `--size`, of 1, 2, 4 or 8 bytes.

The run log keeps the watchpoint, and a branch has its parent's.

```
machine watch run add [-h] [--disabled] [--ignore count] [--temporary]
                      [--condition condition] [--print format] [--size bytes]
                      [--on {write,change,read,access}]
                      tid location
```

| Argument | Does |
|---|---|
| `tid` | Task whose tgid the stop is in |
| `location` | Location, as mem takes one: an address, *ADDR, NAME, PATH:NAME, FILE:LINE or $reg, moved by +N or -N |

| Option | Does |
|---|---|
| `--disabled` | Add it and do not arm it |
| `--ignore count` | Pass this many hits where the condition holds (default: 0) |
| `--temporary` | Delete it at its first hit where the condition holds |
| `--condition condition` | Count a hit only where this expression holds, as print takes one, such as '$rax == 0' |
| `--print format` | Print this at a hit and go on. {EXPR} prints an expression as print takes one, {EXPR:x} in a print format letter: 'n={counter} p={$rdi:x}' |
| `--size bytes` | Bytes to watch: 1, 2, 4 or 8 (default: the variable's size) |
| `--on {write,change,read,access}` | What stops the run: a write, a write that changes the bytes, a read, or any access (default: write) |

Examples:

```
machine watch run1 add 412 counter               a write of the variable
machine watch run1 add 412 counter --on access   any access
machine watch run1 add 412 '*0x4c8b50' --size 4  a write of 4 bytes
```

Prints:

```
text  Watchpoint N at WHERE, in tgid TGID
json  number kind address size tgid program location
```

See also:

- [`machine watch`](#machine-watch)
- [`machine run`](#machine-run)
- [`machine mem`](#machine-mem)

### machine watch delete

Delete watchpoints.

The run log keeps the delete, so a branch forked before it keeps the watchpoint.

```
machine watch run delete [-h] number [number ...]
```

| Argument | Does |
|---|---|
| `number [number ...]` | Number of a watchpoint |

Examples:

```
machine watch run1 delete 3  delete watchpoint 3
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch add`](#machine-watch-add)

### machine watch save

Save the watchpoints as the commands that add them.

Each line is a machine command that adds one watchpoint again. The command keeps
its condition, ignore count and flags. A location written by a register is saved
as its address.

```
machine watch run save [-h] file
```

| Argument | Does |
|---|---|
| `file` | File to write, or - for the standard output |

Examples:

```
machine watch run1 save stops.sh  write the commands to a file
machine watch run1 save -         print them
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch add`](#machine-watch-add)

### machine watch hits

List the hits of watchpoints.

A hit is a watchpoint that stopped the run. It has the entry it stopped at, its
machine time and the number of the watchpoint. The run log keeps each one, so a
branch lists its parent's hits before it.

Use the run command with `--back` to switch onto a branch at the newest hit.

```
machine watch run hits [-h] [-n range]
```

| Option | Does |
|---|---|
| `-n, --entries range` | Hits to list, by the entry each stopped at: N, A:B, A:, :B; or -N for the last N hits, -A:-B counted from the end (default: the last 20) |

Examples:

```
machine watch run1 hits       the last 20 hits
machine watch run1 hits -n :  every hit
```

Prints:

```
text  ENTRY VTIME # KIND EVENT
json  hits
```

See also:

- [`machine watch`](#machine-watch)
- [`machine run`](#machine-run)

### machine watch enable

Enable a watchpoint.

The machine arms an enabled watchpoint and not a disabled one. The run log keeps
the change.

```
machine watch run enable [-h] [--once | --count n] number
```

| Argument | Does |
|---|---|
| `number` | Number of the watchpoint |

| Option | Does |
|---|---|
| `--once` | Disable it again after its next hit, as GDB's enable once |
| `--count n` | Disable it again after N hits, as GDB's enable count |

Examples:

```
machine watch run1 enable 2  arm stop 2 again
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch disable`](#machine-watch-disable)

### machine watch disable

Disable a watchpoint.

The machine arms an enabled watchpoint and not a disabled one. The run log keeps
the change.

```
machine watch run disable [-h] number
```

| Argument | Does |
|---|---|
| `number` | Number of the watchpoint |

Examples:

```
machine watch run1 disable 2  keep stop 2 and do not arm it
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch enable`](#machine-watch-enable)

### machine watch condition

Set the condition of a watchpoint.

A hit where the condition does not hold does not end the run. Without a
condition the watchpoint has none.

```
machine watch run condition [-h] number [condition]
```

| Argument | Does |
|---|---|
| `number` | Number of the watchpoint |
| `[condition]` | Condition, such as '$rax == 0' or 'counter > 3' (default: none) |

Examples:

```
machine watch run1 condition 2 '$rax == 0'  where rax is 0
machine watch run1 condition 2 'n > 3'      where n is above 3
machine watch run1 condition 2              no condition
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch ignore`](#machine-watch-ignore)

### machine watch ignore

Pass the next hits of a watchpoint.

Each hit where the condition holds is counted. A counted hit is passed while the
ignore count lasts. A count of 0 stops at the next.

```
machine watch run ignore [-h] number count
```

| Argument | Does |
|---|---|
| `number` | Number of the watchpoint |
| `count` | Hits to pass |

Examples:

```
machine watch run1 ignore 2 5  pass the next 5 hits
```

See also:

- [`machine watch`](#machine-watch)
- [`machine watch condition`](#machine-watch-condition)

## machine catch

List and manage catchpoints.

A catchpoint stops the run at an event of a task rather than at an address: an
exec, an exit, a fork, a system call, a signal, or a file mapped. The listing
has the run's catchpoints, each by its number. Use points to list them with the
breakpoints and watchpoints.

The run keeps them in its run log, as it keeps its breakpoints. A run holds 8
catchpoints at most.

```
machine catch [-h] run command ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

Examples:

```
machine catch run1                       the catchpoints of run1
machine catch run1 add fork --in tgid=1  stop where tgid 1 forks
```

Prints:

```
text  # KIND ADDRESS SIZE WHERE TGID HITS WHEN
json  breakpoints
```

See also:

- [`machine break`](#machine-break)
- [`machine watch`](#machine-watch)
- [`machine run`](#machine-run)

### machine catch add

Add a catchpoint.

The catchpoint stops the run at an event of a task. The events are exec, exit,
fork, vfork, syscall, signal, load and unload. The C++ events throw, catch and
rethrow are breakpoints in one tgid.

A syscall catchpoint names its system calls, and a signal catchpoint its
signals, four at most. A load, unload or exec catchpoint names a path or a
file's name. Without one, every event of its kind stops the run.

Use `--in` to stop at the events of one task or one tgid alone. The run log
keeps the catchpoint, and a branch has its parent's.

Use `--in` comm=NAME to stop at the events of the tasks of that comm. The comm
is read as tasks exist reads it. An exec catchpoint sees the new program's comm.
A task renamed after exec is seen by its new comm at the next fork, exec or
exit.

An exit catchpoint sees the comm of the tgid's leader, its last task to go. A
worker of that comm in a tgid whose leader has another does not stop it. A
syscall catchpoint with a comm makes the guest report every task's calls while
it is armed.

An exit is the end of a tgid, so an exit catchpoint takes `--in` tgid=N and not
a tid. A throw, catch or rethrow catchpoint is a breakpoint at the C++ runtime's
function. It needs `--in` tgid=N and takes no values. It takes one of the run's
3 breakpoints and watchpoints.

```
machine catch run add [-h] [--in tid=N|tgid=N|comm=NAME] [--disabled] [--ignore count]
                      [--temporary] [--condition condition] [--print format]
                      event [value ...]
```

| Argument | Does |
|---|---|
| `event` | Event: exec, exit, fork, vfork, syscall, signal, load, unload, throw, catch, rethrow |
| `[value ...]` | System call or signal, by name or number, or the path of a load, unload or exec |

| Option | Does |
|---|---|
| `--in tid=N\|tgid=N\|comm=NAME` | Stop at the events of this task, tgid or comm alone (default: any task) |
| `--disabled` | Add it and do not arm it |
| `--ignore count` | Pass this many hits where the condition holds (default: 0) |
| `--temporary` | Delete it at its first hit where the condition holds |
| `--condition condition` | Count a hit only where this expression holds, as print takes one, such as '$rax == 0' |
| `--print format` | Print this at a hit and go on. {EXPR} prints an expression as print takes one, {EXPR:x} in a print format letter: 'n={counter} p={$rdi:x}' |

Examples:

```
machine catch run1 add exec                        any task execs
machine catch run1 add syscall openat write        either call
machine catch run1 add signal SIGSEGV --in tid=57  a signal of 57
machine catch run1 add load libssl.so.3            a library mapped
machine catch run1 add throw --in tgid=57          a C++ throw
machine catch run1 add exit --in comm=cat          a cat ends
```

Prints:

```
text  Catchpoint N: EVENT, in tgid TGID, in tid TID or in comm NAME
json  number kind tgid tid comm names
```

See also:

- [`machine catch`](#machine-catch)
- [`machine run`](#machine-run)
- [`machine break add`](#machine-break-add)
- [`machine tasks exist`](#machine-tasks-exist)

### machine catch delete

Delete catchpoints.

The run log keeps the delete, so a branch forked before it keeps the catchpoint.

```
machine catch run delete [-h] number [number ...]
```

| Argument | Does |
|---|---|
| `number [number ...]` | Number of a catchpoint |

Examples:

```
machine catch run1 delete 4  delete catchpoint 4
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break delete`](#machine-break-delete)

### machine catch save

Save the catchpoints as the commands that add them.

Each line is a machine command that adds one catchpoint again. The command keeps
its condition, ignore count and flags.

```
machine catch run save [-h] file
```

| Argument | Does |
|---|---|
| `file` | File to write, or - for the standard output |

Examples:

```
machine catch run1 save stops.sh  write the commands to a file
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break save`](#machine-break-save)

### machine catch hits

List the hits of catchpoints.

A hit is a catchpoint that stopped the run. It has the entry it stopped at, its
machine time and the number of the catchpoint. A catchpoint's hit also has its
event. The run log keeps each one, so a branch lists its parent's hits before
it.

Use the run command with `--back` to switch onto a branch at the newest hit.

```
machine catch run hits [-h] [-n range]
```

| Option | Does |
|---|---|
| `-n, --entries range` | Hits to list, by the entry each stopped at: N, A:B, A:, :B; or -N for the last N hits, -A:-B counted from the end (default: the last 20) |

Examples:

```
machine catch run1 hits       the last 20 hits
machine catch run1 hits -n :  every hit
```

Prints:

```
text  ENTRY VTIME # KIND EVENT
json  hits
```

See also:

- [`machine catch`](#machine-catch)
- [`machine run`](#machine-run)

### machine catch enable

Enable a catchpoint.

The machine arms an enabled catchpoint and not a disabled one. The run log keeps
the change.

```
machine catch run enable [-h] [--once | --count n] number
```

| Argument | Does |
|---|---|
| `number` | Number of the catchpoint |

| Option | Does |
|---|---|
| `--once` | Disable it again after its next hit, as GDB's enable once |
| `--count n` | Disable it again after N hits, as GDB's enable count |

Examples:

```
machine catch run1 enable 4  arm catchpoint 4 again
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break enable`](#machine-break-enable)

### machine catch disable

Disable a catchpoint.

The machine arms an enabled catchpoint and not a disabled one. The run log keeps
the change.

```
machine catch run disable [-h] number
```

| Argument | Does |
|---|---|
| `number` | Number of the catchpoint |

Examples:

```
machine catch run1 disable 4  keep catchpoint 4 and do not arm it
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break disable`](#machine-break-disable)

### machine catch condition

Set the condition of a catchpoint.

A hit where the condition does not hold does not end the run. Without a
condition the catchpoint has none.

```
machine catch run condition [-h] number [condition]
```

| Argument | Does |
|---|---|
| `number` | Number of the catchpoint |
| `[condition]` | Condition, such as '$rax == 0' or 'counter > 3' (default: none) |

Examples:

```
machine catch run1 condition 4 '$rax == 0'  where rax is 0
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break condition`](#machine-break-condition)

### machine catch ignore

Pass the next hits of a catchpoint.

Each hit where the condition holds is counted. A counted hit is passed while the
ignore count lasts. A count of 0 stops at the next.

```
machine catch run ignore [-h] number count
```

| Argument | Does |
|---|---|
| `number` | Number of the catchpoint |
| `count` | Hits to pass |

Examples:

```
machine catch run1 ignore 4 5  pass the next 5 hits
```

See also:

- [`machine catch`](#machine-catch)
- [`machine break ignore`](#machine-break-ignore)
