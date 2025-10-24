# 🏗️ AshaAssist Deployment Architecture

## Overview

This document explains how AshaAssist is structured for deployment on Vercel (backend) and Render (frontend).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER / CLIENT                          │
│                     (Web Browser / Mobile)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS Requests
                             ▼
          ┌──────────────────────────────────────┐
          │     FRONTEND (Render.com)            │
          │                                      │
          │  • React + TypeScript                │
          │  • Tailwind CSS                      │
          │  • React Router                      │
          │  • Firebase Auth (Client)            │
          │                                      │
          │  URL: https://your-app.onrender.com  │
          └──────────────┬───────────────────────┘
                         │
                         │ API Calls
                         │ (CORS Enabled)
                         ▼
          ┌──────────────────────────────────────┐
          │     BACKEND (Vercel)                 │
          │                                      │
          │  ┌────────────────────────────────┐  │
          │  │   api/index.py (Entry Point)   │  │
          │  └──────────────┬─────────────────┘  │
          │                 │                     │
          │                 ▼                     │
          │  ┌────────────────────────────────┐  │
          │  │   backend/app.py (Flask App)   │  │
          │  │                                │  │
          │  │  • Flask Framework             │  │
          │  │  • JWT Authentication          │  │
          │  │  • RESTful APIs                │  │
          │  │  • Business Logic              │  │
          │  └──────────────┬─────────────────┘  │
          │                 │                     │
          │  URL: https://your-backend.vercel.app │
          └─────────────────┼─────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ MongoDB  │   │ Firebase │   │   /tmp   │
    │  Atlas   │   │  Admin   │   │  Storage │
    │          │   │   SDK    │   │ (Vercel) │
    │ Database │   │   Auth   │   │  Uploads │
    └──────────┘   └──────────┘   └──────────┘
```

---

## Component Details

### 1. Frontend (Render)

**Technology Stack:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Firebase Client SDK for authentication

**Responsibilities:**
- User interface rendering
- Client-side routing
- Form validation
- API consumption
- User authentication (client-side)
- Local state management

**Environment Variables:**
```env
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
```

**Deployment:**
- Platform: Render.com
- Build Command: `npm run build`
- Static site hosting
- Automatic HTTPS
- Custom domain support

---

### 2. Backend (Vercel)

**Technology Stack:**
- Flask 2.3.3 (Python web framework)
- Flask-JWT-Extended (authentication)
- Flask-CORS (cross-origin requests)
- PyMongo (MongoDB driver)
- Firebase Admin SDK (server-side auth)

**Architecture:**

```
api/index.py
    │
    ├─> imports backend/app.py
    │
    └─> creates Flask app instance
            │
            ├─> config/
            │   ├─> settings.py (configuration)
            │   ├─> database.py (MongoDB connection)
            │   └─> firebase.py (Firebase initialization)
            │
            ├─> middleware/
            │   └─> auth.py (JWT verification)
            │
            ├─> routes/
            │   ├─> auth.py (login, register)
            │   ├─> maternity.py (maternity endpoints)
            │   ├─> palliative.py (palliative endpoints)
            │   └─> ... (other route modules)
            │
            ├─> services/
            │   ├─> auth_service.py (business logic)
            │   ├─> maternity_service.py
            │   └─> ... (other services)
            │
            └─> utils/
                ├─> helpers.py (utility functions)
                └─> validators.py (input validation)
```

**Responsibilities:**
- API endpoints
- Business logic
- Database operations
- Authentication & authorization
- Data validation
- File uploads (temporary)

**Environment Variables:**
```env
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=ashaassist
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
FIREBASE_CREDENTIALS_JSON=base64-encoded-json
FLASK_ENV=production
```

**Deployment:**
- Platform: Vercel
- Runtime: Python 3.x
- Serverless functions
- Auto-scaling
- Global CDN

---

### 3. Database (MongoDB Atlas)

**Purpose:**
- Primary data storage
- Document-based NoSQL database

**Collections:**
- `users` - User accounts and profiles
- `maternity_records` - Maternity health records
- `palliative_records` - Palliative care records
- `visits` - Visit requests and schedules
- `vaccinations` - Vaccination records
- `supply_requests` - Supply distribution
- `blogs` - Health information posts
- `feedback` - User feedback
- ... (and more)

**Features:**
- Cloud-hosted (no server management)
- Automatic backups
- Scalable storage
- Geographic distribution
- SSL/TLS encryption

**Connection:**
```
Backend (Vercel) ──[MongoDB Driver]──> MongoDB Atlas
```

---

### 4. Authentication (Firebase)

**Purpose:**
- Google Sign-In integration
- Token verification
- User identity management

**Flow:**

```
1. User clicks "Sign in with Google" on Frontend
2. Frontend uses Firebase Client SDK
3. Firebase returns ID token
4. Frontend sends token to Backend
5. Backend verifies token with Firebase Admin SDK
6. Backend creates/finds user in MongoDB
7. Backend returns JWT token
8. Frontend stores JWT for subsequent requests
```

**Components:**
- Firebase Client SDK (Frontend)
- Firebase Admin SDK (Backend)
- Firebase Console (Management)

---

### 5. File Storage (Temporary)

**Current Setup:**
- Vercel: `/tmp` directory (ephemeral)
- Max size: 512MB
- Files deleted after function execution

**Recommended for Production:**
- Firebase Storage
- AWS S3
- Cloudinary
- Any cloud object storage

---

## Request Flow

### Example: User Login

```
1. User enters credentials on Frontend
   │
   ▼
2. Frontend sends POST to /api/auth/login
   │
   ▼
3. Request hits Vercel edge network
   │
   ▼
4. Vercel routes to api/index.py
   │
   ▼
5. Flask app receives request in routes/auth.py
   │
   ▼
6. auth_service.py validates credentials
   │
   ▼
7. MongoDB Atlas queries user collection
   │
   ▼
8. Password verified with bcrypt
   │
   ▼
9. JWT token generated
   │
   ▼
10. Response sent back through Vercel
    │
    ▼
11. Frontend receives token and stores it
    │
    ▼
12. Subsequent requests include JWT in headers
```

---

## Security Layers

### 1. Transport Security
- HTTPS everywhere (enforced)
- TLS 1.2+ encryption
- Certificate management (automatic)

### 2. Authentication
- JWT tokens (short expiration)
- Firebase ID token verification
- Bcrypt password hashing
- Secure session management

### 3. Authorization
- Role-based access control (RBAC)
- Middleware validation
- Endpoint protection with `@jwt_required`

### 4. Data Security
- MongoDB Atlas encryption at rest
- Environment variables for secrets
- No credentials in code
- Input validation and sanitization

### 5. Network Security
- CORS configuration
- Rate limiting (Vercel)
- DDoS protection (Vercel)
- IP whitelisting option (MongoDB)

---

## Scalability

### Frontend (Render)
- **Static Files**: Served from CDN
- **Scaling**: Automatic (CDN distribution)
- **Cost**: Based on bandwidth

### Backend (Vercel)
- **Serverless**: Auto-scales to demand
- **Cold Start**: ~1-2 seconds (first request)
- **Warm**: <100ms response time
- **Concurrent**: Unlimited (within plan limits)

### Database (MongoDB Atlas)
- **Free Tier**: 512MB storage
- **Scaling**: Vertical (upgrade cluster)
- **Horizontal**: Sharding available
- **Backups**: Automatic

---

## Cost Breakdown (Free Tiers)

### Vercel Free Tier
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Unlimited deployments
- ✅ HTTPS/SSL included
- ⚠️ 10s function timeout

### Render Free Tier
- ✅ Static site hosting
- ✅ Automatic deploys from Git
- ✅ HTTPS/SSL included
- ✅ Custom domains

### MongoDB Atlas Free Tier
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Basic backups
- ✅ Limited to 3 clusters

### Firebase Free Tier
- ✅ 10K verifications/month
- ✅ 50K daily active users
- ✅ 1GB storage
- ✅ 10GB/month downloads

**Total Monthly Cost for Small App: $0** 🎉

---

## Monitoring & Logging

### Frontend (Render)
- Build logs
- Deploy logs
- Static site analytics

### Backend (Vercel)
- Function logs (real-time)
- Analytics dashboard
- Error tracking
- Performance metrics

### Database (MongoDB Atlas)
- Query performance
- Index usage
- Storage metrics
- Connection stats

---

## Deployment Pipeline

### Manual Deployment

```bash
# Backend
vercel --prod

# Frontend
git push origin main  # (auto-deploys via Render)
```

### Continuous Deployment (Recommended)

```
Git Push (main branch)
    │
    ├─> Vercel (Backend)
    │   ├─> Install dependencies
    │   ├─> Run build
    │   ├─> Deploy functions
    │   └─> Update production
    │
    └─> Render (Frontend)
        ├─> Install dependencies
        ├─> Run build
        ├─> Deploy static files
        └─> Update production
```

---

## High Availability

### Redundancy
- **Vercel**: Multi-region deployment
- **Render**: CDN distribution
- **MongoDB Atlas**: Replica sets
- **Firebase**: Global infrastructure

### Failover
- Automatic failover (MongoDB)
- Edge caching (Vercel)
- CDN fallback (Render)

### Backup Strategy
- MongoDB: Continuous backups
- Code: Git repository
- Config: Environment variables (documented)

---

## Performance Optimization

### Frontend
- Code splitting (React lazy loading)
- Tree shaking (remove unused code)
- Minification and compression
- Image optimization
- CDN caching

### Backend
- Database indexes
- Query optimization
- Connection pooling
- Caching strategies
- Efficient data structures

### Network
- GZIP compression
- HTTP/2 support
- Edge caching
- Reduced payload sizes

---

## Development vs. Production

### Local Development

```
Frontend: localhost:3000
    │
    └─> Backend: localhost:5000
            │
            ├─> MongoDB: localhost:27017
            └─> Firebase: File-based credentials
```

### Production

```
Frontend: https://your-app.onrender.com
    │
    └─> Backend: https://your-backend.vercel.app
            │
            ├─> MongoDB Atlas: Cloud
            └─> Firebase: Environment variable credentials
```

---

## Future Enhancements

### Recommended Improvements

1. **Cloud Storage**
   - Replace `/tmp` with Firebase Storage or S3
   - Permanent file storage
   - Better performance

2. **Caching**
   - Redis for session storage
   - API response caching
   - Reduced database load

3. **CDN**
   - Static asset delivery
   - Faster global access
   - Reduced bandwidth costs

4. **Error Tracking**
   - Sentry integration
   - Error monitoring
   - Performance tracking

5. **API Documentation**
   - Swagger/OpenAPI
   - Interactive documentation
   - Client SDK generation

6. **Testing**
   - Unit tests (pytest)
   - Integration tests
   - E2E tests (Playwright/Cypress)
   - CI/CD pipeline

---

## Summary

✅ **Serverless Architecture**: No server management  
✅ **Auto-Scaling**: Handles traffic spikes automatically  
✅ **Global Distribution**: Fast worldwide access  
✅ **Cost-Effective**: Free tier for development  
✅ **Secure**: HTTPS, JWT, environment variables  
✅ **Easy Deployment**: Simple CLI commands  
✅ **High Availability**: Multi-region redundancy  
✅ **Developer Friendly**: Local + production parity  

---

**Last Updated**: 2025-10-24  
**Version**: 1.0
