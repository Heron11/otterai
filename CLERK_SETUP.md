# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for OtterAI.

## Step 1: Create a Clerk Account

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application

## Step 2: Get Your API Keys

From the Clerk dashboard:

1. Go to **API Keys** in the sidebar
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`) - click "Show" to reveal

## Step 3: Add Keys to Your Project

Add these keys to your `.dev.vars` file:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

For production, use Wrangler secrets:

```bash
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put CLERK_SECRET_KEY
```

## Step 4: Configure Allowed Origins

In the Clerk dashboard:

1. Go to **Domains** (or **Settings** > **Domains**)
2. Add your development URL: `http://localhost:5173`
3. Add your production URL (e.g., `https://otterai.pages.dev`)

## Step 5: Set Up Webhooks

Webhooks sync user data from Clerk to your D1 database.

### For Development (using Ngrok or similar):

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `pnpm dev`
3. In another terminal: `ngrok http 5173`
4. Copy the ngrok URL (e.g., `https://xxxx.ngrok.io`)

### Configure Webhook in Clerk:

1. Go to **Webhooks** in Clerk dashboard
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Dev: `https://xxxx.ngrok.io/api/webhooks/clerk`
   - Prod: `https://yourdomain.com/api/webhooks/clerk`
4. Select the following events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_...`)

### Add Webhook Secret:

```bash
# In .dev.vars
CLERK_WEBHOOK_SECRET=whsec_your_secret_here

# For production
wrangler secret put CLERK_WEBHOOK_SECRET
```

## Step 6: Configure Clerk Paths

In the Clerk dashboard, you need to configure the sign-in and sign-up paths:

1. Go to **Paths** (or **Settings** > **Paths**)
2. Set the following paths:
   - **Sign-in path**: `/sign-in`
   - **Sign-up path**: `/sign-up`
   - **After sign-in URL**: `/`
   - **After sign-up URL**: `/`

## Step 7: Customize Sign-In/Sign-Up Pages (Optional)

You can customize the authentication UI in Clerk dashboard:

1. Go to **Customization** > **Components**
2. Enable/disable fields (email, username, phone, etc.)
3. Choose authentication methods (email/password, Google, GitHub, etc.)

### Recommended Settings for OtterAI:

- **Identifier**: Email only
- **Authentication**: Email + Password
- **Social Login**: Google, GitHub (optional)
- **User Profile**: Require name

## Step 8: Test the Integration

1. Start your dev server: `pnpm dev`
2. Visit `http://localhost:5173` and try to send a message
3. You should see the sign-in modal appear
4. Sign up with a new account
5. After sign-up, you should be able to send messages
6. Check your D1 database to verify the user was created:

```bash
wrangler d1 execute DB --command="SELECT * FROM users;"
```

You should see the new user with 50 credits (Free tier).

## Step 9: Configure User Metadata (Optional)

To store additional data in Clerk:

1. Go to **Users** in Clerk dashboard
2. Click on a user
3. Go to **Metadata** tab
4. You can add custom fields here (though we store most data in D1)

## Webhook Testing

To test if webhooks are working:

1. Create a new user in Clerk dashboard manually
2. Check your server logs (look for "User created" message)
3. Query your database to see if the user was added

## Troubleshooting

### "Clerk is not configured" error
- Verify `.dev.vars` has the correct keys
- Restart your dev server after adding keys

### Sign-in page doesn't appear
- Check Clerk dashboard → Domains → make sure `localhost:5173` is added
- Clear browser cache and cookies

### User not appearing in database
- Check webhook configuration in Clerk dashboard
- Verify webhook secret is correct
- Check server logs for webhook errors
- For development, make sure ngrok is running

### Redirect loop
- Check that `CLERK_PUBLISHABLE_KEY` is correctly passed to the client
- Verify root.tsx loader is configured correctly

## Production Deployment Checklist

Before deploying to production:

- [ ] Add production domain to Clerk allowed origins
- [ ] Update webhook URL to production URL
- [ ] Set all Clerk secrets via `wrangler secret put`
- [ ] Test sign-up flow in production
- [ ] Verify webhooks are firing (check D1 database)
- [ ] Test credit deduction on first message

## Clerk Features You Can Enable Later

Clerk provides many features you can add as needed:

- **Multi-factor authentication (MFA)**
- **Social logins** (Google, GitHub, etc.)
- **Magic links** (passwordless auth)
- **Organizations** (for team features)
- **Session management** (device limits, etc.)

## Support

- Clerk Docs: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- OtterAI Issues: Check the project repository

