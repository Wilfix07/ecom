import { supabase } from '../lib/supabase';

const EASYPOST_API_KEY = import.meta.env.VITE_EASYPOST_API_KEY;
const EASYPOST_BASE_URL = 'https://api.easypost.com/v2';

export const shippingService = {
  /**
   * Create shipping label via EasyPost
   */
  async createShipment(orderData, shippingAddress) {
    try {
      const response = await fetch(`${EASYPOST_BASE_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EASYPOST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipment: {
            to_address: {
              name: shippingAddress.name,
              street1: shippingAddress.street1,
              street2: shippingAddress.street2 || '',
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip: shippingAddress.zip,
              country: shippingAddress.country || 'US',
              phone: shippingAddress.phone,
            },
            from_address: {
              name: 'TechMart Haiti',
              street1: '123 Store Street',
              city: 'Port-au-Prince',
              state: 'HT',
              zip: '6110',
              country: 'HT',
              phone: '+509-1234-5678',
            },
            parcel: {
              length: orderData.parcel?.length || 10,
              width: orderData.parcel?.width || 8,
              height: orderData.parcel?.height || 4,
              weight: orderData.parcel?.weight || 16,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`EasyPost API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Shipping creation error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Buy shipping label
   */
  async buyShippingLabel(shipmentId, rateId) {
    try {
      const response = await fetch(`${EASYPOST_BASE_URL}/shipments/${shipmentId}/buy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EASYPOST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: { id: rateId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Label purchase error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Label purchase error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get shipping rates
   */
  async getShippingRates(shippingAddress, weight) {
    try {
      // Check cache first
      const cached = await this.getCachedRates(shippingAddress.zip, weight);
      if (cached) return { success: true, data: cached };

      const shipment = await this.createShipment({ parcel: { weight } }, shippingAddress);
      
      if (!shipment.success) {
        return shipment;
      }

      // Cache rates
      await this.cacheRates(shipment.data.rates, shippingAddress.zip, weight);

      return { success: true, data: shipment.data.rates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber) {
    try {
      const response = await fetch(`${EASYPOST_BASE_URL}/trackers/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EASYPOST_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Tracking error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Tracking error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save tracking event to database
   */
  async saveTrackingEvent(orderId, trackingNumber, event) {
    try {
      await supabase.from('shipping_tracking_events').insert({
        order_id: orderId,
        tracking_number: trackingNumber,
        status: event.status,
        description: event.description || event.message,
        location: event.tracking_location?.city || '',
        occurred_at: event.datetime,
        carrier: event.carrier,
        metadata: event,
      });

      // Update order status based on tracking status
      const statusMap = {
        'pre_transit': 'ready_to_ship',
        'in_transit': 'shipped',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered',
      };

      const orderStatus = statusMap[event.status] || 'shipped';
      
      await supabase
        .from('orders')
        .update({ status: orderStatus })
        .eq('id', orderId);

      return { success: true };
    } catch (error) {
      console.error('Save tracking error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cache shipping rates
   */
  async cacheRates(rates, toZip, weight) {
    try {
      const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const cacheData = rates.map(rate => ({
        service_level: rate.service,
        carrier: rate.carrier,
        rate: parseFloat(rate.rate),
        delivery_days: rate.delivery_days,
        to_zip: toZip,
        weight_oz: weight,
        valid_until: validUntil.toISOString(),
      }));

      await supabase.from('shipping_rates').insert(cacheData);
    } catch (error) {
      console.error('Cache rates error:', error);
    }
  },

  /**
   * Get cached shipping rates
   */
  async getCachedRates(toZip, weight) {
    try {
      const { data } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('to_zip', toZip)
        .eq('weight_oz', weight)
        .gt('valid_until', new Date().toISOString())
        .order('rate', { ascending: true });

      return data && data.length > 0 ? data : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Confirm delivery
   */
  async confirmDelivery(orderId, deliveryData) {
    try {
      await supabase.from('delivery_confirmations').insert({
        order_id: orderId,
        delivered_at: new Date().toISOString(),
        signature: deliveryData.signature,
        photo_url: deliveryData.photo_url,
        recipient_name: deliveryData.recipient_name,
        notes: deliveryData.notes,
      });

      await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return { success: true };
    } catch (error) {
      console.error('Delivery confirmation error:', error);
      return { success: false, error: error.message };
    }
  },
};

