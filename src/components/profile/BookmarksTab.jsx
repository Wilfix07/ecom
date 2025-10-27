import React from 'react';
import { Heart, ShoppingCart, Trash2, Star, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useCurrency } from '../../contexts/CurrencyContext';

const BookmarksTab = ({ userId, onAddToCart }) => {
  const { bookmarks, loading, removeBookmark } = useBookmarks(userId);
  const { getPriceString } = useCurrency();

  const handleRemove = async (bookmarkId) => {
    const result = await removeBookmark(bookmarkId);
    if (result.success) {
      // Optimistic UI already updated in hook
    } else {
      alert('Erè nan retire favorit la');
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      alert(`${product.name} ajoute nan panye!`);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chajman favorit yo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <Heart size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Pa gen favorit ankò</h3>
            <p className="text-muted-foreground mb-6">Ajoute pwodui ou renmen yo nan lis favorit ou!</p>
            <Button>Eksplore Pwodui</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart size={24} className="text-red-500" />
          Pwodui Favorit Ou ({bookmarks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bookmark) => {
            const product = bookmark.product;
            if (!product) return null;

            const finalPrice = product.discount > 0 
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <div 
                key={bookmark.id}
                className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all bg-card group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  {product.image_1 || product.image ? (
                    <img 
                      src={product.image_1 || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <Package size={48} className="text-gray-500" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}

                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg">
                        Pwodui Fini
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(bookmark.id)}
                    className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{product.rating || 0}</span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews || 0} revizyon)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      {getPriceString(finalPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {getPriceString(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full gap-2"
                  >
                    <ShoppingCart size={16} />
                    {product.stock === 0 ? 'Pa Disponib' : 'Ajoute nan Panye'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookmarksTab;

