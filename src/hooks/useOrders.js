import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) throw error;
      
      // Convert string decimals to numbers and format dates
      const formattedData = data.map(order => ({
        ...order,
        total: parseFloat(order.total),
        customer: order.customer_name,
        date: order.order_date,
      }));
      
      setOrders(formattedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { orders, loading, error, refetch: fetchOrders };
}

