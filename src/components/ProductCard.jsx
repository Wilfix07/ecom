import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

export const ProductCard = ({ product, onAddToCart, onToggleWishlist, onViewDetails, isWishlisted }) => {
  const { getPriceString } = useCurrency();
  
  const discountedPrice = product.price * (1 - product.discount / 100);
  const hasDiscount = product.discount > 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border">
      {/* Discount Badge */}
      {hasDiscount && (
        <Badge className="absolute top-2 left-2 z-10 bg-red-500 text-white font-bold">
          -{product.discount}%
        </Badge>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
      >
        <Heart 
          size={18} 
          className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
        />
      </button>

      {/* Product Image */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden"
      >
        {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://')) ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12">Image</text></svg>';
            }}
          />
        ) : (
          <span className="text-6xl">{product.image || '📦'}</span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {getPriceString(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {getPriceString(product.price)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Épuisé'}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className="h-8 px-3"
          >
            <ShoppingCart size={14} className="mr-1" />
            Achte
          </Button>
        </div>
      </div>
    </Card>
  );
};

