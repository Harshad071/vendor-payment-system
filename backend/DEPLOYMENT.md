# Deployment Guide

Deploy the MSME Vendor Payment Tracking System to production platforms.

---

## Option 1: Railway.app (Recommended - Easiest)

### Step 1: Prepare GitHub Repository
```bash
git add .
git commit -m "Initial commit: MSME Vendor Payment Tracking System"
git push origin main
```

### Step 2: Connect to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js project

### Step 3: Configure Services
1. **MySQL Database Service**
   - Click "Add Service" → "Database" → "MySQL"
   - Railway creates automatic backups
   - Get connection string from service variables

2. **Backend Service**
   - In deploy settings:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Step 4: Set Environment Variables
In Railway dashboard, add variables to backend service:
```
DB_HOST=<railway-db-host>
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<railway-generated>
DB_NAME=vendor_payment_system
JWT_SECRET=<your-secure-key>
PORT=3000
NODE_ENV=production
```

### Step 5: Deploy
- Click "Deploy" button
- Railway automatically runs migrations (add to start script)
- Wait for build completion
- Copy the provided API URL

### Step 6: Run Migrations & Seed
Once deployed:
```bash
# Connect to Railway MySQL
mysql -h <railway-host> -u root -p<password> vendor_payment_system

# Run initial migration SQL manually, or:
# Add migration step to package.json start script
```

---

## Option 2: Render.com

### Step 1: Create Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Fill in details:
   - **Name:** `vendor-payment-api`
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Step 2: Add MySQL Database
1. Click "New +" → "MySQL"
2. Name: `vendor-payment-db`
3. Create service
4. Copy connection details

### Step 3: Configure Environment Variables
In Web Service settings, add:
```
DATABASE_URL=mysql://user:password@host:3306/vendor_payment_system
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Step 4: Deploy
- Click "Deploy"
- Render builds and deploys automatically
- Get API URL from service dashboard

### Step 5: Initialize Database
SSH into Render MySQL:
```bash
mysql -h render-mysql-host -u root -p < migration.sql
```

---

## Option 3: AWS (EC2 + RDS)

### Step 1: Setup RDS MySQL
1. AWS Console → RDS → Create Database
2. **Engine:** MySQL 8.0
3. **DB Instance Identifier:** `vendor-payment-db`
4. **Master Username:** `admin`
5. **Storage:** 20GB SSD
6. **Public Accessibility:** Yes (for now)

### Step 2: Create EC2 Instance
1. AWS Console → EC2 → Launch Instance
2. **AMI:** Ubuntu 22.04 LTS
3. **Instance Type:** t3.micro (free tier)
4. **Security Group:** Allow ports 22, 80, 443, 3000

### Step 3: SSH & Setup Node.js
```bash
ssh -i your-key.pem ubuntu@ec2-instance-ip

# Update packages
sudo apt update
sudo apt install -y nodejs npm

# Clone repository
git clone https://github.com/yourusername/vendor-payment-system
cd backend

# Install dependencies
npm install
npm run build
```

### Step 4: Configure Environment
```bash
nano .env
# Add RDS endpoint
DB_HOST=<rds-endpoint>.rds.amazonaws.com
DB_USERNAME=admin
DB_PASSWORD=<your-password>
DB_NAME=vendor_payment_system
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Step 5: Run Application
```bash
npm run migration:run
npm start

# For background running, use PM2:
sudo npm install -g pm2
pm2 start npm -- start
pm2 startup
pm2 save
```

### Step 6: Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## Option 4: Google Cloud Run

### Step 1: Create Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create CloudSQL Instance
```bash
gcloud sql instances create vendor-payment-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy vendor-payment-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=<cloudsql-ip>,DB_USERNAME=root,DB_PASSWORD=<pass>,DB_NAME=vendor_payment_system
```

---

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] Seed data loaded (or load sample data)
- [ ] API health check responding: `/health`
- [ ] Swagger docs accessible: `/api/docs`
- [ ] Login working: `POST /auth/login`
- [ ] SSL/HTTPS configured
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error monitoring setup (optional: Sentry)
- [ ] API rate limiting configured (optional)

---

## Health Checks

### Test API Availability
```bash
curl https://your-api-domain.com/health
```

### Expected Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "MSME Vendor Payment Tracking System API is running"
}
```

---

## Database Backups

### Railway
- Automatic daily backups
- 30-day retention
- Dashboard: Data tab

### Render
- Daily backups included
- Accessible from dashboard

### AWS RDS
```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier vendor-payment-db \
  --db-snapshot-identifier vendor-backup-2024-01-15
```

### Google Cloud SQL
- Automatic backups enabled
- Configure retention period in Console

---

## Monitoring & Logging

### Railway
- Logs visible in dashboard
- Set up alerts for errors

### Render
- Logs tab in service dashboard
- Email notifications

### AWS CloudWatch
```bash
# View logs
aws logs tail /aws/lambda/vendor-payment-api --follow
```

### Manual Logging
```bash
# SSH into server
ssh user@host
tail -f ~/.pm2/logs/npm-error.log
```

---

## Domain & SSL

### Railway
- Automatic SSL via Railway domain
- Or point custom domain:
  1. Add custom domain in Railway
  2. Update DNS CNAME records
  3. Railway auto-generates SSL cert (Let's Encrypt)

### Render
- Free SSL included
- Point domain in DNS settings

### AWS Route 53
1. Create hosted zone
2. Add A record pointing to EC2 public IP
3. Use AWS Certificate Manager for SSL

### Google Cloud
- Cloud DNS for domain
- Cloud Armor for SSL

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run test
      - name: Deploy
        run: |
          # Your deployment command
```

---

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED
```
→ Check database host/port in environment variables

### JWT Token Issues
```
Error: JWT secret not found
```
→ Ensure JWT_SECRET is set in production

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
→ Change PORT in environment or use PM2

### Migration Failed
```
Error: Migration not found
```
→ Ensure migrations folder is included in build
→ Run: `npm run migration:run`

---

## Performance Optimization

### Database
- Add indexes (already included in migrations)
- Use connection pooling
- Archive old payments data

### Application
- Enable gzip compression (Nginx)
- Use CDN for static assets
- Set up API rate limiting
- Cache frequently accessed data

### Example Nginx Compression
```nginx
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;
```

---

## Security

### Production Checklist
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Implement rate limiting on auth endpoints
- [ ] Use HTTPS only
- [ ] Add CORS restrictions
- [ ] Set database firewall rules
- [ ] Enable database encryption at rest
- [ ] Regular security updates
- [ ] Add admin password authentication
- [ ] Implement request logging
- [ ] Setup error monitoring (Sentry)

### Example .env (Production)
```
DB_HOST=prod-db-host.rds.amazonaws.com
DB_USERNAME=admin
DB_PASSWORD=VerySecurePassword123!@#
JWT_SECRET=jZxWbY3nP9qR2mL7kV4hJ8sT6uI1xL5p
NODE_ENV=production
```

---

## Support

For deployment issues:
1. Check service logs
2. Review error messages
3. Verify environment variables
4. Test database connectivity
5. Contact cloud provider support

Good luck with your deployment!
