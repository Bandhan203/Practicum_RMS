# Seed Basic Data for Restaurant POS System
Write-Host "Seeding Basic Data for Restaurant POS System" -ForegroundColor Green

$baseUrl = "http://127.0.0.1:8000/api"

# Function to make API call
function Invoke-ApiCall {
    param(
        [string]$Url,
        [string]$Method = "POST",
        [hashtable]$Body = @{}
    )
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
            'Accept' = 'application/json'
        }
        
        $jsonBody = $Body | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -Headers $headers -TimeoutSec 10
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# 1. Seed Basic Settings
Write-Host "Seeding Basic Settings..." -ForegroundColor Yellow

$basicSettings = @{
    settings = @{
        restaurant_name = @{
            value = "Smart Dine Restaurant"
            type = "string"
            category = "general"
            description = "Restaurant name"
            is_public = $true
        }
        restaurant_address = @{
            value = "123 Main Street, City, State 12345"
            type = "string"
            category = "general"
            description = "Restaurant address"
            is_public = $true
        }
        restaurant_phone = @{
            value = "+1 (555) 123-4567"
            type = "string"
            category = "general"
            description = "Restaurant phone number"
            is_public = $true
        }
        tax_rate = @{
            value = "10"
            type = "number"
            category = "billing"
            description = "Tax rate percentage"
            is_public = $true
        }
        service_charge = @{
            value = "5"
            type = "number"
            category = "billing"
            description = "Service charge percentage"
            is_public = $true
        }
        currency = @{
            value = "USD"
            type = "string"
            category = "general"
            description = "Currency code"
            is_public = $true
        }
        timezone = @{
            value = "America/New_York"
            type = "string"
            category = "general"
            description = "Restaurant timezone"
            is_public = $true
        }
    }
}

$result = Invoke-ApiCall -Url "$baseUrl/settings/batch" -Body $basicSettings
if ($result.Success) {
    Write-Host "Settings seeded successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to seed settings: $($result.Error)" -ForegroundColor Red
}

# 2. Seed Sample Menu Items
Write-Host "Seeding Sample Menu Items..." -ForegroundColor Yellow

$menuItems = @(
    @{
        name = "Classic Burger"
        description = "Juicy beef patty with lettuce, tomato, and cheese"
        price = 12.99
        category = "Main Course"
        is_available = $true
        preparation_time = 15
    },
    @{
        name = "Caesar Salad"
        description = "Fresh romaine lettuce with Caesar dressing and croutons"
        price = 8.99
        category = "Salads"
        is_available = $true
        preparation_time = 10
    },
    @{
        name = "Margherita Pizza"
        description = "Classic pizza with tomato sauce, mozzarella, and basil"
        price = 14.99
        category = "Pizza"
        is_available = $true
        preparation_time = 20
    },
    @{
        name = "Chocolate Cake"
        description = "Rich chocolate cake with chocolate frosting"
        price = 6.99
        category = "Desserts"
        is_available = $true
        preparation_time = 5
    },
    @{
        name = "Coffee"
        description = "Freshly brewed coffee"
        price = 2.99
        category = "Beverages"
        is_available = $true
        preparation_time = 3
    }
)

foreach ($item in $menuItems) {
    $result = Invoke-ApiCall -Url "$baseUrl/menu-items" -Body $item
    if ($result.Success) {
        Write-Host "Menu item '$($item.name)' created successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to create menu item '$($item.name)': $($result.Error)" -ForegroundColor Red
    }
}

# 3. Seed Sample Inventory Items
Write-Host "Seeding Sample Inventory Items..." -ForegroundColor Yellow

$inventoryItems = @(
    @{
        name = "Ground Beef"
        category = "Meat"
        quantity = 50
        unit = "lbs"
        minimum_quantity = 10
        cost_per_unit = 5.99
        supplier_name = "Local Meat Supplier"
        supplier_contact = "555-0123"
    },
    @{
        name = "Lettuce"
        category = "Vegetables"
        quantity = 20
        unit = "heads"
        minimum_quantity = 5
        cost_per_unit = 1.50
        supplier_name = "Fresh Produce Co"
        supplier_contact = "555-0124"
    },
    @{
        name = "Cheese"
        category = "Dairy"
        quantity = 30
        unit = "lbs"
        minimum_quantity = 5
        cost_per_unit = 4.99
        supplier_name = "Dairy Farm"
        supplier_contact = "555-0125"
    },
    @{
        name = "Tomatoes"
        category = "Vegetables"
        quantity = 25
        unit = "lbs"
        minimum_quantity = 5
        cost_per_unit = 2.99
        supplier_name = "Fresh Produce Co"
        supplier_contact = "555-0124"
    },
    @{
        name = "Coffee Beans"
        category = "Beverages"
        quantity = 10
        unit = "lbs"
        minimum_quantity = 2
        cost_per_unit = 12.99
        supplier_name = "Coffee Roasters"
        supplier_contact = "555-0126"
    }
)

foreach ($item in $inventoryItems) {
    $result = Invoke-ApiCall -Url "$baseUrl/inventory" -Body $item
    if ($result.Success) {
        Write-Host "Inventory item '$($item.name)' created successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to create inventory item '$($item.name)': $($result.Error)" -ForegroundColor Red
    }
}

# 4. Create a Sample Order
Write-Host "Creating Sample Order..." -ForegroundColor Yellow

$sampleOrder = @{
    customer_name = "John Doe"
    customer_phone = "555-1234"
    table_number = 5
    order_type = "dine_in"
    items = @(
        @{
            menu_item_id = 1
            quantity = 1
            unit_price = 12.99
            special_instructions = "No onions"
        },
        @{
            menu_item_id = 2
            quantity = 1
            unit_price = 8.99
            special_instructions = ""
        }
    )
}

$result = Invoke-ApiCall -Url "$baseUrl/orders" -Body $sampleOrder
if ($result.Success) {
    Write-Host "Sample order created successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to create sample order: $($result.Error)" -ForegroundColor Red
}

Write-Host "`nBasic data seeding completed!" -ForegroundColor Green
Write-Host "You can now test the frontend with sample data." -ForegroundColor Cyan
