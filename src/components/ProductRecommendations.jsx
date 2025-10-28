import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { aiChatbotService } from '../services/aiChatbotService';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';
import useCartStore from '../store/useCartStore';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const ProductRecommendations = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const { getPriceString } = useCurrency();
  const { addToCart } = useCartStore();
  
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendationType, setRecommendationType] = useState('personalized');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && products.length > 0) {
      loadRecommendations();
    }
  }, [user, products]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const result = await aiChatbotService.getRecommendations(user?.id, 6);
      setRecommendedProducts(result.data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Fallback to popular products
      setRecommendedProducts(
        products.sort((a, b) => b.sales - a.sales).slice(0, 6)
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = async (productId, action) => {
    if (!user) return;
    
    await aiChatbotService.saveUserActivity(user.id, action, productId);
  };

  const handleProductClick = async (product) => {
    await updateUserPreferences(product.id, 'view');
    // Navigate to product detail in production
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommendation Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setRecommendationType('personalized')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            recommendationType === 'personalized'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Sparkles size={16} className="inline mr-1" />
          Pou Ou
        </button>
        <button
          onClick={() => {
            setRecommendationType('trending');
            setRecommendedProducts(
              products.sort((a, b) => b.sales - a.sales).slice(0, 6)
            );
          }}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            recommendationType === 'trending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <TrendingUp size={16} className="inline mr-1" />
          Trend Kounye A
        </button>
        <button
          onClick={() => {
            setRecommendationType('newest');
            setRecommendedProducts(
              products.sort((a, b) => b.id - a.id).slice(0, 6)
            );
          }}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            recommendationType === 'newest'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Clock size={16} className="inline mr-1" />
          Youn Nève
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendedProducts.map(product => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative w-full h-48 bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              {product.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                  -{product.discount}%
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                {product.title || product.name}
              </h3>
              
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500 text-xs">★</span>
                <span className="text-xs text-gray-600">
                  {product.rating} ({product.reviews})
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    {getPriceString(product.price)}
                  </p>
                  {product.discount > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      {getPriceString(product.price * (1 + product.discount / 100))}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="w-full"
                size="sm"
              >
                <ShoppingBag size={16} className="mr-1" />
                Ajoute
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* No Recommendations */}
      {recommendedProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            Pa gen rekòmandasyon pou ou pòko
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Fè kèk achat pou nou ka fè rekòmandasyon pi bon pou ou
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;

