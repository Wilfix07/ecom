import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Grid, List, Star, DollarSign } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import useCartStore from '../store/useCartStore';
import { Link } from 'react-router-dom';

const ProductsListPage = () => {
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const { getPriceString } = useCurrency();
  const { addToCart, isInCart, openCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Filter products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return b.id - a.id;
      }
    });

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleAddToCart = (product) => {
    if (!user) {
      alert('Tanpri konekte pou ajoute prodwi nan panyè ou.');
      return;
    }
    addToCart(product);
    openCart(); // Open cart sidebar after adding
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pwodwi</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Chèche pwodwi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tout Kategori' : cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Plus Recent</option>
              <option value="price-low">Pri Piti</option>
              <option value="price-high">Pri Segondè</option>
              <option value="rating">Mi Rating</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Pa gen pwodwi ki koresponn ak rechèch ou.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={viewMode === 'list' ? 'w-48 h-48' : 'w-full h-48'}>
                  <img
                    src={product.image}
                    alt={product.title}
                    className={`object-cover rounded-t-lg ${viewMode === 'list' ? 'rounded-r-none' : ''}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title || product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {getPriceString(product.price)}
                      </div>
                      {product.discount > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          {getPriceString(product.price * (1 + product.discount / 100))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Stok: {product.stock}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!user || product.stock === 0}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        !user || product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <ShoppingCart className="inline mr-2" size={16} />
                      {isInCart(product.id) ? 'Nan Panyè' : 'Mete nan Panyè'}
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Detay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsListPage;

