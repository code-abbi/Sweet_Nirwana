# Clerk Authentication Setup Guide

## 1. Install Clerk React SDK

```bash
cd frontend
npm install @clerk/clerk-react
```

## 2. Get Clerk Keys

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Get your `Publishable Key` from the dashboard

## 3. Setup Environment Variables

Create `frontend/.env.local`:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

## 4. Wrap App with ClerkProvider

Update `frontend/src/index.tsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY!;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

## 5. Update SweetShopApp Component

Replace the mock user and auth button in `SweetShopApp.tsx`:

```jsx
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react';

// Replace mockUser with:
const { isSignedIn, user } = useAuth();

// Replace the auth button section with:
{isSignedIn ? (
  <UserButton afterSignOutUrl="/" />
) : (
  <SignInButton mode="modal">
    <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
      <UserIcon className="w-6 h-6" />
      <span className="text-sm font-medium">Sign In</span>
    </button>
  </SignInButton>
)}

// Update admin check:
const isAdmin = user?.publicMetadata?.role === 'admin';
```

## 6. Configure Google OAuth in Clerk Dashboard

1. Go to your Clerk dashboard
2. Navigate to "Social Connections" 
3. Enable Google OAuth
4. Add your domain to allowed origins

## 7. Set User Roles (Admin)

In Clerk dashboard:
1. Go to "Users"
2. Edit a user's public metadata:
```json
{
  "role": "admin"
}
```

## Current Features Working:

✅ **Single Page Application** - No routing, everything on one page
✅ **Sweet Cards** - Display all sweets with images, prices, descriptions
✅ **Shopping Cart** - Add to cart, view items, modify quantities
✅ **Admin Controls** - Add/remove stock directly in sweet cards (when logged in as admin)
✅ **Checkout Flow** - Smooth scroll to checkout section on same page
✅ **Payment Interface** - Payment form at bottom of page
✅ **Responsive Design** - Mobile-friendly layout

## Next Steps:

1. Follow this guide to add Clerk authentication
2. Test Google sign-in functionality
3. Set admin roles for users who should manage inventory
4. The app will then be fully functional as requested!