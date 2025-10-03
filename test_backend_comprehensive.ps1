# Comprehensive Backend Test Script for Restaurant POS System
Write-Host "🚀 Starting Comprehensive Backend Test for Restaurant POS System" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

$baseUrl = "http://127.0.0.1:8000/api"
$testResults = @()

# Function to test API endpoint
function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = @{},
        [string]$Description
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
            'Accept' = 'application/json'
        }
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -TimeoutSec 10
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -Headers $headers -TimeoutSec 10
        }
        
        Write-Host "SUCCESS: $Description" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        
        return @{
            Test = $Description
            Status = "SUCCESS"
            Response = $response
        }
    }
    catch {
        Write-Host "FAILED: $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        return @{
            Test = $Description
            Status = "FAILED"
            Error = $_.Exception.Message
        }
    }
}

# 1. Test Basic Server Connectivity
Write-Host "`n📡 TESTING BASIC SERVER CONNECTIVITY" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/test-analytics-simple" -Description "Basic Server Test"

# 2. Test Settings API
Write-Host "`n⚙️ TESTING SETTINGS API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/settings" -Description "Get All Settings"

# 3. Test Menu Items API
Write-Host "`n🍽️ TESTING MENU ITEMS API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/menu-items" -Description "Get All Menu Items"

# Create a test menu item
$menuItem = @{
    name = "Test Burger"
    description = "A delicious test burger"
    price = 12.99
    category = "Main Course"
    is_available = $true
}
$testResults += Test-ApiEndpoint -Url "$baseUrl/menu-items" -Method "POST" -Body $menuItem -Description "Create Menu Item"

# 4. Test Inventory API
Write-Host "`n📦 TESTING INVENTORY API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/inventory" -Description "Get All Inventory"

# Create a test inventory item
$inventoryItem = @{
    name = "Test Ingredient"
    category = "Ingredients"
    quantity = 100
    unit = "kg"
    minimum_quantity = 10
    cost_per_unit = 5.50
}
$testResults += Test-ApiEndpoint -Url "$baseUrl/inventory" -Method "POST" -Body $inventoryItem -Description "Create Inventory Item"

# 5. Test Orders API
Write-Host "`n📋 TESTING ORDERS API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/orders" -Description "Get All Orders"

# Create a test order
$order = @{
    customer_name = "Test Customer"
    customer_phone = "1234567890"
    table_number = 5
    order_type = "dine_in"
    items = @(
        @{
            menu_item_id = 1
            quantity = 2
            unit_price = 12.99
            special_instructions = "No onions"
        }
    )
}
$testResults += Test-ApiEndpoint -Url "$baseUrl/orders" -Method "POST" -Body $order -Description "Create Order"

# 6. Test Bills API
Write-Host "`n💰 TESTING BILLS API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/bills" -Description "Get All Bills"

# 7. Test Analytics API
Write-Host "`n📊 TESTING ANALYTICS API" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/simple-analytics/dashboard-stats?period=today" -Description "Dashboard Analytics"
$testResults += Test-ApiEndpoint -Url "$baseUrl/orders-statistics" -Description "Orders Statistics"

# 8. Test Authentication (if needed)
Write-Host "`n🔐 TESTING AUTHENTICATION" -ForegroundColor Magenta
$loginData = @{
    email = "admin@restaurant.com"
    password = "password123"
}
$testResults += Test-ApiEndpoint -Url "$baseUrl/login" -Method "POST" -Body $loginData -Description "User Login"

# 9. Test Database Connection
Write-Host "`n🗄️ TESTING DATABASE CONNECTION" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Url "$baseUrl/test-analytics-model" -Description "Database Model Test"

# 10. Seed Basic Data if needed
Write-Host "`n🌱 SEEDING BASIC DATA" -ForegroundColor Magenta

# Create basic settings
$basicSettings = @{
    settings = @(
        @{
            key = "restaurant_name"
            value = "Test Restaurant"
            type = "string"
            category = "general"
        },
        @{
            key = "tax_rate"
            value = "10"
            type = "number"
            category = "billing"
        },
        @{
            key = "service_charge"
            value = "5"
            type = "number"
            category = "billing"
        }
    )
}
$testResults += Test-ApiEndpoint -Url "$baseUrl/settings/batch" -Method "POST" -Body $basicSettings -Description "Seed Basic Settings"

# Summary Report
Write-Host "`n📋 TEST SUMMARY REPORT" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta

$successCount = ($testResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$failedCount = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$totalTests = $testResults.Count

Write-Host "`n📊 OVERALL RESULTS:" -ForegroundColor White
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failedCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($successCount / $totalTests) * 100, 2))%" -ForegroundColor Cyan

Write-Host "`n📝 DETAILED RESULTS:" -ForegroundColor White
foreach ($result in $testResults) {
    if ($result.Status -eq "SUCCESS") {
        Write-Host "✅ $($result.Test)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.Test) - $($result.Error)" -ForegroundColor Red
    }
}

if ($failedCount -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Your Restaurant POS Backend is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Please check the errors above and fix the issues." -ForegroundColor Yellow
}

Write-Host "`n🔗 Frontend should now be able to connect to:" -ForegroundColor Cyan
Write-Host "Backend API: http://127.0.0.1:8000/api" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan

Write-Host "`nBackend Test Complete!" -ForegroundColor Green
