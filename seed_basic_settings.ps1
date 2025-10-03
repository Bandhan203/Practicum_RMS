Write-Host "=== SEEDING BASIC SETTINGS ===" -ForegroundColor Green

# Create basic settings one by one
$basicSettings = @(
    @{ key = "restaurant_name"; value = "Smart Dine Restaurant"; type = "string"; category = "restaurant" },
    @{ key = "restaurant_phone"; value = "+880 1234567890"; type = "string"; category = "restaurant" },
    @{ key = "currency"; value = "BDT"; type = "string"; category = "regional" },
    @{ key = "tax_rate"; value = "15"; type = "number"; category = "business" },
    @{ key = "service_charge"; value = "10"; type = "number"; category = "business" }
)

foreach ($setting in $basicSettings) {
    try {
        $data = @{
            settings = @{
                $setting.key = @{
                    value = $setting.value
                    type = $setting.type
                    category = $setting.category
                }
            }
        } | ConvertTo-Json -Depth 3

        Write-Host "Creating setting: $($setting.key)" -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -Body $data -ContentType "application/json" -TimeoutSec 10
        
        Write-Host "✅ $($setting.key) created successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to create $($setting.key): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test settings retrieval
Write-Host "`nTesting settings retrieval..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings" -Method GET -TimeoutSec 10
    Write-Host "✅ Settings retrieved successfully!" -ForegroundColor Green
    Write-Host "Settings: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to retrieve settings: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== SETTINGS SEEDING COMPLETE ===" -ForegroundColor Green
