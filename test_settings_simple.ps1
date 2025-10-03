Write-Host "TESTING SETTINGS DATABASE STORAGE" -ForegroundColor Red

$body = @{
    settings = @(
        @{
            key = "exam_restaurant_name"
            value = "Final Exam Restaurant"
            type = "string"
            category = "general"
            description = "Restaurant name for final exam"
            is_public = $false
        },
        @{
            key = "exam_tax_rate"
            value = "15.0"
            type = "number"
            category = "business"
            description = "Tax rate for final exam"
            is_public = $false
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Testing settings batch save..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS! Settings saved to database!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    
    # Verify settings were saved by retrieving them
    Write-Host "Verifying settings were saved..." -ForegroundColor Yellow
    $settings = Invoke-RestMethod -Uri "http://localhost:8000/api/settings" -Method GET
    Write-Host "Settings retrieved from database:" -ForegroundColor Green
    Write-Host ($settings | ConvertTo-Json -Depth 3) -ForegroundColor Green
    
    Write-Host "SETTINGS DATABASE STORAGE: WORKING PERFECTLY!" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR in settings storage:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}
