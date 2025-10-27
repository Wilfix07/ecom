import React from 'react';
import { X, Package, MapPin, CreditCard, RefreshCw, Truck, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useOrderItems } from '../../hooks/useOrderItems';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';

const OrderDetailModal = ({ order, onClose, onReorder }) => {
  const { orderItems, loading } = useOrderItems(order.id);
  const { getPriceString } = useCurrency();

  const handleReorder = async () => {
    try {
      // Check stock availability for all items
      const unavailableItems = [];
      const availableItems = [];

      for (const item of orderItems) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product && product.stock >= item.quantity) {
          availableItems.push(item);
        } else {
          unavailableItems.push({
            ...item,
            reason: product?.stock === 0 ? 'out_of_stock' : 'insufficient_stock'
          });
        }
      }

      // Show result
      if (unavailableItems.length > 0) {
        const message = `Atansyon! ${unavailableItems.length} atik pa disponib:\n` +
          unavailableItems.map(i => `- ${i.product_name} (${i.reason === 'out_of_stock' ? 'Pwodui fini' : 'Stock ensifisan'})`).join('\n') +
          `\n\n${availableItems.length} lòt atik ap ajoute nan panye ou.`;
        alert(message);
      }

      if (availableItems.length > 0) {
        // Add available items to cart (this would integrate with your cart system)
        if (onReorder) {
          onReorder(availableItems, unavailableItems);
        } else {
          alert(`${availableItems.length} atik ajoute nan panye ou!`);
        }
        onClose();
      } else {
        alert('Okenn atik pa disponib pou rekòmande.');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Erè nan rekòmande kòmand la');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Detay Kòmand #{order.id}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar size={14} className="inline mr-1" />
              {new Date(order.order_date || order.date).toLocaleDateString('ht-HT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`text-base px-4 py-2 ${getStatusColor(order.status)}`}>
              {order.status}
            </Badge>
            <Button onClick={handleReorder} className="gap-2">
              <RefreshCw size={18} />
              Rekòmande
            </Button>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Package size={20} />
              Atik yo ({orderItems.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.products?.image_1 || item.products?.image ? (
                        <img 
                          src={item.products.image_1 || item.products.image} 
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                          <Package size={32} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Kantite: {item.quantity} × {getPriceString(item.unit_price)}
                      </p>
                      {item.products?.stock !== undefined && (
                        <p className={`text-xs mt-1 ${
                          item.products.stock >= item.quantity 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {item.products.stock >= item.quantity 
                            ? '✓ Disponib' 
                            : `⚠ Sèlman ${item.products.stock} nan stock`
                          }
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-foreground">{getPriceString(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping Address */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-blue-600" />
                Adrès Livrezon
              </h4>
              {order.shipping_address ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{order.shipping_address.street || 'N/A'}</p>
                  <p>{order.shipping_address.city || ''} {order.shipping_address.postal_code || ''}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Pa gen adrès</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <CreditCard size={18} className="text-green-600" />
                Mwayen Peman
              </h4>
              <p className="text-sm text-muted-foreground">
                {order.payment_method || 'Cash on Delivery'}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sou-total</span>
              <span className="font-medium">{getPriceString(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livrezon</span>
              <span className="font-medium">Gratis</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">{getPriceString(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

