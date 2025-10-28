import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const AdminLoyaltyManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [couponStats, setCouponStats] = useState({
    total: 0,
    active: 0,
    redeemed: 0,
    totalDiscount: 0
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    active: true,
    maxUses: '',
    expiresAt: ''
  });

  const [showAddCoupon, setShowAddCoupon] = useState(false);

  useEffect(() => {
    fetchCoupons();
    fetchCouponStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchCouponStats = async () => {
    try {
      const { data: allCoupons } = await supabase
        .from('coupons')
        .select('discount, type');

      const { data: redemptions } = await supabase
        .from('coupon_redemptions')
        .select('*');

      if (allCoupons && redemptions) {
        const totalDiscount = allCoupons.reduce((sum, coupon) => {
          // Estimate discount value (simplified)
          return sum + parseFloat(coupon.discount);
        }, 0);

        setCouponStats({
          total: allCoupons.length,
          active: allCoupons.filter(c => c.active).length,
          redeemed: redemptions.length,
          totalDiscount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: newCoupon.code.toUpperCase(),
          discount: parseFloat(newCoupon.discount),
          type: newCoupon.type,
          active: newCoupon.active,
          max_uses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
          expires_at: newCoupon.expiresAt || null
        }]);

      if (error) throw error;

      alert('Koupon kreye avèk siksè!');
      setShowAddCoupon(false);
      setNewCoupon({
        code: '',
        discount: '',
        type: 'percentage',
        active: true,
        maxUses: '',
        expiresAt: ''
      });
      fetchCoupons();
      fetchCouponStats();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const toggleCouponActive = async (couponId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', couponId);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Koupon</p>
              <p className="text-2xl font-bold">{couponStats.total}</p>
            </div>
            <Tag className="text-blue-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif</p>
              <p className="text-2xl font-bold">{couponStats.active}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Redekoupe</p>
              <p className="text-2xl font-bold">{couponStats.redeemed}</p>
            </div>
            <Users className="text-purple-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rabè Total</p>
              <p className="text-2xl font-bold">{couponStats.totalDiscount.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-orange-600" size={32} />
          </div>
        </Card>
      </div>

      {/* Coupons List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Koupon yo</h2>
          <Button onClick={() => setShowAddCoupon(true)}>
            <Plus className="mr-2" size={20} />
            Nouvo Koupon
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Kòd</th>
                <th className="text-left p-2">Rabè</th>
                <th className="text-left p-2">Kalite</th>
                <th className="text-left p-2">Itilizasyon</th>
                <th className="text-left p-2">Estati</th>
                <th className="text-left p-2">Aksyon</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b">
                  <td className="p-2">
                    <Badge className="bg-blue-100 text-blue-700">{coupon.code}</Badge>
                  </td>
                  <td className="p-2">{coupon.discount}{coupon.type === 'percentage' ? '%' : ' HTG'}</td>
                  <td className="p-2">{coupon.type}</td>
                  <td className="p-2">{coupon.uses || 0}</td>
                  <td className="p-2">
                    <Badge className={coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {coupon.active ? 'Aktif' : 'Dezakive'}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCouponActive(coupon.id, coupon.active)}
                    >
                      {coupon.active ? 'Dezakive' : 'Aktive'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Coupon Modal */}
      {showAddCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Nouvo Koupon</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kòd</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                  placeholder="EKS: FLASH50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kalite</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="percentage">Pousantaj (%)</option>
                  <option value="fixed">Fiks (HTG)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rabè</label>
                <input
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})}
                  placeholder={newCoupon.type === 'percentage' ? '10' : '1000'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createCoupon} className="flex-1">
                  Kreye
                </Button>
                <Button variant="outline" onClick={() => setShowAddCoupon(false)}>
                  Anile
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminLoyaltyManagement;

