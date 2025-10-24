# Vercel Deployment Guide for AshaAssist Backend

## Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally: `npm install -g vercel`
3. MongoDB Atlas account (for production database)
4. Firebase project setup

## Files Created for Vercel Deployment

### 1. `vercel.json` (Root directory)
Configuration file that tells Vercel how to build and route your Flask application.

### 2. `api/index.py` (Entry point)
Serverless function entry point that imports and initializes your Flask app.

### 3. `requirements.txt` (Root directory)
Python dependencies copied from backend/requirements.txt for Vercel to install.

### 4. `.vercelignore` (Root directory)
Specifies files/folders to exclude from deployment.

## Environment Variables Setup

You need to set these environment variables in Vercel:

### Required Variables:
1. **MONGODB_URI** - Your MongoDB connection string (use MongoDB Atlas for production)
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/`

2. **DATABASE_NAME** - Your database name
   - Example: `ashaassist`

3. **SECRET_KEY** - Flask secret key (generate a secure random string)
   - Generate: `python -c "import secrets; print(secrets.token_hex(32))"`

4. **JWT_SECRET_KEY** - JWT secret key (generate a secure random string)
   - Generate: `python -c "import secrets; print(secrets.token_hex(32))"`

5. **FIREBASE_CREDENTIALS_PATH** - Path to Firebase credentials (see Firebase setup below)

### Firebase Credentials Setup:
Since Vercel doesn't support file uploads directly, you have two options:

**Option 1: Use Environment Variable (Recommended)**
1. Convert your Firebase JSON credentials to a base64 string
2. Store it as an environment variable `FIREBASE_CREDENTIALS_JSON`
3. Update your `backend/config/firebase.py` to decode and use it

**Option 2: Use Vercel Storage**
1. Upload your Firebase credentials JSON to Vercel's storage
2. Reference it via the path

## Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy (First Time)
Navigate to your project root and run:
```bash
vercel
```

This will:
- Create a new Vercel project
- Ask you to link to existing project or create new
- Deploy a preview version

### Step 4: Add Environment Variables
You can add environment variables in two ways:

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all required variables

**Via CLI:**
```bash
vercel env add MONGODB_URI
vercel env add DATABASE_NAME
vercel env add SECRET_KEY
vercel env add JWT_SECRET_KEY
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

## Important Modifications Needed

### 1. Update Firebase Configuration
Modify `backend/config/firebase.py` to handle credentials from environment variables:

```python
import os
import json
import base64
import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    if not firebase_admin._apps:
        # Try to load from environment variable first (Vercel)
        firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
        
        if firebase_creds_json:
            # Decode base64 if needed
            try:
                creds_dict = json.loads(base64.b64decode(firebase_creds_json))
            except:
                creds_dict = json.loads(firebase_creds_json)
            
            cred = credentials.Certificate(creds_dict)
        else:
            # Fallback to file path (local development)
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
            cred = credentials.Certificate(cred_path)
        
        firebase_admin.initialize_app(cred)
```

### 2. File Upload Handling
Vercel's serverless functions have limitations on file storage. Consider:

**Option A: Use Cloud Storage (Recommended)**
- Use Firebase Storage, AWS S3, or Cloudinary for file uploads
- Update your upload endpoint to use cloud storage

**Option B: Temporary Storage**
- Use `/tmp` directory (limited to 512MB and temporary)
- Files are deleted after function execution

### 3. Database Connection
Ensure you're using MongoDB Atlas (cloud) instead of local MongoDB:
- Create a cluster at https://cloud.mongodb.com
- Get your connection string
- Add it to Vercel environment variables

## Testing Your Deployment

After deployment, test your endpoints:

```bash
# Your Vercel URL will be something like:
# https://your-project.vercel.app

# Test health endpoint
curl https://your-project.vercel.app/api/health

# Test other endpoints
curl https://your-project.vercel.app/api/auth/login
```

## Troubleshooting

### Common Issues:

1. **Module not found errors**
   - Ensure all dependencies are in `requirements.txt` at root level
   - Check that imports are correct in `api/index.py`

2. **Database connection fails**
   - Verify MONGODB_URI is correct
   - Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel IPs

3. **File upload issues**
   - Implement cloud storage solution
   - Don't rely on local file system in serverless environment

4. **Cold start delays**
   - First request may be slow (serverless cold start)
   - Consider keeping functions warm or upgrading Vercel plan

5. **Function timeout**
   - Vercel free tier has 10s timeout
   - Pro tier has 60s timeout
   - Optimize long-running operations

## Monitoring & Logs

View logs in Vercel dashboard:
1. Go to your project
2. Click on "Deployments"
3. Select a deployment
4. View "Function Logs"

## Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records as instructed

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:
1. Connect your GitHub/GitLab/Bitbucket repository
2. Every push to main branch = production deployment
3. Every push to other branches = preview deployment

## Cost Considerations

Vercel Free Tier includes:
- 100GB bandwidth
- Unlimited deployments
- Serverless function executions (limited)

For production apps, consider:
- Pro plan for better limits
- MongoDB Atlas free tier (512MB storage)
- Firebase free tier

## Next Steps

1. Set up MongoDB Atlas database
2. Configure all environment variables in Vercel
3. Update Firebase configuration for cloud deployment
4. Implement cloud storage for file uploads
5. Test all endpoints thoroughly
6. Set up custom domain (optional)
7. Configure CORS for your frontend domain

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Python Runtime: https://vercel.com/docs/runtimes#official-runtimes/python
- MongoDB Atlas: https://docs.atlas.mongodb.com/
