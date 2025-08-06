# Dual Repository Management & Deployment Setup

This guide helps you manage code between your organization's private repository and your personal repository, with automatic deployment to Render.

## Current Setup

- **Organization Repo**: `PearlThoughtsInternship/Schedula_Backend_Battalion_Backend`
  - Branch: `intern/aditay-main`
  - Remote name: `org`

- **Personal Repo**: `Aditay7/Nest-Js-Project`
  - Branch: `main`
  - Remote name: `personal`

## Quick Start

### 1. Check Current Status
```bash
# On Windows (PowerShell)
.\scripts\sync-repos.ps1 status

# On Linux/Mac
bash scripts/sync-repos.sh status
```

### 2. Sync Organization → Personal
```bash
# Windows
.\scripts\sync-repos.ps1 o2p

# Linux/Mac
bash scripts/sync-repos.sh o2p
```

### 3. Setup Deployment Branch
```bash
# Windows
.\scripts\sync-repos.ps1 deploy

# Linux/Mac
bash scripts/sync-repos.sh deploy
```

## Detailed Workflow

### Manual Syncing

#### Sync from Organization to Personal
This is the most common operation - getting latest changes from the org repo to your personal repo:

```bash
# Fetch latest from org
git fetch org

# Switch to intern/aditay-main
git checkout intern/aditay-main

# Pull latest changes
git pull org intern/aditay-main

# Push to personal repo main branch
git push personal intern/aditay-main:main
```

#### Sync from Personal to Organization
When you make changes in your personal repo and want to push them to the org:

```bash
# Fetch from personal
git fetch personal

# Switch to intern/aditay-main
git checkout intern/aditay-main

# Merge changes from personal main
git merge personal/main --no-edit

# Push to org
git push org intern/aditay-main
```

### Automatic Syncing with GitHub Actions

The GitHub Actions workflow (`.github/workflows/sync-and-deploy.yml`) automatically:

1. **Triggers on push** to `intern/aditay-main` in org repo
2. **Syncs changes** to your personal repo
3. **Creates/updates deployment branch** for Render
4. **Triggers Render deployment** (if configured)

#### Setup GitHub Actions

1. **In your personal repository**, add these secrets:
   ```
   PERSONAL_REPO_TOKEN: Your GitHub Personal Access Token
   RENDER_DEPLOY_HOOK: Your Render deploy hook URL (optional)
   ```

2. **Create Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `repo` permissions
   - Add as `PERSONAL_REPO_TOKEN` secret

3. **Get Render Deploy Hook** (optional):
   - In Render dashboard → Your service → Settings
   - Copy the deploy hook URL
   - Add as `RENDER_DEPLOY_HOOK` secret

## Render Deployment Setup

### Option 1: Deploy from Personal Repo (Recommended)

1. **Connect Render to your personal repository**:
   - Service: `Aditay7/Nest-Js-Project`
   - Branch: `deploy` (created by the sync script)

2. **Configure Build Settings**:
   ```
   Build Command: npm install
   Start Command: npm run start:prod
   ```

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   # Add your database and other environment variables
   ```

### Option 2: Manual Deployment Trigger

If you prefer manual control, you can trigger deployments using the Render API:

```bash
# Trigger deployment manually
curl -X POST "YOUR_RENDER_DEPLOY_HOOK_URL"
```

## Branch Strategy

```
Organization Repo (Private)
├── main (protected)
├── intern/aditay-main (your work branch)
└── other intern branches...

Personal Repo (Public)
├── main (synced from org/intern/aditay-main)
├── deploy (deployment branch for Render)
└── feature branches (your experiments)
```

## Common Workflows

### Daily Development Workflow

1. **Start of day** - Sync latest changes:
   ```bash
   .\scripts\sync-repos.ps1 o2p
   ```

2. **Work on features** in `intern/aditay-main`

3. **Push to org** when ready:
   ```bash
   git push org intern/aditay-main
   ```

4. **Auto-sync** happens via GitHub Actions

### When Org Repo Gets Updated

The GitHub Actions workflow automatically syncs when the org repo is updated, but you can also manually sync:

```bash
# Check what's different
.\scripts\sync-repos.ps1 status

# Sync if needed
.\scripts\sync-repos.ps1 o2p
```

### Emergency Manual Sync

If GitHub Actions fails or you need immediate sync:

```bash
# Full bidirectional sync
.\scripts\sync-repos.ps1 sync

# Update deployment
.\scripts\sync-repos.ps1 deploy
```

## Troubleshooting

### Merge Conflicts

If you get merge conflicts during sync:

1. **Resolve conflicts manually**:
   ```bash
   git status
   # Edit conflicted files
   git add .
   git commit -m "Resolve merge conflicts"
   ```

2. **Continue sync**:
   ```bash
   .\scripts\sync-repos.ps1 o2p
   ```

### Out of Sync Repositories

If repos get out of sync:

1. **Check status**:
   ```bash
   .\scripts\sync-repos.ps1 status
   ```

2. **Force sync** (be careful):
   ```bash
   git checkout intern/aditay-main
   git reset --hard org/intern/aditay-main
   git push personal intern/aditay-main:main --force
   ```

### GitHub Actions Not Working

1. **Check secrets** are properly set
2. **Verify token permissions**
3. **Check workflow logs** in GitHub Actions tab
4. **Manual fallback**:
   ```bash
   .\scripts\sync-repos.ps1 o2p
   .\scripts\sync-repos.ps1 deploy
   ```

## Security Considerations

- **Never commit sensitive data** to the personal repo (it might be public)
- **Use environment variables** for secrets in Render
- **Review changes** before syncing to personal repo
- **Keep personal access tokens secure**

## Monitoring

- **GitHub Actions**: Check the Actions tab in your personal repo
- **Render Deployments**: Monitor in Render dashboard
- **Git Status**: Use the status command regularly

```bash
# Quick health check
.\scripts\sync-repos.ps1 status
```

This setup ensures your personal repository stays in sync with the organization's work while maintaining automatic deployment to Render!
