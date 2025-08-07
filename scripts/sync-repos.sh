#!/bin/bash

# Dual Repository Sync Script
# Syncs between org/intern/aditay-main and personal/main

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORG_BRANCH="intern/aditay-main"
PERSONAL_BRANCH="main"

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

# Function to sync from org to personal
sync_org_to_personal() {
    print_status "Syncing from org/$ORG_BRANCH to personal/$PERSONAL_BRANCH..."

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

    # Push to personal repo main branch
    print_status "Pushing changes to personal/$PERSONAL_BRANCH..."
    git push personal $ORG_BRANCH:$PERSONAL_BRANCH

    print_success "Successfully synced org/$ORG_BRANCH → personal/$PERSONAL_BRANCH"
}

# Function to sync from personal to org
sync_personal_to_org() {
    print_status "Syncing from personal/$PERSONAL_BRANCH to org/$ORG_BRANCH..."

    # Fetch latest from personal
    print_status "Fetching latest changes from personal repo..."
    git fetch personal

    # Switch to org branch if not already there
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$ORG_BRANCH" ]]; then
        print_status "Switching to $ORG_BRANCH..."
        git checkout $ORG_BRANCH
    fi

    # Merge changes from personal main
    print_status "Merging changes from personal/$PERSONAL_BRANCH..."
    git merge personal/$PERSONAL_BRANCH --no-edit

    # Push to org repo
    print_status "Pushing changes to org/$ORG_BRANCH..."
    git push org $ORG_BRANCH

    print_success "Successfully synced personal/$PERSONAL_BRANCH → org/$ORG_BRANCH"
}

# Function to sync both ways
sync_both() {
    print_status "Performing bidirectional sync..."
    
    # Fetch from both remotes
    print_status "Fetching from both repositories..."
    git fetch org
    git fetch personal
    
    current_branch=$(git branch --show-current)
    
    # Check if there are conflicts
    org_commit=$(git rev-parse org/$current_branch 2>/dev/null || echo "")
    personal_commit=$(git rev-parse personal/$current_branch 2>/dev/null || echo "")
    local_commit=$(git rev-parse HEAD)
    
    if [[ "$org_commit" != "$personal_commit" && -n "$org_commit" && -n "$personal_commit" ]]; then
        print_warning "Repositories have diverged. Manual merge may be required."
        print_status "Org commit: $org_commit"
        print_status "Personal commit: $personal_commit"
        print_status "Local commit: $local_commit"
    fi
    
    # Merge and push to both
    if [[ -n "$org_commit" ]]; then
        git merge org/$current_branch --no-edit
    fi
    
    if [[ -n "$personal_commit" ]]; then
        git merge personal/$current_branch --no-edit
    fi
    
    # Push to both repositories
    print_status "Pushing to both repositories..."
    git push org $current_branch
    git push personal $current_branch
    
    print_success "Bidirectional sync completed"
}

# Function to check status of both repos
check_status() {
    print_status "Checking status of both repositories..."
    
    current_branch=$(git branch --show-current)
    
    # Fetch latest
    git fetch org
    git fetch personal
    
    # Check commits
    local_commit=$(git rev-parse HEAD)
    org_commit=$(git rev-parse org/$current_branch 2>/dev/null || echo "N/A")
    personal_commit=$(git rev-parse personal/$current_branch 2>/dev/null || echo "N/A")
    
    echo ""
    echo "=== Repository Status ==="
    echo "Current Branch: $current_branch"
    echo "Local:    $local_commit"
    echo "Org:      $org_commit"
    echo "Personal: $personal_commit"
    echo ""
    
    # Check if repos are in sync
    if [[ "$local_commit" == "$org_commit" && "$local_commit" == "$personal_commit" ]]; then
        print_success "All repositories are in sync!"
    else
        print_warning "Repositories are out of sync"
        
        if [[ "$local_commit" != "$org_commit" ]]; then
            echo "  - Local differs from org"
        fi
        
        if [[ "$local_commit" != "$personal_commit" ]]; then
            echo "  - Local differs from personal"
        fi
        
        if [[ "$org_commit" != "$personal_commit" ]]; then
            echo "  - Org differs from personal"
        fi
    fi
}

# Main script logic
case "${1:-}" in
    "org-to-personal"|"o2p")
        sync_org_to_personal
        ;;
    "personal-to-org"|"p2o")
        sync_personal_to_org
        ;;
    "both"|"sync")
        sync_both
        ;;
    "status"|"check")
        check_status
        ;;
    *)
        echo "Usage: $0 {org-to-personal|personal-to-org|both|status}"
        echo ""
        echo "Commands:"
        echo "  org-to-personal (o2p)  - Sync from organization to personal repo"
        echo "  personal-to-org (p2o)  - Sync from personal to organization repo"
        echo "  both (sync)            - Bidirectional sync"
        echo "  status (check)         - Check sync status"
        echo ""
        echo "Examples:"
        echo "  $0 o2p     # Sync org → personal"
        echo "  $0 p2o     # Sync personal → org"
        echo "  $0 sync    # Sync both ways"
        echo "  $0 status  # Check status"
        exit 1
        ;;
esac
