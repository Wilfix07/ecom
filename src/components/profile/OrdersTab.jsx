import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, RefreshCw, Calendar, DollarSign, ShoppingBag, Clock, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useUserOrders } from '../../hooks/useUserOrders';
import { useCurrency } from '../../contexts/CurrencyContext';
import OrderDetailModal from './OrderDetailModal';

const OrdersTab = ({ userId, onReorder }) => {
  const { orders, loading } = useUserOrders(userId);
  const { getPriceString } = useCurrency();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'shipped':
        return <Truck size={18} className="text-blue-600" />;
      case 'processing':
        return <Clock size={18} className="text-yellow-600" />;
      case 'cancelled':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <AlertCircle size={18} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    const styles = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    const labels = {
      delivered: 'Livre',
      shipped: 'Anvolè',
      processing: 'Nan Tretman',
      pending: 'An Jantèy',
      cancelled: 'Anile'
    };

    return (
      <Badge className={styles[statusLower] || 'bg-gray-100 text-gray-700'}>
        {labels[statusLower] || status}
      </Badge>
    );
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chajman kòmand yo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <Package size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Pa gen kòmand ankò</h3>
            <p className="text-muted-foreground mb-6">Kòmanse achte pou wè kòmand ou yo isi a!</p>
            <Button onClick={() => navigate('/products')} className="bg-orange-500 hover:bg-orange-600">
              Kontinye Achte
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag size={24} className="text-primary" />
              Kòmand Ou Yo ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="border border-border rounded-lg p-4 hover:shadow-md transition-all bg-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground">Kòmand #{order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(order.order_date || order.date).toLocaleDateString('ht-HT', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package size={14} />
                        <span>{order.items} atik</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        <span className="font-bold text-primary">{getPriceString(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Gade</span>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => {
                        // Reorder functionality will be added
                        alert('Reorder functionality coming soon!');
                      }}
                    >
                      <RefreshCw size={16} />
                      <span className="hidden sm:inline">Rekòmande</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onReorder={onReorder}
        />
      )}
    </>
  );
};

export default OrdersTab;

