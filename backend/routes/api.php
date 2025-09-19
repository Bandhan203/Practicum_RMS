<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SimpleAnalyticsController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\BillController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Temporary public routes for testing (remove in production)
Route::get('/test-inventory', [InventoryController::class, 'index']);
Route::get('/test-inventory-stats', [InventoryController::class, 'stats']);

// Temporary public billing routes for testing
Route::prefix('bills')->group(function () {
    Route::get('/', [BillController::class, 'index']);
    Route::post('/', [BillController::class, 'store']);
    Route::get('/completed-orders', [BillController::class, 'getCompletedOrders']);
    Route::get('/statistics', [BillController::class, 'getStatistics']);
    Route::get('/{id}', [BillController::class, 'show']);
    Route::put('/{id}', [BillController::class, 'update']);
    Route::delete('/{id}', [BillController::class, 'destroy']);
    Route::post('/{id}/payment', [BillController::class, 'processPayment']);
    Route::post('/{id}/mark-printed', [BillController::class, 'markPrinted']);
});

// Temporary public order routes for testing
Route::apiResource('orders', OrderController::class);
Route::get('/orders-statistics', [OrderController::class, 'statistics']);

// Temporary public menu routes for testing
Route::apiResource('menu-items', MenuController::class);
Route::get('/menu-categories', [MenuController::class, 'categories']);

// Temporary public inventory routes for testing
Route::apiResource('inventory', InventoryController::class);

// Temporary public report routes for testing
Route::prefix('public-reports')->group(function () {
    Route::get('/dashboard', [ReportController::class, 'getDashboardReport']);
    Route::get('/orders', [ReportController::class, 'getOrdersReportOnly']);
    Route::get('/menu', [ReportController::class, 'getMenuReportOnly']);
    Route::get('/inventory', [ReportController::class, 'getInventoryReportOnly']);
});

// Temporary public analytics routes for testing (SIMPLE VERSION)
Route::prefix('simple-analytics')->group(function () {
    Route::get('/dashboard-stats', [SimpleAnalyticsController::class, 'getDashboardStats']);
    Route::get('/orders-report', [SimpleAnalyticsController::class, 'getOrdersReport']);
    Route::get('/menu-report', [SimpleAnalyticsController::class, 'getMenuReport']);
    Route::get('/inventory-report', [SimpleAnalyticsController::class, 'getInventoryReport']);
});

// Simple test route
Route::get('/test-report', function() {
    return response()->json(['status' => 'success', 'message' => 'Report API is working']);
});
Route::get('/test-report-controller', [ReportController::class, 'test']);

// Simple analytics test
Route::get('/test-analytics-simple', function() {
    try {
        $orderCount = \App\Models\Order::count();
        $menuCount = \App\Models\MenuItem::count();
        $inventoryCount = \App\Models\Inventory::count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orderCount,
                'menu_items' => $menuCount,
                'inventory_items' => $inventoryCount
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test analytics report model
Route::get('/test-analytics-model', function() {
    try {
        // First test individual components
        $totalRevenue = \App\Models\Order::where('status', 'completed')->sum('total_amount');
        $totalOrders = \App\Models\Order::where('status', 'completed')->count();
        
        // Test inventory scopes
        $lowStockItems = \App\Models\Inventory::where('quantity', '<=', 10)->count(); // Simplified test
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'low_stock_items' => $lowStockItems
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Inventory routes
    Route::post('/inventory/{id}/adjust-stock', [InventoryController::class, 'adjustStock']);
    Route::get('/inventory-stats', [InventoryController::class, 'stats']);
    Route::get('/inventory-alerts', [InventoryController::class, 'alerts']);

    // Analytics routes
    Route::prefix('analytics')->group(function () {
        // Dashboard and summary
        Route::get('/dashboard', [AnalyticsController::class, 'getAnalytics']);
        Route::get('/dashboard-stats', [AnalyticsController::class, 'getDashboardStats']);

        // Individual reports
        Route::get('/sales-report', [AnalyticsController::class, 'getSalesReport']);
        Route::get('/inventory-report', [AnalyticsController::class, 'getInventoryReport']);
        Route::get('/menu-report', [AnalyticsController::class, 'getMenuReport']);
        Route::get('/comprehensive-report', [AnalyticsController::class, 'getComprehensiveReport']);

        // Existing endpoints
        Route::get('/revenue-trend', [AnalyticsController::class, 'getRevenueTrend']);
        Route::get('/top-items', [AnalyticsController::class, 'getTopItems']);
        Route::get('/top-customers', [AnalyticsController::class, 'getTopCustomers']);
        Route::get('/waiter-performance', [AnalyticsController::class, 'getWaiterPerformance']);

        // Saved reports management
        Route::get('/reports', [AnalyticsController::class, 'getSavedReports']);
        Route::get('/reports/{id}', [AnalyticsController::class, 'getReport']);
        Route::delete('/reports/{id}', [AnalyticsController::class, 'deleteReport']);

        // Export routes
        Route::get('/export/csv', [AnalyticsController::class, 'exportCSV']);
        Route::get('/export/xlsx', [AnalyticsController::class, 'exportXLSX']);
        Route::get('/export/pdf', [AnalyticsController::class, 'exportPDF']);

        // Background job route
        Route::post('/generate-daily', [AnalyticsController::class, 'generateDailyAnalytics']);
    });

    // Report routes
    Route::prefix('reports')->group(function () {
        // Comprehensive dashboard report
        Route::get('/dashboard', [ReportController::class, 'getDashboardReport']);
        
        // Individual section reports
        Route::get('/orders', [ReportController::class, 'getOrdersReportOnly']);
        Route::get('/menu', [ReportController::class, 'getMenuReportOnly']);
        Route::get('/inventory', [ReportController::class, 'getInventoryReportOnly']);
    });

    // Add other protected routes here as needed
    // Route::apiResource('users', UserController::class);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
