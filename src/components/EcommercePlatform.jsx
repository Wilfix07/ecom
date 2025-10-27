import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Home, Package, Users, BarChart3, Settings, Tag, TrendingUp, Heart, Star, MapPin, CreditCard, Truck, Filter, Grid, List, ChevronDown, Plus, Edit, Trash2, Eye, DollarSign, Clock, CheckCircle, XCircle, Bell, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useCoupons } from '../hooks/useCoupons';

const EcommercePlatform = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  
  // Fetch data from Supabase
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { coupons, loading: couponsLoading } = useCoupons();

  const categories = ['all', 'Electronics', 'Fashion', 'Shoes', 'Home', 'Beauty', 'Sports'];

  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const toggleWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Admin Dashboard Components
  const AdminDashboard = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Dènye mizajou: Jodi a {new Date().toLocaleTimeString('fr-HT', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Revni</p>
                <h3 className="text-3xl font-bold">{totalRevenue.toLocaleString()} HTG</h3>
                <p className="text-blue-100 text-sm mt-2">+12.5% sa mwa</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm mb-1">Kòmand</p>
                <h3 className="text-3xl font-bold">{totalOrders}</h3>
                <p className="text-green-100 text-sm mt-2">+8.2% sa mwa</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm mb-1">Pwodui</p>
                <h3 className="text-3xl font-bold">{totalProducts}</h3>
                <p className="text-purple-100 text-sm mt-2">{products.filter(p => p.stock < 20).length} ba stock</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100 text-sm mb-1">Kliyan</p>
                <h3 className="text-3xl font-bold">{totalCustomers}</h3>
                <p className="text-orange-100 text-sm mt-2">+15 nouvo</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Vant Pa Kategori</h3>
            <div className="space-y-3">
              {['Electronics', 'Fashion', 'Shoes'].map((cat, idx) => {
                const catSales = products.filter(p => p.category === cat).reduce((sum, p) => sum + p.sales, 0);
                const maxSales = Math.max(...products.map(p => p.sales));
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{cat}</span>
                      <span className="font-semibold text-gray-800">{catSales} vant</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(catSales / maxSales) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Dènye Kòmand</h3>
            <div className="space-y-3">
              {orders.slice(0, 4).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500' :
                      order.status === 'shipped' ? 'bg-blue-500' :
                      order.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">#{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{order.total.toLocaleString()} HTG</p>
                    <p className="text-sm text-gray-600">{order.items} atik</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductsManagement = () => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddProduct, setShowAddProduct] = useState(false);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Jesyon Pwodui</h1>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Ajoute Pwodui
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pwodui</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pri</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{product.image}</span>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        {product.discount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">-{product.discount}%</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{product.price.toLocaleString()} HTG</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock < 20 ? 'bg-red-100 text-red-600' :
                      product.stock < 50 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.sales}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-800">{product.rating}</span>
                      <span className="text-gray-500 text-sm">({product.reviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const OrdersManagement = () => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'delivered': return 'bg-green-100 text-green-700';
        case 'shipped': return 'bg-blue-100 text-blue-700';
        case 'processing': return 'bg-yellow-100 text-yellow-700';
        case 'pending': return 'bg-gray-100 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'delivered': return 'Livre';
        case 'shipped': return 'Ekspedye';
        case 'processing': return 'An Preparasyon';
        case 'pending': return 'An Atant';
        default: return status;
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Jesyon Kòmand</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', count: orders.length, color: 'bg-blue-100 text-blue-600' },
            { label: 'An Atant', count: orders.filter(o => o.status === 'pending').length, color: 'bg-gray-100 text-gray-600' },
            { label: 'An Preparasyon', count: orders.filter(o => o.status === 'processing').length, color: 'bg-yellow-100 text-yellow-600' },
            { label: 'Livre', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-100 text-green-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kliyan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Atik</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estati</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-800">#{order.id}</td>
                  <td className="px-6 py-4 text-gray-800">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 text-gray-600">{order.items}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{order.total.toLocaleString()} HTG</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CustomersManagement = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Jesyon Kliyan</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kliyan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kòmand</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Depanse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dat Enskripsyon</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.orders}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{customer.spent.toLocaleString()} HTG</td>
                  <td className="px-6 py-4 text-gray-600">{customer.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Bell size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CouponsManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Jesyon Koupon</h1>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Nouvo Koupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-mono font-bold text-lg">
                  {coupon.code}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  coupon.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {coupon.active ? 'Aktif' : 'Enaktif'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-2xl font-bold text-gray-800">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `${coupon.discount} HTG`}
                </p>
                <p className="text-sm text-gray-600">{coupon.type === 'percentage' ? 'Rabè Pousantaj' : 'Rabè Fiks'}</p>
                <p className="text-sm text-gray-600">{coupon.uses} itilizasyon</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Modifye
                </button>
                <button className="flex-1 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Efase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Client Store Components
  const ClientStore = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechMart Haiti
                </h1>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                  FLASH SALE
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingCart size={24} className="text-gray-700" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Heart size={24} className="text-gray-700" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {wishlist.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setIsAdmin(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Chèche pwodui..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter size={20} />
                Filtè
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tout' : cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Flash Deals Banner */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">⚡ Flash Sale Jodi a!</h2>
                <p className="text-red-100">Jiska 50% rabè sou pwodui seleksyone</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg backdrop-blur">
                <p className="text-sm mb-1">Fini nan:</p>
                <p className="text-2xl font-bold font-mono">05:47:23</p>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-semibold mb-4 text-gray-800">Filtè</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Ranje Pri</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                      type="number" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{filteredProducts.length} pwodui jwenn</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chajman pwodui yo...</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-8xl">
                    {product.image}
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart 
                      size={20} 
                      className={wishlist.find(item => item.id === product.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-700">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-gray-800">
                          {(product.price * (1 - product.discount / 100)).toLocaleString()} HTG
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toLocaleString()} HTG
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-800">
                        {product.price.toLocaleString()} HTG
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Ajoute nan Panye
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-800">Panye Achte ({cartItems.length})</h2>
                  <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Panye ou vid</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="text-4xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">{(item.price * (1 - item.discount / 100)).toLocaleString()} HTG</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button 
                              onClick={() => {
                                const updated = cartItems.map(ci => 
                                  ci.id === item.id && ci.quantity > 1 
                                    ? {...ci, quantity: ci.quantity - 1} 
                                    : ci
                                );
                                setCartItems(updated);
                              }}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => {
                                const updated = cartItems.map(ci => 
                                  ci.id === item.id ? {...ci, quantity: ci.quantity + 1} : ci
                                );
                                setCartItems(updated);
                              }}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => setCartItems(cartItems.filter(ci => ci.id !== item.id))}
                              className="ml-auto text-red-600 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="border-t p-6 space-y-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                      <span>Total:</span>
                      <span>{calculateTotal().toLocaleString()} HTG</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                      Kontinye ak Peman
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Admin Dashboard Layout
  const AdminLayout = () => {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div className="p-6">
            <h1 className="text-xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">TechMart Haiti</p>
          </div>
          <nav className="px-3">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'products', icon: Package, label: 'Pwodui' },
              { id: 'orders', icon: ShoppingCart, label: 'Kòmand' },
              { id: 'customers', icon: Users, label: 'Kliyan' },
              { id: 'coupons', icon: Tag, label: 'Koupon' },
              { id: 'settings', icon: Settings, label: 'Paramèt' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <button 
              onClick={() => setIsAdmin(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Retounen nan Store
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'orders' && <OrdersManagement />}
            {activeTab === 'customers' && <CustomersManagement />}
            {activeTab === 'coupons' && <CouponsManagement />}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Paramèt</h2>
                <p className="text-gray-600">Seksyon sa ap disponib byento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return isAdmin ? <AdminLayout /> : <ClientStore />;
};

export default EcommercePlatform;

