# Google Sign-In Setup Guide for AshaAssist

This guide will walk you through setting up Google Sign-In with Firebase for your AshaAssist application.

## Prerequisites

- Google account
- Firebase project
- Google Cloud Console access

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ashaassist` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle **Enable**
6. Set your project support email
7. Click **Save**

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. In the **General** tab, scroll down to **Your apps**
3. Click **Web app** icon (`</>`)
4. Register your app with name: `AshaAssist Frontend`
5. Copy the Firebase configuration object

## Step 4: Update Frontend Environment Variables

Update your `frontend/.env` file with the Firebase configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Step 5: Generate Firebase Service Account Key

1. In Firebase Console, go to **Project Settings**
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Save it as `firebase-service-account-key.json` in your backend directory
6. **IMPORTANT**: Add this file to your `.gitignore` to keep it secure

## Step 6: Update Backend Environment Variables

Update your `backend/.env` file:

```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=firebase-service-account-key.json
```

## Step 7: Configure Google Cloud Console (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 client ID
5. Add authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Step 8: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000`
4. Try the Google Sign-In button on login/register pages

## Security Considerations

1. **Never commit** your Firebase service account key to version control
2. Use environment variables for all sensitive configuration
3. In production, restrict your OAuth client to specific domains
4. Enable Firebase Security Rules for additional protection

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**
   - Check if `FIREBASE_CREDENTIALS_PATH` is correct
   - Ensure the service account key file exists

2. **"Invalid token"**
   - Verify Firebase configuration in frontend
   - Check if Google Sign-In is enabled in Firebase Console

3. **CORS errors**
   - Add your domain to authorized origins in Google Cloud Console
   - Check Firebase hosting configuration

4. **"User not found" after Google Sign-In**
   - Check backend logs for errors
   - Verify MongoDB connection
   - Ensure the `/api/auth/google` endpoint is working

### Debug Steps:

1. Check browser console for errors
2. Check backend logs for Firebase initialization
3. Verify environment variables are loaded correctly
4. Test Firebase connection with a simple API call

## Features Implemented

✅ Google Sign-In button component
✅ Firebase authentication integration
✅ Backend Google token verification
✅ Automatic user creation for new Google users
✅ Existing user login with Google
✅ JWT token generation for authenticated users
✅ Profile picture from Google account
✅ Secure token handling

## Next Steps

After successful setup, you can:

1. Customize the user profile completion flow
2. Add additional OAuth providers (Facebook, Apple, etc.)
3. Implement email verification
4. Add password reset functionality
5. Set up Firebase Security Rules
6. Configure Firebase Hosting for deployment

## Support

If you encounter issues:

1. Check the Firebase Console for error logs
2. Review browser developer tools
3. Check backend server logs
4. Verify all environment variables are set correctly

---

**Note**: This setup provides a complete Google Sign-In integration with your existing authentication system. Users can sign in with Google and their accounts will be automatically created in your MongoDB database with JWT token authentication.