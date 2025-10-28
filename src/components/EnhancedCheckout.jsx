import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingBag, CheckCircle, Coins, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import useCartStore from '../store/useCartStore';
import usePointsStore from '../store/usePointsStore';
import { supabase } from '../lib/supabase';
import { useEmailNotifications } from '../hooks/useEmailNotifications';
import { Button } from './ui/button';
import { Card } from './ui/card';
import CouponRedemptionModal from './CouponRedemptionModal';

const EnhancedCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPriceString } = useCurrency();
  const { items, getTotal, clearCart } = useCartStore();
  const { availablePoints, redeemPoints, fetchPoints } = usePointsStore();
  const { sendOrderConfirmation } = useEmailNotifications();
  
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Haiti',
  });
  
  const [coupon, setCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const POINTS_VALUE = 0.10; // 1 point = 0.10 HTG

  const subtotal = getTotal();
  const discount = coupon
    ? coupon.type === 'percentage'
      ? subtotal * (coupon.discount / 100)
      : Math.min(coupon.discount, subtotal)
    : 0;
  const pointsDiscount = usePoints ? Math.min(pointsToUse, subtotal - discount) : 0;
  const tax = (subtotal - discount - pointsDiscount) * 0.15;
  const shipping = subtotal > 5000 ? 0 : 500;
  const finalTotal = subtotal - discount - pointsDiscount + tax + shipping;

  const applyCoupon = (appliedCoupon) => {
    setCoupon(appliedCoupon);
    setShowCouponModal(false);
  };

  const handlePointsUse = () => {
    if (!usePoints) {
      // Auto-calculate max points to use (50% of order value)
      const maxPoints = Math.floor((subtotal - discount) / POINTS_VALUE * 0.5);
      setPointsToUse(Math.min(maxPoints, availablePoints));
    }
    setUsePoints(!usePoints);
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) {
      alert('Panyè ou vid oswa ou pa konekte');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await supabase.from('orders').insert({
        id: orderId,
        user_id: user.id,
        customer_name: shippingInfo.name,
        total: finalTotal.toString(),
        status: 'pending',
        items: items.length,
        currency: 'HTG',
        shipping_address: shippingInfo,
        payment_method: 'stripe',
        order_date: new Date().toISOString().split('T')[0]
      });

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.title || item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: 'HTG'
      }));

      await supabase.from('order_items').insert(orderItems);

      // Redeem points if used
      if (usePoints && pointsToUse > 0) {
        await redeemPoints(user.id, pointsToUse, `Order ${orderId}`);
      }

      // Redeem coupon if applied
      if (coupon) {
        await supabase.from('coupon_redemptions').insert({
          user_id: user.id,
          coupon_id: coupon.id,
          order_id: orderId
        });
      }

      // Award points based on purchase (10 points per 1000 HTG)
      const pointsToAward = Math.floor(finalTotal / 100);
      
      // Award points
      const pointsAward = await supabase
        .from('points_history')
        .insert({
          user_id: user.id,
          points: pointsToAward,
          reason: `Achat ${orderId}`,
          source: 'purchase',
          order_id: orderId
        });

      // Update user_points
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userPoints) {
        await supabase
          .from('user_points')
          .update({
            total_points: userPoints.total_points + pointsToAward,
            available_points: userPoints.available_points + pointsToAward,
            lifetime_points: userPoints.lifetime_points + pointsToAward,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            total_points: pointsToAward,
            available_points: pointsToAward,
            lifetime_points: pointsToAward
          });
      }

      // Send confirmation email
      await sendOrderConfirmation(user.id, orderId);

      // Clear cart
      clearCart();

      // Show success
      setOrderPlaced(true);

      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 3000);

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Erè: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <Card className="p-12 text-center max-w-md">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lòd Ou Resevwa!</h2>
          <p className="text-gray-600 mb-4">
            Mèsi anpil! Lòd ou te kreye avèk siksè.
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
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={20} />
          Retounen nan Panyè
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fè Kòmann</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} />
                Enfòmasyon Ekspedisyon
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Non Konple"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Imèl"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Telefòn"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Adrès"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Vil"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Peyi"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Coupon Section */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Koupon oswa Kòd Rabè</h3>
                  {coupon && (
                    <p className="text-sm text-green-600">
                      Koupon {coupon.code} aplike! (-{getPriceString(discount)})
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowCouponModal(true)}
                  className="flex items-center gap-2"
                >
                  <Gift size={18} />
                  {coupon ? 'Chanje Koupon' : 'Redeem Koupon'}
                </Button>
              </div>

              {/* Points Section */}
              {availablePoints > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="text-yellow-600" size={20} />
                      <span className="font-medium">
                        Itilize Pwen ({availablePoints} disponib)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={handlePointsUse}
                      className="w-4 h-4"
                    />
                  </div>
                  {usePoints && (
                    <input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Math.min(parseInt(e.target.value) || 0, availablePoints))}
                      max={availablePoints}
                      placeholder="Pwen pou itilize"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Valè: 1 pwen = 0.10 HTG (Max 50% of lòd)
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" size={20} />
                Resime
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

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{getPriceString(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabè Koupon</span>
                    <span>-{getPriceString(discount)}</span>
                  </div>
                )}
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Rabè Pwen</span>
                    <span>-{getPriceString(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (15%)</span>
                  <span>{getPriceString(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ekspedisyon</span>
                  <span>{shipping === 0 ? 'Gratis' : getPriceString(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{getPriceString(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 text-lg font-semibold mt-4"
              >
                {loading ? 'Nan trete...' : `Peye ${getPriceString(finalTotal)}`}
              </Button>

              {finalTotal < subtotal && (
                <p className="text-center text-xs text-green-600 mt-2">
                  Ou vin sove {getPriceString(subtotal - finalTotal)}!
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {showCouponModal && (
        <CouponRedemptionModal
          onClose={() => setShowCouponModal(false)}
          onApply={applyCoupon}
        />
      )}
    </div>
  );
};

export default EnhancedCheckout;

