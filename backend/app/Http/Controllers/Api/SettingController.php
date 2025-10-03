<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::getAllSettings();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch settings', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings'
            ], 500);
        }
    }

    /**
     * Get settings by category
     */
    public function getByCategory(string $category): JsonResponse
    {
        try {
            $settings = Setting::getByCategory($category);

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch settings by category', [
                'category' => $category,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings'
            ], 500);
        }
    }

    /**
     * Update multiple settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            $settings = $request->input('settings', []);

            foreach ($settings as $key => $data) {
                Setting::set(
                    $key,
                    $data['value'] ?? '',
                    $data['type'] ?? 'string',
                    $data['category'] ?? 'general',
                    $data['description'] ?? null,
                    $data['is_public'] ?? true
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update settings', [
                'error' => $e->getMessage(),
                'settings' => $request->input('settings', [])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }

    /**
     * Update a single setting
     */
    public function updateSetting(Request $request, string $key): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'value' => 'required',
                'type' => 'string|in:string,number,boolean,json',
                'category' => 'string',
                'description' => 'nullable|string'
            ]);

            Setting::set(
                $key,
                $validatedData['value'],
                $validatedData['type'] ?? 'string',
                $validatedData['category'] ?? 'general',
                $validatedData['description'] ?? null,
                $validatedData['is_public'] ?? true
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update setting', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting'
            ], 500);
        }
    }
}
