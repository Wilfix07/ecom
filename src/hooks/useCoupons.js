import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Convert string decimals to numbers
      const formattedData = data.map(coupon => ({
        ...coupon,
        discount: parseFloat(coupon.discount),
      }));
      
      setCoupons(formattedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { coupons, loading, error, refetch: fetchCoupons };
}

