# Render Environment Variables Setup

## 🚀 Step-by-Step Guide

### Step 1: Create PostgreSQL Database (if not done)
1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `schedula-db`
   - **Database Name**: `schedula`
   - **User**: `schedula_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free

### Step 2: Get Database Connection Details
After creating the PostgreSQL service:
1. Go to your PostgreSQL service in Render
2. Click on "Connect" tab
3. Copy the **Internal Database URL** (starts with `postgresql://`)
4. It will look like: `postgresql://schedula_user:password@dpg-xxxxx-a.oregon-postgres.render.com/schedula`

### Step 3: Configure Web Service Environment Variables
1. Go to your Web Service in Render Dashboard
2. Click "Environment" tab
3. Add these environment variables one by one:

## 📋 Environment Variables to Add

### Required Variables:
```
NODE_ENV = production
PORT = 10000
DATABASE_URL = [paste your PostgreSQL Internal Database URL here]
JWT_SECRET = e53783304a7e182deeada7ec3cb6b4127c74cca702ee399e6f4d8749e1a9f9aa98f03c8de7f79c2e680237ec72d053aa77378cc09e4a3509d78a7149a04a27bc
JWT_EXPIRES_IN = 24h
```

### Optional Variables:
```
LOG_LEVEL = info
```

## 🔧 How to Add Each Variable in Render

For each environment variable:
1. Click "Add Environment Variable"
2. **Key**: Enter the variable name (e.g., `NODE_ENV`)
3. **Value**: Enter the variable value (e.g., `production`)
4. Click "Save Changes"

## ⚠️ Important Notes

### Database URL Format:
- Use the **Internal Database URL** from your Render PostgreSQL service
- It should start with `postgresql://`
- Example: `postgresql://user:pass@host.render.com:5432/dbname`

### JWT Secret:
- The JWT_SECRET provided is secure and ready for production
- Keep it exactly as shown (128 characters long)

### Port:
- Always use `PORT = 10000` for Render web services
- Don't change this value

## 🧪 Testing After Setup

After adding all environment variables:
1. Render will automatically redeploy your service
2. Check the deployment logs for any errors
3. Test your health endpoint: `https://your-app.onrender.com/health/simple`
4. Test a simple API endpoint to verify everything works

## 🔍 Troubleshooting

### If deployment fails:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure DATABASE_URL is the Internal URL from your PostgreSQL service
4. Make sure JWT_SECRET is exactly as provided (no extra spaces)

### If database connection fails:
1. Verify your PostgreSQL service is running
2. Check that DATABASE_URL is correct
3. Ensure both services are in the same region
4. Try using individual database variables instead of DATABASE_URL

Your environment variables are now ready for Render deployment! 🎉
