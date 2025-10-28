import React, { useState } from 'react';
import { Plus, Package, TrendingUp, DollarSign, Edit, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const VendorDashboard = () => {
  const { user } = useAuth();
  const { getPriceString } = useCurrency();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    title: '',
    price: '',
    description: '',
    category: 'Electronics',
    image: '',
    stock: '',
    discount: '0'
  });

  // Fetch vendor's products and orders
  React.useEffect(() => {
    fetchVendorData();
  }, [user]);

  const fetchVendorData = async () => {
    if (!user) return;
    
    try {
      // Fetch vendor's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch vendor's orders (orders containing their products)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Filter orders that contain vendor's products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, product_id')
        .in('product_id', productsData?.map(p => p.id) || []);

      const vendorOrderIds = [...new Set(orderItems?.map(item => item.order_id) || [])];
      const vendorOrders = ordersData?.filter(order => vendorOrderIds.includes(order.id)) || [];

      setProducts(productsData || []);
      setOrders(vendorOrders);
      
      // Calculate stats
      const totalRevenue = vendorOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const totalProducts = productsData?.length || 0;
      const pendingApproval = productsData?.filter(p => !p.approved).length || 0;

      setStats({
        totalRevenue,
        totalProducts,
        pendingApproval,
        totalOrders: vendorOrders.length
      });
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    pendingApproval: 0,
    totalOrders: 0
  });

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          title: newProduct.title || newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          category: newProduct.category,
          image: newProduct.image || '📦',
          stock: parseInt(newProduct.stock),
          discount: parseInt(newProduct.discount),
          vendor_id: user.id,
          approved: false // Needs admin approval
        }]);

      if (error) throw error;

      alert('Pwodwi ajoute! L ap tann apwobasyon nan anvan li parèt nan magazen an.');
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        title: '',
        price: '',
        description: '',
        category: 'Electronics',
        image: '',
        stock: '',
        discount: '0'
      });
      fetchVendorData();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: parseInt(newStock) })
        .eq('id', productId);

      if (error) throw error;

      fetchVendorData();
    } catch (error) {
      alert(`Erè nan mete ajou stok: ${error.message}`);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      title: product.title || product.name,
      price: product.price,
      description: product.description || '',
      category: product.category,
      image: product.image,
      stock: product.stock,
      discount: product.discount || '0'
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          title: newProduct.title || newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          category: newProduct.category,
          image: newProduct.image,
          stock: parseInt(newProduct.stock),
          discount: parseInt(newProduct.discount),
          approved: false // Needs re-approval after edit
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      alert('Pwodwi mete ajou! L ap tann apwobasyon ankò.');
      setShowAddProduct(false);
      setEditingProduct(null);
      fetchVendorData();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Vannè</h1>
            <p className="text-gray-600">Jere pwodwi ou ak lòd ou</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="mr-2" size={20} />
            Ajoute Pwodwi
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Revni Total</p>
                <p className="text-2xl font-bold">{getPriceString(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Pwodwi</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Lòd</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <TrendingUp className="text-purple-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Atann Apwobasyon</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Modifye Pwodwi' : 'Ajoute Nouvo Pwodwi'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}>
                  <X size={24} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Non Pwodwi</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pri (HTG)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Shoes</option>
                    <option>Home</option>
                    <option>Beauty</option>
                    <option>Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stok</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="flex-1"
                  >
                    <Save className="mr-2" size={20} />
                    {editingProduct ? 'Mete Ajou' : 'Ajoute'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                  }}>
                    Anile
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Products List */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Pwodwi Mwen</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Non</th>
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
                    <td className="p-2">{getPriceString(product.price)}</td>
                    <td className="p-2">{product.stock}</td>
                    <td className="p-2">
                      <Badge className={product.approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                        {product.approved ? 'Apwouve' : 'Atann Apwobasyon'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Orders List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Lòd yo</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Lòd #{order.id.slice(0, 10)}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{getPriceString(order.total)}</p>
                    <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;

