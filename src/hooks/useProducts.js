import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Convert string decimals to numbers
      const formattedData = data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating),
        image: product.image || '📦', // Ensure image is always a string
      }));
      
      setProducts(formattedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

