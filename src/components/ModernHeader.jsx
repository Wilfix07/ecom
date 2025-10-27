import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ShoppingCart, Search, User, Heart, Menu, X, Home, Package, Tag, Settings, HelpCircle, Info } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

export const ModernHeader = ({
  storeName,
  flashSaleText,
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  onLoginClick,
  onSearch,
  searchQuery,
  setSearchQuery,
  currency,
  onCurrencyChange,
  selectedCategory = 'Tout',
  onCategoryChange,
  setShowAboutUs,
  setShowContact,
}) => {
  const { getPriceString } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const categories = ['Tout', 'Electronics', 'Fashion', 'Soulye', 'Kay', 'Bote', 'Espò'];

  return (
    <>
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top Bar - Promotions */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="hidden md:flex items-center gap-6">
              <span>📦 Livrezon Gratis pou kòmand ki pi plis pase $50</span>
              <span>🔥 {flashSaleText} - Jiska 70% OFF</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-primary-foreground/10 text-primary-foreground border-none rounded px-2 py-1 text-xs md:text-sm"
              >
                <option value="HTG">HTG</option>
                <option value="USD">USD</option>
              </select>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs md:text-sm"
                onClick={onLoginClick}
              >
                <User size={16} className="mr-1" />
                <span className="hidden md:inline">Konekte</span>
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
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
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={`whitespace-nowrap transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:text-primary hover:bg-accent'
                }`}
                onClick={() => {
                  onCategoryChange(category === 'Tout' ? 'all' : category);
                  // Scroll to products section
                  const productsSection = document.getElementById('all-products');
                  if (productsSection) {
                    setTimeout(() => {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu Sidebar */}
    {isMobileMenuOpen && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{storeName}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Home size={20} />
                Akèy
              </Button>

              <div className="border-t border-border my-2" />

              {/* Categories */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Kategori</p>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onCategoryChange(category === 'Tout' ? 'all' : category);
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        const productsSection = document.getElementById('all-products');
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 300);
                    }}
                  >
                    <Package size={18} />
                    {category}
                  </Button>
                ))}
              </div>

              <div className="border-t border-border my-2" />

              {/* Actions */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onWishlistClick();
                }}
              >
                <Heart size={20} />
                Favorit
                {wishlistCount > 0 && (
                  <Badge className="ml-auto">{wishlistCount}</Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onCartClick();
                }}
              >
                <ShoppingCart size={20} />
                Panye
                {cartCount > 0 && (
                  <Badge className="ml-auto">{cartCount}</Badge>
                )}
              </Button>

              <div className="border-t border-border my-2" />

              {/* Info */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowAboutUs(true);
                }}
              >
                <Info size={20} />
                Konsènan Nou
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowContact(true);
                }}
              >
                <HelpCircle size={20} />
                Kontakte Nou
              </Button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © 2025 {storeName}. Tout dwa rezève.
              </p>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
};

