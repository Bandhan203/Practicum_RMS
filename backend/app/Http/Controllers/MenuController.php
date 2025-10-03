<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\MenuItem;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MenuItem::query();

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by availability if provided
        if ($request->has('available')) {
            $query->where('available', $request->boolean('available'));
        }

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Order by name by default
        $query->orderBy('name');

        $menuItems = $query->get();

        return response()->json([
            'data' => $menuItems,
            'message' => 'Menu items retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // 5MB limit
            'preparation_time' => 'nullable|integer|min:1',
            'available' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'ingredients' => 'nullable|string', // Accept as JSON string
            'dietary_info' => 'nullable|string|max:255',
            'calories' => 'nullable|integer|min:0',
            'rating' => 'nullable|numeric|between:0,5',
        ], [
            'image.max' => 'The image file size must not exceed 5MB (5120 KB).',
            'image.image' => 'The uploaded file must be an image (JPEG, PNG, JPG, GIF, SVG).',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, svg.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();

        // Process form data properly
        $data['available'] = $request->boolean('available', true);
        $data['featured'] = $request->boolean('featured', false);

        // Set default preparation_time if not provided
        if (!isset($data['preparation_time']) || $data['preparation_time'] === null) {
            $data['preparation_time'] = 15; // Default 15 minutes
        }

        // Handle ingredients JSON string
        if ($request->ingredients) {
            $data['ingredients'] = json_decode($request->ingredients, true) ?: [];
        } else {
            $data['ingredients'] = [];
        }

        // Handle image upload or URL
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('menu-images', $imageName, 'public');
            $data['image'] = $imagePath;
        } elseif ($request->has('image_url') && $request->image_url) {
            // Handle image URL directly
            $data['image'] = $request->image_url;
        }

        $menuItem = MenuItem::create($data);

        return response()->json([
            'data' => $menuItem,
            'message' => 'Menu item created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'message' => 'Menu item not found',
            ], 404);
        }

        return response()->json([
            'data' => $menuItem,
            'message' => 'Menu item retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'message' => 'Menu item not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // 5MB limit
            'preparation_time' => 'nullable|integer|min:1',
            'available' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'ingredients' => 'nullable|string', // Accept as JSON string
            'dietary_info' => 'nullable|string|max:255',
            'calories' => 'nullable|integer|min:0',
            'rating' => 'nullable|numeric|between:0,5',
        ], [
            'image.max' => 'The image file size must not exceed 5MB (5120 KB).',
            'image.image' => 'The uploaded file must be an image (JPEG, PNG, JPG, GIF, SVG).',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, svg.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();

        // Process form data properly
        if ($request->has('available')) {
            $data['available'] = $request->boolean('available');
        }
        if ($request->has('featured')) {
            $data['featured'] = $request->boolean('featured');
        }

        // Handle ingredients JSON string
        if ($request->ingredients) {
            $data['ingredients'] = json_decode($request->ingredients, true) ?: [];
        }

        // Handle image upload or URL
        if ($request->hasFile('image')) {
            // Delete old image if exists and it's a local file
            if ($menuItem->image && !filter_var($menuItem->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($menuItem->image);
            }

            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('menu-images', $imageName, 'public');
            $data['image'] = $imagePath;
        } elseif ($request->has('image_url') && $request->image_url) {
            // Delete old image if exists and it's a local file
            if ($menuItem->image && !filter_var($menuItem->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($menuItem->image);
            }
            // Handle image URL directly
            $data['image'] = $request->image_url;
        }

        $menuItem->update($data);

        return response()->json([
            'data' => $menuItem,
            'message' => 'Menu item updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'message' => 'Menu item not found',
            ], 404);
        }

        // Delete image if exists
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json([
            'message' => 'Menu item deleted successfully',
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = MenuItem::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'data' => $categories,
            'message' => 'Categories retrieved successfully',
        ]);
    }
}
