# Authentication Setup Guide

## Overview
This guide will help you complete the authentication setup for HotelSaver.ng using NextAuth.js with Google, Facebook, and Instagram social providers.

## 🚀 Quick Start

### 1. Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Update the environment variables in `.env.local`:

#### NextAuth Secret
Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```
Replace `your-secret-here-change-in-production` with the generated secret.

#### NextAuth URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

### 2. OAuth Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" product
4. Configure Valid OAuth Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://your-domain.vercel.app/api/auth/callback/facebook`
5. Copy App ID and App Secret to `.env.local`

#### Instagram OAuth Setup
1. Instagram uses Facebook's OAuth system
2. In your Facebook app, enable Instagram Basic Display
3. Add Instagram Basic Display product
4. Configure redirect URIs (same as Facebook)
5. Copy Client ID and Secret to `.env.local`

### 3. Test Authentication

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000`
3. Click "Sign In" to test the authentication flow
4. Try signing in with each provider

### 4. Production Deployment

#### Update Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all the environment variables from `.env.local`
5. Make sure to update `NEXTAUTH_URL` to your production domain

#### Update OAuth Provider Settings
Update redirect URIs in all OAuth providers to use your production domain.

## 🔧 Authentication Features

### Current Implementation
- ✅ NextAuth.js setup with JWT strategy
- ✅ Google OAuth provider
- ✅ Facebook OAuth provider  
- ✅ Instagram OAuth provider
- ✅ Custom sign-in page with Nigerian theming
- ✅ Sign-out page
- ✅ Error handling page
- ✅ User menu component with profile dropdown
- ✅ Session management across the app

### User Experience
- Beautiful Nigerian-themed sign-in page
- Social provider buttons with brand colors
- User avatar and profile dropdown in header
- Mobile-responsive authentication
- Seamless sign-out flow
- Error handling for failed sign-ins

### Security Features
- JWT-based sessions
- Secure callback URLs
- Environment variable protection
- CSRF protection (built into NextAuth)
- Secure cookie settings

## 📱 Pages Created

1. **Sign In Page** (`/auth/signin`)
   - Social provider buttons
   - Nigerian benefits showcase
   - Professional design with brand colors

2. **Sign Out Page** (`/auth/signout`)
   - Confirmation before sign out
   - Quick sign back in option

3. **Error Page** (`/auth/error`)
   - Comprehensive error handling
   - User-friendly error messages

## 🎨 UI Components

1. **UserMenu Component**
   - User avatar with initials
   - Profile dropdown menu
   - Quick access to bookings, settings
   - Nigerian benefits display
   - Sign out option

2. **Updated Layout**
   - Header integration with authentication
   - Mobile navigation updates
   - Session-aware UI

## 🔄 Session Management

The app uses NextAuth's `SessionProvider` to manage authentication state:

```tsx
import { useSession, signIn, signOut } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <button onClick={() => signIn()}>Sign in</button>
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Configuration" error**
   - Check all environment variables are set
   - Verify OAuth app credentials

2. **Redirect URI mismatch**
   - Ensure callback URLs match in OAuth provider settings
   - Check for trailing slashes

3. **"Invalid client" error**
   - Verify Client ID and Secret are correct
   - Check OAuth app is enabled and published

### Debug Mode
Add this to `.env.local` for debugging:
```
NEXTAUTH_DEBUG=true
```

## 🎯 Next Steps

1. **User Profiles**: Create user profile pages
2. **Booking History**: Link bookings to user accounts
3. **Favorites**: Allow users to save preferred hotels
4. **Preferences**: User settings and preferences
5. **Admin Panel**: User management for administrators

## 🌍 Nigerian Market Features

The authentication system includes Nigerian-specific features:
- Local benefits showcase
- Nigerian business hours consideration
- Naira currency context
- Local contact preferences (WhatsApp priority)

## 📊 Analytics Integration

Consider adding user analytics:
- Sign-up conversion tracking
- Provider preference analysis
- User journey mapping
- Nigerian market insights

---

🇳🇬 **Built for Nigeria** - Your authentication system is ready to serve Nigerian users with world-class security and local market understanding.