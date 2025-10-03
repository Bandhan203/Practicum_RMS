Write-Host "=== SEEDING DEFAULT SETTINGS ===" -ForegroundColor Green

# Default settings data
$defaultSettings = @{
    settings = @{
        restaurant_name = @{
            value = "Smart Dine Restaurant"
            type = "string"
            category = "restaurant"
            description = "Restaurant name displayed in the system"
        }
        restaurant_phone = @{
            value = "+880 1234567890"
            type = "string"
            category = "restaurant"
            description = "Restaurant contact phone number"
        }
        restaurant_email = @{
            value = "info@smartdine.com"
            type = "string"
            category = "restaurant"
            description = "Restaurant contact email"
        }
        restaurant_address = @{
            value = "123 Main Street, Dhaka, Bangladesh"
            type = "string"
            category = "restaurant"
            description = "Restaurant physical address"
        }
        currency = @{
            value = "BDT (৳)"
            type = "string"
            category = "regional"
            description = "Default currency for the system"
        }
        timezone = @{
            value = "Asia/Dhaka"
            type = "string"
            category = "regional"
            description = "System timezone"
        }
        date_format = @{
            value = "DD/MM/YYYY"
            type = "string"
            category = "regional"
            description = "Date display format"
        }
        time_format = @{
            value = "24h"
            type = "string"
            category = "regional"
            description = "Time display format"
        }
        tax_rate = @{
            value = "15"
            type = "number"
            category = "business"
            description = "Default tax rate percentage"
        }
        service_charge = @{
            value = "10"
            type = "number"
            category = "business"
            description = "Default service charge percentage"
        }
        theme = @{
            value = "light"
            type = "string"
            category = "display"
            description = "System theme preference"
        }
        language = @{
            value = "en"
            type = "string"
            category = "display"
            description = "System language"
        }
    }
}

try {
    $jsonData = $defaultSettings | ConvertTo-Json -Depth 4
    
    Write-Host "Sending settings data..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/settings/batch" -Method POST -Body $jsonData -ContentType "application/json"
    
    Write-Host "✅ Default settings seeded successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to seed settings: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== SEEDING COMPLETE ===" -ForegroundColor Green
