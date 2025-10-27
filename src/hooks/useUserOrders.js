import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useUserOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  async function fetchUserOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId.replace('user_', ''))
        .order('order_date', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(order => ({
        ...order,
        total: parseFloat(order.total || 0),
      }));
      
      setOrders(formattedData);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  }

  return { orders, loading, error, refetch: fetchUserOrders };
}

