# Deploying to Render.com

Render.com is another excellent option for deploying Node.js applications. Follow these steps:

## Step 1: Prepare Repository

1. Create a GitHub repository with your backend code
2. Push the entire backend folder to GitHub

## Step 2: Create Render Account

1. Visit https://render.com
2. Sign up with GitHub (recommended)

## Step 3: Create New Web Service

1. Click "New +" → "Web Service"
2. Select "Build and deploy from a Git repository"
3. Connect your GitHub repository
4. Select the repository

## Step 4: Configure Web Service

Fill in the following:

- **Name**: `vendor-payment-api`
- **Environment**: `Node`
- **Region**: Select closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Instance Type**: `Free` (or `Standard` for production)

## Step 5: Add MySQL Database

1. Click "New +" → "MySQL"
2. Fill in database details:
   - **Name**: `vendor-db`
   - **Plan**: `Free` (for testing) or `Standard` (for production)
3. Create the database

After MySQL is created, Render will show you the connection string and credentials.

## Step 6: Add Environment Variables

In your Web Service settings, go to **Environment** and add:

```
DB_TYPE=mysql
DB_HOST=<mysql_host_from_render>
DB_PORT=3306
DB_USERNAME=<mysql_user>
DB_PASSWORD=<mysql_password>
DB_NAME=vendor_payment_system
JWT_SECRET=<generate_strong_random_string>
PORT=3000
NODE_ENV=production
```

## Step 7: Deploy

Click "Create Web Service". Render will start building and deploying.

Monitor the build in the **Logs** tab.

## Step 8: Run Database Migrations

Once deployed:

1. Go to your Web Service
2. Click "Shell" to open a terminal
3. Run:
   ```bash
   cd backend
   npm run migration:run
   npm run seed
   ```

## Step 9: Access Your API

- Base URL: `https://vendor-payment-api.onrender.com`
- API Docs: `https://vendor-payment-api.onrender.com/api/docs`
- Login: admin / admin123

## Render Native Environment Variables

Render automatically provides these in MySQL service:
- `RENDER` environment variable set to `true`
- Access the MySQL connection string from the MySQL dashboard

## Keep Services Running

Important: On Render's free tier, services spin down after 15 minutes of inactivity.

To keep your service always running:
1. Upgrade to a paid plan, OR
2. Use a free uptime monitor like https://uptime.robot.com to ping your API every 5 minutes

## Deployment Updates

1. Push changes to GitHub
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Monitor the deployment in the **Logs** tab

## Useful Render Links

- Dashboard: https://dashboard.render.com
- MySQL Connection: View in your MySQL service details
- Logs: Available in your Web Service dashboard

---

**Troubleshooting:**

If build fails:
1. Check build logs carefully
2. Ensure `package.json` exists in backend folder
3. Verify all dependencies are listed

If migrations fail:
1. Check database credentials
2. Ensure MySQL service is running
3. Check database has correct name
