# Docker Hub Publishing Script for ChromaDB Admin
# Run this from the api-ui directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker Hub Publishing - ChromaDB Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$dockerUsername = "neetpalsingh"
$imageName = "chromadb-admin"
$version = "1.0.0"

# Check Docker
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
docker ps 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check Docker login
Write-Host "Checking Docker Hub authentication..." -ForegroundColor Yellow
$loginCheck = docker info 2>&1 | Select-String "Username"

if (-not $loginCheck) {
    Write-Host "⚠️  Not logged in to Docker Hub" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Logging in to Docker Hub..." -ForegroundColor Yellow
    docker login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Logged in to Docker Hub" -ForegroundColor Green
Write-Host ""

# Build image
Write-Host "Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

docker build -t $imageName`:latest -t $imageName`:$version .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Tag images with username
Write-Host "Tagging images..." -ForegroundColor Yellow
docker tag $imageName`:latest $dockerUsername/$imageName`:latest
docker tag $imageName`:$version $dockerUsername/$imageName`:$version

Write-Host "✓ Images tagged" -ForegroundColor Green
Write-Host ""

# Show image info
Write-Host "Image Information:" -ForegroundColor Cyan
docker images $dockerUsername/$imageName --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
Write-Host ""

# Test image locally
Write-Host "Would you like to test the image locally first? (recommended)" -ForegroundColor Yellow
$test = Read-Host "Test image? (y/n)"

if ($test -eq 'y') {
    Write-Host ""
    Write-Host "Starting container on port 3434..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the test" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Once started, visit: http://localhost:3434" -ForegroundColor Cyan
    Write-Host ""
    
    docker run -p 3434:3434 --name chromadb-admin-test $dockerUsername/$imageName`:latest
    
    # Cleanup
    docker rm chromadb-admin-test 2>&1 | Out-Null
    Write-Host ""
}

# Confirm push
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Ready to Publish to Docker Hub!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Images to push:" -ForegroundColor Cyan
Write-Host "  - $dockerUsername/$imageName`:latest" -ForegroundColor White
Write-Host "  - $dockerUsername/$imageName`:$version" -ForegroundColor White
Write-Host ""
Write-Host "Repository: https://hub.docker.com/r/$dockerUsername/$imageName" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Push to Docker Hub? (yes/no)"

if ($confirm -eq 'yes') {
    Write-Host ""
    Write-Host "Pushing to Docker Hub..." -ForegroundColor Green
    Write-Host "This may take several minutes..." -ForegroundColor Gray
    Write-Host ""
    
    # Push latest
    Write-Host "Pushing latest tag..." -ForegroundColor Yellow
    docker push $dockerUsername/$imageName`:latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push latest tag" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Pushed latest tag" -ForegroundColor Green
    Write-Host ""
    
    # Push version
    Write-Host "Pushing version tag..." -ForegroundColor Yellow
    docker push $dockerUsername/$imageName`:$version
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push version tag" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Pushed version tag" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Successfully Published!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View on Docker Hub: https://hub.docker.com/r/$dockerUsername/$imageName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Users can now run:" -ForegroundColor Yellow
    Write-Host "  docker pull $dockerUsername/$imageName" -ForegroundColor White
    Write-Host "  docker run -p 3434:3434 $dockerUsername/$imageName" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Push cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To push later, run:" -ForegroundColor Yellow
    Write-Host "  docker push $dockerUsername/$imageName`:latest" -ForegroundColor White
    Write-Host "  docker push $dockerUsername/$imageName`:$version" -ForegroundColor White
    Write-Host ""
}

Write-Host "✓ Script completed!" -ForegroundColor Green
