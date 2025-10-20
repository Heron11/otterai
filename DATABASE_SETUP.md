# Database Setup Guide

This guide will help you set up the Cloudflare D1 database for OtterAI.

## Step 1: Create the D1 Database

Run the following command to create your production database:

```bash
cd /Users/heron/Desktop/otter2/otterai
wrangler d1 create otterai-production
```

This will output something like:

```
✅ Successfully created DB 'otterai-production'

[[d1_databases]]
binding = "DB"
database_name = "otterai-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** from the output.

## Step 2: Update wrangler.toml

Open `wrangler.toml` and replace the `xxx` placeholder with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "otterai-production"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"  # Replace this!
```

## Step 3: Initialize the Database Schema

Run the schema SQL file to create all tables:

```bash
wrangler d1 execute otterai-production --file=./app/lib/.server/db/schema.sql
```

This will create the following tables:
- `users` - User profiles and credits
- `projects` - User projects
- `usage_logs` - Message usage tracking
- `templates` - Template catalog
- `subscriptions` - Stripe subscription data (prepared for future)
- `chat_messages` - Authenticated user chat history

## Step 4: Verify the Database

Check that tables were created successfully:

```bash
wrangler d1 execute otterai-production --command="SELECT name FROM sqlite_master WHERE type='table';"
```

You should see all 6 tables listed.

## Step 5: Create a Local Development Database (Optional)

For local testing, create a separate development database:

```bash
wrangler d1 create otterai-development
```

Then add it to `wrangler.toml`:

```toml
# For local development
[[d1_databases]]
binding = "DB"
database_name = "otterai-development"
database_id = "YOUR_DEV_DATABASE_ID_HERE"
preview_database_id = "YOUR_DEV_DATABASE_ID_HERE"
```

Initialize it with the same schema:

```bash
wrangler d1 execute otterai-development --file=./app/lib/.server/db/schema.sql
```

## Step 6: Set Environment Variables

Create a `.dev.vars` file in the project root (copy from `.dev.vars.example`):

```bash
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` and add your actual keys:

```bash
# Your existing Anthropic key
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Clerk keys (get from https://dashboard.clerk.com)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Stripe keys (placeholder for now)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Step 7: Set Production Secrets

For production, use Wrangler secrets (these are encrypted):

```bash
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_WEBHOOK_SECRET
```

Paste each key when prompted.

## Testing the Setup

Once everything is configured, test the integration:

```bash
# Start local development server
pnpm dev
```

Try the following:
1. ✅ Visit `/` - should work for anonymous users (no auth required)
2. ✅ Visit `/dashboard` - should redirect to login
3. ✅ Sign up with Clerk
4. ✅ Send a message (should deduct 1 credit)
5. ✅ Check your D1 database for the new user record

## Querying the Database

To check data in your database:

```bash
# List all users
wrangler d1 execute otterai-production --command="SELECT id, email, tier, credits FROM users;"

# Check usage logs
wrangler d1 execute otterai-production --command="SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT 10;"

# Check user credits
wrangler d1 execute otterai-production --command="SELECT id, email, credits, tier FROM users WHERE email = 'your@email.com';"
```

## Troubleshooting

### "Database not found" error
- Make sure you've updated the `database_id` in `wrangler.toml`
- Run `wrangler d1 list` to see all your databases

### "Table doesn't exist" error
- Run the schema file again: `wrangler d1 execute otterai-production --file=./app/lib/.server/db/schema.sql`

### Clerk not working
- Check that `.dev.vars` exists and has valid keys
- Make sure you've added the allowed origins in Clerk dashboard

### Credits not deducting
- Check the browser console for errors
- Verify the user exists in the database
- Check D1 logs: `wrangler tail`

## Next Steps

After the database is set up:
1. ✅ Configure Clerk webhooks (see CLERK_SETUP.md)
2. ⏳ Seed template data (optional)
3. ⏳ Set up Stripe (when ready)
4. ✅ Test the full authentication flow

