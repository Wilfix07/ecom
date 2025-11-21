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
            image_url,
            image_1,
            image_2,
            image_3,
            stock,
            stock_quantity,
            category,
            categories (
              name
            )
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      
      // Map products to include category name and handle column mapping
      const formattedData = (data || []).map(item => ({
        ...item,
        products: item.products ? {
          ...item.products,
          image: item.products.image_url || item.products.image || '📦',
          image_1: item.products.image_1 || null,
          image_2: item.products.image_2 || null,
          image_3: item.products.image_3 || null,
          stock: item.products.stock_quantity || item.products.stock || 0,
          category: item.products.categories?.name || item.products.category || 'Uncategorized',
          categories: undefined, // Remove nested object
        } : null
      }));
      
      setOrderItems(formattedData);
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

