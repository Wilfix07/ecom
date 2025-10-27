import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CouponModal = ({ coupon, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    active: true,
    uses: '0',
  });

  const isEditMode = !!coupon;

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discount: String(coupon.discount || ''),
        type: coupon.type || 'percentage',
        active: coupon.active !== undefined ? coupon.active : true,
        uses: String(coupon.uses || '0'),
      });
    } else {
      // Reset form when no coupon (new mode)
      setFormData({
        code: '',
        discount: '',
        type: 'percentage',
        active: true,
        uses: '0',
      });
    }
  }, [coupon]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const couponData = {
      code: formData.code,
      discount: parseFloat(formData.discount),
      type: formData.type,
      active: formData.active,
      uses: parseInt(formData.uses),
    };

    await onSave(couponData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Modifye Koupon' : 'Ajoute Koupon'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kòd Koupon *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="WELCOME10"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kalite Rabè *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Pousantaj (%)</option>
              <option value="fixed">Fiks (HTG)</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.type === 'percentage' ? 'Pousantaj (%) *' : 'Montan (HTG) *'}
            </label>
            <input
              type="number"
              required
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.type === 'percentage' ? '10' : '500'}
              min="0"
              max={formData.type === 'percentage' ? '100' : undefined}
            />
          </div>

          {/* Uses */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Itilizasyon
            </label>
            <input
              type="number"
              value={formData.uses}
              onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Koupon Aktif</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anile
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditMode ? 'Sove Chanjman' : 'Ajoute Koupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;

