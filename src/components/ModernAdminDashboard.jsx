import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

export const ModernAdminDashboard = ({ products = [], orders = [], customers = [] }) => {
  const { getPriceString } = useCurrency();

  // Safety checks and calculations
  const totalRevenue = orders.length > 0 
    ? orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) 
    : 0;
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  
  const pendingOrders = orders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return status === 'pending';
  }).length;
  
  const lowStockProducts = products.filter(p => (p.stock || 0) < 20).length;
  const totalSales = products.reduce((sum, p) => sum + (parseInt(p.sales) || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newCustomers = customers.filter(c => {
    const joinedDate = new Date(c.joined);
    return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
  }).length;

  // Calculate trends (current month vs previous month)
  const getCurrentMonthData = (dateField) => {
    return orders.filter(o => {
      const date = new Date(o[dateField] || o.order_date || o.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  };

  const getPreviousMonthData = (dateField) => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return orders.filter(o => {
      const date = new Date(o[dateField] || o.order_date || o.created_at);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });
  };

  // Revenue trend
  const currentMonthRevenue = getCurrentMonthData('order_date').reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const previousMonthRevenue = getPreviousMonthData('order_date').reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const revenueTrend = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : currentMonthRevenue > 0 ? 100 : 0;
  const revenueTrendUp = revenueTrend >= 0;

  // Orders trend
  const currentMonthOrders = getCurrentMonthData('order_date').length;
  const previousMonthOrders = getPreviousMonthData('order_date').length;
  const ordersTrend = previousMonthOrders > 0 
    ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100).toFixed(1)
    : currentMonthOrders > 0 ? 100 : 0;
  const ordersTrendUp = ordersTrend >= 0;

  // Products trend (compare current vs previous month products added)
  const currentMonthProducts = products.filter(p => {
    const date = new Date(p.created_at || p.updated_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  const previousMonthProducts = products.filter(p => {
    const date = new Date(p.created_at || p.updated_at);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  }).length;
  const productsTrend = previousMonthProducts > 0 
    ? ((currentMonthProducts - previousMonthProducts) / previousMonthProducts * 100).toFixed(1)
    : currentMonthProducts > 0 ? 100 : 0;
  const productsTrendUp = productsTrend >= 0;

  // Customers trend
  const previousMonthCustomers = customers.filter(c => {
    const joinedDate = new Date(c.joined);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return joinedDate.getMonth() === prevMonth && joinedDate.getFullYear() === prevYear;
  }).length;
  const customersTrend = previousMonthCustomers > 0 
    ? ((newCustomers - previousMonthCustomers) / previousMonthCustomers * 100).toFixed(1)
    : newCustomers > 0 ? 100 : 0;
  const customersTrendUp = customersTrend >= 0;

  // Calculate average order value trend
  const currentMonthAvgOrder = currentMonthOrders > 0 ? currentMonthRevenue / currentMonthOrders : 0;
  const previousMonthAvgOrder = previousMonthOrders > 0 ? previousMonthRevenue / previousMonthOrders : 0;
  const avgOrderTrend = previousMonthAvgOrder > 0 
    ? ((currentMonthAvgOrder - previousMonthAvgOrder) / previousMonthAvgOrder * 100).toFixed(1)
    : currentMonthAvgOrder > 0 ? 100 : 0;

  const statsCards = [
    {
      title: 'Total Revni',
      value: getPriceString(totalRevenue),
      subtitle: `Moyèn: ${getPriceString(averageOrderValue)}`,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: `${revenueTrendUp ? '+' : ''}${revenueTrend}%`,
      trendUp: revenueTrendUp,
    },
    {
      title: 'Kòmand',
      value: totalOrders.toString(),
      subtitle: `${pendingOrders} an atant`,
      icon: Package,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: `${ordersTrendUp ? '+' : ''}${ordersTrend}%`,
      trendUp: ordersTrendUp,
    },
    {
      title: 'Pwodui',
      value: totalProducts.toString(),
      subtitle: `${lowStockProducts} ba stock`,
      icon: Package,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: `${productsTrendUp ? '+' : ''}${productsTrend}%`,
      trendUp: productsTrendUp,
    },
    {
      title: 'Kliyan',
      value: totalCustomers.toString(),
      subtitle: `${newCustomers} nouvo sa mwa`,
      icon: Users,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: `${customersTrendUp ? '+' : ''}${customersTrend}%`,
      trendUp: customersTrendUp,
    },
    {
      title: 'Valè Moyèn Kòmand',
      value: getPriceString(averageOrderValue),
      subtitle: `${currentMonthOrders} kòmand sa mwa`,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      trend: `${avgOrderTrend >= 0 ? '+' : ''}${avgOrderTrend}%`,
      trendUp: avgOrderTrend >= 0,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Mizajou: {new Date().toLocaleDateString('fr-HT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-2">
          <Clock size={16} className="mr-2" />
          An tan reyèl
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h2 className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                    <div className="flex items-center gap-1 pt-1">
                      {stat.trendUp ? (
                        <ArrowUp size={14} className="text-green-600" />
                      ) : (
                        <ArrowDown size={14} className="text-red-600" />
                      )}
                      <span className={`text-xs font-semibold ${
                        stat.trendUp ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend}
                      </span>
                      <span className="text-xs text-muted-foreground">vs mwa pase</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Vant Pa Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Electronics', 'Fashion', 'Shoes'].map((cat) => {
              const catSales = products.filter(p => p.category === cat).reduce((sum, p) => sum + p.sales, 0);
              const maxSales = Math.max(...products.map(p => p.sales));
              const percentage = maxSales > 0 ? (catSales / maxSales) * 100 : 0;
              
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{catSales} vant</span>
                  </div>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dènye Kòmand</CardTitle>
              <Badge variant="outline">{pendingOrders} an atant</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500' :
                      order.status === 'shipped' ? 'bg-blue-500' :
                      order.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm text-foreground">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">{getPriceString(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.items} atik</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Vant</p>
                <p className="text-2xl font-bold text-foreground">{totalSales}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pwodui Popilè</p>
                <p className="text-lg font-bold text-foreground line-clamp-1">
                  {products.length > 0 
                    ? products.reduce((max, p) => p.sales > max.sales ? p : max, products[0]).name 
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alèt Stock</p>
                <p className="text-2xl font-bold text-foreground">{lowStockProducts}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Orders Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tout Kòmand Yo ({totalOrders})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Kliyan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Dat</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Atik</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estat</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const getStatusBadge = () => {
                    switch(order.status?.toLowerCase()) {
                      case 'delivered': 
                        return <Badge className="bg-green-100 text-green-700">Livre</Badge>;
                      case 'shipped': 
                        return <Badge className="bg-blue-100 text-blue-700">Anvolè</Badge>;
                      case 'processing': 
                        return <Badge className="bg-yellow-100 text-yellow-700">Nan Tretman</Badge>;
                      case 'pending': 
                        return <Badge className="bg-gray-100 text-gray-700">An Jantèy</Badge>;
                      default: 
                        return <Badge className="bg-gray-100 text-gray-700">{order.status}</Badge>;
                    }
                  };

                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {order.customer_name || order.customer || 'Anonèm'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(order.order_date).toLocaleDateString('ht-HT', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {order.items} pwodui
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-foreground">
                        {getPriceString(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Pa gen kòmand ankò</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

