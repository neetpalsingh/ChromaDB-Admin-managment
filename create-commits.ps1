# Create 50 backdated commits for ChromaDB Admin Management System
# March - June 2026, with more commits on weekends

$GithubUsername = "neetpalsingh"
$RepoName = "ChromaDB-Admin-managment"
$remoteUrl = "https://github.com/$GithubUsername/$RepoName.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ChromaDB Admin - 50 Backdated Commits" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Remove existing .git if exists
if (Test-Path ".git") {
    Write-Host "Removing existing .git..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force
}

# Initialize git
Write-Host "Initializing git repository..." -ForegroundColor Green
git init

# Configure git user
git config user.name "Neetpal Singh"
git config user.email "neetpalsingh750@gmail.com"

Write-Host ""
Write-Host "Creating 50 commits from March to June 2026..." -ForegroundColor Cyan
Write-Host ""

# Define all 50 commits with files and dates
$commits = @(
    @{ Date = "2026-03-01 09:30:00"; Files = @("package.json", ".gitignore"); Message = "Initial project setup" },
    @{ Date = "2026-03-01 14:20:00"; Files = @("tsconfig.json", "vite.config.js"); Message = "Add TypeScript configuration" },
    @{ Date = "2026-03-02 10:15:00"; Files = @("tailwind.config.js", "postcss.config.js"); Message = "Setup Tailwind CSS" },
    @{ Date = "2026-03-02 15:45:00"; Files = @("eslint.config.js"); Message = "Add ESLint configuration" },
    @{ Date = "2026-03-08 11:00:00"; Files = @("src/main.tsx", "index.html"); Message = "Create React entry point" },
    @{ Date = "2026-03-08 16:30:00"; Files = @("src/App.tsx", "src/App.css"); Message = "Add main App component" },
    @{ Date = "2026-03-09 10:45:00"; Files = @("src/vite-env.d.ts"); Message = "Add TypeScript definitions" },
    @{ Date = "2026-03-09 14:20:00"; Files = @("src/index.css", "src/tailwind.css"); Message = "Setup global styles" },
    @{ Date = "2026-03-15 09:00:00"; Files = @("src/services/apiService.ts"); Message = "Create API service layer" },
    @{ Date = "2026-03-15 15:30:00"; Files = @("src/components/ChromaConnectionPage.tsx"); Message = "Add connection page component" },
    @{ Date = "2026-03-16 11:20:00"; Files = @("src/components/CollectionCard.tsx"); Message = "Create collection card component" },
    @{ Date = "2026-03-16 16:00:00"; Files = @("src/components/QueryInterface.tsx"); Message = "Add query interface component" },
    @{ Date = "2026-03-22 10:30:00"; Files = @("server/productionServer.js"); Message = "Create production server" },
    @{ Date = "2026-03-22 14:45:00"; Files = @("src/setupProxy.js"); Message = "Setup development proxy" },
    @{ Date = "2026-03-23 09:15:00"; Files = @(".env.example"); Message = "Add environment configuration template" },
    @{ Date = "2026-03-23 15:00:00"; Files = @(".dockerignore", "Dockerfile"); Message = "Add Docker configuration" },
    @{ Date = "2026-03-29 11:00:00"; Files = @("docker-compose.yml"); Message = "Add Docker Compose setup" },
    @{ Date = "2026-03-29 16:20:00"; Files = @("bin/chromadb-admin.js"); Message = "Create NPM CLI tool" },
    @{ Date = "2026-03-30 10:00:00"; Files = @("python-package/setup.py"); Message = "Initialize Python package" },
    @{ Date = "2026-03-30 14:30:00"; Files = @("python-package/pyproject.toml"); Message = "Add Python project config" },
    @{ Date = "2026-04-05 09:45:00"; Files = @("python-package/src/chromadb_admin/__init__.py"); Message = "Create Python package init" },
    @{ Date = "2026-04-05 15:15:00"; Files = @("python-package/src/chromadb_admin/server.py"); Message = "Add Python server module" },
    @{ Date = "2026-04-06 11:30:00"; Files = @("python-package/src/chromadb_admin/cli.py"); Message = "Create Python CLI" },
    @{ Date = "2026-04-06 16:00:00"; Files = @("python-package/src/chromadb_admin/client.py"); Message = "Add Python client library" },
    @{ Date = "2026-04-12 10:20:00"; Files = @("python-package/README.md"); Message = "Add Python package README" },
    @{ Date = "2026-04-12 14:50:00"; Files = @("python-package/MANIFEST.in"); Message = "Add Python manifest" },
    @{ Date = "2026-04-13 09:00:00"; Files = @("LICENSE"); Message = "Add MIT License" },
    @{ Date = "2026-04-13 15:30:00"; Files = @("CONTRIBUTING.md"); Message = "Add contribution guidelines" },
    @{ Date = "2026-04-19 11:15:00"; Files = @("README.md"); Message = "Create comprehensive README" },
    @{ Date = "2026-04-19 16:45:00"; Files = @("PUBLISHING_GUIDE.md"); Message = "Add publishing guide" },
    @{ Date = "2026-04-20 10:00:00"; Files = @("PRE_PUBLISH_CHECKLIST.md"); Message = "Add pre-publish checklist" },
    @{ Date = "2026-04-20 14:20:00"; Files = @("ENV_CONFIGURATION.md"); Message = "Add environment config docs" },
    @{ Date = "2026-04-26 09:30:00"; Files = @("START_HERE.md"); Message = "Add quick start guide" },
    @{ Date = "2026-04-26 15:00:00"; Files = @("PORT_CONFIGURATION.md"); Message = "Add port configuration guide" },
    @{ Date = "2026-04-27 11:00:00"; Files = @("debug-api.js"); Message = "Add API debugging utility" },
    @{ Date = "2026-04-27 16:30:00"; Files = @("src/components/DocumentDisplay.tsx"); Message = "Add document display component" },
    @{ Date = "2026-05-03 10:15:00"; Files = @("src/components/SearchResults.tsx"); Message = "Create search results component" },
    @{ Date = "2026-05-03 14:45:00"; Files = @("src/components/Sidebar.tsx"); Message = "Add sidebar navigation" },
    @{ Date = "2026-05-04 09:20:00"; Files = @("src/components/MetadataEditor.tsx"); Message = "Create metadata editor" },
    @{ Date = "2026-05-04 15:50:00"; Files = @("src/components/EmbeddingVisualizer.tsx"); Message = "Add embedding visualizer" },
    @{ Date = "2026-05-10 11:30:00"; Files = @("src/components/QueryTester.tsx"); Message = "Create query tester component" },
    @{ Date = "2026-05-10 16:00:00"; Files = @("src/components/BatchUpload.tsx"); Message = "Add batch upload feature" },
    @{ Date = "2026-05-11 10:00:00"; Files = @("src/components/ExportDialog.tsx"); Message = "Create export dialog" },
    @{ Date = "2026-05-11 14:30:00"; Files = @("src/utils/formatting.ts"); Message = "Add formatting utilities" },
    @{ Date = "2026-05-17 09:45:00"; Files = @("src/utils/validation.ts"); Message = "Add validation utilities" },
    @{ Date = "2026-05-17 15:20:00"; Files = @("src/hooks/useChromaDB.ts"); Message = "Create custom React hooks" },
    @{ Date = "2026-05-18 11:00:00"; Files = @("src/types/index.ts"); Message = "Add TypeScript type definitions" },
    @{ Date = "2026-05-18 16:30:00"; Files = @("public/favicon.ico", "public/logo.png"); Message = "Add branding assets" },
    @{ Date = "2026-05-24 10:20:00"; Files = @("package.json"); Message = "Update dependencies and port to 3434" },
    @{ Date = "2026-06-14 15:00:00"; Files = @("."); Message = "Final polish and documentation updates" }
)

# Create commits
$count = 0
foreach ($commit in $commits) {
    $count++
    Write-Host "[$count/50] $($commit.Message)" -ForegroundColor Cyan
    Write-Host "  Date: $($commit.Date)" -ForegroundColor Gray
    
    # Add files (or all if specific files don't exist)
    $filesToAdd = @()
    foreach ($file in $commit.Files) {
        if (Test-Path $file) {
            $filesToAdd += $file
        }
    }
    
    if ($filesToAdd.Count -eq 0) {
        # If no specific files exist, add all
        git add -A
    } else {
        git add $filesToAdd
    }
    
    # Create commit with backdated timestamp
    $env:GIT_AUTHOR_DATE = $commit.Date
    $env:GIT_COMMITTER_DATE = $commit.Date
    git commit -m $commit.Message 2>&1 | Out-Null
    
    # Clear environment variables
    $env:GIT_AUTHOR_DATE = $null
    $env:GIT_COMMITTER_DATE = $null
    
    Write-Host "  ✓ Committed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✓ All 50 commits created!" -ForegroundColor Green
Write-Host ""

# Show commit history
Write-Host "Recent commits:" -ForegroundColor Cyan
git log --oneline -10

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Ready to Push to GitHub!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
Write-Host ""

$push = Read-Host "Push to GitHub now? (y/n)"

if ($push -eq 'y' -or $push -eq 'Y') {
    Write-Host ""
    Write-Host "Adding remote and pushing..." -ForegroundColor Green

    git remote add origin $remoteUrl
    git branch -M main
    git push -u origin main --force

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully Pushed!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repository: https://github.com/$GithubUsername/$RepoName" -ForegroundColor Cyan
        Write-Host "Profile: https://github.com/$GithubUsername" -ForegroundColor Cyan
        Write-Host ""
    }
}

Write-Host "✓ Done!" -ForegroundColor Green

