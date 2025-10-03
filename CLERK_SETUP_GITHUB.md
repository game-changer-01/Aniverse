# 🔐 Clerk Authentication Setup for GitHub Actions

## ⚠️ IMPORTANT: Add GitHub Secrets for CI/CD Pipeline

Your CI/CD pipeline is failing because it needs the Clerk publishable key during the build process. Follow these steps to fix it:

---

## 📋 Step-by-Step Instructions

### 1. Get Your Clerk Publishable Key

1. Go to your Clerk Dashboard: https://dashboard.clerk.com/last-active?path=api-keys
2. Copy your **Publishable Key** (it starts with `pk_test_...` or `pk_live_...`)
   - You already have it: `pk_test_Y2F1c2FsLXRyb3V0LTQ0LmNsZXJrLmFjY291bnRzLmRldiQ`

### 2. Add Secret to GitHub Repository

1. Go to your GitHub repository: https://github.com/samarpithmenezes32/Aniverse
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button
5. Add the following secret:

   **Name:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   
   **Value:** `pk_test_Y2F1c2FsLXRyb3V0LTQ0LmNsZXJrLmFjY291bnRzLmRldiQ`

6. Click **Add secret**

### 3. (Optional) Add Clerk Secret Key

If your backend needs it, also add:

   **Name:** `CLERK_SECRET_KEY`
   
   **Value:** `sk_test_H4zVwM86CtodcekqhKE3zr0oMKLz87T2RuFIOvAy6P`

---

## 🔄 How It Works

### Updated GitHub Actions Workflow

The `.github/workflows/ci.yml` has been updated to use the secret:

```yaml
- name: Build frontend
  working-directory: frontend
  env:
    NEXT_PUBLIC_API_URL: http://localhost:${{ env.PORT }}/api
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
  run: npm run build
```

### What This Does:

1. During the GitHub Actions build, it reads the secret you added
2. Sets it as an environment variable `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Next.js can access it during build time via `process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Your ClerkProvider receives the key and works correctly

---

## ✅ Verification Steps

After adding the GitHub secret:

1. **Commit and push the updated workflow file** (already done if you see this file)
2. **Go to Actions tab**: https://github.com/samarpithmenezes32/Aniverse/actions
3. **Re-run the failed workflow** or push a new commit to trigger it
4. **Check the build logs** - it should now succeed!

---

## 🎯 Quick Reference

### Environment Variables Checklist:

| Environment | File/Location | Status |
|-------------|---------------|--------|
| **Local Development** | `frontend/.env.local` | ✅ Configured |
| **GitHub Actions** | Repository Secrets | ⏳ Needs setup |
| **Production Deploy** | Hosting platform (Vercel/Netlify) | 🔜 Setup when deploying |

### Local `.env.local` (Already set):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2F1c2FsLXRyb3V0LTQ0LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_H4zVwM86CtodcekqhKE3zr0oMKLz87T2RuFIOvAy6P
```

---

## 🚀 After Adding the Secret

1. The CI/CD pipeline will automatically use it on the next run
2. No code changes needed - just add the secret on GitHub
3. Push any commit to trigger the workflow again

---

## 📚 Additional Resources

- **Clerk Documentation**: https://clerk.com/docs/quickstarts/nextjs
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables

---

## 🔒 Security Notes

- ✅ Your `.env.local` file is in `.gitignore` (secrets never committed)
- ✅ GitHub Secrets are encrypted and never exposed in logs
- ✅ Only repository collaborators can add/view secrets
- ✅ Publishable keys are safe to use client-side (that's their purpose)

---

## ❓ Troubleshooting

### If the build still fails:

1. **Verify secret name matches exactly**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. **Check for typos** in the key value
3. **Re-run the workflow** from GitHub Actions tab
4. **Check build logs** for specific error messages

### Common Issues:

- ❌ Secret name typo → Must be exactly `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ❌ Missing `NEXT_PUBLIC_` prefix → Required for Next.js client-side access
- ❌ Old cached build → Re-run workflow from Actions tab

---

## 📸 Visual Guide

### Adding GitHub Secret:

```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_test_Y2F1c2FsLXRyb3V0LTQ0LmNsZXJrLmFjY291bnRzLmRldiQ

[Add secret]
```

---

**That's it!** Once you add the secret on GitHub, your CI/CD pipeline will work correctly. 🎉
