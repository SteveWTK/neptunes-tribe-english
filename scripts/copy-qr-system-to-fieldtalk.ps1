# PowerShell script to copy QR Campaign Guest Access System to FieldTalk
# Run from any directory - uses absolute paths

$source = "c:\Developer\INSPIRE\neptunes-tribe-english"
$dest = "c:\Developer\INSPIRE\premier-sports-english"

Write-Host "Copying QR Campaign Guest Access System from Habitat to FieldTalk..." -ForegroundColor Cyan
Write-Host ""

# Define all files to copy (source relative path)
$files = @(
    # API Routes - guest-access
    "src\app\api\guest-access\generate\route.js",
    "src\app\api\guest-access\activate\route.js",
    "src\app\api\guest-access\status\route.js",
    "src\app\api\guest-access\claim\route.js",
    "src\app\api\guest-access\campaigns\route.js",
    "src\app\api\guest-access\campaigns\[id]\route.js",

    # API Routes - cron
    "src\app\api\cron\cleanup-guests\route.js",

    # Guest pages
    "src\app\guest\[token]\page.js",
    "src\app\guest\layout.js",

    # Admin page
    "src\app\(site)\admin\qr-campaigns\page.js",

    # Claim account page
    "src\app\(site)\claim-account\page.js",

    # Guest components
    "src\components\guest\GuestBanner.js",
    "src\components\guest\GuestExpiredOverlay.js"
)

$copiedCount = 0
$errorCount = 0

foreach ($file in $files) {
    $sourcePath = Join-Path $source $file
    $destPath = Join-Path $dest $file
    $destDir = Split-Path $destPath -Parent

    # Create destination directory if it doesn't exist
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Write-Host "  Created directory: $destDir" -ForegroundColor DarkGray
    }

    # Copy the file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  Copied: $file" -ForegroundColor Green
        $copiedCount++
    } else {
        Write-Host "  NOT FOUND: $file" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files copied: $copiedCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Files not found: $errorCount" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open FieldTalk project in VS Code"
Write-Host "  2. Run the SQL migrations in Supabase"
Write-Host "  3. Paste the implementation prompt to Claude Code"
Write-Host "  4. Add CRON_SECRET to Vercel environment variables"
Write-Host ""
