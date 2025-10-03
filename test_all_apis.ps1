#!/usr/bin/env pwsh

Write-Host "=== COMPREHENSIVE API TESTING SCRIPT ===" -ForegroundColor Green
Write-Host "Testing all critical API endpoints..." -ForegroundColor Yellow

$baseUrl = "http://localhost:8000/api"

# Test 1: Menu Items API
Write-Host "`n1. Testing Menu Items API..." -ForegroundColor Cyan
try {
    # Test GET menu items
    $menuItems = Invoke-RestMethod -Uri "$baseUrl/menu-items" -Method GET
    Write-Host "✅ GET Menu Items: Success - Found $($menuItems.data.Count) items" -ForegroundColor Green
    
    # Test CREATE menu item
    $newMenuItem = @{
        name = "Test API Burger"
        description = "API Test burger"
        price = 15.99
        category = "Main Course"
        available = $true
        featured = $false
    }
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/menu-items" -Method POST -ContentType "application/json" -Body ($newMenuItem | ConvertTo-Json)
    Write-Host "✅ CREATE Menu Item: Success - Created item ID $($createResponse.data.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Menu Items API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Orders API
Write-Host "`n2. Testing Orders API..." -ForegroundColor Cyan
try {
    # Test GET orders
    $orders = Invoke-RestMethod -Uri "$baseUrl/orders" -Method GET
    Write-Host "✅ GET Orders: Success - Found $($orders.data.Count) orders" -ForegroundColor Green
    
    # Test CREATE order
    $newOrder = @{
        customerName = "API Test Customer"
        customerPhone = "01234567890"
        orderType = "dine-in"
        tableNumber = 10
        items = @(
            @{
                id = 1
                quantity = 2
            }
        )
        notes = "API test order"
    }
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -ContentType "application/json" -Body ($newOrder | ConvertTo-Json -Depth 3)
    Write-Host "✅ CREATE Order: Success - Created order $($orderResponse.data.order_number)" -ForegroundColor Green
} catch {
    Write-Host "❌ Orders API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Bills API
Write-Host "`n3. Testing Bills API..." -ForegroundColor Cyan
try {
    $bills = Invoke-RestMethod -Uri "$baseUrl/bills" -Method GET
    Write-Host "✅ GET Bills: Success - Found $($bills.data.Count) bills" -ForegroundColor Green
} catch {
    Write-Host "❌ Bills API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Settings API
Write-Host "`n4. Testing Settings API..." -ForegroundColor Cyan
try {
    $settings = Invoke-RestMethod -Uri "$baseUrl/settings" -Method GET
    Write-Host "✅ GET Settings: Success - Found $($settings.data.Count) settings" -ForegroundColor Green
} catch {
    Write-Host "❌ Settings API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Inventory API
Write-Host "`n5. Testing Inventory API..." -ForegroundColor Cyan
try {
    $inventory = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method GET
    Write-Host "✅ GET Inventory: Success - Found $($inventory.data.Count) items" -ForegroundColor Green
} catch {
    Write-Host "❌ Inventory API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Analytics API
Write-Host "`n6. Testing Analytics API..." -ForegroundColor Cyan
try {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/simple-analytics/dashboard-stats" -Method GET
    Write-Host "✅ GET Analytics: Success - Retrieved dashboard stats" -ForegroundColor Green
} catch {
    Write-Host "❌ Analytics API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== API TESTING COMPLETE ===" -ForegroundColor Green
Write-Host "All critical backend APIs have been tested." -ForegroundColor Yellow
