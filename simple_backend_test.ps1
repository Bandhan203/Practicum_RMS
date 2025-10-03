# Simple Backend Test Script for Restaurant POS System
Write-Host "Starting Backend Test for Restaurant POS System" -ForegroundColor Green

$baseUrl = "http://127.0.0.1:8000/api"

# Function to test API endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5
        Write-Host "SUCCESS: $Description" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "FAILED: $Description - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test basic connectivity
Write-Host "`nTesting Basic Server Connectivity..." -ForegroundColor Cyan
$test1 = Test-Endpoint -Url "$baseUrl/test-analytics-simple" -Description "Basic Server Test"

# Test Settings API
Write-Host "`nTesting Settings API..." -ForegroundColor Cyan
$test2 = Test-Endpoint -Url "$baseUrl/settings" -Description "Settings API"

# Test Menu Items API
Write-Host "`nTesting Menu Items API..." -ForegroundColor Cyan
$test3 = Test-Endpoint -Url "$baseUrl/menu-items" -Description "Menu Items API"

# Test Inventory API
Write-Host "`nTesting Inventory API..." -ForegroundColor Cyan
$test4 = Test-Endpoint -Url "$baseUrl/inventory" -Description "Inventory API"

# Test Orders API
Write-Host "`nTesting Orders API..." -ForegroundColor Cyan
$test5 = Test-Endpoint -Url "$baseUrl/orders" -Description "Orders API"

# Test Analytics API
Write-Host "`nTesting Analytics API..." -ForegroundColor Cyan
$test6 = Test-Endpoint -Url "$baseUrl/simple-analytics/dashboard-stats?period=today" -Description "Analytics API"

# Summary
$passedTests = @($test1, $test2, $test3, $test4, $test5, $test6) | Where-Object { $_ -eq $true }
$totalTests = 6
$passedCount = $passedTests.Count

Write-Host "`nTest Summary:" -ForegroundColor White
Write-Host "Passed: $passedCount/$totalTests" -ForegroundColor Green

if ($passedCount -eq $totalTests) {
    Write-Host "All tests passed! Backend is working correctly." -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check the Laravel server status." -ForegroundColor Yellow
}

Write-Host "Backend should be running on: http://127.0.0.1:8000" -ForegroundColor Cyan
