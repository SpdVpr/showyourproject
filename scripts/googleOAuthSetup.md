# 🔐 Google OAuth Setup Guide

## Problem: Google asks for identity verification

When using Google OAuth in development, Google may ask for identity verification because the app is in "Testing" mode.

## Solution Steps

### Step 1: OAuth Consent Screen Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials/consent
   - Select project: `showyourproject-com`

2. **Configure OAuth Consent Screen**
   - **User Type**: External
   - **App name**: ShowYourProject.com
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **App domain**: `showyourproject.com` (when deployed)
   - **Authorized domains**: 
     - `showyourproject-com.firebaseapp.com`
     - `showyourproject-com.web.app`
     - `localhost` (for development)

3. **Scopes** (Step 2)
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

4. **Test Users** (Step 3)
   - Add your Gmail accounts that you want to test with
   - Click **+ ADD USERS**
   - Enter email addresses
   - Save

### Step 2: Verify OAuth Client Settings

1. **Go to Credentials**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID

2. **Update Authorized Origins**
   ```
   http://localhost:3000
   http://localhost:3001
   https://showyourproject-com.firebaseapp.com
   https://showyourproject-com.web.app
   ```

3. **Update Authorized Redirect URIs**
   ```
   https://showyourproject-com.firebaseapp.com/__/auth/handler
   ```

### Step 3: Firebase Authentication Settings

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/showyourproject-com/authentication/providers

2. **Google Provider Settings**
   - Enable Google provider
   - Web client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - Web client secret: `YOUR_GOOGLE_CLIENT_SECRET`

### Step 4: Publishing the App (Optional)

To remove the verification screen completely:

1. **Submit for Verification**
   - In OAuth consent screen, click **PUBLISH APP**
   - Fill out the verification form
   - Wait for Google approval (can take days/weeks)

2. **Alternative: Keep in Testing Mode**
   - Add all users who need access to "Test users"
   - Users will see a warning but can proceed
   - No verification required for test users

## Quick Fix for Development

### Option 1: Add Test Users
- Add your Gmail account to test users list
- No verification required for test users

### Option 2: Use Different Google Account
- Try with a different Google account
- Some accounts trigger verification more than others

### Option 3: Clear Browser Data
- Clear cookies and cache for Google accounts
- Try incognito/private browsing mode

## Expected Behavior

### With Test Users Added:
- Login should work without verification
- May show "This app isn't verified" warning
- Click "Advanced" → "Go to ShowYourProject.com (unsafe)"

### Without Test Users:
- Google asks for phone verification
- More security checks required

## Troubleshooting

### If still asking for verification:
1. Double-check test users are added correctly
2. Use the exact email address that's added as test user
3. Clear browser cache and cookies
4. Try different browser or incognito mode

### Common Issues:
- **Wrong email**: Make sure the Gmail account is in test users
- **Cache issues**: Clear browser data
- **Scope issues**: Verify scopes are correctly configured
- **Domain issues**: Check authorized domains

## Production Deployment

When ready for production:
1. Update authorized domains to your actual domain
2. Submit app for verification
3. Remove localhost from authorized origins
4. Update Firebase hosting settings

## Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for sensitive data
- Regularly rotate client secrets
- Monitor OAuth usage in Google Cloud Console
