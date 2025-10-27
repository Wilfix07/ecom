import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ShoppingCart, Search, User, Heart, Menu } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

export const ModernHeader = ({
  storeName,
  flashSaleText,
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  onSearch,
  searchQuery,
  setSearchQuery,
  currency,
  onCurrencyChange,
}) => {
  const { getPriceString } = useCurrency();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top Bar - Promotions */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span>📦 Livrezon Gratis pou kòmand ki pi plis pase $50</span>
              <span>🔥 {flashSaleText} - Jiska 70% OFF</span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-primary-foreground/10 text-primary-foreground border-none rounded px-2 py-1 text-sm"
              >
                <option value="HTG">HTG</option>
                <option value="USD">USD</option>
              </select>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <User size={16} className="mr-1" />
                Konekte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu size={24} />
            </Button>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              {storeName}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Chèche pwodui, brand, oswa kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                className="pl-10 pr-4 h-11 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onWishlistClick}
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="default"
              className="relative gap-2"
              onClick={onCartClick}
            >
              <ShoppingCart size={20} />
              <span className="hidden md:inline">Panye</span>
              {cartCount > 0 && (
                <Badge className="bg-white text-primary hover:bg-white ml-1">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Chèche pwodui..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10 pr-4 h-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            {['Tout', 'Electronics', 'Fashion', 'Soulye', 'Kay', 'Bote', 'Espò'].map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className="whitespace-nowrap hover:text-primary"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

