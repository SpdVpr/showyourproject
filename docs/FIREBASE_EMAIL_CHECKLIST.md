# Firebase Email Verification Checklist

## 🔥 Firebase Console Setup Checklist

### ✅ Step 1: Authentication Settings
- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Check **Authorized domains** section
- [ ] Ensure these domains are listed:
  - `showyourproject.com`
  - `localhost` (for development)
  - Any other domains you use

### ✅ Step 2: Email Templates
- [ ] Go to Firebase Console → Authentication → Templates
- [ ] Click on **"Email address verification"**
- [ ] **IMPORTANT**: Toggle switch must be **ENABLED** (blue/green)
- [ ] Customize email template if needed
- [ ] Save changes

### ✅ Step 3: Project Settings
- [ ] Go to Firebase Console → Project Settings (gear icon)
- [ ] Set **Public-facing name**: "ShowYourProject.com"
- [ ] Set **Support email**: your support email address
- [ ] This affects the "From" field in emails

### ✅ Step 4: Test Email Verification
Run the test script:
```bash
node scripts/testEmailVerification.js
```

## 🐛 Troubleshooting

### Email Not Received?

#### Check Spam/Junk Folder
- Firebase emails often go to spam initially
- Mark as "Not Spam" to improve future delivery

#### Check Firebase Console Logs
1. Go to Firebase Console → Authentication → Users
2. Look for your test user
3. Check if email verification was attempted

#### Common Issues:

**1. Template Not Enabled**
- Solution: Enable email verification template in Firebase Console

**2. Domain Not Authorized**
- Error: "This domain is not authorized"
- Solution: Add domain to authorized domains list

**3. Invalid Action URL**
- Error: Email link doesn't work
- Solution: Use default Firebase action URL or implement custom handler

**4. SMTP Issues**
- Problem: Emails go to spam or not delivered
- Solution: Configure custom SMTP in Firebase Console

**5. Project Settings Missing**
- Problem: Emails have generic sender
- Solution: Set public-facing name and support email

## 🔧 Development vs Production

### Development (localhost)
- Add `localhost` to authorized domains
- Use test email addresses
- Check browser console for debug logs

### Production (showyourproject.com)
- Add `showyourproject.com` to authorized domains
- Configure custom SMTP for better deliverability
- Set proper support email and public-facing name

## 📧 Email Template Customization

### Default Template
Firebase provides a basic template that works out of the box.

### Custom Template
```html
Subject: Verify your email for ShowYourProject.com

Hello,

Welcome to ShowYourProject.com!

Please verify your email address by clicking the link below:
%LINK%

This link will expire in 1 hour.

Best regards,
The ShowYourProject.com Team
```

### Template Variables
- `%LINK%` - Verification link (required)
- `%EMAIL%` - User's email address
- `%DISPLAY_NAME%` - User's display name (if set)

## 🚀 Next Steps After Setup

1. **Test registration flow** on your website
2. **Check email delivery** to different providers (Gmail, Outlook, etc.)
3. **Monitor spam rates** and adjust SMTP settings if needed
4. **Implement email verification status** in your UI
5. **Add resend verification** functionality for users

## 📞 Support

If emails still don't work after following this checklist:

1. Check Firebase Console → Authentication → Users for error logs
2. Test with the provided script: `node scripts/testEmailVerification.js`
3. Verify all settings in Firebase Console match this checklist
4. Consider using custom SMTP provider for better deliverability
