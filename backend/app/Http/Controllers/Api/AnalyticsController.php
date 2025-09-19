<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Models\AnalyticsReport;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Inventory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $period = $request->input('period', 'today');
            $stats = AnalyticsReport::generateDashboardStats($period);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get dashboard stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales analytics report
     */
    public function getSalesReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = $request->start_date;
            $endDate = $request->end_date;

            $salesData = AnalyticsReport::generateSalesAnalytics($startDate, $endDate);

            // Save report to database
            AnalyticsReport::create([
                'report_type' => 'sales',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'data' => $salesData,
                'generated_by' => Auth::id(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'data' => $salesData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate sales report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory analytics report
     */
    public function getInventoryReport(Request $request)
    {
        try {
            $inventoryData = AnalyticsReport::generateInventoryAnalytics();

            // Save report to database
            AnalyticsReport::create([
                'report_type' => 'inventory',
                'data' => $inventoryData,
                'generated_by' => Auth::id(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'data' => $inventoryData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate inventory report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get menu analytics report
     */
    public function getMenuReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $menuData = AnalyticsReport::generateMenuAnalytics($startDate, $endDate);

            // Save report to database
            AnalyticsReport::create([
                'report_type' => 'menu',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'data' => $menuData,
                'generated_by' => Auth::id(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'data' => $menuData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate menu report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comprehensive analytics combining all data
     */
    public function getComprehensiveReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = $request->start_date;
            $endDate = $request->end_date;

            // Generate all reports
            $salesData = AnalyticsReport::generateSalesAnalytics($startDate, $endDate);
            $inventoryData = AnalyticsReport::generateInventoryAnalytics();
            $menuData = AnalyticsReport::generateMenuAnalytics($startDate, $endDate);

            $comprehensiveData = [
                'sales' => $salesData,
                'inventory' => $inventoryData,
                'menu' => $menuData,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ];

            // Save comprehensive report
            AnalyticsReport::create([
                'report_type' => 'comprehensive',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'data' => $comprehensiveData,
                'generated_by' => Auth::id(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'data' => $comprehensiveData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate comprehensive report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get saved reports
     */
    public function getSavedReports(Request $request)
    {
        try {
            $reportType = $request->input('report_type');
            $limit = $request->input('limit', 20);

            $query = AnalyticsReport::with('generatedBy:id,name')
                ->orderByDesc('created_at')
                ->limit($limit);

            if ($reportType) {
                $query->where('report_type', $reportType);
            }

            $reports = $query->get();

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get saved reports',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific saved report
     */
    public function getReport($id)
    {
        try {
            $report = AnalyticsReport::with('generatedBy:id,name')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Report not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Delete a saved report
     */
    public function deleteReport($id)
    {
        try {
            $report = AnalyticsReport::findOrFail($id);
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comprehensive analytics data
     */
    public function getAnalytics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => 'sometimes|in:day,week,month'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $groupBy = $request->input('group_by', 'day');

            // Validate date range (max 1 year)
            if ($startDate->diffInDays($endDate) > 365) {
                return response()->json([
                    'error' => 'Date range cannot exceed 365 days'
                ], 400);
            }

            $analytics = $this->analyticsService->getAnalytics($startDate, $endDate, $groupBy);

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'meta' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'group_by' => $groupBy,
                    'days_count' => $startDate->diffInDays($endDate) + 1
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate analytics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue trend data
     */
    public function getRevenueTrend(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => 'sometimes|in:day,week,month'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $groupBy = $request->input('group_by', 'day');

            $trend = $this->analyticsService->getRevenueTrend($startDate, $endDate, $groupBy);

            return response()->json([
                'success' => true,
                'data' => $trend
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get revenue trend',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top performing items
     */
    public function getTopItems(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'limit' => 'sometimes|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $limit = $request->input('limit', 10);

            $topItems = $this->analyticsService->getTopItems($startDate, $endDate, $limit);

            return response()->json([
                'success' => true,
                'data' => $topItems
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get top items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top customers
     */
    public function getTopCustomers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'limit' => 'sometimes|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $limit = $request->input('limit', 10);

            $topCustomers = $this->analyticsService->getTopCustomers($startDate, $endDate, $limit);

            return response()->json([
                'success' => true,
                'data' => $topCustomers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get top customers',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get waiter performance data
     */
    public function getWaiterPerformance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'waiter_id' => 'sometimes|integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $performance = $this->analyticsService->getWaiterPerformance($startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => $performance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get waiter performance',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export analytics data to CSV
     */
    public function exportCSV(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'report_type' => 'required|in:revenue,orders,customers,waiter_performance,top_items',
            'group_by' => 'sometimes|in:day,week,month'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $reportType = $request->report_type;
            $groupBy = $request->input('group_by', 'day');

            $data = $this->getExportData($reportType, $startDate, $endDate, $groupBy);
            $csv = $this->generateCSV($data, $reportType);

            $filename = "{$reportType}_report_{$startDate->format('Y-m-d')}_to_{$endDate->format('Y-m-d')}.csv";

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export analytics data to XLSX
     */
    public function exportXLSX(Request $request)
    {
        // Note: This would require PhpSpreadsheet package
        // For now, return CSV with Excel-compatible format
        return $this->exportCSV($request);
    }

    /**
     * Export analytics data to PDF
     */
    public function exportPDF(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'report_type' => 'required|in:revenue,orders,customers,waiter_performance,top_items'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid parameters',
                'messages' => $validator->errors()
            ], 400);
        }

        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $reportType = $request->report_type;

            $analytics = $this->analyticsService->getAnalytics($startDate, $endDate);

            // For now, return a simple JSON response
            // In a real implementation, you'd use a PDF library like TCPDF or DOMPDF
            return response()->json([
                'success' => true,
                'message' => 'PDF export functionality would be implemented here',
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate daily analytics (for background job)
     */
    public function generateDailyAnalytics(Request $request)
    {
        $date = $request->has('date')
            ? Carbon::parse($request->date)
            : Carbon::yesterday();

        try {
            $this->analyticsService->generateDailyAnalytics($date);

            return response()->json([
                'success' => true,
                'message' => "Daily analytics generated for {$date->format('Y-m-d')}"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate daily analytics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get data for export based on report type
     */
    protected function getExportData(string $reportType, Carbon $startDate, Carbon $endDate, string $groupBy = 'day')
    {
        switch ($reportType) {
            case 'revenue':
                return $this->analyticsService->getRevenueTrend($startDate, $endDate, $groupBy);
            case 'orders':
                return $this->analyticsService->getAnalytics($startDate, $endDate, $groupBy)['summary_stats'];
            case 'customers':
                return $this->analyticsService->getTopCustomers($startDate, $endDate, 100);
            case 'waiter_performance':
                return $this->analyticsService->getWaiterPerformance($startDate, $endDate);
            case 'top_items':
                return $this->analyticsService->getTopItems($startDate, $endDate, 50);
            default:
                throw new \InvalidArgumentException('Invalid report type');
        }
    }

    /**
     * Generate CSV from data
     */
    protected function generateCSV($data, string $reportType): string
    {
        if (empty($data) || (!is_array($data) && !$data instanceof \Illuminate\Support\Collection)) {
            return "No data available\n";
        }

        $output = fopen('php://temp', 'w');

        // Convert to array if it's a collection
        $dataArray = $data instanceof \Illuminate\Support\Collection ? $data->toArray() : $data;

        if (empty($dataArray)) {
            fputcsv($output, ['No data available']);
        } else {
            // Add headers based on first row
            $firstRow = reset($dataArray);
            if (is_object($firstRow)) {
                $firstRow = (array) $firstRow;
            }

            fputcsv($output, array_keys($firstRow));

            // Add data rows
            foreach ($dataArray as $row) {
                if (is_object($row)) {
                    $row = (array) $row;
                }
                fputcsv($output, array_values($row));
            }
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
