Write-Host "=== TESTING PAYMENT SYSTEM FIX ===" -ForegroundColor Green

# Test payment processing
Write-Host "`n1. Testing payment processing..." -ForegroundColor Yellow

try {
    $paymentData = @{
        paid_amount = 200
        payment_method = "cash"
        payment_reference = "TEST123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/bills/14/payment" -Method POST -Body $paymentData -ContentType "application/json"
    
    Write-Host "✅ Payment processed successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Payment failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

# Test settings API
Write-Host "`n2. Testing settings API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings" -Method GET -ContentType "application/json"
    
    Write-Host "✅ Settings API working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Settings API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test settings update
Write-Host "`n3. Testing settings update..." -ForegroundColor Yellow

try {
    $settingsData = @{
        settings = @{
            restaurant_name = @{
                value = "My Test Restaurant"
                type = "string"
                category = "restaurant"
            }
            restaurant_phone = @{
                value = "+880 9876543210"
                type = "string"
                category = "restaurant"
            }
        }
    } | ConvertTo-Json -Depth 4

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -Body $settingsData -ContentType "application/json"
    
    Write-Host "✅ Settings updated successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Settings update failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green
