# PyPI Publishing Script for ChromaDB Admin
# Run this from the api-ui directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PyPI Publishing - ChromaDB Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Host "Please install Python 3.8+" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Python installed: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Install build tools
Write-Host "Installing/upgrading build tools..." -ForegroundColor Yellow
pip install --upgrade build twine

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install build tools" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build tools ready" -ForegroundColor Green
Write-Host ""

# Navigate to python package
Set-Location python-package

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force dist }
if (Test-Path "build") { Remove-Item -Recurse -Force build }
if (Test-Path "*.egg-info") { Remove-Item -Recurse -Force *.egg-info }

Write-Host "✓ Cleaned" -ForegroundColor Green
Write-Host ""

# Build package
Write-Host "Building Python package..." -ForegroundColor Yellow
python -m build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Show package info
Write-Host "Package Information:" -ForegroundColor Cyan
$setupContent = Get-Content setup.py -Raw
if ($setupContent -match 'name\s*=\s*[''"]([^''"]+)[''"]') {
    $packageName = $matches[1]
    Write-Host "  Name: $packageName" -ForegroundColor White
}
if ($setupContent -match 'version\s*=\s*[''"]([^''"]+)[''"]') {
    $version = $matches[1]
    Write-Host "  Version: $version" -ForegroundColor White
}
Write-Host ""

# List built files
Write-Host "Built files:" -ForegroundColor Cyan
Get-ChildItem dist | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
Write-Host ""

# Check if PyPI credentials are set
Write-Host "Checking PyPI credentials..." -ForegroundColor Yellow
$pypircPath = "$env:USERPROFILE\.pypirc"

if (-not (Test-Path $pypircPath)) {
    Write-Host "⚠️  No .pypirc file found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You'll need a PyPI API token. Get one from:" -ForegroundColor Yellow
    Write-Host "  https://pypi.org/manage/account/token/" -ForegroundColor Cyan
    Write-Host ""
    
    $token = Read-Host "Enter your PyPI token (or press Enter to skip)"
    
    if ($token) {
        $pypircContent = @"
[pypi]
username = __token__
password = $token
"@
        $pypircContent | Set-Content $pypircPath
        Write-Host "✓ Credentials saved to $pypircPath" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "You can set environment variables instead:" -ForegroundColor Yellow
        Write-Host '  $env:TWINE_USERNAME = "__token__"' -ForegroundColor White
        Write-Host '  $env:TWINE_PASSWORD = "pypi-YOUR_TOKEN"' -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "✓ Found .pypirc credentials" -ForegroundColor Green
}

Write-Host ""

# Confirm upload
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Ready to Publish to PyPI!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Package: $packageName v$version" -ForegroundColor Cyan
Write-Host "Registry: https://pypi.org/" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Upload to PyPI? (yes/no)"

if ($confirm -eq 'yes') {
    Write-Host ""
    Write-Host "Uploading to PyPI..." -ForegroundColor Green
    python -m twine upload dist/*
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully Published!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "View on PyPI: https://pypi.org/project/$packageName/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Install with:" -ForegroundColor Yellow
        Write-Host "  pip install $packageName" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Upload failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  - Package name already taken (change in setup.py)" -ForegroundColor White
        Write-Host "  - Version already published (update version)" -ForegroundColor White
        Write-Host "  - Invalid credentials (check .pypirc or environment variables)" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Upload cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To upload later, run:" -ForegroundColor Yellow
    Write-Host "  python -m twine upload dist/*" -ForegroundColor White
    Write-Host ""
}

# Return to api-ui directory
Set-Location ..

Write-Host "✓ Script completed!" -ForegroundColor Green
