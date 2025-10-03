<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    /**
     * Get all settings or settings by category
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $category = $request->query('category');

            if ($category) {
                $settings = Setting::getByCategory($category);
            } else {
                $settings = Setting::all()->mapWithKeys(function ($setting) {
                    return [$setting->key => $setting->value];
                });
            }

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings (for frontend)
     */
    public function getPublicSettings(): JsonResponse
    {
        try {
            $settings = Setting::getPublicSettings();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific setting
     */
    public function show(string $key): JsonResponse
    {
        try {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'key' => $setting->key,
                    'value' => Setting::castValue($setting->value, $setting->type),
                    'type' => $setting->type,
                    'category' => $setting->category,
                    'description' => $setting->description,
                    'is_public' => $setting->is_public
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create or update a setting
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'key' => 'required|string|max:255',
                'value' => 'required',
                'type' => 'required|in:string,number,boolean,json',
                'category' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'is_public' => 'boolean'
            ]);

            $setting = Setting::set(
                $validated['key'],
                $validated['value'],
                $validated['type'],
                $validated['category'],
                $validated['description'] ?? null,
                $validated['is_public'] ?? false
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting saved successfully',
                'data' => [
                    'key' => $setting->key,
                    'value' => Setting::castValue($setting->value, $setting->type),
                    'type' => $setting->type,
                    'category' => $setting->category,
                    'description' => $setting->description,
                    'is_public' => $setting->is_public
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple settings at once
     */
    public function updateBatch(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string|max:255',
                'settings.*.value' => 'required',
                'settings.*.type' => 'required|in:string,number,boolean,json',
                'settings.*.category' => 'required|string|max:255',
                'settings.*.description' => 'nullable|string|max:500',
                'settings.*.is_public' => 'boolean'
            ]);

            $updatedSettings = [];

            foreach ($validated['settings'] as $settingData) {
                $setting = Setting::set(
                    $settingData['key'],
                    $settingData['value'],
                    $settingData['type'],
                    $settingData['category'],
                    $settingData['description'] ?? null,
                    $settingData['is_public'] ?? false
                );

                $updatedSettings[] = [
                    'key' => $setting->key,
                    'value' => Setting::castValue($setting->value, $setting->type),
                    'type' => $setting->type,
                    'category' => $setting->category,
                    'description' => $setting->description,
                    'is_public' => $setting->is_public
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $updatedSettings
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a setting
     */
    public function destroy(string $key): JsonResponse
    {
        try {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $setting->delete();

            return response()->json([
                'success' => true,
                'message' => 'Setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
