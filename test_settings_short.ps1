Write-Host "TESTING SETTINGS WITH SHORT VALUES" -ForegroundColor Red

$body = @{
    settings = @(
        @{
            key = "test_name"
            value = "Test Restaurant"
            type = "string"
            category = "general"
            description = "Test setting"
            is_public = $false
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Testing settings batch save..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS! Settings saved!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}
