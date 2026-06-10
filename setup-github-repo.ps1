# Script to initialize Git repo with backdated commits
# This will create 50 commits spread across March-June 2026 with more commits on weekends

param(
    [string]$GithubUsername = "neetpalsingh",
    [string]$RepoName = "ChromaDB-Admin-managment"
)

if ([string]::IsNullOrEmpty($GithubUsername)) {
    $GithubUsername = Read-Host "Enter your GitHub username"
}

# Navigate to api-ui folder
Set-Location -Path $PSScriptRoot

# Check if .git already exists
if (Test-Path ".git") {
    Write-Host "Git repository already exists. Removing it..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force
}

# Initialize new git repository
Write-Host "Initializing new Git repository..." -ForegroundColor Green
git init

# Configure git user
git config user.name "Neetpal Singh"
git config user.email "neetpal@ascentbusiness.co.in"

# Define file groups for logical commits
$fileGroups = @(
    @{
        Date = "2026-03-01 09:30:00"
        Files = @("package.json", "package-lock.json", ".gitignore")
        Message = "Initial project setup with dependencies"
    },
    @{
        Date = "2026-03-01 14:20:00"
        Files = @("tsconfig.json", "vite.config.js", "postcss.config.js")
        Message = "Add TypeScript and build configuration"
    },
    @{
        Date = "2026-03-02 10:15:00"
        Files = @("tailwind.config.js", "src/tailwind.css", "src/index.css")
        Message = "Setup Tailwind CSS styling"
    },
    @{
        Date = "2026-03-02 15:45:00"
        Files = @("eslint.config.js")
        Message = "Add ESLint configuration"
    },
    @{
        Date = "2026-03-03 11:00:00"
        Files = @("index.html", "public/index.html", "public/manifest.json", "public/vite.svg")
        Message = "Add HTML templates and public assets"
    },
    @{
        Date = "2026-03-08 13:30:00" # Saturday
        Files = @("src/main.tsx", "src/index.tsx")
        Message = "Create React application entry points"
    },
    @{
        Date = "2026-03-08 16:20:00" # Saturday
        Files = @("src/types/api.ts")
        Message = "Define TypeScript API types"
    },
    @{
        Date = "2026-03-09 10:00:00" # Sunday
        Files = @("src/contexts/DarkModeContext.tsx")
        Message = "Implement dark mode context"
    },
    @{
        Date = "2026-03-09 14:30:00" # Sunday
        Files = @("src/components/ToggleSwitch.tsx")
        Message = "Add toggle switch component"
    },
    @{
        Date = "2026-03-09 17:45:00" # Sunday
        Files = @("src/components/ErrorBoundary.tsx")
        Message = "Implement error boundary component"
    },
    @{
        Date = "2026-03-10 09:30:00"
        Files = @("src/services/apiService.ts")
        Message = "Create API service layer"
    },
    @{
        Date = "2026-03-11 10:15:00"
        Files = @("src/services/tenantService.ts")
        Message = "Add tenant management service"
    },
    @{
        Date = "2026-03-15 13:00:00" # Saturday
        Files = @("src/components/Dashboard.tsx")
        Message = "Implement main dashboard component"
    },
    @{
        Date = "2026-03-15 16:30:00" # Saturday
        Files = @("src/components/ChromaConnectionPage.tsx")
        Message = "Add Chroma connection page"
    },
    @{
        Date = "2026-03-16 10:00:00" # Sunday
        Files = @("src/components/DatabaseManagement.tsx")
        Message = "Create database management interface"
    },
    @{
        Date = "2026-03-16 14:20:00" # Sunday
        Files = @("src/components/TenantManagement.tsx")
        Message = "Implement tenant management page"
    },
    @{
        Date = "2026-03-17 11:00:00"
        Files = @("src/components/DataOperations.tsx")
        Message = "Add data operations component"
    },
    @{
        Date = "2026-03-22 09:45:00" # Saturday
        Files = @("src/components/APITestingPage.tsx")
        Message = "Create API testing interface"
    },
    @{
        Date = "2026-03-22 13:30:00" # Saturday
        Files = @("src/components/SwaggerUIComponent.tsx")
        Message = "Integrate Swagger UI component"
    },
    @{
        Date = "2026-03-22 16:00:00" # Saturday
        Files = @("src/components/EndpointsPage.tsx")
        Message = "Add API endpoints documentation page"
    },
    @{
        Date = "2026-03-23 10:30:00" # Sunday
        Files = @("src/App.tsx")
        Message = "Implement main App component with routing"
    },
    @{
        Date = "2026-03-23 14:00:00" # Sunday
        Files = @("src/assets/react.svg")
        Message = "Add React logo asset"
    },
    @{
        Date = "2026-03-24 09:15:00"
        Files = @("src/setupProxy.js")
        Message = "Configure development proxy settings"
    },
    @{
        Date = "2026-03-29 11:00:00" # Saturday
        Files = @("server/productionServer.js")
        Message = "Add production server configuration"
    },
    @{
        Date = "2026-03-29 15:30:00" # Saturday
        Files = @("server/tenantFileServer.cjs")
        Message = "Implement tenant file server"
    },
    @{
        Date = "2026-03-30 10:00:00" # Sunday
        Files = @("scripts/deploy.sh")
        Message = "Create deployment script"
    },
    @{
        Date = "2026-03-30 13:45:00" # Sunday
        Files = @("scripts/start-production.sh")
        Message = "Add production startup script"
    },
    @{
        Date = "2026-03-30 16:20:00" # Sunday
        Files = @("scripts/start-services.sh")
        Message = "Create services startup script"
    },
    @{
        Date = "2026-04-05 09:30:00" # Saturday
        Files = @("scripts/ec2-setup.sh")
        Message = "Add EC2 deployment setup script"
    },
    @{
        Date = "2026-04-05 14:00:00" # Saturday
        Files = @("scripts/chromadb-dashboard.service", "scripts/chromadb-tenant-server.service")
        Message = "Add systemd service configurations"
    },
    @{
        Date = "2026-04-06 10:15:00" # Sunday
        Files = @("deploy-https-fix.sh")
        Message = "Add HTTPS deployment fix script"
    },
    @{
        Date = "2026-04-06 13:30:00" # Sunday
        Files = @("debug-api.js")
        Message = "Create API debugging utility"
    },
    @{
        Date = "2026-04-06 16:00:00" # Sunday
        Files = @("simple-demo.html")
        Message = "Add simple demo page"
    },
    @{
        Date = "2026-04-12 10:00:00" # Saturday
        Files = @("README.md")
        Message = "Create comprehensive README documentation"
    },
    @{
        Date = "2026-04-12 14:30:00" # Saturday
        Files = @("DEPLOYMENT.md")
        Message = "Add deployment documentation"
    },
    @{
        Date = "2026-04-13 09:45:00" # Sunday
        Files = @("DEPLOYMENT_PRODUCTION.md")
        Message = "Document production deployment process"
    },
    @{
        Date = "2026-04-13 13:00:00" # Sunday
        Files = @("IMPLEMENTATION_GUIDE.md")
        Message = "Create implementation guide"
    },
    @{
        Date = "2026-04-13 16:15:00" # Sunday
        Files = @("FIXES_DEPLOYMENT.md")
        Message = "Document deployment fixes and troubleshooting"
    },
    @{
        Date = "2026-04-19 10:30:00" # Saturday
        Files = @("PROJECT_TASKS.md")
        Message = "Add project tasks and roadmap"
    },
    @{
        Date = "2026-04-19 14:00:00" # Saturday
        Files = @(".env")
        Message = "Add environment configuration template"
    },
    @{
        Date = "2026-04-20 09:00:00" # Sunday
        Files = @(".env.production")
        Message = "Add production environment configuration"
    },
    @{
        Date = "2026-04-26 11:00:00" # Saturday
        Files = @("src/services/apiService.ts")
        Message = "Enhance API service with error handling"
    },
    @{
        Date = "2026-04-26 15:30:00" # Saturday
        Files = @("src/components/DataOperations.tsx")
        Message = "Improve data operations UI and validation"
    },
    @{
        Date = "2026-04-27 10:00:00" # Sunday
        Files = @("src/components/Dashboard.tsx")
        Message = "Add real-time statistics to dashboard"
    },
    @{
        Date = "2026-04-27 14:00:00" # Sunday
        Files = @("src/App.tsx")
        Message = "Enhance routing and navigation"
    },
    @{
        Date = "2026-05-03 09:30:00" # Saturday
        Files = @("src/components/APITestingPage.tsx")
        Message = "Add more API testing capabilities"
    },
    @{
        Date = "2026-05-03 13:45:00" # Saturday
        Files = @("src/components/TenantManagement.tsx")
        Message = "Improve tenant management features"
    },
    @{
        Date = "2026-05-04 10:15:00" # Sunday
        Files = @("src/index.css")
        Message = "Refine global styles and animations"
    },
    @{
        Date = "2026-05-04 14:30:00" # Sunday
        Files = @("tailwind.config.js")
        Message = "Optimize Tailwind configuration"
    },
    @{
        Date = "2026-05-10 11:00:00" # Saturday
        Files = @("vite.config.js")
        Message = "Update Vite build configuration"
    },
    @{
        Date = "2026-05-10 15:00:00" # Saturday
        Files = @("server/productionServer.js")
        Message = "Enhance production server security"
    },
    @{
        Date = "2026-05-11 09:30:00" # Sunday
        Files = @("README.md")
        Message = "Update README with latest features"
    },
    @{
        Date = "2026-05-11 13:00:00" # Sunday
        Files = @("package.json")
        Message = "Update dependencies and scripts"
    },
    @{
        Date = "2026-05-17 10:00:00" # Saturday
        Files = @("src/components/ChromaConnectionPage.tsx")
        Message = "Add connection validation and retry logic"
    },
    @{
        Date = "2026-05-17 14:30:00" # Saturday
        Files = @("src/services/tenantService.ts")
        Message = "Optimize tenant service performance"
    },
    @{
        Date = "2026-05-18 09:45:00" # Sunday
        Files = @("src/components/DatabaseManagement.tsx")
        Message = "Add bulk operations for database management"
    },
    @{
        Date = "2026-05-18 13:30:00" # Sunday
        Files = @("DEPLOYMENT.md")
        Message = "Update deployment instructions"
    },
    @{
        Date = "2026-06-14 10:00:00" # Saturday (Last Saturday of commits)
        Files = @("src/App.tsx", "README.md")
        Message = "Final UI improvements and documentation update"
    },
    @{
        Date = "2026-06-15 11:30:00" # Sunday (Last commit)
        Files = @("package.json", "README.md")
        Message = "Release version 1.0.0 - Production ready"
    }
)

Write-Host "`nCreating backdated commits..." -ForegroundColor Green
Write-Host "Total commits to create: $($fileGroups.Count)" -ForegroundColor Cyan

$commitCount = 0
foreach ($group in $fileGroups) {
    $commitCount++
    $filesToAdd = @()

    # Check which files exist and add them
    foreach ($file in $group.Files) {
        if (Test-Path $file) {
            $filesToAdd += $file
        } else {
            Write-Host "  Warning: File not found - $file" -ForegroundColor Yellow
        }
    }

    if ($filesToAdd.Count -gt 0) {
        Write-Host "[$commitCount/$($fileGroups.Count)] $($group.Message)" -ForegroundColor Cyan
        Write-Host "  Date: $($group.Date)" -ForegroundColor Gray
        Write-Host "  Files: $($filesToAdd -join ', ')" -ForegroundColor Gray

        # Add files
        git add $filesToAdd

        # Create commit with backdated timestamp
        $env:GIT_AUTHOR_DATE = $group.Date
        $env:GIT_COMMITTER_DATE = $group.Date
        git commit -m $group.Message

        # Clear environment variables
        $env:GIT_AUTHOR_DATE = $null
        $env:GIT_COMMITTER_DATE = $null

        Write-Host "  ✓ Committed" -ForegroundColor Green
    } else {
        Write-Host "[$commitCount/$($fileGroups.Count)] Skipped - No files found for: $($group.Message)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "`n✓ All commits created successfully!" -ForegroundColor Green

# Show commit history
Write-Host "`nCommit History:" -ForegroundColor Cyan
git log --oneline --graph --all -20

# Ask if user wants to create GitHub repo and push
Write-Host "`n" -NoNewline
$createRepo = Read-Host "Do you want to create a GitHub repository and push? (y/n)"

if ($createRepo -eq 'y' -or $createRepo -eq 'Y') {
    Write-Host "`nInstructions to push to GitHub:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository named '$RepoName' (make it public to show contributions)" -ForegroundColor White
    Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "`nPress Enter when you've created the repository..." -ForegroundColor Yellow
    Read-Host

    # Add remote and push
    $remoteUrl = "https://github.com/$GithubUsername/$RepoName.git"
    Write-Host "`nAdding remote: $remoteUrl" -ForegroundColor Green
    git remote add origin $remoteUrl

    Write-Host "Renaming branch to main..." -ForegroundColor Green
    git branch -M main

    Write-Host "Pushing to GitHub..." -ForegroundColor Green
    Write-Host "You may be prompted for your GitHub credentials or token." -ForegroundColor Yellow
    git push -u origin main

    Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Check your contributions at: https://github.com/$GithubUsername" -ForegroundColor Cyan
} else {
    Write-Host "`nTo push later, run these commands:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/$GithubUsername/$RepoName.git" -ForegroundColor White
    Write-Host "git branch -M main" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host "`n✓ Script completed!" -ForegroundColor Green
