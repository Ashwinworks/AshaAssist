# API Directory

This directory contains the entry point for Vercel serverless deployment.

## File: `index.py`

This is the **main entry point** that Vercel uses to run your Flask application as a serverless function.

### What it does:

1. Adds the backend directory to Python path
2. Imports the Flask app from `backend/app.py`
3. Creates the app instance in production mode
4. Exports the app for Vercel to use

### Important Notes:

- ⚠️ **Do not modify** unless you know what you're doing
- ✅ This file is specifically for Vercel deployment
- ✅ Local development still uses `backend/app.py` directly
- ✅ All your route handlers and logic stay in the `backend/` directory

## How Vercel Uses This:

1. Vercel reads `vercel.json` configuration
2. Finds `api/index.py` as the entry point
3. Installs dependencies from `requirements.txt`
4. Runs this file as a serverless function
5. Routes all requests through your Flask app

## Local Development vs. Vercel:

| Environment | Entry Point | Command |
|------------|-------------|---------|
| **Local** | `backend/app.py` | `python backend/app.py` or `npm run server` |
| **Vercel** | `api/index.py` | Automatic (handled by Vercel) |

## Need Help?

See the main deployment guides in the project root:
- [`QUICK_START_VERCEL.md`](../QUICK_START_VERCEL.md) - Quick deployment guide
- [`VERCEL_DEPLOYMENT.md`](../VERCEL_DEPLOYMENT.md) - Detailed documentation
- [`VERCEL_SETUP_SUMMARY.md`](../VERCEL_SETUP_SUMMARY.md) - Overview of all changes
