# AshaAssist Startup Script
Write-Host "Starting AshaAssist Application..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.runCommand('ping')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
        Write-Host "You can start MongoDB with: mongod" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "⚠ MongoDB is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MongoDB and ensure it's running" -ForegroundColor Yellow
}

# Start Backend
Write-Host "Starting Flask Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'c:\Users\alank\AshaAssist\backend'; python app.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'c:\Users\alank\AshaAssist\frontend'; npm start"

Write-Host "✓ AshaAssist is starting up!" -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")