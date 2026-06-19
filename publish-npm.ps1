# NPM Publishing Script for ChromaDB Admin
# Run this from the api-ui directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NPM Publishing - ChromaDB Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to NPM
Write-Host "Checking NPM authentication..." -ForegroundColor Yellow
$npmUser = npm whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to NPM" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  npm login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Logged in as: $npmUser" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run build
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Show package info
Write-Host "Package Information:" -ForegroundColor Cyan
$packageJson = Get-Content package.json | ConvertFrom-Json
Write-Host "  Name: $($packageJson.name)" -ForegroundColor White
Write-Host "  Version: $($packageJson.version)" -ForegroundColor White
Write-Host "  Description: $($packageJson.description)" -ForegroundColor White
Write-Host ""

# Dry run
Write-Host "Running publish dry-run..." -ForegroundColor Yellow
npm publish --dry-run

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dry run failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dry run successful" -ForegroundColor Green
Write-Host ""

# Confirm publish
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Ready to Publish!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Package: $($packageJson.name)@$($packageJson.version)" -ForegroundColor Cyan
Write-Host "Registry: https://registry.npmjs.org/" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Publish to NPM? (yes/no)"

if ($confirm -eq 'yes') {
    Write-Host ""
    Write-Host "Publishing to NPM..." -ForegroundColor Green
    npm publish --access public
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully Published!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "View on NPM: https://www.npmjs.com/package/$($packageJson.name)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Install with:" -ForegroundColor Yellow
        Write-Host "  npm install -g $($packageJson.name)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Publishing failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  - Package name already taken (change in package.json)" -ForegroundColor White
        Write-Host "  - Version already published (update version)" -ForegroundColor White
        Write-Host "  - Authentication expired (run: npm login)" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Publishing cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To publish later, run:" -ForegroundColor Yellow
    Write-Host "  npm publish --access public" -ForegroundColor White
    Write-Host ""
}

Write-Host "✓ Script completed!" -ForegroundColor Green
