# 🚀 Vercel Deployment Checklist for AshaAssist Backend

## Pre-Deployment Setup

### ✅ 1. Database Setup (MongoDB Atlas)

- [ ] Create MongoDB Atlas account at https://cloud.mongodb.com
- [ ] Create a new cluster (Free tier M0 is fine for testing)
- [ ] Create a database user with password
- [ ] Whitelist all IP addresses (0.0.0.0/0) for Vercel access
- [ ] Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/`)
- [ ] Test connection locally by updating your `.env` file

### ✅ 2. Firebase Setup

- [ ] Have your Firebase service account JSON file ready
- [ ] Run the encoder script:
  ```bash
  python encode_firebase_credentials.py path/to/firebase-credentials.json
  ```
- [ ] Copy the base64 encoded output
- [ ] Keep it safe for adding to Vercel environment variables

### ✅ 3. Generate Secret Keys

Run these commands to generate secure keys:

```bash
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

Save these outputs - you'll need them for Vercel environment variables.

### ✅ 4. Verify Files Created

Make sure these files exist in your project:

- [ ] `vercel.json` (root directory)
- [ ] `api/index.py` (entry point)
- [ ] `requirements.txt` (root directory)
- [ ] `.vercelignore` (root directory)
- [ ] `VERCEL_DEPLOYMENT.md` (documentation)
- [ ] `FIREBASE_VERCEL_SETUP.md` (Firebase guide)

## Deployment Process

### ✅ 5. Install Vercel CLI

```bash
npm install -g vercel
```

### ✅ 6. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### ✅ 7. Initial Deployment (Preview)

From your project root:

```bash
vercel
```

This will:
- Ask if you want to link to existing project or create new (choose "create new")
- Ask for project name (e.g., "ashaassist-backend")
- Ask which directory is your project (press Enter for current directory)
- Deploy a preview version

**Don't deploy to production yet!** We need to add environment variables first.

### ✅ 8. Add Environment Variables

#### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add the following variables (one by one):

| Variable Name | Value | Source |
|--------------|-------|--------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | From MongoDB Atlas |
| `DATABASE_NAME` | `ashaassist` | Your database name |
| `SECRET_KEY` | Generated secure key | From step 3 |
| `JWT_SECRET_KEY` | Generated secure key | From step 3 |
| `FIREBASE_CREDENTIALS_JSON` | Base64 encoded string | From step 2 |
| `FLASK_ENV` | `production` | Static value |

For each variable:
- Click "Add New"
- Enter the name
- Enter the value
- Select all environments (Production, Preview, Development)
- Click "Save"

#### Via Vercel CLI (Alternative):

```bash
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted

vercel env add DATABASE_NAME
# Enter: ashaassist

vercel env add SECRET_KEY
# Paste your generated SECRET_KEY

vercel env add JWT_SECRET_KEY
# Paste your generated JWT_SECRET_KEY

vercel env add FIREBASE_CREDENTIALS_JSON
# Paste your base64 encoded Firebase credentials

vercel env add FLASK_ENV
# Enter: production
```

### ✅ 9. Production Deployment

Now deploy to production:

```bash
vercel --prod
```

This will deploy with all your environment variables.

### ✅ 10. Test Your Deployment

After deployment, you'll get a URL like: `https://your-project.vercel.app`

Test your endpoints:

```bash
# Test basic endpoint
curl https://your-project.vercel.app/api/health

# Test with specific route (if you have one)
curl https://your-project.vercel.app/api/auth/status
```

## Post-Deployment

### ✅ 11. Update Frontend Configuration

Update your frontend to point to the new Vercel backend:

In `frontend/.env`:
```env
REACT_APP_API_URL=https://your-project.vercel.app/api
```

### ✅ 12. Configure CORS

Make sure your backend CORS settings allow your frontend domain.

In your backend, CORS is already configured, but verify it allows your frontend URL.

### ✅ 13. Test All Features

- [ ] User authentication (login/register)
- [ ] Google Sign-In
- [ ] Database operations (CRUD)
- [ ] File uploads (if applicable)
- [ ] All API endpoints

### ✅ 14. Monitor Logs

Check Vercel logs for any errors:

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on the latest deployment
5. Click "Functions" tab to see logs

### ✅ 15. Set Up Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Wait for DNS propagation (can take up to 48 hours)

## Common Issues & Solutions

### ❌ Issue: "Module not found" error

**Solution:**
- Check that `requirements.txt` is in the root directory
- Verify all dependencies are listed
- Check `api/index.py` imports are correct

### ❌ Issue: Database connection fails

**Solution:**
- Verify MongoDB URI is correct
- Check MongoDB Atlas allows connections from 0.0.0.0/0
- Test connection string locally first
- Make sure password doesn't contain special characters (or URL encode them)

### ❌ Issue: Firebase initialization fails

**Solution:**
- Verify base64 encoding is correct
- Check environment variable name is exactly `FIREBASE_CREDENTIALS_JSON`
- Re-encode your Firebase credentials
- Check Vercel logs for specific error message

### ❌ Issue: Function timeout

**Solution:**
- Vercel free tier has 10s timeout limit
- Optimize slow database queries
- Use indexes in MongoDB
- Consider upgrading to Pro plan for 60s timeout

### ❌ Issue: File uploads not working

**Solution:**
- Remember Vercel uses `/tmp` directory (ephemeral)
- Files are deleted after function execution
- Consider using cloud storage (Firebase Storage, AWS S3, Cloudinary)
- Maximum `/tmp` size is 512MB

## Continuous Deployment

### ✅ 16. Connect Git Repository (Recommended)

1. Go to Vercel Dashboard > Your Project > Settings > Git
2. Connect your GitHub/GitLab/Bitbucket repository
3. Configure:
   - **Production Branch**: `main` (or `master`)
   - **Automatic deployments**: Enabled

Now every push to main = automatic production deployment! 🎉

### ✅ 17. Branch Previews

- Every push to non-main branches creates a preview deployment
- Perfect for testing before merging to production
- Get unique URL for each preview

## Security Checklist

- [ ] All secret keys are secure and randomly generated
- [ ] Environment variables are not committed to Git
- [ ] Firebase credentials are stored as base64 in Vercel (not in code)
- [ ] MongoDB connection uses strong password
- [ ] CORS is configured to only allow your frontend domain
- [ ] JWT tokens have appropriate expiration times
- [ ] HTTPS is enforced (Vercel does this automatically)

## Performance Optimization

- [ ] MongoDB indexes are created (check `backend/config/database.py`)
- [ ] CORS is configured properly (not allowing all origins in production)
- [ ] Large files use cloud storage, not local file system
- [ ] Database queries are optimized
- [ ] Consider using caching for frequently accessed data

## Monitoring & Maintenance

### Daily/Weekly Checks:

- [ ] Check Vercel analytics for traffic and errors
- [ ] Monitor MongoDB Atlas for performance issues
- [ ] Review Vercel function logs for errors
- [ ] Check Firebase usage (authentication, storage)

### Tools:

- **Vercel Dashboard**: Monitor deployments, functions, analytics
- **MongoDB Atlas**: Database performance, queries, indexes
- **Firebase Console**: Authentication stats, errors

## Rollback Plan

If something goes wrong:

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"
4. Previous working version is restored instantly

## Cost Estimates

### Free Tier Limits:

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited deployments
- 100GB-hrs function execution
- 10s max function duration

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared RAM
- Perfect for development/small apps

**Firebase Free Tier:**
- 50K daily active users (authentication)
- 10GB storage
- 1GB/day downloads

## Next Steps After Deployment

1. ✅ Set up monitoring and alerts
2. ✅ Configure backup strategy for MongoDB
3. ✅ Set up error tracking (e.g., Sentry)
4. ✅ Create API documentation
5. ✅ Set up automated testing
6. ✅ Configure CDN for static assets (if needed)
7. ✅ Plan scaling strategy

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Firebase Docs**: https://firebase.google.com/docs

## Final Checklist

- [ ] Backend deployed successfully to Vercel
- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Firebase authentication working
- [ ] All API endpoints tested
- [ ] Frontend connected to backend
- [ ] CORS configured correctly
- [ ] Logs are clean (no errors)
- [ ] Custom domain configured (optional)
- [ ] Git repository connected for continuous deployment
- [ ] Team members have access to Vercel project
- [ ] Documentation updated with deployment URLs

---

## 🎉 Congratulations!

Your AshaAssist backend is now live on Vercel!

**Your Backend URL**: `https://your-project.vercel.app`

Don't forget to update your frontend environment variables with this URL!
