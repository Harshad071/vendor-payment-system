# Deploying to Railway.app

Railway.app is the easiest platform to deploy this NestJS backend. Follow these steps:

## Step 1: Prepare Your Repository

1. Create a GitHub repository with your backend code
2. Push the `/backend` folder to GitHub (entire backend folder)

## Step 2: Create Railway Account

1. Visit https://railway.app
2. Sign up with GitHub (recommended for easy deployment)
3. Go to your Railway dashboard

## Step 3: Create New Project

1. Click "New Project"
2. Select "GitHub Repo"
3. Connect your GitHub repository
4. Select the repository containing the backend code

## Step 4: Configure Build Settings

Railway should auto-detect this is a Node.js project. If not:

1. Go to **Settings** → **Build**
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Set **Root Directory**: `backend` (if backend is in subdirectory)

## Step 5: Add Database - MySQL

1. In your Railway project, click **New Service**
2. Select **MySQL**
3. Railway will auto-generate credentials

The MySQL service will set the following environment variables automatically:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQL_URL` (full connection string)

## Step 6: Configure Environment Variables

In Railway, go to **Variables** and add:

```
DB_TYPE=mysql
DB_HOST=$MYSQLHOST
DB_PORT=$MYSQLPORT
DB_USERNAME=$MYSQLUSER
DB_PASSWORD=$MYSQLPASSWORD
DB_NAME=vendor_payment_system
JWT_SECRET=generate_a_strong_random_string_here
PORT=3000
NODE_ENV=production
```

**For JWT_SECRET**, generate a strong random string:
- Use an online generator or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Step 7: Run Database Migrations

After deployment:

1. Connect to the deployment shell via Railway dashboard
2. Run: `npm run migration:run`
3. Run: `npm run seed` (to load sample data)

## Step 8: Access Your API

Your API will be available at:
- Base URL: `https://your-project-url.railway.app`
- API Docs: `https://your-project-url.railway.app/api/docs`

## Default Login Credentials

After seeding:
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Build fails with "Cannot find module"

- Make sure all dependencies are listed in `package.json`
- Check that the build command runs successfully locally first

### Database connection error

- Verify MySQL service is running in Railway
- Check environment variable names match exactly
- Ensure DATABASE_URL or individual DB_* variables are set

### API not responding

- Check logs: Go to project → Logs
- Verify port 3000 is exposed
- Check that the application started without errors

## Monitoring

1. Go to Railway dashboard
2. Click on your service
3. View **Logs** for real-time application logs
4. View **Metrics** for CPU/Memory usage

## Updating Your Deployment

Push new changes to your GitHub repository, and Railway will automatically redeploy!

---

**Example Railway Logs (successful deployment):**
```
Application running on http://localhost:3000
API Documentation: http://localhost:3000/api/docs
```
