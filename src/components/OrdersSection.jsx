import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';

export const OrdersSection = ({ orders, getPriceString }) => {
  if (!orders || orders.length === 0) {
    return null;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'pending': return <Package size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Livre';
      case 'shipped': return 'Anvolè';
      case 'processing': return 'Nan Tretman';
      case 'pending': return 'An Jantèy';
      default: return status;
    }
  };

  // Récente commande
  const recentOrders = orders.slice(0, 3);

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          📋 Dènye Kòmand Yo
        </h2>
        <p className="text-gray-600">
          Suivi kòmand yo nan tan reyèl
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentOrders.map(order => (
          <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Kòmand #</div>
                <div className="font-bold text-gray-800 text-lg">{order.id}</div>
              </div>
              <Badge className={getStatusColor(order.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </span>
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kliyan:</span>
                <span className="font-medium text-gray-800">{order.customer_name || 'Anonèm'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dat:</span>
                <span className="font-medium text-gray-800">
                  {new Date(order.order_date).toLocaleDateString('ht-HT', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Atik:</span>
                <span className="font-medium text-gray-800">{order.items} pwodui</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {getPriceString(order.total)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {orders.length > 3 && (
        <div className="text-center mt-8">
          <p className="text-gray-600">
            +{orders.length - 3} lòt kòmand anvi...
          </p>
        </div>
      )}
    </section>
  );
};

export default OrdersSection;

