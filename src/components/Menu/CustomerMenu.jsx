import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Star, Clock, ShoppingCart, Search, Filter, Heart, DollarSign } from 'lucide-react';

export function CustomerMenu() {
	const { menuItems, cart, addToCart } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [favoriteItems, setFavoriteItems] = useState([]);

	const categories = ['all', ...new Set(menuItems.map(item => item.category))];
	
	const filteredItems = menuItems.filter(item => {
		const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 item.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
		const isAvailable = item.available;
		return matchesSearch && matchesCategory && isAvailable;
	});

	const toggleFavorite = (itemId) => {
		setFavoriteItems(prev => 
			prev.includes(itemId) 
				? prev.filter(id => id !== itemId)
				: [...prev, itemId]
		);
	};

	const getCartQuantity = (itemId) => {
		const cartItem = cart.find(item => item.menuItemId === itemId);
		return cartItem ? cartItem.quantity : 0;
	};

	return (
		<div className="p-6 space-y-8 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Our Delicious Menu</h1>
				<p className="text-gray-600">Discover amazing dishes made with love and fresh ingredients</p>
			</div>

			{/* Search and Filter */}
			<div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search for dishes..."
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="relative">
					<Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all min-w-[160px]"
					>
						{categories.map(category => (
							<option key={category} value={category}>
								{category === 'all' ? 'All Categories' : category}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Menu Items Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredItems.map((item) => {
					const cartQuantity = getCartQuantity(item.id);
					const isFavorite = favoriteItems.includes(item.id);
					
					return (
						<div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
							<div className="relative">
								<img
									src={item.image}
									alt={item.name}
									className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute top-3 right-3 flex items-center space-x-2">
									<button
										onClick={() => toggleFavorite(item.id)}
										className={`p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'} hover:bg-red-500 hover:text-white transition-colors shadow-sm`}
									>
										<Heart className="w-4 h-4" />
									</button>
									{item.featured && (
										<div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
											<Star className="w-3 h-3 mr-1" />
											Featured
										</div>
									)}
								</div>
								<div className="absolute bottom-3 left-3">
									<span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
										{item.category}
									</span>
								</div>
							</div>
							
							<div className="p-6">
								<div className="flex justify-between items-start mb-3">
									<h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
									<div className="flex items-center text-brand-dark font-bold text-xl">
										<DollarSign className="w-4 h-4" />
										{item.price.toFixed(2)}
									</div>
								</div>
								
								<p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
								
								<div className="flex items-center justify-between mb-4 text-sm text-gray-500">
									<div className="flex items-center space-x-1">
										<Clock className="w-4 h-4" />
										<span>{item.preparationTime} min</span>
									</div>
									<div className="flex items-center space-x-1">
										<Star className="w-4 h-4 text-yellow-500" />
										<span>4.{Math.floor(Math.random() * 9) + 1}</span>
									</div>
								</div>
								
								<div className="flex flex-wrap gap-1 mb-4">
									{item.ingredients.slice(0, 3).map((ingredient, idx) => (
										<span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
											{ingredient}
										</span>
									))}
									{item.ingredients.length > 3 && (
										<span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
											+{item.ingredients.length - 3} more
										</span>
									)}
								</div>
								
								<div className="flex items-center space-x-2">
									{cartQuantity > 0 ? (
										<div className="flex items-center space-x-2 flex-1">
											<button
												onClick={() => {/* Implement remove from cart */}}
												className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
											>
												-
											</button>
											<span className="px-4 py-2 bg-brand-light text-white rounded-lg font-medium">
												{cartQuantity}
											</span>
											<button
												onClick={() => addToCart(item.id)}
												className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
											>
												+
											</button>
										</div>
									) : (
										<button
											onClick={() => addToCart(item.id)}
											className="flex-1 bg-brand-dark text-white py-2 px-4 rounded-lg hover:bg-brand-light transition-colors flex items-center justify-center space-x-2"
										>
											<Plus className="w-4 h-4" />
											<span>Add to Cart</span>
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{filteredItems.length === 0 && (
				<div className="text-center py-12">
					<ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
					<p className="text-gray-500">Try adjusting your search or filter criteria.</p>
				</div>
			)}
		</div>
	);
}
