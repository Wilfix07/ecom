import React, { useState, useEffect } from 'react';
import { Users, Package, CheckCircle, XCircle, Eye, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { getPriceString } = useCurrency();
  
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('products'); // products, users, orders
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    pendingApproval: 0,
    totalRevenue: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;
    
    try {
      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setProducts(productsData || []);
      setUsers(usersData || []);
      setOrders(ordersData || []);
      
      // Calculate stats
      const pendingApproval = productsData?.filter(p => !p.approved).length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

      setStats({
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        pendingApproval,
        totalRevenue,
        totalOrders: ordersData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ approved: true, rejected_reason: null })
        .eq('id', productId);

      if (error) throw error;

      alert('Pwodwi apwouve!');
      fetchAdminData();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const handleRejectProduct = async (productId, reason) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ approved: false, rejected_reason: reason })
        .eq('id', productId);

      if (error) throw error;

      alert('Pwodwi rejte!');
      fetchAdminData();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Ou sèten ou vle efase pwodwi sa?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Pwodwi efase!');
      fetchAdminData();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      alert('Wòl itilizatè mete ajou!');
      fetchAdminData();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Jere tout aktivite sou sit la</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Itilizatè</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pwodwi</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="text-green-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Atann Apwobasyon</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revni Total</p>
                <p className="text-2xl font-bold">{getPriceString(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="text-purple-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Lòd</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={viewMode === 'products' ? 'default' : 'outline'}
            onClick={() => setViewMode('products')}
          >
            Pwodwi ({stats.totalProducts})
          </Button>
          <Button 
            variant={viewMode === 'users' ? 'default' : 'outline'}
            onClick={() => setViewMode('users')}
          >
            Itilizatè ({stats.totalUsers})
          </Button>
          <Button 
            variant={viewMode === 'orders' ? 'default' : 'outline'}
            onClick={() => setViewMode('orders')}
          >
            Lòd ({stats.totalOrders})
          </Button>
        </div>

        {/* Products View */}
        {viewMode === 'products' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tout Pwodwi</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Non</th>
                    <th className="text-left p-2">Kategori</th>
                    <th className="text-left p-2">Pri</th>
                    <th className="text-left p-2">Stok</th>
                    <th className="text-left p-2">Estati</th>
                    <th className="text-left p-2">Aksyon</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b">
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2">{getPriceString(product.price)}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2">
                        <Badge className={product.approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                          {product.approved ? 'Apwouve' : 'Atann'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {!product.approved && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => handleApproveProduct(product.id)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => {
                                  const reason = prompt('Raison pour rejè (optional):');
                                  if (reason !== null) handleRejectProduct(product.id, reason);
                                }}
                              >
                                <XCircle size={16} />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Users View */}
        {viewMode === 'users' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tout Itilizatè</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Non</th>
                    <th className="text-left p-2">Imèl</th>
                    <th className="text-left p-2">Wòl</th>
                    <th className="text-left p-2">Dat Enskripsyon</th>
                    <th className="text-left p-2">Aksyon</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(usr => (
                    <tr key={usr.id} className="border-b">
                      <td className="p-2">{usr.full_name || 'Pa itilize'}</td>
                      <td className="p-2">{usr.email}</td>
                      <td className="p-2">
                        <Badge className={
                          usr.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          usr.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {usr.role || 'customer'}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(usr.created_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        <select
                          value={usr.role || 'customer'}
                          onChange={(e) => handleUpdateUserRole(usr.user_id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Orders View */}
        {viewMode === 'orders' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tout Lòd</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Lòd #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{getPriceString(order.total)}</p>
                      <Badge className={
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

