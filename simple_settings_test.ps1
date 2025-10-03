Write-Host "=== SIMPLE SETTINGS TEST ===" -ForegroundColor Green

try {
    $testData = @{
        settings = @{
            test_setting = @{
                value = "test value"
                type = "string"
                category = "general"
            }
        }
    } | ConvertTo-Json -Depth 3

    Write-Host "Testing settings API..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Settings API working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Settings API failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green
