import React, { useState } from 'react';
import { X, Tag, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import usePointsStore from '../store/usePointsStore';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const CouponRedemptionModal = ({ onClose, onApply }) => {
  const { user } = useAuth();
  const { availablePoints } = usePointsStore();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Antre yon kòd koupon');
      return;
    }

    setLoading(true);
    setError('');
    setCoupon(null);

    try {
      // Check if coupon exists
      const { data, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .maybeSingle();

      if (couponError) throw couponError;

      if (!data) {
        setError('Kòd koupon sa pa egziste');
        return;
      }

      if (!data.active) {
        setError('Koupon sa pa aktif');
        return;
      }

      // Check if user already redeemed
      const { data: redemptions } = await supabase
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', data.id)
        .eq('user_id', user?.id)
        .limit(1);

      if (redemptions && redemptions.length > 0) {
        setError('Ou te deja itilize koupon sa');
        return;
      }

      setCoupon(data);
    } catch (err) {
      setError(err.message || 'Erè nan tcheke koupon');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    if (coupon && onApply) {
      onApply(coupon);
      
      // Record redemption
      supabase
        .from('coupon_redemptions')
        .insert([{
          user_id: user?.id,
          coupon_id: coupon.id
        }]);

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Redeem Koupon</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Kòd Koupon</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Antre kòd la isi"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={checkCoupon} disabled={loading}>
                {loading ? 'Checking...' : 'Tcheke'}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          {/* Coupon Details */}
          {coupon && (
            <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-white/20 text-white">
                  <Tag className="inline mr-1" size={16} />
                  {coupon.code}
                </Badge>
                {coupon.active && (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {coupon.type === 'percentage' ? (
                    <Percent size={20} />
                  ) : (
                    <DollarSign size={20} />
                  )}
                  <span className="text-2xl font-bold">
                    {coupon.type === 'percentage' ? `${coupon.discount}%` : `${coupon.discount} HTG`}
                  </span>
                  rabè
                </div>

                <p className="text-sm opacity-90">
                  Rabè {coupon.type === 'percentage' ? 'pousantaj' : 'fiks'} sou pwodwi ou yo
                </p>

                {coupon.uses > 0 && (
                  <p className="text-xs opacity-75">
                    Deja itilize {coupon.uses} fwa
                  </p>
                )}
              </div>

              <Button
                onClick={applyCoupon}
                className="mt-4 w-full bg-white text-blue-600 hover:bg-gray-100"
              >
                Aplike Koupon
              </Button>
            </Card>
          )}

          {/* Points Redemption Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Available Pwen</p>
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-600" size={24} />
              <span className="text-xl font-bold">{availablePoints}</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Ou ka itilize pwen pou ganyen koupon nan kont ou
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CouponRedemptionModal;

