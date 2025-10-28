import React, { useState, useCallback, memo } from 'react';
import { ShoppingCart, Heart, Eye, Star, Image as ImageIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCurrency } from '../contexts/CurrencyContext';
import useCartStore from '../store/useCartStore';
import { lazyLoadImage } from '../utils/performance';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const OptimizedProductCard = memo(({ product, onQuickView, onAddToWishlist }) => {
  const { getPriceString } = useCurrency();
  const { addToCart, isInCart } = useCartStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver();

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    addToCart(product);
  }, [addToCart, product]);

  const isInCartValue = isInCart(product.id);
  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <Card
      ref={ref}
      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in border-0"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {!imageError && (
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        {(imageError || !imageLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white animate-scale-in">
            -{product.discount}%
          </Badge>
        )}

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => onQuickView && onQuickView(product)}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist && onAddToWishlist(product);
            }}
          >
            <Heart size={16} />
          </Button>
        </div>

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-orange-500 text-white border-none">
            Dènye {product.stock}
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-red-500 text-white border-none">
            Epuizè
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {getPriceString(discountedPrice)}
            </p>
            {product.discount > 0 && (
              <p className="text-xs text-gray-500 line-through">
                {getPriceString(product.price)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isInCartValue}
        >
          {isInCartValue ? (
            'Nan panyè'
          ) : product.stock === 0 ? (
            'Epuizè'
          ) : (
            <>
              <ShoppingCart size={16} className="mr-2" />
              Ajoute
            </>
          )}
        </Button>
      </div>
    </Card>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;

