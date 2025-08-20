# PowerShell Script: Open Supabase Dashboard SQL Editor and Copy SQL

Write-Host "Supabase SQL Execution Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray

# SQL file path
$sqlFile = Join-Path $PSScriptRoot "..\supabase\migrations\20240820000001_fix_database_issues.sql"

# Check if SQL file exists
if (Test-Path $sqlFile) {
    # Read SQL content
    $sqlContent = Get-Content $sqlFile -Raw
    
    # Copy to clipboard
    $sqlContent | Set-Clipboard
    
    Write-Host "SUCCESS: SQL copied to clipboard!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Browser will open automatically" -ForegroundColor White
    Write-Host "2. Login to Supabase" -ForegroundColor White
    Write-Host "3. Paste (Ctrl+V) in SQL Editor" -ForegroundColor White
    Write-Host "4. Click 'Run' button" -ForegroundColor White
    Write-Host ""
    
    # Wait 3 seconds
    Write-Host "Opening browser in 3 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    
    # Open Supabase Dashboard SQL Editor
    Start-Process "https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new"
    
    Write-Host ""
    Write-Host "SQL Preview (first 10 lines):" -ForegroundColor Cyan
    Write-Host "--------------------------------" -ForegroundColor Gray
    $lines = $sqlContent -split "`n"
    $lines[0..9] | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }
    Write-Host "... (Full content copied to clipboard)" -ForegroundColor Gray
    
} else {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Gray
Write-Host "Done! Execute manually if there are any issues." -ForegroundColor Green