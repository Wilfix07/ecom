import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Share2, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const ProductDetailPage = ({ onAddToCart, cartItems = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const { getPriceString } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const product = products.find(p => p.id === parseInt(id));

  const isInCart = () => {
    return cartItems.some(item => item.id === product?.id);
  };

  const handleAddToCart = () => {
    if (!user) {
      alert('Tanpri konekte pou ajoute prodwi nan panyè ou.');
      return;
    }
    
    if (!product || product.stock === 0) {
      alert('Pwodwi sa pa disponib nan stok.');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    
    alert('Prodwi ajoute nan panyè avèk siksè!');
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      alert('Ou depase kantite ki disponib nan stok.');
    }
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

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Pwodwi Pa Jwenn</h2>
          <p className="text-gray-600 mb-4">Pwodwi ou chèche pa egziste.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retounen nan Lis Pwodwi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Retounen nan Lis Pwodwi
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <img
              src={product.image}
              alt={product.title || product.name}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
              }}
            />
            
            {/* Additional Images */}
            {product.image_1 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <img src={product.image_1} alt="Product view 1" className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80" />
                {product.image_2 && (
                  <img src={product.image_2} alt="Product view 2" className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80" />
                )}
                {product.image_3 && (
                  <img src={product.image_3} alt="Product view 3" className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80" />
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <Badge className="mb-3 bg-blue-100 text-blue-700">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {product.title || product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} avi)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Pri</div>
              {product.discount > 0 ? (
                <div>
                  <div className="text-4xl font-bold text-blue-600">
                    {getPriceString(product.price)}
                  </div>
                  <div className="text-lg text-gray-500 line-through mt-1">
                    {getPriceString(product.price * (1 + product.discount / 100))}
                  </div>
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    -{product.discount}% rabè!
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-blue-600">
                  {getPriceString(product.price)}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Deskripsyon</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Stok Disponib:</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} achan pipoti` : 'Sipoze fini'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">Kantite:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity === 1}
                    className={`p-2 rounded-lg border ${
                      quantity === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className={`p-2 rounded-lg border ${
                      quantity >= product.stock ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!user || product.stock === 0}
                className={`flex-1 py-3 text-lg font-semibold ${
                  !user || product.stock === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <ShoppingCart className="inline mr-2" size={20} />
                {isInCart() ? 'Deja nan Panyè' : 'Mete nan Panyè'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`${isBookmarked ? 'bg-red-50 border-red-300' : ''}`}
              >
                <Heart className={`${isBookmarked ? 'fill-current text-red-600' : ''}`} size={20} />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.title,
                      text: product.description,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Lyen kopye!');
                  }
                }}
              >
                <Share2 size={20} />
              </Button>
            </div>

            {/* Additional Info */}
            <Card className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sales:</span>
                  <span className="font-medium">{product.sales} achat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evanye:</span>
                  <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

