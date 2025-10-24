# Firebase Credentials Setup for Vercel

## Why Base64 Encoding?

Vercel doesn't support uploading files directly. Since Firebase credentials are in a JSON file, we need to convert them to a format that can be stored as an environment variable.

## Step-by-Step Guide

### Step 1: Locate Your Firebase Credentials JSON File

Your Firebase credentials file should look something like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### Step 2: Convert to Base64

#### Option A: Using Python (Recommended)

Create a file `encode_firebase.py` in your project root:

```python
import base64
import json

# Read your Firebase credentials file
with open('path/to/your/firebase-credentials.json', 'r') as f:
    credentials = json.load(f)

# Convert to JSON string
json_str = json.dumps(credentials)

# Encode to base64
base64_encoded = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')

print("Base64 Encoded Credentials:")
print(base64_encoded)
print("\n\nCopy the above string and add it as FIREBASE_CREDENTIALS_JSON environment variable in Vercel")
```

Run it:
```bash
python encode_firebase.py
```

#### Option B: Using Node.js

Create a file `encode_firebase.js`:

```javascript
const fs = require('fs');

// Read your Firebase credentials file
const credentials = JSON.parse(
  fs.readFileSync('path/to/your/firebase-credentials.json', 'utf8')
);

// Convert to JSON string
const jsonStr = JSON.stringify(credentials);

// Encode to base64
const base64Encoded = Buffer.from(jsonStr).toString('base64');

console.log('Base64 Encoded Credentials:');
console.log(base64Encoded);
console.log('\n\nCopy the above string and add it as FIREBASE_CREDENTIALS_JSON environment variable in Vercel');
```

Run it:
```bash
node encode_firebase.js
```

#### Option C: Using Online Tool

1. Go to https://www.base64encode.org/
2. Copy the entire content of your Firebase JSON file
3. Paste it in the input box
4. Click "Encode"
5. Copy the encoded result

#### Option D: Using PowerShell (Windows)

```powershell
# Read the Firebase credentials file
$json = Get-Content -Path "path\to\your\firebase-credentials.json" -Raw

# Convert to Base64
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)

# Output the result
Write-Host "Base64 Encoded Credentials:"
Write-Host $base64
Write-Host "`n`nCopy the above string and add it as FIREBASE_CREDENTIALS_JSON environment variable in Vercel"
```

### Step 3: Add to Vercel Environment Variables

#### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add new variable:
   - **Name**: `FIREBASE_CREDENTIALS_JSON`
   - **Value**: Paste the base64 encoded string
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

#### Via Vercel CLI:

```bash
# This will prompt you to paste the value
vercel env add FIREBASE_CREDENTIALS_JSON production

# Paste your base64 encoded string when prompted
```

### Step 4: Redeploy Your Application

After adding the environment variable, redeploy:

```bash
vercel --prod
```

## Alternative Method: Direct JSON (Not Recommended)

If you prefer not to use base64, you can also store the JSON directly:

1. Minify your JSON (remove all line breaks and extra spaces)
2. Escape all quotes properly
3. Add as `FIREBASE_CREDENTIALS_JSON` environment variable

However, this is **NOT recommended** because:
- Hard to manage with line breaks in private keys
- More prone to errors
- Base64 is cleaner and more reliable

## Verification

After deployment, check your Vercel function logs to see if Firebase initializes correctly:

1. Go to your Vercel project
2. Click on **Deployments**
3. Select the latest deployment
4. Click on **Functions**
5. Check the logs for: `"Firebase Admin SDK initialized successfully from environment variable!"`

## Troubleshooting

### Error: "Firebase credentials not found"

- Make sure the environment variable name is exactly `FIREBASE_CREDENTIALS_JSON`
- Check that you added it to the correct environment (Production)
- Verify the base64 string is complete (no truncation)

### Error: "Invalid JSON"

- Your base64 encoding might be incorrect
- Try re-encoding your credentials
- Ensure the original JSON file is valid

### Error: "Invalid private key"

- The private key might have lost its line breaks during encoding
- Make sure you're using base64 encoding, not URL encoding
- Verify the original Firebase JSON has the correct private key format

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit** Firebase credentials to Git
2. **Never share** the base64 encoded credentials publicly
3. **Rotate credentials** if they're accidentally exposed
4. **Use different credentials** for development and production
5. **Limit permissions** on your Firebase service account to only what's needed

## Testing Locally with Environment Variable

To test the environment variable method locally:

1. Add to your `.env` file:
   ```
   FIREBASE_CREDENTIALS_JSON=your_base64_encoded_string_here
   ```

2. Or use the file path method (already configured):
   ```
   FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
   ```

The updated `firebase.py` will try the environment variable first, then fall back to the file path.

## Summary

✅ Your backend now supports **both** methods:
- **Environment Variable** (FIREBASE_CREDENTIALS_JSON) - for Vercel
- **File Path** (FIREBASE_CREDENTIALS_PATH) - for local development

This makes it easy to develop locally and deploy to Vercel without changing code!
