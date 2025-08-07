#!/bin/bash

# Deploy Repository Sync Script
# Syncs from org/intern/aditay-main to personal/deploy

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORG_BRANCH="intern/aditay-main"
DEPLOY_BRANCH="deploy"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Function to sync to deploy branch
sync_to_deploy() {
    print_status "Syncing from org/$ORG_BRANCH to personal/$DEPLOY_BRANCH..."

    # Fetch latest from org
    print_status "Fetching latest changes from organization repo..."
    git fetch org

    # Switch to org branch if not already there
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$ORG_BRANCH" ]]; then
        print_status "Switching to $ORG_BRANCH..."
        git checkout $ORG_BRANCH
    fi

    # Pull latest changes from org
    print_status "Pulling latest changes from org/$ORG_BRANCH..."
    git pull org $ORG_BRANCH

    # Push to personal deploy branch (force update for deployment)
    print_status "Pushing changes to personal/$DEPLOY_BRANCH..."
    git push personal $ORG_BRANCH:$DEPLOY_BRANCH --force

    print_success "Successfully synced org/$ORG_BRANCH → personal/$DEPLOY_BRANCH"
    print_status "Render deployment should trigger automatically!"
}

# Function to check deploy status
check_deploy_status() {
    print_status "Checking deploy branch status..."
    
    # Fetch latest
    git fetch org
    git fetch personal
    
    # Check commits
    local_commit=$(git rev-parse HEAD)
    org_commit=$(git rev-parse org/$ORG_BRANCH 2>/dev/null || echo "N/A")
    deploy_commit=$(git rev-parse personal/$DEPLOY_BRANCH 2>/dev/null || echo "N/A")
    
    echo ""
    echo "=== Deploy Status ==="
    echo "Local:  $local_commit"
    echo "Org:    $org_commit"
    echo "Deploy: $deploy_commit"
    echo ""
    
    # Check if deploy is up to date
    if [[ "$org_commit" == "$deploy_commit" ]]; then
        print_success "Deploy branch is up to date with org!"
    else
        print_warning "Deploy branch is behind org branch"
        echo "  Run: ./scripts/sync-deploy.sh sync"
    fi
}

# Main script logic
case "${1:-sync}" in
    "sync"|"deploy"|"")
        sync_to_deploy
        ;;
    "status"|"check")
        check_deploy_status
        ;;
    *)
        echo "Usage: $0 {sync|status}"
        echo ""
        echo "Commands:"
        echo "  sync (default)  - Sync org → personal deploy branch"
        echo "  status          - Check deploy branch status"
        echo ""
        echo "Examples:"
        echo "  $0              # Sync to deploy"
        echo "  $0 sync         # Sync to deploy"
        echo "  $0 status       # Check status"
        exit 1
        ;;
esac
