import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './ui/button';

const AdvancedSearch = () => {
  const { products } = useProducts();
  const { getPriceString } = useCurrency();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  const [filters, setFilters] = useState({
    category: 'all',
    priceMin: 0,
    priceMax: 100000,
    color: 'all',
    sortBy: 'newest'
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const colors = ['all', 'red', 'blue', 'green', 'black', 'white', 'yellow'];

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // Color filter (if implemented in future)
    // filtered = filtered.filter(p => p.color === filters.color);

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, filters, products]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceMin: 0,
      priceMax: 100000,
      color: 'all',
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Chèche pwodwi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filter Toggle & Sort */}
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal size={18} />
          Filtè
        </Button>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Plus Récent</option>
          <option value="price-low">Pri Piti</option>
          <option value="price-high">Pri Segondè</option>
          <option value="rating">Mi Rating</option>
          <option value="popular">Plus Populè</option>
        </select>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Filtè Avansé</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Efase Tout
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tout Kategori' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ranje Pri: {getPriceString(filters.priceMin)} - {getPriceString(filters.priceMax)}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Minimum"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Maximum"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', parseFloat(e.target.value) || 100000)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Color Filter (Placeholder) */}
          <div>
            <label className="block text-sm font-medium mb-2">Koulè</label>
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {colors.map(color => (
                <option key={color} value={color}>
                  {color === 'all' ? 'Tout Koulè' : color}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Jwenn {filteredProducts.length} pwodwi
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded mb-3"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
              }}
            />
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{product.category}</p>
            <p className="text-lg font-bold text-blue-600">{getPriceString(product.price)}</p>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Pa gen pwodwi ki koresponn ak rechèch ou</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

