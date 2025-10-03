# Comprehensive Billing System Test Script
Write-Host "=== COMPREHENSIVE BILLING SYSTEM TEST ===" -ForegroundColor Green

# Test 1: Check if backend is running
Write-Host "`n1. Testing Backend Connection..." -ForegroundColor Yellow
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:8000/api/bills" -Method GET -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Backend is running - Status: $($backendTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check if frontend is running
Write-Host "`n2. Testing Frontend Connection..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend is running - Status: $($frontendTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get bills list
Write-Host "`n3. Getting Bills List..." -ForegroundColor Yellow
try {
    $billsResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/bills" -Method GET -ContentType "application/json"
    $bills = $billsResponse.Content | ConvertFrom-Json
    
    if ($bills.success -and $bills.data.Count -gt 0) {
        Write-Host "✅ Found $($bills.data.Count) bills" -ForegroundColor Green
        $testBill = $bills.data[0]
        Write-Host "Test Bill: $($testBill.bill_number) - Amount: $($testBill.total_amount) - Status: $($testBill.payment_status)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ No bills found or invalid response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get bills list" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Test payment processing
Write-Host "`n4. Testing Payment Processing..." -ForegroundColor Yellow
$paymentData = @{
    paid_amount = [double]$testBill.total_amount
    payment_method = "cash"
    payment_reference = "TEST-PAYMENT-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
} | ConvertTo-Json

try {
    $paymentResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/bills/$($testBill.id)/payment" -Method POST -ContentType "application/json" -Body $paymentData
    $paymentResult = $paymentResponse.Content | ConvertFrom-Json
    
    if ($paymentResult.success) {
        Write-Host "✅ Payment processed successfully!" -ForegroundColor Green
        Write-Host "Bill Status: $($paymentResult.data.payment_status)" -ForegroundColor Cyan
        Write-Host "Change Amount: $($paymentResult.change_amount)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Payment processing failed" -ForegroundColor Red
        Write-Host "Error: $($paymentResult.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Payment processing request failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody" -ForegroundColor Red
    }
}

# Test 5: Check CORS headers
Write-Host "`n5. Testing CORS Headers..." -ForegroundColor Yellow
try {
    $corsTest = Invoke-WebRequest -Uri "http://localhost:8000/api/bills" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    Write-Host "✅ CORS preflight successful - Status: $($corsTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ CORS preflight failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green
