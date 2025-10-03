Write-Host "=== COMPREHENSIVE SYSTEM TEST ===" -ForegroundColor Green

# Start Laravel server
Write-Host "`n1. Starting Laravel server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Starter-Code-Backend--Interns\My_RMS\backend'; php artisan serve --port=8000"

# Wait for server to start
Start-Sleep -Seconds 5

# Test backend API
Write-Host "`n2. Testing backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/test-analytics-simple" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend API working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test payment system
Write-Host "`n3. Testing payment system..." -ForegroundColor Yellow
try {
    $paymentData = @{
        paid_amount = 150
        payment_method = "cash"
        payment_reference = "TEST456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/bills/14/payment" -Method POST -Body $paymentData -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "✅ Payment system working!" -ForegroundColor Green
    Write-Host "Payment processed: Amount=$($response.data.paid_amount), Change=$($response.change_amount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Payment system failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test menu API
Write-Host "`n4. Testing menu API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/menu-items" -Method GET -TimeoutSec 10
    Write-Host "✅ Menu API working!" -ForegroundColor Green
    Write-Host "Menu items count: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Menu API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test orders API
Write-Host "`n5. Testing orders API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/orders" -Method GET -TimeoutSec 10
    Write-Host "✅ Orders API working!" -ForegroundColor Green
    Write-Host "Orders count: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Orders API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test billing API
Write-Host "`n6. Testing billing API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/bills" -Method GET -TimeoutSec 10
    Write-Host "✅ Billing API working!" -ForegroundColor Green
    Write-Host "Bills count: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Billing API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test inventory API
Write-Host "`n7. Testing inventory API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/inventory" -Method GET -TimeoutSec 10
    Write-Host "✅ Inventory API working!" -ForegroundColor Green
    Write-Host "Inventory items count: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Inventory API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== BACKEND TESTS COMPLETE ===" -ForegroundColor Green

# Start frontend server
Write-Host "`n8. Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Starter-Code-Backend--Interns\My_RMS'; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 10

# Test frontend
Write-Host "`n9. Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend working!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Green
Write-Host "`n🚀 Your system is ready!" -ForegroundColor Magenta
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
