import React, { useState } from 'react';
import { X, ShoppingCart, Star, Heart, Share2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const ProductDetailModal = ({ product, onClose, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const { getPriceString } = useCurrency();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  if (!product) return null;

  // Get all images
  const images = [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image, // fallback to emoji
  ].filter(img => img);

  const hasDiscount = product.discount > 0;
  const discountedPrice = product.price * (1 - product.discount / 100);

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(product.video_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left Side - Images & Video */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square group">
              {images[selectedImageIndex]?.startsWith('http') ? (
                <img 
                  src={images[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {images[selectedImageIndex] || '📦'}
                </div>
              )}
              
              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  -{product.discount}%
                </div>
              )}

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    {img?.startsWith('http') ? (
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                        {img || '📦'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Video Section */}
            {embedUrl && (
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="relative aspect-video">
                  <iframe
                    src={embedUrl}
                    title="Product video"
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-semibold text-gray-800">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} revyè)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              {hasDiscount ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-800">
                      {getPriceString(discountedPrice)}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      {getPriceString(product.price)}
                    </span>
                  </div>
                  <p className="text-red-600 font-semibold">Ekonòmize {product.discount}%</p>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-800">
                  {getPriceString(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                product.stock > 50 ? 'bg-green-100 text-green-700' :
                product.stock > 20 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `${product.stock} an stock` : 'Stock epuize'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Detay Pwodui</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Category */}
            <div>
              <span className="text-sm text-gray-500">Kategori:</span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart size={24} />
                Ajoute nan Panye
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart size={20} className={isInWishlist ? 'text-pink-500 fill-pink-500' : 'text-gray-600'} />
                  {isInWishlist ? 'Retire nan Wishlist' : 'Ajoute nan Wishlist'}
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description || `Gade ${product.name}`,
                        url: window.location.href
                      }).catch(() => {});
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Lyen kopye nan clipboard!');
                      });
                    }
                  }}
                  className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Pataje
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Vant Total:</span>
                <span className="font-semibold">{product.sales} pwodui</span>
              </div>
              <div className="flex justify-between">
                <span>ID Pwodui:</span>
                <span className="font-mono">{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

