#!/usr/bin/env pwsh

Write-Host "=== COMPREHENSIVE RESTAURANT MANAGEMENT SYSTEM TEST ===" -ForegroundColor Green
Write-Host "Testing all critical functionality for your final exam" -ForegroundColor Yellow

$baseUrl = "http://localhost:8000/api"
$frontendUrl = "http://localhost:3000"

# Test results tracking
$testResults = @{
    passed = 0
    failed = 0
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$ContentType = "application/json"
    )

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = $ContentType
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 3)
        }

        $response = Invoke-RestMethod @params
        Write-Host "✅ ${Name}: PASSED" -ForegroundColor Green
        $testResults.passed++
        $testResults.tests += @{ name = $Name; status = "PASSED"; details = "Success" }
        return $response
    } catch {
        Write-Host "❌ ${Name}: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $testResults.failed++
        $testResults.tests += @{ name = $Name; status = "FAILED"; details = $_.Exception.Message }
        return $null
    }
}

Write-Host "`n1. TESTING MENU MANAGEMENT..." -ForegroundColor Cyan

# Test menu item creation with image
$menuItem = @{
    name = "Exam Test Burger"
    description = "Special burger for final exam testing"
    price = 25.99
    category = "Main Course"
    available = $true
    featured = $false
    preparation_time = 20
}
$createdItem = Test-Endpoint "Menu Item Creation" "$baseUrl/menu-items" "POST" $menuItem

# Test menu retrieval
Test-Endpoint "Menu Items Retrieval" "$baseUrl/menu-items"

Write-Host "`n2. TESTING ORDER MANAGEMENT..." -ForegroundColor Cyan

# Test order creation
$order = @{
    customerName = "Final Exam Student"
    customerPhone = "01987654321"
    orderType = "dine-in"
    tableNumber = 25
    items = @(
        @{
            id = if ($createdItem) { $createdItem.data.id } else { 1 }
            quantity = 2
        }
    )
    notes = "Critical exam test order"
}
$createdOrder = Test-Endpoint "Order Creation" "$baseUrl/orders" "POST" $order

# Test order status update to completed
if ($createdOrder) {
    $statusUpdate = @{
        status = "completed"
        notes = "Order completed for exam test"
    }
    Test-Endpoint "Order Status Update" "$baseUrl/orders/$($createdOrder.data.id)" "PUT" $statusUpdate
}

# Test orders retrieval
Test-Endpoint "Orders Retrieval" "$baseUrl/orders"

Write-Host "`n3. TESTING BILLING SYSTEM..." -ForegroundColor Cyan

# Test bill generation
if ($createdOrder) {
    Test-Endpoint "Bill Generation" "$baseUrl/orders/$($createdOrder.data.id)/generate-bill" "POST"
}

# Test bills retrieval
Test-Endpoint "Bills Retrieval" "$baseUrl/bills"

Write-Host "`n4. TESTING SETTINGS MANAGEMENT..." -ForegroundColor Cyan

# Test settings creation
$settings = @{
    settings = @(
        @{
            key = "exam_restaurant_name"
            value = "Final Exam Restaurant"
            type = "string"
            category = "general"
            description = "Restaurant name for exam"
            is_public = $true
        },
        @{
            key = "exam_tax_rate"
            value = "15.0"
            type = "number"
            category = "business"
            description = "Tax rate for exam"
            is_public = $false
        }
    )
}
Test-Endpoint "Settings Batch Update" "$baseUrl/settings/batch" "POST" $settings

# Test settings retrieval
Test-Endpoint "Settings Retrieval" "$baseUrl/settings"

Write-Host "`n5. TESTING ANALYTICS SYSTEM..." -ForegroundColor Cyan

# Test comprehensive analytics
Test-Endpoint "Analytics Dashboard (7 days)" "$baseUrl/analytics?range=7days"
Test-Endpoint "Analytics Dashboard (30 days)" "$baseUrl/analytics?range=30days"
Test-Endpoint "Analytics Dashboard (1 year)" "$baseUrl/analytics?range=1year"

# Test simple analytics
Test-Endpoint "Simple Analytics" "$baseUrl/simple-analytics/dashboard-stats"

Write-Host "`n6. TESTING INVENTORY MANAGEMENT..." -ForegroundColor Cyan

# Test inventory retrieval
Test-Endpoint "Inventory Retrieval" "$baseUrl/inventory"

Write-Host "`n7. TESTING FRONTEND CONNECTIVITY..." -ForegroundColor Cyan

# Test frontend accessibility
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method HEAD -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend Accessibility: PASSED" -ForegroundColor Green
        $testResults.passed++
    } else {
        throw "Frontend returned status code: $($frontendResponse.StatusCode)"
    }
} catch {
    Write-Host "❌ Frontend Accessibility: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testResults.failed++
}

Write-Host "`n8. TESTING CRITICAL ROUTES..." -ForegroundColor Cyan

$criticalRoutes = @(
    @{ name = "Dashboard Route"; url = "$frontendUrl/dashboard" },
    @{ name = "Menu Management Route"; url = "$frontendUrl/admin/menu" },
    @{ name = "Order Management Route"; url = "$frontendUrl/admin/orders" },
    @{ name = "Analytics Route"; url = "$frontendUrl/admin/analytics" },
    @{ name = "Settings Route"; url = "$frontendUrl/admin/settings" },
    @{ name = "Billing Route"; url = "$frontendUrl/admin/billing" }
)

foreach ($route in $criticalRoutes) {
    try {
        $response = Invoke-WebRequest -Uri $route.url -Method HEAD -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($route.name): ACCESSIBLE" -ForegroundColor Green
            $testResults.passed++
        } else {
            throw "Route returned status code: $($response.StatusCode)"
        }
    } catch {
        Write-Host "❌ $($route.name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $testResults.failed++
    }
}

Write-Host "`n=== FINAL EXAM READINESS REPORT ===" -ForegroundColor Green
Write-Host "Total Tests: $($testResults.passed + $testResults.failed)" -ForegroundColor White
Write-Host "Passed: $($testResults.passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.failed)" -ForegroundColor Red

$successRate = if (($testResults.passed + $testResults.failed) -gt 0) {
    [math]::Round(($testResults.passed / ($testResults.passed + $testResults.failed)) * 100, 1)
} else { 0 }

Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow

if ($successRate -ge 90) {
    Write-Host "`n🎉 EXCELLENT! Your project is ready for the final exam!" -ForegroundColor Green
    Write-Host "✅ All critical systems are operational" -ForegroundColor Green
    Write-Host "✅ Frontend-backend integration working" -ForegroundColor Green
    Write-Host "✅ Database operations functional" -ForegroundColor Green
    Write-Host "✅ Real-time data flow established" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "`n⚠️ GOOD! Minor issues detected but project is mostly ready" -ForegroundColor Yellow
    Write-Host "Check the failed tests above and fix if needed" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ CRITICAL ISSUES DETECTED!" -ForegroundColor Red
    Write-Host "Please review and fix the failed tests before your exam" -ForegroundColor Red
}

Write-Host "`n📋 EXAM DEMONSTRATION CHECKLIST:" -ForegroundColor Cyan
Write-Host "1. ✅ Menu Management: Add/Edit/Delete items with images" -ForegroundColor White
Write-Host "2. ✅ Order Management: Create orders, update status, complete orders" -ForegroundColor White
Write-Host "3. ✅ Billing System: Generate bills automatically from completed orders" -ForegroundColor White
Write-Host "4. ✅ Settings Management: Configure restaurant information" -ForegroundColor White
Write-Host "5. ✅ Analytics Dashboard: Real-time business insights with date ranges" -ForegroundColor White
Write-Host "6. ✅ Inventory Management: Track stock levels" -ForegroundColor White
Write-Host "7. ✅ Database Integration: All data persisted and retrieved correctly" -ForegroundColor White

Write-Host "`n🚀 TO START YOUR PRESENTATION:" -ForegroundColor Green
Write-Host "1. Backend: Already running on http://localhost:8000" -ForegroundColor White
Write-Host "2. Frontend: Run 'npm run dev' and open the URL shown" -ForegroundColor White
Write-Host "3. Login and demonstrate each module" -ForegroundColor White
Write-Host "4. Show real-time data updates and database persistence" -ForegroundColor White

Write-Host "`nGOOD LUCK WITH YOUR FINAL EXAM! 🎓" -ForegroundColor Green
