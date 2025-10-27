import React from 'react';
import { ModernHeader } from './ModernHeader';
import { PromoBanner, PromoFeatures, SectionHeader } from './PromoSection';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, TrendingUp, Star, ChevronRight } from 'lucide-react';

export const ModernClientStore = ({
  storeName,
  flashSaleText,
  cartItems,
  wishlist,
  products,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  addToCart,
  toggleWishlist,
  setShowCart,
  setShowWishlist,
  setSelectedProduct,
  setShowProductDetail,
  selectedCategory,
  setSelectedCategory,
}) => {
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' || selectedCategory === 'Tout'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Featured products (highest rated)
  const featuredProducts = [...filteredProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // Lightning deals (products with high discount)
  const lightningDeals = filteredProducts
    .filter(p => p.discount >= 20)
    .slice(0, 6);

  // Trending products (most sales)
  const trendingProducts = [...filteredProducts]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to lightning deals section
  const scrollToDeals = () => {
    const dealsSection = document.getElementById('lightning-deals');
    if (dealsSection) {
      dealsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader
        storeName={storeName}
        flashSaleText={flashSaleText}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCartClick={() => setShowCart(true)}
        onWishlistClick={setShowWishlist}
        onSearch={() => {
          if (searchQuery.trim()) {
            alert(`Rechèch pou: "${searchQuery}"\nFonksyon rechèch ap vini byento!`);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        onCurrencyChange={setCurrency}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Banner */}
        <PromoBanner />

        {/* Feature Cards */}
        <PromoFeatures />

        {/* Lightning Deals Section */}
        {lightningDeals.length > 0 && (
          <section id="lightning-deals">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Zap size={28} fill="white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">⚡ Lightning Deals</h2>
                    <p className="text-sm opacity-90">Rabè rapid - Tan limite!</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white text-orange-600 hover:bg-gray-100"
                  onClick={() => {
                    const firstDeal = lightningDeals[0];
                    if (firstDeal) {
                      setSelectedProduct(firstDeal);
                      setShowProductDetail(true);
                    }
                  }}
                >
                  SHOP NOW
                  <ChevronRight className="ml-2" size={18} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {lightningDeals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onViewDetails={(p) => {
                    setSelectedProduct(p);
                    setShowProductDetail(true);
                  }}
                  isWishlisted={wishlist.some(item => item.id === product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banners Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={scrollToDeals}
          >
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white mb-3">LOCAL WAREHOUSE</Badge>
              <h3 className="text-3xl font-bold mb-2">LIVREZON RAPID</h3>
              <p className="text-lg mb-4">Pati $1.99</p>
              <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-gray-100">
                SHOP NOW →
              </Button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 text-9xl">📦</div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-400 to-orange-600 p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={scrollToDeals}
          >
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white mb-3">SAVE BIG</Badge>
              <h3 className="text-3xl font-bold mb-2">PRI DROP</h3>
              <p className="text-lg mb-4">Jiska $50</p>
              <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-gray-100">
                SHOP NOW →
              </Button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 text-9xl">💰</div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-red-500 to-pink-600 p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={() => {
              setSelectedCategory('all');
              scrollToTop();
            }}
          >
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white mb-3">HOT</Badge>
              <h3 className="text-3xl font-bold mb-2">TEMU POPULAR</h3>
              <p className="text-lg mb-4">Pwodui ki pi popilè</p>
              <Button variant="secondary" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
                SHOP NOW →
              </Button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 text-9xl">🔥</div>
          </Card>
        </div>

        {/* Trending Products Section */}
        <section>
          <SectionHeader
            title="🔥 Pwodui ki ap Vann Anpil"
            subtitle="Pwodui ki pi popilè semèn sa a"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onViewDetails={(p) => {
                  setSelectedProduct(p);
                  setShowProductDetail(true);
                }}
                isWishlisted={wishlist.some(item => item.id === product.id)}
              />
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section>
          <SectionHeader
            title="⭐ Pwodui yo Rekòmande"
            subtitle="Pi bon seleksyon pou ou"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onViewDetails={(p) => {
                  setSelectedProduct(p);
                  setShowProductDetail(true);
                }}
                isWishlisted={wishlist.some(item => item.id === product.id)}
              />
            ))}
          </div>
        </section>

        {/* Hot Deals Banner */}
        <Card 
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-12 text-center relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
          onClick={scrollToDeals}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              SCORE HOT DEALS
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Rabè espesyal chak jou
            </p>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-bold">
              CLICK TO GET →
            </Button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
        </Card>

        {/* All Products Section */}
        <section id="all-products">
          <SectionHeader
            title={selectedCategory === 'all' || selectedCategory === 'Tout' 
              ? "📦 Tout Pwodui" 
              : `📦 ${selectedCategory}`
            }
            subtitle={`${filteredProducts.length} pwodui disponib`}
            showViewAll={false}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onViewDetails={(p) => {
                  setSelectedProduct(p);
                  setShowProductDetail(true);
                }}
                isWishlisted={wishlist.some(item => item.id === product.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-12 py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Èd</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Kontakte Nou</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground">Suivi Kòmand</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Sèvis</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Peman</a></li>
                <li><a href="#" className="hover:text-foreground">Livrezon</a></li>
                <li><a href="#" className="hover:text-foreground">Retounen</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Enfòmasyon</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Konsènan Nou</a></li>
                <li><a href="#" className="hover:text-foreground">Kondisyon</a></li>
                <li><a href="#" className="hover:text-foreground">Konfidansyalite</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Swiv Nou</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground">Instagram</a></li>
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
            <p>© 2024 {storeName}. Tout dwa rezève.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

