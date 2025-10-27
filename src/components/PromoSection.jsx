import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronRight, Truck, Tag, Zap } from 'lucide-react';

export const PromoBanner = () => {
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
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-bold">
              ACHTE KOUNYE A
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </div>
          <div className="flex-1 flex gap-4">
            <Card className="bg-white p-4 flex-1">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" 
                alt="Product" 
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <p className="text-sm font-semibold text-center">Soulye espò</p>
            </Card>
            <Card className="bg-white p-4 flex-1">
              <img 
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400" 
                alt="Product" 
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <p className="text-sm font-semibold text-center">Accessories</p>
            </Card>
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

