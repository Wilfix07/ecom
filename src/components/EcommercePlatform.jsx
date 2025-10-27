import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Home, Package, Users, BarChart3, Settings, Tag, TrendingUp, Heart, Star, MapPin, CreditCard, Truck, Filter, Grid, List, ChevronDown, Plus, Edit, Trash2, Eye, DollarSign, Clock, CheckCircle, XCircle, Bell, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useCoupons } from '../hooks/useCoupons';
import { useSettings } from '../hooks/useSettings';
import SettingsManagement from './SettingsManagement';
import ProductModal from './ProductModal';
import CouponModal from './CouponModal';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import ProductDetailModal from './ProductDetailModal';
import { ModernClientStore } from './ModernClientStore';
import { ModernAdminDashboard } from './ModernAdminDashboard';

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
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  // Fetch data from Supabase
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { coupons, loading: couponsLoading } = useCoupons();
  const { settings, getSettingValue, refetch: refetchSettings } = useSettings();
  
  // Currency support
  const { 
    currency, 
    setCurrency, 
    exchangeRate, 
    setExchangeRate, 
    getPriceString 
  } = useCurrency();
  
  // Load settings into currency context
  useEffect(() => {
    if (settings && settings.length > 0) {
      const rate = getSettingValue('exchange_rate_htg_to_usd', '135');
      console.log('Loading exchange rate from settings:', rate);
      setExchangeRate(parseFloat(rate));
      
      const name = getSettingValue('store_name', 'TechMart Haiti');
      console.log('Store name loaded from settings:', name);
    }
  }, [settings, getSettingValue]);
  
  // Get store name from settings
  const storeName = getSettingValue('store_name', 'TechMart Haiti');
  const flashSaleText = getSettingValue('flash_sale_text', 'FLASH SALE');
  
  console.log('Current store name:', storeName);
  console.log('Current flash sale text:', flashSaleText);

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
    // Always calculate in HTG, conversion happens in display
    let total = cartItems.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);

    // Apply coupon discount if active
    if (appliedCoupon && appliedCoupon.active) {
      if (appliedCoupon.type === 'percentage') {
        total = total * (1 - appliedCoupon.discount / 100);
      } else if (appliedCoupon.type === 'fixed') {
        total = Math.max(0, total - appliedCoupon.discount);
      }
    }

    return total;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !appliedCoupon.active) return 0;
    
    const subtotal = cartItems.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);

    if (appliedCoupon.type === 'percentage') {
      return subtotal * (appliedCoupon.discount / 100);
    } else if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.discount, subtotal);
    }
    return 0;
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Antre yon kòd koupon');
      return;
    }

    const coupon = coupons.find(c => 
      c.code.toLowerCase() === couponCode.toLowerCase().trim() && c.active
    );

    if (!coupon) {
      setCouponError('Kòd koupon sa pa valab');
      return;
    }

    setAppliedCoupon(coupon);
    setCouponError('');
    alert(`Koupon "${coupon.code}" aplike avèk siksè!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Admin Dashboard Components
  const AdminDashboard = () => {
    // Calculate dynamic statistics from actual data
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;
    
    // Calculate pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'Pending').length;
    
    // Calculate low stock products
    const lowStockProducts = products.filter(p => p.stock < 20).length;
    
    // Calculate total sales (units sold)
    const totalSales = products.reduce((sum, p) => sum + (parseInt(p.sales) || 0), 0);
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate new customers this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newCustomers = customers.filter(c => {
      const joinedDate = new Date(c.joined);
      return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
    }).length;

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
                <h3 className="text-3xl font-bold">{getPriceString(totalRevenue)}</h3>
                <p className="text-blue-100 text-sm mt-2">Valè Moyèn: {getPriceString(averageOrderValue)}</p>
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
                <p className="text-green-100 text-sm mt-2">{pendingOrders} ak an atant</p>
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
                <p className="text-purple-100 text-sm mt-2">{lowStockProducts} pwodui ba stock</p>
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
                <p className="text-orange-100 text-sm mt-2">{newCustomers} nouvo sa mwa</p>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Dènye Kòmand</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Tou
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
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
                    <p className="font-semibold text-gray-800">{getPriceString(order.total)}</p>
                    <p className="text-sm text-gray-600">{order.items} atik</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vant</p>
                <p className="text-2xl font-bold text-gray-800">{totalSales}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pwodui ki Vann Pi Plis</p>
                <p className="text-2xl font-bold text-gray-800">
                  {products.length > 0 ? products.reduce((max, p) => p.sales > max.sales ? p : max, products[0]).name : 'N/A'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Star size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kòmand An Atant</p>
                <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Bell size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductsManagement = () => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const { products, refetch: refetchProducts } = useProducts();

    const handleSaveProduct = async (productData) => {
      try {
        let result;
        if (editingProduct) {
          // Update existing product
          result = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id)
            .select();
        } else {
          // Add new product
          result = await supabase
            .from('products')
            .insert([productData])
            .select();
        }
        
        if (result.error) {
          console.error('Supabase error:', result.error);
          alert(`Erè: ${result.error.message}`);
          return;
        }
        
        // Show success message
        setSaveMessage({ type: 'success', message: editingProduct ? 'Pwodui modifye avèk siksè!' : 'Nouvo pwodui ajoute avèk siksè!' });
        setTimeout(() => setSaveMessage(null), 3000);
        
        // Close modal first
        setShowAddProduct(false);
        setEditingProduct(null);
        
        // Refetch products immediately
        await refetchProducts();
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Erè nan ekonomi pwodui a');
      }
    };

    const handleEditProduct = (product) => {
      setEditingProduct(product);
      setShowAddProduct(true);
    };

    const handleDeleteProduct = async (productId) => {
      try {
        await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        refetchProducts();
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Erè nan efase pwodui a');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Jesyon Pwodui</h1>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Ajoute Pwodui
          </button>
        </div>

        {saveMessage && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <CheckCircle size={20} className={saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'} />
            <p className="font-medium">{saveMessage.message}</p>
          </div>
        )}

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
                      {product.image?.startsWith('http') ? (
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <span className="text-3xl">{product.image}</span>
                      )}
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
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
              setShowAddProduct(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Konfime Efase</h3>
              <p className="text-gray-600 mb-6">
                Èske ou sèten ou vle efase pwodui sa a? Aksyon sa a ka pa ranvèse.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anile
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Efase
                </button>
              </div>
            </div>
          </div>
        )}
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
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showAddCoupon, setShowAddCoupon] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const { coupons, refetch: refetchCoupons } = useCoupons();

    const handleSaveCoupon = async (couponData) => {
      try {
        let result;
        if (editingCoupon) {
          // Update existing coupon
          result = await supabase
            .from('coupons')
            .update({
              code: couponData.code,
              discount: couponData.discount,
              type: couponData.type,
              active: couponData.active,
              uses: couponData.uses
            })
            .eq('id', editingCoupon.id)
            .select();
        } else {
          // Add new coupon
          result = await supabase
            .from('coupons')
            .insert([couponData])
            .select();
        }
        
        if (result.error) {
          console.error('Error:', result.error);
          alert(`Erè: ${result.error.message}`);
          return;
        }
        
        setSaveMessage({ type: 'success', message: 'Koupon sove avèk siksè!' });
        setTimeout(() => setSaveMessage(null), 3000);
        
        // Close modal and reset after successful save
        setShowAddCoupon(false);
        setEditingCoupon(null);
        
        // Refetch coupons after modal closes
        setTimeout(() => refetchCoupons(), 500);
      } catch (error) {
        console.error('Error saving coupon:', error);
        alert('Erè nan ekonomi koupon a');
      }
    };

    const handleEditCoupon = (coupon) => {
      setEditingCoupon(coupon);
      setShowAddCoupon(true);
    };

    const handleDeleteCoupon = async (couponId) => {
      try {
        await supabase
          .from('coupons')
          .delete()
          .eq('id', couponId);
        
        refetchCoupons();
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Erè nan efase koupon a');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Jesyon Koupon</h1>
          <button 
            onClick={() => {
              setEditingCoupon(null);
              setShowAddCoupon(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nouvo Koupon
          </button>
        </div>

        {saveMessage && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <CheckCircle size={20} className={saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'} />
            <p className="font-medium">{saveMessage.message}</p>
          </div>
        )}

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
                <button 
                  onClick={() => handleEditCoupon(coupon)}
                  className="flex-1 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Modifye
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(coupon.id)}
                  className="flex-1 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Efase
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Coupon Modal */}
        {showAddCoupon && (
          <CouponModal
            coupon={editingCoupon}
            onClose={() => {
              setShowAddCoupon(false);
              setEditingCoupon(null);
            }}
            onSave={handleSaveCoupon}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Konfime Efase</h3>
              <p className="text-gray-600 mb-6">
                Èske ou sèten ou vle efase koupon sa a? Aksyon sa a ka pa ranvèse.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anile
                </button>
                <button
                  onClick={() => handleDeleteCoupon(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Efase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Client Store Components (Now using ModernClientStore)
  const ClientStore = () => {
    return (
      <ModernClientStore
        storeName={storeName}
        flashSaleText={flashSaleText}
        cartItems={cartItems}
        wishlist={wishlist}
        products={products}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        setCurrency={setCurrency}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        setShowCart={setShowCart}
        setSelectedProduct={setSelectedProduct}
        setShowProductDetail={setShowProductDetail}
      />
    );
  };

  // Original ClientStore (backup, can be removed)
  const OldClientStore = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {storeName}
                </h1>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                  {flashSaleText}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Currency Selector */}
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="HTG">HTG</option>
                  <option value="USD">USD</option>
                </select>
                
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
                <div className="relative cursor-pointer" onClick={() => {
                  setSelectedProduct(product);
                  setShowProductDetail(true);
                }}>
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                    {(() => {
                      const isImageUrl = product.image && typeof product.image === 'string' && (product.image.startsWith('http://') || product.image.startsWith('https://'));
                      
                      if (isImageUrl) {
                        return (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', product.name, product.image);
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ccc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">Image</text></svg>';
                            }}
                          />
                        );
                      } else {
                        return <span className="text-8xl">{product.image || '📦'}</span>;
                      }
                    })()}
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
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
                          {getPriceString(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {getPriceString(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-800">
                        {getPriceString(product.price)}
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
                          <p className="text-sm text-gray-600">{getPriceString(item.price * (1 - item.discount / 100))}</p>
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
                      <span>{getPriceString(calculateTotal())}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Kontinye ak Peman
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {showProductDetail && selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => {
              setShowProductDetail(false);
              setSelectedProduct(null);
            }}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            isInWishlist={wishlist.some(item => item.id === selectedProduct.id)}
          />
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Informasyon Peman</h2>
                <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 mb-3">Rekap Kòmand</h3>
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{getPriceString(item.price * item.quantity * (1 - item.discount / 100))}</span>
                    </div>
                  ))}
                  
                  {/* Coupon Section */}
                  {!appliedCoupon ? (
                    <div className="border-t pt-3 mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kòd Koupon (Siw genyen)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          placeholder="Antre kòd koupon"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Aplike
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 mt-1">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="border-t pt-3 mt-3 flex justify-between items-center bg-green-50 p-2 rounded">
                      <div>
                        <span className="text-green-700 font-semibold">Koupon aplike: {appliedCoupon.code}</span>
                        <p className="text-xs text-green-600">
                          {-getPriceString(calculateDiscount())} rabè
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{getPriceString(calculateTotal())}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Non Konple *
                    </label>
                    <input
                      type="text"
                      placeholder="Ekzanp: Jean Dupont"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefòn *
                    </label>
                    <input
                      type="tel"
                      placeholder="+509 1234-5678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adrès *
                    </label>
                    <textarea
                      placeholder="Chapo, nem, Vètan, Kowonal..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Metòd Peman *
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Chwazi metòd peman...</option>
                    <option value="cash">Lajan Kach</option>
                    <option value="card">Kat Kredi</option>
                    <option value="bank">Tvansfè Bankè</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retounen
                  </button>
                  <button
                    onClick={() => {
                      alert('Kòmand lan te soumèt avèk siksè! Nou pral kontakte ou byento.');
                      setCartItems([]);
                      setShowCheckout(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Konfime Kòmand
                  </button>
                </div>
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
            <p className="text-gray-400 text-sm">{storeName}</p>
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
        <div className="flex-1 overflow-y-auto bg-muted/30">
          {activeTab === 'dashboard' && (
            <ModernAdminDashboard 
              products={products}
              orders={orders}
              customers={customers}
            />
          )}
          {activeTab === 'products' && <div className="p-8"><ProductsManagement /></div>}
          {activeTab === 'orders' && <div className="p-8"><OrdersManagement /></div>}
          {activeTab === 'customers' && <div className="p-8"><CustomersManagement /></div>}
          {activeTab === 'coupons' && <div className="p-8"><CouponsManagement /></div>}
          {activeTab === 'settings' && <div className="p-8"><SettingsManagement /></div>}
        </div>
      </div>
    );
  };

  return isAdmin ? <AdminLayout /> : <ClientStore />;
};

export default EcommercePlatform;

