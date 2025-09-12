# Email Verification Setup Guide

## ⚠️ IMPORTANT: Required Firebase Console Setup

### 1. Authorized Domains (CRITICAL)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `showyourproject-com`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Make sure these domains are added:
   - `showyourproject.com`
   - `localhost` (for development)
   - Any other domains you use

### 2. Enable Email Verification Templates
1. Navigate to **Authentication** → **Templates**
2. Click on **Email address verification**
3. **ENABLE** the template (toggle switch must be ON)

### 3. Configure Email Template
**Subject:** Verify your email for ShowYourProject.com

**Email body:**
```
Hello,

Welcome to ShowYourProject.com!

Please verify your email address by clicking the link below:

%LINK%

This link will expire in 1 hour. If you didn't create an account with ShowYourProject.com, you can safely ignore this email.

Best regards,
The ShowYourProject.com Team

---
ShowYourProject.com - Showcase your projects to the world
```

### 4. Configure Action URL (IMPORTANT)
- **Action URL:** Leave as default Firebase URL OR set to `https://showyourproject.com/__/auth/action`
- **DO NOT** use custom URL unless you implement custom handler

### 5. Check Email Provider Settings
1. Go to **Authentication** → **Settings** → **Project settings**
2. Scroll to **Public-facing name** - set to "ShowYourProject.com"
3. **Support email** - set to your support email
4. This affects the "From" field in verification emails

### 6. SMTP Configuration (Optional but Recommended)
1. Go to **Authentication** → **Templates** → **SMTP settings**
2. For better deliverability, configure custom SMTP:
   - **SMTP server:** smtp.gmail.com (or your provider)
   - **Port:** 587
   - **Username/Password:** Your email credentials
3. Or use Firebase default (may go to spam)

### 5. Email Verification Flow

#### Current Implementation:
1. User registers → `createUserWithEmailAndPassword()`
2. `sendEmailVerification()` is called automatically
3. User receives email with verification link
4. User clicks link → redirected to Firebase hosted page
5. User is redirected back to `/dashboard`

#### Custom Verification Page (Optional):
Create `/verify-email` page to handle verification:

```typescript
// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const verifyEmail = async () => {
      const actionCode = searchParams.get('oobCode');
      
      if (!actionCode) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }
      
      try {
        await applyActionCode(auth, actionCode);
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. The link may be expired.');
      }
    };
    
    verifyEmail();
  }, [searchParams, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && <p className="text-green-600">{message}</p>}
        {status === 'error' && <p className="text-red-600">{message}</p>}
      </div>
    </div>
  );
}
```

## Testing Email Verification

### 1. Test Registration Flow
1. Go to `/register`
2. Fill out the form with a real email address
3. Submit the form
4. Check email inbox for verification email
5. Click the verification link
6. Verify user is redirected properly

### 2. Check User Verification Status
```typescript
// In your components
import { useAuth } from '@/components/auth/AuthProvider';

function MyComponent() {
  const { firebaseUser } = useAuth();
  
  if (firebaseUser && !firebaseUser.emailVerified) {
    return <div>Please verify your email address</div>;
  }
  
  return <div>Email verified!</div>;
}
```

### 3. Resend Verification Email
```typescript
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const resendVerification = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
    alert('Verification email sent!');
  }
};
```

## Production Considerations

### 1. Email Deliverability
- Configure SPF, DKIM, and DMARC records for your domain
- Consider using a custom SMTP provider (SendGrid, Mailgun, etc.)
- Monitor email delivery rates

### 2. User Experience
- Show verification status in user dashboard
- Allow users to resend verification emails
- Handle expired verification links gracefully

### 3. Security
- Verify email before allowing sensitive actions
- Consider requiring email verification for project submissions
- Log verification attempts for security monitoring

## Current Status
✅ Email verification implemented in registration flow
✅ Success/error messages added to UI
✅ Automatic redirect to login with verification message
⏳ Firebase Console templates need to be configured
⏳ Custom verification page (optional enhancement)
