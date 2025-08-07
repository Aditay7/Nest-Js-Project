# Dual Repository Sync Script for Windows PowerShell
# Syncs between org/intern/aditay-main and personal/main

param(
    [Parameter(Position=0)]
    [ValidateSet("org-to-personal", "o2p", "personal-to-org", "p2o", "both", "sync", "status", "check", "deploy", "setup-deploy")]
    [string]$Action = "status"
)

# Configuration
$ORG_BRANCH = "intern/aditay-main"
$PERSONAL_BRANCH = "main"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Error "Not in a git repository!"
    exit 1
}

function Sync-OrgToPersonal {
    Write-Status "Syncing from org/$ORG_BRANCH to personal/$PERSONAL_BRANCH..."
    
    # Fetch latest from org
    Write-Status "Fetching latest changes from organization repo..."
    git fetch org
    
    # Switch to org branch if not already there
    $currentBranch = git branch --show-current
    if ($currentBranch -ne $ORG_BRANCH) {
        Write-Status "Switching to $ORG_BRANCH..."
        git checkout $ORG_BRANCH
    }
    
    # Pull latest changes from org
    Write-Status "Pulling latest changes from org/$ORG_BRANCH..."
    git pull org $ORG_BRANCH
    
    # Push to personal repo main branch
    Write-Status "Pushing changes to personal/$PERSONAL_BRANCH..."
    git push personal "${ORG_BRANCH}:${PERSONAL_BRANCH}"
    
    Write-Success "Successfully synced org/$ORG_BRANCH → personal/$PERSONAL_BRANCH"
}

function Sync-PersonalToOrg {
    Write-Status "Syncing from personal/$PERSONAL_BRANCH to org/$ORG_BRANCH..."
    
    # Fetch latest from personal
    Write-Status "Fetching latest changes from personal repo..."
    git fetch personal
    
    # Switch to org branch if not already there
    $currentBranch = git branch --show-current
    if ($currentBranch -ne $ORG_BRANCH) {
        Write-Status "Switching to $ORG_BRANCH..."
        git checkout $ORG_BRANCH
    }
    
    # Merge changes from personal main
    Write-Status "Merging changes from personal/$PERSONAL_BRANCH..."
    git merge "personal/$PERSONAL_BRANCH" --no-edit
    
    # Push to org repo
    Write-Status "Pushing changes to org/$ORG_BRANCH..."
    git push org $ORG_BRANCH
    
    Write-Success "Successfully synced personal/$PERSONAL_BRANCH → org/$ORG_BRANCH"
}

function Sync-Both {
    Write-Status "Performing bidirectional sync..."
    
    # Fetch from both remotes
    Write-Status "Fetching from both repositories..."
    git fetch org
    git fetch personal
    
    # Switch to org branch
    $currentBranch = git branch --show-current
    if ($currentBranch -ne $ORG_BRANCH) {
        Write-Status "Switching to $ORG_BRANCH..."
        git checkout $ORG_BRANCH
    }
    
    # Check if there are conflicts
    try {
        $orgCommit = git rev-parse "org/$ORG_BRANCH" 2>$null
        $personalCommit = git rev-parse "personal/$PERSONAL_BRANCH" 2>$null
        $localCommit = git rev-parse HEAD
        
        if ($orgCommit -ne $personalCommit -and $orgCommit -and $personalCommit) {
            Write-Warning "Repositories have diverged. Manual merge may be required."
            Write-Status "Org commit: $orgCommit"
            Write-Status "Personal commit: $personalCommit"
            Write-Status "Local commit: $localCommit"
        }
    } catch {
        Write-Warning "Could not compare commits"
    }
    
    # Pull from org first
    Write-Status "Pulling from org/$ORG_BRANCH..."
    git pull org $ORG_BRANCH
    
    # Merge from personal if needed
    Write-Status "Merging from personal/$PERSONAL_BRANCH..."
    git merge "personal/$PERSONAL_BRANCH" --no-edit
    
    # Push to both repositories
    Write-Status "Pushing to both repositories..."
    git push org $ORG_BRANCH
    git push personal "${ORG_BRANCH}:${PERSONAL_BRANCH}"
    
    Write-Success "Bidirectional sync completed"
}

function Check-Status {
    Write-Status "Checking status of both repositories..."
    
    # Fetch latest
    git fetch org
    git fetch personal
    
    # Check commits
    $localCommit = git rev-parse HEAD
    try {
        $orgCommit = git rev-parse "org/$ORG_BRANCH" 2>$null
    } catch {
        $orgCommit = "N/A"
    }
    try {
        $personalCommit = git rev-parse "personal/$PERSONAL_BRANCH" 2>$null
    } catch {
        $personalCommit = "N/A"
    }
    
    Write-Host ""
    Write-Host "=== Repository Status ===" -ForegroundColor $Colors.White
    Write-Host "Local Branch: $(git branch --show-current)" -ForegroundColor $Colors.White
    Write-Host "Local:              $localCommit" -ForegroundColor $Colors.White
    Write-Host "Org ($ORG_BRANCH):     $orgCommit" -ForegroundColor $Colors.White
    Write-Host "Personal ($PERSONAL_BRANCH):        $personalCommit" -ForegroundColor $Colors.White
    Write-Host ""
    
    # Check if repos are in sync
    if ($orgCommit -eq $personalCommit) {
        Write-Success "Organization and personal repositories are in sync!"
    } else {
        Write-Warning "Repositories are out of sync"
        Write-Host "  - Org ($ORG_BRANCH): $orgCommit" -ForegroundColor $Colors.Yellow
        Write-Host "  - Personal ($PERSONAL_BRANCH): $personalCommit" -ForegroundColor $Colors.Yellow
    }
    
    # Check local status
    $currentBranch = git branch --show-current
    if ($currentBranch -eq $ORG_BRANCH) {
        if ($localCommit -eq $orgCommit) {
            Write-Success "Local is in sync with org/$ORG_BRANCH"
        } else {
            Write-Warning "Local differs from org/$ORG_BRANCH"
        }
    }
}

function Setup-Deployment {
    Write-Status "Setting up deployment branch for Render..."
    
    # Fetch latest
    git fetch org
    git fetch personal
    
    # Create or update deployment branch
    $deployBranchExists = git show-ref --verify --quiet refs/heads/deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Deployment branch exists, updating..."
        git checkout deploy
        git reset --hard $ORG_BRANCH
    } else {
        Write-Status "Creating deployment branch..."
        git checkout -b deploy $ORG_BRANCH
    }
    
    # Push deployment branch to personal repo
    Write-Status "Pushing deployment branch to personal repo..."
    git push personal deploy --force
    
    Write-Success "Deployment branch setup complete"
    Write-Status "Configure Render to deploy from 'deploy' branch"
}

# Main script logic
switch ($Action) {
    { $_ -in "org-to-personal", "o2p" } {
        Sync-OrgToPersonal
    }
    { $_ -in "personal-to-org", "p2o" } {
        Sync-PersonalToOrg
    }
    { $_ -in "both", "sync" } {
        Sync-Both
    }
    { $_ -in "status", "check" } {
        Check-Status
    }
    { $_ -in "deploy", "setup-deploy" } {
        Setup-Deployment
    }
    default {
        Write-Host "Usage: .\sync-repos.ps1 {org-to-personal|personal-to-org|both|status|deploy}" -ForegroundColor $Colors.White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor $Colors.White
        Write-Host "  org-to-personal (o2p)  - Sync org/$ORG_BRANCH → personal/$PERSONAL_BRANCH" -ForegroundColor $Colors.White
        Write-Host "  personal-to-org (p2o)  - Sync personal/$PERSONAL_BRANCH → org/$ORG_BRANCH" -ForegroundColor $Colors.White
        Write-Host "  both (sync)            - Bidirectional sync" -ForegroundColor $Colors.White
        Write-Host "  status (check)         - Check sync status" -ForegroundColor $Colors.White
        Write-Host "  deploy (setup-deploy)  - Setup deployment branch for Render" -ForegroundColor $Colors.White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor $Colors.White
        Write-Host "  .\sync-repos.ps1 o2p     # Sync org → personal" -ForegroundColor $Colors.White
        Write-Host "  .\sync-repos.ps1 p2o     # Sync personal → org" -ForegroundColor $Colors.White
        Write-Host "  .\sync-repos.ps1 sync    # Sync both ways" -ForegroundColor $Colors.White
        Write-Host "  .\sync-repos.ps1 status  # Check status" -ForegroundColor $Colors.White
        Write-Host "  .\sync-repos.ps1 deploy  # Setup deployment" -ForegroundColor $Colors.White
    }
}
