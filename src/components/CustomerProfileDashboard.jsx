import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Package, MapPin, CreditCard, Activity, ShoppingBag, 
  Heart, TrendingUp, Clock, CheckCircle, Truck, Edit, Download,
  Plus, Search, Star, DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CustomerProfileDashboard = () => {
  const { user, profile } = useAuth();
  const { getPriceString } = useCurrency();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    deliveredOrders: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics
      const { data: statsData } = await supabase
        .from('customer_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsData) {
        setStats({
          totalOrders: statsData.total_orders || 0,
          totalSpent: statsData.total_spent || 0,
          deliveredOrders: statsData.delivered_orders || 0,
          avgOrderValue: statsData.avg_order_value || 0,
        });
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setOrders(ordersData || []);

      // Load addresses
      const { data: addressesData } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(addressesData || []);

      // Load wishlist
      const { data: wishlistData } = await supabase
        .from('customer_wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      setWishlist(wishlistData || []);

      // Load activity log
      const { data: activityData } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setActivityLog(activityData || []);

      // Load payment history
      const { data: paymentData } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPaymentHistory(paymentData || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType, description, metadata = {}) => {
    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: activityType,
        description,
        metadata,
        ip_address: null,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Activity log error:', error);
    }
  };

  const handleContinueShopping = () => {
    console.log('Button clicked - navigating to products');
    try {
      logActivity('product_search', 'Navigated to product catalog from dashboard');
      navigate('/products');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/products';
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p className="text-xs text-green-600 mt-1">
              ↑ {change}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 ${color.replace('text', 'bg')}/10 rounded-full`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </Card>
  );

  const OrderCard = ({ order }) => {
    const statusColors = {
      processing: 'bg-yellow-100 text-yellow-800',
      ready_to_ship: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    };

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Order #{order.id}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{getPriceString(order.total)}</span>
          <div className="flex gap-2">
            {order.tracking_number && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/tracking/${order.tracking_number}`)}>
                <Truck size={16} className="mr-1" />
                Track
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access your dashboard</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'Customer'}!</h1>
                <p className="text-gray-600">Manage your orders and profile</p>
              </div>
            </div>
            <Button onClick={handleContinueShopping} size="lg" className="bg-orange-500 hover:bg-orange-600">
              <ShoppingBag size={20} className="mr-2" />
              Kontinye Achte
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Orders"
            value={stats.totalOrders}
            color="text-blue-600"
          />
          <StatCard
            icon={DollarSign}
            label="Total Spent"
            value={getPriceString(stats.totalSpent)}
            color="text-green-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Delivered"
            value={stats.deliveredOrders}
            color="text-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Order"
            value={getPriceString(stats.avgOrderValue)}
            color="text-orange-600"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b bg-white rounded-lg shadow-sm">
          <nav className="flex gap-2 p-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Dashboard', icon: User },
              { id: 'shop', label: 'Kòmand', icon: ShoppingBag },
              { id: 'orders', label: 'Favorit', icon: Heart },
              { id: 'wishlist', label: 'Notifikasyon', icon: Package },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Tab clicked:', tab.id);
                  if (tab.id === 'shop') {
                    handleContinueShopping();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Package className="mr-2" size={20} />
                  Recent Orders
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {orders.length > 5 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                )}
              </Card>

              {/* Wishlist Preview */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Heart className="mr-2" size={20} />
                  Wishlist ({wishlist.length})
                </h3>
                <div className="space-y-3">
                  {wishlist.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <img
                        src={item.products.image}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.products.title}</p>
                        <p className="text-blue-600 font-bold">{getPriceString(item.products.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {wishlist.length > 3 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('wishlist')}>
                    View All
                  </Button>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Order History</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      src={item.products.image}
                      alt={item.products.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{item.products.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-bold">{getPriceString(item.products.price)}</span>
                        <Button size="sm">Add to Cart</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Shipping Addresses</h2>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Address
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map(address => (
                  <Card key={address.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">{address.full_name}</h3>
                        {address.is_default && (
                          <Badge className="mt-1">Default</Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Edit size={16} />
                      </Button>
                    </div>
                    <p className="text-gray-600">
                      {address.street_1}<br />
                      {address.street_2 && <>{address.street_2}<br /></>}
                      {address.city}, {address.state} {address.zip_code}<br />
                      {address.country}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{address.phone}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Payment History</h2>
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {paymentHistory.map(payment => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {getPriceString(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button size="sm" variant="ghost">
                            <Download size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  {activityLog.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{activity.description || activity.activity_type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileDashboard;

