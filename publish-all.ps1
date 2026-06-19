# Master Publishing Script - Publish to NPM, PyPI, and Docker Hub
# Run this from the api-ui directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ChromaDB Admin - Complete Publishing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you publish to:" -ForegroundColor Yellow
Write-Host "  1. NPM (Node Package Manager)" -ForegroundColor White
Write-Host "  2. PyPI (Python Package Index)" -ForegroundColor White
Write-Host "  3. Docker Hub" -ForegroundColor White
Write-Host ""

# Show menu
function Show-Menu {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Select Publishing Option" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Publish to NPM only" -ForegroundColor White
    Write-Host "2. Publish to PyPI only" -ForegroundColor White
    Write-Host "3. Publish to Docker Hub only" -ForegroundColor White
    Write-Host "4. Publish to ALL platforms (NPM + PyPI + Docker)" -ForegroundColor Green
    Write-Host "5. View publishing guides" -ForegroundColor Yellow
    Write-Host "0. Exit" -ForegroundColor Red
    Write-Host ""
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (0-5)"
    Write-Host ""
    
    switch ($choice) {
        '1' {
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Publishing to NPM" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            .\publish-npm.ps1
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        '2' {
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Publishing to PyPI" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            .\publish-pypi.ps1
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        '3' {
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Publishing to Docker Hub" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            .\publish-docker.ps1
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        '4' {
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Publishing to ALL Platforms" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            
            $confirmAll = Read-Host "This will publish to NPM, PyPI, and Docker Hub. Continue? (yes/no)"
            
            if ($confirmAll -eq 'yes') {
                Write-Host ""
                Write-Host "Step 1/3: Publishing to NPM..." -ForegroundColor Cyan
                Write-Host "----------------------------------------" -ForegroundColor Gray
                .\publish-npm.ps1
                
                Write-Host ""
                Write-Host "Step 2/3: Publishing to PyPI..." -ForegroundColor Cyan
                Write-Host "----------------------------------------" -ForegroundColor Gray
                .\publish-pypi.ps1
                
                Write-Host ""
                Write-Host "Step 3/3: Publishing to Docker Hub..." -ForegroundColor Cyan
                Write-Host "----------------------------------------" -ForegroundColor Gray
                .\publish-docker.ps1
                
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "  ✓ All Publishing Complete!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Your package is now available on:" -ForegroundColor Yellow
                Write-Host "  - NPM: https://www.npmjs.com/package/chromadb-admin" -ForegroundColor Cyan
                Write-Host "  - PyPI: https://pypi.org/project/chromadb-admin/" -ForegroundColor Cyan
                Write-Host "  - Docker: https://hub.docker.com/r/neetpalsingh/chromadb-admin" -ForegroundColor Cyan
                Write-Host ""
            } else {
                Write-Host "Cancelled." -ForegroundColor Yellow
            }
            
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        '5' {
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  Publishing Documentation" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Available guides:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "1. STEP_BY_STEP_PUBLISHING.md" -ForegroundColor White
            Write-Host "   Complete step-by-step guide for all platforms" -ForegroundColor Gray
            Write-Host ""
            Write-Host "2. PUBLISHING_GUIDE.md" -ForegroundColor White
            Write-Host "   Detailed publishing documentation" -ForegroundColor Gray
            Write-Host ""
            Write-Host "3. PRE_PUBLISH_CHECKLIST.md" -ForegroundColor White
            Write-Host "   Checklist before publishing" -ForegroundColor Gray
            Write-Host ""
            
            $guide = Read-Host "Which guide would you like to open? (1/2/3 or Enter to skip)"
            
            switch ($guide) {
                '1' { code STEP_BY_STEP_PUBLISHING.md }
                '2' { code PUBLISHING_GUIDE.md }
                '3' { code PRE_PUBLISH_CHECKLIST.md }
            }
            
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        '0' {
            Write-Host "Goodbye! 👋" -ForegroundColor Cyan
            break
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Write-Host ""
            Start-Sleep -Seconds 1
        }
    }
    
} while ($choice -ne '0')

Write-Host ""
Write-Host "✓ Script completed!" -ForegroundColor Green
