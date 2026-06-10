# Script to verify Git commits and their dates
# Run this after setup-github-repo.ps1 to verify commits were created correctly

Set-Location -Path $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Commit Verification Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: No Git repository found!" -ForegroundColor Red
    Write-Host "Please run setup-github-repo.ps1 first." -ForegroundColor Yellow
    exit 1
}

# Get total commit count
$commitCount = (git rev-list --all --count)
Write-Host "Total Commits: $commitCount" -ForegroundColor Green
Write-Host ""

# Get commits by date
Write-Host "Commits by Date:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
git log --all --format="%ai | %s" --reverse

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Monthly Distribution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Count commits by month
$march = (git log --all --format="%ai" | Select-String "2026-03").Count
$april = (git log --all --format="%ai" | Select-String "2026-04").Count
$may = (git log --all --format="%ai" | Select-String "2026-05").Count
$june = (git log --all --format="%ai" | Select-String "2026-06").Count

Write-Host "March 2026:  $march commits" -ForegroundColor Green
Write-Host "April 2026:  $april commits" -ForegroundColor Green
Write-Host "May 2026:    $may commits" -ForegroundColor Green
Write-Host "June 2026:   $june commits" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Weekend vs Weekday Distribution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get all commit dates and check if weekend
$weekendCount = 0
$weekdayCount = 0

$allDates = git log --all --format="%ai"
foreach ($dateStr in $allDates) {
    $date = [DateTime]::Parse($dateStr)
    $dayOfWeek = $date.DayOfWeek
    
    if ($dayOfWeek -eq "Saturday" -or $dayOfWeek -eq "Sunday") {
        $weekendCount++
    } else {
        $weekdayCount++
    }
}

$weekendPercent = [math]::Round(($weekendCount / $commitCount) * 100, 1)
$weekdayPercent = [math]::Round(($weekdayCount / $commitCount) * 100, 1)

Write-Host "Weekend commits:  $weekendCount ($weekendPercent%)" -ForegroundColor Green
Write-Host "Weekday commits:  $weekdayCount ($weekdayPercent%)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Day of Week Breakdown" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$dayCount = @{}
foreach ($dateStr in $allDates) {
    $date = [DateTime]::Parse($dateStr)
    $dayName = $date.DayOfWeek.ToString()
    
    if ($dayCount.ContainsKey($dayName)) {
        $dayCount[$dayName]++
    } else {
        $dayCount[$dayName] = 1
    }
}

# Sort by day of week order
$dayOrder = @("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
foreach ($day in $dayOrder) {
    if ($dayCount.ContainsKey($day)) {
        $count = $dayCount[$day]
        $bar = "█" * $count
        if ($day -eq "Saturday" -or $day -eq "Sunday") {
            Write-Host "$day`.PadRight(12) $count commits  $bar" -ForegroundColor Cyan
        } else {
            Write-Host "$day`.PadRight(12) $count commits  $bar" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Repository Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check for remote
$hasRemote = git remote -v
if ($hasRemote) {
    Write-Host "Remote configured:" -ForegroundColor Green
    git remote -v
} else {
    Write-Host "No remote configured yet." -ForegroundColor Yellow
    Write-Host "Run the setup script to push to GitHub." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Latest 10 Commits" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git log --oneline --graph -10

Write-Host ""
Write-Host "✓ Verification Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the commit distribution above" -ForegroundColor White
Write-Host "2. If satisfied, push to GitHub using setup-github-repo.ps1" -ForegroundColor White
Write-Host "3. Or manually push with: git push -u origin main" -ForegroundColor White
Write-Host ""
