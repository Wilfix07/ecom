import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Star,
  Truck,
  CheckCircle,
  Clock,
  Heart
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const CustomerDashboard = ({ userId, orders, favoriteProducts = [] }) => {
  const { getPriceString } = useCurrency();

  // Calculate statistics
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const pendingOrders = orders?.filter(o => o.status?.toLowerCase() === 'pending').length || 0;
  const favoriteCount = favoriteProducts?.length || 0;

  const stats = [
    {
      title: 'Kòmand Yo',
      value: totalOrders,
      subtitle: `${pendingOrders} an atant`,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%'
    },
    {
      title: 'Total Depanse',
      value: getPriceString(totalSpent),
      subtitle: `Moyèn: ${getPriceString(avgOrderValue)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      trend: '+8%'
    },
    {
      title: 'Atik Achte',
      value: orders?.reduce((sum, order) => sum + (order.items || 0), 0) || 0,
      subtitle: 'Nan tout kòmand yo',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      trend: '+5%'
    },
    {
      title: 'Favorit',
      value: favoriteCount,
      subtitle: 'Pwodui prefere ou',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      trend: '+3'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return <CheckCircle size={16} className="text-green-600" />;
      case 'shipped': return <Truck size={16} className="text-blue-600" />;
      case 'processing': return <Clock size={16} className="text-yellow-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h2 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={20} />
              Dènye Kòmand
            </h3>
          </div>
          <div className="p-6">
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="mt-1">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString('ht-HT', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">{getPriceString(order.total)}</p>
                      <Badge 
                        className={
                          order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status?.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {order.status?.toLowerCase() === 'delivered' ? 'Livre' :
                         order.status?.toLowerCase() === 'shipped' ? 'Anvolè' :
                         order.status?.toLowerCase() === 'processing' ? 'Nan Tretman' :
                         'An Jantèy'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Pa gen kòmand ankò</p>
              </div>
            )}
          </div>
        </Card>

        {/* Favorite Products */}
        <Card className="shadow-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Heart size={20} />
              Pwodui Favorit
            </h3>
          </div>
          <div className="p-6">
            {favoriteProducts && favoriteProducts.length > 0 ? (
              <div className="space-y-3">
                {favoriteProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center text-2xl">
                      {product.image || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-muted-foreground">{product.rating}</span>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          {getPriceString(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Heart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Pa gen pwodui favorit</p>
                <p className="text-sm mt-2">Ajoute pwodui w renmen yo!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Rezime Aktivite
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Kòmand</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{getPriceString(totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total Depanse</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {totalOrders > 0 ? Math.round(avgOrderValue) : 0}
              </p>
              <p className="text-sm text-muted-foreground">Moyèn Depans</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerDashboard;

