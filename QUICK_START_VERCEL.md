# 🚀 Quick Start: Deploy AshaAssist Backend to Vercel

This is a **quick reference guide** for deploying your backend to Vercel. For detailed explanations, see [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) and [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md).

## Prerequisites

✅ Vercel account: https://vercel.com  
✅ MongoDB Atlas account: https://cloud.mongodb.com  
✅ Firebase service account JSON file  

## 5-Minute Deployment

### Step 1: Prepare Environment Variables

#### 1.1 Generate Secret Keys

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

**Save these outputs!**

#### 1.2 Encode Firebase Credentials

```bash
python encode_firebase_credentials.py path/to/your/firebase-credentials.json
```

**Copy the base64 output!**

#### 1.3 Get MongoDB Connection String

From MongoDB Atlas:
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

Example: `mongodb+srv://username:password@cluster.mongodb.net/`

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (preview first)
vercel
```

Follow the prompts:
- Link to existing project? **N** (create new)
- Project name? **ashaassist-backend**
- Which directory? **Press Enter** (current directory)

### Step 3: Add Environment Variables

Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these 6 variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `DATABASE_NAME` | `ashaassist` |
| `SECRET_KEY` | From Step 1.1 |
| `JWT_SECRET_KEY` | From Step 1.1 |
| `FIREBASE_CREDENTIALS_JSON` | From Step 1.2 (base64) |
| `FLASK_ENV` | `production` |

Select **all environments** for each variable!

### Step 4: Deploy to Production

```bash
vercel --prod
```

### Step 5: Test Your Deployment

```bash
# Replace with your actual Vercel URL
curl https://your-project.vercel.app/api/health
```

✅ You should see a response!

### Step 6: Update Frontend

Update `frontend/.env`:

```env
REACT_APP_API_URL=https://your-project.vercel.app/api
```

## That's it! 🎉

Your backend is now live on Vercel!

---

## Common Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls

# Add environment variable
vercel env add VARIABLE_NAME
```

## Troubleshooting

### "Module not found" error
- Check `requirements.txt` is in root directory
- Verify all dependencies are listed

### Database connection fails
- Check MongoDB Atlas whitelists all IPs (0.0.0.0/0)
- Verify connection string is correct
- Password special characters should be URL encoded

### Firebase error
- Re-encode your Firebase credentials
- Check environment variable name is exactly `FIREBASE_CREDENTIALS_JSON`
- Verify base64 string is complete

## Important Files Created

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.py` - Entry point
- ✅ `requirements.txt` - Python dependencies (root)
- ✅ `.vercelignore` - Files to exclude
- ✅ `backend/config/firebase.py` - Updated for env vars

## Next Steps

1. Set up continuous deployment (connect Git repo)
2. Configure custom domain (optional)
3. Monitor logs and performance
4. Update CORS settings for production
5. Consider implementing cloud storage for file uploads

## Need Help?

- 📖 Detailed Guide: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)
- ✅ Full Checklist: [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)
- 🔥 Firebase Setup: [`FIREBASE_VERCEL_SETUP.md`](./FIREBASE_VERCEL_SETUP.md)
- 🌐 Vercel Docs: https://vercel.com/docs
- 💬 Vercel Support: https://vercel.com/support

---

**Happy Deploying! 🚀**
