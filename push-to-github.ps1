# Simple script to push to GitHub
# Run this from the api-ui directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push to GitHub Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$GithubUsername = "neetpalsingh"
$RepoName = "ChromaDB-Admin-managment"
$remoteUrl = "https://github.com/$GithubUsername/$RepoName.git"

# Check if .git exists
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already exists." -ForegroundColor Yellow
    $reinit = Read-Host "Do you want to reinitialize? This will delete existing .git (y/n)"
    if ($reinit -eq 'y') {
        Remove-Item -Path ".git" -Recurse -Force
        Write-Host "✓ Removed existing .git directory" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled. Existing .git kept." -ForegroundColor Red
        exit 0
    }
}

# Initialize git
Write-Host "🔧 Initializing git repository..." -ForegroundColor Green
git init

# Configure git user
Write-Host "👤 Configuring git user..." -ForegroundColor Green
git config user.name "Neetpal Singh"
git config user.email "neetpalsingh750@gmail.com"

# Add all files
Write-Host "📦 Adding all files..." -ForegroundColor Green
git add .

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit: ChromaDB Admin Management System (CAMS)

- Complete React + TypeScript admin dashboard
- NPM package configuration
- Python package for PyPI
- Docker containerization
- Comprehensive documentation
- Environment-based configuration (no hardcoded URLs)
- MIT License
"

# Add remote
Write-Host "🔗 Adding remote origin: $remoteUrl" -ForegroundColor Green
git remote add origin $remoteUrl

# Rename branch to main
Write-Host "🌿 Renaming branch to main..." -ForegroundColor Green
git branch -M main

# Push to GitHub
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Ready to Push!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted for GitHub credentials:" -ForegroundColor Yellow
Write-Host "  Username: $GithubUsername" -ForegroundColor White
Write-Host "  Password: Use Personal Access Token (NOT your password)" -ForegroundColor White
Write-Host ""
Write-Host "To create a token:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "  2. Generate new token (classic)" -ForegroundColor White
Write-Host "  3. Select scope: repo" -ForegroundColor White
Write-Host "  4. Copy and paste as password" -ForegroundColor White
Write-Host ""

$proceed = Read-Host "Ready to push? (y/n)"

if ($proceed -eq 'y' -or $proceed -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your repository: https://github.com/$GithubUsername/$RepoName" -ForegroundColor Cyan
        Write-Host "Your profile: https://github.com/$GithubUsername" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Please check your credentials and try again." -ForegroundColor Red
        Write-Host ""
        Write-Host "To retry:" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Push cancelled. To push later, run:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
}

Write-Host "✓ Script completed!" -ForegroundColor Green
