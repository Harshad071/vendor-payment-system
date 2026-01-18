# Quick Start Deployment Guide

Deploy your MSME Vendor Payment Tracking System backend in 10 minutes!

## Option 1: Railway.app (RECOMMENDED - Easiest)

### Prerequisites
- GitHub account with your backend code pushed
- No credit card for free tier (requires verification)

### Steps
1. Go to https://railway.app
2. Click "New Project" → "GitHub Repo"
3. Select your repository
4. Add MySQL service (click "New Service" → "MySQL")
5. Go to "Variables" tab and set:
   ```
   DB_HOST=$MYSQLHOST
   DB_PORT=$MYSQLPORT
   DB_USERNAME=$MYSQLUSER
   DB_PASSWORD=$MYSQLPASSWORD
   DB_NAME=vendor_payment_system
   JWT_SECRET=your_random_secret_here
   NODE_ENV=production
   ```
6. Wait for deployment to complete
7. Visit your deployment URL and go to `/api/docs` to test

**Time to deploy:** 5 minutes

---

## Option 2: Render.com

### Prerequisites
- GitHub account with backend code
- Free plan available (with some limitations)

### Steps
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Set build command: `cd backend && npm install && npm run build`
5. Set start command: `cd backend && npm start`
6. Create MySQL database (click "New +" → "MySQL")
7. Add environment variables with your MySQL credentials
8. Click "Create Web Service" and wait for deployment

**Time to deploy:** 10 minutes

---

## Testing Your Deployment

Once deployed, test these endpoints:

### 1. Health Check
```bash
curl https://your-deployment-url/health
```

### 2. API Documentation
Visit: `https://your-deployment-url/api/docs`

### 3. Login (Get JWT Token)
```bash
curl -X POST https://your-deployment-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response will include `access_token` - use this for authenticated requests.

### 4. List Vendors
```bash
curl https://your-deployment-url/vendors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Database Initialization

After deployment:

1. Open your deployment shell:
   - Railway: Click service → "Console"
   - Render: Click service → "Shell"

2. Run migrations:
   ```bash
   npm run migration:run
   ```

3. Seed sample data:
   ```bash
   npm run seed
   ```

---

## Key Endpoints to Test

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/docs` | GET | Swagger documentation |
| `/auth/login` | POST | Get JWT token |
| `/vendors` | GET | List all vendors |
| `/purchase-orders` | GET | List purchase orders |
| `/payments` | GET | List payments |
| `/analytics/outstanding` | GET | Outstanding payments |
| `/analytics/aging` | GET | Payment aging report |
| `/analytics/dashboard` | GET | Dashboard summary |

---

## Troubleshooting

### Build fails?
1. Check logs in deployment dashboard
2. Ensure `package.json` exists
3. Verify Node version is 18+

### Database not connected?
1. Check MySQL service is running
2. Verify environment variables are set correctly
3. Check database credentials

### API returning 500 errors?
1. View application logs in deployment dashboard
2. Check that migrations have been run
3. Verify JWT_SECRET is set

### Need help?
Check the detailed guides:
- Railway: `DEPLOY_RAILWAY.md`
- Render: `DEPLOY_RENDER.md`
- Full docs: `DEPLOYMENT.md`

---

## Important Security Notes

1. **Change JWT_SECRET**: Generate a strong random string (minimum 32 characters)
2. **Use HTTPS**: Always use HTTPS in production (Railway/Render do this automatically)
3. **Update admin password**: After deployment, change the default admin password
4. **Enable CORS**: Configure CORS_ORIGIN for your frontend domain
5. **Monitor logs**: Regularly check application logs for errors

---

**You're all set! Your backend API is now live and ready to serve your frontend application.**
