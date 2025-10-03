#!/usr/bin/env pwsh

Write-Host "🔥 TESTING SETTINGS ENDPOINT" -ForegroundColor Red

$body = @{
    settings = @(
        @{
            key = "test_restaurant_name"
            value = "Final Exam Restaurant"
            type = "string"
            category = "general"
            description = "Restaurant name for final exam"
            is_public = $false
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ SUCCESS! Settings saved:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host "`n🔍 Testing settings retrieval..." -ForegroundColor Yellow
try {
    $settings = Invoke-RestMethod -Uri "http://localhost:8000/api/settings" -Method GET
    Write-Host "✅ Settings retrieved successfully!" -ForegroundColor Green
    Write-Host ($settings | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to retrieve settings:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
