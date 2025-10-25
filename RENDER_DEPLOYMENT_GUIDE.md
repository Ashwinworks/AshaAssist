# 🎨 Render Frontend Deployment Guide

## ✅ Files Created for Render

1. **`render.yaml`** - Render configuration file (Infrastructure as Code)
2. **`.renderignore`** - Files to exclude from deployment
3. **`frontend/.env.production`** - Production environment variables template

## 🚀 Quick Deployment Steps

### Step 1: Get Your Vercel Backend URL

Go to your Vercel dashboard and copy your backend URL:
```
https://asha-assist.vercel.app
```

### Step 2: Update Production Environment File

The file `frontend/.env.production` has been created with a placeholder URL.

**You need to update it with your actual Vercel URL:**
```env
REACT_APP_API_URL=https://YOUR-ACTUAL-VERCEL-URL.vercel.app/api
```

### Step 3: Commit and Push to GitHub

```bash
git add render.yaml .renderignore frontend/.env.production
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 4: Deploy to Render

**Option A: Using render.yaml (Recommended)**

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select **"AshaAssist"** repository
5. Render will automatically detect `render.yaml`
6. Click **"Apply"**

**Option B: Manual Setup**

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your repository
4. Configure:
   - **Name**: `ashaassist-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/build`

### Step 5: Add Environment Variables (Manual Setup Only)

If using Option B, add these environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://asha-assist.vercel.app/api` |
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyBBvgaYXAYmi5f66EjfTBpuqfveC69wzcw` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `ashaassist-17a9e.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | `ashaassist-17a9e` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `ashaassist-17a9e.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `1071515749637` |
| `REACT_APP_FIREBASE_APP_ID` | `1:1071515749637:web:788f454adcc73a5ab33b6c` |
| `REACT_APP_NAME` | `AshaAssist` |
| `REACT_APP_VERSION` | `1.0.0` |

### Step 6: Wait for Build

- Build typically takes 2-5 minutes
- Watch the logs in Render dashboard
- Status will change from "Building" → "Live"

### Step 7: Get Your Frontend URL

After deployment, you'll receive a URL like:
```
https://ashaassist-frontend.onrender.com
```

## 🔧 Post-Deployment Configuration

### Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ashaassist-17a9e`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Render domain: `ashaassist-frontend.onrender.com`
6. Save

### Update Backend CORS (Optional)

If you want to restrict CORS to specific domains, update `backend/app.py`:

```python
from flask_cors import CORS

# Replace the existing CORS(app) with:
CORS(app, origins=[
    "http://localhost:3000",  # Local development
    "https://ashaassist-frontend.onrender.com",  # Production
])
```

Then commit and push to redeploy backend.

## 🧪 Testing Checklist

After deployment, test:

- [ ] Homepage loads correctly
- [ ] All routes are accessible
- [ ] Login/Registration works
- [ ] Google Sign-In works
- [ ] API calls return data
- [ ] Images and assets load
- [ ] Responsive design works on mobile
- [ ] No console errors

## 🔄 Continuous Deployment

Render automatically deploys when you push to the `main` branch!

```
git push origin main → Render builds → Auto-deploy
```

## 📊 Monitoring

### View Logs
1. Render Dashboard → Your Static Site → **Logs**
2. See build and deploy logs in real-time

### View Metrics
1. Click **Metrics** tab
2. Monitor bandwidth and requests

## 🎯 Environment-Specific Builds

The app will use different environment files:

- **Development**: `frontend/.env` (local)
- **Production**: `frontend/.env.production` (Render)

Render automatically uses `.env.production` during build.

## 🚨 Troubleshooting

### Build Fails

**Check:**
- Node.js version (should be 18+)
- All dependencies in `package.json`
- Build command is correct
- Review build logs for specific errors

### Blank Page After Deploy

**Check:**
- Browser console for errors
- `REACT_APP_API_URL` is correct
- CORS settings in backend
- Firebase configuration

### API Calls Fail

**Check:**
- Backend URL is correct in env vars
- Backend is deployed and running
- CORS allows your frontend domain
- Network tab in browser dev tools

## 💰 Render Free Tier

**Includes:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited static sites
- ✅ Auto HTTPS/SSL
- ✅ Continuous deployment
- ✅ Custom domains

**Cost: $0 for most small apps** 🎉

## 🎨 Custom Domain (Optional)

1. Render Dashboard → Your Site → **Settings**
2. Scroll to **Custom Domains**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `www.ashaassist.com`)
5. Update DNS records as instructed
6. SSL certificate auto-provisioned

## 📝 Summary

✅ **Created Files:**
- `render.yaml` - Render config
- `.renderignore` - Deployment exclusions  
- `frontend/.env.production` - Production env vars

✅ **Next Steps:**
1. Update `.env.production` with your Vercel URL
2. Commit and push to GitHub
3. Deploy using Render Blueprint or manual setup
4. Add Firebase authorized domain
5. Test thoroughly

---

**Your app is now ready to deploy to Render!** 🚀
