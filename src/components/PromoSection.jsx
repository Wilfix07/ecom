import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronRight, Truck, Tag, Zap } from 'lucide-react';

// Category cards data - dynamically configurable
const categoryCards = [
  {
    id: 1,
    title: 'Soulye espò',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    category: 'Sportif', // Maps to 'Sports' in database
    bgColor: 'bg-yellow-50',
  },
  {
    id: 2,
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    category: 'Chaussures', // Maps to 'Shoes' in database
    bgColor: 'bg-white',
  },
  {
    id: 3,
    title: 'Électronique',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    category: 'Électronique', // Maps to 'Electronics' in database
    bgColor: 'bg-blue-50',
  },
];

export const PromoBanner = ({ onCategoryClick }) => {
  const handleCategoryClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById('all-products');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-xl overflow-hidden shadow-lg">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white space-y-4 flex-1">
            <div className="inline-block bg-black/20 px-4 py-1 rounded-full text-sm font-bold mb-2">
              BLACK FRIDAY SPECIAL
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              MEGA PROMO<br />
              <span className="text-yellow-300">JWISANS!</span>
            </h2>
            <p className="text-lg opacity-90">
              Pran rabè jiska 70% sou tout pwodui yo
            </p>
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold"
              onClick={() => {
                const dealsSection = document.getElementById('lightning-deals');
                if (dealsSection) {
                  dealsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  const productsSection = document.getElementById('all-products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              ACHTE KOUNYE A
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </div>
          <div className="flex-1 flex flex-wrap gap-3 md:gap-4">
            {categoryCards.map((card) => (
              <Card 
                key={card.id}
                className={`${card.bgColor} p-3 md:p-4 flex-1 min-w-[120px] md:min-w-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95`}
                onClick={() => handleCategoryClick(card.category)}
              >
                <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16">Image</text></svg>';
                    }}
                  />
                </div>
                <p className="text-xs md:text-sm font-semibold text-center text-gray-800">{card.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PromoFeatures = () => {
  const features = [
    {
      icon: Truck,
      title: 'Livrezon Rapid',
      subtitle: 'Pati $1.99',
      color: 'bg-green-500',
    },
    {
      icon: Tag,
      title: 'Pri Drop',
      subtitle: 'Jiska $50',
      color: 'bg-orange-500',
    },
    {
      icon: Zap,
      title: 'Lightning Deals',
      subtitle: 'Tan limite',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`${feature.color} p-3 rounded-lg text-white`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export const SectionHeader = ({ title, subtitle, showViewAll = true }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {showViewAll && (
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          View Tout
          <ChevronRight className="ml-1" size={18} />
        </Button>
      )}
    </div>
  );
};

