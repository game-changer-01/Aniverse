# GitHub Secrets Setup Guide

This project requires certain secrets to be configured in your GitHub repository for the CI/CD pipeline to work correctly.

## Required Secrets

### 1. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**Purpose:** Clerk authentication publishable key for the frontend  
**How to get it:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Sign in to your Clerk account
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

**How to add it to GitHub:**
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
5. Value: Paste your Clerk publishable key
6. Click **Add secret**

### 2. CLERK_SECRET_KEY

**Purpose:** Clerk authentication secret key for backend operations  
**How to get it:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

**How to add it to GitHub:**
1. Follow the same steps as above
2. Name: `CLERK_SECRET_KEY`
3. Value: Paste your Clerk secret key

## Verifying Setup

After adding the secrets:
1. Go to **Actions** tab in your repository
2. Find the latest workflow run
3. Click **Re-run all jobs**
4. The build should now succeed

## Local Development

For local development, create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

**Important:** Never commit `.env.local` to version control!

## Troubleshooting

### Error: "Missing publishableKey"
- Make sure the secret name is exactly `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Verify the secret value is correct and not expired
- Re-run the workflow after adding the secret

### Build still failing
- Check that both secrets are added (publishable and secret key)
- Ensure the workflow file references the secrets correctly
- Contact support if issues persist

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
