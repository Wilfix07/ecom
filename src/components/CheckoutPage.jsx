import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, CheckCircle, Coins, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import useCartStore from '../store/useCartStore';
import usePointsStore from '../store/usePointsStore';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card } from './ui/card';
import CouponRedemptionModal from './CouponRedemptionModal';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51OnP8kDlRy5x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3'); // Replace with your Stripe publishable key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPriceString, currency, exchangeRate } = useCurrency();
  const { items, getTotal, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Haiti',
    postalCode: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = getTotal();
  const tax = total * 0.15; // 15% tax (adjust as needed)
  const shipping = total > 5000 ? 0 : 500; // Free shipping over 5000 HTG
  const finalTotal = total + tax + shipping;

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      alert('Tanpri konekte pou kontinye ak kòmann ou.');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Panyè ou vid. Ajoute kèk pwodwi nan panyè ou.');
      navigate('/products');
      return;
    }

    setLoading(true);

    try {
      // Create order in Supabase
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const orderTotal = currency === 'USD' ? finalTotal / exchangeRate : finalTotal;

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          customer_name: shippingInfo.name,
          total: orderTotal.toString(),
          status: 'pending',
          items: items.length,
          currency: currency,
          shipping_address: shippingInfo,
          payment_method: 'stripe',
          order_date: new Date().toISOString().split('T')[0]
        });

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.title || item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: currency
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payment with Stripe (if needed)
      if (stripe && elements) {
        const { error: paymentError } = await stripe.confirmCardPayment(
          'pm_test_1234567890', // This would come from your backend
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: shippingInfo.name,
                email: shippingInfo.email,
              },
            },
          }
        );

        if (paymentError) {
          // Payment failed, but order is created with status 'pending'
          alert('Peman echwe, men lòd ou te kreye. Kontakte ou ta ka rezoud sa.');
        } else {
          // Payment successful, update order status
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderId);
        }
      }

      // Clear cart
      clearCart();
      
      // Show success
      setOrderPlaced(true);
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 3000);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Erè nan kreye lòd ou. Tanpri eseye ankò.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <Card className="p-12 text-center max-w-md">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lòd ou Resevwa!</h2>
          <p className="text-gray-600 mb-4">
            Mèsi anpil pou lòd ou. Ou ap resevwa yon imel konfimasyon byento.
          </p>
          <p className="text-sm text-gray-500">
            Redireksyon nan paj lòd ou...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={20} />
          Retounen nan Panyè
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fè Kòmann</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} />
                Enfòmasyon Ekspedisyon
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Non Konple
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imèl
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefòn
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adrès
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vil
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peyi
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </form>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} />
                Enfòmasyon Peman
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!stripe || loading}
              className="w-full py-3 text-lg font-semibold"
            >
              {loading ? 'Nan trete...' : `Peye ${getPriceString(finalTotal)}`}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" size={20} />
                Resime Lòd
              </h2>
              
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.title || item.name}</p>
                      <p className="text-gray-500">Kantite: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{getPriceString(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{getPriceString(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (15%)</span>
                  <span>{getPriceString(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ekspedisyon</span>
                  <span>{shipping === 0 ? 'Gratis' : getPriceString(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{getPriceString(finalTotal)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;

