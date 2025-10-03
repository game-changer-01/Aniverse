# Clerk Authentication Setup Guide

## Overview
Your Guide2Anime application now uses Clerk for modern, secure authentication with support for:
- Email/Password authentication
- Social logins (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- User management dashboard
- Passwordless authentication

## Setup Instructions

### 1. Create a Clerk Account
1. Go to [https://clerk.com/](https://clerk.com/)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy the following keys:
   - `Publishable Key` (starts with `pk_test_` or `pk_live_`)
   - `Secret Key` (starts with `sk_test_` or `sk_live_`)

### 3. Configure Environment Variables
1. Create a `.env.local` file in the `frontend` directory (if it doesn't exist)
2. Add your Clerk keys:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (optional - already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/recommendations
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/recommendations

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 4. Configure Clerk Dashboard Settings
In your Clerk dashboard:

1. **Go to User & Authentication > Social Connections**
   - Enable Google, GitHub, or other providers you want to support
   
2. **Go to User & Authentication > Email, Phone, Username**
   - Configure which fields are required
   - Enable email verification if desired

3. **Go to Paths**
   - Sign-in URL: `/auth/login`
   - Sign-up URL: `/auth/signup`
   - After sign-in URL: `/recommendations`
   - After sign-up URL: `/recommendations`

### 5. Start Your Application
```bash
# In the frontend directory
npm run dev
```

Your application will now use Clerk for authentication!

## Features Enabled

✅ **Email/Password Authentication** - Traditional login with email and password
✅ **Social Logins** - Google, GitHub, and more
✅ **Passwordless** - Magic links via email
✅ **User Management** - Built-in user profile management
✅ **Security** - MFA, session management, and more
✅ **Custom Styling** - Matches your luxury anime theme

## Testing

1. Navigate to `http://localhost:3001/auth/login`
2. Try signing up with a new account
3. Test social login (if configured)
4. After login, you'll be redirected to `/recommendations`

## Routes

- **Public Routes** (accessible without login):
  - `/` - Home page
  - `/catalog` - Anime catalog
  - `/news` - Anime news
  - `/auth/login` - Login page
  - `/auth/signup` - Signup page

- **Protected Routes** (require authentication):
  - `/recommendations` - Personalized recommendations
  - User profile and settings

## Customization

The Clerk components are styled to match your luxury anime theme with:
- Golden gradient branding
- Dark purple background
- Glassmorphism effects
- Smooth animations

You can further customize the appearance in:
- `frontend/src/styles/global.css` (Clerk styling section)
- `frontend/pages/auth/login.jsx` (Login page)
- `frontend/pages/auth/signup.jsx` (Signup page)

## Troubleshooting

**Error: Missing Clerk Keys**
- Make sure you've added both keys to `.env.local`
- Restart your dev server after adding environment variables

**Social Login Not Working**
- Check Clerk dashboard > Social Connections
- Verify redirect URLs are configured correctly

**Styling Issues**
- Clear your browser cache
- Check browser console for errors
- Verify Clerk CSS classes in global.css

## Documentation

- Clerk Docs: https://clerk.com/docs
- Next.js Integration: https://clerk.com/docs/nextjs/overview
- API Reference: https://clerk.com/docs/reference/clerkjs

## Support

For Clerk-specific issues:
- Visit: https://clerk.com/support
- Discord: https://clerk.com/discord

For application issues:
- Check the browser console
- Review server logs
- Contact your development team
