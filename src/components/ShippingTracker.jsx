import React, { useState } from 'react';
import { Truck, Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const ShippingTracker = ({ orderId }) => {
  const { user } = useAuth();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Simulated tracking statuses
  const trackingStatuses = {
    'pending': { label: 'Annatant', color: 'orange', step: 0 },
    'processing': { label: 'Nan Traitement', color: 'blue', step: 1 },
    'shipped': { label: 'Ekspedye', color: 'purple', step: 2 },
    'in_transit': { label: 'Nan Tranzit', color: 'blue', step: 3 },
    'delivered': { label: 'Livré', color: 'green', step: 4 }
  };

  const fetchOrderTracking = async () => {
    if (!orderId || !trackingNumber) return;

    setLoading(true);
    try {
      // In a real implementation, you would call FedEx/UPS APIs here
      // This is a simulated implementation
      
      const { data, error } = await supabase
        .from('orders')
        .select('tracking_info, status')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;

      // Simulate API response
      const simulatedTracking = {
        carrier: 'FedEx',
        tracking_number: trackingNumber,
        status: data?.status || 'shipped',
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), location: 'Warehouse' },
          { status: 'processing', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), location: 'Processing Center' },
          { status: 'shipped', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), location: 'Distribution Center' },
          { status: 'in_transit', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), location: 'In Transit' }
        ]
      };

      setTrackingInfo(simulatedTracking);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPackage = () => {
    fetchOrderTracking();
  };

  // Fetch existing tracking if available
  React.useEffect(() => {
    if (orderId) {
      supabase
        .from('orders')
        .select('tracking_number, tracking_info, status')
        .eq('id', orderId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.tracking_number) {
            setTrackingNumber(data.tracking_number);
            setTrackingInfo(data.tracking_info);
          }
        });
    }
  }, [orderId]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Package size={20} />
        Suivn Lòd Ou
      </h3>

      {/* Tracking Number Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nimewo Suivi</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Antre nimewo a pou swiv"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleTrackPackage}
            disabled={loading || !trackingNumber}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Chargement...' : 'Swiv'}
          </button>
        </div>
      </div>

      {/* Tracking Timeline */}
      {trackingInfo && (
        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-4">
            <Badge className={`bg-${trackingInfo.status === 'delivered' ? 'green' : 'blue'}-100 text-${trackingInfo.status === 'delivered' ? 'green' : 'blue'}-700`}>
              {trackingInfo.status === 'delivered' ? '✓ Livré' : 'Nan Tranzit'}
            </Badge>
            <div className="text-sm text-gray-600">
              <Truck className="inline mr-1" size={16} />
              {trackingInfo.carrier}: {trackingInfo.tracking_number}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <div className="text-sm font-medium mb-2">Istorik Livrezon</div>
            {trackingInfo.timeline?.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'delivered' ? 'bg-green-500' : 
                    event.status === 'shipped' ? 'bg-blue-500' : 
                    event.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`} />
                  {index < trackingInfo.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estimated Delivery */}
          {trackingInfo.estimated_delivery && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Dat Livrezon Espere</div>
                <div className="text-sm text-blue-700">
                  {new Date(trackingInfo.estimated_delivery).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!trackingInfo && (
        <div className="text-center py-8 text-gray-500">
          Antre nimewo a pou swiv lòd ou
        </div>
      )}
    </Card>
  );
};

export default ShippingTracker;

