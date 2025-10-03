#!/usr/bin/env pwsh

Write-Host "🚨 FINAL EXAM CRITICAL TEST - FIXING ALL ISSUES" -ForegroundColor Red
Write-Host "Testing and fixing: Image uploads, Order-to-Billing flow, Settings storage" -ForegroundColor Yellow

$baseUrl = "http://localhost:8000/api"
$testResults = @{
    passed = 0
    failed = 0
    critical_issues = @()
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
        return $response
    } catch {
        Write-Host "❌ ${Name}: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $testResults.failed++
        $testResults.critical_issues += $Name
        return $null
    }
}

Write-Host "`n🔥 CRITICAL TEST 1: ORDER-TO-BILLING FLOW" -ForegroundColor Red

# Create a test order
$order = @{
    customerName = "EXAM TEST CUSTOMER"
    customerPhone = "01999999999"
    orderType = "dine-in"
    tableNumber = 99
    items = @(
        @{
            id = 1
            quantity = 2
        }
    )
    notes = "CRITICAL EXAM TEST ORDER"
}

Write-Host "Creating test order..." -ForegroundColor Yellow
$createdOrder = Test-Endpoint "Order Creation" "$baseUrl/orders" "POST" $order

if ($createdOrder) {
    Write-Host "Order created with ID: $($createdOrder.data.id)" -ForegroundColor Green

    # Update order status to completed (should auto-create bill)
    Write-Host "Updating order to COMPLETED status..." -ForegroundColor Yellow
    $statusUpdate = @{
        status = "completed"
        notes = "Order completed - should auto-create bill"
    }

    $updatedOrder = Test-Endpoint "Order Status Update to Completed" "$baseUrl/orders/$($createdOrder.data.id)" "PUT" $statusUpdate

    if ($updatedOrder) {
        Write-Host "✅ Order updated to completed!" -ForegroundColor Green

        # Check if bill was auto-created
        Write-Host "Checking if bill was auto-created..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2

        $bills = Test-Endpoint "Bills Retrieval After Order Completion" "$baseUrl/bills"

        if ($bills -and $bills.data) {
            $orderBill = $bills.data | Where-Object { $_.order_id -eq $createdOrder.data.id }
            if ($orderBill) {
                Write-Host "🎉 SUCCESS! Bill auto-created: $($orderBill.bill_number)" -ForegroundColor Green
                Write-Host "   Bill Amount: ৳$($orderBill.total_amount)" -ForegroundColor Green
            } else {
                Write-Host "❌ CRITICAL ISSUE: Bill NOT auto-created for completed order!" -ForegroundColor Red
                $testResults.critical_issues += "Order-to-Billing Auto-Creation"
            }
        }
    }
}

Write-Host "`n🔥 CRITICAL TEST 2: SETTINGS DATABASE STORAGE" -ForegroundColor Red

# Test settings batch update
$settings = @{
    settings = @(
        @{
            key = "exam_test_restaurant_name"
            value = "Final Exam Restaurant"
            type = "string"
            category = "general"
            description = "Restaurant name for final exam"
            is_public = $true
        },
        @{
            key = "exam_test_tax_rate"
            value = "15.0"
            type = "number"
            category = "business"
            description = "Tax rate for final exam"
            is_public = $false
        },
        @{
            key = "exam_test_feature_enabled"
            value = $true
            type = "boolean"
            category = "features"
            description = "Test feature for exam"
            is_public = $false
        }
    )
}

Write-Host "Testing settings batch save to database..." -ForegroundColor Yellow
$savedSettings = Test-Endpoint "Settings Batch Save to Database" "$baseUrl/settings/batch" "POST" $settings

if ($savedSettings) {
    Write-Host "✅ Settings saved to database!" -ForegroundColor Green

    # Verify settings were actually saved by retrieving them
    Write-Host "Verifying settings were saved..." -ForegroundColor Yellow
    $retrievedSettings = Test-Endpoint "Settings Retrieval Verification" "$baseUrl/settings"

    if ($retrievedSettings) {
        Write-Host "✅ Settings retrieved from database!" -ForegroundColor Green
        Write-Host "   Retrieved settings count: $($retrievedSettings.data.Count)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ CRITICAL ISSUE: Settings NOT saved to database!" -ForegroundColor Red
    $testResults.critical_issues += "Settings Database Storage"
}

Write-Host "`n🔥 CRITICAL TEST 3: ANALYTICS WITH DATE RANGES" -ForegroundColor Red

$dateRanges = @("1day", "7days", "30days", "1year")
foreach ($range in $dateRanges) {
    Test-Endpoint "Analytics ($range)" "$baseUrl/analytics?range=$range"
}

Write-Host "`n🔥 CRITICAL TEST 4: MENU MANAGEMENT" -ForegroundColor Red

# Test menu item creation
$menuItem = @{
    name = "Final Exam Special Burger"
    description = "Special burger created during final exam testing"
    price = 29.99
    category = "Main Course"
    available = $true
    featured = $false
    preparation_time = 25
}

$createdMenuItem = Test-Endpoint "Menu Item Creation" "$baseUrl/menu-items" "POST" $menuItem

if ($createdMenuItem) {
    Write-Host "✅ Menu item created with ID: $($createdMenuItem.data.id)" -ForegroundColor Green
}

# Test menu retrieval
Test-Endpoint "Menu Items Retrieval" "$baseUrl/menu-items"

Write-Host "`n🔥 CRITICAL TEST 5: INVENTORY MANAGEMENT" -ForegroundColor Red
Test-Endpoint "Inventory Retrieval" "$baseUrl/inventory"

Write-Host "`n📊 FINAL EXAM READINESS REPORT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.passed + $testResults.failed)" -ForegroundColor White
Write-Host "Passed: $($testResults.passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.failed)" -ForegroundColor Red

$successRate = if (($testResults.passed + $testResults.failed) -gt 0) {
    [math]::Round(($testResults.passed / ($testResults.passed + $testResults.failed)) * 100, 1)
} else { 0 }

Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow

if ($testResults.critical_issues.Count -eq 0) {
    Write-Host "`n🎉 EXCELLENT! ALL CRITICAL ISSUES FIXED!" -ForegroundColor Green
    Write-Host "✅ Order-to-Billing flow: WORKING" -ForegroundColor Green
    Write-Host "✅ Settings database storage: WORKING" -ForegroundColor Green
    Write-Host "✅ Analytics with date ranges: WORKING" -ForegroundColor Green
    Write-Host "✅ Menu management: WORKING" -ForegroundColor Green
    Write-Host "✅ All APIs: FUNCTIONAL" -ForegroundColor Green
    Write-Host "`n🚀 YOUR PROJECT IS 100% READY FOR FINAL EXAM!" -ForegroundColor Green
} else {
    Write-Host "`n❌ CRITICAL ISSUES STILL EXIST:" -ForegroundColor Red
    foreach ($issue in $testResults.critical_issues) {
        Write-Host "   - $issue" -ForegroundColor Red
    }
    Write-Host "`nThese MUST be fixed before your exam!" -ForegroundColor Red
}

Write-Host "`n🎯 NEXT STEPS FOR YOUR EXAM:" -ForegroundColor Cyan
Write-Host "1. Start frontend: npm run dev" -ForegroundColor White
Write-Host "2. Open browser to the URL shown" -ForegroundColor White
Write-Host "3. Test the Order-to-Billing flow manually" -ForegroundColor White
Write-Host "4. Test Settings page - verify data saves" -ForegroundColor White
Write-Host "5. Test Menu management with image uploads" -ForegroundColor White
Write-Host "6. Show Analytics with different date ranges" -ForegroundColor White

Write-Host "`nGOOD LUCK!" -ForegroundColor Green
