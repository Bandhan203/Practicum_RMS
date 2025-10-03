Write-Host "TESTING ORDER-TO-BILLING FLOW" -ForegroundColor Red

# Step 1: Create order
$order = @{
    customerName = "CRITICAL TEST CUSTOMER"
    customerPhone = "01999999999"
    orderType = "dine-in"
    tableNumber = 99
    items = @(
        @{
            id = 10
            quantity = 2
        }
    )
    notes = "CRITICAL EXAM TEST ORDER"
} | ConvertTo-Json -Depth 3

Write-Host "Creating order..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/orders" -Method POST -ContentType "application/json" -Body $order
    $orderId = $response.data.id
    Write-Host "Order created with ID: $orderId" -ForegroundColor Green
    
    # Step 2: Update order to completed
    Write-Host "Updating order to COMPLETED status..." -ForegroundColor Yellow
    $statusUpdate = @{
        status = "completed"
        notes = "Order completed - should auto-create bill"
    } | ConvertTo-Json
    
    $updatedOrder = Invoke-RestMethod -Uri "http://localhost:8000/api/orders/$orderId" -Method PUT -ContentType "application/json" -Body $statusUpdate
    Write-Host "Order updated to completed!" -ForegroundColor Green
    
    # Step 3: Check if bill was auto-created
    Write-Host "Checking if bill was auto-created..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    $bills = Invoke-RestMethod -Uri "http://localhost:8000/api/bills"
    $orderBill = $bills.data | Where-Object { $_.order_id -eq $orderId }
    
    if ($orderBill) {
        Write-Host "SUCCESS! Bill auto-created: $($orderBill.bill_number)" -ForegroundColor Green
        Write-Host "Bill Amount: $($orderBill.total_amount)" -ForegroundColor Green
        Write-Host "Order ID: $($orderBill.order_id)" -ForegroundColor Green
        Write-Host "ORDER-TO-BILLING FLOW: WORKING PERFECTLY!" -ForegroundColor Green
    } else {
        Write-Host "CRITICAL ISSUE: Bill NOT auto-created for completed order!" -ForegroundColor Red
        Write-Host "Order ID: $orderId" -ForegroundColor Red
        Write-Host "Available bills:" -ForegroundColor Yellow
        $bills.data | ForEach-Object { Write-Host "Bill: $($_.bill_number), Order: $($_.order_id)" -ForegroundColor White }
    }
    
} catch {
    Write-Host "ERROR in order-to-billing flow:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
