# Environment Variables Setup Guide

## 🔧 Development Environment (.env)

Your local `.env` file has been updated with proper configuration for development.

## 🚀 Production Environment (Render)

### Required Environment Variables for Render:

```env
# Application Configuration
NODE_ENV=production
PORT=10000

# Database Configuration (Option 1 - Recommended)
DATABASE_URL=postgresql://username:password@host:port/database

# Database Configuration (Option 2 - Individual Variables)
DATABASE_HOST=your-render-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-db-username
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-database-name

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h

# Logging (Optional)
LOG_LEVEL=info
```

## 🔐 Generate Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Example output: `a1b2c3d4e5f6...` (use this as your JWT_SECRET)

## 📋 Render Setup Steps

### 1. Create PostgreSQL Database
1. In Render Dashboard → "New +" → "PostgreSQL"
2. Name: `schedula-db`
3. Database Name: `schedula`
4. User: `schedula_user`
5. Plan: Free (for development)

### 2. Get Database Connection Details
After creating the database, you'll get:
- **Internal Database URL**: Use this for DATABASE_URL
- **External Database URL**: For external connections
- Individual connection details (host, port, username, password, database)

### 3. Configure Web Service Environment Variables
In your Render web service settings, add these environment variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<copy-from-your-render-postgresql-service>
JWT_SECRET=<generate-using-command-above>
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
```

## 🔄 Environment Variable Priority

Your code checks environment variables in this order:

### Database:
1. `DATABASE_URL` (if provided, uses this)
2. Individual variables: `DATABASE_HOST`, `DATABASE_PORT`, etc.
3. Fallback to old naming: `DB_HOST`, `DB_PORT`, etc.
4. Default values: `localhost`, `5432`, etc.

### JWT:
1. `JWT_SECRET` (required for production)
2. Fallback: `'default_jwt_secret'` (not secure for production)

## ⚠️ Security Notes

### Development:
- ✅ Keep `.env` file in `.gitignore`
- ✅ Use `.env.example` for sharing configuration structure
- ✅ Use weak passwords for local development (already set)

### Production:
- 🔒 Use strong, unique JWT secret (64+ characters)
- 🔒 Use Render's managed PostgreSQL (automatic backups, security)
- 🔒 Never commit production secrets to git
- 🔒 Use environment variables in Render dashboard

## 🧪 Testing Environment Variables

### Test locally:
```bash
# Check if environment variables are loaded
npm run start:dev

# Check health endpoint
curl http://localhost:3000/health/simple
```

### Test on Render:
```bash
# Check health endpoint (replace with your Render URL)
curl https://your-app.onrender.com/health/simple
```

## 🔍 Troubleshooting

### Database Connection Issues:
1. **Check DATABASE_URL format**: `postgresql://username:password@host:port/database`
2. **Verify database is running**: Check Render PostgreSQL service status
3. **Check SSL settings**: Production uses SSL, development doesn't

### JWT Issues:
1. **Verify JWT_SECRET is set**: Should be long and secure
2. **Check token expiration**: Default is 24h
3. **Verify secret consistency**: Same secret must be used for signing and verifying

### Port Issues:
1. **Render requires PORT=10000**: Don't change this
2. **Local development uses PORT=3000**: Can be changed in .env

Your environment is now properly configured for both development and production! 🎉
