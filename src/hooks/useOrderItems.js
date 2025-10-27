import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrderItems(orderId) {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderItems();
    } else {
      setLoading(false);
      setOrderItems([]);
    }
  }, [orderId]);

  async function fetchOrderItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            id,
            name,
            image,
            image_1,
            stock,
            category
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching order items:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    orderItems,
    loading,
    error,
    refetch: fetchOrderItems
  };
}

